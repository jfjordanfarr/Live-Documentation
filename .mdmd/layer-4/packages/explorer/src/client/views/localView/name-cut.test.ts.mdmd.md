# packages/explorer/src/client/views/localView/name-cut.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/name-cut.test.ts
- Generated At: 2026-11-16T04:49:21.246Z

## Authored
### Purpose
Current. Unit cases for the one-line name: a name that fits is returned whole by either cut; the end cut keeps as many first characters as fit before the ellipsis; the middle cut keeps whole pieces from both ends at the name's seams, the most of the name that fits; it breaks only at seams and falls back to the end cut where no cut at a seam fits; and no result is wider than its room.

### Notes
Written with the module on 2026-11-15 ([Turn 1 of the November 15 record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)). The measure is six units a character, so a room is read as a count of characters. The case of the seams-only fallback was written when the first build's cut inside a piece was removed: "DocumentationLinkViolation" in twenty-one characters holds "Documentation…Result"'s length and not "Documentation…Violation", and is cut at its end.

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
