# packages/explorer/src/client/persistence/url-state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/persistence/url-state.ts
- Generated At: 2026-10-12T19:35:22.059Z

## Authored
### Purpose
Manages URL-based state persistence for the Explorer. Parses initial state from URL parameters and updates the URL as users navigate, enabling shareable deep links to specific artifacts and views.

### Notes
- Extracted from client/index.ts on 2025-12-19. The `parseInitialState()` and `updateUrlState()` functions work together to maintain URL and state synchronization without page reloads.
- The original query parser was extracted on December 19, 2025. Current links explicitly name the navigation view and Local Map mode; the caller chooses World Map for fresh board-backed bundles.
- The viewer-configuration fallback in `parseInitialState()` went on 2026-09-28: nothing wrote one.
- `?dir=<path>` (2026-10-08): the door into a directory with no file in focus, read into `InitialUrlState.openDirectories` beside a snapshot's `d`; a trailing slash is dropped. Once the person acts, the opened set rides the compressed exploration state.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `InitialUrlState` {#symbol-initialurlstate}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/url-state.ts#L11)

##### `InitialUrlState` — Summary
Navigation read from an address. An omitted perspective outside Local Map uses the saved preference.

#### `parseNavigation` {#symbol-parsenavigation}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/url-state.ts#L20)
- Returns: [`InitialUrlState`](#symbol-initialurlstate)

##### `parseNavigation` — Summary
Parse an address without consulting browser storage; an explicit Local Map link owns its representation.

#### `parseInitialState` {#symbol-parseinitialstate}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/url-state.ts#L44)

##### `parseInitialState` — Summary
URL navigation takes precedence over saved navigation. A board chooses World Map on a fresh visit.

#### `updateUrlState` {#symbol-updateurlstate}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/url-state.ts#L47)
- Parameters: `view`: [`ViewName`](../types.ts.mdmd.md#symbol-viewname); `perspective`: [`LocalMapPerspective`](../types.ts.mdmd.md#symbol-localmapperspective)

##### `updateUrlState` — Summary
Write view, subject and representation together, preserving paths and exploration state.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`compressed-url-state.compressSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`compressed-url-state.decompressSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`history.commitUrl`](./history.ts.mdmd.md#symbol-commiturl)
- [`navigation.readPerspective`](./navigation.ts.mdmd.md#symbol-readperspective)
- [`navigation.readView`](./navigation.ts.mdmd.md#symbol-readview)
- [`types.LocalMapPerspective`](../types.ts.mdmd.md#symbol-localmapperspective) (type-only)
- [`types.ViewName`](../types.ts.mdmd.md#symbol-viewname) (type-only)
<!-- LIVE-DOC:END Dependencies -->
