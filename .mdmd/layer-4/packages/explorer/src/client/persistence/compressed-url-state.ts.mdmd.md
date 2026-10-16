# packages/explorer/src/client/persistence/compressed-url-state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/persistence/compressed-url-state.ts
- Generated At: 2026-10-16T21:14:09.006Z

## Authored
### Purpose

Encodes portable exploration state: navigation view, Local Map representation and 3D layout, selected file, pins, opened directories, the path's destination and display filters. Reads earlier snapshots so existing links remain useful.

### Notes

- Originated in Step 9 of the [March 23 Membrane Map implementation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md), using lz-string for comprehensive shareable state.
- [View consolidation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-4) introduced version 2. Version 1 Force Graph views become Local Map in 3D; Membrane/Circuit views become 2D, with their deepest opened directories retained. Retired camera and expanded-card fields are no longer emitted.
- Explicit snapshots are always written, including an empty Local Map: a bare URL may instead land on a board. The data-source parameter survives writes. Missing files, directories and pins are scrubbed against the current graph, and so is a destination whose file is gone or whose directory holds no live file.
- The path's destination (2026-10-14, [Turn 6](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)) rides the snapshot as `x`: a file `n` with perhaps one symbol `s`, or a directory `d`. The path starts at the newest pin, which the snapshot already carries, so the four loose parameters `from`, `to`, `fromSymbol` and `toSymbol` that rode beside it, and the `preservePath` option that kept them, are gone.
- The 3D layout (2026-10-14) rides the snapshot as `y`, written only for the structure layout. The directory flags `g` and `j` of that morning went with the checkboxes they served, unread rather than migrated: the owner said not to sweat backwards compatibility before a release.

Optional layout settings carry both representations’ packing and spatial encoding controls, including Custom values. The optional related-documentation flag makes that force-graph input portable too. Earlier links without these fields retain existing preferences. Numeric settings are validated against their control ranges and increments before application. This supports [the shared-preset design](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

- Version 3 (2026-10-16): the snapshot's default filters are the cold start's, tests shown and assets hidden, taken from `getDefaultFilters`, which governs a page opened without an address; the default had said assets shown, so every link the page wrote carried `f` to hide them. A version 3 link omits `f` when the filters are the default's; an older link without `f` still reads as both shown, which is what it meant when it was written.
- `reachFrom` (payload key `a`, 2026-10-15): the file or directory the Knowledge Sources panel walks from in place of the entry points, written and read like the path's destination and scrubbed like it when the bundle no longer holds it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CompressedPayload` {#symbol-compressedpayload}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L47)

##### `CompressedPayload` — Summary
The JSON structure compressed into the `?s=` parameter.

All fields except `v` are optional — omitted fields use defaults.
Key naming convention: single-letter or short abbreviation to
minimize serialized size while remaining readable in code.

#### `UrlStateSnapshot` {#symbol-urlstatesnapshot}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L89)

##### `UrlStateSnapshot` — Summary
Application-level state snapshot that maps 1:1 with the URL.
This is what the controller produces and consumes; the
{@link CompressedPayload} is the wire format.

#### `DEFAULT_SNAPSHOT` {#symbol-default_snapshot}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L115)
- Returns: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `DEFAULT_SNAPSHOT` — Summary
Default state for cold start (no URL parameter). Its filters are the cold start's own, tests shown and assets hidden:
a page opened without an address reads `getDefaultFilters`, so a link that omits the filters shows what a fresh page
shows (2026-10-16; until then this said assets shown and every written link carried them hidden).

#### `snapshotToPayload` {#symbol-snapshottopayload}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L133)
- Returns: [`CompressedPayload`](#symbol-compressedpayload)
- Parameters: `snapshot`: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `snapshotToPayload` — Summary
Convert a snapshot into a compact JSON payload.
Omits fields that match defaults to keep the output small.

#### `payloadToSnapshot` {#symbol-payloadtosnapshot}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L185)
- Returns: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)
- Parameters: `payload`: [`CompressedPayload`](#symbol-compressedpayload)

##### `payloadToSnapshot` — Summary
Convert a compact JSON payload back into a typed snapshot.
Applies version migrations and defaults for missing fields.

#### `compressSnapshot` {#symbol-compresssnapshot}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L229)
- Parameters: `snapshot`: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `compressSnapshot` — Summary
Compress a snapshot into a URL-safe string.

#### `decompressSnapshot` {#symbol-decompresssnapshot}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L238)
- Returns: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `decompressSnapshot` — Summary
Decompress a URL-safe string back into a snapshot.
Returns the default snapshot if decompression or parsing fails.

#### `scrubSnapshot` {#symbol-scrubsnapshot}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L258)
- Returns: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)
- Parameters: `snapshot`: [`UrlStateSnapshot`](#symbol-urlstatesnapshot); `nodesById`: `ReadonlyMap`

##### `scrubSnapshot` — Summary
Scrub a snapshot against the live node set, dropping references to
nodes/directories that no longer exist. This prevents stale shared
URLs from producing empty treemaps, zombie pins, or orphan cards.

Pure function — returns a new snapshot; does not mutate the input.

#### `readUrlState` {#symbol-readurlstate}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L314)
- Returns: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `readUrlState` — Summary
Read the current URL and extract a state snapshot.
Falls back to defaults if no `?s=` parameter is present.

#### `writeUrlState` {#symbol-writeurlstate}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L325)
- Parameters: `snapshot`: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `writeUrlState` — Summary
Write a state snapshot into the URL without reloading the page; the history decides whether it is a new entry.
Preserves the `?data=` parameter if present (used for custom data sources).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `lz-string` - `compressToEncodedURIComponent`, `decompressFromEncodedURIComponent`
- [`layout-presets.LayoutSettings`](../layout-presets.ts.mdmd.md#symbol-layoutsettings)
- [`layout-presets.readLayoutSettings`](../layout-presets.ts.mdmd.md#symbol-readlayoutsettings)
- [`history.commitUrl`](./history.ts.mdmd.md#symbol-commiturl)
- [`local-storage.getDefaultFilters`](./local-storage.ts.mdmd.md#symbol-getdefaultfilters)
- [`navigation.readPerspective`](./navigation.ts.mdmd.md#symbol-readperspective)
- [`navigation.readSpatialLayout`](./navigation.ts.mdmd.md#symbol-readspatiallayout)
- [`navigation.readView`](./navigation.ts.mdmd.md#symbol-readview)
- [`types.LocalMapPerspective`](../types.ts.mdmd.md#symbol-localmapperspective) (type-only)
- [`types.PathDestination`](../types.ts.mdmd.md#symbol-pathdestination) (type-only)
- [`types.SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`types.ViewName`](../types.ts.mdmd.md#symbol-viewname) (type-only)
- [`pin-state.EMPTY_PIN_SET`](../views/pin-state.ts.mdmd.md#symbol-empty_pin_set) (type-only)
- [`pin-state.PinSet`](../views/pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`pin-state.deserializePins`](../views/pin-state.ts.mdmd.md#symbol-deserializepins) (type-only)
- [`pin-state.serializePins`](../views/pin-state.ts.mdmd.md#symbol-serializepins) (type-only)
- [`retained-state.reconcileRetained`](../views/retained-state.ts.mdmd.md#symbol-reconcileretained)
<!-- LIVE-DOC:END Dependencies -->
