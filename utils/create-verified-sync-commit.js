import fs from 'node:fs';
import path from 'node:path';

import core from '@actions/core';
import exec from '@actions/exec';
import github from '@actions/github';

import getStdOut from './get-stdout.js';

const normalizeBranchName = branch => String(branch ?? '').replace(/^refs\/heads\//, '');
const syncCommitMessage = (message, version) => String(message ?? '').split('%s').join(version);

export default async (inputs, dependencies = {}) => {
  const coreClient = dependencies.core ?? core;
  const execClient = dependencies.exec ?? exec;
  const fsClient = dependencies.fs ?? fs;
  const getStdOutClient = dependencies.getStdOut ?? getStdOut;
  const githubClient = dependencies.github ?? github;
  const pathClient = dependencies.path ?? path;
  const {owner, repo} = githubClient.context.repo;
  const branchName = normalizeBranchName(inputs.syncBranch);

  if (!owner || !repo) throw new Error('Could not determine GitHub repository from github.context.repo');
  if (!branchName) throw new Error('Could not determine sync branch for verified commit mode');

  await execClient.exec('git', ['add', '--all']);
  const changedFiles = getStdOutClient('git diff --cached --name-status --no-renames');

  const octokit = dependencies.octokit ?? githubClient.getOctokit(inputs.syncToken);
  const {data: headRef} = await octokit.rest.git.getRef({owner, repo, ref: `heads/${branchName}`});
  const parentCommitSha = headRef.object.sha;

  if (!changedFiles) {
    coreClient.info('No staged changes found for verified sync commit; skipping commit creation.');
    return parentCommitSha;
  }

  const {data: parentCommit} = await octokit.rest.git.getCommit({owner, repo, commit_sha: parentCommitSha});
  const tree = [];

  for (const line of changedFiles.split(/\r?\n/).filter(Boolean)) {
    const [rawStatus, filePath] = line.split('\t');
    const status = rawStatus?.charAt(0);
    if (!filePath || !status) continue;

    if (status === 'D') {
      tree.push({path: filePath, mode: '100644', type: 'blob', sha: null});
      continue;
    }

    const absolutePath = pathClient.resolve(inputs.root, filePath);
    const stats = fsClient.lstatSync(absolutePath);

    if (stats.isSymbolicLink()) {
      tree.push({
        path: filePath,
        mode: '120000',
        type: 'blob',
        content: fsClient.readlinkSync(absolutePath),
      });
      continue;
    }

    tree.push({
      path: filePath,
      mode: (stats.mode & 0o111) ? '100755' : '100644',
      type: 'blob',
      content: fsClient.readFileSync(absolutePath, {encoding: 'utf-8'}),
    });
  }

  if (tree.length === 0) {
    coreClient.info('No tree entries found for verified sync commit; skipping commit creation.');
    return parentCommitSha;
  }

  const {data: nextTree} = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: parentCommit.tree.sha,
    tree,
  });

  const {data: nextCommit} = await octokit.rest.git.createCommit({
    owner,
    repo,
    message: syncCommitMessage(inputs.syncMessage, inputs.version),
    tree: nextTree.sha,
    parents: [parentCommitSha],
  });

  await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${branchName}`,
    sha: nextCommit.sha,
    force: false,
  });

  coreClient.info(`Created verified sync commit ${nextCommit.sha} on ${branchName}`);
  return nextCommit.sha;
};
