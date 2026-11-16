# packages/explorer/src/client/views/localView/name-cut.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/name-cut.ts
- Generated At: 2026-11-16T07:17:22.183Z

## Authored
### Purpose
Current. A symbol's name held to one line and cut with an ellipsis where its room does not hold it: at its end ("DocumentationLinkEnforc…"), or in its middle at its seams, the first and the last pieces kept about the ellipsis ("Documentation…Result"), and where those two do not fit together, its last pieces behind a leading ellipsis ("…LinkViolation"). Pure: the caller gives the name, its seam segments, the room and a measure. The card reading uses it for the two values of Descriptions Zoomed Out in which every described row keeps its description's first line.

### Notes
Written on 2026-11-15 ([Turn 1 of the November 15 record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)). The owner, shown the trial that kept a description's first line only under a name on one line: "the only reason it doesn't look quite as good in these screenshots is because the symbol name itself is willing to wrap onto a new line (I'm not confident this is preferable)". Holding the name to one line means cutting the long ones, and how a long name is cut is itself a thing to see, so there are two cuts for the owner to compare ([the pictures](../../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-15/descriptions-kept/README.md)).

The middle cut keeps whole seam segments from the name's start and from its end and leaves at least one out between them; of the cuts that fit it takes the one that keeps the most characters, and of equals the one that keeps more of the name's end, since the names of one card often share their beginning and differ at their end. It breaks only at the seams (`word-seams.ts`'s, which the name fitting already uses).

Where the first and the last piece do not fit together about the ellipsis, or the name has two pieces and so none to leave out between them, the middle cut keeps as many of the name's last pieces as fit, whole, behind a leading ellipsis ("…LinkViolation", "…Presentation", "…Service"), and cuts at the end only where not even the last piece fits or the name has no seam. This is the root's choice of 2026-11-16 among three fallbacks ([Turn 1 of the November 15 record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)). The first build cut inside the first piece and kept the last whole, and drew "Documentatio…Violation", "Pa…Service" and "ref…Presentation", which broke a word; it was removed the same day. The second cut the name at its end, which gave up the end exactly where it mattered: on `branch-renderer.ts` it drew `refreshReadingPresentation` and `refreshReadingGeometry` both as "refreshReading…", and three of the twelve cut names of `documentationLinks.ts` ended in an ellipsis among nine cut in their middle. The leading ellipsis breaks only at seams, always keeps the end, where a card's names differ, and is how the map already cuts a directory's path ("…ipts/slopcop").

Nothing here changes a size, and the whole name is not this module's to keep: the card reading leaves the name's own text in the page and the row's accessible name as they are, and draws the cut over it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ELLIPSIS` {#symbol-ellipsis}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/name-cut.ts#L18)

##### `ELLIPSIS` — Summary
The mark of a cut.

#### `NameCut` {#symbol-namecut}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/name-cut.ts#L21)

##### `NameCut` — Summary
How a name that does not fit its one line is cut.

#### `cutAtEnd` {#symbol-cutatend}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/name-cut.ts#L27)

##### `cutAtEnd` — Summary
The name cut at its end: as many of its first characters as fit before the ellipsis, one at least. A name that fits is
returned whole.

#### `cutInMiddle` {#symbol-cutinmiddle}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/name-cut.ts#L45)

##### `cutInMiddle` — Summary
The name cut in its middle, at its seams: some of its first segments and some of its last, whole, with the ellipsis
between in place of at least one. Of the cuts that fit, the one that keeps the most of the name; of equals, the one
that keeps more of its end, where the names of one card differ. It breaks only at the seams. Where not even the first
and the last segment fit together with the ellipsis, or the name has one seam and so no segment to leave out between
two, it keeps as many of its last segments as fit, whole, behind a leading ellipsis ("…LinkViolation",
"…Presentation"): the end is where a card's names differ, and a directory's path is cut the same way (2026-11-16, the
root's choice among three fallbacks; an end cut had drawn `refreshReadingPresentation` and `refreshReadingGeometry`
alike). Only where not even the last segment fits behind the ellipsis, or the name has no seam, is it cut at its end.
A name that fits is returned whole. `segments` joined are the name.

#### `oneLineName` {#symbol-onelinename}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/name-cut.ts#L68)
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
