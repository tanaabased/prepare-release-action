import assert from 'node:assert/strict';

import createVerifiedSyncCommit from '../utils/create-verified-sync-commit.js';

describe('utils/create-verified-sync-commit', () => {
  let infoMessages;
  let execCalls;

  const createInputs = () => ({
    root: '/repo',
    syncBranch: 'main',
    syncMessage: 'release %s',
    syncToken: 'token-123',
    version: '1.2.3',
  });

  const createCore = () => ({
    info: (message) => {
      infoMessages.push(message);
    },
  });

  const createExec = () => ({
    exec: async (...args) => {
      execCalls.push(args);
    },
  });

  beforeEach(() => {
    infoMessages = [];
    execCalls = [];
  });

  it('should throw when GitHub context repo information is missing', async () => {
    const inputs = createInputs();

    await assert.rejects(
      createVerifiedSyncCommit(inputs, {
        github: { context: { repo: { owner: '', repo: '' } } },
      }),
      /Could not determine GitHub repository/,
    );
  });

  it('should return parent commit when there are no staged changes', async () => {
    const inputs = createInputs();
    const octokit = {
      rest: {
        git: {
          getRef: async () => ({ data: { object: { sha: 'parent-sha' } } }),
        },
      },
      graphql: async () => {
        throw new Error('graphql should not be called without changed files');
      },
    };

    const result = await createVerifiedSyncCommit(inputs, {
      core: createCore(),
      exec: createExec(),
      getStdOut: () => '',
      github: {
        context: { repo: { owner: 'acme', repo: 'widget' } },
        getOctokit: () => octokit,
      },
    });

    assert.equal(result, 'parent-sha');
    assert.deepEqual(execCalls, [['git', ['add', '--all']]]);
    assert.equal(infoMessages.length, 1);
    assert.match(infoMessages[0], /No staged changes found/);
  });

  it('should return parent commit when diff lines are invalid for file changes', async () => {
    const inputs = createInputs();
    const octokit = {
      rest: {
        git: {
          getRef: async () => ({ data: { object: { sha: 'parent-sha' } } }),
        },
      },
      graphql: async () => {
        throw new Error('graphql should not be called without valid file changes');
      },
    };

    const result = await createVerifiedSyncCommit(inputs, {
      core: createCore(),
      exec: createExec(),
      getStdOut: () => 'M',
      github: {
        context: { repo: { owner: 'acme', repo: 'widget' } },
        getOctokit: () => octokit,
      },
    });

    assert.equal(result, 'parent-sha');
    assert.equal(infoMessages.length, 1);
    assert.match(infoMessages[0], /No file changes found/);
  });

  it('should throw when symlink changes are detected', async () => {
    const inputs = createInputs();
    let graphqlCalls = 0;
    const octokit = {
      rest: {
        git: {
          getRef: async () => ({ data: { object: { sha: 'parent-sha' } } }),
        },
      },
      graphql: async () => {
        graphqlCalls += 1;
        return {};
      },
    };

    await assert.rejects(
      createVerifiedSyncCommit(inputs, {
        exec: createExec(),
        fs: {
          lstatSync: () => ({ isSymbolicLink: () => true }),
        },
        getStdOut: () => 'A\tlink-to-target',
        github: {
          context: { repo: { owner: 'acme', repo: 'widget' } },
          getOctokit: () => octokit,
        },
        path: {
          resolve: (root, filePath) => `${root}/${filePath}`,
        },
      }),
      /does not support symlink changes/,
    );

    assert.equal(graphqlCalls, 0);
  });

  it('should create and update a verified commit with createCommitOnBranch', async () => {
    const inputs = {
      ...createInputs(),
      syncBranch: 'refs/heads/release',
      syncMessage: 'release %s generated',
      version: 'v1.2.3',
    };

    let graphqlQuery;
    let graphqlVariables;
    const octokit = {
      rest: {
        git: {
          getRef: async (payload) => {
            assert.deepEqual(payload, {
              owner: 'acme',
              repo: 'widget',
              ref: 'heads/release',
            });
            return { data: { object: { sha: 'parent-sha' } } };
          },
        },
      },
      graphql: async (query, variables) => {
        graphqlQuery = query;
        graphqlVariables = variables;
        return { createCommitOnBranch: { commit: { oid: 'commit-sha' } } };
      },
    };

    const fsClient = {
      lstatSync: (absolutePath) => ({
        isSymbolicLink: () => false,
        absolutePath,
      }),
      readFileSync: (absolutePath) => {
        if (absolutePath === '/repo/notes.txt') return 'hello world';
        if (absolutePath === '/repo/scripts/run.sh') return '#!/bin/sh\necho hi\n';
        throw new Error(`unexpected file read: ${absolutePath}`);
      },
    };

    const result = await createVerifiedSyncCommit(inputs, {
      core: createCore(),
      exec: createExec(),
      fs: fsClient,
      getStdOut: () => ['M\tnotes.txt', 'A\tscripts/run.sh', 'D\tremoved.txt'].join('\n'),
      github: {
        context: { repo: { owner: 'acme', repo: 'widget' } },
        getOctokit: () => octokit,
      },
      path: {
        resolve: (root, filePath) => `${root}/${filePath}`,
      },
    });

    assert.equal(result, 'commit-sha');
    assert.deepEqual(execCalls, [['git', ['add', '--all']]]);
    assert.match(graphqlQuery, /mutation CreateCommitOnBranch/);
    assert.deepEqual(graphqlVariables, {
      input: {
        branch: {
          repositoryNameWithOwner: 'acme/widget',
          branchName: 'release',
        },
        message: {
          headline: 'release v1.2.3 generated',
        },
        expectedHeadOid: 'parent-sha',
        fileChanges: {
          additions: [
            {
              path: 'notes.txt',
              contents: Buffer.from('hello world', 'utf-8').toString('base64'),
            },
            {
              path: 'scripts/run.sh',
              contents: Buffer.from('#!/bin/sh\necho hi\n', 'utf-8').toString('base64'),
            },
          ],
          deletions: [{ path: 'removed.txt' }],
        },
      },
    });
    assert.equal(infoMessages.length, 1);
    assert.match(infoMessages[0], /Created verified sync commit commit-sha on release/);
  });
});
