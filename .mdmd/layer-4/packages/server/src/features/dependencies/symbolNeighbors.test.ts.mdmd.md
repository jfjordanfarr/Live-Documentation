# packages/server/src/features/dependencies/symbolNeighbors.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/dependencies/symbolNeighbors.test.ts
- Live Doc ID: LD-test-packages-server-src-features-dependencies-symbolneighbors-test-ts
- Generated At: 2025-12-15T00:38:06.190Z

## Authored
### Purpose
Proves the neighbor traversal created for the dependency quick pick in [2025-10-23 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md) groups results, respects hop limits, filters by relationship kind, and accepts URI lookups.

### Notes
- Builds in-memory graph fixtures so regressions surface quickly without touching the on-disk cache, mirroring the integration coverage in `tests/integration/us4/inspectSymbolNeighbors.test.ts`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.190Z","inputHash":"07914279af2f5d1e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`symbolNeighbors.inspectSymbolNeighbors`](./symbolNeighbors.ts.mdmd.md#symbol-inspectsymbolneighbors)
- [`index.GraphStore`](../../../../shared/src/index.ts.mdmd.md#symbol-graphstore)
- [`index.KnowledgeArtifact`](../../../../shared/src/index.ts.mdmd.md#symbol-knowledgeartifact)
- [`index.LinkRelationship`](../../../../shared/src/index.ts.mdmd.md#symbol-linkrelationship)
- [`index.SymbolNeighborGroup`](../../../../shared/src/index.ts.mdmd.md#symbol-symbolneighborgroup)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/dependencies: [symbolNeighbors.ts](./symbolNeighbors.ts.mdmd.md)
- packages/server/src/features/utils: [uri.ts](../utils/uri.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../../shared/src/index.ts.mdmd.md)
- packages/shared/src/uri: [normalizeFileUri.ts](../../../../shared/src/uri/normalizeFileUri.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
