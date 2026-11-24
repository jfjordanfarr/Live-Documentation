# `packages/engine/src/tooling/pathUtils.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/pathUtils.ts`
- Generated At: 2026-11-24T10:31:38.945Z

## Authored
### Purpose

Turns a path the machine spells its own way (`C:\work\Shop\Order.cs`) into the one form the docs and the graph use: relative to the workspace, with forward slashes (`Order.cs`). Also home to the list of a disk's failures that mean it cannot hold a name, which the history's tree writer and the reading of a failure as the machine's both read.

### Notes

- Written on 2025-10-30 to convert between file URIs, absolute paths and workspace-relative strings, so that the relationship rules of that time and their diagnostics resolved targets alike on every platform ([relationship rules upgrade](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/2025-10-30/2025-10-30.md#L5428-L5454)).
- The file URIs went on 2026-11-22, the second step of [the road to one engine for a page and a command line](../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road): their one caller, the generator, made a URL of each file's path and read the path back only to take it relative, and a page has no `node:url` to do it with. The relative path is now taken directly, and the check that the engine runs in a page lost its stand-in for `node:url`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `toWorkspaceRelativePath` {#symbol-toworkspacerelativepath}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/pathUtils.ts#L9)

##### `toWorkspaceRelativePath` — Summary
A file's path relative to the workspace, with forward slashes, or undefined when it lies outside the workspace or is
the workspace itself. A relative `candidate` is taken from the workspace. Until 2026-11-22 the generator made a file
URL of the path and read the path back from it before taking it relative, which a page cannot do without Node's
`node:url`; the round trip gave back the path it was handed, so the relative path is taken directly.

#### `normalizeWorkspacePath` {#symbol-normalizeworkspacepath}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/pathUtils.ts#L21)

##### `normalizeWorkspacePath` — Summary
Normalise a path so directory separators are POSIX-style.

#### `NAME_FAILURES` {#symbol-name_failures}
- Type: const
- Source: [source](../../../../../../packages/engine/src/tooling/pathUtils.ts#L33)
- Returns: `ReadonlySet`

##### `NAME_FAILURES` — Summary
The failures of a disk that mean it cannot hold a name or a path, rather than that it failed: a name too long, a name
it does not accept, a name that is already another's by its own rule of names, a path through something that is not a
folder. The history's tree writer leaves out and names an entry that meets one (`history/git.ts`), and any other
failed system call is the machine's, not the file's (`machineFailure`, `live-docs/processMark.ts`). Kept here, the one
light module both reach, since 2026-11-20: before, each held a copy, and `processMark.ts` loads TypeScript, which the
history command's own process otherwise never loads.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`enginePath.path`](./enginePath.ts.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
