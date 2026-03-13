import fs from 'node:fs/promises';

const fixtures = new Map([
  ['vi-js-target.js', '"use strict";\n\nlet SCRIPT_VERSION;\n'],
  ['vi-sh-target.sh', '#!/usr/bin/env bash\nset -euo pipefail\n'],
  ['vi-ps1-target.ps1', '$SCRIPT_VERSION = $null\nWrite-Host hello\n'],
  ['vi-env-target.js', 'let BUILD_VERSION;\n'],
  ['vi-dry-run.js', 'let SCRIPT_VERSION;\n'],
]);

await Promise.all(
  [...fixtures.entries()].map(([filename, content]) => fs.writeFile(filename, content, 'utf8')),
);
