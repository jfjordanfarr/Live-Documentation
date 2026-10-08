# packages/explorer/src/client/persistence/compressed-url-state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/persistence/compressed-url-state.ts
- Generated At: 2026-10-08T01:58:13.455Z

## Authored
### Purpose

Encodes the full Membrane Map view state (active view, selected node, pin set, expanded directories, pan/zoom transform, filters) into a single `?s=` query parameter using lz-string compression to enable shareable URLs.

### Notes

- Created during Step 9 (Controller + Integration) of the Membrane Map implementation on [Dev Day 80](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md). The user specified in Turn 14 that URL state must be "consistent (always uses lz-string or always doesn't) and comprehensive for state," rejecting a proposed hybrid approach.
- Employs a versioned payload schema (`CompressedPayload` with a mandatory `v` field) so future state shape changes can be migrated without breaking previously shared URLs. Field keys are deliberately short (1-3 characters) to minimize compressed output size.
- `snapshotToPayload` and `payloadToSnapshot` are pure functions that convert between the typed application-level `UrlStateSnapshot` and the compact wire-format `CompressedPayload`, omitting fields that match defaults to keep payloads small.
- `readUrlState` and `writeUrlState` are the DOM-touching boundary functions that read/write the `?s=` parameter without triggering browser navigation, preserving any existing `?data=` parameter used for custom data sources.
- Replaces the prior `persistence/url-state.ts` plain query-parameter approach used by Circuit Board and Local Map, which could not represent pin sets or zoom transforms.
- On [Dev Day 86](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-31.1.md) the `expandedCards` field (`c?` in the wire format) was added to `CompressedPayload` and `UrlStateSnapshot` so that file-card expansion state round-trips through the URL, enabling reload and share-URL fidelity for expanded cards in browse mode.
- `d`, the Local Map's opened directories (2026-10-08, [the decisions log](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08)): sorted paths, left out when none is opened, scrubbed to those with a live file under them, and part of what makes a snapshot non-default. Like the pins they are no part of the place `place.ts` reads, so opening a directory makes no history entry.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CompressedPayload` {#symbol-compressedpayload}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L40)

##### `CompressedPayload` — Summary
The JSON structure compressed into the `?s=` parameter.

All fields except `v` are optional — omitted fields use defaults.
Key naming convention: single-letter or short abbreviation to
minimize serialized size while remaining readable in code.

#### `UrlStateSnapshot` {#symbol-urlstatesnapshot}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L68)

##### `UrlStateSnapshot` — Summary
Application-level state snapshot that maps 1:1 with the URL.
This is what the controller produces and consumes; the
{@link CompressedPayload} is the wire format.

#### `DEFAULT_SNAPSHOT` {#symbol-default_snapshot}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L81)
- Returns: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `DEFAULT_SNAPSHOT` — Summary
Default state for cold start (no URL parameter).

#### `snapshotToPayload` {#symbol-snapshottopayload}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L98)
- Returns: [`CompressedPayload`](#symbol-compressedpayload)
- Parameters: `snapshot`: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `snapshotToPayload` — Summary
Convert a snapshot into a compact JSON payload.
Omits fields that match defaults to keep the output small.

#### `payloadToSnapshot` {#symbol-payloadtosnapshot}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L141)
- Returns: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)
- Parameters: `payload`: [`CompressedPayload`](#symbol-compressedpayload)

##### `payloadToSnapshot` — Summary
Convert a compact JSON payload back into a typed snapshot.
Applies version migrations and defaults for missing fields.

#### `compressSnapshot` {#symbol-compresssnapshot}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L167)
- Parameters: `snapshot`: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `compressSnapshot` — Summary
Compress a snapshot into a URL-safe string.

#### `decompressSnapshot` {#symbol-decompresssnapshot}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L176)
- Returns: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `decompressSnapshot` — Summary
Decompress a URL-safe string back into a snapshot.
Returns the default snapshot if decompression or parsing fails.

#### `scrubSnapshot` {#symbol-scrubsnapshot}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L196)
- Returns: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)
- Parameters: `snapshot`: [`UrlStateSnapshot`](#symbol-urlstatesnapshot); `nodesById`: `ReadonlyMap`

##### `scrubSnapshot` — Summary
Scrub a snapshot against the live node set, dropping references to
nodes/directories that no longer exist. This prevents stale shared
URLs from producing empty treemaps, zombie pins, or orphan cards.

Pure function — returns a new snapshot; does not mutate the input.

#### `readUrlState` {#symbol-readurlstate}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L252)
- Returns: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `readUrlState` — Summary
Read the current URL and extract a state snapshot.
Falls back to defaults if no `?s=` parameter is present.

#### `writeUrlState` {#symbol-writeurlstate}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/compressed-url-state.ts#L263)
- Parameters: `snapshot`: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `writeUrlState` — Summary
Write a state snapshot into the URL without reloading the page; the history decides whether it is a new entry.
Preserves the `?data=` parameter if present (used for custom data sources).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `lz-string` - `compressToEncodedURIComponent`, `decompressFromEncodedURIComponent`
- [`history.commitUrl`](./history.ts.mdmd.md#symbol-commiturl)
- [`types.ViewName`](../types.ts.mdmd.md#symbol-viewname) (type-only)
- [`pin-state.EMPTY_PIN_SET`](../views/pin-state.ts.mdmd.md#symbol-empty_pin_set) (type-only)
- [`pin-state.PinSet`](../views/pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`pin-state.deserializePins`](../views/pin-state.ts.mdmd.md#symbol-deserializepins) (type-only)
- [`pin-state.serializePins`](../views/pin-state.ts.mdmd.md#symbol-serializepins) (type-only)
<!-- LIVE-DOC:END Dependencies -->
