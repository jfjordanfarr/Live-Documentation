# packages/explorer/src/client/styles/search.css

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/styles/search.css
- Generated At: 2026-10-14T18:27:57.874Z

## Authored
### Purpose

Styles for the search bar at the top of the Explorer, its fields, the map marker before the destination, the grouped results under a field, and the path's report in the Local Map: the status line that counts or offers the reverse question, and the strip of a drawn path's hops. Also the column layout that puts the bar above the views and the report above the map.

### Notes

- Written on 2026-10-14 ([Turn 6](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)) in place of `pathfind.css`, which was created on [2025-12-17](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-17.2.SUMMARIZED.md) (Turn 7) with the FROM/TO toolbar (`78758a45`) under the owner's directive, "I expect the omnisearch bars and symbol dropdowns to work like a charm before committing, with zero shortcuts taken", and of the dialog's and the sidebar button's rules in `shell.css`. The status line's and the strip's rules are carried over.
- The main area is a column since the bar moved above every view: the bar takes one row and `#views` fills the rest, with the view containers absolute inside it. The Local Map keeps the column it has had since [Turn 10 of 2026-10-01](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10): the report takes the height it needs and the map layer fills whatever is left, so nothing overlaps the map.
- A result's words are never cut: a long path wraps rather than being clipped, so the design audit can run over the open results (`search-bar.spec.ts`).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
