Implementation evidence for the World Map repairs of 2026-11-12, taken by the builder on its own build of the round, for the root's review and the owner's eye. The repairs answer findings 6, 7, 12, 17 and 19 of [the first visit](../first-visit/README.md): labels and the design audit, the pinned panel, the board's tools as icons, keyboard reach, the walkthrough's return and a loading sign.

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

Still wrong, outside this round: wires and the dotted built-on line pass through words, which the audit does not measure (pictures 01 and 02). The root has kept this as an open defect.

## The pinned panel

Before, a click on `explorer` opened a panel at the pointer, on the piece. It listed all 213 files first; "called by", "stands on" and "open explorer" came ten panel-heights down, and the close button scrolled away with the top (the first visit's pictures 04 and 31). Now a piece's panel says what the piece is (kind, region, folder) and who it talks to, then gives the link that opens it, with the files folded behind their count, last. Its head, with the close button, stays at the top while the rest scrolls. The panel stands beside its piece, never on it, inside the view below the tools. Of the places that clear the piece, it takes the one that covers least of the piece's wired neighbours and its door names, and unfolding the files places it again.

- `08-explorer-pinned-panel.png`: `explorer` pinned. The panel stands below and to the left of the piece, covering nothing on the board but an empty stretch and the dotted built-on line.
- `09-explorer-files-unfolded-scrolled-to-the-end.png`: the files unfolded and scrolled to their end. The head and the close button are still at the top. The panel, now 350 by 425, does not fit in the 316 px left of `explorer`, so it stands to the right and covers `scripts` and `tests` while the files are shown. Without being placed again it had kept its first spot and covered `explorer`'s own edge; it is placed again since.
- `10-estate-hub-pinned-panel.png`: the estate's `hub` pinned. The panel stands below and to the left of the hub, clear of `payments`, `sqlserver` and `oracle`, the chain the first visit found it covering. It does cover the hub's ghost door name, `net.tcp://payments-staging…`, which the panel itself lists under "calls out to". Every place that clears the ghost name covers `payments` or the databases.

Settling labels against outlines had also flung a door's name up to 70 px from its door, since a door sits on its piece's wall. A door's name now starts just beyond the piece's outline at its own height (`explorer`'s "from live-docs", pictures 08 and 09).

## The board's tools

The nine text buttons are icons in three groups parted by rules: turning, what the board shows, and the layout. Each has its name as its accessible name and its key in its tooltip ("Turn left (Q)"), and the four toggles carry their pressed state. Native tooltips are drawn outside the page and do not appear in headless screenshots; the browser case reads each tooltip's text instead.

- `11-tools-first-drawn-3x.png`: the first drawings, at three times scale. The arcs round a diamond for turning read as gauges, the arrow onto a box for looking down read as a second download beside "Save board", and the block on strands for built on read as a stool.
- `12-tools-as-built-3x.png`: as built. Open circular arrows for turning; a cube with its top filled for looking straight down, which reads as a view from above to a CAD user, perhaps only as "3D" to others; layers for built on; then the grid, the moon, the Local Map's fit corners, a hooked arrow for reset and a download arrow for saving the board text.
- `13-tools-top-down-and-built-on-pressed-3x.png`: two toggles pressed, filled in blue.

## Keyboard reach

Each piece is a keyboard stop in the board's own order, the order its author wrote its things in, named for what it is ("explorer, web, 214 files"). The stops come after the search field and before the tools, and stay in place when the board turns. Focus shows the hover's peek beside the piece and a blue ring on its outline. Enter or Space pins the piece and takes the keyboard into its panel, where Tab reaches the panel's links. Escape lets go and returns to the piece. Wires and doors are not stops yet.

- `14-keyboard-on-explorer.png`: three Tabs from the search field, the keyboard on `explorer`.
- `15-keyboard-enter-then-tab-into-panel.png`: Enter, then Tab; the keyboard is on the panel's first link.
- `16-keyboard-escape-back-on-explorer.png`: Escape; the panel is let go and the keyboard is back on `explorer`.

## The walkthrough

- `17-walkthrough-before.png`, `18-walkthrough-step-5-orbits.png`, `19-walkthrough-after-done.png`: the board before, at the step that shows orbit, and after "done". Afterwards the camera, pan and zoom equal those before to six places. On the build before the repair, "done" left the board turned (the first visit's picture 03).

## Loading

- `20-loading-sign.png`: the data held back for three seconds. Three muted dots brighten in turn where the map will be, with no words, named "Loading" for a screen reader. They go before the first view draws, or before a refusal takes their place. The sidebar footer's "Loading..." is unchanged.

## The later cases on the build before the repair

`later-cases-on-99395eef.txt` holds the eight new browser cases run against the build of commit `99395eef`, all failing:
- the panel's order;
- the panel covering `explorer`;
- the hub's panel covering pieces wired to the hub;
- text tools;
- no keyboard stops in the board's order;
- the walkthrough's turn never undone;
- no loading sign;
- the close-control case, which stops earlier because that build has no fold to open.
