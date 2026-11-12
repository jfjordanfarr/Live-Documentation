# tests/e2e/design-audit.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/design-audit.ts
- Generated At: 2026-11-12T21:56:33.046Z

## Authored
### Purpose
The design faults a screenshot would show, as Playwright can measure them: `textBoxes` collects screen boxes of text-bearing elements; `overlapsAmong` finds collisions; `truncations` checks text fragments against their own box, clipping ancestors and neighbouring text, horizontally and vertically; `outlines` collects the screen corners of drawn polygons with what each belongs to, and `textOverShapes` finds text drawn across them; `describeFaults` puts failures in words. Callers choose the labels a view should show and assert a nonempty reading separately: zero measured faults alone cannot prove that text rendered.

### Notes
- Written for the owner's ask of 2026-09-29 that Playwright catch "text overflows or other immediate design fails": the ones geometry can name. What it cannot judge is taste.
- A text box per line box since 2026-10-08 (`getClientRects`): an inline element that wraps, a membrane's name beside the count of what it hides, was measured by the bounding box that spans its lines and collided with whatever shared its last line; a block element still gives one box.
- Since 2026-11-12 text can be judged against shapes as well as against text: the World Map's labels were drawn through the pieces' own edges ([the first visit's finding 6](../../../../AI-Agent-Workspace/Screenshots/2026-11-12/first-visit/README.md)), which no comparison of text with text could see. `textBoxes` takes an optional owner attribute so that each box says what it belongs to; `outlines` reads polygons through their screen matrix, leaving out those faded below a fifth as text is; `textOverShapes` counts one strike for each text and each owner whose polygon an edge carries through the text's box, or that holds it, past the same one-pixel tolerance, and marks whether the shape is the text's own. Existing callers are unchanged. Its own cases are in `design-audit.test.ts`.
- Since 2026-10-08 both readers treat what stands under a closed `details`, other than its own summary, as hidden: Chromium keeps that content laid out and reports its boxes at their places, so the Knowledge Sources panel's closed groups read as a stack of colliding summaries until the audit learned the element ([the panel's spec](knowledge-sources.spec.ts.mdmd.md)).
- `truncations` checks clipped ancestors only inside the active view's boundary. A view is a pannable frame, and an ordinary scrollport offers a way to reach its hidden content; neither is a text-truncation fault. A fragment's extent is intersected with each scrollport on its scrolling axis before outer fixed clips judge it, so an off-scroll search row does not appear cut by the page frame, while the exposed part of a scrollport still fails if that part is clipped. Non-scrollable clipping inside a scrollport and clipping across its scroll direction still fail. Selected text that a non-scrollable card, panel or membrane clips remains a fault even when it is wholly hidden. Fragment bounds come from Chromium's text ranges, so wrapping and CSS scale are measured as rendered. The [instrument spec](design-audit.spec.ts.mdmd.md) tests both faults and deliberate hidden/scroll/pan cases in Chromium.
- A selector may name a visible container rather than its text leaf. Its text walk therefore applies the same closed-details rule and cumulative opacity floor to each descendant fragment: closed content and descendants faded below a fifth are not visible words to audit, while an expanded group or text above that floor remains accountable for clipping.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TextBox` {#symbol-textbox}
- Type: interface
- Source: [source](../../../../tests/e2e/design-audit.ts#L15)

#### `Outline` {#symbol-outline}
- Type: interface
- Source: [source](../../../../tests/e2e/design-audit.ts#L27)

##### `Outline` — Summary
A shape drawn on the page, its corners in screen pixels, and what it belongs to.

#### `Strike` {#symbol-strike}
- Type: interface
- Source: [source](../../../../tests/e2e/design-audit.ts#L33)

##### `Strike` — Summary
Text drawn across a shape: a piece's edge through a label, which a screenshot shows as struck-through words.

#### `Overlap` {#symbol-overlap}
- Type: interface
- Source: [source](../../../../tests/e2e/design-audit.ts#L40)

#### `Truncation` {#symbol-truncation}
- Type: interface
- Source: [source](../../../../tests/e2e/design-audit.ts#L47)

#### `textBoxes` {#symbol-textboxes}
- Type: function
- Source: [source](../../../../tests/e2e/design-audit.ts#L65)
- Parameters: `page`: `Page`

##### `textBoxes` — Summary
The screen boxes of every visible text-bearing element the selectors name,
one per line box, so that an inline element that wraps is measured line by
line rather than by the bounding box that spans its lines.
Hidden elements and those faded below a fifth by their ancestors are left
out, since the fade is the design's way of putting them out of the way; the
fade of a whole view as it appears is not counted, so a spec must wait for
the view before it audits. Given an owner attribute, each box says what it
belongs to: the attribute's value on the text or its nearest ancestor that
carries it.

#### `outlines` {#symbol-outlines}
- Type: function
- Source: [source](../../../../tests/e2e/design-audit.ts#L123)
- Parameters: `page`: `Page`

##### `outlines` — Summary
The visible SVG polygons a selector names, each with its corners in screen pixels and the value of the owner
attribute on it or its nearest ancestor that carries it. Polygons faded below a fifth are left out, as text is.

#### `textOverShapes` {#symbol-textovershapes}
- Type: function
- Source: [source](../../../../tests/e2e/design-audit.ts#L162)
- Returns: [`Strike`](#symbol-strike)[]
- Parameters: `boxes`: [`TextBox`](#symbol-textbox)[]; `shapes`: [`Outline`](#symbol-outline)[]

##### `textOverShapes` — Summary
Every text box that a shape crosses, holds or lies under, past the tolerance: the box is shrunk by it on each side,
then meets the polygon when one of the polygon's edges passes through it or it lies inside the polygon. One strike
for each text and each owner, however many of the owner's polygons meet it; a text's own shape is marked as such.

#### `overlapsAmong` {#symbol-overlapsamong}
- Type: function
- Source: [source](../../../../tests/e2e/design-audit.ts#L231)
- Returns: [`Overlap`](#symbol-overlap)[]
- Parameters: `boxes`: [`TextBox`](#symbol-textbox)[]

##### `overlapsAmong` — Summary
Every pair of boxes that intersect by more than the tolerance on both axes.

#### `truncations` {#symbol-truncations}
- Type: function
- Source: [source](../../../../tests/e2e/design-audit.ts#L253)
- Parameters: `page`: `Page`

##### `truncations` — Summary
Visible elements the selectors name whose text overruns its own content box, a non-scrollable clipping ancestor,
or a sibling's text on the same line. Text is measured in line fragments rather than by its containing element:
a wrapped line is valid, while one hidden below a fixed-height box is not. Scrollports and the view boundary are
navigation frames, so panning or scrolling content out of them does not turn that content into a design fault.

#### `describeFaults` {#symbol-describefaults}
- Type: function
- Source: [source](../../../../tests/e2e/design-audit.ts#L379)
- Parameters: `overlaps`: [`Overlap`](#symbol-overlap)[]; `cut`: [`Truncation`](#symbol-truncation)[]; `strikes`: [`Strike`](#symbol-strike)[]

##### `describeFaults` — Summary
The faults in words, for an assertion's message.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page` (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
