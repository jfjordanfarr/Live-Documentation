# packages/server/src/features/watchers/pathReferenceDetector.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/watchers/pathReferenceDetector.ts
- Live Doc ID: LD-implementation-packages-server-src-features-watchers-pathreferencedetector-ts
- Generated At: 2026-01-17T18:11:29.520Z

## Authored
### Purpose
Extracts relative-path references from markdown and code so the watcher pipeline can seed relationship hints linking templates, docs, and assets back to the files that use them <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L2832-L2864>.

### Notes
- Keep the extension guesses and URI canonicalisation aligned with `normalizeFileUri`—we consolidated that helper on Oct 28 so every watcher emits comparable URIs <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L3160-L3280>.
- When workspace indexing rules change (new script/doc globs or additional path hint sources) update these heuristics in tandem so seed hints continue to mirror the indexer output <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-22.md#L2832-L2864>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-17T18:11:29.520Z","inputHash":"d98f0f9ebe9bbeac"}]} -->
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
- `node:fs` - `fs`
- `node:path` - `path`
- `node:url` - `fileURLToPath`, `pathToFileURL`
- [`uri.normalizeFileUri`](../utils/uri.ts.mdmd.md#symbol-normalizefileuri)
- [`fallbackInference.RelationshipHint`](../../../../shared/src/inference/fallbackInference.ts.mdmd.md#symbol-relationshiphint) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [pathReferenceDetector.test.ts](./pathReferenceDetector.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
