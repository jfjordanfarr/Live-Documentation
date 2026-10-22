# package.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: package.json
- Entry: tooling
- Generated At: 2026-10-22T18:45:21.347Z

## Authored
### Purpose
The workspace manifest: the four npm workspaces (engine, generator, explorer, cli), the commands that matter (build, lint, the unit, integration and Playwright suites, the Live Docs pipeline, the oracle, the layout lab, the gate) and the development dependencies they share. Nothing is published from here; the package is private and its version stays 0.0.0.

### Notes
- Born 2025-10-16 with the repository. Its scripts are the table in AGENTS.md's "Commands that matter"; each is a `tsx` run of a script under `scripts/`, with this repository's own configuration (`.live-docs.config.json`) and board passed explicitly, so that the product reads configuration and never assumes this workspace's conventions.
- `live-docs:history` (2026-10-17, C1 of [the plan](../../.mdmd/layer-3/change-over-time.mdmd.md)) is the one command that passes no `--config`: it reads the workspace's own configuration, which here is this repository's, so that `--workspace` over another repository reads that repository's or the shipped defaults.
- On 2026-10-08 the `pretest:e2e` hook was removed: `test:e2e` builds both bundles itself, and the hook had built them a second time before every run since 2026-09-29.
- On 2026-10-22 the `format` script went with Prettier, `eslint-config-prettier` and `eslint-plugin-import`; the lint is ESLint 10 with typescript-eslint 8.72, `eslint-plugin-import-x` and `eslint-plugin-jsdoc` 63.3.3, the newest of that plugin whose engines admit the container's Node 22.22.0 ([the decision](../../.mdmd/layer-3/architectural-decisions.mdmd.md#no-formatter-for-typescript-lint-for-correctness-on-eslint-10-and-the-tsconfig-off-baseurl-and-node10-recorded-2026-10-22)).
- `tree-sitter-cli` is pinned exactly (0.27.1, since 2026-10-16) for `packages/engine/grammars/powershell/build.sh`, which builds the engine's own PowerShell grammar; the pin fixes the generator and the wasi-sdk and binaryen the CLI fetches to compile it, so that a rebuild gives the committed wasm byte for byte.
- This doc is written by the JSON adapter's manifest branch (since 2026-09-28): the package as its one symbol, the workspace packages linked by name, the rest external with their ranges.

`live-docs:visualize:history-sample` (2026-10-18, the plan's C4) builds the scripted repository's two bundles for the history specs, and `test:e2e` runs it before Playwright.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `live-documentation` {#symbol-live-documentation}
- Type: package
- Source: [source](../../package.json#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@chenglou/pretext@^0.0.9`
- `@eslint/js@^10.0.1`
- `@playwright/test@^1.58.2`
- `@sourcegraph/scip-typescript@^0.4.0`
- `@types/node@^25.3.2`
- `@vitest/coverage-v8@^4.1.11`
- `eslint-import-resolver-typescript@^4.4.5`
- `eslint-plugin-import-x@^4.17.1`
- `eslint-plugin-jsdoc@^63.3.3`
- `eslint@^10.13.0`
- `glob@^13.0.6`
- `lz-string@^1.5.0`
- `tree-sitter-cli@0.27.1`
- `tsx@^4.23.15`
- `typescript-eslint@^8.72.0`
- `typescript@^5.4.0`
- `vitest@^4.1.11`
<!-- LIVE-DOC:END Dependencies -->
