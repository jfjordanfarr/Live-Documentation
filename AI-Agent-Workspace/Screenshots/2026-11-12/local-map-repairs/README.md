Evidence from the builder's rounds of the 2026-11-12 Local Map repairs, after [the first-visit review](../first-visit/README.md): pictures of the built page in headless Chromium at 1440 by 900, the card pictures at device scale 2.

## The connections outside the view (finding 3)

The root chose the framed button on November 12, as `+21 connections`: on a card what acts is framed or filled (the header's icon buttons, the directory's Open), while underlined text is a link to a file, and the stranger below reached for the frame first. The `+` is the card's own idiom for what is not drawn here, as `+4 symbols` says, which answers the stranger's question of what the number counts without more words on screen; the accessible name is "+21 connections outside this view", and the trial's switch is gone.

The final form on the same three cards at reading scale ([reveal-final-reading-scale.png](reveal-final-reading-scale.png)) and one press out ([reveal-final-one-press-out.png](reveal-final-one-press-out.png)), and on the estate's Portal, where `Web.config` carries one ([reveal-final-estate-portal.png](reveal-final-estate-portal.png)). Every card's box was compared with the previous commit's build in nine scenes of this repository and the estate: 138 boxes, 87 of these controls drawn, none different.

The two looks that were compared, as they were:

The same three cards of `packages/explorer/src/client` (`detailPanel.ts`, `index.ts`, `layout-presets.test.ts`), opened by `?view=local&mode=2d&dir=packages/explorer/src/client`, at reading scale and one Zoom Out press out. The line was faint grey 11 px text at 3.3 to 1 ([the review's picture 07](../first-visit/07-local-map-after-opening-client-clipped.png)); it is the control that pins the file, which reveals its connections. Tuning → 2D Layout → Reveal Control switched the look during the trial; neither changed any card's box.

| Look | Reading scale | One press out | Focus |
| --- | --- | --- | --- |
| **Link** (default): the Pin glyph beside the same words, underlined, in the colour of the card's other text controls (6.3 to 1) | [reveal-link-reading-scale.png](reveal-link-reading-scale.png) | [reveal-link-one-press-out.png](reveal-link-one-press-out.png) | [reveal-link-keyboard-focus.png](reveal-link-keyboard-focus.png) |
| **Button**: the Pin glyph and the count in the directory's Open frame, its edge on the text column; "outside this view" in the name and title | [reveal-button-reading-scale.png](reveal-button-reading-scale.png) | [reveal-button-one-press-out.png](reveal-button-one-press-out.png) | [reveal-button-focus-and-hover.png](reveal-button-focus-and-hover.png) (focus on `index.ts`, hover on `detailPanel.ts`) |

A stranger shown only the two reading-scale and one-press-out pictures would sooner press the button look, "like Open", but found that it no longer says what the number counts; the link look reads as a web link and says it; the Pin glyph puzzled them ("does clicking it pin something?", which it does). They also read "+4 symbols", a control of the same kind, as information.

## Fit in 2D (finding 5)

[fit-2d-after-press.png](fit-2d-after-press.png): the same directory after pressing Fit current scope, now the first control of the 2D toolbar: the whole picture centred inside the frame at scale 0.41, where the arrival stands at reading size with the picture past the right, top and bottom edges. Measured on the review's three scenes: the scan root fits at 0.89, `client` opened at 0.41, and `client` with `detailPanel.ts` pinned at 0.23; Zoom Out still has somewhere to go from each, its limit being 0.16, the ladder's last step, in all three. The review's wheel stopping at 0.51 did not reproduce on this commit: the wheel went on to 0.16 on all three scenes. At that limit the pinned scene still ran past the frame's left edge, since the wheel zooms about the pointer and the limit bounds the scale, not where the picture stands; Fit is the control that centres it.

## The reading dialog's own Back and Forward (finding 10)

[reader-dialog-own-back-forward.png](reader-dialog-own-back-forward.png): `detailPanel.ts` read by its name, then its dependency `dom.ts` followed. The dialog now carries Back and Forward beside its title, as the full reader of a narrow screen does; the app's Back stands under the backdrop. The Dependencies list `types.ts` / `LocalMapPerspective` and `types.ts` / `ViewName` once each, where the review saw each twice.

## Escape and the pin tray (finding 15)

Escape now closes the open tray, after every surface above it has taken its own: the search field, a card's menu, an open popover or a modal dialog keep theirs, and a second Escape closes the tray. The focus returns to the toggle when it was inside the tray. No picture: the browser regression in `local-map-pins.spec.ts` holds it, and fails on the previous commit's build at the first Escape.

## Centre from the overview (finding 12): what happens, measured

Investigation only, nothing changed. The review's scene (`client` opened, `detailPanel.ts` pinned), six Zoom Out presses to the far band at scale 0.335, then More → Centre on `dom.ts`; [before](centre-from-overview-before.png), [after](centre-from-overview-after.png). A per-frame log of the camera and four cards, headless Chromium with software raster, the idle search on and off alike:

- 0.93 to 1.37 s with no frame at all after the press: one task renders the new subject's scene (1.35 s of script, 0.3 s of style, 0.2 s of layout in the traced run).
- About 0.45 s of the cards' move at the far scale, the camera only translating to hold the subject's name: the "tiles flying over each other".
- Then the camera's eased zoom to 1.45, which is 350 ms by the clock, gets two frames: 0.335, 0.52 or 0.62, then 1.45, because the main thread waits 0.8 s and then 0.4 to 0.5 s in the middle of it. The trace shows the main thread nearly idle in that wait while raster workers spend 2.3 s rasterizing a layer of about 16,000 by 15,000 px: the map's viewport, promoted to a compositor layer for as long as the camera moves (`data-camera="moving"`, the decision of 2026-11-06), rasterized in software. Zoom In presses across the same bands, which are instant and promote nothing, cost 70 to 100 ms each.

So the transitions are there, a move and then an eased zoom, but on a software rasterizer the zoom is starved into a jump. A GPU browser rasterizes far faster, and the record already names that measurement as open (the containment and skipping section of the Explorer design). Two smaller observations: the camera eases the scale linearly with an ease-out cubic, which puts most of a zoom-in into its first frames even when frames are plentiful; and the zoom follows the move rather than accompanying it.

## Names in the 3D Local Map: what is drawn, looked at

Investigation only, nothing changed. A fresh 3D picture of this repository at 1440 by 900, Connections with Skin and one hop, the archipelago: 94 of 955 files, 42 groups and 52 alone ([names-3d-fresh-at-rest.png](names-3d-fresh-at-rest.png)).

- **At rest, no name at all.** Nothing is asked about, and the spheres measure 2.5 to 12 px in radius, a median near 4.5, against Name At's 18: the design's rule (names at rest only for what was asked about, the hovered sphere and pins, the rest at Name At) as built.
- **A hover that hits names the sphere.** On the centre of `.github/workflows/pages.yml`, 2.5 px in radius, its name stands beneath it and the Pin, Centre and More strip above ([names-3d-hover-hits-sphere.png](names-3d-hover-hits-sphere.png)).
- **A hover 9 px off names nothing** ([names-3d-hover-9px-off.png](names-3d-hover-9px-off.png)): the pick is the drawn sphere and has no tolerance around it, so on a sphere 5 px across the pointer has to be within 2.5 px.
- **A bubble shows nothing at rest** ([names-3d-bubble-at-rest.png](names-3d-bubble-at-rest.png)); **hovered, it takes its seed's file name**: the main group's bubble of 506 files reads `local-storage.ts`, its most connected file, with the strip above ([names-3d-bubble-hovered.png](names-3d-bubble-hovered.png)). A pointer on a sphere drawn inside the bubble shows the same: the files inside a skin are not picked one by one. The group's size is only in the name's tooltip ("506 files in this group").
