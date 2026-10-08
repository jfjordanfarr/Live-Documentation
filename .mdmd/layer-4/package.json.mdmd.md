# package.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: package.json
- Generated At: 2026-10-08T16:03:26.314Z

## Authored
### Purpose
The workspace manifest: the four npm workspaces (engine, generator, explorer, cli), the commands that matter (build, lint, the unit, integration and Playwright suites, the Live Docs pipeline, the oracle, the layout lab, the gate) and the development dependencies they share. Nothing is published from here; the package is private and its version stays 0.0.0.

### Notes
- Born 2025-10-16 with the repository. Its scripts are the table in AGENTS.md's "Commands that matter"; each is a `tsx` run of a script under `scripts/`, with this repository's own configuration (`.live-docs.config.json`) and board passed explicitly, so that the product reads configuration and never assumes this workspace's conventions.
- On 2026-10-08 the `pretest:e2e` hook was removed: `test:e2e` builds both bundles itself, and the hook had built them a second time before every run since 2026-09-29.
- This doc is written by the JSON adapter's manifest branch (since 2026-09-28): the package as its one symbol, the workspace packages linked by name, the rest external with their ranges.

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
- `@eslint/js@^9.39.4`
- `@playwright/test@^1.58.2`
- `@sourcegraph/scip-typescript@^0.4.0`
- `@types/node@^25.3.2`
- `@vitest/coverage-v8@^4.1.11`
- `eslint-config-prettier@^10.1.8`
- `eslint-import-resolver-typescript@^4.4.4`
- `eslint-plugin-import@^2.29.1`
- `eslint-plugin-jsdoc@^62.7.1`
- `eslint@^9.39.2`
- `glob@^13.0.6`
- `lz-string@^1.5.0`
- `prettier@^3.8.1`
- `tsx@^4.23.15`
- `typescript-eslint@^8.57.0`
- `typescript@^5.4.0`
- `vitest@^4.1.11`
<!-- LIVE-DOC:END Dependencies -->
