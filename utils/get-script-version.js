import { execSync } from 'node:child_process';

export default () => {
  const output = execSync('git describe --tags --always --abbrev=1', {
    maxBuffer: 1024 * 1024 * 10,
    encoding: 'utf-8',
  });

  return typeof output === 'string' ? output.trim() : 'unknown';
};
