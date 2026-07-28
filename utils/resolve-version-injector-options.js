import parser from 'yargs-parser';

const normalizeEnvValue = (value) => {
  if (value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
};

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

const parseArgs = (rawArgv) =>
  parser(normalizeRawArgv(rawArgv), {
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

const buildEnvironment = (env) =>
  Object.freeze({
    insert: normalizeEnvValue(env.VERSION_INJECTOR_INSERT),
    name: normalizeEnvValue(env.VERSION_INJECTOR_NAME),
    style: normalizeEnvValue(env.VERSION_INJECTOR_STYLE),
    versionValue:
      env.VERSION_INJECTOR_VERSION === undefined ? null : String(env.VERSION_INJECTOR_VERSION),
  });

/**
 * Resolves raw version-injector arguments using CLI, environment, then default precedence.
 *
 * @param {string[]} rawArgv Raw command-line arguments.
 * @param {object} [context] Resolution context.
 * @param {boolean} [context.debug=false] Resolved debug state.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} [context.env=process.env] Environment values.
 * @returns {{argv: object, options: object}} Parsed arguments and normalized invocation options.
 * @throws {Error} When arguments contain an unknown option or multiple file paths.
 */
export default (rawArgv, { debug = false, env = process.env } = {}) => {
  const argv = parseArgs(rawArgv);
  const environment = buildEnvironment(env);
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
    argv,
    options: {
      check: argv.check ?? false,
      debug,
      dryRun: argv['dry-run'] ?? false,
      environment,
      file: positionals[0] ?? null,
      help: argv.help === true,
      insert: argv.insert ?? environment.insert ?? null,
      insertConfigured: argv.insert !== undefined || environment.insert !== null,
      name: argv.name ?? environment.name ?? 'SCRIPT_VERSION',
      nameConfigured: argv.name !== undefined || environment.name !== null,
      showCliVersion: argv['show-cli-version'] === true,
      style: argv.style ?? environment.style ?? null,
      versionValue: argv['inject-version'] ?? environment.versionValue ?? null,
    },
  };
};
