# packages/explorer/src/client/views/localView/returning-connections.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/returning-connections.ts
- Generated At: 2026-11-19T05:22:12.984Z

## Authored
### Purpose
The one count of the connections a 2D Local Map picture draws against its left-to-right order, a cycle's returning references, from which both the cards' feet ("N connections return in a cycle", per card) and the 3D button's number (per picture, each return once) come, so that the two cannot disagree; and the button's two strengths by that number.

### Notes
Written on 2026-11-15 ([Turn 1](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)). The owner opened branch-renderer.ts, saw many connections leave the right of a card and travel leftward, and the 3D button did not light: the cue of 2026-11-02 counted only a forward wire whose drawn route doubles back, and a cycle's returns, the ordinary case and the one the owner described when asking for the cue, never reached the count. `returningConnections` takes the picture's references, the ranking's test of a returning one and the picture's test of a drawn one, and returns them with their number and by file; a file's references to itself never count, and a pair line counts the links it stands for. The callers pass `drawsReference` of [connections.ts](connections.ts.mdmd.md), both rows disclosed, which holds at every look; the drawing adds that neither end is still fading. `backwardStrength` gives some below `MANY_BACKWARD` and many from it; the boundary is set from the measurement its comment records.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReturningConnections (interface)` {#symbol-returningconnections-interface}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/returning-connections.ts#L10)

##### `ReturningConnections (interface)` — Summary
The connections a 2D picture draws against its left-to-right order: the references between two different files that
the ranking reads backward, each a cycle's feedback, drawn as laces at its two pins with its whole route on hover. A
card's foot says how many touch the card ("6 connections return in a cycle"), and the 3D button lights for the
picture's number of them (2026-11-15). Both come from here, so that the cards and the button cannot disagree.

#### `returningConnections (function)` {#symbol-returningconnections-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/returning-connections.ts#L24)
- Returns: [`ReturningConnections`](#symbol-returningconnections-interface)
- Parameters: `edge`: [`LocalEdge`](./types.ts.mdmd.md#symbol-localedge)

##### `returningConnections (function)` — Summary
The returning references among `links`: each that runs between two different files, that `isBack` says the ranking
reads backward, and that `drawn` says the picture draws. A file's references to itself, its laces within one card,
join no two files and never count.

#### `connectionCount` {#symbol-connectioncount}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/returning-connections.ts#L36)

##### `connectionCount` — Summary
How many connections the given references are, a pair line counted by the links it stands for.

#### `BackwardStrength (type)` {#symbol-backwardstrength-type}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/returning-connections.ts#L41)

##### `BackwardStrength (type)` — Summary
How strongly the 3D button calls: not at all, for some connections drawn against the order, or for many.

#### `BACKWARD_STRENGTHS` {#symbol-backward_strengths}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/returning-connections.ts#L44)

##### `BACKWARD_STRENGTHS` — Summary
The strengths, weakest first.

#### `MANY_BACKWARD` {#symbol-many_backward}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/returning-connections.ts#L53)

##### `MANY_BACKWARD` — Summary
The fewest connections drawn against the order for which the 3D button calls at its stronger strength. Set on
2026-11-15 from how often pictures light the cue: of 161 files each opened alone (every file of this repository's
Local Map folder, 59 spread over its packages, every file of the estate sample), 143 drew none, 14 drew one to four,
4 drew five to nine (branch-renderer.ts and forceGraphScope.ts 8, core.ts 7, controller.ts 6) and none drew ten or
more. Five sets the stronger call on the few pictures that strain most, the owner's branch-renderer.ts among them.

#### `backwardStrength (function)` {#symbol-backwardstrength-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/returning-connections.ts#L56)
- Returns: [`BackwardStrength`](#symbol-backwardstrength-type)

##### `backwardStrength (function)` — Summary
The 3D button's strength for a picture's number of connections drawn against its left-to-right order.

#### `LaidBox` {#symbol-laidbox}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/returning-connections.ts#L61)

##### `LaidBox` — Summary
A box the map lays out, a card's or a closed directory's, in the wires' frame.

#### `RETURN_CLEARANCE` {#symbol-return_clearance}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/returning-connections.ts#L69)

##### `RETURN_CLEARANCE` — Summary
How far a returning connection's route keeps from the boxes it passes over, and how far it turns out from its pins.

#### `returnRoute` {#symbol-returnroute}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/returning-connections.ts#L80)

##### `returnRoute` — Summary
A returning connection's route while a hover keeps it (2026-11-19): from the offering file's pin, out to the right of
its card, up and back over every box between the two pins, and down into the using file's pin from the left, so that
it crosses no card and no name. Until then it was the one curve from pin to pin, which crossed both cards, and once the
hubs stood at the names it struck both names through; a line through a name reads as its deletion. Running backward
above the picture it reads as the cycle's way back and cannot be taken for a forward wire, which runs left to right
between columns. The run stands `RETURN_CLEARANCE` above the highest box that a run at its height would meet between
the turns; a box above that height meets no run and does not lift it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`directory-flow.linksOf`](./directory-flow.ts.mdmd.md#symbol-linksof)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
<!-- LIVE-DOC:END Dependencies -->
