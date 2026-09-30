# Navigation probes, 2026-09-30: the brief

Eleven schools of design each research, design, build and defend one way of navigating the Live Documentation Explorer. The prototypes are disposable; the intentions, the choices and the reasons are the product of this work. Read `.mdmd/layer-1/vision.mdmd.md` and `AI-Agent-Workspace/Memory/owner.md` before anything else: they are short and they are the law here.

## Why, in the owner's words (2026-09-30)

> Look to videogames for inspiration. I think that The Sims (and maybe Spore?) had bubbles at the bottom center of the screen for primary actions or something like that. (And interesting multi-popover-like elements with choices surrounding their instantiating context). All I mean to say with that example is: think very far outside the box -- the goal here is to present people with the ability to model and navigate complex systems. The raw ingredients we need to succeed -- UI nits hard-won -- are spread across more than one view. But I personally think we have all the guts we need to compose a really staggering number of variants inspired by a big variety of different domains. This is **DESIGN**. I want to see these subagents defining **intentions.** In design, nothing is accident. Everything is a choice to be justified. I want to see a big variety of schools of thought at work demonstrating how these raw ingredients we've assembled can be composed into user-friendly experiences aligned with our vision and proposed use cases. **It should be a joy to navigate in the Live Documentation Explorer**.

> We want a nicely-accessible works-at-basically-any-screen-size highly-portable client-first secure experience for exploring complex systems and sharing that exploration with others easily.

What they said about navigation the same night:

- The sidebar: "It's possible that a more parsimonious design throws away the left sidebar (at least most of the time, perhaps?) in favor of smoothly transitioning between scales. If the root breadcrumb is the world map, switching views does become rather easy." And: "I do think that the 'Knowledge Sources' tab has utility to give. I just think the overall UI functionality we have could just use rearrangement into different places and different contexts."
- Moving around: "the system as-is leaves me _deseparately_ wishing for back/forward buttons (undo/redo?) as I am known to hop around navigating a lot." Back and Forward now exist (see "Places" below); how they are presented is yours to design.
- Paths: "I could understand if pathfinding elements were useful at either the World Map scale or the (to-be-consolidated-as) Local Map scale. Not confident that one can necessarily pathfind between abstraction levels, but it does present an interesting avenue for presenting colleagues with data flows through their hops."
- Exposure: "I wonder if scan-derived views (however those are made) might instead _reveal_ to a user how _exposed_ their distributed system really is!"
- Still pictures against moving through: "pixel-for-pixel, I know more from _a single image_ of the preexisting Local Map versus the preexisting Membrane Map. **Simultaneously**, I know from experience that I can learn more from the **continuous interaction with** the Membrane Map than the Local Map." A design should be good at both.
- Taste is not an argument: "Aesthetic disagreements with an LLM will be fruitless in the quest for maximizing user experience and legibility." Justify a choice by an intention and a scenario, never by taste alone.

Standing taste from `owner.md` that binds every school: games are the reference for the outer scale; a click pins and a hover peeks; every claim a panel makes is a link to where it came from; at least two ways to do anything; explanations live behind a help control, not on the screen; motion along the wires, flowing from what offers to what uses; light outside, dark inside; the camera turns the way the force graph's does; text never resizes across a transition; fade the unrelated, never boost the relevant; no emoji and no icon fonts.

## The raw ingredients

Everything below exists and works today, in `packages/explorer/src/client/` unless named otherwise. Pictures of today's Explorer at phone, laptop and wall sizes are in `AI-Agent-Workspace/tmp/probes/2026-09-30/_kit/baseline/`; the only pictures of the original Local Map at its best are in `AI-Agent-Workspace/Screenshots/2026-09-28/` (look at `04`, `05` and `09`). Look at both before you design anything.

- **World Map** (`views/worldMap/`): systems as closed pieces on an isometric board, drawn by kind (cube, tile, drum, figure, cloud), in tinted regions; doors, blue where a piece offers an opening (a route, an address, a procedure, a table) and green where it uses one; wires in the air carrying their basis and evidence, with flowing motion; what a piece stands on hanging beneath it; a pinned panel whose every name is a link; orbit, pan, zoom without anything changing size; a help control with a walkthrough; light and dark; a board text people can edit and save. A test handle at `window.__worldMap` drives it (pin, hover, orbit, zoom, fit, tour, screenPointOf, lidCorners).
- **Zoom into a thing**: wheel into a piece, double-click it, or follow `open` in its panel, and it opens in the Membrane Map on its folder, with the World Map as the first crumb.
- **Local Map** (`views/localView/`, `views/connection-geometry.ts`): one file as a card, a row and two pins per public symbol, its users on one side and what it uses on the other, a Bezier wire per symbol from blue to green; the French Corset, short stubs for references within one file; an `Internals` row; test files as tags; hover dimming at 0.5 and 0.1, tuned by the owner on sliders (`panels/tuning.ts`); path mode, From and To boxes that find and draw the chain of files between two files (`pathfind.ts`).
- **Membrane Map** (`views/membraneView/`): folders as nested membranes in a treemap, files as cards, a crumb bar, an `Explore` button on a folder's tile, counts of files, symbols, wires in and out on each folder; pinning symbols rearranges the neighbourhood into columns inside the folder bands; hop badges and a breadcrumb for a path; FLIP animation between layouts.
- **Force Graph** (`views/forceGraphView.ts`): every file in three dimensions, bundled with three.js; the owner calls it the most useful view by far, and it is the local scale's only 3D view.
- **Knowledge Sources** (`panels/sources-view.ts`): where the data came from, statistics, health warnings (heavy fan-in and fan-out), the related documents as a tree, downloads of the docs.
- **Search** (`panels/omnisearch.ts`, Ctrl+P): files and symbols by fuzzy name. **Detail panel** (`detailPanel.ts`): a file's authored Purpose and Notes, its dependencies, links into each view, the doc as markdown.
- **Places and history** (`persistence/history.ts`, `persistence/place.ts`, `persistence/*url-state.ts`): every place has an address, the view, the file in focus, the folders open, the two ends of a path; a move between places is a browser history entry and Back and Forward walk them; pins, pan and zoom change the place's entry without adding one, a split the owner asked for. Addresses are shareable.
- **The engine** (`packages/engine/src/live-docs/`): `graph.ts` (the graph every consumer reads), `pathfind.ts` (`searchGraph`, paths between files), `board.ts` and `boardGraph.ts` (the board text joined to the docs: every wire between things carries the file-level edges that make it up, so a path can cross scales), `openings.ts` (routes, addresses, procedures, tables as symbols).
- **The design audit** (`tests/e2e/design-audit.ts`): finds labels that collide and text that is cut off; reuse it on your prototype if you can.

## The data

Two bundles are copied into `AI-Agent-Workspace/tmp/probes/2026-09-30/_kit/`: `this-repo.json` (this repository, 593 files, with its board of six things) and `estate.json` (the C# sample of the owner's work systems: portal, gateway, hub, payments, contracts, sqlserver, oracle, in cloud and on-prem regions with a declared tunnel). Each is `{ graph: { files: { [codePath]: GraphFile } }, board?: { path, text }, relatedDocLinks }`. A GraphFile carries `codePath`, `archetype`, `authored` (the Purpose and Notes as markdown), `symbols[]` (name, kind, including opening kinds such as `route`, `address`, `procedure`, `table`), `edges[]` (kind, `to`, `toSymbol`, `from`, and a `basis` of `contract` or `configuration` on edges that cross a process boundary), `outbound[]` and `inbound[]`. Read `packages/engine/src/live-docs/graph.ts` for the exact shape and `tests/integration/programs/csharp/estate/README.md` for the estate's story. The whole built Explorer is in `_kit/explorer/` (this repository's bundle at its root, the estate's under `samples/estate/`).

Draw only what the data says. Where a design wants a fact the data does not carry, do not invent it: leave the honest gap and write the fact down.

## Six scenarios

Every design is judged by these, at more than one screen size. Walk at least three of them in your prototype, as numbered screenshot sequences.

1. **Where do I start?** A newcomer opens this repository's map and wants to know what `packages/engine` offers, who uses it, and which file to read first.
2. **What does my change touch?** The author of a change to `packages/engine/src/live-docs/core.ts` wants everything that depends on it, across folders and across things on the board.
3. **Trace a payment.** On the estate, follow a payment from the portal's page through the gateway's route `GET api/payments/{paymentId}`, the hub's WCF endpoint, the payments service, to `dbo.Payment` in sqlserver and `CENTRAL.ACCOUNT` in oracle: every hop, and the files that carry each.
4. **Show a colleague.** Prepare a view of the estate for a director and send it; it opens exactly as prepared, on their phone.
5. **The hopper.** Visit five places across scales in under a minute (the board, a thing, a file, a symbol's users, back two steps, a path), always knowing where you are and how to get back.
6. **How exposed is it?** On the estate, which openings does each system offer, which does something on the map use, and which does nothing use?

## Constraints

- **Offline and static.** No network request at runtime: no CDN, no fonts from the web. three.js and every other library come from the repository's `node_modules`, bundled with `kit.bundle`. The page opens from its folder (over the kit's server) and, if you can manage it, by double-click.
- **Any screen size.** Photograph every prototype at phone (390 by 844, touch), laptop (1440 by 900) and wall (2560 by 1440). A design that only works on one is a finding, not a pass.
- **Any hand.** Pointer, touch and keyboard. At least two ways to do anything.
- **Accessible.** Aim at WCAG 2.1 AA: text contrast of at least 4.5 to 1, a visible focus, everything reachable by keyboard, accessible names on controls, `prefers-reduced-motion` respected.
- **The visual law.** Blue offers, green uses, at every scale. Fade the unrelated; never glow, pulse or thicken the relevant. Text does not resize across a transition. No emoji, no icon fonts.
- **Honest.** Real data only; no invented wires, counts or names.
- **Shareable.** A place, a path or a prepared view can be sent to someone else and opens the same for them.

## How each school works

1. **Research** (three researchers, before you): the school's canon and principles; its precedents, concrete interfaces and the exact mechanics by which they navigate; and inspiration from far outside the school and outside software. Their notes are in your folder as `research-canon.md`, `research-precedents.md` and `research-far-field.md`.
2. **Design** (the designer): generate at least fifteen distinct ideas; put each through a thought experiment, at least two scenarios at two screen sizes; discard the ones that fail and say why in one line each; keep the few that compose into a whole. Write the intentions: each as "Intention: what the person should be able to do or feel. Because: the reason, from the school and the scenarios. Therefore: the choices it forces." Every visible choice in the design must trace to an intention. Write `intentions.md`.
3. **Build** (the builder): make the prototype that the intentions describe, on the real data. Two routes, or a mix: a **shell** over the real Explorer (copy `_kit/explorer/`, rearrange or hide its chrome, add your navigation layer, drive the views through their handles: `window.switchView`, `window.__worldMap`, `window.openOmnisearch`, the history, the address), or a **fresh page** composed from the data that imports the repository's own modules (the engine's graph and path search, the board join, the Local Map's layout math and connection geometry) through `kit.bundle`. Expose `window.probe`, a small API that puts the page in each state, so every screenshot is reproducible. Iterate at least three times, looking at every screenshot with the Read tool. Write `findings.md`.
4. **Critique** (a critic with fresh eyes): walk the scenarios at all three sizes, check every intention against what is on the screen, check the constraints (hosts contacted, keyboard, contrast, text size across transitions, the colour law), and rank the problems. Write `critique.md`.
5. **Revise** (the builder again): fix what the critique found that can be fixed, re-photograph, and write `record.md`, the one file that is kept.

## The kit

`AI-Agent-Workspace/tmp/probes/2026-09-30/_kit/kit.cjs` (require it by absolute path) gives you `serve(dir, port)` (an in-process static server; `await stop()` closes it), `openPage(url, size)` (a Playwright browser at `phone`, `laptop` or `wall`, WebGL through SwiftShader, page errors collected in `page.__errors`), `bundle(entry, outfile)` (esbuild, offline, any import from the repository or `node_modules`), and `SIZES`. Log every host a page contacts (`page.on("request", ...)`); the answer must be only your own server.

## Rules

- Work only inside your school's folder, `AI-Agent-Workspace/tmp/probes/2026-09-30/<school>/`. Never modify a tracked file, never run `live-docs:generate` or the gate, never commit, never touch `.mdmd/` or `dist/`.
- Use only the ports assigned to your school. Stop only processes you started, by the handle you started them with: never `pkill`, `killall` or `kill` by name.
- Use your own subagents where the work splits (research, alternative sketches, a second pair of eyes on screenshots), and keep their output in your folder.

## `record.md`, the file that is kept

Under 1500 words, with these headings: **The school** (in two sentences, and what it believes good navigation is); **Intentions** (each with its because and therefore); **The design** (what a person sees and does, with the screenshots that show it, by file name); **Discarded** (the ideas thrown away, one line each with the reason); **The scenarios** (each one walked: how it went, where it failed); **What the critique found and what changed**; **What it would take to make it real** (which ingredients it reuses, what must be built, what the data lacks); **The idea worth stealing** (one, even if the rest is thrown away); **Questions for the owner**. Precise ASCII diagrams are welcome.
