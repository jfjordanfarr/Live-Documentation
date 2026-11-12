Evidence from a first-visit evaluation on 2026-11-12 by a subagent with no project background: an outsider's observations, not decisions.

Role played: a working developer who found the repository, has a codebase too big to hold in the head, and about forty minutes of goodwill. Sources used: the root `README.md`, the four guides it links under `.mdmd/layer-1/guides/`, command output, `package.json` scripts (only for the sample build), and the running Explorer. No design documents, tests or source were read to learn behaviour; two message strings were located in source afterwards (noted where used).

Environment: the repository's devcontainer (Node 22.22.0, Windows-backed mount, so file I/O is slow), headless Chromium 145 from the repository's Playwright, software WebGL (SwiftShader), window 1440x900 unless stated. No network. The Explorer was built fresh and served with `python3 -m http.server 8917 --directory dist/explorer`; every reproduction below starts from `http://127.0.0.1:8917/` on that build. Screenshots are in this folder; driver scripts stayed in the session scratchpad.

Text sizes and colours quoted in px / rgb were read from the DOM (`getComputedStyle`), not estimated from pictures. "Frame" means one of 4 to 6 screenshots taken about 150 ms apart straight after a click.

## 1. The journey as it happened

| Step | Command or action | Time | What came back |
| --- | --- | --- | --- |
| README, cold | read | 2 min | Understood "a map of a codebase, as markdown plus a static page". Did not learn how to run it on my own code. No picture anywhere in the README. Getting Started is the last section but one. |
| Install | `npm install` | 47 s | "changed 1 package", "16 vulnerabilities (15 moderate, 1 high)". No tracked file changed. |
| Build | `npm run build` | 37 s | Silent success. |
| Preview (guide) | `npm run live-docs:generate -- --dry-run` | 3 min 53 s | Four log lines, silent for most of the run. "956 unchanged". |
| Generate | `npm run live-docs:generate` | 4 min 10 s | Five log lines. "0 created, 0 updated, 956 unchanged". No tracked file changed. |
| Explorer | `npm run live-docs:visualize` | 6 s | "Total Size: 708.7 MB", "Open dist/explorer/index.html in a browser to view." |
| Serve | README: "then serve that folder" (no command). Guide: `npx serve dist/explorer` | n/a | `npx serve` needs a download ("npx canceled due to missing packages"); I had no network, so used Python's server. |
| Lint (guide) | `npm run live-docs:lint` | 7 s | "956 file(s) validated" plus a list of warnings. |
| Explorer tasks a to j | clicking, at 1440x900, then 390x844 and 820x1180, then keyboard only | about 30 min | See findings. |
| CLI questions | `npm run live-docs:inspect -- …` (9 invocations) | 2 to 5 s each | See finding 4 and 16. |
| Second subject | `npm run live-docs:visualize:estate` (found in `package.json`, not in the guides) | 8 s | A 7-piece board, see finding 18. |

Total wall time about 45 minutes, of which about 9 were waiting on the two generate runs.

## 2. Findings, ranked by how badly they hurt a newcomer

### 1. The documented path only runs on this repository; nothing says how to map my own code — blocks

- Tried: to learn from the README and guides how to point the tool at another folder, then to do it for `tests/integration/programs/csharp/estate`.
- Expected: one command, since the README's first sentence is "Point Live Documentation at any folder".
- Happened: Getting Started is `npm install`, `npm run build`, `npm run live-docs:generate`, `npm run live-docs:visualize` inside this clone. The guide says the tool is "not yet published to npm". `--workspace <path>` is listed for `generate` and `lint` only; the `visualize` options table has no workspace flag, and `npm run live-docs:visualize -- --help` fails with a stack trace ("Unknown argument '--help'"). The npm scripts pin `--config ./.live-docs.config.json` (and `--board …` for visualize), which a newcomer only sees by opening `package.json`. `npm run live-docs:generate -- --workspace tests/integration/programs/csharp/estate --dry-run` printed "This folder lies inside a scan at /workspaces/Live-Documentation; a scan never lies inside another scan. Point at one of them." and then carried on to "Would create 38 Live Doc(s)" inside that folder. The only way I found to see the sample was the undocumented script `live-docs:visualize:estate`.
- Screenshot: none (command output).
- Reproduce: read `README.md` top to bottom looking for "your repository"; run the two commands quoted above.

### 2. The build tells you to open the file, and the file is a blank page — misleads

- Tried: followed the last line of `npm run live-docs:visualize`: "Open dist/explorer/index.html in a browser to view."
- Expected: the Explorer.
- Happened: dark page, empty main area, the only sign of life is "Loading..." at 11px in the bottom-left of the sidebar, forever. The console has a CORS error for `static/index.js`. The page itself never says "serve this folder". The guide's Troubleshooting knows about this; the command's own output contradicts it. The README says "then serve that folder" without a command; the guide's `npx serve` needs a network download, in a project whose pitch is "no network". The same output reports "Total Size: 708.7 MB" for a bundle whose own files are about 16 MB (it counts whatever else is lying in `dist/explorer/`).
- Screenshot: `29-opened-as-file-blank-loading.png`.
- Reproduce: `npm run live-docs:visualize`, then open `file:///…/dist/explorer/index.html`. (String located afterwards at `scripts/live-docs/visualize-static.ts:120-121`.)

### 3. In the Local Map you see no connections at all until you pin something — misleads

- Tried: task (a) and (b). From the first screen: clicked the `explorer` piece, "open explorer", then "Open" on `src`, then "Open" on `client`.
- Expected: a map of what connects to what, as the README promises; at least wires between the cards on screen.
- Happened: three levels of cards and not one wire. Each card only says "21 connections outside this view" in 11px grey. `detailPanel.ts` and `index.ts` were both on screen and are connected, but no wire was drawn until I pressed the small pin icon on `detailPanel.ts`; then blue and green wires appeared at once. Nothing on the cards says that pinning is what reveals connections. Until then the Local Map reads as a file browser.
- Screenshots: `07-local-map-after-opening-client-clipped.png` (no wires), `08-local-2d-wires-appear-only-after-pin.png` (after Pin).
- Reproduce: World Map, click the `explorer` cube, scroll its panel to the end, "open explorer"; `src` "Open"; `client` "Open"; then the pin icon on the `detailPanel.ts` card.

### 4. Advertised commands fail when pasted — misleads

- `npm run live-docs:inspect -- --from src/auth.ts --to src/api/endpoints.ts` (README, "Path Mode", and Getting Started step 3 with `src/core/auth.ts`) answers "Unable to resolve --from 'src/auth.ts'." Those files do not exist here and the text does not say they are placeholders.
- `npm run live-docs:inspect -- packages/engine/src/types.ts` (CLI reference, "Quick summary of an artifact") answers "live-docs:inspect failed / Unknown argument 'packages/engine/src/types.ts'." The same happens with a file that exists; the example file does not exist.
- `npm run live-docs:inspect -- --from packages/generator/src/generator.ts#generateLiveDocs --direction inbound` answers "Symbol fanout (--from with symbol, no --to) is not yet supported. Use file-level fanout." "Who uses this function" is the first question I wanted to ask.
- The `--help` text of `inspect` has examples that do work. `visualize -- --help` crashes (finding 1).
- Screenshot: none.

### 5. The 2D Local Map is never framed so that you can see it — slows

- Tried: to see the whole of a directory, then the whole of the map.
- Expected: arrive with everything in the frame, or one obvious control that fits it.
- Happened, four ways:
  - Fresh Local Map at the scan root, 1440x900: four columns of cards, the fourth cut by the right edge. The cut column holds `packages` ("373 files, 4 directorie"), the main directory of the repository. The top 70px of the canvas is empty.
  - After opening `client`: the right column (`panels`, `dom.ts`, `layout-presets.ts`) is cut at the right edge, the `package.json` and `tsconfig.json` cards slide under the top bar, and the bottom row is cut by the toolbar fade.
  - Before that, at `packages/explorer`, the opposite: three cards in a 580x345 box in the middle of a 1180x780 canvas.
  - Zooming out with the wheel stops at scale 0.51 (read from the SVG transform), where the map still runs off the left edge.
- The control named "Reset Zoom" (the ⟲ button, bottom left) zooms in on the newest pin at about 1.5x. The control named "Whole" ("Whole picture on: every file is shown") leaves the camera where it was, so nothing visibly changes except that the search box now reads "Scan root", the pin count goes up by one and the Path-to field says "Nothing connects to Scan root".
- Search arrival and Centre both put the subject alone in the frame at about 1.5x: the cards it connects to are off-screen, so you see eight blue pins on the left edge and wires leaving the picture, without the names at the other end.
- Screenshots: `05-local-map-scan-root-fourth-column-clipped.png`, `07-local-map-after-opening-client-clipped.png`, `09-whole-pressed-camera-stays-scan-root-pinned.png`, `16-search-arrival-neighbours-offscreen.png`.
- Reproduce: sidebar "Local Map" on a fresh load; or the clicks of finding 3; then ⟲; then the first icon in the bottom-centre toolbar ("Whole").

### 6. First screen: every small label on the board collides with its own piece, and nothing on the board says what the shapes mean — slows

- Tried: read the first screen before touching it.
- What I thought it showed: this repository's parts on a tilted board, with dashed lines between some of them. What I would click first: the "?" bottom right, because nothing else explains blue and green circles, dashed versus solid boxes, the strands under boxes, or why `engine` (150 files) is a flat sliver while `scripts` (72 files) is a tall cube.
- Visual defects, all at 1440x900 on the first load:
  - The 11px grey subtitle of each piece is drawn through the piece's own outline: "package" across the `live-docs` tile, "workflow" across the top edges of all three workflow cubes, "extension" across `vscode-panel`, "site" across `pages`, "registry" across the cylinder, "program · 72 files" across the top of the `scripts` cube. In the rotated view the top edge of `tests`, `programs` and `fixtures` strikes through the middot so the text reads "tests--94 files".
  - "library · 7 files" (generator) and "web · 213 files" (explorer) touch each other.
  - The board uses the middle of the canvas; names are 13px, subtitles 11px.
  - While loading (first half second) the main area is empty and dark, then the light board appears: the only loading notice is the 11px "Loading..." in the sidebar footer.
- "top-down" gives the plainest diagram of the nine board buttons, and there the collisions are worst: every name sits on its box's top edge, the dotted "built on" line runs through the subtitles of `engine`, `generator`, `explorer`, `scripts` and `tests`, and `tests`, `programs` and `fixtures` have no visible box, only struck-through text.
- The help behind "?" is good and answers all of the above (see section 3), but it is the only place that does.
- Screenshots: `01-first-screen-world-map.png`, `02-world-map-label-collisions-crop.png`, `32-world-map-top-down-by-keyboard-labels-struck-through.png`.
- Reproduce: open the base URL; press "top-down".

### 7. The pinned panel on the World Map covers what you clicked and buries its summary — slows

- Tried: clicked the `explorer` cube to learn what it is.
- Expected: a short card beside the piece: what it offers, who calls it, how to go inside.
- Happened: a 350x425 panel opens on top of the piece (its label is cut to "explor"). It lists all 213 files as links first: 4,129px of content in a 423px box. "called by live-docs", "stands on engine, 6 packages" and the "open explorer" link are at the very end, about ten panel-heights down. The close "×" scrolls away with the top. The panel's last visible row is cut by the bottom of the window. On the estate sample the `hub` panel is short, but it covers `payments`, `sqlserver` and `oracle`, the next three links of the chain being explained, and two floating address labels overlap the `payments` heading.
- Screenshots: `04-world-map-pinned-panel-covers-its-piece.png`, `31-estate-hub-pinned-panel-and-labels.png`.
- Reproduce: base URL, click the `explorer` cube (around x=715, y=545 after the walk-through; any click on the cube).

### 8. Opening a directory quietly pins it and rewrites the search box — misleads

- Tried: just "Open" on three directories.
- Expected: opening is looking; pinning is the separate act the guide describes.
- Happened: the pin badge bottom right went "1 pin", "2 pins", "3 pins"; the pin tray lists `explorer`, `src`, `client` as pins I never made; the search field's text became "explorer", then "src", then "client", as if I had searched. "Whole" adds a pin called "Scan root". After "Centre" on `dom.ts` the search field still said "detailPanel.ts" while the sidebar footer said "Context: packages/explorer/src/client/dom.ts".
- Screenshots: `07-local-map-after-opening-client-clipped.png` (search reads "client", "3 pins"), `13-centred-on-dom-ts-search-box-stale.png`, `17-path-result-2d.png` (tray open with the three directory pins).
- Reproduce: as finding 3, watching the badge at the bottom right and the search field.

### 9. A fresh 3D view has no names in it; a few wheel notches and you are lost — slows

- Tried: task (f). Local Map, "3D"; drag to orbit; wheel to zoom; click a sphere to pin.
- Expected: something I could read that 2D could not show.
- Happened:
  - Fresh 3D at the scan root: about forty clumps of blue and green bubbles on navy, "94 of 955 files shown", and not one word on the canvas.
  - With two pins, "Connections" shows the two names in a tangle of white lines among well over a hundred unnamed spheres.
  - Five wheel notches in, aimed at a clump, left a nearly black screen: one hovered 2-sphere group with a toolbar, everything else dimmed by the hover, the pins gone from view. "Fit current scope" (first toolbar icon) brought the scene back.
  - Hovering a sphere gives no tooltip or name; it only dims the rest. Spheres are about 8 to 10px across: a hover 9px off did nothing. A hit click pinned `connection-geometry.ts` and showed its name.
  - "Structure" (the second layout icon) was the first 3D picture I could read: orange directory hubs with their paths, pins named.
- Did 3D help me understand anything? Structure, a little (where the pins sit in the directory tree). Connections, no.
- Screenshots: `19-fresh-3d-scan-root-no-names.png`, `20-3d-after-five-wheel-notches-lost-in-dark.png`, `21-3d-fit-current-scope-hairball.png`, `22-3d-structure-directories-named.png`.
- Reproduce: fresh load, "Local Map", "3D"; mouse at (700,400), wheel up five notches.
- Caveat: software rendering; I did not judge frame rate.

### 10. Following a link in the reader leaves no way back inside the reader, and the app's Back is under the reader — slows

- Tried: task (c). Clicked `detailPanel.ts`, in its reader clicked the dependency `packages/explorer/src/client/dom.ts`, then tried to return.
- Expected: a back arrow in the reader.
- Happened: the reader (a 760px modal over a dimmed map) now shows `dom.ts`, scrolled to the symbol. Its header holds only the title and "×". The app's Back button (top left) is under the reader's backdrop: a click on it never lands. The browser's Back did return to `detailPanel.ts`. After closing the reader, the app's Back works well and restores place, zoom and the open reader (section 3).
- Also in the reader: Dependencies lists one row per symbol, so a file repeats (`download.ts` three times under `index.ts`), and `dom.ts` shows exact duplicate rows (`types.ts` / `LocalMapPerspective` twice, `types.ts` / `ViewName` twice). Notes for this repository's files are a dated change diary ("The November 5 reading repair…"), which an outsider cannot use.
- Screenshots: `11-reader-detailpanel-exposes-uses-used-by.png`, `12-reader-after-following-link-no-back-control.png`.
- Reproduce: after finding 3, click the `detailPanel.ts` file name, then the `dom.ts` link under Dependencies, then try the ← at the top left.

### 11. Phone is unusable and tablet's first screen is unreadable — blocks at those sizes

- 390x844, World Map: the board is a small clump in a 340x790 canvas with the fifteen names piled on each other (about 290x130px including labels); the toolbar wraps to four rows; the sidebar is a collapsed strip.
- 390x844, Local Map: the opened sidebar covers two thirds of the screen and stays open after choosing a view; the search field overlaps the "Live Docs Explorer" title; the zoom buttons sit on top of the sidebar footer text; the 2D/3D toolbar overlaps the pin badge row.
- 820x1180, World Map: the board is about 460x230px in a 560x1130 canvas; "registry" overlaps "publish-workflow", "vscode-panel" overlaps the GITHUB region label and "ci-workflow", "live-docs" overlaps "action", "generator" overlaps "explorer". The board is not scaled to the space it has. The Local Map at this size is usable, with the same right-edge clipping as desktop.
- Screenshots: `26-phone-390-world-map.png`, `27-phone-390-local-map.png`, `28-tablet-820-world-map.png`.
- Reproduce: open the base URL in a 390x844 and an 820x1180 window; on the phone size press the ▶ strip, then "Local Map".

### 12. Motion: two of the main transitions do not explain themselves — slows

- World Map to Local Map ("open explorer"): a cross-fade from a light board to a dark canvas in under about 300 ms; the cards first appear top-left and settle elsewhere; nothing zooms into the piece I opened. (I kept no frame of this in the final set; it is reproducible with the clicks of finding 3.)
- Opening `src` inside `packages/explorer`: animated, but the two sibling cards swap sides and cross each other while the new band appears, so every card I had located moved.
- "Centre" from the zoomed-out overview: one frame with tiles flying and overlapping each other, the next frame already at about 1.5x on one card. A jump.
- Finishing the World Map walk-through leaves the board rotated from where it started (step 5 demonstrates orbit and "done" does not put it back).
- 2D to 3D is the good one: the cards shrink, the subject's name stays where it was, and the spheres grow around it.
- Screenshots: `06-opening-src-reshuffles-sibling-cards-midframe.png`, `03-world-map-after-walkthrough-left-rotated.png`, `18-2d-to-3d-transition-midframe.png`.

### 13. Zoomed out, 2D names are cut to one or two letters — slows

- Tried: wheel out to the minimum in a neighbourhood of about 35 cards.
- Happened: cards become name tiles (a good idea), but names are cut to "re…", "d…", "er…", "in…", "pa…", "tscon…", or broken mid-word over three lines ("detail / Panel / .ts", "reader / -secti / ons.ts", "markdo / wn.ts"). The captions above the tiles (directory path, "+19 files") are a few pixels high and unreadable.
- Screenshot: `10-local-2d-min-zoom-truncated-names.png`.
- Reproduce: after finding 3, wheel down about 14 notches over the map.

### 14. Small and low-contrast text in the 2D cards — cosmetic, but everywhere

Measured on the Local Map at the scan root:

| Element | Size | Colour on background | Contrast |
| --- | --- | --- | --- |
| Card directory line, e.g. "(root)", "packages/explorer/src/client" | 10px italic | rgb(108,116,132) on rgb(35,35,38) | 3.3:1 |
| "+7 symbols", "2 connections outside this view" | 11px | same | 3.3:1 |
| "No public symbols" | 10px | rgb(136,136,136) on rgb(35,35,38) | 4.4:1 |
| Sidebar footer "956 files, 5,446 references…" | 11px | rgb(119,119,119) on rgb(17,17,17) | 4.2:1 |
| Symbol names in a card | 11px | rgb(204,204,204) | fine |
| Type badges on symbol rows (→, ←) | 9px | | |
| Per-symbol "Inspect …" icon buttons | 12x14px target | | |

The "connections outside this view" line is the one that carries the most important fact on the card (finding 3) and is among the faintest.

### 15. Path result: right answer, rough drawing — cosmetic

- Tried: task (e). Searched "generat", Enter on `generator.ts`, typed "generate" in "Path to…", Enter.
- Happened: "Path found: 2 files", `generator.ts → generate.ts` as two buttons above the map, and the two cards with one wire from `generateLiveDocs` to `generate.ts`'s Internals. Clear.
- Defects: the directory band over `generate.ts` is labelled "…s, 1 directory" (the start is cut to nothing); the other band's label ".../generator/src +1 file, 1 directory" runs into its "Open" button; the action icons of the `generate.ts` card wrap onto a second row under the title while `generator.ts` keeps them on the title row; `generator.ts` has about 80px of empty space above and below its one symbol row; its footer says "54 connections hidden by filters" although I set no filter. Escape did not close the open pin tray.
- Screenshot: `17-path-result-2d.png`.

### 16. CLI answers are correct but hard to read — slows

- `--from packages/generator/src/generator.ts --direction inbound`: 19 lines of 200 to 420 characters, each repeating the origin and each file followed by its doc path in brackets (`[.mdmd/layer-4/….mdmd.md]`). Header: "Terminal inbound paths from …". The arrow reads `generator.ts -> some.test.ts` although the test depends on the generator. The guide itself shortens these to `[…]` when quoting them.
- `--from core.ts --to generate.ts` (wrong way round): "No dependency path found … (outbound). Closest reachable frontier:" then 18 lines ending ": terminal". It does not say that the path exists in the other direction.
- `--direction both` on the same pair is the readable one: "FORWARD PATH (outbound): No path found. "generator.ts" does not depend (directly or transitively) on "generator.test.ts". REVERSE PATH (inbound, 1 hop)…".
- `--reachable --direction both`, `--reachable` alone and `--groups` gave useful lists (65 files reached; 417 entry points, 164 unreachable; 42 groups) in the same long-line format.
- Speed is good: 2 to 5 s each.

### 17. Keyboard: the World Map's pieces cannot be reached — slows

- Tab order on the first screen is 18 stops: sidebar toggle, three views, two filters, Tuning, search, nine board buttons, "?". None of the fifteen pieces or their wires takes focus, so by keyboard the first screen can be rotated and saved but not read or entered. The search field comes eighth although it is top left of the content.
- Focus is visible on every stop I looked at (dark double ring on the light buttons, white ring on the checkboxes, blue rectangle on Local Map cards). Enter on "top-down" and on "Local Map" worked. In the 2D Local Map, Tab walks every card and each of its actions with clear names ("Open scripts", "Pin .live-docs.config.json", "+7 symbols").
- Screenshots: `05-local-map-scan-root-fourth-column-clipped.png` (blue focus rectangle on `.nvmrc`), `32-world-map-top-down-by-keyboard-labels-struck-through.png` (focus ring on "top-down" after Enter).
- Reproduce: fresh load, press Tab repeatedly; Enter on the eleventh stop.

### 18. History and sharing work; two rough edges — cosmetic

- History (task g): the clock icon in the 3D toolbar opens a scrubber and a step panel. Play from the last step restarts at step 0. At 8 steps/s the panel shows each commit's subject, date, step and "Changed: N files, M wires". With pins in place the scene shrinks to a small cluster on the right eighth of the canvas and most steps read "This commit changed nothing the docs could see"; on a fresh load without pins (the view had switched "Whole" on by itself and added a "Scan root" pin) the replay is lively and named, with file labels stacked on each other.
- Sharing (task h): I copied the address (1,131 characters) from a state with 3D, Structure, six pins and history paused at step 212, and opened it in a fresh browser context. View, representation, pins and the history step all came back. The picture did not: the source showed three labels in a small off-centre cluster, the recipient a close view with about twelve labels, two of them ("detailPanel.ts", "bootstrap · 2") partly under the bottom toolbar. The guide does warn that framing can differ.
- Knowledge Sources exports: "This panel as JSON" saved `knowledge-sources.json` (570 KB); "Download" saved `live-documentation.md` (3.3 MB).
- Screenshots: `23-history-playing-whole-picture.png`, `24-share-source-view-history-with-pins.png`, `25-share-opened-in-fresh-context.png`.

### 19. The estate sample: the board does the job for a colleague who does not program; the inside does not — slows

- The World Map reads as a sentence: portal, gateway, across an "IPsec tunnel · declared" from CLOUD to ON-PREM, hub, payments, sqlserver, oracle. Hovering the gateway-to-hub wire says "gateway calls hub, from configuration", the address, and "Gateway/Web.config → Hub/App.config". That is the picture I would show.
- What gets in the way: no arrowheads, so direction needs the blue/green rule from the help; the same subtitle-through-outline collisions as finding 6 ("web · 11 files" through the portal cube, "service · 4 files" against the tunnel label); the wire between portal and gateway is a few pixels of cyan between two cubes; the header says "7 things, 2 regions, 1 crossing", words that need explaining; the hovered wire's panel prints "App.net.tcp://hub.onprem.example:8731/PaymentHub", a prefix I could not interpret.
- Double-clicking `payments` opens a Local Map of four cards with empty bodies (the sample has no written purposes), "+3 symbols", "13 connections outside this view". Nothing there for a non-programmer, and `App.config` and the `.csproj` card lack the reader icon that `PaymentService.cs` has.
- Screenshots: `30-estate-world-map-first-screen.png`, `31-estate-hub-pinned-panel-and-labels.png`.
- Reproduce: `npm run live-docs:visualize:estate`, then `http://127.0.0.1:8917/samples/estate/`.

### 20. README, cold — slows

- No screenshot or diagram of a product whose value is a picture; the one link out is a hosted demo (not reachable for me).
- Getting Started is at the bottom, after the competitor table and configuration, and is four commands with no expected durations. On this machine the generate step is four minutes with almost no output (environment-dependent: about 80 s of CPU, the rest file I/O on the mounted drive).
- npm commands sit in `powershell` code fences.
- Insider vocabulary before any definition: "lightweight, verifiable AST", "board", "doors where they offer and use openings", "Falsifiable Truth", "this repository's build carries its own board", "accepted remediation work" (which links into a design document under `layer-3`). The guides open with status lines such as "the known gaps below link to the accepted remediation target".
- The Configuration section shows JSON without naming the file it goes in (the guide does: `.live-docs.config.json`). This repository's config uses `sampleRoots` and `entryPoints`, which the guide's settings table does not list.
- The Visualizing guide says of the World Map "Drag to orbit"; the in-app help says "Drag to pan. Right-drag or Shift-drag to orbit."

### Brief fix suggestions (separate from the observations above)

1. One section near the top of the README: "Map your own repository", with the exact commands, and a `--workspace` (or equivalent) that `visualize` accepts and documents. Make `--help` work on every command.
2. Change the closing line of `visualize` to a serve command that needs no download, and have the page say so itself when it is opened as a file. Report the bundle's own size.
3. Draw the wires among the cards on screen without a pin, or say on the card how to reveal them.
4. Replace placeholder paths in examples with paths that exist, or mark them as placeholders; accept or remove the positional "quick summary" form.
5. Fit on arrival; make "Reset Zoom" and "Whole" do what their names say; keep the subject's neighbours in the frame.
6. Offset board subtitles from their pieces; put a three-line legend on the board.
7. Put the summary and "open" link at the top of the pinned panel; fold the file list; place the panel beside the piece.
8. Do not count an opened directory as a pin or echo it into the search field.
9. Give the reader a back control, or leave the app's Back clickable while it is open; group dependency rows by file.
10. Name the nearest spheres in 3D by default; show a name on hover.
11. Shorten CLI lines: drop the bracketed doc path unless `--verbose`; use the `--direction both` wording everywhere; suggest the reverse when a path is missing.

## 3. What worked well and should be protected

- The "?" help and the five-step "walk me through it" on the World Map: short, concrete, and they act on the board while explaining it.
- Search: instant, grouped by directory, files with paths and kind badges, symbols indented under their file. The best control in the product (`15-search-results-dropdown.png`).
- The reader's content: a one-paragraph Purpose in plain words, then Public Symbols, Dependencies, Dependents, Cited By. Task (a) was answered completely there for `detailPanel.ts` (`11-reader-detailpanel-exposes-uses-used-by.png`).
- A pinned card at reading zoom: symbol rows with one-line descriptions, blue pins on the right, green on the left, wires converging on the consumer. This is the picture the README promises (`08-local-2d-wires-appear-only-after-pin.png`).
- The path report: "Path found: 2 files" with named hops above the map, kept across the switch to 3D.
- The app's Back: it restored the place, the zoom and even the open reader.
- Shared links: view, 2D/3D, layout, pins, path and history step all survive a fresh browser.
- Knowledge Sources: inventory, "Most used", "Uses the most", entry points and what nothing reaches, each with a sentence saying what the number does and does not prove; both exports worked. "Most used" would have told me which files matter in the first minute (`14-knowledge-sources-top.png`), but the name "Knowledge Sources" did not suggest it and the page opens elsewhere.
- The sidebar legend that changes with the view.
- The 2D to 3D transition, where the subject's name stays put.
- History: play, pause, speed, restart from the end, a commit panel that says what changed.
- Keyboard reach and naming inside the 2D Local Map; visible focus rings.
- Speed after generation: Explorer build 6 s, sample build 8 s, CLI answers 2 to 5 s, lint 7 s, page ready in about 2 s. I saw no page errors in the console on the served build (only software-GL performance warnings).
- The estate board and its wire evidence ("from configuration", file to file).
- `--direction both` output in the CLI.

## 4. What I could not figure out at all

- How to run this on my own repository (finding 1).
- What a piece's shape and height mean on the World Map: `engine` with 150 files is a flat tile, `scripts` with 72 a tall cube.
- What "Whole" is meant to show me, since the picture did not change.
- Which filters hide "54 connections hidden by filters" in the path view.
- What the "Implementation" badge in the reader and the "Internals" row on every card mean.
- Why there are "417 entry points" among 956 files, and what I should do with that number.
- The difference between "Show Related Docs" and "Show Citing Docs" in the 3D sidebar.
- The "App." in front of the address in the estate wire panel.
- The purple glow round some cards, until I matched it to the legend's "Test-backed" swatch, which is a small dark swatch with a thin purple edge and does not glow.

## Coverage

Done: journey steps 1 to 5; Explorer tasks a to j. Motion frames captured for: World to Local, opening a directory, Centre, Reset Zoom, Whole, Back, search arrival, 2D to 3D, 3D orbit, Fit, Structure, history play.

Not done or only partly done:

- The hosted demo link and `npx serve`: no network.
- A real `generate` over the estate folder: it would have written 38 files into a tracked directory, so I ran `--dry-run` and the package script instead.
- Touch gestures on the phone size; 3D and History at phone and tablet sizes; the tablet beyond World Map and the 2D Local Map root.
- Keyboard operation of 3D, of History and of the reader; I tabbed the first screen and the 2D Local Map root only.
- "Reachable from" in Knowledge Sources, the reverse-only and no-path cases of "Path to", "Save board", the dark board, "built on", the ZIP export, `live-docs:board`, `live-docs:history`, `--json` output, `--at` and `--between`.
- 3D performance: software rendering only.
