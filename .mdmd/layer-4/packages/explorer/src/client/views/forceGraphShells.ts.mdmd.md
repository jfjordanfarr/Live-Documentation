# packages/explorer/src/client/views/forceGraphShells.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphShells.ts
- Generated At: 2026-11-07T07:49:38.369Z

## Authored
### Purpose
Builds the directory shells of the 3D Local Map's Group Wrappers experiment: which hidden files each directory's shell holds at the Shell Depth, which a pop releases and which stay loose, the bundled wires between shown files and shells with their counts in both directions, the rings left over, and each wrapped body's phantom packing, the deterministic arrangement its skin is drawn over, with what a shell's skin shows within it.

### Notes
Built on 2026-11-05 as experiment 2 of the shrink-wrap work, after the owner corrected experiment 1's rule that only a disconnected group may be wrapped: "The idea is to abstract a crapton of nodes into fewer ungulfing "nodes" (meshes that wrap those nodes)" ([Turn 11 of the November 5 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11)), and, of what to wrap, "obscuring nodes which aren't part of the hop chain in the current pin set" ([Turn 17 of the November 3 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-03.1.record.md#turn-17--november-4)). The rule here, directory shells as bodies, is one of several the owner may compare ([the design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)); reach-depth cells from the frontier and communities of the reference graph are named there and not built.

`partitionHidden` cuts each hidden file's directory to the depth, one deeper below a popped directory, and names a shell for the deepest directory holding all its files, so that a pop always opens onto more than one thing; a directory with fewer than two hidden files makes no shell, its file loose unless a pop opened its parent. Its work is memoised by directory: the T3 sample hides 19,398 files. `shellPicture` reads each link's ends once and bundles one wire per pair of ends, a shown pair being the picture's own wire and a pair inside one shell the shell's business. `bodyShape` packs a shell's own files one by one and each subdirectory as one ball at whose centre its files stand, the balls being the hull's `outline`, so that the skin's lumps are subdirectories and a large shell is wrapped at the cost of its few subdirectories. Measurements and their disappointments are in [the evidence](../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-05/directory-shells/README.md).

Until 2026-11-06 a shell's body was its files' volume without their padding, the rule that settled fastest of three measured, and the view drew the hull scaled down to it while a pop released the files at the packing's larger size; the owner saw "a vast difference between the skinned mesh and what emerges from it on click" ([Turn 3 of the November 6 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-3)). Since then a shell's body is its true size (`shellRadius` in `forceGraphLayout.ts`, its files' padded spheres at the packing's density), `bodyShape` packs its units inside it, a subdirectory's ball its own shell's size, pulls the first `SHOWN_UNITS` apart (`relaxApart`) and keeps each so far inside that its hull's polyhedron stays within the body (`HULL_REACH`), and hands the view those units (`GroupShape.units`) for the skin to show within it, where a pop leaves them. `packingRadius` now sizes the wrapped islands' packings alone. The pictures and the numbers are in [the evidence of November 6](../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-06/shell-mesh/README.md).

Since the second round of 2026-11-06, at the owner's wish to see "a bundle of nodes engulfed rather than just one which suddenly appears to multiply into many" ([Turn 4 of the November 6 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-4)), `bodyShape` builds a body from the leaves: `bubbleOf` makes each directory a bubble of its own files and its subdirectories' bubbles, built first, a chain of single directories collapsed into what it holds and a lone subdirectory file that file; `packBall` packs a bubble's units apart by the collision's gap (`bodyGaps`), a greedy placement for a few units and a relaxation through a dense grid for many; and the body lists every file's place, the radius it keeps, and what its skin shows, every file and inner bubble, those past `DRAWN_FILES` veiled. A wrapped group is one bubble about its seed. `phantomShape`, `packingRadius`, `SHOWN_UNITS` and the relaxation inside a fixed size went with this; nesting makes large shells larger, which [the evidence](../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-06/shell-leaves/README.md) measures.

The third round of 2026-11-07 fixed what the second left, without touching the nesting the owner still weighs. Packing every body a picture named in the frame that named it stalled the T3 sample's first picture one to two seconds, most of it in the 2,135 small bubbles of its largest shell: `packBall` now places up to 48 spheres testing each candidate place against the neighbours that can reach it and only when it would reach less far than the best yet, which chooses exactly the places it chose before (its tests pin three packings to the last digit), and `bodySteps` builds a body a bubble at a time, so that the view spreads a large picture's packing over frames (`bodyShape` runs the steps at once). `innerShape` takes the body a pop's bubble becomes from the popped body's packing instead of packing it again, since a bubble's packing depends only on what it holds. `pictureVeils` bounds the whole picture by `DRAWN_FILES` as one body is bounded, veiling the smallest bodies' interiors first (`veiledUnits`, the one veiled bubble such a skin shows); labels keep the true counts. The numbers are in [the evidence of November 7](../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-07/shell-faults/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `shellId` {#symbol-shellid}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L34)

##### `shellId` — Summary
The id of a directory's shell, outside the files' and the hubs' namespaces.

#### `shellDirectory` {#symbol-shelldirectory}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L37)

##### `shellDirectory` — Summary
The directory a shell stands for, or undefined for an id that is not a shell's.

#### `depthOf` {#symbol-depthof}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L40)

##### `depthOf` — Summary
How many directories deep a path is: none for the scan root, one for `packages`, two for `packages/explorer`.

#### `directoryAt` {#symbol-directoryat}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L43)

##### `directoryAt` — Summary
A directory cut to its first `depth` directories; a shallower directory is itself.

#### `DirectoryShell` {#symbol-directoryshell}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L48)

##### `DirectoryShell` — Summary
One shell: its id, its directory, and the hidden files it holds, in id order.

#### `ShellPartition` {#symbol-shellpartition}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L58)

##### `ShellPartition` — Summary
How the hidden files of a picture are held.

#### `partitionHidden` {#symbol-partitionhidden}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L99)
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
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L145)

##### `ShellCandidate` — Summary
A file the shells read: its id and path, and its kind, since a document is never held.

#### `ShellPicture (interface)` {#symbol-shellpicture-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L152)
- Extends: [`ShellPartition`](#symbol-shellpartition)

##### `ShellPicture (interface)` — Summary
What a picture's shells are: the partition, the bundled wires and the counts its rings show.

#### `ShellSource` {#symbol-shellsource}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L164)
- Constraints: [`ShellCandidate`](#symbol-shellcandidate)

##### `ShellSource` — Summary
What the shells of a picture are read from.

#### `shellPicture (function)` {#symbol-shellpicture-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L187)
- Returns: [`ShellPicture`](#symbol-shellpicture-interface)
- Parameters: `source`: [`ShellSource`](#symbol-shellsource)
- Constraints: [`ShellCandidate`](#symbol-shellcandidate)

##### `shellPicture (function)` — Summary
The shells of a picture: the hidden files partitioned by directory (documents left hidden: a shell holds files), each
reference between a shown or released file and a held file, or between files of two shells, bundled into one wire per
pair of ends, and the counts left for the rings: a file whose hidden neighbours are all held needs no ring, since the
shell says it.

#### `BodyGaps (interface)` {#symbol-bodygaps-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L230)

##### `BodyGaps (interface)` — Summary
The room a body keeps between two of its units' surfaces, and between its units and its skin, in a tuning's units.

#### `bodyGaps (function)` {#symbol-bodygaps-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L238)
- Returns: [`BodyGaps`](#symbol-bodygaps-interface)

##### `bodyGaps (function)` — Summary
A body's gaps for a tuning: the collision's gap between units, half of it to the skin (2026-11-06, second round).

#### `packBall` {#symbol-packball}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L265)

##### `packBall` — Summary
Pack spheres into a ball, apart by `gap` between their surfaces, about the origin (2026-11-06, second round): they start
on a Fibonacci ball, the largest nearest the centre, and are pulled toward the centre and pushed apart in turn, the
lighter of two moving the more, then only pushed apart until no two are closer than the gap by more than a hundredth
of it; one named `centre` stands at the origin throughout, as a wrapped group's seed does. A ball of mixed spheres
settles at about the density of spheres poured into a jar. The places depend only on the spheres given, not on their
order. Returns each sphere's place and the radius from the origin that holds them all.

#### `BodyBuilding` {#symbol-bodybuilding}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L455)
- Returns: `Generator`

##### `BodyBuilding` — Summary
A body's building, a step at a time: each step one bubble packed (2026-11-07, third round).

#### `DRAWN_FILES` {#symbol-drawn_files}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L501)

##### `DRAWN_FILES` — Summary
The most files a body draws within its skins (2026-11-06, second round): over it, the bubbles whose files would pass it
are drawn veiled, their files unseen. Set by the cost of drawing spheres in the software renderer this repository's
pictures are taken in; the label keeps the true count.

#### `bodyShape` {#symbol-bodyshape}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L512)
- Returns: [`GroupShape`](./forceGraphWrappers.ts.mdmd.md#symbol-groupshape)
- Parameters: `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)
- Constraints: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)

##### `bodyShape` — Summary
A body's packing of its files, as the tuning sizes them, built from the leaves (2026-11-06, second round). A directory
shell is the bubble of its directory (`bubbleOf`): every file a sphere inside the innermost bubble that holds it. A
wrapped group is one bubble of its files about its seed, which stands at the centre. The result names every file's
place about the body's centre (`members`), the spheres the hull is taken over, the body's own units (`outline`), its
radius, the margin the hull pads them by, and what its skin shows within it (`units`): every inner bubble and every
file but a group's seed, opened breadth-first from the body itself while the files shown stay within `DRAWN_FILES`,
a bubble that would pass it drawn veiled with nothing shown inside it. Nothing depends on the order the files are given in.

#### `bodySteps` {#symbol-bodysteps}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L526)
- Returns: [`BodyBuilding`](#symbol-bodybuilding)
- Parameters: `tuning`: [`ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning)
- Constraints: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)

##### `bodySteps` — Summary
`bodyShape` a bubble at a time (2026-11-07, third round): the page builds a large picture's bodies over frames, a few
bubbles a frame, rather than all in the frame that names them, a stall of one to two seconds on the T3 sample. The
result is `bodyShape`'s, whatever the steps are spread over.

#### `innerShape` {#symbol-innershape}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L548)
- Returns: [`GroupShape`](./forceGraphWrappers.ts.mdmd.md#symbol-groupshape)
- Parameters: `shape`: [`GroupShape`](./forceGraphWrappers.ts.mdmd.md#symbol-groupshape)

##### `innerShape` — Summary
The body a bubble inside this one would be as the shell of its directory (2026-11-07, third round): what a pop makes
of each bubble it releases. Since a bubble's packing depends only on what it holds, this is the shape `bodyShape`
would build for the bubble's files, taken from the packing already made instead of packing again; undefined when no
bubble directly inside the body is that directory's.

#### `veiledUnits` {#symbol-veiledunits}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L559)
- Returns: [`BodyUnit`](./forceGraphWrappers.ts.mdmd.md#symbol-bodyunit)[]

##### `veiledUnits` — Summary
What a body's skin shows when nothing is drawn within it: one veiled bubble filling it, never an empty skin; the
label keeps the true count. A body whose own files pass `DRAWN_FILES` is drawn so, and since 2026-11-07 any body the
picture's budget (`pictureVeils`) veils.

#### `pictureVeils` {#symbol-pictureveils}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L570)
- Parameters: `bodies`: `ReadonlyArray`

##### `pictureVeils` — Summary
Which bodies of a picture draw nothing within their skins, so that the picture as a whole draws no more files within
skins than `DRAWN_FILES`, as one body does (2026-11-07, third round): while the files drawn pass the limit, the
smallest body still drawn, by the files it holds, is veiled. Each body is given by its id, the files it holds and the
files its skin would draw; the ids veiled are returned. Labels keep the true counts.

#### `poppedAfter` {#symbol-poppedafter}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphShells.ts#L626)
- Parameters: `popped`: `ReadonlySet`

##### `poppedAfter` — Summary
The pops of a picture after `directory` is popped open, or wrapped again with every pop beneath it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ForceGraphTuning`](../types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`fileConnections.FileConnection`](./fileConnections.ts.mdmd.md#symbol-fileconnection) (type-only)
- [`forceGraphLayout.Placed`](./forceGraphLayout.ts.mdmd.md#symbol-placed)
- [`forceGraphLayout.SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)
- [`forceGraphLayout.seededDirection`](./forceGraphLayout.ts.mdmd.md#symbol-seededdirection)
- [`forceGraphLayout.spatialNodeRadius`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnoderadius)
- [`forceGraphWrappers.BodyUnit`](./forceGraphWrappers.ts.mdmd.md#symbol-bodyunit) (type-only)
- [`forceGraphWrappers.GroupMember`](./forceGraphWrappers.ts.mdmd.md#symbol-groupmember) (type-only)
- [`forceGraphWrappers.GroupShape`](./forceGraphWrappers.ts.mdmd.md#symbol-groupshape) (type-only)
- [`directory-bands.parentDirectory`](./localView/directory-bands.ts.mdmd.md#symbol-parentdirectory)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
