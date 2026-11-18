# packages/explorer/src/client/views/localView/name-cut.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/name-cut.test.ts
- Generated At: 2026-11-16T04:49:21.246Z

## Authored
### Purpose
Current. Unit cases for the one-line name: a name that fits is returned whole by either cut; the end cut keeps as many first characters as fit before the ellipsis; the middle cut keeps whole pieces from both ends at the name's seams, the most of the name that fits; where the first and the last pieces do not fit together, or the name has one seam, it keeps as many last pieces as fit behind a leading ellipsis; it is cut at its end only where not even the last piece fits or the name has no seam; and no result is wider than its room.

### Notes
Written with the module on 2026-11-15 ([Turn 1 of the November 15 record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)). The measure is six units a character, so a room is read as a count of characters. The cases of the leading ellipsis were written on 2026-11-16 ([Turn 1 of the November 15 record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) and failed on the code before, which cut at the end there: `refreshReadingPresentation` in fourteen characters was "refreshReadin…", as `refreshReadingGeometry` was, where "…Presentation" was expected, and `PaymentService` in eleven "PaymentSer…" where "…Service" was. The case that the end cut remains where not even the last piece fits holds on the code before too, by its nature.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`held-lines.rowSegments`](./held-lines.ts.mdmd.md#symbol-rowsegments)
- [`name-cut.ELLIPSIS`](./name-cut.ts.mdmd.md#symbol-ellipsis)
- [`name-cut.cutAtEnd`](./name-cut.ts.mdmd.md#symbol-cutatend)
- [`name-cut.cutInMiddle`](./name-cut.ts.mdmd.md#symbol-cutinmiddle)
- [`name-cut.oneLineName`](./name-cut.ts.mdmd.md#symbol-onelinename)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
