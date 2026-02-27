## {{ UNRELEASED_VERSION }} - [{{ UNRELEASED_DATE }}]({{ UNRELEASED_LINK }})

## v1.1.1 - [February 27, 2026](https://github.com/tanaabased/prepare-release-action/releases/tag/v1.1.1)

- Removed opinionated `v` prefix from default `sync-message` [#8](https://github.com/tanaabased/prepare-release-action/pull/8)

## v1.1.0 - [February 27, 2026](https://github.com/tanaabased/prepare-release-action/releases/tag/v1.1.0)

- Added a `sync-verified` input to optionally create sync commits through GitHub with verified signatures. [#6](https://github.com/tanaabased/prepare-release-action/pull/6)
- Removed the `lando-plugin` input and deleted Lando-specific release logic, helpers, and tests. [#5](https://github.com/tanaabased/prepare-release-action/pull/5)
- Removed the unused `@actions/github` dependency after eliminating release-context handling. [#5](https://github.com/tanaabased/prepare-release-action/pull/5)
- Switched verified sync commit creation to GraphQL `createCommitOnBranch` with base64-encoded file additions. [#6](https://github.com/tanaabased/prepare-release-action/pull/6)
- Updated sync test workflows to validate unsigned (`sync-test`) and verified (`sync-test-verified`) branch flows. [#6](https://github.com/tanaabased/prepare-release-action/pull/6)
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
