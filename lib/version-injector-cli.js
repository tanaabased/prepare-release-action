import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { format, inspect } from 'node:util';

import ansis from 'ansis';
import Debug from 'debug';
import semverClean from 'semver/functions/clean.js';

import planVersionInjection from '../utils/plan-version-injection.js';
import resolveVersionInjectorOptions from '../utils/resolve-version-injector-options.js';

const CLI_NAME = 'version-injector';
const DEBUG_NAMESPACE = 'version-injector';
const color = ansis.extend({
  tp: '#00c88a',
  ts: '#db2777',
});
const { bold, dim, green, red, tp, ts } = color;
const debug = Debug(DEBUG_NAMESPACE);
const validInsertions = new Set(['after-shebang', 'top', 'bottom']);
const validStyles = new Set(['js', 'sh', 'ps1', 'json']);

const valueEnabled = (value) => {
  switch (
    String(value ?? '')
      .trim()
      .toLowerCase()
  ) {
    case '':
    case '0':
    case 'false':
    case 'no':
    case 'off':
      return false;
    default:
      return true;
  }
};

const normalizeEnvValue = (value) => {
  if (value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
};

const configureDebug = (rawArgv, env) => {
  const debugPattern = normalizeEnvValue(env.DEBUG);
  const toolDebug = normalizeEnvValue(env.VERSION_INJECTOR_DEBUG);
  const cliDebugEnabled = rawArgv.includes('--debug');
  const cliDebugDisabled = rawArgv.includes('--no-debug');

  if (cliDebugDisabled) {
    Debug.disable();
    return;
  }

  if (cliDebugEnabled) {
    Debug.enable(debugPattern ?? DEBUG_NAMESPACE);
    return;
  }

  if (toolDebug !== null) {
    if (valueEnabled(toolDebug)) {
      Debug.enable(debugPattern ?? DEBUG_NAMESPACE);
    } else {
      Debug.disable();
    }

    return;
  }

  if (env.RUNNER_DEBUG === '1') {
    Debug.enable(debugPattern ?? DEBUG_NAMESPACE);
    return;
  }

  if (debugPattern !== null) {
    Debug.enable(debugPattern);
    return;
  }

  Debug.disable();
};

const normalizeMessage = (message, stream) => {
  if (typeof message === 'string') {
    return message;
  }

  return inspect(message, {
    colors: stream.isTTY,
    depth: 6,
  });
};

const writeLine = (stream, message = '', ...args) => {
  const normalizedMessage = normalizeMessage(message, stream);
  stream.write(`${format(normalizedMessage, ...args)}\n`);
};

const writeStatus = (stream, label, colorize, message = '', ...args) => {
  const normalizedMessage = normalizeMessage(message, stream);
  stream.write(`${bold(colorize(label))} ${format(normalizedMessage, ...args)}\n`);
};

const trace = (message = '', ...args) => {
  if (!debug.enabled) {
    return;
  }

  if (typeof message === 'string') {
    writeStatus(
      process.stderr,
      'debug',
      dim,
      '%s %s',
      dim(`[${DEBUG_NAMESPACE}]`),
      format(message, ...args),
    );
    return;
  }

  writeStatus(process.stderr, 'debug', dim, '%s %O', dim(`[${DEBUG_NAMESPACE}]`), message);
};

const log = (message = '', ...args) => {
  writeLine(process.stdout, message, ...args);
};

const note = (message = '', ...args) => {
  writeStatus(process.stdout, 'note', ts, message, ...args);
};

const success = (message = '', ...args) => {
  writeStatus(process.stdout, 'done', green, message, ...args);
};

const fail = (message = '', exitCode = 1) => {
  writeStatus(process.stderr, 'error', red, message);
  process.exit(exitCode);
};

const displayValue = (value, fallback = 'none') => (value === null ? fallback : value);

const formatHelpEntries = (entries) => {
  const width = entries.reduce((maxWidth, entry) => Math.max(maxWidth, entry.label.length), 0);

  return entries.map((entry) => `  ${entry.label.padEnd(width)}  ${entry.description}`).join('\n');
};

const formatHelpLines = (lines) => lines.map((line) => `  ${line}`).join('\n');

const renderHelp = () => {
  const options = [
    {
      label: '--check',
      description: 'exits non-zero when the file is not already up to date.',
    },
    {
      label: '--dry-run',
      description: 'reports the planned change without writing the file.',
    },
    {
      label: '--insert <position>',
      description: 'inserts a new assignment with after-shebang, top, or bottom.',
    },
    {
      label: '--name <var>',
      description: `sets the variable name to update ${dim('[default: SCRIPT_VERSION]')} ${dim('(not used for json)')}`,
    },
    {
      label: '--style <js|sh|ps1|json>',
      description: 'controls how the assignment line is matched and rendered.',
    },
    {
      label: '--version <value>',
      description: 'sets the version string to write into the file.',
    },
    {
      label: '--debug',
      description: `shows debug output ${dim('[default: off]')}`,
    },
    {
      label: '-h, --help',
      description: 'shows this help output.',
    },
    {
      label: '--version',
      description: 'shows the CLI version.',
    },
  ];

  return [
    `Usage: ${dim('[VERSION_INJECTOR=...]')} ${bold(`${CLI_NAME} <file> --style <js|sh|ps1|json> --version <value>`)} ${dim('[options]')}`,
    '',
    'Inject or update version information in a JavaScript, shell, PowerShell, or JSON file.',
    '',
    `${tp('Options')}:`,
    formatHelpEntries(options),
    '',
    `${tp('Environment Variables')}:`,
    formatHelpLines([
      'VERSION_INJECTOR_DEBUG',
      'VERSION_INJECTOR_INSERT',
      'VERSION_INJECTOR_NAME',
      'VERSION_INJECTOR_STYLE',
      'VERSION_INJECTOR_VERSION',
    ]),
  ].join('\n');
};

const validateOptions = (options) => {
  if (options.file === null) {
    throw new Error('Missing required file path.');
  }

  if (options.style === null) {
    throw new Error('Missing required option --style.');
  }

  if (!validStyles.has(options.style)) {
    throw new Error(`Invalid --style ${options.style}. Expected one of js, sh, ps1, json.`);
  }

  if (options.versionValue === null) {
    throw new Error('Missing required option --version <value>.');
  }

  if (options.style === 'json') {
    if (options.insertConfigured) {
      throw new Error('--insert is not supported with --style json.');
    }

    if (options.nameConfigured) {
      throw new Error('--name is not supported with --style json.');
    }

    if (semverClean(options.versionValue) === null) {
      throw new Error('--style json requires a semver-valid --version value.');
    }

    return;
  }

  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(options.name)) {
    throw new Error(`Invalid variable name ${options.name}.`);
  }

  if (options.insert !== null && !validInsertions.has(options.insert)) {
    throw new Error(
      `Invalid --insert ${options.insert}. Expected one of after-shebang, top, bottom.`,
    );
  }
};

const runInjection = async (options, scriptVersion) => {
  validateOptions(options);

  const targetPath = path.resolve(options.file);

  trace('running %s.js script version: %s', CLI_NAME, scriptVersion);
  trace(
    'resolved file=%s style=%s name=%s insert=%s check=%s dry-run=%s',
    targetPath,
    options.style,
    displayValue(options.style === 'json' ? null : options.name),
    displayValue(options.style === 'json' ? null : options.insert),
    options.check,
    options.dryRun,
  );

  let content;

  try {
    content = await fs.readFile(targetPath, 'utf8');
  } catch (error) {
    throw new Error(`Could not read ${targetPath}. ${error.message}`, { cause: error });
  }

  const result = planVersionInjection(content, { ...options, file: targetPath }, (matchCount) => {
    trace('matched %d candidate line%s in %s', matchCount, matchCount === 1 ? '' : 's', targetPath);
  });

  if (options.check) {
    if (result.changed) {
      throw new Error(`${targetPath} does not match the requested version injection.`);
    }

    success('%s %s', tp('check'), ts(targetPath));
    return;
  }

  if (options.dryRun) {
    note(
      '%s %s %s',
      tp(result.changed ? 'update' : 'skip'),
      ts(targetPath),
      dim(result.changed ? '(dry run)' : '(already matches)'),
    );
    return;
  }

  if (!result.changed) {
    note('%s %s %s', tp('skip'), ts(targetPath), dim('(already matches)'));
    return;
  }

  await fs.writeFile(targetPath, result.nextContent, 'utf8');
  success('%s %s', tp('update'), ts(targetPath));
};

const main = async (rawArgv, scriptVersion, env) => {
  configureDebug(rawArgv, env);
  const { argv, options } = resolveVersionInjectorOptions(rawArgv, {
    debug: debug.enabled,
    env,
  });

  if (options.help) {
    log(renderHelp());
    return;
  }

  if (options.showCliVersion) {
    if (
      options.file !== null ||
      argv.style !== undefined ||
      argv['inject-version'] !== undefined ||
      argv.insert !== undefined ||
      argv.name !== undefined ||
      argv.check === true ||
      argv['dry-run'] === true ||
      argv.debug !== undefined
    ) {
      throw new Error(
        'Bare --version only prints the CLI version when no file path or injection options are provided.',
      );
    }

    log(scriptVersion);
    return;
  }

  await runInjection(options, scriptVersion);
};

/**
 * Runs the version-injector CLI and reports caller-facing failures to stderr.
 *
 * @param {string[]} rawArgv Raw command-line arguments.
 * @param {string} scriptVersion Version reported by the executable entrypoint.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} [env=process.env] Environment values.
 * @returns {Promise<void>}
 */
export default async (rawArgv, scriptVersion, env = process.env) => {
  try {
    await main(rawArgv, scriptVersion, env);
  } catch (error) {
    trace(error);
    fail(error instanceof Error ? error.message : String(error));
  }
};
