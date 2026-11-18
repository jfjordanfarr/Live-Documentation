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

## The 3D picture eased until still (October 21 session)

Taken by the same root in installed Chromium with its software renderer, over this repository's bundle (846 files) at 1100 × 700 and the estate sample at 1000 × 640, after the 3D view's motion became the page's own: one force through a conservative field, eased at the update energy until the spheres are still by their motion, each sphere tethered to where it stood when the motion began, at 0.01 ([Turn 5](../../ChatHistory/2026/10/2026-10-21.1.record.md#turn-5)). Frame counts are ticks, one a frame; the seconds are this machine's renderer, not a person's.

- [First picture, gravity 0.01](motion-first-gravity-0.01.png): the shipped gravity. Eased to its balance, the picture is 1.8 times as wide as the frozen one the owner chose that gravity on (6,551 units across against 3,769), and the library's camera, which stands 1,608 units out, is nearly inside it.
- [First picture, gravity 0.03](motion-first-gravity-0.03.png): the picture at the frozen one's size (3,655 across); still at 462 frames after the hundred unseen. The camera still does not take it all in on this canvas, about 600 of 846 spheres on screen.
- [Tests shown again](motion-tests-shown-again.png): gravity 0.03, energy 1, after the tests were hidden (still at 272 frames) and shown again (296). The spheres that never left moved a mean of 66 units, at most 272. At energy 0.5 and 0.25 the same cycle took 251 and 562, 380 and 1,016 frames, to the same rest within a few units.
- [A hand holding a sphere](motion-hand-held.png) and [let go](motion-hand-released.png): `template.html` carried a sixth of the canvas to the right, its wires lit while it is held; still 478 frames after the release.
- [The structure layout](motion-structure-first.png): gravity 0.03, the hubs amber; still at 494 frames, a toggle at 245 and 233, the root hub's drag at 219.
- [The estate, structure](motion-estate-structure.png), [a hand on Portal](motion-estate-hand-held.png) and [switched to connections](motion-estate-connections.png), with [the recording](motion-estate.webm) of all three at the renderer's cadence: the first picture unfolds and is still at 138 frames, the hub let go is still at 189, and the switch unfolds afresh and is still at 318. Even at 53 spheres the first picture runs past the canvas's edges.

The longer recordings of this repository under three energies, 6 to 18 MB each at this renderer's cadence, were made for the owner's look in the session's scratchpad and are not committed.
