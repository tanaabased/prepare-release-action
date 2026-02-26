import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import core from '@actions/core';

import hideCredentials from '../utils/hide-credentials.js';

describe('utils/hide-credentials', () => {
  const originalInfo = core.info;
  const originalDebug = core.debug;
  const originalRunnerTemp = process.env.RUNNER_TEMP;

  let debugMessages;
  let infoMessages;
  let tempDir;

  beforeEach(() => {
    debugMessages = [];
    infoMessages = [];
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hide-credentials-'));

    core.debug = message => {
      debugMessages.push(message);
    };
    core.info = message => {
      infoMessages.push(message);
    };
  });

  afterEach(() => {
    core.info = originalInfo;
    core.debug = originalDebug;

    if (originalRunnerTemp === undefined) {
      delete process.env.RUNNER_TEMP;
    } else {
      process.env.RUNNER_TEMP = originalRunnerTemp;
    }

    fs.rmSync(tempDir, {recursive: true, force: true});
  });

  it('should return collector unchanged when RUNNER_TEMP is missing', async () => {
    delete process.env.RUNNER_TEMP;
    const collector = ['existing-file'];

    const result = await hideCredentials(collector);

    assert.equal(result, collector);
    assert.deepEqual(result, ['existing-file']);
    assert.equal(infoMessages.length, 0);
    assert.equal(debugMessages.length, 0);
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
    assert.equal(infoMessages.length, 2);
    assert.equal(debugMessages.length, 0);
  });

  it('should swallow read errors and return collector', async () => {
    process.env.RUNNER_TEMP = path.join(tempDir, 'does-not-exist');

    const collector = [];
    const result = await hideCredentials(collector);

    assert.equal(result, collector);
    assert.deepEqual(result, []);
    assert.equal(infoMessages.length, 0);
    assert.equal(debugMessages.length, 1);
    assert.match(debugMessages[0], /Could not backup credential files/);
  });
});
