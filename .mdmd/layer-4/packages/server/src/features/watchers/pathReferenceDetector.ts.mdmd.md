# packages/server/src/features/watchers/pathReferenceDetector.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/watchers/pathReferenceDetector.ts
- Live Doc ID: LD-implementation-packages-server-src-features-watchers-pathreferencedetector-ts
- Generated At: 2025-12-05T15:37:24.663Z

## Authored
### Purpose
Extracts relative-path references from markdown and code so the watcher pipeline can seed relationship hints linking templates, docs, and assets back to the files that use them <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L2832-L2864>.

### Notes
- Keep the extension guesses and URI canonicalisation aligned with `normalizeFileUri`—we consolidated that helper on Oct 28 so every watcher emits comparable URIs <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L3160-L3280>.
- When workspace indexing rules change (new script/doc globs or additional path hint sources) update these heuristics in tandem so seed hints continue to mirror the indexer output <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L2832-L2864>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:24.663Z","inputHash":"a85410a04903dd9e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ArtifactCategory` {#symbol-artifactcategory}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/watchers/pathReferenceDetector.ts#L9)

#### `PathReferenceOrigin` {#symbol-pathreferenceorigin}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/watchers/pathReferenceDetector.ts#L11)

#### `buildFileReferenceHints` {#symbol-buildfilereferencehints}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/watchers/pathReferenceDetector.ts#L56)
- Returns: [`RelationshipHint`](../../../../shared/src/inference/fallbackInference.ts.mdmd.md#symbol-relationshiphint)[]
- Parameters: `options`: `BuildHintsOptions`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `RelationshipHint` (type-only)
- `node:fs` - `fs`
- `node:path` - `path`
- `node:url` - `fileURLToPath`, `pathToFileURL`
- [`uri.normalizeFileUri`](../utils/uri.ts.mdmd.md#symbol-normalizefileuri)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [saveCodeChange.test.ts](../changeEvents/saveCodeChange.test.ts.mdmd.md)
- [saveDocumentChange.test.ts](../changeEvents/saveDocumentChange.test.ts.mdmd.md)
- [publishDocDiagnostics.test.ts](../diagnostics/publishDocDiagnostics.test.ts.mdmd.md)
- [artifactWatcher.test.ts](./artifactWatcher.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](./pathReferenceDetector.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
