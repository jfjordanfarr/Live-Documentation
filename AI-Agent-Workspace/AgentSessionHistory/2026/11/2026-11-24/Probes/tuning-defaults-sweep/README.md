# Tuning Defaults Permutation Visual Sweep (`2026-11-24`)

_Matched side-by-side visual & slowed-motion evaluation of Tuning panel defaults on `day/2026-11-24` (`b7401c967`, fresh `dist/explorer` served locally over ephemeral HTTP, headless Chromium with D3D12 RTX 3090 WebGL). Zero product or test source files were modified. Every non-target knob was held strictly fixed per comparison (`searchStarts: 0` on 2D stills so layout variance never confounds styling comparisons; native `1.0×` rAF timing for Arrival performance metrics; synchronized `0.2×` playback rate for Arrival `.webm` videos)._

---

## Executive Verdict — Recommended Default Changes

### Tier 1 — Unambiguously Superior Defaults (Recommend Upgrading Now)

| Lever | Current Default | Recommended Default | Visual & Measured Evidence |
| --- | --- | --- | --- |
| `localMap.descriptionsZoomedOut` | `"hidden"` | **`"first-line"`** | Eliminates hollow black gaps between rows at `connections` look (the default arrival rest look!) and fills them with crisp first-line descriptions—immediately telling identical filenames apart (`live-docs/pathfind.ts` vs `client/pathfind.ts`) with **zero** symbol-name truncation (`line-end` and `line-middle` mangle `PaymentRequest`/`PaymentResult`/`PaymentQuery` into identical `Payment...` or `...(class)`). See [03-desc-hidden-repo-pathfind.png](03-desc-hidden-repo-pathfind.png) vs [03-desc-first-line-repo-pathfind.png](03-desc-first-line-repo-pathfind.png). |
| `localMap.cutCounted` | `"off"` | **`"on"`** | Zero visual chrome when a step fits in view; immediately renders clean clickable edge pills (`^ 1`, `> 26`, `v 4`) whenever opening a folder or pinning a cell runs past an edge, removing "where did the 26 files go?" blindness. See [04-step-least-repo-history.png](04-step-least-repo-history.png) vs [04-cut-counted-on-repo-history.png](04-cut-counted-on-repo-history.png). |
| `localMap.step` | `"least"` | **`"lines"`** | Opening `PaymentService/Data`: `least` clips `App.config` and slices `PaymentService.cs` off right; `whole` chops both `App.config` and `PaymentService.cs` half off top; **`lines`** gently eases to `k=0.907` and frames the entire opened folder **plus every card its wires reach** 100% whole inside the frame. See [04-step-least-estate-data.png](04-step-least-estate-data.png) vs [04-step-whole-estate-data.png](04-step-whole-estate-data.png) vs [04-step-lines-estate-data.png](04-step-lines-estate-data.png). |
| `forceGraph.beyondHops` | `"everything"` | **`"next-step"`** | **Massive 3D transformation:** on Estate 3D, fits 100% inside the viewport with zero clipped wires (`Hub · 2` and `SqlServer · 2` both in frame) and cuts settle time **in half** (`4.35 s` vs `8.64 s`). On Repo 3D `graph.ts`, eliminates the chaotic edge-clipping 199-file onion and floating unlabeled dust islands, replacing them with a centered 56-file neighborhood ringed by crisp named 1-step horizon shells (`explorer/src · 54`, `engine/src · 48`, `integration/live-docs · 23`). See [06-3d-beyond-next-step-estate.png](06-3d-beyond-next-step-estate.png) & [06-3d-beyond-next-step-repo-graph.png](06-3d-beyond-next-step-repo-graph.png). |
| `forceGraph.linkWidth` & `forceGraph.nameAt` | `1` & `18` | **`1.5` (or `1.6`) & `12`** *(keep `nodeSize: 4`)* | Default `linkWidth=1` renders nearly invisible dark hairlines on pitch-black navy, and `nameAt=18` leaves most 1-hop spheres anonymous blue dots (`IPaymentService.cs`, `PaymentQuery.cs`, `PaymentResult.cs`, `rows.ts`, `emit.ts`, `relatedDocs.ts`). Bumping `linkWidth` to `1.5–1.6` and lowering `nameAt` to `12` makes 3D immediately legible without crowding (keeping `nodeSize: 4` avoids the bulky shell spheres seen at `nodeSize: 5` in `06-3d-bumped-nextstep-repo-graph.png`). |

### Tier 2 — Strong Candidates With Clear Trade-Offs (Worth Explicit Owner / Root Call)

| Lever | Current Default | Candidate | Trade-Off Observed by Eye |
| --- | --- | --- | --- |
| `appearance.palette` | `"today"` | **`"vividKinds"`** *(not `"proposed"`)* | `today` overloads **blue** for both `Offers` AND active UI chrome (`PaymentService.cs` focus glow, active nav tab, `2D`/`3D`, checkboxes). `proposed` fixes that collision but turns all Implementation spheres/dots into flat dull grey (`01-palette-proposed-estate-3d.png`). **`vividKinds`** gets the best of both worlds: clean neutral white UI selection/focus chrome + vivid blue Implementation & green Test marks (`01-palette-vividKinds-estate-2d.png`, `01-palette-vividKinds-estate-3d.png`). *Trade-off:* changes the app's familiar blue active-button chrome to monochrome white. |
| `appearance.frame` | `"sidebar"` | **`"bare"`** | Reclaims `260 px` (20%+ width) at `1280×800`, provides a crisp top breadcrumb (`◇ / 📁 / PaymentService / PaymentService.cs`), and **completely eliminates the `900×700` drawer-open collapse** (`539 px` map + clean 1-row toolbar vs `279 px` sliver + broken 2-row toolbar!). *Trade-off:* tucks the always-visible `Offers — Uses` Legend and explicit `World Map` / `Knowledge Sources` nav labels behind the breadcrumb and bottom legend button, raising initial discovery friction for first-time strangers. See [08-frame-bare-1280.png](08-frame-bare-1280.png) & [08-frame-bare-drawer-900x700.png](08-frame-bare-drawer-900x700.png). |
| `history.changeEmphasis` | `"dim"` | **`"both"`** *(or improve 2D `dim` CSS)* | In 2D (`07-history-dim-changed-2d.png`), `dim` is way too weak (changed `layout-presets.ts` has no border rim, and when 0 changed files are in view on `graph.ts` it turns every neighbour into unreadable ~15% ghosts). **`both`** gives changed 2D cards an unmistakable crisp white border (`07-history-both-changed-2d.png`) and makes changed 3D spheres pop instantly (`07-history-both-steps-3d.png`). *Trade-off:* in 3D, `both` turns changed spheres white, losing Implementation-blue vs Test-green colour (which the owner asked to preserve on 2026-11-15). |

### Tier 3 — Keep Current Defaults (Verified Superior or Deliberate Owner Choice)

| Lever | Current Default | Verdict & Why |
| --- | --- | --- |
| `appearance.marbles` | `"off"` | **Keep `"off"`.** In 2D closed directories (`01-marbles-on-scripts-2d.png`), tiny ~9 px cells look muddier; in 3D (`01-marbles-on-estate-3d.png`), green veins on Implementation spheres visually mimic green Test spheres (matches owner's 2026-11-19 ruling). |
| `localMap.arrival` | `"then-neighbours-after"` | **Keep `"then-neighbours-after"`** (until mid-motion restyle cost is eliminated in code). Measured on Repo `pathfind.ts` at native `1.0×`: `then-neighbours` (Crossing) spikes to **`183.3 ms`** max frame (nasty mid-motion stutter, 2.75× worse!) vs `83.3 ms` for `Look After` and `66.6 ms` for `Look Before`. In `0.2×` slow-mo (`02-arrival-look-before.webm`), `Look Before` solves the micro-ant shrink but produces a jarring 350 ms giant-44 px title jump (`00:05–00:07`) while still zoomed in at `k=1.45`—confirming why the owner chose `Look After` on 2026-11-22. |
| `localMap.overviewFiles` | `"files"` | **Keep `"files"`.** On Repo `graph.ts` (`03-overview-keep-repo-graph.png`), `keep` turns `graph.ts` into a giant hollow 600 px black rectangle that pushes neighbours off-screen; `files` (`03-overview-files-repo-graph.png`) compacts cards so 18+ files fit cleanly. |
| `localMap.closedDirectory` / `closedShape` / `closedCells` | `"cells"` / `"tab"` / `"kind"` | **Keep all three.** Folder `tab` unmistakably reads as a directory (unlike `square`, which mimics a card, or `round`, which looks like a pill); `cells` + `kind` colour immediately conveys folder size and test/implementation ratio (unlike `box`, `stack`, or dull `grey`). |
| `localMap.hiddenFiles` | `"under"` | **Keep `"under"`.** Honors clickable cells, **but note a layout bug caught here:** in `connections` look (`05-hidden-under-repo-pathfind.png` vs `05-hidden-count-repo-pathfind.png`), long cell rows sit beside the folder name and crush disambiguating parent paths (`...tegration/live-docs` and `...ages/engine/src/live-docs` both collapse to identical bare `live-docs`). Cap the cell strip width so parent path disambiguation survives! |
| `forceGraph.groupWrappers` | `"skin"` | **Keep `"skin"`.** `cloud` and `cloud-rim` turn `Hub · 3` and Repo shells into blurry grey fog blobs that obscure inner spheres (`06-3d-wrappers-cloud-estate.png`, `06-3d-wrappers-cloud-repo-graph.png`). |
| `forceGraph.structureLines` | `"on-demand"` | **Keep `"on-demand"`.** *(Bonus UX catch: switching from a single focused file at `1 hop` into 3D Structure shows only 2 lonely spheres — `PaymentService.cs` + `PaymentService` folder — because sibling files sit 2 hops away via the parent directory!)* |
| `history.axis` | `"time"` | **Keep `"time"`.** Surprisingly, `axis: "steps"` (`07-history-both-steps-3d.png`) is **worse** with `granularity: "auto"` (monthly ticks): it crushes 12 early-month ticks into the left 15% (`Oct 2025–Jan 2026`) and leaves a 45% tickless blank bar across Nov 2026 (where half of the repo's 1,758 commits occurred!). `time` honestly reflects quiet months as designed on 2026-10-22. |

---

## Arrival Frame-Timing Measurements (Repo `pathfind.ts`, Native `1.0×`, `1280×800`)

| Arrival Option | Frames Measured | Max Frame (ms) | p95 Frame (ms) | Frames > 33.3 ms | Frames > 50 ms | Slow-Mo Visual (`0.2×` Estate) |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `then-neighbours-after` *(default)* | 76 | `83.3` | `16.8` | 1 | 1 | Clean hold → smooth zoom-out (brief ~5 px micro-ant phase `00:07–00:08`) → crisp restyle at rest (`00:09`). |
| `then-neighbours-before` | 90 | **`66.6`** | `16.8` | 2 | 1 | Abrupt giant-text inflation at `k=1.45` (`00:05–00:07`), then butter-smooth ease (`00:08–00:10`). |
| `then-neighbours` *(crossing)* | 62 | **`183.3`** | `16.8` | 2 | 2 | Smoothest visual progression at `0.2×`, but suffers a **183 ms mid-motion stutter hitch** at real speed. |

---

## Complete Capture Inventory

### 1. Appearance — `Palette` & `Marbles`
- 2D Estate `PaymentService.cs`: [01-palette-today-estate-2d.png](01-palette-today-estate-2d.png) | [01-palette-proposed-estate-2d.png](01-palette-proposed-estate-2d.png) | [01-palette-vividKinds-estate-2d.png](01-palette-vividKinds-estate-2d.png)
- 2D Repo `graph.ts`: [01-palette-today-repo-graph-2d.png](01-palette-today-repo-graph-2d.png) | [01-palette-proposed-repo-graph-2d.png](01-palette-proposed-repo-graph-2d.png) | [01-palette-vividKinds-repo-graph-2d.png](01-palette-vividKinds-repo-graph-2d.png)
- 3D Estate `PaymentService.cs`: [01-palette-today-estate-3d.png](01-palette-today-estate-3d.png) | [01-palette-proposed-estate-3d.png](01-palette-proposed-estate-3d.png) | [01-palette-vividKinds-estate-3d.png](01-palette-vividKinds-estate-3d.png)
- `Marbles`: [01-marbles-off-scripts-2d.png](01-marbles-off-scripts-2d.png) | [01-marbles-on-scripts-2d.png](01-marbles-on-scripts-2d.png) | [01-marbles-on-estate-3d.png](01-marbles-on-estate-3d.png) *(compare 3D `off` in `01-palette-today-estate-3d.png`)*

### 2. 2D Arrival Motion (`0.2×` Slowed `.webm`)
- [02-arrival-look-after.webm](02-arrival-look-after.webm) (`then-neighbours-after`, default)
- [02-arrival-look-before.webm](02-arrival-look-before.webm) (`then-neighbours-before`)
- [02-arrival-look-crossing.webm](02-arrival-look-crossing.webm) (`then-neighbours`)

### 3. 2D `overviewFiles` & `descriptionsZoomedOut`
- `overviewFiles`: [03-overview-files-estate.png](03-overview-files-estate.png) | [03-overview-keep-estate.png](03-overview-keep-estate.png) | [03-overview-files-repo-graph.png](03-overview-files-repo-graph.png) | [03-overview-keep-repo-graph.png](03-overview-keep-repo-graph.png)
- `descriptionsZoomedOut` (Estate): [03-desc-hidden-estate.png](03-desc-hidden-estate.png) | [03-desc-first-line-estate.png](03-desc-first-line-estate.png) | [03-desc-line-end-estate.png](03-desc-line-end-estate.png) | [03-desc-line-middle-estate.png](03-desc-line-middle-estate.png)
- `descriptionsZoomedOut` (Repo `pathfind.ts`): [03-desc-hidden-repo-pathfind.png](03-desc-hidden-repo-pathfind.png) | [03-desc-first-line-repo-pathfind.png](03-desc-first-line-repo-pathfind.png) | [03-desc-line-end-repo-pathfind.png](03-desc-line-end-repo-pathfind.png) | [03-desc-line-middle-repo-pathfind.png](03-desc-line-middle-repo-pathfind.png)

### 4. 2D `step` & `cutCounted`
- Estate `PaymentService/Data`: [04-step-least-estate-data.png](04-step-least-estate-data.png) | [04-step-whole-estate-data.png](04-step-whole-estate-data.png) | [04-step-lines-estate-data.png](04-step-lines-estate-data.png)
- Repo `live-docs/history`: [04-step-least-repo-history.png](04-step-least-repo-history.png) | [04-step-whole-repo-history.png](04-step-whole-repo-history.png) | [04-step-lines-repo-history.png](04-step-lines-repo-history.png) | [04-cut-counted-on-repo-history.png](04-cut-counted-on-repo-history.png)

### 5. 2D Closed Directories & Hidden Files
- Closed directories (`scripts`): [05-closed-shape-tab-scripts.png](05-closed-shape-tab-scripts.png) | [05-closed-shape-round-scripts.png](05-closed-shape-round-scripts.png) | [05-closed-shape-square-scripts.png](05-closed-shape-square-scripts.png) | [05-closed-look-box-scripts.png](05-closed-look-box-scripts.png) | [05-closed-look-stack-scripts.png](05-closed-look-stack-scripts.png) | [05-closed-cells-grey-scripts.png](05-closed-cells-grey-scripts.png)
- Hidden files (`connections` look, `pathfind.ts`): [05-hidden-under-repo-pathfind.png](05-hidden-under-repo-pathfind.png) | [05-hidden-cells-repo-pathfind.png](05-hidden-cells-repo-pathfind.png) | [05-hidden-count-repo-pathfind.png](05-hidden-count-repo-pathfind.png)
- Hidden files (`reading` look, `pathfind.ts`): [05-hidden-under-reading.png](05-hidden-under-reading.png) | [05-hidden-cells-reading.png](05-hidden-cells-reading.png) | [05-hidden-count-reading.png](05-hidden-count-reading.png)

### 6. 3D Visual Feel & Knobs
- Estate 3D (`PaymentService.cs`): [06-3d-bumped-vis-estate.png](06-3d-bumped-vis-estate.png) | [06-3d-wrappers-cloud-estate.png](06-3d-wrappers-cloud-estate.png) | [06-3d-wrappers-cloud-rim-estate.png](06-3d-wrappers-cloud-rim-estate.png) | [06-3d-beyond-next-step-estate.png](06-3d-beyond-next-step-estate.png)
- Repo 3D (`graph.ts`): [06-3d-default-repo-graph.png](06-3d-default-repo-graph.png) | [06-3d-beyond-next-step-repo-graph.png](06-3d-beyond-next-step-repo-graph.png) | [06-3d-wrappers-cloud-repo-graph.png](06-3d-wrappers-cloud-repo-graph.png) | [06-3d-bumped-nextstep-repo-graph.png](06-3d-bumped-nextstep-repo-graph.png)
- 3D Structure Lines (Estate): [06-3d-structure-on-demand-estate.png](06-3d-structure-on-demand-estate.png) | [06-3d-structure-hover-file-estate.png](06-3d-structure-hover-file-estate.png) | [06-3d-structure-none-estate.png](06-3d-structure-none-estate.png)

### 7. History Scrubber (`changeEmphasis` & `axis`, Repo step 1754)
- Repo `graph.ts` 3D: [07-history-dim-time-3d.png](07-history-dim-time-3d.png) | [07-history-glow-time-3d.png](07-history-glow-time-3d.png) | [07-history-both-steps-3d.png](07-history-both-steps-3d.png)
- Repo `graph.ts` 2D: [07-history-dim-time-2d.png](07-history-dim-time-2d.png) | [07-history-glow-time-2d.png](07-history-glow-time-2d.png) | [07-history-both-steps-2d.png](07-history-both-steps-2d.png)
- Repo `forceGraphView.ts` 2D *(actually contains changed `layout-presets.ts` in step 1754)*: [07-history-dim-changed-2d.png](07-history-dim-changed-2d.png) | [07-history-glow-changed-2d.png](07-history-glow-changed-2d.png) | [07-history-both-changed-2d.png](07-history-both-changed-2d.png)

### 8. Frame (`sidebar` vs `bare`)
- `1280×800`: [08-frame-sidebar-1280.png](08-frame-sidebar-1280.png) | [08-frame-bare-1280.png](08-frame-bare-1280.png)
- `900×700` with Reader drawer open: [08-frame-sidebar-drawer-900x700.png](08-frame-sidebar-drawer-900x700.png) | [08-frame-bare-drawer-900x700.png](08-frame-bare-drawer-900x700.png)
