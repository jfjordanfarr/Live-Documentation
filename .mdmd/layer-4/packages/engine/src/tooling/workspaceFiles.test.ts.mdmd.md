# `packages/engine/src/tooling/workspaceFiles.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/tooling/workspaceFiles.test.ts`
- Generated At: 2026-11-24T10:31:38.961Z

## Authored
### Purpose
Holds the run's reads to their promise, over a host that counts what it is asked: a file asked for by several readers at once and again later is read from the host once and decoded once; its first bytes come from that read; a file never read whole (a picture) is asked of the host for its first bytes, once; and a failed read is kept by no one, so that the next to ask reads again.

### Notes
- Written on 2026-11-22 with `workspaceFiles.ts`, the third step of [the road to one engine for a page and a command line](../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road). Over a real scan the same promise is held by the check that the engine runs in a page, which counts every file's reads in each of its 45 folders.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`sourceText.readSourceReading`](./sourceText.ts.mdmd.md#symbol-readsourcereading)
- [`sourceText.readSourceText`](./sourceText.ts.mdmd.md#symbol-readsourcetext)
- [`workspaceFiles.FileHost`](./workspaceFiles.ts.mdmd.md#symbol-filehost) (type-only)
- [`workspaceFiles.getDiskFallback`](./workspaceFiles.ts.mdmd.md#symbol-getdiskfallback)
- [`workspaceFiles.setDiskFallback`](./workspaceFiles.ts.mdmd.md#symbol-setdiskfallback)
- [`workspaceFiles.workspaceReads`](./workspaceFiles.ts.mdmd.md#symbol-workspacereads-function)
- [`workspaceProbes.folderChildren`](./workspaceProbes.ts.mdmd.md#symbol-folderchildren)
- [`workspaceProbes.pathKind`](./workspaceProbes.ts.mdmd.md#symbol-pathkind)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
