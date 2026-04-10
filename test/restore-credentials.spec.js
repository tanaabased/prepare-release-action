import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import restoreCredentials from '../utils/restore-credentials.js';

describe('utils/restore-credentials', () => {
  const originalStdoutWrite = process.stdout.write;
  let tempDir;
  let stdoutMessages;

  beforeEach(() => {
    stdoutMessages = [];
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'restore-credentials-'));
    process.stdout.write = (chunk, encoding, callback) => {
      stdoutMessages.push(String(chunk));

      if (typeof encoding === 'function') {
        encoding();
      } else if (typeof callback === 'function') {
        callback();
      }

      return true;
    };
  });

  afterEach(() => {
    process.stdout.write = originalStdoutWrite;
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should restore credential backup files', async () => {
    const restored = path.join(tempDir, 'git-credentials.config');
    const backup = `${restored}.bak`;
    fs.writeFileSync(backup, 'credentials', 'utf8');

    const result = await restoreCredentials([backup]);

    assert.deepEqual(result, []);
    assert.equal(fs.existsSync(backup), false);
    assert.equal(fs.existsSync(restored), true);
    assert.equal(stdoutMessages.length, 1);
    assert.match(stdoutMessages[0], /Restored actions\/checkout credential file/);
  });

  it('should warn when restoring a backup fails', async () => {
    const missingBackup = path.join(tempDir, 'missing.config.bak');

    const result = await restoreCredentials([missingBackup]);

    assert.deepEqual(result, []);
    assert.equal(stdoutMessages.length, 1);
    assert.match(stdoutMessages[0], /::warning::Failed to restore credential file/);
  });
});
