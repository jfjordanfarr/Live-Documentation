# packages/explorer/src/client/views/localView/name-cut.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/name-cut.ts
- Generated At: 2026-11-16T04:49:21.287Z

## Authored
### Purpose
Current. A symbol's name held to one line and cut with an ellipsis where its room does not hold it: at its end ("DocumentationLinkEnforc…"), or in its middle at its seams, the first and the last pieces kept about the ellipsis ("Documentation…Result"). Pure: the caller gives the name, its seam segments, the room and a measure. The card reading uses it for the two values of Descriptions Zoomed Out in which every described row keeps its description's first line.

### Notes
Written on 2026-11-15 ([Turn 1 of the November 15 record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)). The owner, shown the trial that kept a description's first line only under a name on one line: "the only reason it doesn't look quite as good in these screenshots is because the symbol name itself is willing to wrap onto a new line (I'm not confident this is preferable)". Holding the name to one line means cutting the long ones, and how a long name is cut is itself a thing to see, so there are two cuts for the owner to compare ([the pictures](../../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-15/descriptions-kept/README.md)).

The middle cut keeps whole seam segments from the name's start and from its end and leaves at least one out between them; of the cuts that fit it takes the one that keeps the most characters, and of equals the one that keeps more of the name's end, since the names of one card often share their beginning and differ at their end. It breaks only at the seams (`word-seams.ts`'s, which the name fitting already uses): where the first and the last piece do not fit together about the ellipsis, or the name has fewer than three pieces, the name is cut at its end. A first build cut inside the first piece there and kept the last whole, and drew "Documentatio…Violation", "Pa…Service" and "ref…Presentation", which read worse than an end cut; it was removed the same day.

Nothing here changes a size, and the whole name is not this module's to keep: the card reading leaves the name's own text in the page and the row's accessible name as they are, and draws the cut over it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ELLIPSIS` {#symbol-ellipsis}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/name-cut.ts#L17)

##### `ELLIPSIS` — Summary
The mark of a cut.

#### `NameCut` {#symbol-namecut}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/name-cut.ts#L20)

##### `NameCut` — Summary
How a name that does not fit its one line is cut.

#### `cutAtEnd` {#symbol-cutatend}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/name-cut.ts#L26)

##### `cutAtEnd` — Summary
The name cut at its end: as many of its first characters as fit before the ellipsis, one at least. A name that fits is
returned whole.

#### `cutInMiddle` {#symbol-cutinmiddle}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/name-cut.ts#L40)

##### `cutInMiddle` — Summary
The name cut in its middle, at its seams: some of its first segments and some of its last, whole, with the ellipsis
between in place of at least one. Of the cuts that fit, the one that keeps the most of the name; of equals, the one
that keeps more of its end, where the names of one card differ. It breaks only at the seams: where not even the first
and the last segment fit together with the ellipsis, or the name has no seam to cut between, the name is cut at its
end. A name that fits is returned whole. `segments` joined are the name.

#### `oneLineName` {#symbol-onelinename}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/name-cut.ts#L57)
- Parameters: `cut`: [`NameCut`](#symbol-namecut)

##### `oneLineName` — Summary
The name on one line in a width: whole where it fits, else cut as asked.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
