# tests/integration/live-docs/repository-entries.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/repository-entries.test.ts
- Generated At: 2026-10-22T16:48:01.024Z

## Authored
### Purpose
This repository as the oracle's subject: the entry points of its own code, read by hand into `expected/repository-entries.json`, compared with what the committed docs say, and the walk from those entries measured against the hand's reading of what nothing reaches. The sample programs and the fixtures are inputs to the tool and stand aside.

### Notes
- Written 2026-10-15 at the owner's word ([Turn 3](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-3): "Because it's our repo, and we know the shape of our repo"). The expectation was seeded from the October 8 dead code sweep's hand table and refreshed against the manifests and the tree; its first run corrected the hand (the generator package's `main` names `generator.ts`) and the tool (a script's flag read as taking the flag after it), which is what an oracle is for.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path` - `path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`document.entryWords`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-entrywords)
- [`graphFiles.readLiveDocGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`pathfind.reachability`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-reachability-function)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../layer-3/architectural-decisions.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
