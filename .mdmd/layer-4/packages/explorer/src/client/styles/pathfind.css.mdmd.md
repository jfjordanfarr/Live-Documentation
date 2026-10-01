# packages/explorer/src/client/styles/pathfind.css

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/styles/pathfind.css
- Generated At: 2026-09-27T23:21:27.592Z

## Authored
### Purpose

Styles for the FROM/TO pathfinding toolbar at the top of the Local Map. Covers the search inputs with fuzzy-match dropdowns, symbol sub-dropdowns, clear buttons, the "Find Path" action, the status line that reports a count or offers the reverse question as a link, and the path visualization strip that renders a drawn path's hops.

### Notes

- Created on [2025-12-17](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-17.2.SUMMARIZED.md) (Turn 7) as part of the FROM/TO pathfind toolbar feature (`78758a45`). The user's directive was explicit: "We solve problems completely and totally... I expect the omnisearch bars and symbol dropdowns to work like a charm before committing, with zero shortcuts taken."
- Since [Turn 10 of 2026-10-01](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10) the Local Map is a column: the toolbar sits in the view's flow and takes the height it needs (one row of inputs, the status line when there is one, the path strip when a path is drawn), and the map layer fills whatever is left. The fixed offsets of 60 and 120 px that placed the layer under the toolbar are gone, and so is the overlap a long status line caused.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
