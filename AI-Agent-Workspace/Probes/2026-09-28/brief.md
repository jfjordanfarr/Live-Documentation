# Probe brief, 2026-09-28

Three disposable prototypes, each one HTML file, each answering two questions: what does a third dimension buy the picture at one scale, and which facts does that picture need that the Live Docs do not carry. The findings matter; the code will be deleted. Repository: /workspaces/Live-Documentation. Read `.mdmd/layer-1/vision.mdmd.md` (77 lines) and `AI-Agent-Workspace/Memory/owner.md` (35 lines) before starting; they are short and they are the law here.

## What exists, so you do not rebuild it

The Explorer (`npm run live-docs:visualize`, output in `dist/explorer/`) has four views. Screenshots of all of them over today's graph are in `AI-Agent-Workspace/tmp/explorer-shots-2026-09-28/`; look at `04-local-map-connection-geometry.png` and `09-crop-local-map-corset-card.png` before drawing anything.

- **Local Map**: one file in the centre as a card, one row per public symbol, green pin on the left wall, blue pin on the right; consumers stacked in a column on one side, dependencies on the other; a Bezier wire per symbol. The most polished view.
- **Membrane Map**: directories as nested rectangles, files as cards inside; pinning a symbol rearranges the neighbourhood into dependencies | pinned | dependents columns inside the directory bands. The most versatile view. Its cross-directory wires in browse mode are disabled because they were noise.
- **Force Graph**: three-dimensional force-directed layout of every file, topological only, no direction and no symbols. The owner calls it the most useful view by far.
- Circuit Board: an older treemap, being folded into the Membrane Map.

## The visual law (settled taste, not open for redesign)

- Inputs enter on the left, outputs leave on the right, at every scale.
- Inbound pin green `#34d399` on the left wall; outbound pin blue `#38bdf8` on the right wall. A wire runs from a provider's blue pin to a consumer's green pin, coloured blue to green with 10% solid colour at each end (see `createConnectionGradient` in `packages/explorer/src/client/views/connection-geometry.ts`).
- Focus fades the unrelated. Never boost the relevant: no glow, no pulsing, no thicker lines for the selected thing. Cut, do not boost.
- No emoji, no icon fonts. Dark background (around `#0b0f17`), light text. Fonts: system sans; monospace for paths.
- **The French Corset**: a reference between two symbols of the same file is not drawn across the card face. The outbound pin gets a short blue stub that curls and vanishes behind the card; the inbound pin gets a short green stub emerging from behind. The lace is implied. `computeSelfLoopStubs` in `connection-geometry.ts` has the exact 2D geometry (stub 14 px, curl 8 px, tapered). In three dimensions the lace may pass behind the card for real. A wire that would run right to left (a back-connection) gets the same stub treatment in the 2D views.
- A card: title is the file name, subtitle the path, one row per public symbol with its kind shown subtly (`function`, `interface`, ...), and an `Internals` row at the bottom where a wire lands when the edge names the file but not a symbol.
- The owner is borderline aphantasic and reads geometry exactly. Pins sit exactly on walls. Alignment is not decoration.

## The data

`.mdmd/index.json` (3.1 MB) is the graph derived from every Live Doc. Shape: `{ root, baseLayer, extension, files: { [codePath]: GraphFile } }`.

GraphFile: `codePath`, `docPath`, `layer`, `archetype` (`implementation` | `test` | `asset`), `generatedAt`, `authored` (markdown), `symbols[]` (`name`, `slug`, `kind`, `flags`, `references`, `sections`, `source{path,line}`), `dependencies[]` (`label`, `link?`, `qualifiers`, `symbols?`), `reExports?`, `edges[]`, `outbound[]` (codePaths), `inbound[]` (codePaths). `inbound` and `outbound` exclude self edges.

GraphEdge: `kind` is `import` | `re-export` (from a Dependencies line) or `returns` | `parameter` | `extends` | `implements` | `constraint` (from a symbol's type reference); `label`; `link?` (what the doc wrote); `to?` (the codePath the link lands on); `toSymbol?` (slug of the target symbol, look it up in `files[to].symbols`); `from?` (slug of the referencing symbol in this file, present on type references only, never on imports); `parameter?`; `typeOnly?`. A self edge has `to === codePath`: that is the corset. An import with no `link` is an external module (`node:fs`, `glob`, `three`).

Numbers today: 549 files, 2949 edges (2308 imports and re-exports, 641 type references, 276 of them self edges in 53 files). Hub: `packages/engine/src/live-docs/core.ts`, 33 inbound, 13 outbound. Corset: `packages/explorer/src/client/views/connection-geometry.ts`, 20 symbols, 26 self edges. Folder: `packages/engine/src/live-docs/`, 22 files, 55 internal edges, 11 wires out, 54 wires in from 8 places.

Embed the index in the page: write a small node script (`build.cjs`) beside the page that reads `.mdmd/index.json` and writes `index.html` with `<script id="index" type="application/json">…</script>` inlined, so the page opens by double-click with no server.

## Constraints

- One self-contained `index.html` per probe under `AI-Agent-Workspace/tmp/probes/<name>/` (gitignored). Keep `build.cjs`, `src.html` (the template), `shots/` and `findings.md` beside it.
- three.js from jsdelivr, pinned, through an import map; addons allowed (`OrbitControls`, `CSS2DRenderer`, `Line2`):
  `<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>`
  Cards drawn as planes with a canvas texture (draw text at 2x or 3x resolution) give true occlusion, which the corset needs; CSS2D labels are fine for titles.
- No build step beyond `build.cjs`, no npm installs, no new dependencies in the repository.
- Never modify a tracked file. Never run `live-docs:generate`. Never commit. Never touch `.mdmd/` or `dist/`.
- Screenshot with Playwright and look at every screenshot with the Read tool; iterate at least three times before you stop. This works in this container:

  ```js
  // shoot.cjs, run as: NODE_PATH=/workspaces/Live-Documentation/node_modules node shoot.cjs
  const { chromium } = require("playwright");
  (async () => {
    const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
    const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
    p.on("pageerror", (e) => console.log("pageerror:", e.message));
    await p.goto("file:///workspaces/Live-Documentation/AI-Agent-Workspace/tmp/probes/<name>/index.html");
    await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
    // drive states through window functions you expose, e.g. await p.evaluate(() => window.probe.focus("packages/engine/src/live-docs/core.ts"));
    await p.screenshot({ path: "shots/01-name.png" });
    await b.close();
  })();
  ```
  Set `window.__ready = true` after the first frame. Expose a small `window.probe` API (focus, orbit, enter, level) so states are reproducible from the script and from the browser console.
- Stay interactive with the whole index loaded. Render only the neighbourhood you need; the rest can be points or nothing.
- Be honest. Draw only what the index says. Where the picture wants a fact the index does not have, do not invent it: leave the honest gap and write the fact down in `findings.md`.

## Deliverables, per probe

1. `index.html` that opens by double-click, plus `build.cjs` and `src.html`.
2. `shots/` with at least the screenshots the probe section names, numbered.
3. `findings.md`, under 1200 words, with these headings: What was built and how to drive it; What depth bought (cite screenshots); What it cost (occlusion, legibility, disorientation, performance); Facts the picture needed that the docs do not carry (each with the exact place the picture wanted it); Transition points (how you would move one scale in and one scale out from here, and what must stay visible so the next scale pulls you); Keep and throw away; Open questions. Precise ASCII diagrams are welcome.
4. Your final message: the text of `findings.md`, verbatim, followed by the list of files you wrote.

## Probe A: cards in depth (`probes/cards-in-depth/`)

The Local Map's grammar with depth. The focus file is a card facing the camera; its consumers are cards to the left, its dependencies cards to the right, exactly as the Local Map places them, with the same pins and the same per-symbol wires. Two 2D problems are yours to attack with the third dimension:

1. **Hubs.** `core.ts` has 33 consumers; in 2D they stack into a column taller than the screen (`05-local-map-core-hub.png`). Arrange them in depth: an arc, a cylinder, a spiral, a fan, whatever lets 33 cards be present without a scroll and lets the wires stay readable. The same on the right for dependencies.
2. **The corset.** Draw the lace for real: for each self edge, a tube from the provider's blue pin, curling behind the card plane, emerging at the consumer's green pin, with the card occluding it. Front-on it must read as the 2D stubs do; orbited, the lacing should be visible behind the card.

Wires: from the provider's blue pin to the consumer's green pin; when the edge is an import (no `from`), land on the consumer's `Internals` row. Click a card to make it the focus and re-lay out. Hover fades the unrelated. Orbit with the mouse.

Screenshots: `connection-geometry.ts` front-on; the same orbited about 35 degrees to show the lacing; `core.ts` front-on; `core.ts` orbited; `packages/engine/src/live-docs/graphFiles.ts` (a small file) front-on.

Questions to answer: does depth give a hub an order that 2D cannot? Is the lace readable, and does it tell you something about the file at a glance? What breaks: labels at an angle, occlusion, losing which side is which? From this picture, what would pull the viewer one scale out, to the folder the file lives in?

## Probe B: membranes as volumes (`probes/membranes-as-volumes/`)

The Membrane Map's directories as translucent boxes. Open with `packages/engine/src/live-docs/` as an open volume: its 22 file cards standing inside (a grid or a force layout confined to the box), internal wires between their pins. A wire that leaves the folder pierces the wall and ends at a pin on the wall: green pins on the box's left wall are where the folder is consumed from outside, blue pins on its right wall are what it consumes outside. Around it, the folders it is wired to (`packages/engine/src/config`, `packages/generator/src`, `scripts/live-docs`, `packages/explorer/src/shared`, `tests/integration/live-docs`, and the rest the index gives you) are closed boxes showing only a name, a file count, and their wall pins with counts. Double-click a closed box to enter it: the camera moves, it opens, the previous one closes. Make the transition visible.

Screenshots: the live-docs box open with its neighbours closed; the same orbited about 30 degrees; entering `packages/explorer/src/shared`; the same scene at low detail (card text hidden, only pins and wires).

Questions to answer: does volume give cross-folder wires the room the 2D map lacked? What does a wall pin need to be legible: one pin per wire, one per target folder with a count, one per symbol? What should be visible one scale out from inside a box, and one scale in? Is the folder's wall the right home for the folder's public surface (the Membrane Map doctrine says a barrel file *is* the membrane boundary; see `.mdmd/layer-3/membrane-map.mdmd.md`, "Barrel Files as Membrane Boundaries")?

## Probe C: systems on a canvas, the estate (`probes/estate-canvas/`)

The multi-system stage, on the owner's own payment chain in miniature: `tests/integration/programs/csharp/estate/`. Read its `README.md` first; it draws the chain. Six systems: `Portal`, `Gateway`, `Hub`, `PaymentService`, `Contracts`, and `Database` (`SqlServer` and `Oracle`). Lay them out left to right along the chain inside two translucent zones, cloud (Portal, Gateway) and on-prem (Hub, PaymentService, SqlServer, Oracle), with the tunnel drawn where the zones meet. Each system is a closed box.

Wires between boxes carry a tier and are drawn differently by tier:

1. **Observed from source**: the index's cross-project edges (`Gateway`, `Hub` and `PaymentService` each import from `Contracts`). Solid.
2. **Observed from contracts and configuration**: `expected/hand-verified-edges.json`, the entries marked `remote: true` (HTTP route from the portal's client to the gateway's controller, WCF endpoint addresses matched across configuration files, `EXEC` of a stored procedure, an entity mapped to a table, the linked-server query into Oracle). Dashed; hovering shows the `via` text as the evidence.
3. **Declared**: nothing in the data declares anything yet. Draw the tunnel as the one declared thing, labelled as declared, so the tier exists on screen.

Beneath each box, hang its dependency cruft: the `<PackageReference>` entries from its `.csproj` (`EntityFramework 6.5.1`, `Microsoft.AspNet.WebApi.Core 5.3.0`, and the framework references) as barnacles or vines on the underside. These come from the project files, not from any Live Doc; say so on the page and in the findings.

Peer in: double-click a box and it opens to show its files as cards from the index, with the wall-pin convention, the rest of the canvas dimmed. Then let the viewer go one scale further, to a single card with its symbols (a simplified Probe A), and back out.

Screenshots: the canvas at rest; hovering a tier-2 wire with its evidence shown; `Gateway` opened; and a three-shot zoom sequence from `Gateway/Controllers/PaymentsController.cs` as a card, to the `Gateway` box, to the canvas, to show what changes at each transition and what stays put.

Questions to answer: at this scale, what matters (endpoints, tiers, packages) and what must vanish (symbols)? How does a box's wall summarise what it serves (left) and what it calls (right)? What are the transitions between the three scales, and what has to stay on screen so the viewer keeps their bearings? And, precisely: which facts this picture needed are not in the docs today (routes, endpoint addresses, package versions, zones, tiers, the direction of a config-observed edge). That list is the doc format's growth list; it is the most valuable thing this probe produces.
