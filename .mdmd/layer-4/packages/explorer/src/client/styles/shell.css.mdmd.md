# `packages/explorer/src/client/styles/shell.css`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/styles/shell.css`
- Generated At: 2026-11-19T21:10:14.518Z

## Authored
### Purpose

Layout and interaction styles for the Explorer's application shell: sidebar (navigation tabs, search, display filters, tuning sliders, legend), detail panel (node metadata, action buttons), and the overall page grid that arranges sidebar, main viewport, and detail panel into a responsive three-column layout.

### Notes

- Extracted from monolithic `styles.css` on [2025-12-04](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/12/Summarized/2025-12-04.SUMMARIZED.md) (Turn 19) as part of the CSS decomposition (`4504d36a`).
- At ~1180 lines this is the largest stylesheet; further decomposition would be warranted if it continues to grow.
- The Local Map's legend follows the active representation: the 2D key describes offers and uses, while the spatial key draws the renderer's actual file-kind colours and size/width examples. Both disappear outside Local Map. Spatial swatches receive their colour from the shared rendering table through a CSS variable.
- Prose in the reader has one set of rules, `.reader-prose`, at the authored sections' 13 px with accent links, its paragraphs and list items at one leading (2026-10-21, [Turn 2](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-21/2026-10-21.1.record.md#turn-2)). It replaced the authored block's own rules and a `.doc-content` set that no element had carried for months; a bundled document had matched neither.
- Since 2026-10-30 a file's Notes follow its generated sections, under the same rule above them (`.doc-authored--after`), and the jump list at the top of its evidence (`.reader-jumps`) is a wrapping row of links in the reader's link colour at the prose's 13 px. A heading that takes focus from its jump draws no outline around the words.
- `#main` and the view containers clip with `overflow: clip`, as do the World Map's root and the 3D host in their own sheets: with `overflow: hidden` a reveal by the browser (a Tab onto a control at a view's edge, a find in the page, a test runner's retried click) scrolled them from code, sliding the picture and its controls out from under the camera with nothing to scroll them back (2026-10-21, [the work note](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-21/2026-10-21.1.record.md#work-notes-the-gate-and-the-clipped-views)).
- Since 2026-11-05 `.spatial-legend-sample--wrapped` draws the key's wrapped group, a translucent convex shell around its seed ([Group Wrappers](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)).

Since 2026-11-05 the key draws a Shell sample: the wrapped group's skin with no sphere at its heart.
`.explorer-refusal` (2026-11-12) sets a refusal's one sentence where the map would be, centred in `#views`, at the reader's 15 px and in the page's text colour, after the sentence for a page opened as a file was first put in the sidebar's 11 px grey status line, where the first visitor had not seen "Loading...".
`.explorer-loading` (2026-11-12) sets the sign shown while the bundle loads, in the refusal's place: three dots that brighten in turn, in the muted text colour, still under reduced motion; before, the main area stood empty and the only sign was the sidebar footer's 11 px "Loading..." ([the first visit's finding 6](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/first-visit/README.md)).

The sidebar's own sizes and colours for the 2D legend's samples went on 2026-11-15 ([Turn 1 of that day's record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)): they made a test-backed card's sample a gold glow and a dot's smaller than a dot, and the samples are now drawn once, in `view-shared.css`, beside the marks they copy. The unused `.legend-swatch--related-doc` went with them.

Since 2026-11-16 ([Turn 10 of the November 15 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-10)) a legend row is a sample and at most two words: `.legend-mark` is a sample with its words, `.legend-word` is never broken, and `.legend-row--kinds` lays the kinds' marks side by side, wrapping only where the panel is too narrow, each mark in the other rows' own measure, so that the first word of every line stands at the words' column (the root's change as the round landed; the builder had set each dot tight to its word, which left the kinds' words 9 px to the left of that column). The faded sphere's sample went with its row.

Since 2026-11-19 ([Turn 14 of the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-14); [the pictures and measures](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/shell-accessibility/README.md)) a sidebar section's label is `--text-muted`, 5.35:1 on the sidebar, where it had been the disabled grey at 2.86. `.skip-link` and `#views:focus` serve the template's skip link, and `.fatal-message` and `.fatal-stack` serve a fatal fault in the reader. A reader heading is sized from the prose it heads, in `calc(1em + …)`: 16, 15, 14 and 13 px at the panel's 13 px as before, and 18, 17, 16 and 15 px in the reading dialog, where an h3 had stood at 14 px over 15 px prose.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
