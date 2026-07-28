import assert from 'node:assert/strict';

import resolveVersionInjectorOptions from '../utils/resolve-version-injector-options.js';

describe('utils/resolve-version-injector-options', () => {
  it('should resolve CLI values ahead of environment defaults', () => {
    const result = resolveVersionInjectorOptions(
      ['target.js', '--style', 'js', '--version', '2.3.4', '--name', 'CLI_VERSION'],
      {
        debug: true,
        env: {
          VERSION_INJECTOR_NAME: 'ENV_VERSION',
          VERSION_INJECTOR_STYLE: 'sh',
          VERSION_INJECTOR_VERSION: '1.0.0',
        },
      },
    );

    assert.equal(result.options.debug, true);
    assert.equal(result.options.file, 'target.js');
    assert.equal(result.options.name, 'CLI_VERSION');
    assert.equal(result.options.style, 'js');
    assert.equal(result.options.versionValue, '2.3.4');
  });

  it('should resolve environment values ahead of built-in defaults', () => {
    const result = resolveVersionInjectorOptions(['target.sh'], {
      env: {
        VERSION_INJECTOR_INSERT: 'bottom',
        VERSION_INJECTOR_NAME: 'RELEASE_VERSION',
        VERSION_INJECTOR_STYLE: 'sh',
        VERSION_INJECTOR_VERSION: '3.0.0',
      },
    });

    assert.equal(result.options.insert, 'bottom');
    assert.equal(result.options.name, 'RELEASE_VERSION');
    assert.equal(result.options.style, 'sh');
    assert.equal(result.options.versionValue, '3.0.0');
  });

  it('should distinguish the bare CLI version flag from an injected version', () => {
    const showVersion = resolveVersionInjectorOptions(['--version'], { env: {} });
    const injectVersion = resolveVersionInjectorOptions(
      ['target.js', '--style=js', '--version=2.3.4'],
      { env: {} },
    );

    assert.equal(showVersion.options.showCliVersion, true);
    assert.equal(injectVersion.options.showCliVersion, false);
    assert.equal(injectVersion.options.versionValue, '2.3.4');
  });

  it('should reject unknown options and multiple target paths', () => {
    assert.throws(
      () => resolveVersionInjectorOptions(['--unknown'], { env: {} }),
      /Unknown option --unknown/,
    );
    assert.throws(
      () => resolveVersionInjectorOptions(['one.js', 'two.js'], { env: {} }),
      /Only one file path is supported/,
    );
  });
});
