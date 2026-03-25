# packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-persistence-compressed-url-state-ts
- Generated At: 2026-03-25T17:08:28.773Z

## Authored
### Purpose

Encodes the full Membrane Map view state (active view, selected node, pin set, expanded directories, pan/zoom transform, filters) into a single `?s=` query parameter using lz-string compression to enable shareable URLs.

### Notes

- Created during Step 9 (Controller + Integration) of the Membrane Map implementation on [Dev Day 80](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md). The user specified in Turn 14 that URL state must be "consistent (always uses lz-string or always doesn't) and comprehensive for state," rejecting a proposed hybrid approach.
- Employs a versioned payload schema (`CompressedPayload` with a mandatory `v` field) so future state shape changes can be migrated without breaking previously shared URLs. Field keys are deliberately short (1-3 characters) to minimize compressed output size.
- `snapshotToPayload` and `payloadToSnapshot` are pure functions that convert between the typed application-level `UrlStateSnapshot` and the compact wire-format `CompressedPayload`, omitting fields that match defaults to keep payloads small.
- `readUrlState` and `writeUrlState` are the DOM-touching boundary functions that read/write the `?s=` parameter without triggering browser navigation, preserving any existing `?data=` parameter used for custom data sources.
- Replaces the prior `persistence/url-state.ts` plain query-parameter approach used by Circuit Board and Local Map, which could not represent pin sets or zoom transforms.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-25T17:08:28.773Z","inputHash":"6a3821a5fc0d673e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CompressedPayload` {#symbol-compressedpayload}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts#L39)

##### `CompressedPayload` — Summary
The JSON structure compressed into the `?s=` parameter.

All fields except `v` are optional — omitted fields use defaults.
Key naming convention: single-letter or short abbreviation to
minimize serialized size while remaining readable in code.

#### `UrlStateSnapshot` {#symbol-urlstatesnapshot}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts#L63)

##### `UrlStateSnapshot` — Summary
Application-level state snapshot that maps 1:1 with the URL.
This is what the controller produces and consumes; the
{@link CompressedPayload} is the wire format.

#### `DEFAULT_SNAPSHOT` {#symbol-default_snapshot}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts#L73)
- Returns: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `DEFAULT_SNAPSHOT` — Summary
Default state for cold start (no URL parameter).

#### `snapshotToPayload` {#symbol-snapshottopayload}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts#L88)
- Returns: [`CompressedPayload`](#symbol-compressedpayload)
- Parameters: `snapshot`: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `snapshotToPayload` — Summary
Convert a snapshot into a compact JSON payload.
Omits fields that match defaults to keep the output small.

#### `payloadToSnapshot` {#symbol-payloadtosnapshot}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts#L125)
- Returns: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)
- Parameters: `payload`: [`CompressedPayload`](#symbol-compressedpayload)

##### `payloadToSnapshot` — Summary
Convert a compact JSON payload back into a typed snapshot.
Applies version migrations and defaults for missing fields.

#### `compressSnapshot` {#symbol-compresssnapshot}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts#L149)
- Parameters: `snapshot`: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `compressSnapshot` — Summary
Compress a snapshot into a URL-safe string.

#### `decompressSnapshot` {#symbol-decompresssnapshot}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts#L158)
- Returns: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `decompressSnapshot` — Summary
Decompress a URL-safe string back into a snapshot.
Returns the default snapshot if decompression or parsing fails.

#### `readUrlState` {#symbol-readurlstate}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts#L177)
- Returns: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `readUrlState` — Summary
Read the current URL and extract a state snapshot.
Falls back to defaults if no `?s=` parameter is present.

#### `writeUrlState` {#symbol-writeurlstate}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts#L188)
- Parameters: `snapshot`: [`UrlStateSnapshot`](#symbol-urlstatesnapshot)

##### `writeUrlState` — Summary
Write a state snapshot into the URL without triggering navigation.
Preserves the `?data=` parameter if present (used for custom data sources).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `lz-string` - `compressToEncodedURIComponent`, `decompressFromEncodedURIComponent`
- [`types.ViewName`](../types.ts.mdmd.md#symbol-viewname) (type-only)
- [`pin-state.EMPTY_PIN_SET`](../views/membraneView/pin-state.ts.mdmd.md#symbol-empty_pin_set) (type-only)
- [`pin-state.PinSet`](../views/membraneView/pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`pin-state.deserializePins`](../views/membraneView/pin-state.ts.mdmd.md#symbol-deserializepins) (type-only)
- [`pin-state.serializePins`](../views/membraneView/pin-state.ts.mdmd.md#symbol-serializepins) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [compressed-url-state.test.ts](./compressed-url-state.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
