# Probe B: membranes as volumes (2026-09-28)

_The builder's findings for probe B, verbatim. Screenshot numbers refer to the builder's `shots/` folder; the three kept here are `shots/membranes-01-live-docs-open.png` (01), `shots/membranes-02c-pins-per-folder.png` (02c) and `shots/membranes-03a-entering-explorer-shared-mid.png` (03a)._

## What was built and how to drive it

`index.html` (built by `build.cjs` from `src.html`, the index inlined) opens `packages/engine/src/live-docs/` as an open volume. Membership is by codePath prefix, so the wall is the boundary of everything under it: the 22 direct files stand as cards, the two subfolders (`adapters/`, 46 files, and `heuristics/`) stand inside as closed child boxes. Inside, x is dependency order: an Eades–Lin–Smyth pass over data-flow weights orders the nodes (provider left, consumer right, cycles cut at their lightest edges), then longest path over forward edges gives 7 columns. Within a column, cards form a depth run (z) on a ramp (y) so each title peeks over the card in front. Every edge touching the folder is a wire, provider's blue pin to consumer's green pin; imports land on Internals. A wire that crosses the wall pierces it at a wall pin: green pins on the left wall carry what the folder consumes (edges whose `to` is outside), blue pins on the right wall carry what consumes it. The brief had these reversed; the walls follow the Local Map, as the coordinator later confirmed. A wall pin sits at the mean height of the wires it carries, one per remote file by default, in bands per remote folder (`probe.pins("folder")` collapses to one per folder); neighbour boxes lie level with their band, providers left, consumers right. A closed box is a card for a folder: rows are neighbour folders with counts, green pins left, blue right, title and file count as screen-space text. The 17 self edges are laces curling behind the card, occluded front-on. The 3 back edges (all `core.ts` re-exporting from `adapters/`, `discovery.ts` and `sourceAnalysis.ts`, which consume it) are corset stubs.

Drive it: `probe.enter(folder, {hold})`, `probe.resume()`, `probe.orbit(yaw, elev, dist)`, `probe.look(card, yaw, elev, dist)`, `probe.level(0|1|2)`, `probe.pins("file"|"folder")`, `probe.focus(key|null)`, `probe.state()`. Mouse: drag orbits, wheel dollies, hover fades, click holds, double-click a closed box enters it. `shoot.cjs` reproduces every shot.

## What depth bought

- Cross-folder wires got a room of their own (01, 02): 95 outbound wires leave through 14 pins on the right wall and cross an empty corridor to seven closed boxes; 28 inbound arrive through 4 pins on the left. The 2D map disabled these; here they read.
- A backplane (02): a wire that skips columns dives behind the cards between its pins, so front-on the cards occlude it (cut, not boost) and orbiting 30° shows the lacing behind the shelf. Wall wires obey the same rule. It is the corset principle at folder scale, and it made the interior readable.
- A hub column without a scroll: six cards share one x slot and every title is visible (01, column 2).
- A transition that keeps landmarks and text size (03a, 03): the new layout is dropped where the entered box already stood, the camera only translates (0.52 px per unit before and after), the box we came from shrinks in place into its closed form (now the provider box on the left); neighbours the new scene does not need stay as ghosts, pushed clear of the volume.
- The low-detail level (04) still says the shape: one tall card feeding 36 pins, two boxes feeding four.

## What it cost

- Legibility at rest is the real cost. At 0.52 px per unit card titles are 9 px on screen and symbol rows are illegible; they read at 2.0 px per unit (02d). Text that must read at any distance (box titles, band headers, counts) became screen-space labels, which never occlude (05, the ghosts at the top).
- Occlusion: the depth run hides card bodies behind the front card; wires between adjacent columns are still a hairball; `adapters/` takes about 100 wires on one pin and reads as a rope (02d).
- Disorientation: at 30° field of view back-row cards shifted sideways and columns blurred; 18° fixed it at the price of a flatter picture.
- Performance is not a cost: 405 wires in one geometry, 22 textured cards, 12 boxes, the whole index parsed at load.

## Facts the picture needed that the docs do not carry

1. A folder is not a thing in the docs. Wanted at: the box itself (no title, purpose or package fact), the neighbour list (`scripts/live-docs/` and `scripts/live-docs/inspect/` are two boxes because the picture only has `dirOf`), and the consumer column of `shared/` (03), where seven of eight boxes are subfolders of one package the docs cannot name as a system.
2. Display names. Wanted at every title and band header: basenames collide (`scripts/live-docs/`, `tests/integration/live-docs/`); the page invents a short form by dropping `packages/` and `src/`.
3. Whether an outside wire lands on the barrel or the origin. Wanted at the right wall: only 15 of the 95 wires land on `core.ts`; 80 land on `pathfind.ts`, `graph.ts`, `document.ts` and `graphFiles.ts` directly. An edge says `to` and `link`, not "through a re-export".
4. Re-exports should not order. Wanted at the x position of `adapters/`: the three back edges are all re-exports, and the docs do carry `kind: re-export`, so the cut can be deterministic instead of a weight heuristic.
5. External modules have nowhere to land. Wanted at the left wall: `node:fs`, `glob`, `typescript`, `vitest` are imports with no `to`, so the folder's consumption of the outside world got no pin.
6. Symbol kind for re-exported symbols: all 59 of `core.ts`'s are `unknown`, so its rows show no kind.

## Transition points

One scale in, from a card: `probe.look` does the camera; the card grows until its rows read (02d) while the box stays as context. What must stay visible: the wall pins its wires reach, so the folder pulls you back out. One scale out: the open box closes into its card-for-a-folder form (03a shows the shrink) and its wall pins become that card's rows. What must stay visible: the box's title and band headers with counts, exactly what the closed form shows.

```
provider box           open folder            consumer box
┌────────┐●╌╌╌╌▶●┃card ▶ card ▶ card┃●╌╌╌╌▶●┌────────┐
└────────┘blue  green wall pin    blue wall pin  green└────────┘
```

## Keep and throw away

Keep: wall pins at the mean height of their wires, level with their box; the closed box as a card whose rows are folders; the backplane; the translation-only camera on enter; ghosts; the fade (body 0.12, title 0.45). Throw away: the depth run as the only answer to a tall column; per-file pins as the default (per-folder pins with counts read at rest, per-file on hover); every hand-tuned label position.

## Open questions

- Is the wall the right home for the folder's public surface? Here the barrel is not the membrane: 80 of 95 wires bypass `core.ts`. The wall is honest; the barrel doctrine would have to move those wires onto `core.ts`.
- Pin granularity at rest: this probe says per folder with a count, per file on hover, per symbol never at folder scale. Is that the rule?
- Should a child box's facing wall be per file (spreads the rope) or per folder (honest summary)?
- Nesting: when a child is entered, its parent shows as a neighbour box. Should the ancestor remain as a shell around it instead?
