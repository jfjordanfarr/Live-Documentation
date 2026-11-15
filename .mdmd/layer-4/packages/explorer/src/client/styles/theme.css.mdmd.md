# packages/explorer/src/client/styles/theme.css

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/styles/theme.css
- Generated At: 2026-09-27T23:21:27.639Z

## Authored
### Purpose

CSS custom property definitions that form the Explorer's design token system. Declares the full color palette (accent, outbound/inbound link colors, backgrounds, borders, text tones), spacing values, and component-level tokens consumed by all other stylesheets. Loaded first in the import chain to ensure variables are available before any rules reference them.

### Notes

- Extracted from monolithic `styles.css` on [2025-12-04](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-04.SUMMARIZED.md) (Turn 19) as part of the CSS decomposition (`4504d36a`).

- Since 2026-11-15 the theme carries the 2D map's tone ([Turn 1 of that day's record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1), the owner's "font hierarchy"): three tones for a card's text, `--card-file-name`, `--card-symbol-name` and `--card-prose`, a hierarchy of value because the sizes are fixed by the card's fits; a wire's two colours as the map's script draws them (`--wire-offers`, `--wire-uses`) and its opacity (`--wire-opacity`, the 0.7 it always was), for the wires and for the legend; and an opened directory's outline (`--membrane-outline`). Against a card's `#232326` the three tones measure 14.00, 13.39 and 7.23 to 1, and 11.91, 11.39 and 6.15 on a hovered card's `#2f2f33` (`tests/e2e/contrast.ts`); the outline's `#3d3d45` is 1.55 to 1 against the map, where a card's border is 1.60: a region is ground and a card is figure.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
