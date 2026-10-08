# tests/e2e/design-audit.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/design-audit.ts
- Generated At: 2026-10-08T02:26:17.781Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_
- A text box per line box since 2026-10-08 (`getClientRects`): an inline element that wraps, a membrane's name beside the count of what it hides, was measured by the bounding box that spans its lines and collided with whatever shared its last line; a block element still gives one box.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TextBox` {#symbol-textbox}
- Type: interface
- Source: [source](../../../../tests/e2e/design-audit.ts#L15)

#### `Overlap` {#symbol-overlap}
- Type: interface
- Source: [source](../../../../tests/e2e/design-audit.ts#L24)

#### `Truncation` {#symbol-truncation}
- Type: interface
- Source: [source](../../../../tests/e2e/design-audit.ts#L31)

#### `textBoxes` {#symbol-textboxes}
- Type: function
- Source: [source](../../../../tests/e2e/design-audit.ts#L47)
- Parameters: `page`: `Page`

##### `textBoxes` — Summary
The screen boxes of every visible text-bearing element the selectors name,
one per line box, so that an inline element that wraps is measured line by
line rather than by the bounding box that spans its lines.
Hidden elements and those faded below a fifth by their ancestors are left
out, since the fade is the design's way of putting them out of the way; the
fade of a whole view as it appears is not counted, so a spec must wait for
the view before it audits.

#### `overlapsAmong` {#symbol-overlapsamong}
- Type: function
- Source: [source](../../../../tests/e2e/design-audit.ts#L94)
- Returns: [`Overlap`](#symbol-overlap)[]
- Parameters: `boxes`: [`TextBox`](#symbol-textbox)[]

##### `overlapsAmong` — Summary
Every pair of boxes that intersect by more than the tolerance on both axes.

#### `truncations` {#symbol-truncations}
- Type: function
- Source: [source](../../../../tests/e2e/design-audit.ts#L116)
- Parameters: `page`: `Page`

##### `truncations` — Summary
Visible elements the selectors name whose text runs past the box that clips
it, or under a sibling's text on the same line. The text itself is measured,
through a range over each text node, so a pin or a badge positioned outside
the box does not count as text.

#### `describeFaults` {#symbol-describefaults}
- Type: function
- Source: [source](../../../../tests/e2e/design-audit.ts#L168)
- Parameters: `overlaps`: [`Overlap`](#symbol-overlap)[]; `cut`: [`Truncation`](#symbol-truncation)[]

##### `describeFaults` — Summary
The faults in words, for an assertion's message.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page` (type-only)
<!-- LIVE-DOC:END Dependencies -->
