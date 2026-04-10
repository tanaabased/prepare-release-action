import fs from 'node:fs';
import path from 'node:path';

import * as core from '@actions/core';

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
