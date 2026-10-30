# packages/explorer/src/client/panels/spatial-legend.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/panels/spatial-legend.test.ts
- Generated At: 2026-10-30T15:43:42.683Z

## Authored
### Purpose
The unit test of the 3D Local Map's key: that its rows name only what the picture draws. The key was found untruthful on October 23 (finding 7: no direction, no fading, "Width: references" in a structure layout drawing no references) and made to follow what is drawn on 2026-10-30, when the rows became a pure function the view and this test share; see [the day's record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3).

### Notes
- Two cases: a plain connections picture, where the kinds, the size rule and the wires' directions and width are named and nothing else; and a structure picture with a path and fading, where the folders' size rule, the path, the fading and containment join them. The references rows vanish when no reference is drawn, which the structure layout does until a hover, a pin or a path asks for them.
- The words are checked exactly, since the key is text the owner reads; a change of wording is a change of the key.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`spatial-legend.spatialLegendRows`](./spatial-legend.ts.mdmd.md#symbol-spatiallegendrows)
- [`forceGraphData.SpatialGraphData`](../views/forceGraphData.ts.mdmd.md#symbol-spatialgraphdata) (type-only)
- `vitest` - `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
