# tests/e2e/design-audit.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/design-audit.test.ts
- Generated At: 2026-11-12T21:56:32.936Z

## Authored
### Purpose
Unit cases for the browser specs' collision judge, `overlapsAmong` in [design-audit.ts](design-audit.ts.mdmd.md): a real collision is found with its area, a touch within the tolerance is not, and the worst collision comes first.

### Notes
Written on [November 5](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-8) after a review of the browser suite found that about fifteen specs expect this judge to find nothing among a view's text boxes and that nothing checked the judge itself, so one that always found nothing would have passed them all. The ranking case's first draft put the two smaller collisions in the wrong order and was corrected against the arithmetic the case now states in a comment, 49 × 49, 19 × 19 and 9 × 9.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`design-audit.Outline`](./design-audit.ts.mdmd.md#symbol-outline)
- [`design-audit.TextBox`](./design-audit.ts.mdmd.md#symbol-textbox)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textOverShapes`](./design-audit.ts.mdmd.md#symbol-textovershapes)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
