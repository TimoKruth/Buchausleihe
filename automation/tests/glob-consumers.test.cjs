const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const glob = require('glob');

function fixture(t) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'buchausleihe-glob-consumer-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  return cwd;
}

async function collect(iterable) {
  const files = [];
  for await (const file of iterable) files.push(file);
  return files.sort();
}

test('glob preserves file discovery across its Node APIs', async (t) => {
  const cwd = fixture(t);
  fs.mkdirSync(path.join(cwd, 'nested'));
  for (const name of ['one.txt', 'skip.js', '.hidden.txt', 'nested/two.txt']) {
    fs.writeFileSync(path.join(cwd, name), 'fixture');
  }
  const options = { cwd, nodir: true };
  const expected = ['nested/two.txt', 'one.txt'];
  assert.deepEqual((await glob.glob('**/*.txt', options)).sort(), expected);
  assert.deepEqual(glob.globSync('**/*.txt', options).sort(), expected);
  assert.deepEqual(await collect(glob.globIterate('**/*.txt', options)), expected);
  assert.deepEqual(await collect(glob.globStream('**/*.txt', options)), expected);
});

test('Node package tooling preserves discovery, cache verification and ignore rules', async (t) => {
  const cwd = fixture(t);
  fs.mkdirSync(path.join(cwd, 'bin'));
  fs.writeFileSync(path.join(cwd, 'bin', 'fixture-cli'), 'fixture');
  fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify({
    name: 'fixture', version: '1.0.0', directories: { bin: 'bin' },
  }));
  const pkg = await require('@npmcli/package-json').normalize(cwd, { steps: ['binDir'] });
  assert.equal(pkg.content.bin['fixture-cli'], 'bin/fixture-cli');

  const cache = path.join(cwd, 'cache');
  const cacache = require('cacache');
  await cacache.put(cache, 'fixture-key', 'fixture-value');
  assert.equal((await cacache.verify(cache)).verifiedContent, 1);
  assert.equal((await cacache.get(cache, 'fixture-key')).data.toString(), 'fixture-value');

  const pack = path.join(cwd, 'pack');
  fs.mkdirSync(pack);
  fs.writeFileSync(path.join(pack, '.npmignore'), 'ignored.txt\n');
  fs.writeFileSync(path.join(pack, 'included.txt'), 'include');
  fs.writeFileSync(path.join(pack, 'ignored.txt'), 'exclude');
  const files = await require('ignore-walk')({ path: pack, ignoreFiles: ['.npmignore'] });
  assert.ok(files.includes('included.txt'));
  assert.ok(!files.includes('ignored.txt'));
});

test('the coverage reporter retains its legacy Minimatch calling convention', () => {
  const { overrideThresholds } = require('karma-coverage-istanbul-reporter/src/util');
  const basePath = path.resolve('fixture');
  const overrides = { 'src/**/*.ts': { statements: 80 }, '**/*': { statements: 20 } };
  assert.deepEqual(overrideThresholds(path.join(basePath, 'src/example.ts'), overrides, basePath),
    { statements: 80 });
  assert.deepEqual(overrideThresholds(path.join(basePath, 'src/example.html'), overrides, basePath),
    { statements: 20 });
  assert.deepEqual(overrideThresholds('example.ts', { 'src/**/*.ts': { statements: 80 } }, basePath),
    {});
});

test('Baqend CLI discovers and uploads the selected fixture files', async (t) => {
  const cwd = fixture(t);
  fs.mkdirSync(path.join(cwd, 'nested'));
  for (const name of ['one.txt', 'skip.js', 'nested/two.txt']) {
    fs.writeFileSync(path.join(cwd, name), name);
  }

  const uploads = [];
  class File {
    constructor(options) { this.options = options; }
    async upload() {
      let data = '';
      for await (const chunk of this.options.data) data += chunk;
      uploads.push({ path: this.options.path, data });
      return this;
    }
  }

  // Stub the account module before loading the CLI: no login or remote writes.
  const cli = path.resolve(__dirname, '../../node_modules/baqend/cli');
  const account = require.resolve(path.join(cli, 'account.js'));
  const previous = require.cache[account];
  require.cache[account] = {
    id: account, filename: account, loaded: true,
    exports: { login: async () => ({ File }) },
  };
  t.after(() => {
    if (previous) require.cache[account] = previous;
    else delete require.cache[account];
  });
  await require(path.join(cli, 'deploy.js')).deploy({
    files: true, code: false, bucketPath: '/fixture/', fileDir: cwd,
    fileGlob: '**/*.txt', createBucket: false, schema: false,
  });
  assert.deepEqual(uploads.sort((a, b) => a.path.localeCompare(b.path)), [
    { path: '/fixture/nested/two.txt', data: 'nested/two.txt' },
    { path: '/fixture/one.txt', data: 'one.txt' },
  ]);
});
