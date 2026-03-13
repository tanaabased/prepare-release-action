import fs from 'node:fs';
import path from 'node:path';

import core from '@actions/core';
import exec from '@actions/exec';
import github from '@actions/github';

import getStdOut from './get-stdout.js';

const normalizeBranchName = (branch) => String(branch ?? '').replace(/^refs\/heads\//, '');
const syncCommitMessage = (message, version) =>
  String(message ?? '')
    .split('%s')
    .join(version);

export default async (inputs, dependencies = {}) => {
  const coreClient = dependencies.core ?? core;
  const execClient = dependencies.exec ?? exec;
  const fsClient = dependencies.fs ?? fs;
  const getStdOutClient = dependencies.getStdOut ?? getStdOut;
  const githubClient = dependencies.github ?? github;
  const pathClient = dependencies.path ?? path;
  const { owner, repo } = githubClient.context.repo;
  const branchName = normalizeBranchName(inputs.syncBranch);

  if (!owner || !repo)
    throw new Error('Could not determine GitHub repository from github.context.repo');
  if (!branchName) throw new Error('Could not determine sync branch for verified commit mode');

  await execClient.exec('git', ['add', '--all']);
  const changedFiles = getStdOutClient('git diff --cached --name-status --no-renames');

  const octokit = dependencies.octokit ?? githubClient.getOctokit(inputs.syncToken);
  const { data: headRef } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branchName}`,
  });
  const parentCommitSha = headRef.object.sha;

  if (!changedFiles) {
    coreClient.info('No staged changes found for verified sync commit; skipping commit creation.');
    return parentCommitSha;
  }

  const additions = [];
  const deletions = [];

  for (const line of changedFiles.split(/\r?\n/).filter(Boolean)) {
    const [rawStatus, filePath] = line.split('\t');
    const status = rawStatus?.charAt(0);
    if (!filePath || !status) continue;

    if (status === 'D') {
      deletions.push({ path: filePath });
      continue;
    }

    const absolutePath = pathClient.resolve(inputs.root, filePath);
    const stats = fsClient.lstatSync(absolutePath);

    if (stats.isSymbolicLink()) {
      throw new Error(
        `sync-verified does not support symlink changes via createCommitOnBranch: ${filePath}`,
      );
    }

    const rawContents = fsClient.readFileSync(absolutePath);
    const normalizedContents = Buffer.isBuffer(rawContents)
      ? rawContents
      : Buffer.from(String(rawContents), 'utf-8');

    additions.push({
      path: filePath,
      contents: normalizedContents.toString('base64'),
    });
  }

  if (additions.length === 0 && deletions.length === 0) {
    coreClient.info('No file changes found for verified sync commit; skipping commit creation.');
    return parentCommitSha;
  }

  const fileChanges = {};
  if (additions.length > 0) fileChanges.additions = additions;
  if (deletions.length > 0) fileChanges.deletions = deletions;

  const mutation = `
    mutation CreateCommitOnBranch($input: CreateCommitOnBranchInput!) {
      createCommitOnBranch(input: $input) {
        commit {
          oid
        }
      }
    }
  `;

  const result = await octokit.graphql(mutation, {
    input: {
      branch: {
        repositoryNameWithOwner: `${owner}/${repo}`,
        branchName,
      },
      message: {
        headline: syncCommitMessage(inputs.syncMessage, inputs.version),
      },
      expectedHeadOid: parentCommitSha,
      fileChanges,
    },
  });

  const commitSha = result?.createCommitOnBranch?.commit?.oid;
  if (!commitSha) throw new Error('GitHub did not return a commit SHA for createCommitOnBranch');

  coreClient.info(`Created verified sync commit ${commitSha} on ${branchName}`);
  return commitSha;
};
