import assert from 'node:assert/strict';
import test from 'node:test';
import { replaceUserscriptVersion } from './build.mjs';

test('injects exactly one package version into userscript metadata', () => {
  const sourceCode = '// @version __USERSCRIPT_VERSION__\n';
  assert.equal(
    replaceUserscriptVersion(sourceCode, '3.16.1'),
    '// @version 3.16.1\n',
  );
});

test('rejects missing or repeated version placeholders', () => {
  assert.throws(
    () => replaceUserscriptVersion('// @version 1.0.0', '3.16.1'),
    /exactly one/,
  );
  assert.throws(
    () => replaceUserscriptVersion(
      '__USERSCRIPT_VERSION__\n__USERSCRIPT_VERSION__',
      '3.16.1',
    ),
    /exactly one/,
  );
});
