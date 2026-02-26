import assert from 'node:assert/strict';

import parseHumanSizeToBytes from '../utils/parse-human-size-to-bytes.js';

describe('utils/parse-human-size-to-bytes', () => {
  it('should return null for non-string values', () => {
    assert.equal(parseHumanSizeToBytes(42), null);
  });

  it('should return null for invalid formats', () => {
    assert.equal(parseHumanSizeToBytes('ten MB'), null);
    assert.equal(parseHumanSizeToBytes('1PB'), null);
  });

  it('should parse supported units to bytes', () => {
    assert.equal(parseHumanSizeToBytes('1 B'), 1);
    assert.equal(parseHumanSizeToBytes('2kb'), 2048);
    assert.equal(parseHumanSizeToBytes('3 MB'), 3 * 1024 * 1024);
    assert.equal(parseHumanSizeToBytes('1 GB'), 1024 * 1024 * 1024);
    assert.equal(parseHumanSizeToBytes('1TB'), 1024 ** 4);
  });

  it('should round decimal values to nearest byte', () => {
    assert.equal(parseHumanSizeToBytes('1.5 KB'), 1536);
    assert.equal(parseHumanSizeToBytes('0.5 MB'), 524288);
  });
});
