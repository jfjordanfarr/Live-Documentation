# packages/explorer/src/client/views/localView/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/index.ts
- Generated At: 2026-10-22T16:47:55.999Z

## Authored
### Purpose
Constructs the 2D Local Map controller and exposes its rendering, camera, path and action-framing API to the application.

### Notes
- Created as the public factory and type-export boundary in the [December 4 Local Map modularisation](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-04.SUMMARIZED.md#turn-14-local-map-modularization-the-refactor).
- Every operation delegates to one `LocalViewController`; the getter exposes that controller's existing hover/path store. Consumers use `LocalViewApi` without depending on the controller's mutable runtime.
- The application supplies Inspect, Pin, Centre and directory actions through `LocalViewOptions`, following the [accepted interaction grammar](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24) and [its resumed implementation](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2). This factory forwards the 2D capture/after-render boundary that keeps an acted-on item in place around those shared state changes; it adds no pin, inspection or directory policy of its own.
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

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
