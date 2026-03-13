#!/usr/bin/env bun

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ANSI_PATTERN = new RegExp(String.raw`\u001B\[[0-9;]*m`, 'g');
const CLI_NAME = 'version-injector';
const CSI = '\u001B[';
const DEBUG_NAMESPACE = 'version-injector';
const here = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.join(here, '..', 'package.json');
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
const validInsertions = new Set(['after-shebang', 'top', 'bottom']);
const validStyles = new Set(['js', 'sh', 'ps1']);

const supportsColor = (stream = process.stdout) => {
  const forceColor = process.env.FORCE_COLOR;

  if (forceColor !== undefined) {
    return !['0', 'false'].includes(forceColor.toLowerCase());
  }

  if (process.env.NO_COLOR !== undefined) {
    return false;
  }

  return Boolean(stream?.isTTY);
};

const applyAnsi = (code, text, stream = process.stdout) => {
  const value = String(text);

  if (!supportsColor(stream)) {
    return value;
  }

  return `${CSI}${code}m${value}${CSI}0m`;
};

const hexToRgb = (hex) => {
  const normalized = hex.replace(/^#/, '');

  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    throw new Error(`Invalid hex color ${hex}.`);
  }

  return {
    blue: Number.parseInt(normalized.slice(4, 6), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    red: Number.parseInt(normalized.slice(0, 2), 16),
  };
};

const applyRgb = (hex, text, stream = process.stdout) => {
  const value = String(text);

  if (!supportsColor(stream)) {
    return value;
  }

  const { red, green, blue } = hexToRgb(hex);
  return `${CSI}38;2;${red};${green};${blue}m${value}${CSI}0m`;
};

const stripAnsi = (value) => String(value).replaceAll(ANSI_PATTERN, '');

const bold = (text, stream = process.stdout) => applyAnsi('1', text, stream);
const dim = (text, stream = process.stdout) => applyAnsi('2', text, stream);
const green = (text, stream = process.stdout) => applyAnsi('32', text, stream);
const red = (text, stream = process.stdout) => applyAnsi('31', text, stream);
const tp = (text, stream = process.stdout) => applyRgb('#00c88a', text, stream);
const ts = (text, stream = process.stdout) => applyRgb('#db2777', text, stream);

const writeLine = (stream, message = '') => {
  stream.write(`${message}\n`);
};

const writeStatus = (stream, label, colorize, message = '') => {
  const prefix = bold(colorize(label, stream), stream);
  const line = message ? `${prefix} ${message}` : prefix;
  stream.write(`${line}\n`);
};

const log = (message = '') => {
  writeLine(process.stdout, message);
};

const note = (message = '') => {
  writeStatus(process.stdout, 'note', ts, message);
};

const success = (message = '') => {
  writeStatus(process.stdout, 'done', green, message);
};

const fail = (message) => {
  writeStatus(process.stderr, 'error', red, message);
  process.exit(1);
};

const debugPatternMatches = (pattern, namespace) => {
  if (!pattern) {
    return false;
  }

  if (pattern === '1' || pattern === '*') {
    return true;
  }

  if (pattern.endsWith('*')) {
    return namespace.startsWith(pattern.slice(0, -1));
  }

  return pattern === namespace;
};

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

const envDebugEnabled = (namespace) => {
  if (process.env.VERSION_INJECTOR_DEBUG !== undefined) {
    return valueEnabled(process.env.VERSION_INJECTOR_DEBUG);
  }

  if (process.env.RUNNER_DEBUG === '1') {
    return true;
  }

  const rawDebug = process.env.DEBUG;

  if (!rawDebug) {
    return false;
  }

  return rawDebug
    .split(',')
    .map((segment) => segment.trim())
    .some((pattern) => debugPatternMatches(pattern, namespace));
};

const debugLog = (enabled, message = '') => {
  if (!enabled) {
    return;
  }

  const prefix = dim(`[${DEBUG_NAMESPACE}]`, process.stderr);
  writeStatus(process.stderr, 'debug', dim, `${prefix} ${message}`);
};

const displayValue = (value, fallback = 'none') => {
  return value === null ? fallback : value;
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const escapeJavaScriptString = (value) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const escapePowerShellString = (value) => value.replace(/`/g, '``').replace(/"/g, '`"');

const escapeShellString = (value) =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');

const getOptionValue = (args, index, token) => {
  const [name, inlineValue] = token.split(/=(.*)/s, 2);

  if (inlineValue !== undefined) {
    if (inlineValue === '') {
      fail(`Missing value for ${name}.`);
    }

    return { nextIndex: index, value: inlineValue };
  }

  const nextValue = args[index + 1];

  if (nextValue === undefined || nextValue.startsWith('-')) {
    fail(`Missing value for ${name}.`);
  }

  return { nextIndex: index + 1, value: nextValue };
};

const parseArgs = (args) => {
  const parsed = {
    check: false,
    debug: null,
    dryRun: false,
    file: null,
    help: false,
    insert: null,
    name: null,
    showCliVersion: false,
    style: null,
    versionValue: null,
  };

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];

    if (token === '--check') {
      parsed.check = true;
      continue;
    }

    if (token === '--debug') {
      parsed.debug = true;
      continue;
    }

    if (token === '--dry-run') {
      parsed.dryRun = true;
      continue;
    }

    if (token === '--help' || token === '-h') {
      parsed.help = true;
      continue;
    }

    if (token === '--insert' || token.startsWith('--insert=')) {
      const result = getOptionValue(args, index, token);
      parsed.insert = result.value;
      index = result.nextIndex;
      continue;
    }

    if (token === '--name' || token.startsWith('--name=')) {
      const result = getOptionValue(args, index, token);
      parsed.name = result.value;
      index = result.nextIndex;
      continue;
    }

    if (token === '--style' || token.startsWith('--style=')) {
      const result = getOptionValue(args, index, token);
      parsed.style = result.value;
      index = result.nextIndex;
      continue;
    }

    if (token === '--version') {
      const nextValue = args[index + 1];

      if (nextValue === undefined || nextValue.startsWith('-')) {
        parsed.showCliVersion = true;
        continue;
      }

      parsed.versionValue = nextValue;
      index += 1;
      continue;
    }

    if (token.startsWith('--version=')) {
      const result = getOptionValue(args, index, token);
      parsed.versionValue = result.value;
      continue;
    }

    if (token.startsWith('-')) {
      fail(`Unknown option ${token}.`);
    }

    if (parsed.file !== null) {
      fail(`Unexpected positional argument ${token}. Only one file path is supported.`);
    }

    parsed.file = token;
  }

  return parsed;
};

const buildEnvironment = () =>
  Object.freeze({
    debug: envDebugEnabled(DEBUG_NAMESPACE),
    insert: normalizeEnvValue(process.env.VERSION_INJECTOR_INSERT),
    name: normalizeEnvValue(process.env.VERSION_INJECTOR_NAME),
    style: normalizeEnvValue(process.env.VERSION_INJECTOR_STYLE),
    versionValue:
      process.env.VERSION_INJECTOR_VERSION === undefined
        ? null
        : String(process.env.VERSION_INJECTOR_VERSION),
  });

const resolveInvocation = (parsedArgs) => {
  const environment = buildEnvironment();

  return {
    check: parsedArgs.check,
    debug: parsedArgs.debug ?? environment.debug,
    dryRun: parsedArgs.dryRun,
    environment,
    file: parsedArgs.file,
    help: parsedArgs.help,
    insert: parsedArgs.insert ?? environment.insert,
    name: parsedArgs.name ?? environment.name ?? 'SCRIPT_VERSION',
    showCliVersion: parsedArgs.showCliVersion,
    style: parsedArgs.style ?? environment.style,
    versionValue: parsedArgs.versionValue ?? environment.versionValue,
  };
};

const validateArgs = (options) => {
  if (options.file === null) {
    fail('Missing required file path.');
  }

  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(options.name)) {
    fail(`Invalid variable name ${options.name}.`);
  }

  if (options.style === null) {
    fail('Missing required option --style.');
  }

  if (!validStyles.has(options.style)) {
    fail(`Invalid --style ${options.style}. Expected one of js, sh, ps1.`);
  }

  if (options.versionValue === null) {
    fail('Missing required option --version <value>.');
  }

  if (options.insert !== null && !validInsertions.has(options.insert)) {
    fail(`Invalid --insert ${options.insert}. Expected one of after-shebang, top, bottom.`);
  }
};

const formatHelpEntries = (entries) => {
  const width = entries.reduce(
    (maxWidth, entry) => Math.max(maxWidth, stripAnsi(entry.label).length),
    0,
  );

  return entries.map((entry) => `  ${entry.label.padEnd(width)}  ${entry.description}`).join('\n');
};

const formatHelpLines = (lines) => {
  return lines.map((line) => `  ${line}`).join('\n');
};

const renderHelp = () => {
  const environmentVariables = [
    'VERSION_INJECTOR_DEBUG',
    'VERSION_INJECTOR_INSERT',
    'VERSION_INJECTOR_NAME',
    'VERSION_INJECTOR_STYLE',
    'VERSION_INJECTOR_VERSION',
  ];

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
      description: `shows the CLI version`,
    },
  ];

  return [
    `Usage: ${dim(`[VERSION_INJECTOR=...]`)} ${bold(`${CLI_NAME} <file> --style <js|sh|ps1> --version <value>`)} ${dim(`[options]`)}`,
    '',
    'Inject a version assignment into a JavaScript, shell, or PowerShell file.',
    '',
    `${tp('Options')}:`,
    formatHelpEntries(options),
    '',
    `${tp('Environment Variables')}:`,
    formatHelpLines(environmentVariables),
  ].join('\n');
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
        new RegExp(`^(?<indent>\\s*)let\\s+${escapeRegExp(name)}\\s*;\\s*$`),
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

  fail('Cannot use --insert after-shebang on a file without a shebang line.');
};

const planUpdate = (content, options) => {
  const lineEnding = getLineEnding(content);
  const { endsWithNewline, lines } = splitLines(content);
  const styleConfig = getStyleConfig(options.style, options.name, options.versionValue);
  const matches = findMatches(lines, styleConfig.matchers);

  debugLog(
    options.debug,
    `matched ${matches.length} candidate line${matches.length === 1 ? '' : 's'} in ${options.file}`,
  );

  if (matches.length > 1) {
    fail(
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
    fail(
      `Could not find an existing ${options.name} assignment or placeholder in ${options.file}.`,
    );
  }

  const nextContent = joinLines(nextLines, lineEnding, endsWithNewline);

  return {
    changed: nextContent !== content,
    nextContent,
  };
};

const parsedArgs = parseArgs(process.argv.slice(2));
const invocation = resolveInvocation(parsedArgs);

if (invocation.help) {
  log(renderHelp());
  process.exit(0);
}

if (
  invocation.showCliVersion &&
  invocation.file === null &&
  parsedArgs.style === null &&
  parsedArgs.versionValue === null &&
  parsedArgs.insert === null &&
  parsedArgs.name === null &&
  parsedArgs.check === false &&
  parsedArgs.dryRun === false &&
  parsedArgs.debug === null
) {
  log(packageJson.version);
  process.exit(0);
}

if (invocation.showCliVersion) {
  fail(
    'Bare --version only prints the CLI version when no file path or injection options are provided.',
  );
}

validateArgs(invocation);

const targetPath = path.resolve(invocation.file);

debugLog(
  invocation.debug,
  `resolved file=${targetPath} style=${invocation.style} name=${invocation.name} insert=${displayValue(invocation.insert)} check=${invocation.check} dry-run=${invocation.dryRun}`,
);

let content;

try {
  content = await fs.readFile(targetPath, 'utf8');
} catch (error) {
  fail(`Could not read ${targetPath}. ${error.message}`);
}

const result = planUpdate(content, { ...invocation, file: targetPath });

if (invocation.check) {
  if (result.changed) {
    fail(`${ts(targetPath, process.stderr)} does not match the requested version injection.`);
  }

  success(`${tp('check')} ${ts(targetPath)}`);
  process.exit(0);
}

if (invocation.dryRun) {
  note(
    result.changed
      ? `${tp('update')} ${ts(targetPath)} ${dim('(dry run)')}`
      : `${tp('skip')} ${ts(targetPath)} ${dim('(already matches)')}`,
  );
  process.exit(0);
}

if (!result.changed) {
  note(`${tp('skip')} ${ts(targetPath)} ${dim('(already matches)')}`);
  process.exit(0);
}

await fs.writeFile(targetPath, result.nextContent, 'utf8');
success(`${tp('update')} ${ts(targetPath)}`);
