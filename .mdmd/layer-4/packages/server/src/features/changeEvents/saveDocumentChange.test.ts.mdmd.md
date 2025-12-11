# packages/server/src/features/changeEvents/saveDocumentChange.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/changeEvents/saveDocumentChange.test.ts
- Live Doc ID: LD-test-packages-server-src-features-changeevents-savedocumentchange-test-ts
- Generated At: 2025-12-11T02:38:00.265Z

## Authored
### Purpose
Verifies the document change persistence flow from [2025-10-17 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md) by asserting we persist canonical artifacts, emit change events, and fall back gracefully when inference artifacts are missing.

### Notes
- Stubs GraphStore interactions and random UUIDs so changes to event payloads or placeholder artifacts fail fast without requiring disk-backed fixtures.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:00.265Z","inputHash":"4a430bb95ad42040"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `ChangeEvent`, `GraphStore`, `KnowledgeArtifact` (type-only)
- [`changeQueue.QueuedChange`](./changeQueue.ts.mdmd.md#symbol-queuedchange) (type-only)
- [`saveDocumentChange.saveDocumentChange`](./saveDocumentChange.ts.mdmd.md#symbol-savedocumentchange)
- [`artifactWatcher.DocumentTrackedArtifactChange`](../watchers/artifactWatcher.ts.mdmd.md#symbol-documenttrackedartifactchange) (type-only)
- `vitest` - `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/changeEvents: [changeQueue.ts](./changeQueue.ts.mdmd.md), [saveDocumentChange.ts](./saveDocumentChange.ts.mdmd.md)
- packages/server/src/features/utils: [uri.ts](../utils/uri.ts.mdmd.md)
- packages/server/src/features/watchers: [artifactWatcher.ts](../watchers/artifactWatcher.ts.mdmd.md), [pathReferenceDetector.ts](../watchers/pathReferenceDetector.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../../shared/src/index.ts.mdmd.md)
- packages/shared/src/uri: [normalizeFileUri.ts](../../../../shared/src/uri/normalizeFileUri.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
