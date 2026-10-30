# packages/explorer/src/client/styles/search.css

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/styles/search.css
- Generated At: 2026-10-14T18:27:57.874Z

## Authored
### Purpose

Styles for the search bar at the top of the Explorer, its fields, the map marker before the destination, grouped search results, and the path report shared by the 2D and 3D Local Map. The main column reserves room for search and the report before either map surface; long paths scroll through readable, wrapping file buttons.

### Notes

- Written on 2026-10-14 ([Turn 6](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)) in place of `pathfind.css`, which was created on [2025-12-17](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-17.2.SUMMARIZED.md) (Turn 7) with the FROM/TO toolbar (`78758a45`) under the owner's directive, "I expect the omnisearch bars and symbol dropdowns to work like a charm before committing, with zero shortcuts taken", and of the dialog's and the sidebar button's rules in `shell.css`. The status line's and the strip's rules are carried over.
- The main area is a column since the bar moved above every view. Search fields wrap when room is short, the one shared report reserves its height beneath them, and `#views` fills the rest, with the view containers absolute inside it. This carries forward the separation of report and map from [Turn 10 of 2026-10-01](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10) to both representations, as the [October 23 review requires](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#remediation-work). The report's height is bounded by the viewport so a long answer can scroll without consuming the map.
- A result's words are never cut: a long path wraps rather than being clipped, so the design audit can run over the open results (`search-bar.spec.ts`).
- A file row's path is `--text-panel-muted` since 2026-10-30 ([Turn 3](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3)): it was `--text-disabled`, `#666` at 10 px, about 2.9:1 on the results and 2.5:1 on a selected row, which the October 23 review found very faint. The token gives about 6.6:1 and 5.6:1, above WCAG AA's 4.5:1 for small text, at the same size and still quieter than the white name; `search-bar.spec.ts` measures it.
- A path answer uses the normal 13px control/body scale and readable neutral, success and error text; the reverse link remains distinct. The ordered file strip scrolls horizontally, with whole names wrapping inside each button; the bar reveals the complete button when it receives focus, with a scroll margin that keeps its focus outline clear of the clipping edge.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
