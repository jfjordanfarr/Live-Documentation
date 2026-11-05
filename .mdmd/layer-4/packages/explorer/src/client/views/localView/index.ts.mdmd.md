# packages/explorer/src/client/views/localView/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/index.ts
- Generated At: 2026-11-04T15:03:17.687Z

## Authored
### Purpose
Constructs the 2D Local Map controller and exposes its rendering, camera, path and action-framing API to the application.

### Notes
- The [November 5 reading repair](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-9) forwards the newly retained symbol, when one exists, through the pin transaction. The application identifies that change; the controller owns its scoped reading presentation at the current zoom.
- Created as the public factory and type-export boundary in the [December 4 Local Map modularisation](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-04.SUMMARIZED.md#turn-14-local-map-modularization-the-refactor).
- Every operation delegates to one `LocalViewController`; the getter exposes that controller's existing hover/path store. Consumers use `LocalViewApi` without depending on the controller's mutable runtime.
- The application supplies Inspect, Pin, Centre and directory actions through `LocalViewOptions`, following the [accepted interaction grammar](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24) and [its resumed implementation](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2). This factory forwards the 2D capture/after-render boundary that keeps an acted-on item in place around those shared state changes; it adds no pin, inspection or directory policy of its own.
- `isShown` and `show` (2026-10-16): whether the map is the view shown, and the map shown again, the owed render's two doors for the application's view switch.

Since [November 5](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-1) `captureReadingChange` forwards the control used, so focus can return to a tapped name as well as to a book.

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
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/index.ts#L34)

#### `LocalViewOptions` {#symbol-localviewoptions}
- Type: unknown
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/index.ts#L34)
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
