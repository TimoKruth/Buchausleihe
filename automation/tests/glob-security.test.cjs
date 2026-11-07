const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { glob } = require('glob');
const { Minimatch } = require('minimatch');

test('an aborted glob stops reading directories', async (t) => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'buchausleihe-glob-test-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  for (let i = 0; i < 8; i++) {
    fs.mkdirSync(path.join(cwd, `directory-${i}`, 'nested'), { recursive: true });
    fs.writeFileSync(path.join(cwd, `directory-${i}`, 'nested', 'file.txt'), 'fixture');
  }

  const controller = new AbortController();
  const reason = new Error('cancel fixture traversal');
  let reads = 0;
  const monitoredFs = {
    ...fs,
    readdir(...args) {
      reads++;
      if (reads === 1) controller.abort(reason);
      return fs.readdir(...args);
    },
  };

  await assert.rejects(glob('**/*', {
    cwd,
    signal: controller.signal,
    fs: monitoredFs,
  }), (error) => error === reason);
  // Allow already scheduled filesystem callbacks to finish.
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(reads, 1, 'cancellation must prevent traversal into child directories');
});

test('globstar parent rewrites respect the pattern expansion budget', () => {
  const braceExpandMax = 8;
  const pattern = `a/${'**/../b/c/'.repeat(6)}file`;
  const matcher = new Minimatch(pattern, { optimizationLevel: 2, braceExpandMax });
  assert.ok(matcher.globParts.length <= braceExpandMax,
    'globstar rewrites must not amplify patterns past the configured budget');
  assert.equal(new Minimatch('src/**/*.ts', { optimizationLevel: 2 }).match('src/app/app.component.ts'), true);
  assert.equal(new Minimatch('src/**/*.ts', { optimizationLevel: 2 }).match('src/index.html'), false);
});
