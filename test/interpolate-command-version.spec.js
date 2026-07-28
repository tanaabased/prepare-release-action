import assert from 'node:assert/strict';

import semverClean from 'semver/functions/clean.js';
import semverValid from 'semver/functions/valid.js';

import interpolateCommandVersion from '../utils/interpolate-command-version.js';

describe('utils/interpolate-command-version', () => {
  it('should interpolate both supported resolved version references', () => {
    const command =
      'release-tool --first $PREPARE_RELEASE_VERSION --second ${PREPARE_RELEASE_VERSION}';

    const result = interpolateCommandVersion(command, 'v2.3.4');

    assert.equal(result, 'release-tool --first v2.3.4 --second v2.3.4');
  });

  it('should leave unknown environment references unchanged', () => {
    const command = 'echo $UNKNOWN_VERSION ${OTHER_VERSION}';

    const result = interpolateCommandVersion(command, 'v2.3.4');

    assert.equal(result, command);
  });

  it('should leave similar longer environment names unchanged', () => {
    const command =
      'echo $PREPARE_RELEASE_VERSION_SUFFIX ${PREPARE_RELEASE_VERSION_SUFFIX} $PREPARE_RELEASE_VERSION2';

    const result = interpolateCommandVersion(command, 'v2.3.4');

    assert.equal(result, command);
  });

  it('should leave commands without a resolved version reference unchanged', () => {
    const command = 'bun run build';

    const result = interpolateCommandVersion(command, 'v2.3.4');

    assert.equal(result, command);
  });

  it('should use the semver-validated resolved version verbatim', () => {
    const resolvedVersion = 'v2.3.4-beta.1+build.5';
    assert.notEqual(semverValid(semverClean(resolvedVersion)), null);

    const result = interpolateCommandVersion(
      'version-injector output.js --style js --version=$PREPARE_RELEASE_VERSION',
      resolvedVersion,
    );

    assert.equal(result, 'version-injector output.js --style js --version=v2.3.4-beta.1+build.5');
  });
});
