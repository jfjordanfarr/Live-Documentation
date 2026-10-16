# packages/explorer/src/client/views/localView/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/index.ts
- Generated At: 2026-10-16T04:41:10.511Z

## Authored
### Purpose
Public entry point for the Local Map view module. Exposes `createLocalView` factory and re-exports `LocalViewApi`/`LocalViewOptions` types.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-04.md]

### Notes
- Created 2025-12-04 as the barrel export for the modular localView directory.
- Delegates to `LocalViewController` for implementation.
- `retainSymbol` (2026-10-14): a symbol pinned unless it is already, alone or with its whole file; what the search bar chose, never a toggle.
- `isShown` and `show` (2026-10-16): whether the map is the view shown, and the map shown again, the owed render's two doors for the application's view switch.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createLocalView` {#symbol-createlocalview}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/index.ts#L5)
- Returns: [`LocalViewApi`](./types.ts.mdmd.md#symbol-localviewapi)
- Parameters: `options`: [`LocalViewOptions`](./types.ts.mdmd.md#symbol-localviewoptions)

##### `createLocalView` — Summary
Creates a Local Map view backed by a {@link LocalViewController}.

#### `LocalViewApi` {#symbol-localviewapi}
- Type: unknown
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/index.ts#L32)

#### `LocalViewOptions` {#symbol-localviewoptions}
- Type: unknown
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/index.ts#L32)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller)
- [`types.LocalViewApi`](./types.ts.mdmd.md#symbol-localviewapi) (type-only)
- [`types.LocalViewOptions`](./types.ts.mdmd.md#symbol-localviewoptions) (type-only)
<!-- LIVE-DOC:END Dependencies -->
