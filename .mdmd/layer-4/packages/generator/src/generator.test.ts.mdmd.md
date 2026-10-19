# packages/generator/src/generator.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/generator/src/generator.test.ts
- Generated At: 2026-10-19T15:06:00.015Z

## Authored
### Purpose
Validates generation and pruning, including the distinction between the full workspace context needed to resolve links and entries and the subset of source docs a changed-only run writes.

### Notes
- Ensures the Stage‑0 pruning safeguards added during the generator refactor (see [2025-11-10 summary](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md)) remain regression-tested.
- The changed-only fixture compares a selected doc with full generation when it uses an unchanged symbol provider and manifest. The removal fixture checks changed deletion and rename paths and keeps a stale doc with authored purpose while pruning un-authored stale docs. The include fixture checks that a selected file still links to an unincluded provider.
- The nested-workspace fixture commits source files under a parent Git repository, modifies a sibling outside the scan and then the source inside it; only the latter selects a Live Doc, whose explicit imported type still links to its provider.
- The DOM fixture gives a script one visible page, one Git-ignored page and one configured-excluded page with the same id. Only the visible page can appear in the generated doc; changing the ignored page leaves Git clean and the doc unchanged. A standalone analysis without an index still finds all three nearby pages.
- Git failure fixtures distinguish a clean change set from a non-repository or broken status while checking that a normal full run needs no Git repository.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`
- `node:fs/promises`
- `node:os`
- `node:path`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_FILE_EXTENSION`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`core.analyzeSourceFile`](../../engine/src/live-docs/core.ts.mdmd.md#symbol-analyzesourcefile)
- [`generator.generateLiveDocs`](./generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
