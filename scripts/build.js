import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const distDir = path.resolve('dist');

const buildEntrypoint = (entrypoint, entryNaming) => {
  const result = Bun.spawnSync(
    [
      process.execPath,
      'build',
      entrypoint,
      '--target=bun',
      '--format=esm',
      '--sourcemap=linked',
      '--outdir',
      distDir,
      '--entry-naming',
      entryNaming,
    ],
    {
      stdout: 'inherit',
      stderr: 'inherit',
    },
  );

  if (result.exitCode !== 0) {
    process.exit(result.exitCode ?? 1);
  }
};

const writeHelperShims = async () => {
  const posixShimPath = path.join(distDir, 'version-injector');
  const windowsShimPath = path.join(distDir, 'version-injector.cmd');

  const posixShim = `#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
exec bun "\${SCRIPT_DIR}/version-injector.js" "$@"
`;
  const windowsShim = `@echo off
bun "%~dp0version-injector.js" %*
`;

  await fs.mkdir(distDir, { recursive: true });
  await fs.writeFile(posixShimPath, posixShim, 'utf8');
  await fs.chmod(posixShimPath, 0o755);
  await fs.writeFile(windowsShimPath, windowsShim, 'utf8');
};

buildEntrypoint('./prepare-release.js', 'index.js');
buildEntrypoint('./bin/version-injector.js', 'version-injector.js');
await writeHelperShims();
