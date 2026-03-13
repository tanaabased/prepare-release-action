import { execSync } from 'node:child_process';

export default (command) => {
  // validate inputs
  if (!command) throw new Error('Must specify a command!');
  // get output
  const data = execSync(command, {
    maxBuffer: 1024 * 1024 * 10,
    encoding: 'utf-8',
  });
  // trim if we can then return
  return typeof data === 'string' ? data.trim() : data;
};
