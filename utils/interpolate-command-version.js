const resolvedVersionPattern =
  /\$(?:\{PREPARE_RELEASE_VERSION\}|PREPARE_RELEASE_VERSION(?![A-Za-z0-9_]))/g;

export default (command, version) => command.replace(resolvedVersionPattern, version);
