import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import core from '@actions/core';

import hasDependencies from '../utils/has-dependencies.js';

describe('utils/has-dependencies', () => {
  const originalInfo = core.info;
  const tempDirs = [];

  beforeEach(() => {
    core.info = () => {};
  });

  afterEach(() => {
    core.info = originalInfo;
    for (const dir of tempDirs.splice(0, tempDirs.length)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  const writePackageJson = (content) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'has-dependencies-'));
    const file = path.join(dir, 'package.json');
    tempDirs.push(dir);
    fs.writeFileSync(file, JSON.stringify(content), 'utf8');
    return file;
  };

  it('should return true when dependencies exist', () => {
    const file = writePackageJson({ dependencies: { mocha: '^11.0.0' } });
    let infoCount = 0;
    core.info = () => {
      infoCount += 1;
    };

    const result = hasDependencies(file);

    assert.equal(result, true);
    assert.equal(infoCount, 0);
  });

  it('should return false and log when dependencies are missing', () => {
    const file = writePackageJson({ name: 'example' });
    const messages = [];
    core.info = (message) => {
      messages.push(message);
    };

    const result = hasDependencies(file);

    assert.equal(result, false);
    assert.equal(messages.length, 1);
    assert.match(messages[0], /No dependencies found/);
  });

  it('should return false and log when dependencies are empty', () => {
    const file = writePackageJson({ dependencies: {} });
    const messages = [];
    core.info = (message) => {
      messages.push(message);
    };

    const result = hasDependencies(file);

    assert.equal(result, false);
    assert.equal(messages.length, 1);
    assert.match(messages[0], /No dependencies found/);
  });
});
