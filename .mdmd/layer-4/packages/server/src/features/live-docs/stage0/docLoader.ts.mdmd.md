# packages/server/src/features/live-docs/stage0/docLoader.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/stage0/docLoader.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-stage0-docloader-ts
- Generated At: 2025-12-05T04:16:18.708Z

## Authored
### Purpose
Parses the Stage-0 Live Doc mirror into structured records (metadata, symbols, dependencies) so the System generator can reason about authored coverage, introduced during the Stage-0 extraction on 2025-11-11 ([summary](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md)).

### Notes
- Warns on missing metadata or malformed sections instead of throwing, keeping generator runs resilient while we iterate on newly migrated docs.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:18.708Z","inputHash":"f2cdd45f072a3b5a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `loadStage0Docs` {#symbol-loadstage0docs}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/stage0/docLoader.ts#L33)
- Parameters: `args`: `LoadStage0DocsArgs`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/config/liveDocumentationConfig` - `LiveDocumentationConfig`
- `@live-documentation/shared/live-docs/core` - `directoryExists`
- `@live-documentation/shared/live-docs/markdown` - `renderBeginMarker`, `renderEndMarker`
- `@live-documentation/shared/live-docs/types` - `Stage0Doc`, `Stage0DocLogger`, `Stage0Symbol` (type-only)
- `@live-documentation/shared/tooling/pathUtils` - `normalizeWorkspacePath`
- `glob` - `glob`
- `node:fs/promises` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../system/generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
