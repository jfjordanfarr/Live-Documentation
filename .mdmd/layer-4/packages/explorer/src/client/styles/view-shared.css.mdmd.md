# packages/explorer/src/client/styles/view-shared.css

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/styles/view-shared.css
- Generated At: 2026-09-27T23:21:27.654Z

## Authored
### Purpose

Shared visual primitives consumed by multiple Explorer views: viewport layers (pan/zoom transform containers), cluster/directory cards, node cards with archetype badges, symbol rows, connection SVG line rendering, pin indicators, and z-index stacking rules that govern card/connection/pin layering.

### Notes

- Extracted from monolithic `styles.css` on [2025-12-04](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-04.SUMMARIZED.md) (Turn 19–21) as part of the CSS decomposition (`4504d36a`).
- Z-index stacking was refined iteratively in Turns 21–22 of that session after the user reported connectors drawing behind nodes and test-backed glow drawing above nodes.
- The card is sized as a border box since 2026-10-05: at `width: 100%` with its padding and border counted outside, every card was 26 px wider than the room its content had asked the grid for, which the owner saw as cards overflowing their directory boxes in the Local Map's many-file layout ([Turn 8](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-8)). The Circuit Board shares the card and was pictured after the change.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
