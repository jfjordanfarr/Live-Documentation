# `packages/explorer/src/client/views/localView/wire-words.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/wire-words.ts`
- Generated At: 2026-11-21T09:00:48.061Z

## Authored
### Purpose
What a 2D wire says when asked under Tuning → 2D Wires → Wire Answers, a trial: one sentence with the using file as its subject ("`pathfind.ts` uses `graph.ts`"), then what is used, a few of the symbols' names and a count of the rest, and how many references; for a bundle's shared run, the offering file and who uses it ("`graph.ts` is used by …"). Pure. [`wire-answers.ts`](wire-answers.ts.mdmd.md) draws the words and gives each wire's band the same sentence as its spoken name.

### Notes
- Made on November 21, 2026, from the root's brief on strangers' top-ranked stumble, which way a line runs ([the probe](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/line-direction/README.md)). The only words of ours are "uses", "is used by" and "references"; everything else is the scan's own names, as the cards show them, an end with no symbol named "Internals" as its row is.
- A wire's references are weighed as the layout weighs it (`branch-scene.ts`): a pair line by its count of the graph's links, a reference by the references the scan counted between its two ends, else one. The rest of a list is counted as "+2", the sign the cards' own counts use, rather than in words.
- The sentence replaces a gathered wire's "X offers Y n references" where the lever is on; with it off, nothing here is used. The pictures are [the line-direction evidence](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Screenshots/line-direction/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `NAMES_SHOWN` {#symbol-names_shown}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-words.ts#L17)

##### `NAMES_SHOWN` — Summary
How many names a list shows before it counts the rest.

#### `NameList (interface)` {#symbol-namelist-interface}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-words.ts#L20)

##### `NameList (interface)` — Summary
A list of names, the first few shown and the rest counted.

#### `WireWords (interface)` {#symbol-wirewords-interface}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-words.ts#L26)

##### `WireWords (interface)` — Summary
What a wire says: its head, the files at its two ends joined by a verb, then what is used and its references.

#### `nameList (function)` {#symbol-namelist-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-words.ts#L44)
- Returns: [`NameList`](#symbol-namelist-interface)

##### `nameList (function)` — Summary
The first few distinct names, in their order, and how many others there are.

#### `referencesOf` {#symbol-referencesof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-words.ts#L53)
- Parameters: `edge`: [`LocalEdge`](./types.ts.mdmd.md#symbol-localedge)

##### `referencesOf` — Summary
How many references one drawn wire carries: a pair line's count of the graph's links, else the references the scan
counted between its two ends, else one (the count the layout weighs a wire by, branch-scene.ts).

#### `wireWords (function)` {#symbol-wirewords-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-words.ts#L67)
- Returns: [`WireWords`](#symbol-wirewords-interface)

##### `wireWords (function)` — Summary
What a wire between two files says: an ordinary reference, a pair line of an opened directory, or the overview band's
gathered wire, whose members are given. Every member joins the same two files, the using one `sourceId`.

#### `runWords` {#symbol-runwords}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-words.ts#L79)
- Returns: [`WireWords`](#symbol-wirewords-interface)

##### `runWords` — Summary
What a bundle's shared run says: the offering file, who uses it, and the symbols its wires carry.

#### `listText` {#symbol-listtext}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-words.ts#L91)
- Parameters: `list`: [`NameList`](#symbol-namelist-interface)

##### `listText` — Summary
A list as it reads: its names joined by commas, the rest counted after them.

#### `referencesText` {#symbol-referencestext}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-words.ts#L96)

##### `referencesText` — Summary
The count of references, in the one plural the product uses.

#### `headText` {#symbol-headtext}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-words.ts#L101)
- Parameters: `words`: [`WireWords`](#symbol-wirewords-interface)

##### `headText` — Summary
The sentence's head: "`PaymentService.cs` uses `PaymentsContext.cs`".

#### `sentence` {#symbol-sentence}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-words.ts#L106)
- Parameters: `words`: [`WireWords`](#symbol-wirewords-interface)

##### `sentence` — Summary
The whole sentence as one line, the wire's spoken name: the head, what is used, and the references.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`wire-gathering.NODE_HUB`](./wire-gathering.ts.mdmd.md#symbol-node_hub)
<!-- LIVE-DOC:END Dependencies -->
