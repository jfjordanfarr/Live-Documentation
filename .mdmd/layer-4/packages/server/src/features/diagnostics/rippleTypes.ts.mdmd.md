# packages/server/src/features/diagnostics/rippleTypes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/diagnostics/rippleTypes.ts
- Live Doc ID: LD-implementation-packages-server-src-features-diagnostics-rippletypes-ts
- Generated At: 2026-02-03T21:55:37.556Z

## Authored
### Purpose
Defines the shared hint/impact payloads exchanged across diagnostics ripple analysis so downstream publishers can trace why a document received a warning, aligning with the diagnostics pipeline introduced in [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md).

### Notes
- Keeps ripple metadata lightweight (depth, traversal path) for noise filtering and publisher fan-out without binding to a specific analyzer implementation.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:37.556Z","inputHash":"8d300846094bcf07"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RippleHint` {#symbol-ripplehint}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/rippleTypes.ts#L4)
- Returns: [`RelationshipHint`](../../../../shared/src/inference/fallbackInference.ts.mdmd.md#symbol-relationshiphint)

#### `RippleImpact` {#symbol-rippleimpact}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/rippleTypes.ts#L9)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.KnowledgeArtifact`](../../../../shared/src/domain/artifacts.ts.mdmd.md#symbol-knowledgeartifact) (type-only)
- [`fallbackInference.RelationshipHint`](../../../../shared/src/inference/fallbackInference.ts.mdmd.md#symbol-relationshiphint) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [noiseFilter.test.ts](./noiseFilter.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
