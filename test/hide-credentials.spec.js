import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import hideCredentials from '../utils/hide-credentials.js';

describe('utils/hide-credentials', () => {
  const originalRunnerTemp = process.env.RUNNER_TEMP;
  const originalStdoutWrite = process.stdout.write;

  let stdoutMessages;
  let tempDir;

  beforeEach(() => {
    stdoutMessages = [];
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hide-credentials-'));
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

    if (originalRunnerTemp === undefined) {
      delete process.env.RUNNER_TEMP;
    } else {
      process.env.RUNNER_TEMP = originalRunnerTemp;
    }

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return collector unchanged when RUNNER_TEMP is missing', async () => {
    delete process.env.RUNNER_TEMP;
    const collector = ['existing-file'];

    const result = await hideCredentials(collector);

    assert.equal(result, collector);
    assert.deepEqual(result, ['existing-file']);
    assert.equal(stdoutMessages.length, 0);
  });

  it('should rename matching credential files and collect backups', async () => {
    process.env.RUNNER_TEMP = tempDir;

    const matchingOne = path.join(tempDir, 'git-credentials-one.config');
    const matchingTwo = path.join(tempDir, 'git-credentials-two.config');
    const ignored = path.join(tempDir, 'readme.txt');

    fs.writeFileSync(matchingOne, 'one', 'utf8');
    fs.writeFileSync(matchingTwo, 'two', 'utf8');
    fs.writeFileSync(ignored, 'ignored', 'utf8');

    const collector = [];
    const result = await hideCredentials(collector);

    const sorted = [...result].sort();

    assert.equal(result, collector);
    assert.equal(sorted.length, 2);
    assert.equal(sorted[0], `${matchingOne}.bak`);
    assert.equal(sorted[1], `${matchingTwo}.bak`);
    assert.equal(fs.existsSync(matchingOne), false);
    assert.equal(fs.existsSync(matchingTwo), false);
    assert.equal(fs.existsSync(`${matchingOne}.bak`), true);
    assert.equal(fs.existsSync(`${matchingTwo}.bak`), true);
    assert.equal(fs.existsSync(ignored), true);
    assert.equal(stdoutMessages.length, 2);
    assert.match(stdoutMessages[0], /Temporarily hiding actions\/checkout credential file/);
    assert.match(stdoutMessages[1], /Temporarily hiding actions\/checkout credential file/);
  });

  it('should swallow read errors and return collector', async () => {
    process.env.RUNNER_TEMP = path.join(tempDir, 'does-not-exist');

    const collector = [];
    const result = await hideCredentials(collector);

    assert.equal(result, collector);
    assert.deepEqual(result, []);
    assert.equal(stdoutMessages.length, 1);
    assert.match(stdoutMessages[0], /::debug::Could not backup credential files/);
  });
});
