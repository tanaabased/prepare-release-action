import assert from 'node:assert/strict';

import parseReleaseDate from '../utils/parse-release-date.js';

describe('utils/parse-release-date', () => {
  it('should format a date using en-US long month format', () => {
    const input = '2026-02-20T16:30:00.000Z';
    const expected = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(input));

    const result = parseReleaseDate(input);

    assert.equal(result, expected);
  });
});
