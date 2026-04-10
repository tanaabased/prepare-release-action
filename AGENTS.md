# Repository Guidance

## Validation

- Default local validation for this repo is `bun run lint`, `bun run test`, and `bun run format:check`.
- Do not run `bun run build` as routine local validation. Build verification belongs to CI for this repo.
- Only run `bun run build` when the user explicitly asks for it or when the task is specifically about `scripts/build.js`, bundled artifact generation, or CI/release build behavior.

## Build Artifacts

- Treat `dist/` and the `dist/version-injector*` shims as CI-generated artifacts, not hand-edited source.
- Prefer changing source files under `bin/`, `utils/`, and the repo root entrypoints instead of patching built files directly.
- If a task would require refreshing committed build artifacts, call that out explicitly before doing it.

## Action Contract

- Keep `action.yml`, `README.md`, source entrypoints, and tests aligned whenever user-facing inputs, outputs, or CLI behavior change.
- Prefer extending existing surfaces such as `commands`, `update-files`, and `version-injector` before adding new top-level action inputs.
- Preserve current release semantics unless the task explicitly changes them, especially `version=dev`, sync behavior, and `package.json`-centric metadata handling.

## Version Injector

- `version-injector` is the repo’s intended escape hatch for stamping extra files during release prep; prefer improving it over adding one-off action inputs for file mutation.
- When changing `version-injector`, add or update focused unit coverage in `test/version-injector.spec.js` and keep README usage examples current.
