# tests/e2e/design-audit.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/design-audit.ts
- Generated At: 2026-09-29T15:09:34.561Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

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
- Source: [source](../../../../tests/e2e/design-audit.ts#L45)
- Parameters: `page`: `Page`

##### `textBoxes` — Summary
The screen boxes of every visible text-bearing element the selectors name.
Hidden elements and those faded below a fifth by their ancestors are left
out, since the fade is the design's way of putting them out of the way; the
fade of a whole view as it appears is not counted, so a spec must wait for
the view before it audits.

#### `overlapsAmong` {#symbol-overlapsamong}
- Type: function
- Source: [source](../../../../tests/e2e/design-audit.ts#L88)
- Returns: [`Overlap`](#symbol-overlap)[]
- Parameters: `boxes`: [`TextBox`](#symbol-textbox)[]

##### `overlapsAmong` — Summary
Every pair of boxes that intersect by more than the tolerance on both axes.

#### `truncations` {#symbol-truncations}
- Type: function
- Source: [source](../../../../tests/e2e/design-audit.ts#L110)
- Parameters: `page`: `Page`

##### `truncations` — Summary
Visible elements the selectors name whose text runs past the box that clips
it, or under a sibling's text on the same line. The text itself is measured,
through a range over each text node, so a pin or a badge positioned outside
the box does not count as text.

#### `describeFaults` {#symbol-describefaults}
- Type: function
- Source: [source](../../../../tests/e2e/design-audit.ts#L162)
- Parameters: `overlaps`: [`Overlap`](#symbol-overlap)[]; `cut`: [`Truncation`](#symbol-truncation)[]

##### `describeFaults` — Summary
The faults in words, for an assertion's message.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page` (type-only)
<!-- LIVE-DOC:END Dependencies -->
