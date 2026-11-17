const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { createRequire } = require('node:module');
const { test } = require('node:test');
const picomatch = require('picomatch');

test('single-branch repeated extglobs cannot block matching', () => {
  // A child timeout bounds the test even if a future update reintroduces ReDoS.
  for (const pattern of ['+(*)b', '+(*a)b', '*(a*)b', '+(?(*a))b']) {
    const child = spawnSync(process.execPath, ['-e', `
      const assert = require('node:assert/strict');
      const match = require('picomatch')(${JSON.stringify(pattern)});
      assert.equal(match('a'.repeat(80) + '!'), false);
    `], { cwd: process.cwd(), timeout: 2000, encoding: 'utf8' });
    assert.ifError(child.error);
    assert.equal(child.status, 0, child.stderr);
  }
});

test('ordinary globs, public APIs, and safe repetitions retain their behavior', () => {
  const cases = [
    ['src/**/*.ts', 'src/app/app.component.ts', true],
    ['src/**/*.ts', 'src/index.html', false],
    ['**/*.ts', '.hidden.ts', false],
    ['*.{ts,html}', 'index.html', true],
    ['!*.js', 'index.ts', true],
    ['@(foo|bar).ts', 'bar.ts', true],
    ['+(ab).ts', 'abab.ts', true],
    ['+(*(a)|*(b))', 'abba', true],
    ['a[bc].ts', 'ab.ts', true],
    ['+(*)', '+(*)', true],
  ];
  for (const [pattern, input, expected] of cases) {
    assert.equal(picomatch(pattern)(input), expected, `${pattern}: ${input}`);
  }
  assert.equal(picomatch.scan('src/**/*.ts').base, 'src');
  assert.equal(picomatch.isMatch('src/index.ts', ['**/*.html', '**/*.ts']), true);
  assert.equal(picomatch.makeRe('*.ts').test('index.ts'), true);
  assert.ok(picomatch.parse('src/**/*.ts').output);
});

test('tooling consumers resolve to the patched fork and preserve file selection', () => {
  for (const name of ['@angular/build', '@angular-devkit/core', 'karma', 'micromatch', 'anymatch', 'tinyglobby']) {
    const consumerRequire = createRequire(require.resolve(`${name}/package.json`));
    const metadata = consumerRequire('picomatch/package.json');
    assert.equal(metadata.name, '@buchausleihe/picomatch-security', name);
    assert.match(metadata.securityPatch, /GHSA-fc5q-39xc-vjpf/);
    const match = consumerRequire('picomatch')('src/**/*.ts');
    assert.equal(match('src/app/app.component.ts'), true, name);
    assert.equal(match('src/index.html'), false, name);
  }
  assert.deepEqual(require('micromatch')(
    ['src/app.ts', 'src/app.html', 'src/.hidden.ts'], ['src/**/*.ts']), ['src/app.ts']);
  assert.equal(require('anymatch')('src/**/*.ts', 'src/app.ts'), true);
  const files = require('tinyglobby').globSync('src/**/*.spec.ts');
  assert.ok(files.includes('src/app/app.component.spec.ts'));
  assert.ok(!files.includes('src/app/app.component.ts'));
});
