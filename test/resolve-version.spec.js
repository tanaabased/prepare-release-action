import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import resolveVersion from '../utils/resolve-version.js';

const runGit = (cwd, args) =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
  }).trim();

describe('utils/resolve-version', () => {
  const originalCwd = process.cwd();
  const tempDirs = [];

  afterEach(() => {
    process.chdir(originalCwd);

    for (const dir of tempDirs.splice(0, tempDirs.length)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  const createRepo = ({ packageJson, tags = [], untaggedHead = false }) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'resolve-version-'));
    tempDirs.push(dir);

    runGit(dir, ['init']);
    runGit(dir, ['config', 'user.name', 'Test User']);
    runGit(dir, ['config', 'user.email', 'test@example.com']);

    fs.writeFileSync(
      path.join(dir, 'package.json'),
      `${JSON.stringify(packageJson, null, 2)}\n`,
      'utf8',
    );
    runGit(dir, ['add', 'package.json']);
    runGit(dir, ['commit', '-m', 'initial']);

    for (const tag of tags) {
      runGit(dir, ['tag', tag]);
    }

    if (untaggedHead) {
      fs.writeFileSync(path.join(dir, 'README.md'), 'fixture\n', 'utf8');
      runGit(dir, ['add', 'README.md']);
      runGit(dir, ['commit', '-m', 'untagged']);
    }

    return dir;
  };

  it('should preserve git describe output when matching tags exist', () => {
    const repoDir = createRepo({
      packageJson: { name: 'fixture', version: '9.9.9' },
      tags: ['v1.2.3'],
      untaggedHead: true,
    });
    const expected = runGit(repoDir, [
      'describe',
      '--tags',
      '--always',
      '--abbrev=1',
      '--match=v[0-9].*',
    ]);

    process.chdir(repoDir);

    const result = resolveVersion({
      packageJsonPath: path.join(repoDir, 'package.json'),
      version: 'dev',
      versionMatch: 'v[0-9].*',
    });

    assert.equal(result, expected);
  });

  it('should fall back to package.json.version when no matching tag exists', () => {
    const repoDir = createRepo({
      packageJson: { name: 'fixture', version: '2.3.4' },
      tags: ['not-a-release-tag'],
    });

    process.chdir(repoDir);

    const result = resolveVersion({
      packageJsonPath: path.join(repoDir, 'package.json'),
      version: 'dev',
      versionMatch: 'v[0-9].*',
    });

    assert.equal(result, 'v2.3.4');
  });

  it('should use a semver-valid fallback when no tags or package version exist', () => {
    const repoDir = createRepo({
      packageJson: { name: 'fixture' },
    });
    const shortSha = runGit(repoDir, ['rev-parse', '--short', 'HEAD']);

    process.chdir(repoDir);

    const result = resolveVersion({
      packageJsonPath: path.join(repoDir, 'package.json'),
      version: 'dev',
      versionMatch: 'v[0-9].*',
    });

    assert.equal(result, `v0.0.0-unreleased.${shortSha}`);
  });
});
