import fs from 'node:fs';

import semverClean from 'semver/functions/clean.js';
import semverValid from 'semver/functions/valid.js';

import getStdOut from './get-stdout.js';

const fallbackVersion = 'v0.0.0-unreleased';

const isSemverValid = (version) => semverValid(semverClean(version)) !== null;

const getMatchingTag = (versionMatch) => {
  const versionPattern = new RegExp(versionMatch);
  const tags = getStdOut('git tag --merged HEAD --sort=-v:refname')
    .split(/\r?\n/)
    .map((tag) => tag.trim())
    .filter(Boolean);

  return tags.find((tag) => versionPattern.test(tag) && isSemverValid(tag)) ?? null;
};

const getPackageVersion = (packageJsonPath) => {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (typeof packageJson.version !== 'string') {
    return null;
  }
  const cleanedVersion = semverClean(packageJson.version);

  return cleanedVersion ? `v${cleanedVersion}` : null;
};

const getFallbackCommitId = () =>
  String(getStdOut('git rev-parse --short HEAD'))
    .trim()
    .toLowerCase()
    .replace(/[^0-9a-z-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';

export default ({ packageJsonPath, version, versionMatch }) => {
  if (!version) {
    throw new Error('Version is a required input!');
  }

  if (version !== 'dev') {
    return version;
  }

  const matchingTag = getMatchingTag(versionMatch);

  if (matchingTag) {
    return matchingTag;
  }

  const packageVersion = getPackageVersion(packageJsonPath);

  if (packageVersion && isSemverValid(packageVersion)) {
    return packageVersion;
  }

  return `${fallbackVersion}.${getFallbackCommitId()}`;
};
