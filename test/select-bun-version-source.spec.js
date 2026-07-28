import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const script = 'scripts/select-bun-version-source.sh';

const parseOutputs = (output) =>
  Object.fromEntries(
    output
      .trimEnd()
      .split('\n')
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );

describe('scripts/select-bun-version-source', () => {
  let fixture;
  let fixtureRoot;

  beforeEach(() => {
    const fixtureParent = join(process.cwd(), 'node_modules', '.cache');
    mkdirSync(fixtureParent, { recursive: true });
    fixture = mkdtempSync(join(fixtureParent, 'bun-version-test-'));
    fixtureRoot = relative(process.cwd(), fixture).split(sep).join('/');
  });

  afterEach(() => {
    rmSync(fixture, { recursive: true, force: true });
  });

  const select = (requestedVersion, env = process.env) =>
    parseOutputs(
      execFileSync('bash', [script, requestedVersion, fixtureRoot], {
        cwd: process.cwd(),
        encoding: 'utf8',
        env,
      }),
    );

  it('should pass an explicit version directly to setup-bun', () => {
    writeFileSync(join(fixture, '.bun-version'), '1.2.3\n');

    assert.deepEqual(select('1.3.7'), {
      'bun-version': '1.3.7',
      'bun-version-file': '',
    });
  });

  it('should prefer .bun-version in auto mode', () => {
    writeFileSync(join(fixture, '.bun-version'), '1.2.3\n');
    writeFileSync(join(fixture, '.tool-versions'), 'bun 1.2.2\n');
    writeFileSync(join(fixture, 'package.json'), '{"packageManager":"bun@1.2.1"}\n');

    assert.deepEqual(select('auto'), {
      'bun-version': '',
      'bun-version-file': `${fixtureRoot}/.bun-version`,
    });
  });

  it('should fall back to .tool-versions in auto mode', () => {
    writeFileSync(join(fixture, '.tool-versions'), 'bun 1.2.2\n');
    writeFileSync(join(fixture, 'package.json'), '{"packageManager":"bun@1.2.1"}\n');

    assert.deepEqual(select('auto'), {
      'bun-version': '',
      'bun-version-file': `${fixtureRoot}/.tool-versions`,
    });
  });

  it('should fall back to package.json in auto mode', () => {
    writeFileSync(join(fixture, 'package.json'), '{"engines":{"bun":">=1.2.0"}}\n');

    assert.deepEqual(select('auto'), {
      'bun-version': '',
      'bun-version-file': `${fixtureRoot}/package.json`,
    });
  });

  it('should skip .tool-versions when it has no Bun entry', () => {
    writeFileSync(join(fixture, '.tool-versions'), 'nodejs 24.0.0\n');
    writeFileSync(join(fixture, 'package.json'), '{"packageManager":"bun@1.2.1"}\n');

    assert.deepEqual(select('auto'), {
      'bun-version': '',
      'bun-version-file': `${fixtureRoot}/package.json`,
    });
  });

  it('should let setup-bun use its latest fallback when no source exists', () => {
    assert.deepEqual(select('auto'), {
      'bun-version': '',
      'bun-version-file': '',
    });
  });

  it('should treat an empty version as auto for compatibility', () => {
    writeFileSync(join(fixture, '.bun-version'), '1.2.3\n');

    assert.deepEqual(select(''), {
      'bun-version': '',
      'bun-version-file': `${fixtureRoot}/.bun-version`,
    });
  });

  it('should ignore BUN_VERSION because setup-bun does not support it', () => {
    assert.deepEqual(select('auto', { ...process.env, BUN_VERSION: '9.9.9' }), {
      'bun-version': '',
      'bun-version-file': '',
    });
  });
});
