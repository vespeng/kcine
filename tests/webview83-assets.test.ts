import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);

test('client asset transpilation removes modern syntax for Android 9 WebView (Chrome 69)', async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'kcine-webview69-'));
  const assetPath = path.join(tempDir, 'chunk.js');

  await writeFile(
    assetPath,
    [
      'let count = null;',
      'let fallback = 0;',
      'let enabled = true;',
      'const nested = globalThis.__input?.value ?? "fallback";',
      'count ??= 1;',
      'fallback ||= 2;',
      'enabled &&= false;',
      'globalThis.__kcineWebView69Result = { count, fallback, enabled, nested };',
    ].join('\n')
  );

  await execFileAsync(process.execPath, [
    path.resolve('scripts/transpile-client-assets.mjs'),
    tempDir,
  ]);

  const output = await readFile(assetPath, 'utf8');

  assert.equal(output.includes('??='), false);
  assert.equal(output.includes('||='), false);
  assert.equal(output.includes('&&='), false);
  // chrome83 still emits bare `??` in app code; chrome69 must rewrite it.
  // (Polyfill feature-detect regexes like `/()??/` may still contain the characters.)
  assert.equal(output.includes('nested'), true);
  assert.equal(/\?\?\s*"fallback"|\?\?\s*'fallback'/.test(output), false);
  assert.equal(output.includes('?.'), false);
});
