# Pictures of the Explorer

_The owner's standing request (2026-09-29): after changing the Explorer, build it, look at it, and keep the pictures here, so that a sense of the UI accrues in the workspace and a change can be judged against what came before. Each dated folder is listed below with what each picture shows and how it was taken. The probe records under `../Probes/` keep their own pictures; the World Map's first pictures, from 2026-09-28, are there._

## 2026-09-29

Taken from `dist/explorer` (this repository's board) and the estate bundle at `dist/estate` (the board at `tests/integration/programs/csharp/estate/board.md` over generated docs), by a Playwright script driving `window.__worldMap`, at 1600 by 900, after the pinned-panel work.

- `2026-09-29/world-map-estate-01-at-rest.png`: the estate at rest. New: the four dotted lines on the board from `contracts` to the things that stand on it, a station at each, and one strand more beneath each of them.
- `2026-09-29/world-map-estate-02-hover-stands.png`: the line from `hub` to `contracts` hovered: hub stands on contracts, from source, its code built in and no call crossing; six of the thirteen file-level lines behind it and the count.
- `2026-09-29/world-map-estate-03-click-pins.png`: `hub` pinned by a click: its four files, the address it serves and the file that publishes it, what it calls, what calls it, what it stands on and the manifest that names it. Every name is a link.
- `2026-09-29/world-map-estate-04-follow-file-link.png`: after clicking `App.config` in that panel: the Local Map at `Hub/App.config`.
- `2026-09-29/world-map-estate-05-built-on.png`: the built-on layer, the lines to `contracts` kept while the calls fade. The token labels still collide near `hub`.
- `2026-09-29/world-map-repo-03-click-pins.png`: this repository's `engine` pinned: ninety-nine files as links, the panel scrolling.

Taken later the same night, after the zoom into a thing landed, the same way.

- `2026-09-29/world-map-estate-06-lid-unfolding.png`: `gateway` opening, the lid caught halfway through unfolding into the panel while the board dims.
- `2026-09-29/world-map-estate-07-inside-gateway.png`: inside `gateway`: five cards in dependency order, provision left to right; `contracts · 13` and `hub · 1` as pins on the left wall, what it calls; `portal · 2` on the right wall, wired to the two routes it serves.
- `2026-09-29/world-map-estate-08-inside-hover.png`: the project file's card hovered; what it is not wired to fades.
- `2026-09-29/world-map-repo-04-inside-engine.png`: inside this repository's `engine`: the files of `src/config` and `src/tooling` flat, `src/languages` and `src/live-docs` as boxes whose rows are their neighbours with counts, and the five things that stand on the engine as pins on the right wall.
- `2026-09-29/world-map-repo-05-inside-live-docs.png`: one level deeper, `src/live-docs` with eighty files and `boardGraph.ts` hovered: dense at rest, legible on hover.
