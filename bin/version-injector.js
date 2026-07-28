#!/usr/bin/env bun

import process from 'node:process';

import getScriptVersion from '../utils/get-script-version.js';
import runVersionInjectorCli from '../lib/version-injector-cli.js';

let SCRIPT_VERSION;

if (!SCRIPT_VERSION) {
  SCRIPT_VERSION = getScriptVersion();
}

await runVersionInjectorCli(process.argv.slice(2), SCRIPT_VERSION);
