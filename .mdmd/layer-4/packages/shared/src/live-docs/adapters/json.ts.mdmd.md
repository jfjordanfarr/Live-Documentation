# packages/shared/src/live-docs/adapters/json.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/json.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-json-ts
- Generated At: 2026-02-03T21:55:39.965Z

## Authored
### Purpose
Polyglot language adapter for JSON configuration files, enabling Live Documentation to detect file references within JSON structures and represent them as graph dependencies.

### Notes
- Unlike code-oriented adapters, JSON files have no exported symbols; this adapter focuses exclusively on dependency detection.
- Uses a **workspace file index** (built at discovery time) to validate candidate strings against known workspace files, avoiding filesystem crawling and ensuring only tracked files produce dependencies.
- Path resolution strategies: (1) direct workspace-relative match, (2) resolution relative to the JSON file's directory (for `./` and `../` paths), and (3) bare filename lookup in the same directory.
- Skip patterns filter out URLs, version strings, glob patterns, and scoped npm package names to minimize false positives.
- Created 2026-01-15 as part of the JSON Adapter commit, following Option B architecture (generic reference detection with file index validation) per the user's architecture guidance.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.965Z","inputHash":"40f02541f76957e3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `jsonAdapter` {#symbol-jsonadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/json.ts#L165)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [json.test.ts](./json.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
