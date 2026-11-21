# `tests/integration/live-docs/sql-generation.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/sql-generation.test.ts`
- Generated At: 2026-11-21T02:15:35.419Z

## Authored
### Purpose
Runs the generator over SQL scripts whose bracketed names hold apostrophes, the cold run's smallest crash among them, and reads the docs back through the graph: generation must finish and each procedure's name must be the name itself.

### Notes
- Written on 2026-11-19 ([the probe](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)). It failed before the mend with the cold run's own message, `smallest.sql.md: line 7: unexpected evidence on the opening entry`, and passes after it. The tSQLt-shaped script uses CRLF line endings, as tSQLt's files do.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os` - `os`
- `node:path` - `path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`graphFiles.readLiveDocGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
