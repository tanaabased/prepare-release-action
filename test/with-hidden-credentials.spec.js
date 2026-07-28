import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import withHiddenCredentials from '../utils/with-hidden-credentials.js';

describe('utils/with-hidden-credentials', () => {
  const originalRunnerTemp = process.env.RUNNER_TEMP;

  let credentialFile;
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'with-hidden-credentials-'));
    credentialFile = path.join(tempDir, 'git-credentials-test.config');
    fs.writeFileSync(credentialFile, 'credentials', 'utf8');
    process.env.RUNNER_TEMP = tempDir;
  });

  afterEach(() => {
    if (originalRunnerTemp === undefined) {
      delete process.env.RUNNER_TEMP;
    } else {
      process.env.RUNNER_TEMP = originalRunnerTemp;
    }

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should restore credential files after a successful operation', async () => {
    const result = await withHiddenCredentials(async () => {
      assert.equal(fs.existsSync(credentialFile), false);
      assert.equal(fs.existsSync(`${credentialFile}.bak`), true);
      return 'complete';
    });

    assert.equal(result, 'complete');
    assert.equal(fs.existsSync(credentialFile), true);
    assert.equal(fs.existsSync(`${credentialFile}.bak`), false);
  });

  it('should restore credential files after a failed operation', async () => {
    await assert.rejects(
      withHiddenCredentials(async () => {
        assert.equal(fs.existsSync(credentialFile), false);
        assert.equal(fs.existsSync(`${credentialFile}.bak`), true);
        throw new Error('push failed');
      }),
      /push failed/,
    );

    assert.equal(fs.existsSync(credentialFile), true);
    assert.equal(fs.existsSync(`${credentialFile}.bak`), false);
  });
});
