import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import core from '@actions/core';
import exec from '@actions/exec';
import jsonfile from 'jsonfile';
import semverClean from 'semver/functions/clean.js';
import semverValid from 'semver/functions/valid.js';
import set from 'lodash.set';
import createVerifiedSyncCommit from './utils/create-verified-sync-commit.js';

import getScriptVersion from './utils/get-script-version.js';
import getInputs from './utils/get-inputs.js';
import getStdOut from './utils/get-stdout.js';
import hasDependencies from './utils/has-dependencies.js';
import hideCredentialFiles from './utils/hide-credentials.js';
import parseTokens from './utils/parse-tokens.js';
import restoreCredentialFiles from './utils/restore-credentials.js';

let SCRIPT_VERSION;

if (!SCRIPT_VERSION) {
  SCRIPT_VERSION = getScriptVersion();
}

const main = async () => {
  // start by getting the inputs
  const inputs = getInputs();

  core.debug(`running prepare-release.js script version: ${SCRIPT_VERSION}`);

  // switch cwd to inputs.root
  process.chdir(inputs.root);

  // add more
  inputs.pjson = path.join(inputs.root, 'package.json');

  try {
    // get status of shallowness
    const isShallow = getStdOut('git rev-parse --is-shallow-repository');

    // if a shallow repo then unshallow and fetch all
    if (isShallow === 'true') {
      core.startGroup('Configuring repo');
      core.info(`working-dir: ${process.cwd()}`);
      await exec.exec('git', ['fetch', '--unshallow']);
      await exec.exec('git', ['fetch', '--all']);
      core.endGroup();
    }

    // validate that we have a version
    if (!inputs.version) throw new Error('Version is a required input!');
    // if version is dev then attempt to describe tag/version
    if (inputs.version === 'dev')
      inputs.version = getStdOut(
        `git describe --tags --always --abbrev=1 --match="${inputs.versionMatch}"`,
      );
    // and that it is semantically valid
    if (semverValid(semverClean(inputs.version)) === null)
      throw new Error(`Version ${inputs.version} must be semver valid!`);
    // and that we have a package.json
    if (!fs.existsSync(inputs.pjson))
      throw new Error(`Could not detect a package.json in ${inputs.root}`);

    // normalize updatefile paths
    for (const [index, filename] of inputs.updateFiles.entries()) {
      inputs.updateFiles[index] = path.isAbsolute(filename)
        ? filename
        : path.resolve(inputs.root, filename);
    }

    // ensure bun is available before we run any bunx commands
    core.startGroup('Ensuring bun');
    core.info(`bun-version: ${getStdOut('bun --version')}`);
    core.endGroup();

    // configure git
    core.startGroup('Configuring git');
    // set user/email
    await exec.exec('git', ['config', 'user.name', inputs.syncUsername]);
    await exec.exec('git', ['config', 'user.email', inputs.syncEmail]);

    // check out correct branch if we plan to sync back later
    if (inputs.sync) await exec.exec('git', ['checkout', inputs.syncBranch]);
    core.endGroup();

    // run user specified commands
    for (const command of inputs.commands) await exec.exec(command);

    // apply any metadata to the package.json
    if (inputs.meta.length > 0) {
      const pjson = jsonfile.readFileSync(inputs.pjson);

      // go through meta and update package.json
      inputs.meta.forEach((line) => {
        if (Array.isArray(line)) set(pjson, line[0], line[1]);
        else if (typeof line === 'string') {
          const key = line.split('=')[0];
          const value = line.split('=')[1];
          set(pjson, key, value);
        }
      });

      // write and debug
      jsonfile.writeFileSync(inputs.pjson, pjson, { spaces: 2 });
      core.debug(`updated pjson`);
      core.debug(jsonfile.readFileSync(inputs.pjson));
    }

    // loop through and update-files with tokens and headers
    for (const file of inputs.updateFiles.filter((file) => fs.existsSync(file))) {
      // get content
      let content = fs.readFileSync(file, { encoding: 'utf-8' });

      // update its tokens
      core.startGroup(`Updating ${file} with update-files-meta tokens`);
      for (const [token, value] of parseTokens(inputs.tokens)) {
        core.info(`{{ ${token} }}: ${value}`);
        content = content.replace(new RegExp(`\\{\\{\\s*${token}\\s*\\}\\}`, 'g'), value);
      }
      core.endGroup();

      // update its header
      if (inputs.updateHeader.length > 0) {
        core.startGroup(`Updating ${file} with update-files-header content`);
        core.info(`update-header: ${inputs.updateHeader.join(os.EOL)}`);
        core.endGroup();
        content = `${inputs.updateHeader.join(os.EOL)}${os.EOL}${os.EOL}${content}`;
      }

      // debug and update the file with new contents
      fs.writeFileSync(file, content);
      core.debug(`updated ${file}:`);
      core.debug(`---`);
      core.debug(`${fs.readFileSync(file, { encoding: 'utf-8' })}`);
      core.debug(`---`);
    }

    const useVerifiedSync = inputs.sync && inputs.syncVerified;

    if (inputs.syncVerified && !inputs.sync) {
      core.warning('sync-verified=true has no effect when sync=false');
    }

    // bump version, and commit changes only if we are in git-sync mode
    const bumpArgs =
      inputs.sync && !inputs.syncVerified
        ? [inputs.version, '--commit', inputs.syncMessage, '--all']
        : [inputs.version];
    await exec.exec('bunx', [
      '--bun',
      '--package',
      'version-bump-prompt@6.1.0',
      'bump',
      ...bumpArgs,
    ]);

    let currentCommit = getStdOut('git --no-pager log --pretty=format:%h -n 1');
    if (useVerifiedSync) {
      currentCommit = await createVerifiedSyncCommit(inputs);
      await exec.exec('git', ['fetch', '--no-tags', 'origin', inputs.syncBranch]);
      await exec.exec('git', ['checkout', '--force', currentCommit]);
    }

    // get helpful stuff, for some reasons windows interprets the format wrapping quptes literally?
    const tags = inputs.syncTags.concat([inputs.version]);

    // tag commits
    for (const tag of tags) await exec.exec('git', ['tag', '--force', tag, currentCommit]);

    // sync back to repo if applicable
    if (inputs.sync) {
      // log where we are at before we sync
      core.startGroup('Sync changes information');
      await exec.exec('git', ['--no-pager', 'log', '-1']);
      await exec.exec('git', ['--no-pager', 'tag', '--points-at', 'HEAD']);
      await exec.exec('git', ['diff', 'HEAD~1']);
      core.endGroup();

      // if using actions/checkout@v6 we need to temporarily move credential files
      inputs.credFiles = await hideCredentialFiles();

      // construct auth string
      const basicCredential = Buffer.from(`x-access-token:${inputs.syncToken}`, 'utf8').toString(
        'base64',
      );
      const authString = `AUTHORIZATION: basic ${basicCredential}`;
      core.setSecret(basicCredential);

      // push updates
      await exec.exec('git', [
        'config',
        '--local',
        'http.https://github.com/.extraheader',
        authString,
      ]);
      if (!inputs.syncVerified) await exec.exec('git', ['push', 'origin', inputs.syncBranch]);
      for (const tag of tags) await exec.exec('git', ['push', '--force', 'origin', tag]);

      // restore credentials if needed
      if (Array.isArray(inputs.credFiles) && inputs.credFiles.length > 0) {
        inputs.credFiles = await restoreCredentialFiles(inputs.credFiles);
      }
    }

    // bundle deps if we need to
    //
    // this happens AFTER sync because we ASSUME you do not have your node_modules checks into your repo
    // and if you do then this should be in your package.json already
    if (inputs.bundleDependencies && hasDependencies(inputs.pjson)) {
      await exec.exec('bunx', [
        '--bun',
        '--package',
        'bundle-dependencies@1.0.2',
        'bundle-dependencies',
        'update',
      ]);
      await exec.exec('bunx', [
        '--bun',
        '--package',
        'bundle-dependencies@1.0.2',
        'bundle-dependencies',
        'list-bundled-dependencies',
      ]);
    }

    // show all changes
    core.startGroup('Change information');
    await exec.exec('git', ['--no-pager', 'log', '-1']);
    await exec.exec('git', ['--no-pager', 'tag', '--points-at', 'HEAD']);
    await exec.exec('git', ['diff', 'HEAD~1']);
    core.endGroup();

    // catch
  } catch (error) {
    core.setFailed(error.message);
    process.exit(1);
  }
};

// main logix
main();
