# packages/engine/src/live-docs/discovery.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/discovery.test.ts
- Generated At: 2026-10-16T00:58:42.986Z

## Authored
### Purpose
Discovery's product rules over a temporary workspace: every file read by default, hidden ones and ones no reader handles among them; `.git`, `node_modules`, the docs root, lock files and documents never, whatever a configured glob or an include names, a source file whose name only looks like a document's (`license.ts`, `readme-generator.ts`) being read; `.gitignore` honoured except for a file git tracks, the docs root derived from the configuration in any spelling, and `exclude` by path or glob.

### Notes
- Written 2026-10-16 with the suffix-anywhere defaults ([Turn 9 of the October 15 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-9)); the tracked-file case initialises a git repository in the temporary workspace.
- The every-file default and the documents rule came on 2026-10-22 ([Turn 8 of the October 21 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)); breaking either the rule or the document-name pattern fails both of the first two cases.

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
- `node:path` - `path`
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`discovery.discoverTargetFiles`](./discovery.ts.mdmd.md#symbol-discovertargetfiles)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
