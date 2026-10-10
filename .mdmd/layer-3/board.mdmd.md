# Live Documentation

## Metadata
- Layer: 3

## Authored
### Purpose
This repository as the estate it is meant to be: the parts that exist, drawn from their docs, and beside them the delivery shape chosen on 2026-10-10, drawn as imagined things until each is built. One published package whose binary runs the commands, and everything else wrapping it: an action that runs the package, a panel that bundles it, the workflows that check, publish and deploy, the site the owner's workflow publishes, and the registry the package is published to. The tool's own site shows the intended shape, and each imagined thing fills in as its folder appears.

### Notes
Written by hand on 2026-09-28 as the first board of this repository, its things then its major directories. On 2026-10-02 the owner questioned that as an estate: "it's unusual to me that the 'estate' of Live Documentation is basically just its major directories. Uhhh that's all _inside_ the system of Live Documentation, no? ... I could maybe understand designing the 'estate' 'world map' of Live Documentation to include the repo and the static site address and the workflow to deploy it maybe?" On 2026-10-08 they said the delivery shape of the software had been undecided for the project's whole life and that this board must draw it. On 2026-10-10 a probe drew three candidate shapes over the repository's own docs ([the record](../../AI-Agent-Workspace/Probes/2026-10-10/delivery-shape.md)) and the owner chose the package first: "Authoring with the intended final shape is a sensible use of the World Map canvas." Trimmed at their word to things that are, or will be, directories of interconnected files: "A colleague is not a pseudo-directory to one day be populated with interconnected files. Meanwhile, a deployment target of almost any kind _is_ a directory populated with interconnected files."

What exists comes from the docs: the engine, the generator and the Explorer under `packages/`, the scripts, the tests, and the sample programs and fixtures the tests run over, carved from `tests/` so that their routes and tables are not read as this repository's. What is imagined has no `From`: the `live-docs` package, the action that runs it, the panel that wraps it, the three workflows, the Pages site and the registry. Every wire to or from an imagined thing is declared, with the command or mechanism it runs over, and becomes evidence when the folder arrives, or when ticket T4 of the World Map's plan decides whether workflow files are a source. The CLI shell under `packages/cli` is not the package and is not on the board. Read the board with `npm run live-docs:board -- .mdmd/layer-3/board.mdmd.md`; the integration tests keep it valid against the docs, and the World Map's specs draw it.

## Declared

### Things

#### `REPOSITORY`
- Kind: repository
- Holds: `engine`, `generator`, `explorer`, `live-docs`, `action`, `vscode-panel`, `scripts`, `tests`, `programs`, `fixtures`

#### `GITHUB`
- Kind: cloud
- Holds: `publish-workflow`, `ci-workflow`, `pages-workflow`, `pages`

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

#### `vscode-panel`
- Kind: extension

#### `scripts`
- Kind: program
- From: `../../scripts`

#### `tests`
- Kind: tests
- From: `../../tests`

#### `programs`
- Kind: samples
- From: `../../tests/integration/programs`

#### `fixtures`
- Kind: samples
- From: `../../tests/integration/fixtures`

#### `publish-workflow`
- Kind: workflow

#### `ci-workflow`
- Kind: workflow

#### `pages-workflow`
- Kind: workflow

#### `pages`
- Kind: site
- Serves: `https://jfjordanfarr.github.io/Live-Documentation/` (address)

#### `registry`
- Kind: registry
- Serves: `https://registry.npmjs.org/live-docs` (address)

### Connections
- `live-docs` to `engine` over `import`
- `live-docs` to `generator` over `import`
- `live-docs` to `explorer` over `import`
- `action` to `live-docs` over `npx live-docs`
- `vscode-panel` to `live-docs` over `bundled`
- `publish-workflow` to `registry.https://registry.npmjs.org/live-docs` over `npm publish`
- `ci-workflow` to `scripts` over `npm run ci-check`
- `pages-workflow` to `action` over `uses`
- `pages-workflow` to `pages` over `actions/deploy-pages`

## Legend
- `repository` as grey
- `registry` as cloud
- `workflow` as cube
- `action` as cube
- `package` as tile
- `extension` as tile
- `site` as sheet
- `tests` as sheet
- `samples` as sheet

## Layout
- `registry` at 2, 3
- `publish-workflow` at 8, 3
- `ci-workflow` at 12, 3
- `pages-workflow` at 16, 3
- `pages` at 20, 3
- `vscode-panel` at 3, 8
- `live-docs` at 7, 8
- `action` at 11, 8
- `engine` at 3, 13
- `generator` at 7, 13
- `explorer` at 11, 13
- `scripts` at 15, 13
- `tests` at 19, 13
- `programs` at 23, 13
- `fixtures` at 27, 13
