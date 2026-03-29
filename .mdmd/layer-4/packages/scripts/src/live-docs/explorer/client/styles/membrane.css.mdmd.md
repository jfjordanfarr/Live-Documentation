# packages/scripts/src/live-docs/explorer/client/styles/membrane.css

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/styles/membrane.css
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-styles-membrane-css
- Generated At: 2026-03-29T21:52:08.956Z

## Authored

### Purpose

Styles for the Membrane Map view: viewport/container layout, membrane (directory) borders at depth-graduated opacity, collapsed directory tiles with hover/focus states, leaf file cards in grid layout, focal overlay panels with symbol pin anchors, SVG connection paths, path breadcrumb bar, and responsive badge sizing.

### Notes

- Created during Step 5 (Browse Mode Rendering) of the Membrane Map implementation on [Dev Day 80](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md). Extended during Step 6 with ~130 lines of focal-panel styles (`.membrane-focal-panel`, `.membrane-card`, `.membrane-focal-pin` variants, `.membrane-connection` front/back trace treatments).
- Follows the existing Explorer CSS architecture: imported via `styles.css`, uses `var(--*)` CSS custom properties from the shared theme, and does not contain any JavaScript-dependent styles.
- The `.membrane` class uses `position: absolute` with `overflow: visible` — the deliberate choice to allow content to flow beyond membrane boundaries was arrived at iteratively during visual playtesting (Turn 30–31 of Dev Day 80), replacing an earlier `overflow: hidden` approach that clipped card grids.
- Depth-graduated border opacity (`.membrane--depth-0` through `--depth-2`) creates visual hierarchy without requiring explicit zoom-level logic.
- Card grid layout (`.membrane-card-grid`) uses CSS Grid with `auto-fill` columns and `height: auto` — the \"content-driven sizing\" model where leaf-directory membranes grow to accommodate their file cards rather than being constrained to squarify-computed rectangles.
- Pin anchor dots (`.membrane-focal-pin`) use green for inbound and blue for outbound, matching the Local Map's established color language.
- Hybrid mixed-content layout styles (`.membrane__card-grid--hybrid`) added in [Dev Day 83](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md) for directories containing both files and subdirectories. Collapsed/expanded file card states, test-backed card golden glow (`.membrane-card--test-backed`), connected-row left-border (`.membrane-card__symbol-row--connected`), pinned-row box-shadow (`.membrane-card__symbol-row--pinned`), and participating endpoint hover styles also added in Dev Day 83.
- `.pa-grid-container` and `.pa-band-inner` use `var(--local-column-gap, 32px)` for horizontal gap, enabling the tuning slider to control pin-active layout spacing reactively.
- [Dev Day 84](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-28.1.md) complete dimming model rewrite: `.pin-active-root` applies baseline opacity 0.3 to all rows/pins and stroke-opacity 0.08 to connections; `--pinned` and `--connected` elements restore to opacity 1; hover layer further dims to 0.2 with `--participating`/`--highlighted` exceptions. Removed the green inset border on connected rows in favor of the opacity model. Added pin-all button active/inactive CSS, reference badge role-specific styling, and connected pin dot directional coloring.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-29T21:52:08.956Z","inputHash":"9a7a867f30b7268c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

_No public symbols detected_

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

_No dependencies documented yet_

<!-- LIVE-DOC:END Dependencies -->
