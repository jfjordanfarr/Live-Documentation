# packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-symbolanchors-ts
- Generated At: 2025-12-05T15:07:39.499Z

## Authored
### Purpose
Symbol anchor key normalisation utilities for the Local Map. Ensures that symbol identifiers from different sources (graph payloads, DOM data attributes) resolve to consistent anchor keys for connection routing.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-03.md]

### Notes
- Created 2025-12-03 to centralise symbol matching logic.
- `normalizeSymbolIdentifier` strips decorators like `(class)`, `(function)` and converts to lowercase.
- `buildNormalizedAnchorKey` combines node ID, direction, and optional symbol into a canonical key.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:07:39.499Z","inputHash":"5682d2fe07f1d70b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AnchorDirection` {#symbol-anchordirection}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts#L1)

#### `normalizeSymbolIdentifier` {#symbol-normalizesymbolidentifier}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts#L8)

##### `normalizeSymbolIdentifier` — Summary
Normalizes a symbol identifier so different textual representations resolve to the same anchor key.

#### `buildNormalizedAnchorKey` {#symbol-buildnormalizedanchorkey}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts#L49)
- Parameters: `direction`: `AnchorDirection`

#### `tryBuildNormalizedKeyFromAnchorKey` {#symbol-trybuildnormalizedkeyfromanchorkey}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts#L57)

#### `NormalizedAnchorKey` {#symbol-normalizedanchorkey}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts#L70)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [symbolAnchors.test.ts](./symbolAnchors.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
