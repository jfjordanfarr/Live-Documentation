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

- The tone round of 2026-11-15 ([Turn 1 of that day's record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)): the file's name and a symbol's name take their tones from the theme, which until then were the one grey of the prose beside them. No wire glows: every wire had a 6 px glow of its own, so a bundle was the brightest thing on a crowded picture; the root's comparison of resting strengths found the bloom was the glow and not the opacity, which stays 0.7. The 2D legend's samples are drawn here as the picture draws their marks: a wire's two ends in the wire's colours at its opacity, a dot by the very declarations a row's dot has, a test-backed card as a small card in its purple border inside its halo (the sample had been a gold glow, from a sidebar override in `shell.css` that went with this round). The floating `#legend-panel` and `.legend-title`, which the page has not had since the legend moved to the sidebar, went too.

Since 2026-11-16 ([Turn 10 of the November 15 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-10)) the 2D legend's two roles are one drawing, `.legend-roles`: an offering dot, a wire whose gradient runs from the offering end's colour to the using end's as a wire's does, and a using dot, where there were a sample for each end of a wire and one for each dot. The colours are the ones the samples had; `local-map-tone.spec.ts` compares them with the marks.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
