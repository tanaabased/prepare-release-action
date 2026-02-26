import core from '@actions/core';
import fs from 'fs';
import path from 'path';

export default async (files = []) => {
  for (const backup of files) {
    try {
      const src = backup.replace(/\.bak$/, '');
      await fs.promises.rename(backup, src);
      const file = path.basename(src);
      core.info(`Restored actions/checkout credential file ${file}`);
    } catch (e) {
      core.warning(`Failed to restore credential file ${backup}: ${e.message}`);
    }
  }

  return [];
};
