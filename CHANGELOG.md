## {{ UNRELEASED_VERSION }} - [{{ UNRELEASED_DATE }}]({{ UNRELEASED_LINK }})

## v22492216191.21.1-build.d19537adc344bb71e7b4bf8c2e0fd96171e36cb4 - [February 27, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v22491601079.20.1-build.d3aec9e62c3ff3ce9e88d20ab3bfdcdcd4c17810 - [February 27, 2026](git://github.com/tanaabased/prepare-release-action.git)

- Removed the `lando-plugin` input and deleted Lando-specific release logic, helpers, and tests. [#5](https://github.com/tanaabased/prepare-release-action/pull/5)
- Removed the unused `@actions/github` dependency after eliminating release-context handling. [#5](https://github.com/tanaabased/prepare-release-action/pull/5)
- Updated workflows and documentation to drop `lando-plugin` usage and examples. [#5](https://github.com/tanaabased/prepare-release-action/pull/5)

## v1.0.0 - [February 26, 2026](https://github.com/tanaabased/prepare-release-action/releases/tag/v1.0.0)

- Added Bun runtime support files, including `.bun-version` and `bun.lock`. [#4](https://github.com/tanaabased/prepare-release-action/pull/4)
- Added comprehensive Mocha unit tests for every module in `utils/`. [#4](https://github.com/tanaabased/prepare-release-action/pull/4)
- Converted the action source and utility modules from CommonJS to ESM syntax. [#4](https://github.com/tanaabased/prepare-release-action/pull/4)
- Introduced per-file coverage enforcement and a `test` script with Mocha and `c8`. [#4](https://github.com/tanaabased/prepare-release-action/pull/4)
- Replaced `@vercel/ncc` bundling with `bun build` and regenerated distribution artifacts. [#4](https://github.com/tanaabased/prepare-release-action/pull/4)
- Switched repository tooling and GitHub Actions workflows from Node/npm to Bun. [#4](https://github.com/tanaabased/prepare-release-action/pull/4)
- Updated action runtime plumbing and documentation to use Bun-native commands. [#4](https://github.com/tanaabased/prepare-release-action/pull/4)
- Updated package and automation metadata to remove Node-specific versioning and lockfile settings. [#4](https://github.com/tanaabased/prepare-release-action/pull/4)

## v0.1.0

- Moved over from [@lando/prepare-release-action](https://github.com/lando/prepare-release-action)
