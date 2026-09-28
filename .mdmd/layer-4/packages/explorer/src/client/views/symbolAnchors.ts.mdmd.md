# packages/explorer/src/client/views/symbolAnchors.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/symbolAnchors.ts
- Generated At: 2026-09-28T01:11:44.489Z

## Authored
### Purpose
Symbol anchor key normalisation utilities for the Local Map. Ensures that symbol identifiers from different sources (graph payloads, DOM data attributes) resolve to consistent anchor keys for connection routing.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-03.md]

### Notes
- Created 2025-12-03 to centralise symbol matching logic.
- `normalizeSymbolIdentifier` strips decorators like `(class)`, `(function)` and converts to lowercase.
- `buildNormalizedAnchorKey` combines node ID, direction, and optional symbol into a canonical key.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AnchorDirection` {#symbol-anchordirection}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/symbolAnchors.ts#L7)

##### `AnchorDirection` — Summary
Direction of a dependency edge relative to a Live Doc node.

- `"inbound"` — the symbol is consumed by the current node (appears in its Dependencies section)
- `"outbound"` — the symbol is exported by the current node (appears in its Public Symbols section)

#### `normalizeSymbolIdentifier` {#symbol-normalizesymbolidentifier}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/symbolAnchors.ts#L14)

##### `normalizeSymbolIdentifier` — Summary
Normalizes a symbol identifier so different textual representations resolve to the same anchor key.

#### `buildNormalizedAnchorKey` {#symbol-buildnormalizedanchorkey}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/symbolAnchors.ts#L70)
- Parameters: `direction`: [`AnchorDirection`](#symbol-anchordirection)

##### `buildNormalizedAnchorKey` — Summary
Constructs a normalised anchor key from a direction and raw symbol name.

Returns `null` when the symbol cannot be meaningfully normalised (e.g. empty or whitespace-only).
The resulting key has the form `"normalized:<direction>:<lowercased-symbol>"`.

#### `tryBuildNormalizedKeyFromAnchorKey` {#symbol-trybuildnormalizedkeyfromanchorkey}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/symbolAnchors.ts#L85)

##### `tryBuildNormalizedKeyFromAnchorKey` — Summary
Attempts to derive a normalised anchor key from an existing raw anchor key.

Parses the `"<direction>:<symbol>"` format, normalises the symbol portion,
and returns a key suitable for fuzzy matching. Returns `null` for wildcard
keys (`"*"`) or keys with unrecognised direction prefixes.

#### `NormalizedAnchorKey` {#symbol-normalizedanchorkey}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/symbolAnchors.ts#L102)

##### `NormalizedAnchorKey` — Summary
Template literal type constraining normalised anchor keys to the
`"normalized:<direction>:<symbol>"` shape for type-safe lookups.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
