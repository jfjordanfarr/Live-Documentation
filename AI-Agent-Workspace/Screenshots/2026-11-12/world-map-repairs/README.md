Implementation evidence for the World Map repairs of 2026-11-12, taken by the builder on its own build of the round, for the root's review and the owner's eye. The repairs answer findings 6, 7, 12, 17 and 19 of [the first visit](../first-visit/README.md). Current as of the first milestone: labels and the design audit.

All pictures are 1440 by 900, the board reset to its Layout, with the camera driven through the view's handle (`window.__worldMap`).

## Labels clear the pieces

Before, a piece's name and second line were anchored at the middle of its lid, 14 px above it and 1 px below it. So the second line lay across the lid and the name across its far half, and a thin piece's edges struck through its words (the first visit's pictures 01, 02 and 32). Now a label stands above the top of its piece's outline. Where a nearer piece's label or any piece's outline is in its way, it moves up one line at most or sideways by up to half its width; failing that, it stands below its piece, clear of the strands. The line under the name keeps the name's height and may find its own place aside. Only where nothing clears does that second line go; the hover, the pinned panel and the keyboard's name for the piece still say what it said.

- `01-repository-first-load.png`: this repository as it first opens. No label crosses its own piece, another piece or another label, and no second line is hidden. `generator`'s label stands under its tile: above it, the label would touch `explorer`'s, which moved a quarter of its width left to clear `live-docs`' tile. Still wrong here, and outside this audit: the dotted built-on line passes close to `generator`'s lowered label.
- `02-repository-top-down.png`: straight down. Every label is above its box, including the thin `tests`, `programs` and `fixtures`, whose edges struck through their words before. Still wrong here, and outside this audit: the vertical wire from `live-docs` down to `generator`'s door runs through `generator`'s two lines. Wires through words are not measured by the audit; doors sit on the boxes' top edges right under the second lines.
- `03-repository-quarter-turn.png`: turned 90°, elevation 30°. Clean.
- `04-estate-first-load.png`, `05-estate-top-down.png`: the estate, clean in both.
- `06-estate-quarter-turn-hub-below-touching-on-prem.png`: the estate turned 90°. `contracts` stands behind `hub`, so `hub`'s label goes below its cube, where at this window size it touches the region name `ON-PREM` by about a pixel past the audit's tolerance. At the browser suite's 1280 by 720 the same state passes.
- `07-repository-worst-angle-225-rows-in-line-of-sight.png`: the sweep's worst angle, 225° at 30°. This board's things stand in rows of a grid, and at 45° and 225° each column lines up with the line of sight. The pieces themselves overlap, so labels cannot clear them; names crowd and second lines go.

## The audit

`tests/e2e/world-map-design.spec.ts` now holds every label off every piece's outline, its own or another's, as well as off every other label. It checks both boards at first load, from straight above, turned a quarter (90°, 30°), and at the walkthrough's angle (−35°, 42°). The judge is `textOverShapes` in `tests/e2e/design-audit.ts`, with its own cases in `design-audit.test.ts`.

- `audit-on-99395eef.txt`: the eight cases run on the build of commit `99395eef`, before the repair. All eight fail. For example, at first load on this repository 24 labels are drawn across their own outline and one (`pages-workflow`) across `ci-workflow`'s.

## The orbit sweep

A driver (kept in the session scratchpad, not committed) reset each board and measured it as it first opens, from above, and at 24 azimuths each at elevations 30°, 18° and 55°: 148 states over the two boards. The measures are the audit's own functions. The totals below come from successive rules on the way to the current one:

| Rule | Own outline | Another's outline | Label on label | Second lines hidden |
| --- | ---: | ---: | ---: | ---: |
| Above the outline; names step up only | 0 | 288 | 49 | 476 |
| Name and line move together, up and aside | 0 | 104 | 22 | 85 |
| The line finds its own place aside | 0 | 95 | 19 | 104 |
| Below the piece when above is full (current) | 0 | 48 | 24 | 63 |

At first load, from above and turned a quarter, which the sweep includes, the current rule leaves nothing on either board but the one-pixel touch in picture 06. The walkthrough's angle is not in the sweep; the browser suite checks it at 1280 by 720, where it passes on both boards. The rest gathers where the board's rows line up with the line of sight. The worst state is 45° at 18° on this repository: 6 crossings of another piece and 9 second lines hidden. Picture 07 shows 225° at 30°: 3 crossings, 2 labels on labels and 7 second lines hidden.
