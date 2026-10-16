# packages/engine/src/live-docs/discovery.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/discovery.test.ts
- Generated At: 2026-10-16T00:58:42.986Z

## Authored
### Purpose
Discovery's product rules over a temporary workspace: hidden files read, `.git`, `node_modules`, the docs root and lock files never, `.gitignore` honoured except for a file git tracks, the docs root derived from the configuration in any spelling, and `exclude` by path or glob.

### Notes
- Written 2026-10-16 with the suffix-anywhere defaults ([Turn 9 of the October 15 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-9)); the tracked-file case initialises a git repository in the temporary workspace.

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
