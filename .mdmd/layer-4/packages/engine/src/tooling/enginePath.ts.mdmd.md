# `packages/engine/src/tooling/enginePath.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/enginePath.ts`
- Generated At: 2026-11-24T10:33:10.104Z

## Authored
### Purpose
Pure, zero-Node-import path arithmetic (`basename`, `dirname`, `extname`, `isAbsolute`, `join`, `normalize`, `relative`, `resolve`, `sep`, and strict `posix`) used across the engine and generator core, handling both POSIX paths and Windows drive/UNC workspace roots.

### Notes
- Added on 2026-11-24 as Step 9 of [One Engine, Two Hosts](../../../../../layer-3/engine-and-hosts.mdmd.md), replacing `node:path` across all 36 modules on the browser scan import graph and eliminating the final browser stand-in (`tests/page-scan/stand-ins/path.mjs`).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `sep` {#symbol-sep}
- Type: const
- Source: [source](../../../../../../packages/engine/src/tooling/enginePath.ts#L300)

##### `sep` — Summary
Path separator used throughout the engine (`"/"`).

#### `isAbsolute` {#symbol-isabsolute}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/enginePath.ts#L303)

##### `isAbsolute` — Summary
Returns whether `path` is absolute (POSIX leading `/` or Windows drive/UNC root).

#### `normalize` {#symbol-normalize}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/enginePath.ts#L322)

##### `normalize` — Summary
Normalises `.` and `..` segments, preserving POSIX roots as well as Windows drive or UNC roots.

#### `join` {#symbol-join}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/enginePath.ts#L329)

##### `join` — Summary
Joins path segments with `"/"` and normalises the result, preserving Windows drive/UNC prefixes when present.

#### `resolve` {#symbol-resolve}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/enginePath.ts#L346)

##### `resolve` — Summary
Resolves a sequence of paths into an absolute path (using `"/"` as root when no argument is absolute).

#### `relative` {#symbol-relative}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/enginePath.ts#L395)

##### `relative` — Summary
Computes the relative path from `from` to `to`, handling both POSIX and Windows drive/UNC roots.

#### `dirname` {#symbol-dirname}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/enginePath.ts#L415)

##### `dirname` — Summary
Returns the directory name of `path`.

#### `basename` {#symbol-basename}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/enginePath.ts#L430)

##### `basename` — Summary
Returns the last segment of `path`, optionally stripping a trailing `suffix`.

#### `extname` {#symbol-extname}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/enginePath.ts#L441)

##### `extname` — Summary
Returns the extension of `path` (from the last `.` in the final segment to end of string).

#### `EnginePosixPath` {#symbol-engineposixpath}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/enginePath.ts#L451)

##### `EnginePosixPath` — Summary
Strict POSIX path functions, matching `node:path.posix`.

#### `posix` {#symbol-posix}
- Type: const
- Source: [source](../../../../../../packages/engine/src/tooling/enginePath.ts#L489)
- Returns: [`EnginePosixPath`](#symbol-engineposixpath)

##### `posix` — Summary
Strict POSIX path namespace (`node:path.posix` equivalent).

#### `enginePath` {#symbol-enginepath}
- Type: default (default)
- Source: [source](../../../../../../packages/engine/src/tooling/enginePath.ts#L505)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
