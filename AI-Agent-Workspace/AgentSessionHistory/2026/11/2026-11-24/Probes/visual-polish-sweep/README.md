# Visual & Interaction-Feel Polish Sweep (`2026-11-24`)

_Cold playtest and slowed-motion evidence captured on 2026-11-24 against `day/2026-11-24` (`b7401c967`, fresh `dist/explorer` served locally over ephemeral HTTP, headless Chromium with D3D12 RTX 3090 WebGL, default shipped `localStorage` except where noted for exact zoom-ladder steps or video playback-rate capture). Zero console or page errors occurred across all runs._

Slowed-motion videos (`motion-*.webm`) run at **0.2× synchronized speed** (CDP `Animation.setPlaybackRate(0.2)` locked with scaled `performance.now`, `requestAnimationFrame`, and `setTimeout` handoffs so CSS animations, JS eases, and midpoint swaps stay faithful to real timing and expose 4–6 readable frames per transition at 1 fps extraction). The native `1.0×` reproduction in [30-bug-2d-to-3d-stranded-corner-1x.png](30-bug-2d-to-3d-stranded-corner-1x.png) has zero clock shims.

---

## Executive Summary — Top Defects (Impatient-Stranger Lens)

### P0 — Broken Layout, Clipped Chrome, or Stranded Camera

1. **2D → 3D switch strands the entire 3D graph in the far top-right corner (`motion-2d-to-3d.webm`, `30-bug-2d-to-3d-stranded-corner-1x.png`):**
   - Clicking the glowing amber `3D` button on Estate `PaymentService.cs` (default arrival rest) flies all 9 cards into a tiny cluster at `(x ≈ 1117..1257, y ≈ 219)` and **leaves the entire settled 3D scene half-clipped off the far top-right edge**, leaving ~92% of the `1280×800` viewport pitch-black void. Confirmed at native `1.0×` speed with zero shims (`30-bug-2d-to-3d-stranded-corner-1x.png`, 2.5 s after transition end).
2. **Mobile `390×844` toolbar overflows viewport and bleeds across the collapsed sidebar (`20-mobile-390x844-local.png`):**
   - `.perspective-controls` measures `364 px` wide (`x = 37..401` on a `390 px` viewport): its right edge clips the Structure button right off the phone screen, and its left edge overlaps the vertical border into the `49 px` collapsed sidebar strip.
   - The collapsed sidebar permanently steals a solid `49 px` vertical pillar (`12.5%` of phone width) down the full height of the screen to hold a single top-left `▶` triangle, while the search box still displays a desktop `Ctrl+P` keyboard-shortcut badge on a touch phone.
3. **Reader drawer at `1280×800` overlaps zoom controls AND hides the subject card being read (`16-reader-drawer-1280.png`):**
   - `#controls` (`right = 409 px`) literally touches/overlaps `.perspective-controls` (`left = 408 px`) by `1 px` — zero breathing room.
   - Opening `Inspect PaymentService.cs` slides the `361 px` drawer straight over the right side of the map **without panning the map left**, completely covering `PaymentService.cs` itself and slicing `PaymentsContext.cs` in half (`P / C`).
4. **Reader drawer at narrow desktop `900×700` crushes the map to a `280 px` sliver with 3 stacked control layers (`17-reader-drawer-900x700.png`):**
   - Sidebar (`260 px`, 29%) + Drawer (`361 px`, 40%) leave only `279 px` (31%) for the map.
   - `.perspective-controls` wraps into an asymmetric 2-row brick (`84 px` tall, divider pipe left orphaned on row 1), pushing `#controls` and `0 pins` up to `y = 550`, directly on top of `PaymentQuery.cs`'s `+7 connections` button.
5. **World Map hover & pinned panels collide with door labels and slice text in half (`22-world-map-estate-hover-wire.png`, `24-world-map-pinned-panel.png`, `23-world-map-repo-rest.png`):**
   - Pinning `hub` (`24`): `net.tcp://hub.onprem.example:8731/PaymentHub` crosses `contracts` and kisses the panel's top border, while the outgoing `...payments` door label is **literally sliced in half by the panel's right border** (`ayments` sticking out).
   - Hovering `payments → sqlserver` (`22`): `dbo.usp_PostPayment` overlaps `payments`'s legs and collides with the hover panel top border; `to sqlserver` collides with `sqlserver`'s title; the panel covers half of `sqlserver` and all of `oracle` and touches the right viewport edge with zero margin.
   - Repository World Map at rest (`23`): bright teal dashed wires cut directly through `explorer`'s subtitle (`web · 279 files`) and through the `t` in `tests`; `GITHUB` touches `action`'s corner; 15 pieces crowd the center 40% while 60% of the canvas is empty light grey.
6. **Expanding `+138 symbols` on `powershell-ast.json` ejects all 6 neighbour cards off-screen into a giant empty cavern (`08` → `09-card-expand-unconnected-after.png`):**
   - Expanding the 138 unconnected rows vertically centers the left neighbour columns against the tall card, shoving all 6 connected neighbours (`Logging.ps1`, `Settings.ps1`, `Rollout.*`) and even the card's own incoming `Internals` wires completely off the bottom of the screen, leaving ~70% of the viewport an empty dark box (`tests/integration/programs/powershell/rollout`).

### P1 — Major Visual, Motion, and Legibility Defects

7. **2D Structure hover dimming is sabotaged by purple "Test-backed" glow halos (`11-structure-mode-hover-card.png`):**
   - Hovering `palette.ts` dims unrelated cards' text, **but unrelated test-backed cards (`markdown.ts`, `reader-links.ts`, `reading-state.ts`, `detailPanel.ts`, `pathfind.ts`) keep vivid glowing purple borders** that look more highlighted than actual lit non-test-backed partners (`dom.ts`).
   - Also, the glowing amber `Connections` button hides the count (`36` hidden connections) until hovered, and its 3-dot triangle icon looks nearly identical to `Structure`'s 3-dot tree icon.
8. **12-file path strip chops off mid-word at the right edge with zero scroll affordance (`15-path-strip-long-estate.png`):**
   - `stripScrollWidth = 1893 px` vs `1019 px` container: hop 6 ends in a dangling, hard-clipped **`uses`** right at the viewport edge with no fade mask, no scroll chevron, and no hint that hops 7–12 exist to the right.
   - The status banner uses cramped low-contrast muted green text with internal phrasing (`2 references between these files run the other way and are not drawn in 2D`) and has no clear (`×`) button on the strip itself.
9. **Arrival pull-back (`Look After`) shrinks text to unreadable micro-ants before abruptly snapping/exploding (`motion-arrival-pullback.webm`):**
   - Frames `00:08–00:09`: holding `reading` look through the pull-back turns all 9 cards into illegible ~5 px sub-pixel mush with huge blank gaps; at `00:10`, every title abruptly pops to 2-line held bold text (`Payment / Service.cs`) and prose snaps away.
10. **2D → 3D and 3D → 2D transition glitches (`motion-2d-to-3d.webm`, `motion-3d-to-2d.webm`):**
    - **2D → 3D (`00:04–00:05`):** The instant `.perspective-transition` swaps in cloned cards, fonts lose weight/size, `PaymentService/Data` jumps larger and misaligned, and glowing wires snap to thin flat lines before morphing.
    - **3D → 2D (`00:09`, `00:13`, `00:17`):** Directory shells (`Hub · 3`, `SqlServer · 2`) pop out in 1 frame; at `00:13` the floating transition label `PaymentService.cs` double-prints right over the materializing card's own title (ghosting); and after settling at reading size (`00:14–00:16`), arrival pull-back triggers a **second** animation at `00:17` sliding the card rightward.
11. **Mirror 3D turn perspective & post-mirror header alignment issues (`motion-mirror-turn.webm`):**
    - Mid-turn (`00:05–00:06`), the held `pathfind.ts` focus glow clips awkwardly against turning wires while `> packages/explorer/src/client` detaches leftward in empty space; after landing mirrored (`00:08`), mirrored directory labels sit on the far right with wide empty gaps to their `...`/dots on the left, and `client`'s label shifts awkwardly onto `packages/explorer/src`.
12. **3D default framing, dark-on-dark contrast, and mystery shell hover icon (`25`, `26`, `27`, `27b`):**
    - Estate 3D (`25`): deep navy spheres on near-black navy with barely visible hairline wires and low-contrast dim grey pills (`App.config`, `Payment.cs`, `PaymentsContext.cs`); top and bottom-right wires clip straight off viewport edges.
    - Repo 3D `graph.ts` (`26`): camera drops inches from a giant translucent grey onion clipping off top, left, and bottom edges; `live-docs/graph.ts` floats over a grape-pile of spheres with no clear indicator of which sphere is the subject.
    - Shell hover (`27`): hovering `packages/explorer` floats a **bare unlabeled `[📁]` button** in the middle of the sphere cloud `350 px` away from its `explorer · 259` pill, while bright white sticks cut across `live-docs/graph.ts`.
    - Sphere hover (`27b`): the `[📌][⌖][···]` action pill overlaps the top cap of `PaymentsContext.cs`'s sphere, and neither `PaymentsContext.cs` nor its lit connected neighbours brighten their dim grey text labels.
13. **History Scrubber timeline scaling & 2D ghost-dimming (`28-history-scrubber-2d.png`, `29-history-scrubber-3d.png`):**
    - **40% dead empty gap in the scrubber track:** linear date spacing leaves a massive empty stretch between `Apr 2026` and `Sep 2026` while cramming hundreds of recent commits into the last ~10% of the bar where ticks collide.
    - **2D History (`28`) shows 0 lit changed files while turning neighbours into ~15% opacity ghosts:** `step 1754` reports `Changed: 10 files, 5 wires, 1 document link`, yet on `graph.ts` zero changed cards are on screen (`litCards: 0`) and `document.ts` / `boardGraph.ts` / `summary.ts` fade to nearly unreadable ghosts; meanwhile the commit card truncates its title with `...` despite ample horizontal space, and 3 unlabeled icons (`🔍`, `[▭|]`, `👤`) sit at bottom-right.
14. **Jarring light/dark theme split between App Shell and World Map (`21`–`24`):**
    - Pitch-black sidebar + top search bar glued directly onto a blinding white/light-grey World Map canvas with stark white floating icon pills and a World-Map-only moon toggle (`🌙`).
15. **Search dropdown bottom clipping, cryptic `⌄ 1` pill, and low-contrast `IMPLEMENTATION` badges (`14-search-dropdown-open.png`):**
    - `PaymentResult` is horizontally sliced in half by the dropdown's bottom edge with no scroll fade; `⌄ 1` under `PaymentsContext.cs` gives zero plain-English meaning; every row repeats directory + filename (`PAYMENTSERVICE/DATA` → `Payment.cs` → `PaymentService/Data/Payment.cs`); dark-blue-on-dark-navy `IMPLEMENTATION` pills have poor contrast.

### P2 — Craft, Hierarchy, Visual Rhythm & Micro-Friction

16. **Repeated directory/path text & hollow dead vertical gaps inside 2D cards (`01`, `02`, `08`, `10`, `12`, `15`):**
    - Cards in `10` (`steps.mjs`) and `15` (`Default.aspx`, `portal.js`) print their directory **three times** (membrane label `> Portal/Pages`, subtitle `Portal/Pages/Default.aspx`, italic footer `Portal/Pages`).
    - Reading/directory cards with folded prose or folded symbols (`01`, `02` `App.config`, `08`, `12`, `15`) leave large blank empty boxes above/below a lone horizontal divider rule.
17. **Cryptic undocumented row badges and unstyled clickable footers (`01`, `02`, `09`, `10`, `13`):**
    - Reading card (`01`) shows an amber diamond (`◇`) next to `PaymentService` and blue/green mini-arrows (`[→]` `[←]`) next to `Post`/`Get` — none appear in the sidebar Legend.
    - `1 connection returns in a cycle` (`01`) and `−138 symbols` (`09`) look like static faint grey footnotes rather than interactive buttons.
    - Closed directory boxes (`10`) look like mostly-empty manila folder outlines with scattered tiny dot beads (`contact-sheet` has 1 dot in a big empty box), and the 4-line icon beside `v scripts ...` has no obvious meaning.
18. **Mid-word leading truncation on directory labels and sidebar Context (`03`, `04`, `08`):**
    - Directory headers slice words in half: `...c/tooling`, `...rer/src/shared`, `...rams/powershell/rollout/lib`, `...wershell/rollout/modules`, `...odules/Rollout.Targets`.
    - Sidebar bottom-left `Context:` wraps `packages/explorer/src/client/pathfind.t` / `s` (`04`), orphaning a single letter `s`.
19. **Invisible Back/Forward arrows & invisible menu focus ring (`01`, `13`, `18`):**
    - Header `← →` buttons (sidebar top-left and reading dialog top-left) are near-black on black — nearly invisible.
    - Opening a card's `...` menu (`13`) focuses `Inspect PaymentService.cs` programmatically, yet renders **zero visible focus highlight** on the focused row; the menu also overlaps the card's focus border and row dots.
20. **Zoom-ladder awkward line breaks, dead void, and off-center zoom (`05`, `06`, `07`):**
    - Zooming out from reading scale (`05` → `06` → `07`) leaves 35–65% blank right-side void while clipping `Contracts` off the left edge; overview look wraps `.cs` onto orphan lines (`IPayment / Service / .cs`, `Payment / .cs`), leaves `App.config` 70% empty below its title, and clips the right blue dot + cycle loop stub into `PaymentService.cs`'s border.
21. **Wire Answer tooltip sizing & legend drop (`12-wire-answers-hover.png`):**
    - Tooltip text (~16–18 px bold) dwarfs the miniature card typography beneath it and sits right against the highlighted wire/card edge; also `Implementation` disappeared from the left sidebar Legend in this directory state.
22. **Reader Drawer & Dialog polish (`16`, `18`):**
    - No button inside the drawer to expand into the reading dialog; raw placeholder text `Pending authored purpose`; no fade cue where scrollable lists clip above the footer; 3 equal-width giant blue-outlined footer buttons give `Download Markdown` identical primary weight to `Pin file` and `Centre`.
23. **Knowledge Sources above-the-fold density (`19-knowledge-sources-repo.png`):**
    - The entire first screen at `1280×800` is consumed by `This bundle` metadata, pushing `Most used`, `Entry points`, `Unreachable`, and `Groups` completely below the fold; `By extension` dumps 35 extensions as an unscannable comma-separated paragraph; `Docs: .mdmd/layer-4` and `Counts: the whole scan today, unfiltered by Display` read like internal jargon.
24. **Unexplained glowing `3D` button on initial landing (`01`, `02`, `05`, `06`, `07`, `12`, `20`):**
    - On `PaymentService.cs` (which has 1 cycle), the `3D` button blooms bright amber on arrival without any visible explanation on screen, drawing the eye away from the graph before the user even knows what `3D` does.

---

## Complete Capture Inventory

### Area 1 — 2D Card Anatomy, Zoom Ladder & Arrival Motion

| File | Viewport | Route / State | Key Observations |
| --- | --- | --- | --- |
| [01-arrival-estate-paymentservice-reading.png](01-arrival-estate-paymentservice-reading.png) | `1280×800` | `/samples/estate/?view=local&node=PaymentService/PaymentService.cs` (reading hold, `k=1.45`, `look=reading`) | Empty vertical gap in card header; unexplained `◇` and `[→][←]` badges; orange cycle loop pokes past blue glow; italic `PaymentService` repeats path; faint unstyled cycle link; nearly invisible sidebar `← →`; glowing amber `3D` button. |
| [02-arrival-estate-paymentservice-rest.png](02-arrival-estate-paymentservice-rest.png) | `1280×800` | Same, after arrival pull-back (`k=0.517`, `look=connections`, `3.8 s` settle) | `App.config` has huge blank vertical voids; wires cross directly over `PaymentService/Data`'s `...` button; `PostPaymentRow.cs` truncates `Post Payment...` despite spare vertical space; orange stub pokes out of `PaymentService.cs`. |
| [03-arrival-repo-graph-rest.png](03-arrival-repo-graph-rest.png) | `1440×900` | `/?view=local&node=packages/engine/src/live-docs/graph.ts` (`k=0.335`, 54 cards, 252 wires, `7.5 s` settle) | Top/right/bottom neighbours clipped; neon wire pillar obliterates left borders of `estateGraph.ts` & `boardGraph.ts`; `LinkTarget (Interface)` looks recessed/dimmed with faint dotted pin; mid-word `...c/tooling` truncation. |
| [04-arrival-repo-pathfind-rest.png](04-arrival-repo-pathfind-rest.png) | `1440×900` | `/?view=local&node=packages/explorer/src/client/pathfind.ts` (`k=0.465`, 9 cards, `4.0 s` settle) | Two side-by-side `pathfind.ts` cards lose file paths in `connections` look; `> live-docs` appears twice; mid-word `...rer/src/shared`; sidebar Context wraps `pathfind.t` / `s` (single-letter orphan); `index.ts` sits lonely in a giant cavern. |
| [05-card-zoom-ladder-connections.png](05-card-zoom-ladder-connections.png) | `1280×800` | Estate `PaymentService.cs`, 3 Zoom Out presses from reading (`k=0.839`, `look=connections`) | 65% blank dark void while all 8 neighbours stay offscreen left; `PaymentService.cs` wraps to huge `Payment / Service.cs`; cycle text disappears leaving empty bottom padding; `...` button floats loosely. |
| [06-card-zoom-ladder-far.png](06-card-zoom-ladder-far.png) | `1280×800` | Estate `PaymentService.cs`, 6 Zoom Out presses (`k=0.486`, `look=connections` far edge) | Right half of screen empty while `Contracts` is clipped left and `Data` cards slice off bottom; wires cross `PaymentService/Data` label and `...`. |
| [07-card-zoom-ladder-overview.png](07-card-zoom-ladder-overview.png) | `1280×800` | Estate `PaymentService.cs`, 8 Zoom Out presses (`k=0.337`, `look=overview`) | Orphan `.cs` lines (`IPayment / Service / .cs`, `Payment / .cs`); `App.config` 70% empty box with awkwardly placed `...`; `Contracts` sliced off left while right 35% is empty; right blue circle + cycle loop clips card border. |
| [08-card-expand-unconnected-before.png](08-card-expand-unconnected-before.png) | `1440×900` | `/?view=local&node=tests/integration/programs/powershell/rollout/expected/powershell-ast.json` (`+138 symbols`) | `+138 symbols` sits cleanly below `Internals`; `Rollout.Targets.psm1` clips behind bottom toolbar; 6 mid-word truncated directory labels (`...rams`, `...wershell`, `...odules`, `...t/modules`). |
| [09-card-expand-unconnected-after.png](09-card-expand-unconnected-after.png) | `1440×900` | Same, after clicking `+138 symbols` (138 rows shown, `−138 symbols`; refold verified back to 0 rows / `+138 symbols`) | **All 6 neighbour cards and incoming wires vanish off-screen downward**, leaving 70% of the viewport empty black cavern; `−138 symbols` has no button affordance; 138 dimmed rows carry unused green+blue dots on both sides. |
| [motion-arrival-pullback.webm](motion-arrival-pullback.webm) | `1280×800` | `0.2×` slow-mo of Estate `PaymentService.cs` arrival | `00:00` loading dots; `00:01–00:05` reading hold; `00:06–00:09` pull-back shrinks every card's text to unreadable micro-ants; `00:10` abrupt whole-screen snap into large held `connections` look. |

### Area 2 — Interactive 2D Feels

| File | Viewport | Route / State | Key Observations |
| --- | --- | --- | --- |
| [10-directory-open-repo-scripts.png](10-directory-open-repo-scripts.png) | `1280×800` | `/?view=local&dir=scripts` (2D Flow, `k=1`) | `scripts` printed 3× per card; right column (`browser-lane.test.ts`, `e2e-bundles.test.ts`) and bottom (`e2e-bundles.mjs`) clipped; closed subfolders look like mostly-empty folders of tiny dots; cryptic 4-line icon in header; pin tray shows `1 pin` unprompted. |
| [11-structure-mode-hover-card.png](11-structure-mode-hover-card.png) | `1280×800` | `/?view=local&dir=packages/explorer/src/client` in Structure mode, fitted, hovering `palette.ts` (`36` unshown connections) | **Purple "Test-backed" glow stays bright on dimmed unrelated cards**, breaking hover hierarchy; amber `Connections` button hides the `36` count and looks nearly identical to `Structure` icon. |
| [12-wire-answers-hover.png](12-wire-answers-hover.png) | `1280×800` | Estate `PaymentService` + `PaymentService/Data`, resting on `PaymentsContext.cs → App.config` wire | Oversized tooltip typography dwarfs cards and sits on top of the highlighted wire; cards have hollow blank bodies with lone floating dividers; `Implementation` dropped out of sidebar Legend. |
| [13-card-relationship-menu.png](13-card-relationship-menu.png) | `1280×800` | Estate `PaymentService.cs` reading view, `...` card actions menu open | Menu overlaps blue card border and row controls; **zero visible focus indicator** on focused `Inspect PaymentService.cs` item; bare utilitarian menu with no header or icons. *(Note: `Uses` / `Used by` buttons stay `display: none` unless `.local-reading-card` is active.)* |
| [14-search-dropdown-open.png](14-search-dropdown-open.png) | `1280×800` | Estate Local Map, `"payment"` typed in `#search-subject` (44 matches) | `PaymentResult` sliced in half at dropdown bottom with no fade; cryptic `⌄ 1` pill; redundant directory+file path text on every row; low-contrast blue-on-navy `IMPLEMENTATION` pills. |
| [15-path-strip-long-estate.png](15-path-strip-long-estate.png) | `1280×800` | Estate 12-file path `Default.aspx` → `dbo.Payment.sql` (`k=1`, transient mirrored `usesFirst`) | **Path strip hard-clips `uses` at right edge** (`1893 px` vs `1019 px`) with zero fade or scroll cue; muted jargon status pill with no clear button on strip; hollow upper halves & 3× repeated paths on cards; `PaymentsController.cs` clipped right. |
| [motion-mirror-turn.webm](motion-mirror-turn.webm) | `1280×800` | `0.2×` slow-mo Mirror 3D turn on `packages/explorer/src/client/pathfind.ts` | `00:05–00:06` perspective turn clips held card's blue glow & detaches `client` header leftward; `00:07–00:08` mirrored directory headers sit far right separated from their `...`/dots on the left, and `client` shifts onto `packages/explorer/src`. |

### Area 3 — Reader / Detail Panel, Knowledge Sources & Responsive Viewports

| File | Viewport | Route / State | Key Observations |
| --- | --- | --- | --- |
| [16-reader-drawer-1280.png](16-reader-drawer-1280.png) | `1280×800` | Estate `PaymentService.cs`, Live Doc drawer open (`361 px` wide) | **`#controls` (`r=409`) touches/overlaps `.perspective-controls` (`x=408`)**; drawer covers `PaymentService.cs` itself and slices `PaymentsContext.cs` without panning map; no expand-to-dialog button; `Pending authored purpose` placeholder; heavy 2-row footer buttons. |
| [17-reader-drawer-900x700.png](17-reader-drawer-900x700.png) | `900×700` | Same, narrow desktop | Map crushed to `279 px` sliver (31% of screen); toolbar wraps into broken 2-row brick (`84 px` tall); zoom + pin controls float over `PaymentQuery.cs`'s `+7 connections` button; sidebar stays rigidly wide open. |
| [18-reader-dialog-reading.png](18-reader-dialog-reading.png) | `1280×800` | Estate `PaymentService.cs`, modal reading dialog (`760×752`) | Clean centered layout, but top-left `← →` buttons are nearly invisible; list clips sharply at bottom above footer with no scroll fade; 3 giant full-width blue buttons over-emphasize `Download Markdown`; still shows `Pending authored purpose`. |
| [19-knowledge-sources-repo.png](19-knowledge-sources-repo.png) | `1280×800` | `/?view=sources` | Entire above-the-fold view consumed by `This bundle` metadata; all actionable sections pushed below the fold; `By extension` dumps 35 extensions in an unscannable wall of text; internal jargon (`.mdmd/layer-4`, `unfiltered by Display`). |
| [20-mobile-390x844-local.png](20-mobile-390x844-local.png) | `390×844` (DPR 2) | Estate `PaymentService.cs` mobile Local Map | **Bottom toolbar (`364 px`) overflows right edge and bleeds left across the sidebar seam**; collapsed sidebar permanently wastes a `49 px` vertical strip; desktop `Ctrl+P` badge shown on mobile; 7 of 9 cards offscreen left. |

### Area 4 — World Map & Way Down

| File | Viewport | Route / State | Key Observations |
| --- | --- | --- | --- |
| [21-world-map-estate-rest.png](21-world-map-estate-rest.png) | `1280×800` | `/samples/estate/?view=world` | Jarring dark-shell / blinding-light-canvas split; `IPsec tunnel · declared` crosses dashed line; `hub` ghost stub crammed into tiny 10 px gap touching `payments`; `contracts` label overlaps vertical leg; 9 unlabeled white icon buttons top-right; small board (~35% area). |
| [22-world-map-estate-hover-wire.png](22-world-map-estate-hover-wire.png) | `1280×800` | Estate World Map hovering `payments → sqlserver` wire | `dbo.usp_PostPayment` overlaps `payments` legs and collides with panel border; `to sqlserver` collides with `sqlserver` title; panel covers `sqlserver`/`oracle`, sits flush on right edge, repeats `dbo.usp_PostPayment` twice, and says `1 edge in the docs`. |
| [23-world-map-repo-rest.png](23-world-map-repo-rest.png) | `1280×800` | `/?view=world` | Teal dashed wires slice through `explorer`'s subtitle and `tests`; `GITHUB` touches `action`; `action`/`registry` repeat name as kind; inconsistent label above/below placement; 15 pieces packed tightly in 40% center leaving 60% empty margin. |
| [24-world-map-pinned-panel.png](24-world-map-pinned-panel.png) | `1280×800` | Estate World Map with `hub` pinned | **`...payments` door label sliced in half by panel's right edge** (`ayments` sticking out); `net.tcp://...PaymentHub` crosses `contracts` and kisses panel top; harsh blue border on stark white card; repeats `hub` / `Hub`; `open hub` is a faint text link instead of a primary button. |

### Area 5 — 3D Spatial Graph, 2D↔3D Transitions & History Scrubber

| File | Viewport | Route / State | Key Observations |
| --- | --- | --- | --- |
| [25-3d-estate-rest.png](25-3d-estate-rest.png) | `1280×800` | `/samples/estate/?view=local&mode=3d&node=PaymentService/PaymentService.cs` (`Skin`, `8.3 s` settle) | Dark navy spheres on near-black navy + hairline wires + dim grey pills = weak contrast; top and bottom-right wires clip off viewport edges; `Hub · 3` inner spheres look brighter than the subject `PaymentService.cs`. |
| [26-3d-repo-graph-rest.png](26-3d-repo-graph-rest.png) | `1280×800` | `/?view=local&mode=3d&node=packages/engine/src/live-docs/graph.ts` (`Skin`, `8.0 s` settle) | Camera lands inside/against a giant translucent grey onion clipping top, left, and bottom; dense grape-pile obscures which sphere is `live-docs/graph.ts`; dim `pathfind.ts` label; unlabeled floating islands at edges. |
| [27-3d-hover-sphere-and-shell.png](27-3d-hover-sphere-and-shell.png) | `1280×800` | Repo 3D `graph.ts`, hovering `shell:packages/explorer` | Lone unlabeled `[📁]` button floats in the middle of the sphere cloud `350 px` from `explorer · 259`; bright white bundle sticks slice right behind `live-docs/graph.ts`. |
| [27b-3d-hover-sphere.png](27b-3d-hover-sphere.png) | `1280×800` | Estate 3D `PaymentService.cs`, hovering `PaymentsContext.cs` sphere | Clean partner highlighting, but `[📌][⌖][···]` pill overlaps top of `PaymentsContext.cs` sphere, and neither hovered `PaymentsContext.cs` nor lit neighbours brighten their dim grey labels. |
| [28-history-scrubber-2d.png](28-history-scrubber-2d.png) | `1280×800` | `/` repo 2D `graph.ts`, History Scrubber at step 1754 (`de8b25c9`) | Scrubber has a 40% empty gap (`Apr–Sep 2026`) cramming recent ticks together; step card truncates title and says `10 files` changed while 0 changed cards appear on screen and neighbours turn into ~15% opacity ghosts; 3 unlabeled bottom-right icons. |
| [29-history-scrubber-3d.png](29-history-scrubber-3d.png) | `1280×800` | `/` repo 3D `graph.ts`, History Scrubber at step 1754 (`de8b25c9`) | Changed spheres highlight clearly in 3D, but translucent shells clip top edge behind commit card; same 40% empty timeline void and truncated commit card title. |
| [motion-2d-to-3d.webm](motion-2d-to-3d.webm) | `1280×800` | `0.2×` slow-mo 2D → 3D on Estate `PaymentService.cs` (restored to `1.0×` post-handoff) | `00:04–00:05` card-clone font/alignment flash; `00:09–00:10` all 9 cards fly to tiny cluster at far top-right; `00:11–00:15` **stays permanently stranded in top-right corner** even after `1.0×` restore. |
| [30-bug-2d-to-3d-stranded-corner-1x.png](30-bug-2d-to-3d-stranded-corner-1x.png) | `1280×800` | Native `1.0×` (zero shims) 2.5 s after clicking `3D` on Estate `PaymentService.cs` | Confirms P0 bug: `PaymentService.cs` label at `x=1117..1257, y=219`, 3D cluster half-clipped off top-right edge, 92% empty black canvas. |
| [motion-3d-to-2d.webm](motion-3d-to-2d.webm) | `1280×800` | `0.2×` slow-mo 3D → 2D on Estate `PaymentService.cs` | `00:08→00:09` shells abruptly vanish; `00:11–00:12` all 8 neighbours fly offscreen left; `00:13` floating `PaymentService.cs` label double-prints/ghosts over card title; `00:17` triggers second pull-back slide after landing. |
