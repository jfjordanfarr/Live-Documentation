# packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-symbolanchors-ts
- Generated At: 2026-02-18T21:27:51.949Z

## Authored
### Purpose
Symbol anchor key normalisation utilities for the Local Map. Ensures that symbol identifiers from different sources (graph payloads, DOM data attributes) resolve to consistent anchor keys for connection routing.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-03.md]

### Notes
- Created 2025-12-03 to centralise symbol matching logic.
- `normalizeSymbolIdentifier` strips decorators like `(class)`, `(function)` and converts to lowercase.
- `buildNormalizedAnchorKey` combines node ID, direction, and optional symbol into a canonical key.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:51.949Z","inputHash":"901a9c7681744ad9"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AnchorDirection` {#symbol-anchordirection}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts#L7)

##### `AnchorDirection` — Summary
Direction of a dependency edge relative to a Live Doc node.

- `"inbound"` — the symbol is consumed by the current node (appears in its Dependencies section)
- `"outbound"` — the symbol is exported by the current node (appears in its Public Symbols section)

#### `normalizeSymbolIdentifier` {#symbol-normalizesymbolidentifier}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts#L14)

##### `normalizeSymbolIdentifier` — Summary
Normalizes a symbol identifier so different textual representations resolve to the same anchor key.

#### `buildNormalizedAnchorKey` {#symbol-buildnormalizedanchorkey}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts#L70)
- Parameters: `direction`: [`AnchorDirection`](#symbol-anchordirection)

##### `buildNormalizedAnchorKey` — Summary
Constructs a normalised anchor key from a direction and raw symbol name.

Returns `null` when the symbol cannot be meaningfully normalised (e.g. empty or whitespace-only).
The resulting key has the form `"normalized:<direction>:<lowercased-symbol>"`.

#### `tryBuildNormalizedKeyFromAnchorKey` {#symbol-trybuildnormalizedkeyfromanchorkey}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts#L85)

##### `tryBuildNormalizedKeyFromAnchorKey` — Summary
Attempts to derive a normalised anchor key from an existing raw anchor key.

Parses the `"<direction>:<symbol>"` format, normalises the symbol portion,
and returns a key suitable for fuzzy matching. Returns `null` for wildcard
keys (`"*"`) or keys with unrecognised direction prefixes.

#### `NormalizedAnchorKey` {#symbol-normalizedanchorkey}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts#L102)

##### `NormalizedAnchorKey` — Summary
Template literal type constraining normalised anchor keys to the
`"normalized:<direction>:<symbol>"` shape for type-safe lookups.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [pan-zoom.test.ts](./localView/pan-zoom.test.ts.mdmd.md)
- [symbol-highlight.test.ts](./localView/symbol-highlight.test.ts.mdmd.md)
- [symbolAnchors.test.ts](./symbolAnchors.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
