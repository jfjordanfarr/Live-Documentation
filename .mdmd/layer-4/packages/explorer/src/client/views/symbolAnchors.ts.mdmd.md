# packages/explorer/src/client/views/symbolAnchors.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/symbolAnchors.ts
- Generated At: 2026-11-03T19:06:09.773Z

## Authored
### Purpose
Exact symbol keys and direction-qualified anchor keys for the Local Map's routing, disclosure and attention. A complete documented heading identifies its row; case, kind, overload and qualification are retained.

### Notes
- Created in the [December 3 symbol-anchor work](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-03.SUMMARIZED.md#turn-05-symbol-anchors-foundation) to make wires reach their symbol pins. The original text-stripping rule could merge distinct declarations; the [November 3 repair](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/Summarized/2026-11-03.1.SUMMARIZED.md#turn-2) moves anchor-to-heading resolution to the graph projection, where the document supplies the answer.
- `normalizeSymbolIdentifier` now trims surrounding whitespace only. The projection supplies exact headings to links, and same-file references resolve through their stored document anchors. Never strip a kind or overload suffix here: it is part of the identity the generated document established.
- `buildNormalizedAnchorKey` qualifies the exact heading by direction. File and column identity belong to the outer anchor registry, not this key.
- The `NormalizedAnchorKey` template-literal type, which nothing used, was deleted on 2026-10-08 in [the dead code sweep](../../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md).

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
- Source: [source](../../../../../../../packages/explorer/src/client/views/symbolAnchors.ts#L15)

##### `normalizeSymbolIdentifier` — Summary
The complete documented heading is the row's identity. The graph projection resolves anchors to headings
before a view sees them, so matching must preserve case, kind, overloads and qualification verbatim.

#### `buildNormalizedAnchorKey` {#symbol-buildnormalizedanchorkey}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/symbolAnchors.ts#L25)
- Parameters: `direction`: [`AnchorDirection`](#symbol-anchordirection)

##### `buildNormalizedAnchorKey` — Summary
Constructs a normalised anchor key from a direction and raw symbol name.

Returns `null` when the symbol cannot be meaningfully normalised (e.g. empty or whitespace-only).
The resulting key has the form `"normalized:<direction>:<documented-heading>"`.

#### `tryBuildNormalizedKeyFromAnchorKey` {#symbol-trybuildnormalizedkeyfromanchorkey}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/symbolAnchors.ts#L40)

##### `tryBuildNormalizedKeyFromAnchorKey` — Summary
Attempts to derive a normalised anchor key from an existing raw anchor key.

Parses the `"<direction>:<symbol>"` format, normalises the symbol portion,
and returns a key suitable for fuzzy matching. Returns `null` for wildcard
keys (`"*"`) or keys with unrecognised direction prefixes.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
