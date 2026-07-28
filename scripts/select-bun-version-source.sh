#!/usr/bin/env bash

set -euo pipefail

requested_version="${1:-auto}"
target_root="${2:-.}"

if [[ "$requested_version" != "auto" && -n "$requested_version" ]]; then
  printf 'bun-version=%s\nbun-version-file=\n' "$requested_version"
  exit 0
fi

bun_version_file="${target_root%/}/.bun-version"
tool_versions_file="${target_root%/}/.tool-versions"
package_file="${target_root%/}/package.json"

if [[ -f "$bun_version_file" ]] && grep -q '[^[:space:]]' "$bun_version_file"; then
  printf 'bun-version=\nbun-version-file=%s\n' "$bun_version_file"
  exit 0
fi

if [[ -f "$tool_versions_file" ]] && grep -Eq '^bun[[:space:]]+[^[:space:]]' "$tool_versions_file"; then
  printf 'bun-version=\nbun-version-file=%s\n' "$tool_versions_file"
  exit 0
fi

if [[ -f "$package_file" ]]; then
  printf 'bun-version=\nbun-version-file=%s\n' "$package_file"
  exit 0
fi

printf 'bun-version=\nbun-version-file=\n'
