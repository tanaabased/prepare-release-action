import hideCredentials from './hide-credentials.js';
import restoreCredentials from './restore-credentials.js';

/**
 * Runs one operation while actions/checkout credential files are hidden.
 *
 * Credential backups are restored even when the operation throws.
 *
 * @param {() => Promise<unknown>} operation Operation that requires alternate git credentials.
 * @returns {Promise<unknown>} The operation result.
 */
export default async (operation) => {
  const credentialFiles = await hideCredentials();

  try {
    return await operation();
  } finally {
    if (credentialFiles.length > 0) {
      await restoreCredentials(credentialFiles);
    }
  }
};
