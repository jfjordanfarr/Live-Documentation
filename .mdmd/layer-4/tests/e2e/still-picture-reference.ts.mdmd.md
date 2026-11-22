# `tests/e2e/still-picture-reference.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/still-picture-reference.ts`
- Generated At: 2026-11-22T19:23:40.451Z

## Authored
### Purpose
The still-picture instrument's reading as it stood until 2026-11-22, `readPictureReference`, kept word for word as the oracle its faster successor is held to: [`readPicture`](still-picture.ts.mdmd.md) must give this reading to the last digit of every number on the same page. Only the comparison calls it.

### Notes
- Made on November 22, 2026, when the instrument's reading of a large retained picture had outgrown the minute its case gave it and was changed to cost about a quarter ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/instrument-and-look-cost/README.md)). A faster reading is worth nothing if it reads otherwise, and part of the change rests on how the browser walks a path, which is a fact about the browser and can change with it; so the old reading stays as the thing to compare against, and nothing grades itself.
- It costs what the old reading cost, about a minute on the lanes case's picture, so the suite runs it on small pictures ([`still-picture-reference.spec.ts`](still-picture-reference.spec.ts.mdmd.md)) and the probe's script runs it on the large one.
- Do not mend or tidy it: its worth is that it is the reading as it was. If the instrument's meaning is deliberately changed, change both and say so here.
- Changed once, in both alike, on the evening of 2026-11-22: what the hit test meets at a point (`drawnAt`). The fault was in both: the topmost element along a wire had become the wire's own band, and no card across a wire could be seen. A comparison of the two cannot show a fault they share, so the spec holds this one by made faults that each reading must see.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `readPictureReference` {#symbol-readpicturereference}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture-reference.ts#L18)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](./still-picture.ts.mdmd.md#symbol-viewreading)

##### `readPictureReference` — Summary
Reads the wires, cards and camera of a view as drawn now, as the instrument read them until 2026-11-22.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page` (type-only)
- [`still-picture.Box`](./still-picture.ts.mdmd.md#symbol-box) (type-only)
- [`still-picture.CardReading`](./still-picture.ts.mdmd.md#symbol-cardreading) (type-only)
- [`still-picture.PictureReading`](./still-picture.ts.mdmd.md#symbol-picturereading) (type-only)
- [`still-picture.READING_PX`](./still-picture.ts.mdmd.md#symbol-reading_px)
- [`still-picture.ViewReading`](./still-picture.ts.mdmd.md#symbol-viewreading) (type-only)
- [`still-picture.WireReading`](./still-picture.ts.mdmd.md#symbol-wirereading) (type-only)
<!-- LIVE-DOC:END Dependencies -->
