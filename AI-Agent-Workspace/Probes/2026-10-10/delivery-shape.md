# This repository's board as its delivery shape: the probe of the World Map's second ticket, October 10, 2026

_A design probe by the root Claude Code agent (Fable 5.1) on 2026-10-10, at the owner's word in [Turn 13 of the October 9 session](../../ChatHistory/2026/10/2026-10-09.1.record.md#turn-13): "Let's try T2, the repository's board as its delivery shape." It is the probe that ticket T2 of [the World Map's plan](../../../.mdmd/layer-3/world-map.mdmd.md#open-questions) asks for. The candidate boards are disposable text, kept here verbatim; the bundles built from them are not committed; the six pictures under `delivery-shape/` are. Nothing under `packages/` changed._

## The question

The owner questioned this repository's board on 2026-10-02: "it's unusual to me that the 'estate' of Live Documentation is basically just its major directories. Uhhh that's all _inside_ the system of Live Documentation, no? ... I could maybe understand designing the 'estate' 'world map' of Live Documentation to include the repo and the static site address and the workflow to deploy it maybe?" On 2026-10-03: "should yaml workflow files help define the estate? That is unsolved in terms of how we want it to look." On 2026-10-08, asked whether to keep or delete the CLI package shell, they said the delivery shape of the software has been undecided for the project's whole life, that "maximum security, portability, shareability" are the constants, and asked whether the World Map's picture of this repository and that undecided shape were one question. They are: a board draws the delivery shape, and a thing with no `From` is imagined, so the board can draw a shape before it is built ([Turn 6 of the October 8 session](../../ChatHistory/2026/10/2026-10-08.1.record.md#turn-6)). The plan's ticket T2 is that picture, promised as "two or three candidate shapes, as pictures, before any code."

So the probe asks three things. Can the board and the World Map, as they stand after T1, draw this repository's delivery shape with its unbuilt parts imagined? What does each candidate shape look like, and what does it ask of the repository? And what did the drawing find wanting?

## How it is built

1. **The base.** The repository's own Explorer bundle, built by the real builder over the committed docs with the current board, `npm run live-docs:visualize` into a scratch folder: 662 files, 1,510 edges, one scan at the workspace root.
2. **The candidates.** Three boards, written by hand below, each with `From` lines relative to `.mdmd/layer-3/` as the real board's are. Each is parsed and linted with the board grammar, joined to the base bundle's graph headlessly with `deriveBoardGraph`, and run through the World Map's own model, `buildWorldModel`, to print its things, doors, wires and whatever the join or the model found wanting.
3. **The bundles.** The base bundle is copied once per candidate and the board text inside its data file replaced. The join runs in the viewer, so each picture is the real World Map over the real docs and the candidate board; only the board differs from the shipped site.
4. **The pictures.** Playwright opens each bundle on the World Map, fits the board to the viewport, takes it at rest, then pins an imagined thing, a declared wire, a declared door, a region and a workflow, and for the second and third boards the things that make them what they are. The design audit's instruments, `textBoxes`, `overlapsAmong` and `truncations`, measure the board's words at rest and under every pin.

The script is the scratchpad's `t2-shapes.ts`; its run log is the source of the numbers below.

## The three boards

Every board keeps what is real, the folders the docs come from, and differs in what it imagines. A thing with a `From` is drawn from its docs; a thing without one is imagined, and every wire to or from it is declared by hand.

### A. Today, honestly

The owner's October 2 sentence drawn: the repository, the site, and the workflows that build and deploy it. Nothing is proposed.

```markdown
# Live Documentation

## Metadata
- Layer: 3

## Authored
### Purpose
This repository as the estate it is today: the repository's parts, the site that shows them, and the workflows that build and deploy them, with imagined things where no folder is scanned.

### Notes
Candidate A of the T2 probe, 2026-10-10: the owner's October 2 reading, "the repo and the static site address and the workflow to deploy it". The site, the workflows and the reader are imagined; nothing scans them, so their doors and wires are declared by hand and the picture says only what the person wrote.

## Declared

### Things

#### `REPOSITORY`
- Kind: repository
- Holds: `engine`, `generator`, `explorer`, `cli`, `scripts`, `tests`

#### `GITHUB`
- Kind: cloud
- Holds: `ci-workflow`, `pages-workflow`, `pages`

#### `engine`
- Kind: library
- From: `../../packages/engine`

#### `generator`
- Kind: library
- From: `../../packages/generator`

#### `explorer`
- Kind: web
- From: `../../packages/explorer`

#### `cli`
- Kind: program
- From: `../../packages/cli`

#### `scripts`
- Kind: program
- From: `../../scripts`

#### `tests`
- Kind: tests
- From: `../../tests`

#### `ci-workflow`
- Kind: workflow

#### `pages-workflow`
- Kind: workflow

#### `pages`
- Kind: site
- Serves: `https://jfjordanfarr.github.io/Live-Documentation/` (address)

#### `reader`
- Kind: person

### Connections
- `ci-workflow` to `scripts` over `npm run ci-check`
- `pages-workflow` to `scripts` over `npm run live-docs:visualize`
- `pages-workflow` to `pages` over `actions/deploy-pages`
- `reader` to `pages.https://jfjordanfarr.github.io/Live-Documentation/` over `browser`

## Legend
- `repository` as grey
- `workflow` as cube
- `site` as sheet
- `tests` as sheet

## Layout
- `ci-workflow` at 6, 5
- `pages-workflow` at 9, 5
- `pages` at 12, 5
- `reader` at 16, 5
- `engine` at 1, 10
- `generator` at 4, 10
- `explorer` at 7, 10
- `cli` at 10, 10
- `scripts` at 13, 10
- `tests` at 16, 10
```

### B. The package first

The shape advised on October 8: one published package whose binary runs the commands, and everything else wrapping it, the action, the owner's own workflows, a VS Code panel, with a stranger's pipeline and site as the customer, and a colleague and an agent reading that site. The CLI shell is gone; `scripts` keeps the repository's own tooling.

```markdown
# Live Documentation

## Metadata
- Layer: 3

## Authored
### Purpose
This repository drawn as the delivery shape advised on October 8: one published package whose binary runs the commands, everything else wrapping it, with the things not yet built imagined.

### Notes
Candidate B of the T2 probe, 2026-10-10. Imagined: the `live-docs` package, the action that runs it, the workflow that publishes it, the registry it is published to, a stranger's code, pipeline and site, the colleague and the agent who read that site, and a VS Code panel as a thin wrapper. The CLI shell is gone; `scripts` keeps the repository's own tooling. Every wire to or from an imagined thing is declared by hand.

## Declared

### Things

#### `REPOSITORY`
- Kind: repository
- Holds: `engine`, `generator`, `explorer`, `live-docs`, `action`, `scripts`, `tests`

#### `GITHUB`
- Kind: cloud
- Holds: `ci-workflow`, `publish-workflow`, `pages-workflow`, `pages`

#### `NPM`
- Kind: cloud
- Holds: `registry`

#### `ELSEWHERE`
- Kind: elsewhere
- Holds: `their-code`, `their-pipeline`, `their-site`

#### `engine`
- Kind: library
- From: `../../packages/engine`

#### `generator`
- Kind: library
- From: `../../packages/generator`

#### `explorer`
- Kind: web
- From: `../../packages/explorer`

#### `live-docs`
- Kind: package

#### `action`
- Kind: action

#### `scripts`
- Kind: program
- From: `../../scripts`

#### `tests`
- Kind: tests
- From: `../../tests`

#### `ci-workflow`
- Kind: workflow

#### `publish-workflow`
- Kind: workflow

#### `pages-workflow`
- Kind: workflow

#### `pages`
- Kind: site
- Serves: `https://jfjordanfarr.github.io/Live-Documentation/` (address)

#### `registry`
- Kind: service
- Serves: `https://registry.npmjs.org/@live-documentation/live-docs` (address)

#### `their-code`
- Kind: codebase

#### `their-pipeline`
- Kind: workflow

#### `their-site`
- Kind: site
- Serves: `https://their-org.example/live-docs/` (address)

#### `reader`
- Kind: person

#### `colleague`
- Kind: person

#### `agent`
- Kind: agent

#### `vscode-panel`
- Kind: extension

### Connections
- `live-docs` to `engine` over `import`
- `live-docs` to `generator` over `import`
- `live-docs` to `explorer` over `import`
- `action` to `live-docs` over `npx live-docs`
- `ci-workflow` to `scripts` over `npm run ci-check`
- `publish-workflow` to `registry.https://registry.npmjs.org/@live-documentation/live-docs` over `npm publish`
- `pages-workflow` to `action` over `uses`
- `pages-workflow` to `pages` over `actions/deploy-pages`
- `their-pipeline` to `action` over `uses`
- `their-pipeline` to `registry.https://registry.npmjs.org/@live-documentation/live-docs` over `npm install`
- `their-pipeline` to `their-code` over `checkout`
- `their-pipeline` to `their-site` over `deploy`
- `vscode-panel` to `live-docs` over `bundled`
- `reader` to `pages.https://jfjordanfarr.github.io/Live-Documentation/` over `browser`
- `colleague` to `their-site.https://their-org.example/live-docs/` over `browser`
- `agent` to `their-site.https://their-org.example/live-docs/` over `a link`

## Legend
- `repository` as grey
- `elsewhere` as green
- `workflow` as cube
- `action` as cube
- `package` as tile
- `extension` as tile
- `codebase` as cube
- `site` as sheet
- `tests` as sheet
- `agent` as figure

## Layout
- `their-code` at 6, 1
- `their-pipeline` at 9, 1
- `their-site` at 12, 1
- `colleague` at 16, 1
- `agent` at 19, 1
- `registry` at 1, 5
- `ci-workflow` at 6, 5
- `publish-workflow` at 9, 5
- `pages-workflow` at 12, 5
- `pages` at 15, 5
- `reader` at 19, 5
- `engine` at 1, 10
- `generator` at 4, 10
- `explorer` at 7, 10
- `live-docs` at 10, 10
- `action` at 13, 10
- `scripts` at 16, 10
- `tests` at 19, 10
- `vscode-panel` at 10, 14
```

### C. The single file

The shape the owner has wished for since September 27: one HTML file that carries the engine, the generator and the Explorer, scans a folder in the browser, and writes a copy of itself to hand on. The file is a region holding the three packages, nested inside the repository that builds it.

```markdown
# Live Documentation

## Metadata
- Layer: 3

## Authored
### Purpose
This repository drawn as the single-file shape the owner has wished for since September 27: one HTML file that carries the engine, the generator and the Explorer, scans a folder in the browser, and writes a copy of itself to hand on.

### Notes
Candidate C of the T2 probe, 2026-10-10. The file is a region holding the three packages, inside the repository that builds it; the copy it writes and the people who open it are imagined. The site still hosts the file and the workflows still build it. Every wire to or from an imagined thing is declared by hand.

## Declared

### Things

#### `REPOSITORY`
- Kind: repository
- Holds: `FILE`, `scripts`, `tests`

#### `FILE`
- Kind: file
- Holds: `engine`, `generator`, `explorer`

#### `GITHUB`
- Kind: cloud
- Holds: `ci-workflow`, `pages-workflow`, `pages`

#### `engine`
- Kind: library
- From: `../../packages/engine`

#### `generator`
- Kind: library
- From: `../../packages/generator`

#### `explorer`
- Kind: web
- From: `../../packages/explorer`

#### `scripts`
- Kind: program
- From: `../../scripts`

#### `tests`
- Kind: tests
- From: `../../tests`

#### `ci-workflow`
- Kind: workflow

#### `pages-workflow`
- Kind: workflow

#### `pages`
- Kind: site
- Serves: `https://jfjordanfarr.github.io/Live-Documentation/` (address)

#### `author`
- Kind: person

#### `copy`
- Kind: copy

#### `colleague`
- Kind: person

#### `reader`
- Kind: person

### Connections
- `ci-workflow` to `scripts` over `npm run ci-check`
- `pages-workflow` to `scripts` over `npm run live-docs:visualize`
- `pages-workflow` to `pages` over `actions/deploy-pages`
- `reader` to `pages.https://jfjordanfarr.github.io/Live-Documentation/` over `browser`
- `author` to `explorer` over `a folder picked in the browser`
- `explorer` to `copy` over `save`
- `colleague` to `copy` over `opens it`

## Legend
- `repository` as grey
- `file` as violet
- `workflow` as cube
- `site` as sheet
- `copy` as sheet
- `tests` as sheet

## Layout
- `author` at 1, 5
- `ci-workflow` at 6, 5
- `pages-workflow` at 9, 5
- `pages` at 12, 5
- `reader` at 16, 5
- `engine` at 1, 10
- `generator` at 4, 10
- `explorer` at 7, 10
- `scripts` at 12, 10
- `tests` at 15, 10
- `copy` at 7, 15
- `colleague` at 12, 15
```

## What the join and the model said

All three boards parse and lint clean, join with nothing wanting, and build a model with nothing it could not draw.

| Board | Things | Pieces, of them imagined | Regions | Roads, of them declared | Words on the board at rest | Collisions at rest | Collisions under pins |
| ----- | ------ | ------------------------ | ------- | ----------------------- | -------------------------- | ------------------ | --------------------- |
| A     | 12     | 10, 4                    | 2       | 16, 4                   | 22                         | 0                  | 0 over five pins      |
| B     | 23     | 19, 14                   | 4       | 26, 16                  | 42                         | 0                  | 3 over eight pins     |
| C     | 15     | 12, 7                    | 3, one nested | 17, 7              | 27                         | 0                  | 0 over eight pins     |

The twelve wires from the docs are the same in every board, since the folders are the same: the four packages and the scripts and tests standing on one another, as the shipped board draws them. The `tests` thing carries eight doors and one ghost in every board, all of them from the sample programs and fixtures under `tests/integration/` (finding 8).

The three collisions, all in B under a pin: with `live-docs` pinned, its door labels "to explorer" and "to generator" over each other; with `their-site` pinned, the URL door label against the thing's name; with the `live-docs` to `engine` wire pinned, "from live-docs" against engine's "library · 102 files".

## What the pictures show

- [A at rest](delivery-shape/a-today-at-rest.png). The repository's six things in a grey region, the three imagined things in a blue GITHUB region, the reader a figure outside both. The workflows' declared wires run dashed and green through the air to `scripts` and to `pages`; the reader's to the site's address door. `cli` stands on engine and explorer and nothing touches it: the shell is a dead end on its own picture. [The site pinned](delivery-shape/a-today-site-pinned.png) reads "imagined: no folder yet", offers the address "declared", and is called by the workflow and the reader.
- [B at rest](delivery-shape/b-package-at-rest.png). Nineteen things in four regions, fourteen of them imagined, and it reads: everything passes through `live-docs`, the action and the panel call it, the owner's own Pages workflow uses the action it ships, the publish workflow reaches the registry's address, and a stranger's pipeline installs from the registry, uses the action, checks out their code and deploys their site, which a colleague and an agent read. [The package pinned](delivery-shape/b-package-pinned.png) says it calls engine, explorer and generator and is called by the action and the panel; its three door labels are the ones that collide.
- [C at rest](delivery-shape/c-file-at-rest.png). The violet FILE region sits inside the grey REPOSITORY region and holds the three packages; the author's wire comes down to the Explorer, the Explorer's goes out to the copy, the colleague's to the copy. [The FILE region pinned](delivery-shape/c-file-region-pinned.png) says only what it holds. The nested region draws, which no board had asked of the view before.

## Findings

1. **The view can draw a delivery shape with its unbuilt parts imagined.** Imagined things, declared doors, declared wires, a nested region and nineteen things on four regions all drew, with no join issue and no model issue in any board, and no word collided at rest. T1's build left the World Map untouched and it needed nothing for this.
2. **An imagined thing looks exactly like a real one.** Same solid, same shading, same shadow; the one sign is the small "imagined" under its name, and at the scale of B that word is the thing a reader skips. In the September 28 picture a thing is "a closed piece floating above the board", and the owner's October 3 sentence for the blank file is a node "asking you to point it to a directory". A promise and a fact should not be the same solid. The ghost already has the vocabulary: dashed. An imagined thing drawn hollow, its edges dashed and its faces unfilled, would tell the two apart at every scale, and fill in as its folder arrives.
3. **A declared door draws only where a wire lands.** `computeDoors` makes doors from roads, so a `Serves` promise with no connection to it is in the panel ("offers ... declared") and nowhere on the piece. In these boards every declared door had a wire, so nothing was lost here; a board for scenario 5, an imagined system whose doors are its whole point, would show blank walls.
4. **The grammar's door kinds do not name what a delivery shape offers.** A door is a route, an address or a database object, the kinds the docs publish. Of everything on these boards, only the site's URL and the registry's URL fit, as addresses. A package's binary and its commands, an action's `uses:` name, a panel's command, a file to double-click: none is a door kind, so every other declared wire landed on a door the join invents, "from pages-workflow", "from action", "from author". The picture then says who touches whom and over what, and never what the touched thing offers. Whether the delivery shape needs door kinds of its own, or whether "over" carries enough, is a question for the plan; it was not visible before a board tried to say it.
5. **There is no declared "stands on".** A declared connection is always a call in the air. `live-docs` importing the engine, the generator and the Explorer, which is standing on their code, drew as three calls with doors "from live-docs" on the libraries. The board's own distinction, a call through a door against one piece standing on another's code, cannot be written by hand; only the docs can say it. The gap is small and real.
6. **The join's issues never reach the viewer.** The model carries them, "what could not be drawn, in words", and the controller draws none of them; the CLI prints them under Wanting. A declared door nothing serves, a `From` with no docs, a connection between a thing and a region: a person at the site sees nothing missing. Headless and UI are peers by the standing rules, and here they are not.
7. **Entering an imagined thing does nothing, and says nothing.** `enter` returns when the piece has no folder. Right that there is nothing inside; wrong that the person is not told.
8. **The samples leak into the repository's picture.** `tests` serves `POST api/payments`, `CENTRAL.ACCOUNT`, two WCF addresses and four more, and calls out to a staging address as a ghost, because the estate sample and the queue-worker fixture live under `tests/integration/`. On a board of this repository that reads as the repository serving a payments route. The board can carve them: `programs` from `tests/integration/programs` and `fixtures` from `tests/integration/fixtures`, drawn as sheets, which is also what they are. The join cannot know a sample from a system, and should not; the person's carve says it.
9. **Labels under pins collide on a dense board, and region labels sit against pieces.** The door-label settling of 2026-10-10 holds A and C clean under every pin, and B collides three times, door labels against each other, a thing's name and a sub-line. Beside that, a region's name is drawn at its corner and lands against a piece's foot or sub-line in every board, REPOSITORY at engine's foot, GITHUB against explorer's "web · 138 files", which the audit cannot see because it measures words against words.
10. **Long door names run past their piece.** The site's address label extends beyond the sheet it is on; nothing cuts it, so the audit passes, and nothing shortens it either.
11. **A region's `Holds` is a claim the picture draws as fact.** C says the file holds the engine, the generator and the Explorer, and the picture agrees, because holding is always declared. That is the design: the board is the person's text. But it means C's picture hides C's whole cost, which is making those three packages run in a browser; and it means that for scenario 5 a region is the one kind of thing whose promise nothing will ever contradict.

## What each shape asks of the repository

The seven places the plan names, for each board, assuming the drawing defects above are fixed on their own.

- **A** asks nothing new of the grammar, the join, the bundle or the CLI. The board is re-authored; the three end-to-end specs that name `cli` for the zoom into a thing name another; the boards doc's "Measured against" and the vision's line that this board "is in question" are brought current. The CLI shell stays, drawn as the dead end it is.
- **B** asks the same of the grammar and the join, plus the build it draws: a `packages/live-docs` whose binary runs `generate`, `lint`, `inspect`, `board` and `visualize`, built from the engine, the generator and the Explorer, which is `scripts/live-docs/*.ts` moved and compiled; the CLI shell deleted; an action under `.github/actions/`; a publish workflow; the Pages workflow switched to the action. Each arrival turns an imagined thing real by one `From` line and leaves the picture otherwise alone, which is what the board is for. The workflows stay imagined until T4 says whether YAML is a source; if it does, their wires become evidence beside the declarations.
- **C** asks the most: the engine and the generator running in the browser, which means the TypeScript compiler and tree-sitter's WebAssembly without Node's file system, a folder picked in the browser, and the file writing a copy of itself with its docs inside, which is T6's traded file and scenario 10's blank file. The board can draw it today; the repository cannot build it soon.

## The reading

The three pictures differ only in what they imagine; everything real is drawn the same, and the view drew every one. So the World Map does what the October 8 reply hoped: it draws the delivery shape the owner intends before it exists, and each imagined thing is one `From` line away from being measured. That is the authoring surface the owner described on October 9, bolstered by evidence where there is any.

On the shape itself, read from the pictures and the owner's constants:

- A is true and says little. Its one lesson is on the picture: the CLI shell has no caller, and the site is what the repository delivers today.
- B is the picture of the October 8 advice and the owner's own December 2025 and February 2026 words, a standalone package with the extension as a thin wrapper, the static site's inputs being the CLI's outputs. The scenario the plan calls done, the estate at work, needs exactly this form: a pipeline that runs with no extension to install and no network call, and a bundle to hand over. Fourteen of nineteen things are imagined, which is honest: most of the shape is not built, and the board would say so on the site until it is.
- C is the stretch the plan already holds as T6 and scenario 10, the bundle that travels and the file that writes a blank copy; the self-scanning file beyond those is the one piece of the whole plan whose cost the picture hides.

The recommendation is B as the board, written now with its imagined things, so that the site shows the intended shape and the things fill as folders appear; the carve of the samples from finding 8 with it; and C kept where the plan has it, the traded bundle in T6, the self-scanning file in the fog. The decision is the owner's; the pictures are the information they asked for on October 8.

## What the build would contain, once the owner chooses

- The board re-authored as the chosen shape, with `programs` and `fixtures` carved from `tests`, its Notes carrying the question's history; the integration test over it unchanged in what it checks; the three specs that enter `cli` entering `generator`.
- Imagined things drawn hollow (finding 2), with pictures and a spec over the estate sample's board given one imagined thing.
- The viewer showing what the join found wanting (finding 6), in the panel of the thing or wire it concerns, so that headless and UI say the same.
- Entering an imagined thing told to the person (finding 7).
- The door-label settling and the region labels made to hold on a board as dense as B (finding 9), audited by the design audit over that board.
- The boards doc and the vision brought current; T2 closed in the plan with the owner's word in direction.md; findings 3, 4, 5, 10 and 11 written to the plan's fog, since each is a question the drawing made sharp enough to ask and none decides itself.
