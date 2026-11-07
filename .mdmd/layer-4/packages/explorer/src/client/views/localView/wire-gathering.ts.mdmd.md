# packages/explorer/src/client/views/localView/wire-gathering.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/wire-gathering.ts
- Generated At: 2026-11-06T20:08:42.399Z

## Authored
### Purpose

The overview band's wires for the 2D Local Map, as pure functions: every pair of files joined by a wire gathered under one wire each way, with its member wires, its count and whether it reads against the columns; the wires a pinned symbol keeps as its own there; a gathered wire's width from its count, between one wire's width and four times it; and its accessible description, its two files and its count. The wires' drawing in `connections.ts` draws what these return.

### Notes

Written in the far bands' second milestone (2026-11-06), from the root's brief after the owner's November 5 offer of a "'Sixth' order which collapses all symbols down to a single highly-split-out node-level connection" ([November 5, Turn 10](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-10)) and the go-ahead of [November 6, Turn 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-3). A pair is keyed offering file first, so that a pair whose wires run both ways gets one wire each way. A file's wires to itself join no pair of cards and are left out of the gathering; a pinned symbol keeps a self-reference only when both its rows are pinned, since only then are both drawn at the overview band (the root's amendment: a silent row draws nothing, its dots included). The width grows with the logarithm of the count, as the bundles' shared runs had, from 2.2 px, one wire's own width in the stylesheet, to a ceiling of four times that.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GatheredWire` {#symbol-gatheredwire}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L14)

##### `GatheredWire` — Summary
One wire standing for every wire from one file to another at the overview band.

#### `GATHERED_WIDTH` {#symbol-gathered_width}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L28)

##### `GATHERED_WIDTH` — Summary
The least and greatest width of a gathered wire, in the map's own pixels: one wire's own width, and four times it.

#### `gatherWires` {#symbol-gatherwires}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L35)
- Returns: [`GatheredWire`](#symbol-gatheredwire)[]
- Parameters: `edge`: [`LocalEdge`](./types.ts.mdmd.md#symbol-localedge)

##### `gatherWires` — Summary
Every pair of files joined by a wire, once each way: the wires from one file to another gathered under one, in the
order their first member came. A file's wires to itself join no pair of cards and are left out; a pinned symbol's own
self-references are drawn by {@link ownWires}.

#### `ownWires` {#symbol-ownwires}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L51)
- Returns: [`LocalEdge`](./types.ts.mdmd.md#symbol-localedge)[]

##### `ownWires` — Summary
The wires a pinned symbol keeps at the overview band: every wire with a pinned symbol at either end, by its symbols as
the rows carry them. A self-reference is kept only when both its ends are pinned, since only then are both its rows
drawn; any other wire has at least one end on a drawn row and the other on its file's hub at worst.

#### `gatheredWidth` {#symbol-gatheredwidth}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L59)

##### `gatheredWidth` — Summary
A gathered wire's width in the map's own pixels: one wire's for one, growing with the logarithm of its count to a ceiling.

#### `gatheredDescription` {#symbol-gathereddescription}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/wire-gathering.ts#L65)
- Parameters: `wire`: [`GatheredWire`](#symbol-gatheredwire)

##### `gatheredDescription` — Summary
The accessible description of a gathered wire: its two files and its count, by the names the cards show.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
<!-- LIVE-DOC:END Dependencies -->
