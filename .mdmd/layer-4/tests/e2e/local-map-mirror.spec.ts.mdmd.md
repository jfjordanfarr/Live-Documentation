# `tests/e2e/local-map-mirror.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/local-map-mirror.spec.ts`
- Generated At: 2026-11-22T04:50:14.379Z

## Authored
### Purpose
Holds the 2D Local Map's mirror button to its promises in a browser: a press reflects every card about the subject, which keeps its place, and the button and the key say which way the picture reads; the keyboard presses it; the choice outlasts a reload and is in no address; the mirrored picture keeps every law of the scenario suite with the sides exchanged; and the button is offered only in 2D.

### Notes
- Written 2026-11-22 with the mirror ([the Explorer design](../../../layer-3/live-documentation-explorer.mdmd.md#which-way-the-2d-picture-reads-the-mirror-2026-11-22)). Read on this repository's own map, the pathfinder in focus, which has files on both sides of it.
- Each case was seen failing against a page broken for it, built once with four breaks: the root's reflection taken out of the stylesheet (the press's case failed on a card 1,046 px from its mirrored place, and the laws' case on the law of the sides), the button's explanation reworded (the keyboard's case), the saving left out of the press (the reload's case, on the stored settings) and the button shown in every view (the last case, in 3D).
- Five cases hold the motion (Tuning's Mirror Turn, added the same day) and what comes to rest with it. The page is watched from before the press, frame by frame, for the form the layer names, for the plane's own turning as the page computes it, and for how strongly the held card and one other card are drawn.
  - *By default the press turns the picture's plane, and the lever chooses the slide or the cut*: the default names the turn and the plane turns, the held card never dims while another does, Slide names the slide, Cut names neither, and each ends in the same mirrored picture as the turn to the pixel. The default changed twice on the day it was written, turn to cut and back to turn when the owner had chosen it by eye; the case in its last form was seen failing on the page whose default was still the cut.
  - *Reduced motion takes the cut whatever the lever says.*
  - *A second press before the turn ends leaves the picture in one of its two states, never between*: two presses in one task of the page, and a press, a pause inside the motion and a press, each end as laid out with every card where it stood.
  - *The cut fades everything but the held card*: the held card keeps its whole strength while another card goes below a fifth.
  - *A step's cut is counted again when the picture is mirrored*: with Cut Counted on and a directory too large for the view opened, the signs at the edges say what lies past each edge as laid out, mirrored and put back.
- How those five were seen failing. The second press's case failed on the product as first written, a card 1,547 px from its place: coming to rest redrew the wires, the page was told their count and asked for the mirror again from inside that rest, which started a motion that the press then started another over. The other four failed together against one page broken for each of them: the lever read as the turn where it said slide (the lever's case, at the slide), reduced motion not asked about (its case saw a turn), the cut fading the held card with the rest (its strength fell to nothing), and the step's cards not measured again at rest (the signs said one edge where the cards lay past three); the six other cases passed on that page.
- The laws' case compares the mirrored picture with the same picture as laid out, law by law, since a subject taller than this window reaches below the frame either way. Its first run found the suite's instrument placing a directory's published segments unreflected, which `scenarios/instrument.ts` now reflects.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- `node:path` - `path`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`instrument.readSettled`](./scenarios/instrument.ts.mdmd.md#symbol-readsettled)
- [`instrument.watchPage`](./scenarios/instrument.ts.mdmd.md#symbol-watchpage)
- [`judgments.LAWS`](./scenarios/judgments.ts.mdmd.md#symbol-laws)
- [`judgments.routesForward`](./scenarios/judgments.ts.mdmd.md#symbol-routesforward)
- [`judgments.usesLeftOfferingsRight`](./scenarios/judgments.ts.mdmd.md#symbol-usesleftofferingsright)
- [`still-picture.displayNames`](./still-picture.ts.mdmd.md#symbol-displaynames)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
- [`still-picture.localMapStill`](./still-picture.ts.mdmd.md#symbol-localmapstill)
<!-- LIVE-DOC:END Dependencies -->
