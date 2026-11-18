# The instruments of the Internals row's held pictures, November 8

_Status: the instruments a builder used on 2026-11-08 to picture the 2D Local Map's Internals row in five forms by injected styles, kept so that the pictures and the measurements can be taken again. The pictures, the readings and the forms' reasons are in [the internals-held pictures](../../../Screenshots/2026-11-08/internals-held/README.md). They change nothing in the product._

Each script runs from the repository root with `npx tsx`, against a served bundle (`npm run build`, `npm run live-docs:visualize`, `npx http-server dist/explorer -p 8900 -c-1 --silent`; the pictures were taken on port 8900's bundle of `476ea2c8`), under the machine's browser lock when other browser runs share it (`flock <lock> npx tsx …`).

| File | What it is | Switches, in the environment |
| --- | --- | --- |
| `internals-held.cjs` | Loads a subject in the 2D Local Map in a fresh private context a form (1440 × 960, device scale 2, a fresh visitor's settings, the background search off), the form's stylesheet appended to the head as soon as the parser reaches the body, so that it follows the bundle's own stylesheet and is in place before the page's first render. Presses Zoom Out one step at a time and, at the chosen presses, saves a crop round the subject card's Internals dot, the whole frame, or the frame after a drag; and reads, for the subject and the cards named, the Internals row's name (its height on screen, its drawn type size, its held scale), a public row's name beside it, the row's height, the dot's or square's box and how far the drawn head (name, Pin, More, dot) stands outside the row's box, outside the dashed outline and past the card's bottom border. Prints one line a form and press and writes `<name>-readings-<presses>.json` | `FORMS` (a comma list of `as-built`, `H`, `C1`, `C2`, `C3`), `SUBJECT`, `NAME`, `PIN` (`none`, `whole`, or `search` for the address the search gives when the file is typed and chosen), `BASE` (port 8900 by default), `OUT`, `PRESSES` (`0,3,6,8` by default), `SHOT` (`crop` or `panned`), `CROP` and `CROP_<press>` (the crop's `w,h` in CSS pixels, 560 × 330 by default, the dot at 42 % across and 70 % down), `BOTTOM` (keeps a crop's foot that many pixels above the frame's, clear of the toolbar), `WHOLE` (presses at which the whole frame is also saved), `PAN` and `FROM` (the drag for `panned`, `-700,0` from `400,800` by default), `MEASURE` (other cards to read, a comma list of file paths), `W`, `H` |
| `compose.cjs` | Assembles the crops into `forms-reading.png` (the forms at reading scale side by side) and `forms-zoomed-out.png` (a row a form, three presses each), each crop at its own pixels with a caption | `DIR`, `NAME`, `FORMS`, `OUTER` (the presses of the second composite, `3,6,8` by default) |
| `h.css` | Form H: the row as built, its name, buttons and dot held as a public row's are | |
| `c1.css` | Form C1, over H: a black square in the dot's own box | |
| `c2.css` | Form C2, over C1: the square at 18 px | |
| `c3.css` | Form C3, over C1: the outline and background dropped | |

The forms compose in the script: H is `h.css`, C1 is `h.css` and `c1.css`, C2 adds `c2.css` to C1, C3 adds `c3.css` to C1.

The commands that took the set:

```bash
P=AI-Agent-Workspace/Probes/2026-11-08/internals-held; O=AI-Agent-Workspace/Screenshots/2026-11-08/internals-held
OUT=$O WHOLE=0 BOTTOM=70 CROP_6=360,220 CROP_8=360,220 MEASURE=packages/explorer/src/client/views/localView/branch-renderer.ts npx tsx $P/internals-held.cjs
DIR=$O npx tsx $P/compose.cjs
for press in 4 5; do
  OUT=$O SUBJECT=packages/explorer/src/client/views/symbolAnchors.ts PIN=search FORMS=as-built,H,C1 PRESSES=$press SHOT=panned PAN=-700,0 MEASURE=packages/explorer/src/client/views/localView/branches.ts,packages/explorer/src/client/views/localView/connections.ts npx tsx $P/internals-held.cjs
done
```

The whole frames at reading scale were kept for as built and C1 only. Each of the owner's presses is its own walk: the map is dragged back after a press for the next one, and a drag back from `FROM` + `PAN` can start off the page, where it selects the page's text instead of moving the map (the first take's fifth press was an empty map for that reason).
