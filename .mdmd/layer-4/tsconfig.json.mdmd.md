# tsconfig.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tsconfig.json
- Entry: tooling
- Generated At: 2026-10-16T00:58:52.531Z

## Authored
### Purpose
The root TypeScript project: the shared options, with the sample programs under `tests/integration/programs` kept out so that their TypeScript variants are never compiled as this repository's own code.

### Notes
- Arrived on 2025-11-01 with the first benchmark fixture, which had to be excluded from the root compilation; the exclusion moved with the samples to their present home on 2026-09-27. The packages' own `tsconfig.json` files extend `tsconfig.base.json` directly; this file is for the editor and for `tsc` run at the root.
- Gained a Live Doc on 2026-10-16 with the suffix-anywhere defaults ([Turn 9 of the October 15 session](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-9)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `extends` {#symbol-extends}
- Type: key

#### `exclude` {#symbol-exclude}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`tsconfig.base`](./tsconfig.base.json.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
