# Explorer pictures — October 21, 2026

Historical evidence from the [no-network hardening](../../ChatHistory/2026/10/2026-10-20.1.record.md#turn-12), taken by the Claude Code root in installed Chromium at 1400 × 900, over bundles built from the working tree before the commit. The console showed no refusal by the page's Content-Security-Policy while they were taken.

- [A doc's raw HTML as text](reader-raw-html-as-text.png): the history sample's `docs/design.md`, served with an `<img>` that names an outside image and runs a handler, a `<script>`, an `<iframe>`, an image's markdown syntax, an outside link, an autolink and a `javascript:` link appended, as the no-network spec serves it. The tags read as written; the image is a link to it, never fetched; the `javascript:` link is its text alone.
- [Code spans literal](reader-code-spans-literal.png): this repository's `coreConstants.ts` in the reader. `SUPPORTED_SCRIPT_EXTENSIONS` and its neighbours keep their underscores; until this change the reader set the word between two underscores in italics, even inside code.
- [Data on another site refused](data-elsewhere-refused.png): the history sample opened with `?data=https://example.com/explorer-data.json`. The page asks nothing of that site and says why in its status line and the reader's error.

Seen while taking them, and not changed here: the reader of a bundled doc has no styles of its own (`detail-doc-content` and `bundled-doc-content` carry none, since 2026-01-07), so its text takes the browser's 16 px and every link the browser's dark blue, `rgb(0, 0, 238)`, hard to read on the dark panel; the picture of the raw HTML shows it.

## The reader's prose styled as one (October 21 session)

Taken by the following session's Claude Code root in installed Chromium at 1400 × 900, over this repository's bundle built from the working tree, after the owner called the bundled documents' look "Definitely a readability defect" ([Turn 2](../../ChatHistory/2026/10/2026-10-21.1.record.md#turn-2)). A Live Doc's authored block, a bundled document and a directory's summary now share one set of rules, `.reader-prose`: 13 px text in the panel's secondary colour, links in the accent colour, paragraphs and list items at one leading.

- [A bundled document](reader-bundled-doc-styled.png): the October 19–20 summary, its title, coverage line and lists at the authored sections' size; its links in the accent colour, `rgb(0, 145, 255)`, where the picture above has the browser's `rgb(0, 0, 238)`.
- [An authored section](reader-authored-unchanged.png): `coreConstants.ts`, as in [the picture of its code spans](reader-code-spans-literal.png) above, except that its list items now take the paragraphs' leading; a wrapped item had read denser than the prose beside it.
- [A directory's summary](reader-directory-summary.png): `packages/engine/src/live-docs/history`, its count sentence at 13 px where it had the browser's 16.

## The views clipped, not scrolled (October 21 session)

Taken by the same root in installed Chromium at 1600 × 1000, over this repository's bundle, on the Local Map of the rosetta sample's `helpers.ts`, zoomed in four steps and then walked with the Tab key. The full gate of [Turn 2](../../ChatHistory/2026/10/2026-10-21.1.record.md#turn-2)'s reader fix failed a hover test because a retried click had scrolled `#main` and `#view-map`, which clipped with `overflow: hidden` and so could be scrolled from code; the same happens to a person's Tab or a find in the page.

- [Before the fix](reveal-scrolled-before-fix.png): the Tab has reached a directory's Open button at the right edge, and the browser has scrolled `#view-map` 106 px to show it. The rosetta `src` band and `helpers.ts` are cut at the column's left edge, and nothing on the page scrolls them back.
- [After the fix](reveal-in-place-after-fix.png): the same walk with `overflow: clip`. At the same Tab the picture, the search bar and the controls stand where the camera put them; the focus is on a row of `compiler-edges.json`, whose card runs past the right edge, and nothing moves.
