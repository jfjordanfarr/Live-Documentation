# packages/explorer/src/client/views/forceGraphShells.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphShells.ts
- Generated At: 2026-11-06T02:11:47.739Z

## Authored
### Purpose
Builds the directory shells of the 3D Local Map's Group Wrappers experiment: which hidden files each directory's shell holds at the Shell Depth, which a pop releases and which stay loose, the bundled wires between shown files and shells with their counts in both directions, the rings left over, and each wrapped body's phantom packing, the deterministic arrangement its skin is drawn over.

### Notes
Built on 2026-11-05 as experiment 2 of the shrink-wrap work, after the owner corrected experiment 1's rule that only a disconnected group may be wrapped: "The idea is to abstract a crapton of nodes into fewer ungulfing "nodes" (meshes that wrap those nodes)" ([Turn 11 of the November 5 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11)), and, of what to wrap, "obscuring nodes which aren't part of the hop chain in the current pin set" ([Turn 17 of the November 3 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-03.1.record.md#turn-17--november-4)). The rule here, directory shells as bodies, is one of several the owner may compare ([the design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)); reach-depth cells from the frontier and communities of the reference graph are named there and not built.

`partitionHidden` cuts each hidden file's directory to the depth, one deeper below a popped directory, and names a shell for the deepest directory holding all its files, so that a pop always opens onto more than one thing; a directory with fewer than two hidden files makes no shell, its file loose unless a pop opened its parent. Its work is memoised by directory: the T3 sample hides 19,398 files. `shellPicture` reads each link's ends once and bundles one wire per pair of ends, a shown pair being the picture's own wire and a pair inside one shell the shell's business. `shellRadius` (in `forceGraphLayout.ts`) sizes a shell's body by its files without their padding, the rule that settled fastest of three measured; `packingRadius` packs them in their padding, and the view draws the hull scaled to fit the body. `bodyShape` packs a shell's own files one by one and each subdirectory as one ball at whose centre its files stand, the balls being the hull's `outline`, so that the skin's lumps are subdirectories and a large shell is wrapped at the cost of its few subdirectories. Measurements and their disappointments are in [the evidence](../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-05/directory-shells/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `shellId` {#symbol-shellid}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L30)

##### `shellId` — Summary
The id of a directory's shell, outside the files' and the hubs' namespaces.

#### `shellDirectory` {#symbol-shelldirectory}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L33)

##### `shellDirectory` — Summary
The directory a shell stands for, or undefined for an id that is not a shell's.

#### `depthOf` {#symbol-depthof}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L36)

##### `depthOf` — Summary
How many directories deep a path is: none for the scan root, one for `packages`, two for `packages/explorer`.

#### `directoryAt` {#symbol-directoryat}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L39)

##### `directoryAt` — Summary
A directory cut to its first `depth` directories; a shallower directory is itself.

#### `DirectoryShell` {#symbol-directoryshell}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L44)

##### `DirectoryShell` — Summary
One shell: its id, its directory, and the hidden files it holds, in id order.

#### `ShellPartition` {#symbol-shellpartition}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L54)

##### `ShellPartition` — Summary
How the hidden files of a picture are held.

#### `partitionHidden` {#symbol-partitionhidden}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L95)
- Returns: [`ShellPartition`](#symbol-shellpartition)
- Parameters: `hidden`: `ReadonlyArray`; `popped`: `ReadonlySet`

##### `partitionHidden` — Summary
Partition the hidden files by directory: a file belongs to the shell of its directory cut to `depth`, or, where that
directory is open, of its directory cut one deeper, until a directory not open; a file whose own directory is open is
released into the picture. A directory of fewer than two hidden files makes no shell: its file stays loose, unless a
pop opened its parent, when it is released with the popped directory's own files, so that a pop loses nothing it held.
A shell stands for the deepest directory holding all its files, so that a pop always opens onto more than one thing:
this repository's `packages/engine` shell, whose hidden files all lie under `src`, is `engine/src`, and a pop of it
opens `src` and the chain above it. Files are given by id with their path.

#### `ShellCandidate` {#symbol-shellcandidate}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L141)

##### `ShellCandidate` — Summary
A file the shells read: its id and path, and its kind, since a document is never held.

#### `ShellPicture (interface)` {#symbol-shellpicture-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L148)
- Extends: [`ShellPartition`](#symbol-shellpartition)

##### `ShellPicture (interface)` — Summary
What a picture's shells are: the partition, the bundled wires and the counts its rings show.

#### `ShellSource` {#symbol-shellsource}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L160)
- Constraints: [`ShellCandidate`](#symbol-shellcandidate)

##### `ShellSource` — Summary
What the shells of a picture are read from.

#### `shellPicture (function)` {#symbol-shellpicture-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L183)
- Returns: [`ShellPicture`](#symbol-shellpicture-interface)
- Parameters: `source`: [`ShellSource`](#symbol-shellsource)
- Constraints: [`ShellCandidate`](#symbol-shellcandidate)

##### `shellPicture (function)` — Summary
The shells of a picture: the hidden files partitioned by directory (documents left hidden: a shell holds files), each
reference between a shown or released file and a held file, or between files of two shells, bundled into one wire per
pair of ends, and the counts left for the rings: a file whose hidden neighbours are all held needs no ring, since the
shell says it.

#### `OUTER_LAYER` {#symbol-outer_layer}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L226)

##### `OUTER_LAYER` — Summary
How many of a body's members stand in its outer layer, the skin's lumps, when it has more.

#### `phantomShape` {#symbol-phantomshape}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L237)
- Returns: [`GroupShape`](./forceGraphWrappers.ts.mdmd.md#symbol-groupshape)
- Parameters: `members`: `ReadonlyArray`

##### `phantomShape` — Summary
Where a body's members stand while it is wrapped: a phantom packing, never a layout. Up to `OUTER_LAYER` members, the
first by a hash of their ids, stand in an outer layer near the skin, each at a direction of a Fibonacci sphere turned
toward one seeded by its id and at a depth the id jitters, so that the hull over them is lumpy rather than a gem; the
rest fill the inner part of the body the same way, so that the hull is shaped by the few on its outside and a large
body costs no more to wrap than a small one. Each member stands so far inside that its sphere, padded, stays within
`bodyRadius`, at the centre when it cannot. A member named `centre` stands at the centre itself, as a wrapped group's
seed does. Positions are relative to the centre, and they and the members' order, by the hash, do not depend on the order given.

#### `packingRadius` {#symbol-packingradius}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L271)

##### `packingRadius` — Summary
The radius a packing of so many files takes: their volume, each a file with no symbols in a wrapper's padding, so that
every member's padded sphere fits and the hull over them is lumpy. A shell's body in the field is smaller
(`shellRadius`, the files without their padding), and the view draws the hull and births the files a pop releases
scaled down to fit it.

#### `bodyShape` {#symbol-bodyshape}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L282)
- Returns: [`GroupShape`](./forceGraphWrappers.ts.mdmd.md#symbol-groupshape)
- Parameters: `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)
- Constraints: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)

##### `bodyShape` — Summary
A body's phantom packing of its files, as the tuning sizes them, each file its own sphere inside a packing of so many
padded files. A wrapped group packs its files about its seed. A directory shell packs its own files one by one and each
subdirectory as one ball of its files' volume, its files at its centre, so that the lumps of its skin, its outline,
are its subdirectories and a pop releases each subdirectory's shell where its ball stood, the balloons inside the
balloon.

#### `poppedAfter` {#symbol-poppedafter}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L311)
- Parameters: `popped`: `ReadonlySet`

##### `poppedAfter` — Summary
The pops of a picture after `directory` is popped open, or wrapped again with every pop beneath it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`fileConnections.FileConnection`](./fileConnections.ts.mdmd.md#symbol-fileconnection) (type-only)
- [`forceGraphLayout.SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)
- [`forceGraphLayout.seededDirection`](./forceGraphLayout.ts.mdmd.md#symbol-seededdirection)
- [`forceGraphLayout.spatialNodeRadius`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnoderadius)
- [`forceGraphWrappers.GroupMember`](./forceGraphWrappers.ts.mdmd.md#symbol-groupmember) (type-only)
- [`forceGraphWrappers.GroupShape`](./forceGraphWrappers.ts.mdmd.md#symbol-groupshape) (type-only)
- [`directory-bands.parentDirectory`](./localView/directory-bands.ts.mdmd.md#symbol-parentdirectory)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
