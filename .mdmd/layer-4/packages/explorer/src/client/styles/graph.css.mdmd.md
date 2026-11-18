# packages/explorer/src/client/styles/graph.css

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/styles/graph.css
- Generated At: 2026-09-27T23:21:27.545Z

## Authored
### Purpose

Sizes and bounds the Force Graph canvas container and styles the projected file/directory names and their action strip. The simulation and projected label position are controlled by the view.

### Notes

- While the 3D map builds (`data-building` on the container, since November 15, 2026, [Turn 4 of that day's record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-4)), its names and actions take no pointer, so a press on them falls through to the canvas and turns the camera. Once building has lasted 300 ms (`data-building="shown"`) the cursor over the map is `progress` and a thin line, 2 px of the secondary text colour, sweeps along the map's top edge; under reduced motion it stands still and fainter. The line has no words and is not a control: the container's `aria-busy` speaks for the settle.
- Extracted from monolithic `styles.css` on [2025-12-04](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/12/Summarized/2025-12-04.SUMMARIZED.md) (Turn 19) as part of the CSS decomposition (`4504d36a`).
- The historical `#graph-svg` ID hosts a WebGL canvas. Its positioned container provides the coordinate origin for projected names; keyboard focus has a visible outline. Intrinsic name widths are bounded independently of their screen position, avoiding narrow vertical wrapping near an edge. Context names fade while retained names keep reading size.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
