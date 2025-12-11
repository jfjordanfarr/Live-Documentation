# packages/server/src/features/dependencies/inspectDependencies.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/dependencies/inspectDependencies.test.ts
- Live Doc ID: LD-test-packages-server-src-features-dependencies-inspectdependencies-test-ts
- Generated At: 2025-12-11T02:38:00.326Z

## Authored
### Purpose
Exercises the dependency traversal introduced in [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md) to confirm the quick pick backend emits deterministic edge counts, depth summaries, and URI normalization.

### Notes
- Mocks link graphs directly through `GraphStore` so we can regression-test filtering and max-depth behaviour without spinning up the integration harness.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:00.326Z","inputHash":"40593ce1c00332fd"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `GraphStore`, `KnowledgeArtifact`, `LinkRelationship`
- [`inspectDependencies.inspectDependencies`](./inspectDependencies.ts.mdmd.md#symbol-inspectdependencies)
- `vitest` - `describe`, `expect`, `it`
- `zod` - `z`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/dependencies: [buildCodeGraph.ts](./buildCodeGraph.ts.mdmd.md), [inspectDependencies.ts](./inspectDependencies.ts.mdmd.md)
- packages/server/src/features/utils: [uri.ts](../utils/uri.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../../shared/src/index.ts.mdmd.md)
- packages/shared/src/uri: [normalizeFileUri.ts](../../../../shared/src/uri/normalizeFileUri.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
