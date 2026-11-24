# Probe: 2D Flow Directory-Walk Reshuffle and 3D Structure File-to-File Wires

_Historical diagnostic probe measured on 2026-11-24 against commit `257914ceb` (`dist/explorer` at 1280×800, DPR 1, default shipped settings: 2D Flow + Folded + `moveMs: 450` + `searchStarts: 32`; 3D Structure + Skin + 1 hop). Raw metrics are in [measurements.json](measurements.json)._

This probe reproduces and measures the two coupled faults the owner raised on [2026-11-22 (Turns 12–14)](../../../2026-11-22/2026-11-22.1.record.md#turn-12):
1. Opening directories in 2D with Flow enabled suddenly reshuffles cards and closed boxes outside the opened directory once any connected files appear.
2. In 3D Structure (directory-centric mode), file-to-file reference wires still cut across the containment tree.

---

## Part A — 2D Flow Directory-Walk Reshuffle

### 1. Root-Cause Code Trace

Four interacting mechanisms cause opening a single directory to rearrange unrelated cards and closed boxes across the whole map:

1. **Transitive ancestor contagion in `layFlow()` ([directory-flow.ts](../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L153-L201)):**
   `exploreBranches()` ([branches.ts](../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L357)) enables `flow = opened.size > 0 && options.directoryFlow === true` on every directory walk, including the scan root. When `pairLines(undrawn)` ([branches.ts](../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L380)) returns zero lines, `ranked` is empty and every opened directory falls into the square-grid fallback (`width = ceil(sqrt(items.length))`, [directory-flow.ts](../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L193-L199)). The moment *any* opened directory produces even one pair line, `holding(ranked, directory)` ([directory-flow.ts](../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L156-L164)) checks transitive containment (`under(input.directoryOf(id), directory)`), pulling **every ancestor up to scan root `""`** into `flowing`.
2. **Global split of boxes vs. loose files and column-span expansion ([directory-flow.ts](../../../../../../../packages/explorer/src/client/views/localView/directory-flow.ts#L166-L184)):**
   Every directory in `flowing` abandons the square grid. Closed boxes are `unshift`ed across `first .. first + across - 1`, while loose (unconnected) files are pushed to `last + 1 + (index % width)` — past the rightmost column of all deeper ranked files. Because `flowing` iterates deepest-first (`depth(b) - depth(a)`), opening a deep connected folder (`packages/explorer/src/client`) expands `""`'s transitive `span` from 5 columns to 11, re-distributes root closed boxes across the new span, and flings root loose files (`eslint.config.js`, `.gitattributes`, `packages/explorer/package.json`) nearly 4,000 px right (column 3 → column 10).
3. **Why `churn` does not prevent the reshuffle ([branch-renderer.ts](../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L503-L528), [branch-restarts.ts](../../../../../../../packages/explorer/src/client/views/localView/branch-restarts.ts#L100-L111)):**
   - `shapeOfDirectories()` ([branch-renderer.ts](../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L519-L524)) prices every candidate `FlowShape` (`rows`, `boxRows`, `looseColumns`) with `previous = null` and **`churn: 0`** so links stay order-independent. Opening a directory therefore re-optimizes `FlowShape` globally with zero penalty for relocating existing ancestors.
   - During the order step (`layoutStarts`, [branch-renderer.ts](../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L446-L451)), `churnOf()` ([branch-restarts.ts](../../../../../../../packages/explorer/src/client/views/localView/branch-restarts.ts#L101-L111)) counts **only vertical pairwise inversions within the same column**. Moving 16 of 21 outside items into different columns charges **`churn = 0`**. Across all 11 click steps measured below, `orderSignals.churn` was **`0`** on 10 of 11 steps (the sole non-zero step was `open packages` at `churn = 7`, where items swapped vertically inside existing columns).
   - Closed boxes are pinned alphabetically at column tops (`leading: new Set(closed.keys())`, [branches.ts](../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L470)), ignoring `previousTops`.
   - Flow Option C (`ownFlowAnchors`, [branches.ts](../../../../../../../packages/explorer/src/client/views/localView/branches.ts#L401)) activates only when `retained.size > 0` (pins/selection), not during unpinned directory walks (`retained.size === 0`).
4. **Sequential continuing-search moves multiply the disruption ([branch-renderer.ts](../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L478-L492), [L1288-L1307](../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L1288-L1307)):**
   Each click runs an initial `450 ms` `stage.move`, then schedules idle continuing-search trials (`alignment`, `cycle`, `seed`), each adoption running another `450 ms` `stage.move`. Opening `client` triggered **11 sequential moves (5.2 s)** (`10` alignment adoptions); opening `views` triggered **21 sequential moves (11.0 s)** (`1` cycle + `19` alignment adoptions).

### 2. Step-by-Step Displacement Measurements (`1280×800`, default settings)

"Outside items" are surviving cards and closed boxes present before the click that are neither the clicked closed box nor inside it. Displacement is measured in layout coordinates (CSS pixels inside `.local-placed`, camera-independent) and screen coordinates (`getBoundingClientRect()`). Every click step animated via `stage.move` (`sawMovingTrue: true`); none teleported in one frame, though multi-second alignment chains caused repeated visible jerks.

#### Walk 1 — Repository Deep Walk (`/?view=local&dir=`, recorded in [2d-repo-flow-walk.webm](2d-repo-flow-walk.webm))

| Step | Action | Click | Cards / Boxes / Wires / Cols | Outside Moved (Layout >1 px) | Col Changed | Layout Median / Max | Screen Median / Max | Moves (Total ms) | Search Adoptions | `churn` | `flowShape` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | Land on scan root `""` | — | 10 / 6 / 1 / 4 | — | — | — | — | — | 0 | 0 | `rows: null, loose: {"": 2}` |
| 1 | Open `packages` | mouse | 10 / 9 / 1 / 4 | 15/15 (100%) | 2 (13.3%) | 302.0 / 639.0 px | 302.0 / 639.0 px | 1 (448 ms) | 0 | 7 | `rows: null, loose: {"": 2}` |
| 2 | Open `packages/explorer` | mouse | 12 / 9 / 2 / 5 | 18/18 (100%) | 14 (77.8%) | 442.1 / 838.0 px | 595.1 / 1,040.9 px | 3 (1,394 ms) | 2 (2 aln) | 0 | `rows: 1, loose: {"": 2}` |
| 3 | Open `packages/explorer/src` | mouse | 12 / 10 / 2 / 5 | 1/20 (5.0%) | 0 (0%) | 0.0 / 106.0 px | 90.0 / 196.0 px | 3 (1,371 ms) | 2 (2 aln) | 0 | `rows: 1, loose: {"": 2}` |
| 4 | Open `packages/explorer/src/client` | mouse | 37 / 16 / 42 / 11 | **20/21 (95.2%)** | **16 (76.2%)** | **1,545.6 / 4,036.7 px** | **1,533.8 / 4,029.9 px** | **11 (5,221 ms)** | **10 (10 aln)** | **0** | `rows: 5` |
| 5 | Open `packages/explorer/src/client/views` | offscreen* | 94 / 17 / 171 / 12 | **51/52 (98.1%)** | **20 (38.5%)** | **656.2 / 1,901.5 px** | **1,489.2 / 2,730.5 px** | **21 (10,963 ms)** | **20 (1 cyc, 19 aln)** | **0** | `rows: null` |

*\*At Step 5, `packages/explorer/src/client/views` was already pushed outside the `1280×800` viewport by Step 4's 11-column expansion, so the script invoked `.click()` directly on its handle.*

Worst outside movers on Step 4 (`open client`):
- `eslint.config.js` (higher ancestor `""`): col 3 → col 10, `dx = +3,997 px`, `dy = +565 px` (`4,036.7 px`).
- `.gitattributes` (higher ancestor `""`): col 3 → col 10, `dx = +3,997 px`, `dy = +565 px` (`4,036.7 px`).
- `packages/explorer/package.json` (higher ancestor `packages/explorer`): col 2 → col 9, `dx = +3,997 px`, `dy = -322 px` (`4,009.9 px`).

#### Walk 2 — Repository Shallow Walk (`/?view=local&dir=`)

| Step | Action | Click | Cards / Boxes / Wires / Cols | Outside Moved (Layout >1 px) | Col Changed | Layout Median / Max | Screen Median / Max | Moves (Total ms) | Search Adoptions | `churn` | `flowShape` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | Land on scan root `""` | — | 10 / 6 / 1 / 4 | — | — | — | — | — | 0 | 0 | `rows: null, loose: {"": 2}` |
| 1 | Open `scripts` | mouse | 21 / 11 / 7 / 5 | **14/15 (93.3%)** | **13 (86.7%)** | **603.8 / 1,115.4 px** | **526.0 / 1,030.2 px** | 4 (1,877 ms) | 3 (3 aln) | 0 | `rows: null` |
| 2 | Open `scripts/live-docs` | mouse | 41 / 11 / 24 / 7 | **29/31 (93.5%)** | **21 (67.7%)** | **657.5 / 1,642.4 px** | **1,059.0 / 1,719.2 px** | 8 (3,836 ms) | 7 (7 aln) | 0 | `rows: 18` |

Worst outside movers: on Step 1 (`open scripts`), `slopcop.config.json` jumped col 2 → col 4 (`+822, +754`, `1,115.4 px`); on Step 2 (`open scripts/live-docs`), `tests` box jumped col 0 → col 4 (`+1,639, -106`, `1,642.4 px`) and `scripts/devcontainer.test.ts` + `scripts/e2e-passes.mjs` jumped col 3 → col 5 (`+1,031 px`).

#### Walk 3 — Estate Portal Walk (`/samples/estate/?view=local&dir=`)

| Step | Action | Click | Cards / Boxes / Wires / Cols | Outside Moved (Layout >1 px) | Col Changed | Layout Median / Max | Screen Median / Max | Moves (Total ms) | Search Adoptions | `churn` | `flowShape` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | Land on scan root `""` | — | 1 / 6 / 0 / 3 | — | — | — | — | — | 0 | 0 | `rows: null` (0-wire grid) |
| 1 | Open `Portal` | mouse | 3 / 11 / 1 / 2 | **5/6 (83.3%)** | **4 (66.7%)** | **353.3 / 608.3 px** | **414.5 / 688.5 px** | 2 (919 ms) | 1 (1 aln) | 0 | `boxRows: {"Portal": 5}` |
| 2 | Open `Portal/Services` | mouse | 4 / 10 / 1 / 2 | 6/13 (46.2%) | 0 (0%) | 0.0 / 111.6 px | 428.6 / 533.2 px | 2 (913 ms) | 1 (1 aln) | 0 | `boxRows: {"Portal": 4}` |
| 3 | Open `Portal/Controllers` | offscreen* | 5 / 9 / 2 / 4 | **11/13 (84.6%)** | **6 (46.2%)** | **420.0 / 1,220.2 px** | **436.1 / 854.2 px** | 2 (914 ms) | 1 (1 aln) | 0 | `boxRows: {"Portal": 1}` |

*\*`Portal/Controllers` had been pushed past the top edge when Step 2 scrolled down to `Portal/Services`.*

#### Walk 4 — Estate PaymentService Walk (`/samples/estate/?view=local&dir=`)

| Step | Action | Click | Cards / Boxes / Wires / Cols | Outside Moved (Layout >1 px) | Col Changed | Layout Median / Max | Screen Median / Max | Moves (Total ms) | Search Adoptions | `churn` | `flowShape` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | Land on scan root `""` | — | 1 / 6 / 0 / 3 | — | — | — | — | — | 0 | 0 | `rows: null` (0-wire grid) |
| 1 | Open `PaymentService` | mouse | 4 / 6 / 2 / 2 | **5/6 (83.3%)** | **4 (66.7%)** | **378.0 / 608.3 px** | **382.5 / 647.7 px** | 1 (454 ms) | 0 | 0 | `rows: null` |
| 2 | Open `PaymentService/Data` | mouse | 7 / 5 / 10 / 3 | **8/9 (88.9%)** | **7 (77.8%)** | **431.4 / 893.0 px** | **376.5 / 807.4 px** | 4 (1,875 ms) | 3 (2 aln, 1 seed) | 0 | `rows: null` |

### 3. Cold Visual Assessment (2D Screenshots & Video)

- **Repo Walk 1 before/after `client` ([2d-repo-before-client.png](2d-repo-before-client.png) → [2d-repo-after-client.png](2d-repo-after-client.png)) & `views` ([2d-repo-after-views.png](2d-repo-after-views.png)):**
  Before clicking `client`, `packages/explorer` holds `tsconfig.json` and `package.json` cleanly above `packages/explorer/src` (`client`, `shared`). After clicking `client`, `packages/explorer/tsconfig.json` is flung to the right viewport edge and sliced in half; `packages/explorer/package.json` and `shared` vanish offscreen; `tsconfig.base.json` drops in clipped at top-left; `packages`, `packages/explorer`, and `packages/explorer/src` labels are clipped at the left edge; `palette.ts`, `palette.test.ts`, and `panels` are clipped at bottom/right; and the user sees only 4 of `client`'s 25 files. After clicking `views`, the viewport shows 3 cards (`symbolAnchors.ts`, `pin-state.ts`, `symbolAnchors.test.ts`) with `pin-state.ts` and `symbolAnchors.test.ts` clipped at right/bottom, and the 3D button lights amber because a cycle appeared.
- **Video ([2d-repo-flow-walk.webm](2d-repo-flow-walk.webm)):**
  - `00:05–00:07`: Clicking `packages/explorer` produces a mid-flight frame (`00:06`) where orange/teal curves double back across sliding boxes (`packages`, `.devcontainer`, `.vscode`, `tests`, `tsconfig.base.json`).
  - `00:15–00:26`: Clicking `client` scatters every visible ancestor and continues visibly shifting membrane boundaries and cards across 10 sequential alignment moves.
  - `00:27–00:45`: Clicking `views` leaves the layout twitching for over 10 seconds before a late cycle adoption (`00:44`) abruptly replaces `reading-state.ts` and `palette.ts` on the right with `worldMap` and `pin-state.ts`.
- **Repo Walk 2 `scripts` ([2d-repo-before-scripts.png](2d-repo-before-scripts.png) → [2d-repo-after-scripts.png](2d-repo-after-scripts.png) → [2d-repo-after-live-docs.png](2d-repo-after-live-docs.png)):**
  At root, the 6 closed boxes sit cleanly on the left beside root loose files on the right (already split by the single `tsconfig.base.json → tsconfig.json` wire). Opening `scripts` pushes `.devcontainer`, `.github`, `.vscode`, `packages`, and all root loose files offscreen and clips `tests`, `tsconfig.base.json`, `tsconfig.json`, `steps.mjs`, `browser-lane.mjs`, and `browser-lane.test.ts` at the top, bottom, and right edges. Opening `scripts/live-docs` packs wires into a horizontal highway cutting across `scripts`, pushes `live-docs` into the bottom-left corner with `sample-build.ts` and `verify.mjs` sliced by the frame, and leaves only 2 of `live-docs`'s 20 new cards visible.
- **Estate Walk 1 `Portal` ([2d-estate-before-portal.png](2d-estate-before-portal.png) → [2d-estate-after-portal.png](2d-estate-after-portal.png) → [2d-estate-after-portal-services.png](2d-estate-after-portal-services.png) → [2d-estate-after-portal-controllers.png](2d-estate-after-portal-controllers.png)):**
  Root opens as a clean 3×2 grid with `Estate.sln` at bottom-left. Opening `Portal` introduces one link (`Portal.csproj → Estate.sln`), collapsing the 3-column grid into 2 columns, flinging `Estate.sln` diagonally from bottom-left to top-right, pushing `Contracts`/`Database`/`Gateway`/`Hub` above the viewport, and slicing `Portal.csproj` and `Web.config` at the bottom edge. Opening `Portal/Services` adds zero wires and barely moves layout coordinates (0 column changes), showing how calm browsing is when no new Flow edge fires. Opening `Portal/Controllers` then adds one wire (`GatewayClient.cs → PaymentsController.cs`), instantly exploding 2 columns into 4 (`boxRows["Portal"]` jumps `4 → 1`), throwing `Portal/Scripts` 1,220 px across 3 columns and `Gateway`/`Hub` ~800 px right, and slicing `Web.config` off the right edge.
- **Estate Walk 2 `PaymentService` ([2d-estate-before-portal.png](2d-estate-before-portal.png) → [2d-estate-before-data.png](2d-estate-before-data.png) → [2d-estate-after-data.png](2d-estate-after-data.png)):**
  Opening `PaymentService` collapses the 3-column root grid into 2 columns (`Gateway` and `Portal` jump `-599 px` left; `Estate.sln` jumps `+378 px` right) and clips `PaymentService.cs` at the bottom. Opening `PaymentService/Data` adds 8 wires (plus a cycle returning between `App.config` and `PaymentService.cs`), jumping `PaymentService.cs` 893 px (col 0 → col 2, clipped on the right edge) and `PaymentService.csproj` 464 px (col 0 → col 1), lighting the 3D button amber, and clipping `Payment.cs` at the bottom and `Estate.sln` at the top.

---

## Part B — All 4 Cases Where 3D Structure Draws File-to-File Lines

### 1. Exact Code Verification ([forceGraphView.ts](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L2012-L2051))

In `state.spatialLayout === "structure"`, three functions determine whether a non-containment wire is submitted and visible:
- `linkVisibility` (`L2040-L2051`): decides `entry.enabled` in the GPU link batch.
- `regard(link)` (`L2012-L2017`): computes `visible = hovered ? a === hovered || b === hovered : path?.length ? onPath : true`.
- `linkColor` (`L2018-L2035`): sets `rgba(scene.wire, 0.9)` for `onPath`, else `rgba(scene.wire, visible ? 0.5 : 0)` in Structure.

| Case | Trigger in `linkVisibility` | `regard().visible` | Actual Rendered Alpha | GPU Batch (`refVisible`) vs. Painted Pixels (`refOpaque`) |
| --- | --- | --- | --- | --- |
| **1. Hovered file** | `hovered` (`hoveredDirectory === undefined`): `a === hovered \|\| b === hovered` | `true` for incident file wires | `0.5` | **Drawn visibly** (Estate: `7/65`; Repo `graph.ts`: `12/103`) |
| **2. Hovered directory hub** | `hoveredDirectory !== undefined`: `within(a, dir) \|\| within(b, dir)` | **`false` for all file-to-file wires** (`hovered` is `"directory:..."`, never a file ID) | **`0.0` (transparent)** | **Ghost-enabled bug:** GPU enables `4/65` (Estate `Database`) and `103/103` (Repo `packages/engine/src`) at **alpha 0** — zero white pixels on screen, yet `References` stays in the legend |
| **3. Pinned files at rest** | `pinnedScope.has(a) && pinnedScope.has(b)` (where `pinnedScope` includes every pinned file **and all its 1-hop reference neighbours**, `L1849-L1851`) | `true` | `0.5` | **Drawn visibly at rest** (Estate Whole + 3 pins: **`29/65`**; Estate 3 pins alone: `1/1`; Repo `live-docs` + 3 pins: **`45/108`**; Repo 3 pins alone: `3/3`) |
| **4. Path in Structure** | `path?.length`: `pathPairs.has([a, b].sort())` | `onPath: true`, `visible: true` | `0.9` (double width `2×`) | **Drawn visibly at full strength** (Estate 12-file path: **`11/11`**; Repo 3-file path: **`2/2`**) |

*(At rest with no pins, no hover, and no path — e.g., Estate Whole or Repo `live-docs` opened — `refVisible = 0` and `refOpaque = 0`, yet `legendHasReferences` is still `true` because `drawLegend` (`L1924`) passes `references: state.spatialLayout === "connections" || hasAttention || legendAttention` where `hasAttention` is `true` whenever `directories.length > 0`.)*

### 2. Measured Counts & Cold Visual Assessment (All 8 3D Structure Screenshots)

| Case & Bundle | Target / Scope | Nodes (Files / Hubs) | Containment Visible | Ref Total / `refVisible` / `refOpaque` | Alpha & Widths | Screenshot |
| --- | --- | --- | --- | --- | --- | --- |
| **Case 1 — Estate** | Hover `Contracts/IPaymentHub.cs` (Whole open) | 54 (36 / 18) | 53 | 65 / **7** / **7** | `0.5`, `1–1.6 px` | [3d-structure-case1-hover-file-estate.png](3d-structure-case1-hover-file-estate.png) |
| **Case 1 — Repo** | Hover `packages/engine/src/live-docs/graph.ts` (`live-docs` open) | 47 (42 / 5) | 46 | 103 / **12** / **12** | `0.5`, `1–2.3 px` | [3d-structure-case1-hover-file-repo.png](3d-structure-case1-hover-file-repo.png) |
| **Case 2 — Estate** | Hover hub `directory:Database` (Whole open) | 54 (36 / 18) | 53 | 65 / **4** / **0** (4 ghost α=0) | `0.0` | [3d-structure-case2-hover-hub-estate.png](3d-structure-case2-hover-hub-estate.png) |
| **Case 2 — Repo** | Hover hub `directory:packages/engine/src` (`live-docs` open) | 47 (42 / 5) | 46 | 103 / **103** / **0** (103 ghost α=0) | `0.0` | [3d-structure-case2-hover-hub-repo.png](3d-structure-case2-hover-hub-repo.png) |
| **Case 3 — Estate** | Pinned `PaymentService.cs`, `PaymentsContext.cs`, `PaymentHub.cs` (Whole open) | 54 (36 / 18) | 53 | 65 / **29** / **29** | `0.5`, `1–1.6 px` | [3d-structure-case3-pinned-estate.png](3d-structure-case3-pinned-estate.png) |
| **Case 3 — Repo** | Pinned `graph.ts`, `document.ts`, `staticBuilder.ts` (`live-docs` open) | 49 (43 / 6) | 47 | 108 / **45** / **45** | `0.5`, `1–2.6 px` | [3d-structure-case3-pinned-repo.png](3d-structure-case3-pinned-repo.png) |
| **Case 4 — Estate** | Path `Portal/Pages/Default.aspx` → `Database/SqlServer/dbo.Payment.sql` | 22 (12 / 10) | 14 | 11 / **11** / **11** | `0.9`, `2–3.2 px` | [3d-structure-case4-path-estate.png](3d-structure-case4-path-estate.png) |
| **Case 4 — Repo** | Path `scripts/live-docs/generate.ts` → `packages/engine/src/live-docs/core.ts` | 6 (3 / 3) | 3 | 2 / **2** / **2** | `0.9`, `2–5.2 px` | [3d-structure-case4-path-repo.png](3d-structure-case4-path-repo.png) |

**Cold eye verdict on each case:**

- **Case 1 (Hovered file — [Estate](3d-structure-case1-hover-file-estate.png), [Repo](3d-structure-case1-hover-file-repo.png)):**
  On Estate, hovering `IPaymentHub.cs` dims the tree (`alpha 0.2`) and shoots 7 white chords across dimmed hubs; the 3-button action strip covers the upper half of `IPaymentHub.cs` and intersects 3 outgoing wires. On Repo, hovering `graph.ts` draws 12 bright white chords fanning upward straight through the orange `live-docs` hub, behind the `packages/engine/src/live-docs` pill, and right across the `adapters · 76` skin bubble; the action strip overlaps the bundle of chords leaving `graph.ts`, and none of the far endpoint spheres are named, so the white lines point at anonymous dots.
- **Case 2 (Hovered directory hub — [Estate](3d-structure-case2-hover-hub-estate.png), [Repo](3d-structure-case2-hover-hub-repo.png)):**
  Because of the `regard()` vs. `linkVisibility` contradiction (`alpha = 0`), **no white file-to-file wires actually render** on either Estate or Repo — only orange containment spokes glow while the rest of the tree dims. Visually, Case 2 is actually clean *only by accident of a bug*: if someone "fixed" `regard()` to match `linkVisibility`, hovering `packages/engine/src` would suddenly explode **103 white wires** over the tree. Meanwhile, the legend still claims `References` is drawn.
- **Case 3 (Pinned files at rest — [Estate](3d-structure-case3-pinned-estate.png), [Repo](3d-structure-case3-pinned-repo.png)):**
  **Severe visual clutter ("visual nightmare").** Because `pinnedScope` expands every pin to its 1-hop reference neighbourhood (`L1849-L1851`), pinning 3 files with the tree open lights up **29 bright white chords** on Estate and **45 thick white chords** (`up to 2.6 px`) on Repo at rest. On Estate, white chords cross directly over `Scan root`, `PaymentsContext.cs`, `PaymentService/Data`, `PaymentService`, and `Hub` labels and bury the orange containment tree. On Repo, white wires form an unreadable star-burst slashing through `packages/engine/src/live-docs`, `history · 32`, `coreTypes.ts`, `core.ts`, `board.ts`, and `pathfind.ts`, exiting off all four viewport edges and completely overpowering the orange directory spokes.
- **Case 4 (Path in 3D Structure — [Estate](3d-structure-case4-path-estate.png), [Repo](3d-structure-case4-path-repo.png)):**
  On Estate (12 files, 11 hops), **severe zig-zag tangle.** Because the spheres are positioned by directory containment rather than dependency order, the 11 double-width bright white path chords (`alpha 0.9`, `2–3.2 px`) slash back and forth across each other and over dimmed directory labels (`Portal/Services`, `PaymentService/Data`, `PaymentService`, `Portal/Controllers`, `Web.config`, `Hub/App.config`), while the containment hubs themselves dim to near-invisible brown circles (`alpha 0.2`) — breaking both tree reading and path reading at once. On Repo (3 files, 2 hops), the 2 thick white strokes form a clean V, though the 3 directory hubs (`scripts/live-docs`, `packages/engine/src/live-docs`, and `packages/generator/src` clipped behind the bottom toolbar) are so dim that Structure contributes almost nothing over Connections.

---

## Part C — Concrete Implications for Milestone 4B (Matched Interactive Trial)

1. **One shared concept across 2D and 3D: `Connections` vs. `Structure` in the Local Map toolbar.**
   - In **3D**, the toolbar already carries the `Connections` / `Structure` toggle (`connectionsButton` / `structureButton`, [index.ts](../../../../../../../packages/explorer/src/client/index.ts#L682-L688)).
   - In **2D**, `directoryLayout: "grid"` vs. `"flow"` currently hides inside Tuning → 2D Layout. Surfacing the exact same `Connections` / `Structure` toolbar toggle in 2D unifies both perspectives:
     - **2D `Structure` (Grid)** keeps directory walks calm (0 surprise Flow reshuffles, 0 ancestor loose-file ejection, 0 multi-second alignment churn).
     - **2D `Connections` (Flow)** draws pair lines and ranks connected files left-to-right on explicit user request.
2. **Amber availability cue on `Connections` (mirroring the existing 3D amber cue in [index.ts](../../../../../../../packages/explorer/src/client/index.ts#L1253-L1269)):**
   - When the user is in **2D `Structure`** and the currently shown cards have ≥1 undrawn inter-file connection (the same pair count Flow would draw), glow the `Connections` button amber with a tooltip naming the count (e.g., `"42 connections among shown files. Switch to Connections to draw them."`).
   - Optionally mirror the same amber cue on `Connections` in **3D `Structure`** whenever the shown tree holds hidden inter-file references, turning the switch from surprise reshuffle into an explicit invitation.
3. **Matched alternatives for 3D Structure file-to-file wires (Cases 1–4):**
   - **Must-fix bug regardless of variant:** reconcile `linkVisibility` and `regard()`/`linkColor` on Case 2 (`hoveredDirectory`) so zero-alpha ghost wires are never enabled in the GPU batch, and fix `drawLegend()` (`L1924`) so `References` is shown in the legend only when opaque reference wires are actually drawn.
   - **Matched variants for Cases 1 & 3:**
     - **Variant A — Pure Tree (strict semantic parity with 2D Grid):** suppress all file-to-file reference wires in 3D Structure (Cases 1, 2, 3) — Structure shows only the containment tree, skins, and folder/file identity; `Connections` glows amber when references exist among shown files.
     - **Variant B — Clean Tree + Single-File Hover Peek:** suppress Case 2 (hub ghost wires) and Case 3 (the `29–45` chord at-rest `pinnedScope` spiderweb — the worst measured defect), while retaining Case 1 (hovering a single file peeks only that file's direct references on demand, with endpoints named or clearly differentiated).
   - **Hard case — Case 4 (Paths in 3D Structure):**
     - **Option 4a:** Asking a path in 3D switches to `Connections` (where the layout aligns with dependency edges instead of fighting the directory tree), or prompts via the amber `Connections` button.
     - **Option 4b:** Stay in `Structure` if the user explicitly switches back during a path, lighting the path's files and their ancestor folders in the tree (showing *where* the path lives in the repo) without drawing double-width zig-zag chords across dimmed hubs.
