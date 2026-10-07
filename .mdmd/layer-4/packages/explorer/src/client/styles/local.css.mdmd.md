# packages/explorer/src/client/styles/local.css

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/styles/local.css
- Generated At: 2026-09-27T23:21:27.560Z

## Authored
### Purpose

Styles specific to the Local Map view: the multi-column grid layout (dependency inputs, selected artifact, consumer outputs), symbol-row hover states, and connection anchor geometry that enables the directional blue-to-green connector routing.

### Notes

- Extracted from monolithic `styles.css` on [2025-12-04](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-04.SUMMARIZED.md) (Turn 19) as part of the CSS decomposition (`4504d36a`).
- The 3-column local layout with per-symbol rail ordering was first implemented on [2025-11-24](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-24.SUMMARIZED.md) (Turns 15–17) and later extended to support multi-hop pathfinding columns.
- The many-file layout's rules sit at the end: directory bands as subgrids with their lanes (`.local-pass-through`) as plain spacers the router measures, a back reference's route hidden until highlighted, and a bundle's shared run (`.bundle-run`) drawn beneath its wires at reduced opacity so the wires stay the thing read (2026-10-05). The placed layout (`.local-placed`, the same day) turns the grid into a block in which every membrane, card and lane is absolutely positioned from the placement. Since 2026-10-06 a directory's element (`.local-directory-band`) is the bounds of its membrane, drawn as nothing, and `.local-membrane` inside it is the outline, one segment per column joined through the gutters, beneath the cards; the padding between the outline and its members and the stroke are numbers the renderer lays out, not CSS.
- `.connections-layer.moving .connection-path { filter: none }` (2026-10-07): while the branch picture moves, the wires are redrawn every frame and go without their glow, whose drop-shadow filters cost more than the rest of a frame together (six frames a second with them, sixty without, measured headless on 31 cards and 172 wires); the glow returns at rest.
- A bundle's shared run dims under a hover since 2026-10-07. Its own opacity rule, written after the hover's dimming rule at equal specificity, had outranked it, so the runs stood out as the thick bright lines of a picture otherwise dimmed; the owner reported it from the hosted build ([Turn 4 of the October 7 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-07.1.record.md#turn-4)), and a rule of higher specificity now dims the run with the wires it carries.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
