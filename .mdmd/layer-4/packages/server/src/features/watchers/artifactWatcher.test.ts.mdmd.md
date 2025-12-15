# packages/server/src/features/watchers/artifactWatcher.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/watchers/artifactWatcher.test.ts
- Live Doc ID: LD-test-packages-server-src-features-watchers-artifactwatcher-test-ts
- Generated At: 2025-12-15T00:38:06.600Z

## Authored
### Purpose
Verifies that `ArtifactWatcher` classifies code and documentation changes correctly, hydrates document content, and triggers link inference without surfacing errors when processing a mixed batch.

### Notes
- Uses the simple workspace fixture to assert both processed artifacts report the expected layers and that inference wiring remains intact.
- Added alongside the watcher refactor captured in [2025-10-19 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-19.SUMMARIZED.md) to guard the unified pipeline.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.600Z","inputHash":"3f5e0d701f071f2b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `node:url` - `pathToFileURL`
- [`changeQueue.QueuedChange`](../changeEvents/changeQueue.ts.mdmd.md#symbol-queuedchange) (type-only)
- [`artifactWatcher.ArtifactWatcher`](./artifactWatcher.ts.mdmd.md#symbol-artifactwatcher)
- [`index.GraphStore`](../../../../shared/src/index.ts.mdmd.md#symbol-graphstore)
- [`index.LinkInferenceOrchestrator`](../../../../shared/src/index.ts.mdmd.md#symbol-linkinferenceorchestrator)
- `vitest` - `describe`, `expect`, `it`, `vi`
- `vscode-languageserver-textdocument` - `TextDocument`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/changeEvents: [changeQueue.ts](../changeEvents/changeQueue.ts.mdmd.md)
- packages/server/src/features/utils: [uri.ts](../utils/uri.ts.mdmd.md)
- packages/server/src/features/watchers: [artifactWatcher.ts](./artifactWatcher.ts.mdmd.md), [pathReferenceDetector.ts](./pathReferenceDetector.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../../shared/src/index.ts.mdmd.md)
- packages/shared/src/uri: [normalizeFileUri.ts](../../../../shared/src/uri/normalizeFileUri.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
