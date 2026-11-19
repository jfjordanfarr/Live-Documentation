# packages/explorer/src/client/styles/theme.css

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/styles/theme.css
- Generated At: 2026-11-19T04:41:42.927Z

## Authored
### Purpose

The colours derived from the palette's meanings, each in one place: what is selected as a fill, the 2D pins' glows, the wires' opacity, the has-tests halo, the quiet separator and the frosted panels, written as `rgba(var(--meaning-rgb), alpha)` over the palette's custom properties; and the body's base rules. The palette itself (`client/palette.ts`) is written by the build as `styles/palette.css`, imported before this file.

### Notes

- Extracted from monolithic `styles.css` on [2025-12-04](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/12/Summarized/2025-12-04.SUMMARIZED.md) (Turn 19) as part of the CSS decomposition (`4504d36a`).

- Since 2026-11-15 the theme carries the 2D map's tone ([Turn 1 of that day's record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1), the owner's "font hierarchy"): three tones for a card's text, `--card-file-name`, `--card-symbol-name` and `--card-prose`, a hierarchy of value because the sizes are fixed by the card's fits; a wire's two colours as the map's script draws them (`--wire-offers`, `--wire-uses`) and its opacity (`--wire-opacity`, the 0.7 it always was), for the wires and for the legend; and an opened directory's outline (`--membrane-outline`). Against a card's `#232326` the three tones measure 14.00, 13.39 and 7.23 to 1, and 11.91, 11.39 and 6.15 on a hovered card's `#2f2f33` (`tests/e2e/contrast.ts`); the outline's `#3d3d45` is 1.55 to 1 against the map, where a card's border is 1.60: a region is ground and a card is figure.

- Since the [November 16 colour pass](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-1) no colour is written here: the base colours moved to the palette, named by meaning (`--card-file-name` is now `--text-card-file-name`, `--wire-offers` is `--role-offers`, `--accent` is `--state-selected`, `--bg-deep` is `--ground-deep`), and the tokens nothing read (`--color-outbound`, `--color-inbound`, `--connection-stroke`, `--bg-overlay`, `--glass-panel`, `--cluster-bg`, `--cluster-border`, `--text-panel`, `--color-workspace`) were deleted.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-2/design-system/visual-foundations.mdmd.md`](../../../../../../layer-2/design-system/visual-foundations.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
