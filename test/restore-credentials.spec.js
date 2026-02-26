import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import core from '@actions/core';

import restoreCredentials from '../utils/restore-credentials.js';

describe('utils/restore-credentials', () => {
  const originalInfo = core.info;
  const originalWarning = core.warning;

  let infoMessages;
  let tempDir;
  let warningMessages;

  beforeEach(() => {
    infoMessages = [];
    warningMessages = [];
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'restore-credentials-'));

    core.info = message => {
      infoMessages.push(message);
    };
    core.warning = message => {
      warningMessages.push(message);
    };
  });

  afterEach(() => {
    core.info = originalInfo;
    core.warning = originalWarning;
    fs.rmSync(tempDir, {recursive: true, force: true});
  });

  it('should restore credential backup files', async () => {
    const restored = path.join(tempDir, 'git-credentials.config');
    const backup = `${restored}.bak`;
    fs.writeFileSync(backup, 'credentials', 'utf8');

    const result = await restoreCredentials([backup]);

    assert.deepEqual(result, []);
    assert.equal(fs.existsSync(backup), false);
    assert.equal(fs.existsSync(restored), true);
    assert.equal(infoMessages.length, 1);
    assert.match(infoMessages[0], /Restored actions\/checkout credential file/);
    assert.equal(warningMessages.length, 0);
  });

  it('should warn when restoring a backup fails', async () => {
    const missingBackup = path.join(tempDir, 'missing.config.bak');

    const result = await restoreCredentials([missingBackup]);

    assert.deepEqual(result, []);
    assert.equal(infoMessages.length, 0);
    assert.equal(warningMessages.length, 1);
    assert.match(warningMessages[0], /Failed to restore credential file/);
  });
});
