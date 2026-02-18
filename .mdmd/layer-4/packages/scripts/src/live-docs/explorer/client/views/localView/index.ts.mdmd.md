# packages/scripts/src/live-docs/explorer/client/views/localView/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/index.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-index-ts
- Generated At: 2026-02-18T21:27:51.652Z

## Authored
### Purpose
Public entry point for the Local Map view module. Exposes `createLocalView` factory and re-exports `LocalViewApi`/`LocalViewOptions` types.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-04.md]

### Notes
- Created 2025-12-04 as the barrel export for the modular localView directory.
- Delegates to `LocalViewController` for implementation.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:51.652Z","inputHash":"0546ceea4aca2e8c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createLocalView` {#symbol-createlocalview}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/index.ts#L5)
- Returns: [`LocalViewApi`](./types.ts.mdmd.md#symbol-localviewapi)
- Parameters: `options`: [`LocalViewOptions`](./types.ts.mdmd.md#symbol-localviewoptions)

##### `createLocalView` — Summary
Creates a Local Map view backed by a {@link LocalViewController}.

#### `LocalViewApi` {#symbol-localviewapi}
- Type: unknown
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/index.ts#L26)

#### `LocalViewOptions` {#symbol-localviewoptions}
- Type: unknown
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/index.ts#L26)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller)
- [`types.LocalViewApi`](./types.ts.mdmd.md#symbol-localviewapi) (type-only)
- [`types.LocalViewOptions`](./types.ts.mdmd.md#symbol-localviewoptions) (type-only)
<!-- LIVE-DOC:END Dependencies -->
