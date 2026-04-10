import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import hasDependencies from '../utils/has-dependencies.js';

describe('utils/has-dependencies', () => {
  const tempDirs = [];
  const originalStdoutWrite = process.stdout.write;
  let stdoutMessages;

  beforeEach(() => {
    stdoutMessages = [];
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
    const result = hasDependencies(file);

    assert.equal(result, true);
    assert.equal(stdoutMessages.length, 0);
  });

  it('should return false and log when dependencies are missing', () => {
    const file = writePackageJson({ name: 'example' });
    const result = hasDependencies(file);

    assert.equal(result, false);
    assert.equal(stdoutMessages.length, 1);
    assert.match(stdoutMessages[0], /No dependencies found/);
  });

  it('should return false and log when dependencies are empty', () => {
    const file = writePackageJson({ dependencies: {} });
    const result = hasDependencies(file);

    assert.equal(result, false);
    assert.equal(stdoutMessages.length, 1);
    assert.match(stdoutMessages[0], /No dependencies found/);
  });
});
