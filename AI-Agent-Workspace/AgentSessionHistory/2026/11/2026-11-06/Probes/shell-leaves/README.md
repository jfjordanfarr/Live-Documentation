# The instruments of the shells' second round, November 6

_Status: the instruments a builder used on 2026-11-06 to build the 3D shells' bodies from the leaves, kept so that the measurements can be run again. The numbers and pictures they produced are in [the shell-leaves pictures](../../../Screenshots/2026-11-06/shell-leaves/README.md)._

Each script runs from the repository root with `npx tsx`. The browser script drives a private headless Chromium (Playwright's) against a served bundle: build it (`npm run build`, `npm run live-docs:visualize`, the samples' `visualize` scripts) and serve it (`npx http-server dist/explorer -p 8912 -c-1 --silent`). The T3 sample's bundle is a rebuildable output kept outside the repository; to look at it, put its `explorer-data.json` beside a copy of the estate sample's `index.html` and `static` under `dist/explorer/samples/t3-code/`.

| Script | What it measures | Switches, in the environment |
| --- | --- | --- |
| `look.cjs` | One picture in a look: frames and the page's seconds to rest, how many spheres each body draws within its skin against what it holds, a picture at 1440 × 960; with `FRAMES`, the milliseconds of a frame drawn while the camera turns; with `HOVER`, the pointer on one body; with `POPS`, shells popped in turn, each as three pictures (before, the frame of the pop with the page's clock paused and stepped one frame, at rest), whether what it released stood inside the skin where it was shown and at its size, and how far it moved by rest | `PORT`, `BASE`, `PIN` (empty for the archipelago), `SUBJECT`, `HOPS`, `DEPTH`, `LOOK`, `OUT`, `NAME`, `HOVER`, `POPS` (directories, `largest`, `inner`), `WAIT`, `FRAMES` |
| `twin.cjs` | Round one's headless twin of the pinned picture, its shells' and groups' bodies now built from the leaves; `ROOM=round-one` keeps the groups' round-one room | as round one's, with `ROOM` |
