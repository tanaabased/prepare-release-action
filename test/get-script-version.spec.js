import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';

import getScriptVersion from '../utils/get-script-version.js';

describe('utils/get-script-version', () => {
  it('should trim git describe output', () => {
    const result = getScriptVersion();

    assert.equal(typeof result, 'string');
    assert.equal(result.endsWith('\n'), false);
    assert.notEqual(result.length, 0);
  });

  it('should return unknown for non-string output', async () => {
    const originalExecSync = childProcess.execSync;
    childProcess.execSync = () => Buffer.from('ignored');
    syncBuiltinESMExports();

    try {
      const { default: getScriptVersionWithBuffer } = await import(
        `../utils/get-script-version.js?buffer=${Date.now()}`
      );
      const result = getScriptVersionWithBuffer();

      assert.equal(result, 'unknown');
    } finally {
      childProcess.execSync = originalExecSync;
      syncBuiltinESMExports();
    }
  });
});
