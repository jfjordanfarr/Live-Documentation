# `packages/explorer/src/client/views/worldMap/way-down.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/worldMap/way-down.ts`
- Generated At: 2026-11-22T02:19:05.347Z

## Authored
### Purpose
The way down from the World Map, as facts, for Tuning → 2D Layout → Way Down at Carries The Question, a trial: which files of a thing carry its wires to the board's other things (`wireFilesOf`), which files stand at a wire's two ends (`wireEndsOf`), and which of them one picture is asked to hold (`heldFiles`). Pure, and read only from the board's join, which names for every wire it found the file-level edges behind it; the controller hands what this returns to the page, which pins it in the Local Map.

### Notes
- Made on November 22, 2026, from the root's brief on the six blind testers of November 21 who named the estate's chain of systems from the board and none of whom reached a file ([the task](../../../../../../../../AI-Agent-Workspace/Work/stranger-follows-a-request.md#the-way-down-from-the-world-map-keeps-the-request-in-view), [the pictures](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/way-down/README.md#the-trial)).
- A thing's doors are its calls, the wires drawn in the air: the file that serves what another thing calls, and the file that calls another thing's door. What it stands on is brought only where no call touches it, so that a library is not opened empty-handed. With both at once the estate's hub opened beside seven files of the shared contracts, which took half the picture from the two files a payment passes through; that picture is kept with the trial's. A ghost, a call nothing on the board serves, brings no file: it is no other thing's door.
- The order is one file for each wire before a second for any, and within a wire the file behind most of its edges first, so that every neighbouring thing is reached before any is reached twice.
- What a picture holds is counted in cards, the pinned files and the files a line joins to them, two dozen: counted in files, six, this repository's `engine` opened as hundreds of cards, one of its files being joined to seventy-eight others. A file that would overrun the budget is passed over for the next that fits; the first is pinned whatever it brings, and a wire's first two. The page says how many of the files are pinned.
- A declared wire has no file-level edge and gives no file. The World Map's import rule holds: this module reads its sibling `model.ts` and nothing else.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WAY_DOWN_CARDS` {#symbol-way_down_cards}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/way-down.ts#L21)

##### `WAY_DOWN_CARDS` — Summary
How many cards one way down's picture is asked to hold: the files it pins and every file a line joins to one of them,
which the Local Map draws beside it. Two dozen is about what a 1,280 by 800 window holds at the farthest scale where
every name still reads. Counted by files alone, six pinned, this repository's `engine` opened as a picture of
hundreds of cards, one of its six files being joined to seventy-eight others (looked at 2026-11-22). What does not
fit is counted, never silently left out.

#### `WayDownFiles` {#symbol-waydownfiles}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/way-down.ts#L24)

##### `WayDownFiles` — Summary
The files a way down asks the Local Map to pin, and how many more carry the same wires and are not pinned.

#### `wireFilesOf` {#symbol-wirefilesof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/way-down.ts#L60)

##### `wireFilesOf` — Summary
Every file of a thing that carries one of its wires to another thing of the board: the files that serve what another
thing calls, and the files that call another thing's door; or, for a thing no call touches, the files others stand
on and the files that stand on others'. In the order a picture should take them when it cannot take all: one file
for each wire before a second for any, and within a wire the file that carries most of its edges first; so that
every neighbouring thing is reached before any is reached twice.

#### `wireEndsOf` {#symbol-wireendsof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/way-down.ts#L77)

##### `wireEndsOf` — Summary
The files at a wire's two ends, pair by pair as its edges stand in the docs: the file that calls, then the file that
serves it, each once.

#### `heldFiles` {#symbol-heldfiles}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/worldMap/way-down.ts#L88)
- Returns: `Iterable`, [`WayDownFiles`](#symbol-waydownfiles)

##### `heldFiles` — Summary
What one way down pins of the files that carry it, and the count of them all. The files are taken in their order
while the cards they bring, themselves and the files `neighbours` joins to them, stay within the budget; a file that
would overrun it is passed over for the next that fits, so that one much-used file does not take the whole picture
from the rest. The first `least` are pinned whatever they bring: a wire's first two, the file that calls and the file
that serves. Where no file fits at all, the first is pinned alone, so that a way down never arrives with nothing.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`model.WorldModel`](./model.ts.mdmd.md#symbol-worldmodel) (type-only)
- [`model.WorldRoad`](./model.ts.mdmd.md#symbol-worldroad) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
