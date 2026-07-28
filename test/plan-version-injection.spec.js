import assert from 'node:assert/strict';

import planVersionInjection from '../utils/plan-version-injection.js';

describe('utils/plan-version-injection', () => {
  const options = {
    file: '/tmp/version.js',
    insert: null,
    name: 'SCRIPT_VERSION',
    style: 'js',
    versionValue: '2.3.4',
  };

  it('should plan an assignment update and report its match count', () => {
    const matchCounts = [];

    const result = planVersionInjection(
      "let SCRIPT_VERSION;\nconsole.log('ready');\n",
      options,
      (count) => matchCounts.push(count),
    );

    assert.deepEqual(matchCounts, [1]);
    assert.deepEqual(result, {
      changed: true,
      nextContent: "const SCRIPT_VERSION = '2.3.4';\nconsole.log('ready');\n",
    });
  });

  it('should preserve content that already has the requested assignment', () => {
    const content = "const SCRIPT_VERSION = '2.3.4';\n";

    const result = planVersionInjection(content, options);

    assert.deepEqual(result, {
      changed: false,
      nextContent: content,
    });
  });

  it('should insert a shell assignment at the requested boundary', () => {
    const result = planVersionInjection('#!/usr/bin/env bash\necho ready\n', {
      ...options,
      insert: 'after-shebang',
      name: 'VERSION',
      style: 'sh',
    });

    assert.equal(result.changed, true);
    assert.equal(result.nextContent, '#!/usr/bin/env bash\nVERSION="2.3.4"\necho ready\n');
  });

  it('should reject ambiguous assignment updates', () => {
    assert.throws(
      () => planVersionInjection("let SCRIPT_VERSION;\nconst SCRIPT_VERSION = '1.0.0';\n", options),
      /Found multiple SCRIPT_VERSION assignments/,
    );
  });
});
