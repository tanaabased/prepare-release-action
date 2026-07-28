import semverClean from 'semver/functions/clean.js';

const greatestCommonDivisor = (left, right) => {
  if (right === 0) {
    return left;
  }

  return greatestCommonDivisor(right, left % right);
};

const inferJsonIndent = (content) => {
  const indents = Array.from(
    content.matchAll(/^(?<indent>[ \t]+)(?="[^"\n]+"[ \t]*:)/gm),
    (match) => match.groups?.indent ?? '',
  ).filter(Boolean);

  if (indents.length === 0) {
    return '  ';
  }

  const hasTabs = indents.some((indent) => indent.includes('\t'));
  const hasSpaces = indents.some((indent) => indent.includes(' '));

  if (hasTabs && !hasSpaces) {
    return '\t';
  }

  if (hasTabs && hasSpaces) {
    return '  ';
  }

  const widths = indents.map((indent) => indent.length).filter((width) => width > 0);

  if (widths.length === 0) {
    return '  ';
  }

  const unitWidth = widths.reduce((currentWidth, width) =>
    greatestCommonDivisor(currentWidth, width),
  );

  return unitWidth > 0 ? ' '.repeat(unitWidth) : '  ';
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

const planJsonUpdate = (content, options) => {
  const lineEnding = getLineEnding(content);
  const { endsWithNewline } = splitLines(content);
  let document;

  try {
    document = JSON.parse(content);
  } catch (error) {
    throw new Error(`Could not parse JSON in ${options.file}. ${error.message}`, { cause: error });
  }

  if (document === null || Array.isArray(document) || typeof document !== 'object') {
    throw new Error(`${options.file} must contain a top-level JSON object.`);
  }

  if (!Object.hasOwn(document, 'version')) {
    throw new Error(`Could not find a top-level "version" key in ${options.file}.`);
  }

  document.version = semverClean(options.versionValue);

  let nextContent = JSON.stringify(document, null, inferJsonIndent(content));

  if (lineEnding === '\r\n') {
    nextContent = nextContent.replace(/\n/g, '\r\n');
  }

  if (endsWithNewline) {
    nextContent = `${nextContent}${lineEnding}`;
  }

  return {
    changed: nextContent !== content,
    nextContent,
  };
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const escapeJavaScriptString = (value) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const escapePowerShellString = (value) => value.replace(/`/g, '``').replace(/"/g, '`"');

const escapeShellString = (value) =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');

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

/**
 * Plans a version injection without reading or writing the target file.
 *
 * @param {string} content Existing target content.
 * @param {object} options Resolved version-injector options.
 * @param {(count: number) => void} [onMatches] Optional match-count observer for debug output.
 * @returns {{changed: boolean, nextContent: string}} Planned file result.
 * @throws {Error} When the target cannot be updated unambiguously.
 */
export default (content, options, onMatches = () => {}) => {
  if (options.style === 'json') {
    return planJsonUpdate(content, options);
  }

  const lineEnding = getLineEnding(content);
  const { endsWithNewline, lines } = splitLines(content);
  const styleConfig = getStyleConfig(options.style, options.name, options.versionValue);
  const matches = findMatches(lines, styleConfig.matchers);

  onMatches(matches.length);

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
