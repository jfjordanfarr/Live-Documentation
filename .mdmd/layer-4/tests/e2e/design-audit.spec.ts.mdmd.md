# tests/e2e/design-audit.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/design-audit.spec.ts
- Generated At: 2026-10-19T16:55:09.273Z

## Authored
### Purpose
Exercises the design-audit instrument itself in Chromium, with text whose actual boxes prove horizontal and vertical clipping and controls that must remain valid.

### Notes
The fixture uses `setContent`, so no Explorer bundle, layout timing or screenshot comparison can make an incorrect audit pass. Each positive case checks that its selected label exists and that independent text-range geometry crosses the relevant clipping edge before asking `truncations` to report it. Own-width, ancestor-width, fully hidden ancestor, own-height and ancestor-height cases cover different failure paths. Wrapped and scaled text, scrollable content, a pannable view boundary, closed details, CSS-hidden text and low-opacity text are negative controls. A visible selected container also holds a closed details body and descendants whose combined opacity is below the audit floor; expanded and sufficiently opaque counterparts prove that genuinely visible overflow still fails. Nested horizontal and vertical scroll frames have text beyond their scrollports but inside outer hidden frames; the off-scroll text must not fail. Companion cases expose a fragment within a scrollport that an outer frame cuts, and catch a non-scrollable inner clip and clipping orthogonal to scrolling. This keeps the audit's visibility contract testable without shrinking the set of real UI labels audited.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
<!-- LIVE-DOC:END Dependencies -->
