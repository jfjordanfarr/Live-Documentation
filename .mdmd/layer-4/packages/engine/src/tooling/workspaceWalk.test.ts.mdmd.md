# `packages/engine/src/tooling/workspaceWalk.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/tooling/workspaceWalk.test.ts`
- Generated At: 2026-11-24T07:15:06.329Z

## Authored
### Purpose
Holds the pure host-driven walker and in-memory glob matcher (`workspaceWalk.ts`) to its contract over an in-memory `FileHost` with no disk access: brace expansion, wildcard and character-class matching, pre-listing pruning, directory-symlink bounds, and machine-failure vs `ENOENT` handling.

### Notes
- Written on 2026-11-24 alongside `workspaceWalk.ts` for Step 5 of [the road to one engine for a page and a command line](../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road).
- Exercises `shouldEnter` and pattern-prefix pruning by recording every `host.entries()` call and asserting that pruned folders are never listed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`workspaceFiles.FileHost`](./workspaceFiles.ts.mdmd.md#symbol-filehost) (type-only)
- [`workspaceFiles.FolderEntries`](./workspaceFiles.ts.mdmd.md#symbol-folderentries) (type-only)
- [`workspaceWalk.compileGlobPatterns`](./workspaceWalk.ts.mdmd.md#symbol-compileglobpatterns)
- [`workspaceWalk.expandGlobBraces`](./workspaceWalk.ts.mdmd.md#symbol-expandglobbraces)
- [`workspaceWalk.matchGlobPattern`](./workspaceWalk.ts.mdmd.md#symbol-matchglobpattern)
- [`workspaceWalk.matchesAnyGlob`](./workspaceWalk.ts.mdmd.md#symbol-matchesanyglob)
- [`workspaceWalk.walkWorkspace`](./workspaceWalk.ts.mdmd.md#symbol-walkworkspace)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
