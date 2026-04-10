## {{ UNRELEASED_VERSION }} - [{{ UNRELEASED_DATE }}]({{ UNRELEASED_LINK }})

## v24263370586.47.1-build.4c37478db85ba2a3175c817b936c817c59d6c26f - [April 10, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v24263173903.44.1-build.0c12a5d442314b36373776ef97593c7b7ff172e2 - [April 10, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v24263095759.43.1-build.454034ecb1aa07a1ebe15e1c7b784f60f54b9353 - [April 10, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v24262384103.42.1-build.d5f767d0e13fe2b6be06cad7f87154c9af5437ee - [April 10, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v24034108564.35.1-build.32cc6e6a03b00729e5e33fa567ead38c0bde0721 - [April 6, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v23440675719.34.1-build.5b23b5c9d035cf75f96189915aece1e2ac97d64f - [March 23, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v23147189050.33.1-build.e3f46bb0ff0e2d7bb27dc84a56f6ed15f3730da1 - [March 16, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v23089630893.32.1-build.5dba3484e29dfa17cbbcdbfd8b54c3ef4777a0d1 - [March 14, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v23089235556.31.1-build.63e25bb58041f15d45ffb32417026e25447f9594 - [March 14, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v23060923011.30.1-build.a5519099e15563e7183cfa11802d9621223e1034 - [March 13, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v23060722186.29.1-build.b6d0d8dac6795e4e2e636f66323abd9a3c862e4b - [March 13, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v23055995603.28.1-build.256e437237ba373f0926d4f9ad67ad5d6aca2e14 - [March 13, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v23055896281.27.1-build.cf4c9f409fed8966282184b623a6e25cc3554f1a - [March 13, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v23055484702.26.1-build.f39bd377718d7d83878031c5781634bfe752a6cd - [March 13, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v22493284770.25.1-build.228387c5f3897ba9a7139681dd324f92bcdc1052 - [February 27, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v22492853162.24.1-build.77f4b3898e6e590b0ff3c645654b0615f2bfdbe6 - [February 27, 2026](git://github.com/tanaabased/prepare-release-action.git)

## v22492692043.22.1-build.92d82af87576e01cda8db776379f01a596fb481d - [February 27, 2026](git://github.com/tanaabased/prepare-release-action.git)

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
