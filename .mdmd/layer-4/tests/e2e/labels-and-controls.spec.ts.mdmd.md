# tests/e2e/labels-and-controls.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/labels-and-controls.spec.ts
- Generated At: 2026-11-12T17:14:45.947Z

## Authored
### Purpose
The browser checks of the Explorer checklist's item "Labels and controls have room to work" (the October 23 review's findings 8, 11, 14 and 16; built 2026-10-30): in 150-pixel cards every wrapped name breaks only where `seamBefore` allows, read from the characters' own boxes; every count on screen keeps its unit and agrees with it; the toolbar's buttons stand in groups parted by rules with one choice on in each, and the 3D canvas carries no hint; the navigation's three views each carry an icon and the application's name is whole; and the wire tooltip, hovered on a stroke a hover reaches and nothing else, stands clear of every name.

### Notes
Written 2026-10-30 after the pieces were looked at by eye on the built page, under the plan the owner accepted at [Turn 3 of the October 30 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3), where the owner struck the help control from the plan: the hint goes with nothing in its place, since text we author on screen is the last resort. The cards are narrowed through the `cardMaxWidth` lever so that names must wrap on this repository's bundle, where the layout's max-content columns otherwise let every name fit. The stroke to hover comes from `clearStroke` in `force-graph-observation.ts`, shared with the wires spec.

Since 2026-11-12 a case holds a card's connections outside the view to the control they are ([the first-visit review](../../../../AI-Agent-Workspace/Screenshots/2026-11-12/first-visit/README.md), finding 3), on `packages/explorer/src/client` at 1440 by 900: found by their accessible name, each carries the Pin glyph and its title, reads at 4.5 to 1 or more in a colour other than the directory line's, is underlined in the link look and one line as tall as the line above it; the keyboard's focus draws a two-pixel accent ring; in the button look the count alone is drawn, in a one-pixel frame at the text column's edge, the focus thickening it in the accent; no card's box differs between the looks; and a press pins the file. The toolbar case counts three groups in 2D since the 2D map gained Fit.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`word-seams.seamBefore`](../../packages/explorer/src/client/views/localView/word-seams.ts.mdmd.md#symbol-seambefore)
- [`contrast.AA_SMALL_TEXT`](./contrast.ts.mdmd.md#symbol-aa_small_text)
- [`contrast.backdrop`](./contrast.ts.mdmd.md#symbol-backdrop)
- [`contrast.contrastRatio`](./contrast.ts.mdmd.md#symbol-contrastratio)
- [`contrast.parseColour`](./contrast.ts.mdmd.md#symbol-parsecolour)
- [`force-graph-observation.clearStroke`](./force-graph-observation.ts.mdmd.md#symbol-clearstroke)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.referenceWire`](./force-graph-observation.ts.mdmd.md#symbol-referencewire)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
<!-- LIVE-DOC:END Dependencies -->
