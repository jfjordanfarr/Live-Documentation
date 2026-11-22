# `packages/explorer/src/client/views/localView/directory-handle.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/views/localView/directory-handle.test.ts`
- Generated At: 2026-11-22T07:12:55.934Z

## Authored
### Purpose
Unit cases for the directory handle's arithmetic: the strip holds a line of the handle at every look's scale; a path parts into its parent's path and the directory's own name; a directory alone under the root keeps its strip in every column, and a nested one only where it stands as in its leftmost column (the geometry of `packages/engine/src` with `live-docs` opened); the handle's room across is the level run of the columns that keep the strip; and a closed box's name is held at the look's scale where it fits, brought down in size before it is cut, broken at a seam on the lines the box holds, and never held below the connections look's scale, where it breaks inside a word and is cut with an ellipsis last.
 Since 2026-11-16 also: the handle's reach past the strip's own columns over level columns that hold nothing under it; and the closed boxes of one parent read together: each name fitted on its own, never below the floor, and the cells' row in every sibling or in none.

### Notes
Written with the module on 2026-11-15 ([November 15, Turn 1](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)). The measure counts ten units a character, so each expectation can be checked by counting letters: nine letters need 90 units, and a 260-unit box holds them from a scale of 2.88 down. The family's cases were added on 2026-11-16 ([the corrections decided that day](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#work-notes-the-closed-directorys-cells-and-shapes-come-back)); in them a name's lines are indented by the chevron's 16 units, so a name of n letters is whole on a line from width / (10n + 16) down. They were rewritten the same day when the shared scale and More's place beside the name were withdrawn ([the review](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#work-notes-the-seventh-hour-of-november-16-utc)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`directory-handle.ClosedSibling`](./directory-handle.ts.mdmd.md#symbol-closedsibling) (type-only)
- [`directory-handle.HANDLE_AIR`](./directory-handle.ts.mdmd.md#symbol-handle_air)
- [`directory-handle.HANDLE_FLOOR`](./directory-handle.ts.mdmd.md#symbol-handle_floor)
- [`directory-handle.HANDLE_HOLD`](./directory-handle.ts.mdmd.md#symbol-handle_hold)
- [`directory-handle.HANDLE_LINE`](./directory-handle.ts.mdmd.md#symbol-handle_line)
- [`directory-handle.HANDLE_STRIP`](./directory-handle.ts.mdmd.md#symbol-handle_strip)
- [`directory-handle.StripBox`](./directory-handle.ts.mdmd.md#symbol-stripbox) (type-only)
- [`directory-handle.closedFamily`](./directory-handle.ts.mdmd.md#symbol-closedfamily-function)
- [`directory-handle.fitHandle`](./directory-handle.ts.mdmd.md#symbol-fithandle)
- [`directory-handle.handleParts`](./directory-handle.ts.mdmd.md#symbol-handleparts)
- [`directory-handle.handleReach`](./directory-handle.ts.mdmd.md#symbol-handlereach)
- [`directory-handle.inEverySibling`](./directory-handle.ts.mdmd.md#symbol-ineverysibling)
- [`directory-handle.stripColumns`](./directory-handle.ts.mdmd.md#symbol-stripcolumns)
- [`directory-handle.wholeAtSeams`](./directory-handle.ts.mdmd.md#symbol-wholeatseams)
- [`held-lines.HeldRoom`](./held-lines.ts.mdmd.md#symbol-heldroom) (type-only)
- [`ladder-steps.LOOK_SCALES`](./ladder-steps.ts.mdmd.md#symbol-look_scales)
- [`word-seams.seamsOf`](./word-seams.ts.mdmd.md#symbol-seamsof)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
