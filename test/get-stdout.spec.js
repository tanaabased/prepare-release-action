import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';

import getStdout from '../utils/get-stdout.js';

describe('utils/get-stdout', () => {
  it('should throw when command is missing', () => {
    assert.throws(() => getStdout(), /Must specify a command!/);
  });

  it('should trim command output', () => {
    const result = getStdout('echo trim-me');

    assert.equal(result, 'trim-me');
  });

  it('should return non-string output as-is', async () => {
    const originalExecSync = childProcess.execSync;
    childProcess.execSync = () => Buffer.from('trim-me');
    syncBuiltinESMExports();

    try {
      const { default: getStdoutWithBuffer } = await import(
        `../utils/get-stdout.js?buffer=${Date.now()}`
      );
      const result = getStdoutWithBuffer('ignored');

      assert.equal(Buffer.isBuffer(result), true);
      assert.equal(result.toString(), 'trim-me');
    } finally {
      childProcess.execSync = originalExecSync;
      syncBuiltinESMExports();
    }
  });
});
