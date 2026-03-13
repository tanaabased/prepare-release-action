#!/usr/bin/env bun

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { format, inspect } from 'node:util';

import ansis from 'ansis';
import Debug from 'debug';
import parser from 'yargs-parser';

import getScriptVersion from '../utils/get-script-version.js';

const CLI_NAME = 'version-injector';
const DEBUG_NAMESPACE = 'version-injector';
const color = ansis.extend({
  tp: '#00c88a',
  ts: '#db2777',
});
const { bold, dim, green, red, tp, ts } = color;
const validInsertions = new Set(['after-shebang', 'top', 'bottom']);
const validStyles = new Set(['js', 'sh', 'ps1']);

let SCRIPT_VERSION;

if (!SCRIPT_VERSION) {
  SCRIPT_VERSION = getScriptVersion();
}

const debug = Debug(DEBUG_NAMESPACE);

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

const configureDebug = (rawArgv) => {
  const debugPattern = normalizeEnvValue(process.env.DEBUG);
  const toolDebug = normalizeEnvValue(process.env.VERSION_INJECTOR_DEBUG);
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

  if (process.env.RUNNER_DEBUG === '1') {
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

const displayValue = (value, fallback = 'none') => {
  return value === null ? fallback : value;
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const escapeJavaScriptString = (value) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const escapePowerShellString = (value) => value.replace(/`/g, '``').replace(/"/g, '`"');

const escapeShellString = (value) =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');

const normalizeRawArgv = (rawArgv) => {
  const normalized = [];

  for (let index = 0; index < rawArgv.length; index += 1) {
    const token = rawArgv[index];

    if (token === '--version') {
      const nextValue = rawArgv[index + 1];

      if (nextValue === undefined || nextValue.startsWith('-')) {
        normalized.push('--show-cli-version');
      } else {
        normalized.push('--inject-version', nextValue);
        index += 1;
      }

      continue;
    }

    if (token.startsWith('--version=')) {
      const value = token.slice('--version='.length);

      if (value === '') {
        throw new Error('Missing value for --version.');
      }

      normalized.push(`--inject-version=${value}`);
      continue;
    }

    normalized.push(token);
  }

  return normalized;
};

const parseArgs = (rawArgv) => {
  return parser(normalizeRawArgv(rawArgv), {
    alias: {
      help: ['h'],
    },
    boolean: ['check', 'debug', 'dry-run', 'help', 'show-cli-version'],
    string: ['inject-version', 'insert', 'name', 'style'],
    configuration: {
      'boolean-negation': true,
      'camel-case-expansion': false,
      'parse-numbers': false,
      'strip-aliased': true,
      'strip-dashed': true,
    },
  });
};

const buildDefaults = () =>
  Object.freeze({
    check: false,
    dryRun: false,
    insert: null,
    name: 'SCRIPT_VERSION',
    style: null,
    versionValue: null,
  });

const buildEnvironment = () =>
  Object.freeze({
    insert: normalizeEnvValue(process.env.VERSION_INJECTOR_INSERT),
    name: normalizeEnvValue(process.env.VERSION_INJECTOR_NAME),
    style: normalizeEnvValue(process.env.VERSION_INJECTOR_STYLE),
    versionValue:
      process.env.VERSION_INJECTOR_VERSION === undefined
        ? null
        : String(process.env.VERSION_INJECTOR_VERSION),
  });

const buildEnvironmentVariables = () => {
  return [
    'VERSION_INJECTOR_DEBUG',
    'VERSION_INJECTOR_INSERT',
    'VERSION_INJECTOR_NAME',
    'VERSION_INJECTOR_STYLE',
    'VERSION_INJECTOR_VERSION',
  ];
};

const formatHelpEntries = (entries) => {
  const width = entries.reduce((maxWidth, entry) => Math.max(maxWidth, entry.label.length), 0);

  return entries.map((entry) => `  ${entry.label.padEnd(width)}  ${entry.description}`).join('\n');
};

const formatHelpLines = (lines) => {
  return lines.map((line) => `  ${line}`).join('\n');
};

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
      description: `sets the variable name to update ${dim('[default: SCRIPT_VERSION]')}`,
    },
    {
      label: '--style <js|sh|ps1>',
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
    `Usage: ${dim('[VERSION_INJECTOR=...]')} ${bold(`${CLI_NAME} <file> --style <js|sh|ps1> --version <value>`)} ${dim('[options]')}`,
    '',
    'Inject a version assignment into a JavaScript, shell, or PowerShell file.',
    '',
    `${tp('Options')}:`,
    formatHelpEntries(options),
    '',
    `${tp('Environment Variables')}:`,
    formatHelpLines(buildEnvironmentVariables()),
  ].join('\n');
};

const resolveInvocation = (argv) => {
  const defaults = buildDefaults();
  const environment = buildEnvironment();
  const allowedKeys = new Set([
    '_',
    'check',
    'debug',
    'dry-run',
    'help',
    'inject-version',
    'insert',
    'name',
    'show-cli-version',
    'style',
  ]);
  const unknownKey = Object.keys(argv).find((key) => !allowedKeys.has(key));

  if (unknownKey) {
    throw new Error(`Unknown option --${unknownKey}.`);
  }

  const positionals = argv._.map((value) => String(value));

  if (positionals.length > 1) {
    throw new Error(
      `Unexpected positional argument ${positionals[1]}. Only one file path is supported.`,
    );
  }

  return {
    check: argv.check ?? defaults.check,
    debug: debug.enabled,
    dryRun: argv['dry-run'] ?? defaults.dryRun,
    environment,
    file: positionals[0] ?? null,
    help: argv.help === true,
    insert: argv.insert ?? environment.insert ?? defaults.insert,
    name: argv.name ?? environment.name ?? defaults.name,
    showCliVersion: argv['show-cli-version'] === true,
    style: argv.style ?? environment.style ?? defaults.style,
    versionValue: argv['inject-version'] ?? environment.versionValue ?? defaults.versionValue,
  };
};

const validateArgs = (options) => {
  if (options.file === null) {
    throw new Error('Missing required file path.');
  }

  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(options.name)) {
    throw new Error(`Invalid variable name ${options.name}.`);
  }

  if (options.style === null) {
    throw new Error('Missing required option --style.');
  }

  if (!validStyles.has(options.style)) {
    throw new Error(`Invalid --style ${options.style}. Expected one of js, sh, ps1.`);
  }

  if (options.versionValue === null) {
    throw new Error('Missing required option --version <value>.');
  }

  if (options.insert !== null && !validInsertions.has(options.insert)) {
    throw new Error(
      `Invalid --insert ${options.insert}. Expected one of after-shebang, top, bottom.`,
    );
  }
};

const getLineEnding = (content) => (content.includes('\r\n') ? '\r\n' : '\n');

const splitLines = (content) => {
  if (content === '') {
    return { endsWithNewline: false, lines: [] };
  }

  const normalized = content.replace(/\r\n/g, '\n');
  const endsWithNewline = normalized.endsWith('\n');
  const body = endsWithNewline ? normalized.slice(0, -1) : normalized;
  const lines = body === '' ? [] : body.split('\n');

  return { endsWithNewline, lines };
};

const joinLines = (lines, lineEnding, endsWithNewline) => {
  const content = lines.join(lineEnding);
  return endsWithNewline && lines.length > 0 ? `${content}${lineEnding}` : content;
};

const getStyleConfig = (style, name, versionValue) => {
  if (style === 'js') {
    return {
      matchers: [
        new RegExp(`^(?<indent>\\s*)(?:let|var)\\s+${escapeRegExp(name)}\\s*;\\s*$`),
        new RegExp(`^(?<indent>\\s*)(?:const|let|var)\\s+${escapeRegExp(name)}\\s*=\\s*.+;\\s*$`),
      ],
      renderLine: (indent = '') =>
        `${indent}const ${name} = '${escapeJavaScriptString(versionValue)}';`,
    };
  }

  if (style === 'sh') {
    return {
      matchers: [new RegExp(`^(?<indent>\\s*)${escapeRegExp(name)}=.*$`)],
      renderLine: (indent = '') => `${indent}${name}="${escapeShellString(versionValue)}"`,
    };
  }

  return {
    matchers: [new RegExp(`^(?<indent>\\s*)\\$${escapeRegExp(name)}\\s*=\\s*(?:\\$null|.+)\\s*$`)],
    renderLine: (indent = '') => `${indent}$${name} = "${escapePowerShellString(versionValue)}"`,
  };
};

const findMatches = (lines, matchers) => {
  const matches = [];

  for (const [index, line] of lines.entries()) {
    for (const matcher of matchers) {
      const match = line.match(matcher);

      if (match) {
        matches.push({
          indent: match.groups?.indent ?? '',
          index,
        });
        break;
      }
    }
  }

  return matches;
};

const applyInsertion = (lines, renderedLine, insert) => {
  if (insert === 'top') {
    return [renderedLine, ...lines];
  }

  if (insert === 'bottom') {
    return [...lines, renderedLine];
  }

  if (lines[0]?.startsWith('#!')) {
    return [lines[0], renderedLine, ...lines.slice(1)];
  }

  throw new Error('Cannot use --insert after-shebang on a file without a shebang line.');
};

const planUpdate = (content, options) => {
  const lineEnding = getLineEnding(content);
  const { endsWithNewline, lines } = splitLines(content);
  const styleConfig = getStyleConfig(options.style, options.name, options.versionValue);
  const matches = findMatches(lines, styleConfig.matchers);

  trace(
    'matched %d candidate line%s in %s',
    matches.length,
    matches.length === 1 ? '' : 's',
    options.file,
  );

  if (matches.length > 1) {
    throw new Error(
      `Found multiple ${options.name} assignments or placeholders in ${options.file}; refusing to choose one.`,
    );
  }

  const nextLines = [...lines];

  if (matches.length === 1) {
    const match = matches[0];
    nextLines[match.index] = styleConfig.renderLine(match.indent);
  } else if (options.insert !== null) {
    const renderedLine = styleConfig.renderLine();
    const insertedLines = applyInsertion(nextLines, renderedLine, options.insert);

    return {
      changed: joinLines(insertedLines, lineEnding, endsWithNewline) !== content,
      nextContent: joinLines(insertedLines, lineEnding, endsWithNewline),
    };
  } else {
    throw new Error(
      `Could not find an existing ${options.name} assignment or placeholder in ${options.file}.`,
    );
  }

  const nextContent = joinLines(nextLines, lineEnding, endsWithNewline);

  return {
    changed: nextContent !== content,
    nextContent,
  };
};

const runCli = async (options) => {
  validateArgs(options);

  const targetPath = path.resolve(options.file);

  trace('running %s.js script version: %s', CLI_NAME, SCRIPT_VERSION);
  trace(
    'resolved file=%s style=%s name=%s insert=%s check=%s dry-run=%s',
    targetPath,
    options.style,
    options.name,
    displayValue(options.insert),
    options.check,
    options.dryRun,
  );

  let content;

  try {
    content = await fs.readFile(targetPath, 'utf8');
  } catch (error) {
    throw new Error(`Could not read ${targetPath}. ${error.message}`, { cause: error });
  }

  const result = planUpdate(content, { ...options, file: targetPath });

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

const main = async (rawArgv) => {
  configureDebug(rawArgv);
  const argv = parseArgs(rawArgv);
  const invocation = resolveInvocation(argv);

  if (invocation.help) {
    log(renderHelp());
    return;
  }

  if (invocation.showCliVersion) {
    if (
      invocation.file !== null ||
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

    log(SCRIPT_VERSION);
    return;
  }

  await runCli(invocation);
};

await main(process.argv.slice(2)).catch((error) => {
  trace(error);
  fail(error instanceof Error ? error.message : String(error));
});
