# packages/server/src/features/live-docs/stage0/docLoader.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/stage0/docLoader.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-stage0-docloader-ts
- Generated At: 2025-12-15T00:38:06.486Z

## Authored
### Purpose
Parses the Stage-0 Live Doc mirror into structured records (metadata, symbols, dependencies) so the System generator can reason about authored coverage, introduced during the Stage-0 extraction on 2025-11-11 ([summary](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md)).

### Notes
- Warns on missing metadata or malformed sections instead of throwing, keeping generator runs resilient while we iterate on newly migrated docs.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.486Z","inputHash":"9cdf65effbc1dbfa"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `loadStage0Docs` {#symbol-loadstage0docs}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/stage0/docLoader.ts#L33)
- Parameters: `args`: `LoadStage0DocsArgs`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- [`liveDocumentationConfig.LiveDocumentationConfig`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`core.directoryExists`](../../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-directoryexists)
- [`markdown.renderBeginMarker`](../../../../../shared/src/live-docs/markdown.ts.mdmd.md#symbol-renderbeginmarker)
- [`markdown.renderEndMarker`](../../../../../shared/src/live-docs/markdown.ts.mdmd.md#symbol-renderendmarker)
- [`types.Stage0Doc`](../../../../../shared/src/live-docs/types.ts.mdmd.md#symbol-stage0doc) (type-only)
- [`types.Stage0DocLogger`](../../../../../shared/src/live-docs/types.ts.mdmd.md#symbol-stage0doclogger) (type-only)
- [`types.Stage0Symbol`](../../../../../shared/src/live-docs/types.ts.mdmd.md#symbol-stage0symbol) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../../../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../system/generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
