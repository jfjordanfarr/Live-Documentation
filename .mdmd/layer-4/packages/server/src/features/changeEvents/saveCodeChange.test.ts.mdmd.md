# packages/server/src/features/changeEvents/saveCodeChange.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/changeEvents/saveCodeChange.test.ts
- Live Doc ID: LD-test-packages-server-src-features-changeevents-savecodechange-test-ts
- Generated At: 2025-12-15T00:38:06.145Z

## Authored
### Purpose
Locks in the regression coverage added in [2025-10-29 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-29.SUMMARIZED.md), ensuring `saveCodeChange` reuses canonical artifact IDs and emits relationally sound change events.

### Notes
- Fakes GraphStore methods so we can assert on persisted payloads and foreign-key-safe IDs without invoking SQLite.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.145Z","inputHash":"aedc5ebf19053cc5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`saveCodeChange.saveCodeChange`](./saveCodeChange.ts.mdmd.md#symbol-savecodechange)
- [`artifactWatcher.CodeTrackedArtifactChange`](../watchers/artifactWatcher.ts.mdmd.md#symbol-codetrackedartifactchange) (type-only)
- [`index.ChangeEvent`](../../../../shared/src/index.ts.mdmd.md#symbol-changeevent) (type-only)
- [`index.GraphStore`](../../../../shared/src/index.ts.mdmd.md#symbol-graphstore) (type-only)
- [`index.KnowledgeArtifact`](../../../../shared/src/index.ts.mdmd.md#symbol-knowledgeartifact) (type-only)
- `vitest` - `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/changeEvents: [changeQueue.ts](./changeQueue.ts.mdmd.md), [saveCodeChange.ts](./saveCodeChange.ts.mdmd.md)
- packages/server/src/features/utils: [uri.ts](../utils/uri.ts.mdmd.md)
- packages/server/src/features/watchers: [artifactWatcher.ts](../watchers/artifactWatcher.ts.mdmd.md), [pathReferenceDetector.ts](../watchers/pathReferenceDetector.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../../shared/src/index.ts.mdmd.md)
- packages/shared/src/uri: [normalizeFileUri.ts](../../../../shared/src/uri/normalizeFileUri.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
