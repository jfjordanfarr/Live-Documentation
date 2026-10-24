# packages/explorer/src/client/styles/shell.css

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/styles/shell.css
- Generated At: 2026-09-27T23:21:27.608Z

## Authored
### Purpose

Layout and interaction styles for the Explorer's application shell: sidebar (navigation tabs, search, display filters, tuning sliders, legend), detail panel (node metadata, action buttons), and the overall page grid that arranges sidebar, main viewport, and detail panel into a responsive three-column layout.

### Notes

- Extracted from monolithic `styles.css` on [2025-12-04](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-04.SUMMARIZED.md) (Turn 19) as part of the CSS decomposition (`4504d36a`).
- At ~1180 lines this is the largest stylesheet; further decomposition would be warranted if it continues to grow.
- The Local Map's legend follows the active representation: the 2D key describes offers and uses, while the spatial key draws the renderer's actual file-kind colours and size/width examples. Both disappear outside Local Map. Spatial swatches receive their colour from the shared rendering table through a CSS variable.
- Prose in the reader has one set of rules, `.reader-prose`, at the authored sections' 13 px with accent links, its paragraphs and list items at one leading (2026-10-21, [Turn 2](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-2)). It replaced the authored block's own rules and a `.doc-content` set that no element had carried for months; a bundled document had matched neither.
- `#main` and the view containers clip with `overflow: clip`, as do the World Map's root and the 3D host in their own sheets: with `overflow: hidden` a reveal by the browser (a Tab onto a control at a view's edge, a find in the page, a test runner's retried click) scrolled them from code, sliding the picture and its controls out from under the camera with nothing to scroll them back (2026-10-21, [the work note](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#work-notes-the-gate-and-the-clipped-views)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
