# packages/explorer/src/client/styles/world.css

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/styles/world.css
- Generated At: 2026-09-28T23:04:09.085Z

## Authored
### Purpose
The World Map's look: the board's two themes as custom properties, the white board and the dark one; the faces, bench, regions, grid and shadows; the roads with their flowing dashes and the dotted lines of what stands on what; the warm tunnel and its portals; the strands; the doors in blue and green; the spokes and stations of the built-on layer; the labels, with a halo that keeps them readable over anything and a fixed size at every zoom; the dimming of what is not under the pointer; and the panels: crumbs, tools, help, the walkthrough, the evidence panel and the note for a bundle without a board.

### Notes
- Written on 2026-09-28 with the view ([Turn 46](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-46)); the colours were aligned to blue offers and green uses on 2026-09-29 ([Turn 13 of the September 29 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-29.2.SUMMARIZED.md#turn-13)), and the road's flow stops under `prefers-reduced-motion`. Every stroke that should not scale with the world uses `vector-effect: non-scaling-stroke`, and every label is placed by a `data-fixed` transform the controller writes, which is why the text rules here set none. The `.world-root` box and the nav icon are the page template's.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
