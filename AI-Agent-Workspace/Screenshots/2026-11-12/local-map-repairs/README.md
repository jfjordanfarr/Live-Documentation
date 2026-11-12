Evidence from the builder's first milestone of the 2026-11-12 Local Map repairs, after [the first-visit review](../first-visit/README.md): pictures of the built page in headless Chromium at 1440 by 900, the card pictures at device scale 2. Not decisions: the two looks of the reveal control are for the root and the owner to choose between by eye.

## The connections outside the view, two looks (finding 3)

The same three cards of `packages/explorer/src/client` (`detailPanel.ts`, `index.ts`, `layout-presets.test.ts`), opened by `?view=local&mode=2d&dir=packages/explorer/src/client`, at reading scale and one Zoom Out press out. The line was faint grey 11 px text at 3.3 to 1 ([the review's picture 07](../first-visit/07-local-map-after-opening-client-clipped.png)); it is the control that pins the file, which reveals its connections. Tuning → 2D Layout → Reveal Control switches the look; neither changes any card's box.

| Look | Reading scale | One press out | Focus |
| --- | --- | --- | --- |
| **Link** (default): the Pin glyph beside the same words, underlined, in the colour of the card's other text controls (6.3 to 1) | [reveal-link-reading-scale.png](reveal-link-reading-scale.png) | [reveal-link-one-press-out.png](reveal-link-one-press-out.png) | [reveal-link-keyboard-focus.png](reveal-link-keyboard-focus.png) |
| **Button**: the Pin glyph and the count in the directory's Open frame, its edge on the text column; "outside this view" in the name and title | [reveal-button-reading-scale.png](reveal-button-reading-scale.png) | [reveal-button-one-press-out.png](reveal-button-one-press-out.png) | [reveal-button-focus-and-hover.png](reveal-button-focus-and-hover.png) (focus on `index.ts`, hover on `detailPanel.ts`) |

A stranger shown only the two reading-scale and one-press-out pictures would sooner press the button look, "like Open", but found that it no longer says what the number counts; the link look reads as a web link and says it; the Pin glyph puzzled them ("does clicking it pin something?", which it does). They also read "+4 symbols", a control of the same kind, as information.

## Fit in 2D (finding 5)

[fit-2d-after-press.png](fit-2d-after-press.png): the same directory after pressing Fit current scope, now the first control of the 2D toolbar: the whole picture centred inside the frame at scale 0.41, where the arrival stands at reading size with the picture past the right, top and bottom edges. Measured on the review's three scenes: the scan root fits at 0.89, `client` opened at 0.41, and `client` with `detailPanel.ts` pinned at 0.23; Zoom Out still has somewhere to go from each, its limit being 0.16, the ladder's last step, in all three. The review's wheel stopping at 0.51 did not reproduce on this commit: the wheel went on to 0.16 on all three scenes. At that limit the pinned scene still ran past the frame's left edge, since the wheel zooms about the pointer and the limit bounds the scale, not where the picture stands; Fit is the control that centres it.

## The reading dialog's own Back and Forward (finding 10)

[reader-dialog-own-back-forward.png](reader-dialog-own-back-forward.png): `detailPanel.ts` read by its name, then its dependency `dom.ts` followed. The dialog now carries Back and Forward beside its title, as the full reader of a narrow screen does; the app's Back stands under the backdrop. The Dependencies list `types.ts` / `LocalMapPerspective` and `types.ts` / `ViewName` once each, where the review saw each twice.
