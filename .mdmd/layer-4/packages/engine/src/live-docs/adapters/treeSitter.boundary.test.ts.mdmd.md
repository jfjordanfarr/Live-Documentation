# `packages/engine/src/live-docs/adapters/treeSitter.boundary.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/adapters/treeSitter.boundary.test.ts`
- Generated At: 2026-11-20T14:49:03.194Z

## Authored
### Purpose
Holds `treeSitter.ts` as the product's one way to a tree-sitter tree. `readTree` measures each tree's depth and marks the process for any throw from the grammar's load to the tree's release (`processMark.ts`). No other source file of the packages or `scripts`, tests aside, may import `web-tree-sitter` or name `grammarParser`, or it could read trees no mark covers. The check is shown seeing each way of doing so: import, type import, re-export, require, dynamic import, an alias, a namespace member.

### Notes
- Written on 2026-11-20 after a review found the boundary held by no test. Seen red with `go.ts` made to import the runtime and `grammarParser`: both offences named.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- `typescript` - `ts`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
