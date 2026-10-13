# scripts/layout-lab/signals.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/layout-lab/signals.test.ts
- Generated At: 2026-10-13T16:52:35.926Z

## Authored
### Purpose
Verifies how the lab counts separated runs of each file directory within columns, independently of the membranes drawn.

### Notes
- Hand-made columns of paths: directories together count nothing, a directory split around another counts one run beyond its first, two split directories two, columns are summed, and files at the root share the empty directory (2026-10-07, the wall's lever).
The fragment metric originated in the [October 7 membrane-depth experiment](../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-06.1.SUMMARIZED.md#turn-20). Shape cases now live beside the shared implementation in [branch-shape.test.ts](../../packages/explorer/src/client/views/localView/branch-shape.test.ts.mdmd.md): they cover top/bottom steps, invisible containers, nested boundaries and row ownership, as shared by the lab and Explorer since the [October 13 integration](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`signals.fragmentsOf`](./signals.ts.mdmd.md#symbol-fragmentsof)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
