import assert from 'node:assert/strict';

import parseTokens from '../utils/parse-tokens.js';

describe('utils/parse-tokens', () => {
  it('should split and trim valid token pairs', () => {
    const result = parseTokens([' alpha = one ', 'beta= two', 'gamma=three']);

    assert.deepEqual(result, [
      ['alpha', 'one'],
      ['beta', 'two'],
      ['gamma', 'three'],
    ]);
  });

  it('should filter out tokens without values', () => {
    const result = parseTokens(['missing-value', 'valid=token']);

    assert.deepEqual(result, [['valid', 'token']]);
  });

  it('should keep empty values when key value separator exists', () => {
    const result = parseTokens(['empty=   ']);

    assert.deepEqual(result, [['empty', '']]);
  });
});
