import assert from 'node:assert/strict';

import isLandoPlugin from '../utils/is-lando-plugin.js';

describe('utils/is-lando-plugin', () => {
  it('should return true when manifest has lando key', () => {
    const result = isLandoPlugin({lando: {type: 'plugin'}});

    assert.equal(result, true);
  });

  it('should return true when lando-plugin keyword exists', () => {
    const result = isLandoPlugin({keywords: ['test', 'lando-plugin']});

    assert.equal(result, true);
  });

  it('should return false when manifest is not a lando plugin', () => {
    const result = isLandoPlugin({keywords: ['test']});

    assert.equal(result, false);
  });
});
