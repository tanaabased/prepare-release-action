import * as core from '@actions/core';
import jsonfile from 'jsonfile';

export default (pjson) => {
  const { dependencies: packageDependencies } = jsonfile.readFileSync(pjson);

  if (
    !packageDependencies ||
    (packageDependencies && Object.keys(packageDependencies).length === 0)
  ) {
    core.info('No dependencies found in package.json, skipping bundle-dependencies step');
  }

  return (
    typeof packageDependencies === 'object' &&
    packageDependencies !== null &&
    Object.keys(packageDependencies).length > 0
  );
};
