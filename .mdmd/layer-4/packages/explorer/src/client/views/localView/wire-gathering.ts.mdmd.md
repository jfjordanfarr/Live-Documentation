# `packages/explorer/src/client/views/localView/wire-gathering.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/wire-gathering.ts`
- Generated At: 2026-11-19T21:10:17.175Z

## Authored
### Purpose

The overview band's wires for the 2D Local Map, as pure functions: every pair of files joined by a wire gathered under one wire each way, with its member wires, its count and whether it reads against the columns; the wires a pinned symbol keeps as its own there; a gathered wire's width from its count, between one wire's width and four times it; and its accessible description, its two files and its count. The wires' drawing in `connections.ts` draws what these return.

### Notes

Written in the far bands' second milestone (2026-11-06), from the root's brief after the owner's November 5 offer of a "'Sixth' order which collapses all symbols down to a single highly-split-out node-level connection" ([November 5, Turn 10](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-10)) and the go-ahead of [November 6, Turn 3](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-06/2026-11-06.1.record.md#turn-3). A pair is keyed offering file first, so that a pair whose wires run both ways gets one wire each way. A file's wires to itself join no pair of cards and are left out of the gathering; a pinned symbol keeps a self-reference only when both its rows are pinned, since only then are both drawn at the overview band (the root's amendment: a silent row draws nothing, its dots included). The width grows with the logarithm of the count, as the bundles' shared runs had, from 2.2 px, one wire's own width in the stylesheet, to a ceiling of four times that.

Since 2026-11-12 the module also names the node-level hubs (`NODE_HUB`, moved from `card-factory.ts`) and counts a gathered wire by `gatheredCount`, in which a member that is itself a pair line of an opened directory counts the links it stands for, so that the overview band draws the directory flow trial's lines at the widths the closer bands do.

Since 2026-11-19 ([Turn 23 of the November 18 record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-23)) `wireDescription` names any one drawn connection, first a returning connection's laces: a pair line as a gathered wire is named, a reference by its two ends, a row's symbol named in its file as the row's own name says it ("PaymentService in PaymentService.cs offers App.config").

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `NODE_HUB` {#symbol-node_hub}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L18)

##### `NODE_HUB` — Summary
The registry's name for a card's node-level hubs, `inbound:#hub` and `outbound:#hub`, by which the overview band's
gathered wires find them (2026-11-06) and which a pair line of an opened directory carries for its symbols at both
ends (the directory flow trial, 2026-11-12); no symbol is named so.

#### `hubLine` {#symbol-hubline}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L29)

##### `hubLine` — Summary
Where a card's node-level hubs stand, below the top of its header (the file's name and the room its controls keep), in
the map's own units (2026-11-19): at the middle of the header's first line, where no symbol row can be mistaken for a
hub's end. A name of one line beside the controls' room makes one line as tall as the taller of the two, and the hubs
stand at its middle; every other first line is a line of the name. The page reads the header from itself (the branch
renderer's `standHubs`), and the layout lab's card model computes it from the name's lines, so that both stand a hub
alike. Until then a hub stood half way down its card, level with whichever row stood there, and the owner read a
line's end as that row's.

#### `GatheredWire` {#symbol-gatheredwire}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L35)

##### `GatheredWire` — Summary
One wire standing for every wire from one file to another at the overview band.

#### `GATHERED_WIDTH` {#symbol-gathered_width}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L49)

##### `GATHERED_WIDTH` — Summary
The least and greatest width of a gathered wire, in the map's own pixels: one wire's own width, and four times it.

#### `gatherWires` {#symbol-gatherwires}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L56)
- Returns: [`GatheredWire`](#symbol-gatheredwire)[]
- Parameters: `edge`: [`LocalEdge`](./types.ts.mdmd.md#symbol-localedge)

##### `gatherWires` — Summary
Every pair of files joined by a wire, once each way: the wires from one file to another gathered under one, in the
order their first member came. A file's wires to itself join no pair of cards and are left out; a pinned symbol's own
self-references are drawn by {@link ownWires}.

#### `ownWires` {#symbol-ownwires}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L72)
- Returns: [`LocalEdge`](./types.ts.mdmd.md#symbol-localedge)[]

##### `ownWires` — Summary
The wires a pinned symbol keeps at the overview band: every wire with a pinned symbol at either end, by its symbols as
the rows carry them. A self-reference is kept only when both its ends are pinned, since only then are both its rows
drawn; any other wire has at least one end on a drawn row and the other on its file's hub at worst.

#### `gatheredWidth` {#symbol-gatheredwidth}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L80)

##### `gatheredWidth` — Summary
A gathered wire's width in the map's own pixels: one wire's for one, growing with the logarithm of its count to a ceiling.

#### `gatheredCount` {#symbol-gatheredcount}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L89)

##### `gatheredCount` — Summary
How many references a gathered wire carries: one for each member wire, and for a member that is itself a pair line of
an opened directory, already gathered from the graph's links, as many as it stands for.

#### `gatheredDescription` {#symbol-gathereddescription}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L94)
- Parameters: `wire`: [`GatheredWire`](#symbol-gatheredwire)

##### `gatheredDescription` — Summary
The accessible description of a gathered wire: its two files and its count, by the names the cards show.

#### `wireDescription` {#symbol-wiredescription}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L105)
- Parameters: `edge`: [`LocalEdge`](./types.ts.mdmd.md#symbol-localedge)

##### `wireDescription` — Summary
The accessible description of one drawn connection, in the scan's own names (2026-11-19, first for a returning
connection's laces): a pair line of an opened directory as a gathered wire is described; a reference by its two ends,
a row's symbol named in its file as the row's own name says it ("Post in PaymentService.cs"), an end at a file's
Internals or hub by the file alone.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
<!-- LIVE-DOC:END Dependencies -->
