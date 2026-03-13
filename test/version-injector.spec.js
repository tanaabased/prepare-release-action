import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cliPath = path.resolve('bin/version-injector.js');
const ansiPattern = new RegExp(String.raw`\u001B\[[0-9;]*m`, 'g');
const scriptVersion = execFileSync('git', ['describe', '--tags', '--always', '--abbrev=1'], {
  encoding: 'utf8',
}).trim();

describe('bin/version-injector', () => {
  const tempDirs = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0, tempDirs.length)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  const createTempFile = (filename, contents) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'version-injector-'));
    const filePath = path.join(dir, filename);
    tempDirs.push(dir);
    fs.writeFileSync(filePath, contents, 'utf8');
    return filePath;
  };

  const runCli = (args) =>
    spawnSync(process.execPath, [cliPath, ...args], {
      encoding: 'utf8',
    });

  it('should print help text', () => {
    const result = runCli(['--help']);
    const output = result.stdout.replaceAll(ansiPattern, '');

    assert.equal(result.status, 0);
    assert.match(output, /Usage:/);
    assert.match(output, /Inject a version assignment/);
    assert.match(output, /Options:/);
    assert.match(output, /Environment Variables:/);
    assert.match(output, /--style <js\|sh\|ps1>/);
    assert.match(output, /--debug/);
    assert.match(output, /--insert <position>/);
    assert.match(output, /VERSION_INJECTOR_VERSION/);
  });

  it('should print the resolved script version when called with bare --version', () => {
    const result = runCli(['--version']);

    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), scriptVersion);
  });

  it('should replace a javascript placeholder assignment', () => {
    const filePath = createTempFile('example.js', `'use strict';\n\nlet SCRIPT_VERSION;\n`);

    const result = runCli([filePath, '--style', 'js', '--version', 'v1.2.3']);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /done/);
    assert.match(result.stdout, /update/);
    assert.equal(
      fs.readFileSync(filePath, 'utf8'),
      `'use strict';\n\nconst SCRIPT_VERSION = 'v1.2.3';\n`,
    );
  });

  it('should replace a bundled javascript var placeholder assignment', () => {
    const filePath = createTempFile('bundled.js', `var SCRIPT_VERSION;\nconsole.log('hello');\n`);

    const result = runCli([filePath, '--style', 'js', '--version', 'v1.2.3']);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /done/);
    assert.equal(
      fs.readFileSync(filePath, 'utf8'),
      `const SCRIPT_VERSION = 'v1.2.3';\nconsole.log('hello');\n`,
    );
  });

  it('should use environment defaults when flags are omitted', () => {
    const filePath = createTempFile('env.js', 'let BUILD_VERSION;\n');

    const result = spawnSync(process.execPath, [cliPath, filePath], {
      encoding: 'utf8',
      env: {
        ...process.env,
        VERSION_INJECTOR_NAME: 'BUILD_VERSION',
        VERSION_INJECTOR_STYLE: 'js',
        VERSION_INJECTOR_VERSION: 'v6.7.8',
      },
    });

    assert.equal(result.status, 0);
    assert.match(result.stdout, /done/);
    assert.equal(fs.readFileSync(filePath, 'utf8'), "const BUILD_VERSION = 'v6.7.8';\n");
  });

  it('should fail when multiple javascript matches exist', () => {
    const filePath = createTempFile(
      'duplicate.js',
      `let SCRIPT_VERSION;\nconst SCRIPT_VERSION = 'v0.0.1';\n`,
    );

    const result = runCli([filePath, '--style', 'js', '--version', 'v2.0.0']);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Found multiple SCRIPT_VERSION assignments or placeholders/);
  });

  it('should insert a shell assignment after the shebang', () => {
    const filePath = createTempFile('script.sh', '#!/usr/bin/env bash\nset -euo pipefail\n');

    const result = runCli([
      filePath,
      '--style',
      'sh',
      '--version',
      'v3.4.5',
      '--insert',
      'after-shebang',
    ]);

    assert.equal(result.status, 0);
    assert.equal(
      fs.readFileSync(filePath, 'utf8'),
      '#!/usr/bin/env bash\nSCRIPT_VERSION="v3.4.5"\nset -euo pipefail\n',
    );
  });

  it('should replace a powershell placeholder assignment', () => {
    const filePath = createTempFile('script.ps1', '$SCRIPT_VERSION = $null\nWrite-Host "hello"\n');

    const result = runCli([filePath, '--style', 'ps1', '--version=v4.5.6']);

    assert.equal(result.status, 0);
    assert.equal(
      fs.readFileSync(filePath, 'utf8'),
      '$SCRIPT_VERSION = "v4.5.6"\nWrite-Host "hello"\n',
    );
  });

  it('should support check mode without modifying the file', () => {
    const filePath = createTempFile('check.js', 'let SCRIPT_VERSION;\n');

    const result = runCli([filePath, '--style', 'js', '--version', 'v9.9.9', '--check']);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /does not match the requested version injection/);
    assert.equal(fs.readFileSync(filePath, 'utf8'), 'let SCRIPT_VERSION;\n');
  });

  it('should support dry-run without modifying the file', () => {
    const filePath = createTempFile('dry-run.js', 'let SCRIPT_VERSION;\n');

    const result = runCli([filePath, '--style', 'js', '--version', 'v8.8.8', '--dry-run']);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /note/);
    assert.match(result.stdout, /dry run/);
    assert.equal(fs.readFileSync(filePath, 'utf8'), 'let SCRIPT_VERSION;\n');
  });

  it('should emit debug output when VERSION_INJECTOR_DEBUG is enabled', () => {
    const filePath = createTempFile('debug.js', 'let SCRIPT_VERSION;\n');

    const result = spawnSync(
      process.execPath,
      [cliPath, filePath, '--style', 'js', '--version', 'v7.8.9', '--dry-run'],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          VERSION_INJECTOR_DEBUG: '1',
        },
      },
    );

    assert.equal(result.status, 0);
    assert.match(result.stderr, /debug/);
    assert.match(result.stderr, /\[version-injector\]/);
    assert.match(result.stderr, /running version-injector\.js script version:/);
    assert.match(result.stderr, /resolved file=/);
  });
});
