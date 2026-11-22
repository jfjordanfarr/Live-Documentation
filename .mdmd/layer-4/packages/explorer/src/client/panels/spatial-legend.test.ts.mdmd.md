# `packages/explorer/src/client/panels/spatial-legend.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/panels/spatial-legend.test.ts`
- Generated At: 2026-11-22T07:12:54.117Z

## Authored
### Purpose
The unit test of the 3D Local Map's key: that its rows name only what the picture draws. The key was found untruthful on October 23 (finding 7: no direction, no fading, "Width: references" in a structure layout drawing no references) and made to follow what is drawn on 2026-10-30, when the rows became a pure function the view and this test share; see [the day's record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-30/2026-10-30.1.record.md#turn-3).

### Notes
- Two cases: a plain connections picture, where the kinds, the size rule and the wires' width are named and nothing else (the direction row of 2026-10-30 went with the wires' colour on 2026-10-31); and a structure picture with a path and fading, where the folders' size rule, the path, the fading and containment join them. The references rows vanish when no reference is drawn, which the structure layout does until a hover, a pin or a path asks for them.
- The words are checked exactly, since the key is text the owner reads; a change of wording is a change of the key.
- The cases above are described in the words of their day. Since 2026-11-16 the rows' words are two at most, the kinds are one row and no row is drawn for fading (the last note).

Since 2026-11-05 a case checks the Wrapped group row: after the Ring row, and only while a group is drawn wrapped ([Group Wrappers](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)).

Since 2026-11-05 a case checks the Shell row stands after the wrapped group's, only while a shell is drawn.

Since 2026-11-16 ([Turn 10 of the November 15 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-10)) a fifth case holds the legend's rule over every row the key can build, every kind the map colours and one it does not know, every kind of link and everything drawn: beside a sample stand at most two words (in the kinds' row, one for each kind), with no colon, digit or punctuation, and every row has a sentence of its own for its tooltip. Run over the rows as they stood at `d54755f1` it failed 27 times: nine rows of kinds, seven labels of three to eleven words, and no sentence anywhere. The four earlier cases read the new words and the kinds as one row; the size row's two sentences are read in the second.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`spatial-legend.SpatialLegendRow`](./spatial-legend.ts.mdmd.md#symbol-spatiallegendrow) (type-only)
- [`spatial-legend.spatialLegendRows`](./spatial-legend.ts.mdmd.md#symbol-spatiallegendrows)
- [`forceGraphAppearance.spatialNodeStyles`](../views/forceGraphAppearance.ts.mdmd.md#symbol-spatialnodestyles)
- [`forceGraphData.SpatialGraphData`](../views/forceGraphData.ts.mdmd.md#symbol-spatialgraphdata) (type-only)
- `vitest` - `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
