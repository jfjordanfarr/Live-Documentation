# packages/explorer/src/client/views/forceGraphEmphasis.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphEmphasis.test.ts
- Generated At: 2026-11-11T05:50:56.159Z

## Authored
### Purpose
Verify that commit emphasis uses immediate white, restores normal colour when a node leaves the changed set, and preserves the chosen background alpha without a temporal ramp.

### Notes
The [November 1 live correction](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-01.1.record.md#turn-3) replaced the original linear-fade assertions. Cases include frontier nodes, all optional emphasis modes, invalid colour input, wire visibility and symmetric pair identity. Browser playback tests measure uploaded colours and alpha at several times within a commit and across its boundary.

Since 2026-11-11 ([Turn 6 of the November 10 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-6)) the cases include a body's units: a changed dot white and whole while the open bubble around it is not lit; unchanged dots, and bubbles and skins holding nothing, dimmed under Dim while what holds a change keeps its alpha; a veiled bubble, a veiled bubble inside an open one and a veiled body lit for a change they hide; a deleted file shown in the innermost drawn bubble of its directory or in the skin; the skin lit under a look that draws nothing within it; a file the body does not hold and a wrapped group's seed lighting nothing; None changing nothing; and the deepest drawn directory taking each deleted file, none where it is a hub's sphere.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphEmphasis.ShownUnit`](./forceGraphEmphasis.ts.mdmd.md#symbol-shownunit)
- [`forceGraphEmphasis.bodyChanges`](./forceGraphEmphasis.ts.mdmd.md#symbol-bodychanges-function)
- [`forceGraphEmphasis.deletionHomes`](./forceGraphEmphasis.ts.mdmd.md#symbol-deletionhomes)
- [`forceGraphEmphasis.dims`](./forceGraphEmphasis.ts.mdmd.md#symbol-dims)
- [`forceGraphEmphasis.emphasizedSkin`](./forceGraphEmphasis.ts.mdmd.md#symbol-emphasizedskin)
- [`forceGraphEmphasis.emphasizedSphere`](./forceGraphEmphasis.ts.mdmd.md#symbol-emphasizedsphere)
- [`forceGraphEmphasis.emphasizedUnits`](./forceGraphEmphasis.ts.mdmd.md#symbol-emphasizedunits)
- [`forceGraphEmphasis.emphasizedWireAlpha`](./forceGraphEmphasis.ts.mdmd.md#symbol-emphasizedwirealpha)
- [`forceGraphEmphasis.glows`](./forceGraphEmphasis.ts.mdmd.md#symbol-glows)
- [`forceGraphEmphasis.pairKey`](./forceGraphEmphasis.ts.mdmd.md#symbol-pairkey)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
