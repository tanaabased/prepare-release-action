import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import createVerifiedSyncCommit from '../utils/create-verified-sync-commit.js';

describe('utils/create-verified-sync-commit', () => {
  let tempDir;
  let infoMessages;
  let execCalls;

  const createInputs = () => ({
    root: tempDir,
    syncBranch: 'main',
    syncMessage: 'release %s',
    syncToken: 'token-123',
    version: '1.2.3',
  });

  const createCore = () => ({
    info: message => {
      infoMessages.push(message);
    },
  });

  const createExec = () => ({
    exec: async (...args) => {
      execCalls.push(args);
    },
  });

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verified-sync-'));
    infoMessages = [];
    execCalls = [];
  });

  afterEach(() => {
    fs.rmSync(tempDir, {recursive: true, force: true});
  });

  it('should throw when GitHub context repo information is missing', async () => {
    const inputs = createInputs();

    await assert.rejects(
      createVerifiedSyncCommit(inputs, {
        github: {context: {repo: {owner: '', repo: ''}}},
      }),
      /Could not determine GitHub repository/,
    );
  });

  it('should return parent commit when there are no staged changes', async () => {
    const inputs = createInputs();
    const octokit = {
      rest: {
        git: {
          getRef: async () => ({data: {object: {sha: 'parent-sha'}}}),
          getCommit: async () => {
            throw new Error('getCommit should not be called without changed files');
          },
        },
      },
    };

    const result = await createVerifiedSyncCommit(inputs, {
      core: createCore(),
      exec: createExec(),
      getStdOut: () => '',
      github: {
        context: {repo: {owner: 'acme', repo: 'widget'}},
        getOctokit: () => octokit,
      },
    });

    assert.equal(result, 'parent-sha');
    assert.deepEqual(execCalls, [[
      'git',
      ['add', '--all'],
    ]]);
    assert.equal(infoMessages.length, 1);
    assert.match(infoMessages[0], /No staged changes found/);
  });

  it('should return parent commit when diff lines are invalid for tree creation', async () => {
    const inputs = createInputs();
    let createTreeCalls = 0;
    const octokit = {
      rest: {
        git: {
          getRef: async () => ({data: {object: {sha: 'parent-sha'}}}),
          getCommit: async () => ({data: {tree: {sha: 'base-tree-sha'}}}),
          createTree: async () => {
            createTreeCalls += 1;
            return {data: {sha: 'unexpected'}};
          },
        },
      },
    };

    const result = await createVerifiedSyncCommit(inputs, {
      core: createCore(),
      exec: createExec(),
      getStdOut: () => 'M',
      github: {
        context: {repo: {owner: 'acme', repo: 'widget'}},
        getOctokit: () => octokit,
      },
    });

    assert.equal(result, 'parent-sha');
    assert.equal(createTreeCalls, 0);
    assert.equal(infoMessages.length, 1);
    assert.match(infoMessages[0], /No tree entries found/);
  });

  it('should create and update a verified commit with file mode handling', async () => {
    const inputs = {
      ...createInputs(),
      syncBranch: 'refs/heads/release',
      syncMessage: 'release %s generated',
      version: 'v1.2.3',
    };

    fs.writeFileSync(path.join(tempDir, 'notes.txt'), 'hello world', 'utf8');
    fs.mkdirSync(path.join(tempDir, 'scripts'), {recursive: true});
    fs.writeFileSync(path.join(tempDir, 'scripts', 'run.sh'), '#!/bin/sh\necho hi\n', 'utf8');
    fs.chmodSync(path.join(tempDir, 'scripts', 'run.sh'), 0o755);
    fs.writeFileSync(path.join(tempDir, 'target.txt'), 'target', 'utf8');
    fs.symlinkSync('target.txt', path.join(tempDir, 'link-to-target'));

    let createTreePayload;
    let createCommitPayload;
    let updateRefPayload;
    const octokit = {
      rest: {
        git: {
          getRef: async payload => {
            assert.deepEqual(payload, {owner: 'acme', repo: 'widget', ref: 'heads/release'});
            return {data: {object: {sha: 'parent-sha'}}};
          },
          getCommit: async payload => {
            assert.deepEqual(payload, {owner: 'acme', repo: 'widget', commit_sha: 'parent-sha'});
            return {data: {tree: {sha: 'base-tree-sha'}}};
          },
          createTree: async payload => {
            createTreePayload = payload;
            return {data: {sha: 'tree-sha'}};
          },
          createCommit: async payload => {
            createCommitPayload = payload;
            return {data: {sha: 'commit-sha'}};
          },
          updateRef: async payload => {
            updateRefPayload = payload;
            return {data: {}};
          },
        },
      },
    };

    const result = await createVerifiedSyncCommit(inputs, {
      core: createCore(),
      exec: createExec(),
      getStdOut: () => [
        'M\tnotes.txt',
        'A\tscripts/run.sh',
        'D\tremoved.txt',
        'A\tlink-to-target',
      ].join('\n'),
      github: {
        context: {repo: {owner: 'acme', repo: 'widget'}},
        getOctokit: () => octokit,
      },
    });

    assert.equal(result, 'commit-sha');
    assert.deepEqual(execCalls, [[
      'git',
      ['add', '--all'],
    ]]);
    assert.equal(createTreePayload.base_tree, 'base-tree-sha');
    assert.equal(createTreePayload.tree.length, 4);
    assert.deepEqual(createTreePayload.tree.find(entry => entry.path === 'removed.txt'), {
      path: 'removed.txt',
      mode: '100644',
      type: 'blob',
      sha: null,
    });
    assert.deepEqual(createTreePayload.tree.find(entry => entry.path === 'notes.txt'), {
      path: 'notes.txt',
      mode: '100644',
      type: 'blob',
      content: 'hello world',
    });
    assert.deepEqual(createTreePayload.tree.find(entry => entry.path === 'scripts/run.sh'), {
      path: 'scripts/run.sh',
      mode: '100755',
      type: 'blob',
      content: '#!/bin/sh\necho hi\n',
    });
    assert.deepEqual(createTreePayload.tree.find(entry => entry.path === 'link-to-target'), {
      path: 'link-to-target',
      mode: '120000',
      type: 'blob',
      content: 'target.txt',
    });
    assert.deepEqual(createCommitPayload, {
      owner: 'acme',
      repo: 'widget',
      message: 'release v1.2.3 generated',
      tree: 'tree-sha',
      parents: ['parent-sha'],
    });
    assert.deepEqual(updateRefPayload, {
      owner: 'acme',
      repo: 'widget',
      ref: 'heads/release',
      sha: 'commit-sha',
      force: false,
    });
    assert.equal(infoMessages.length, 1);
    assert.match(infoMessages[0], /Created verified sync commit commit-sha on release/);
  });
});
