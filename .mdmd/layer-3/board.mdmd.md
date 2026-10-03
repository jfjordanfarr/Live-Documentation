# Live Documentation

## Metadata
- Layer: 3

## Authored
### Purpose
This repository as a board: its packages, scripts and tests as things, drawn from its own docs, so that the tool is its own first estate.

### Notes
Written by hand on 2026-09-28 as the first board of this repository. Positions wait for the World Map; nothing places the things yet. Read it with `npm run live-docs:board -- .mdmd/layer-3/board.mdmd.md`, and the integration tests keep it valid against the docs.

On 2026-10-02 the owner questioned this board as an estate: "it's unusual to me that the 'estate' of Live Documentation is basically just its major directories. Uhhh that's all _inside_ the system of Live Documentation, no?" The repository, its static site and the workflow that deploys it were offered as a more plausible example, not approved. Asked on 2026-10-03 whether to re-author it: "should yaml workflow files help define the estate? ... That is unsolved in terms of how we want it to look." Until that is decided, this board stands as the sample that exercises the World Map over this repository's own docs.

## Declared

### Things

#### `PRODUCT`
- Kind: packages
- Holds: `engine`, `explorer`, `generator`, `cli`

#### `engine`
- Kind: library
- From: `../../packages/engine`

#### `explorer`
- Kind: web
- From: `../../packages/explorer`

#### `generator`
- Kind: library
- From: `../../packages/generator`

#### `cli`
- Kind: program
- From: `../../packages/cli`

#### `scripts`
- Kind: program
- From: `../../scripts`

#### `tests`
- Kind: tests
- From: `../../tests`

### Connections
_No connections declared_

## Legend
- `packages` as grey
- `tests` as sheet
