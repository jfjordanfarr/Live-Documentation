# Live Documentation: the grammar, the CLI, the Explorer's addresses

Read with [SKILL.md](SKILL.md). Everything here is derived from the engine's grammar ([document.ts](../../../.mdmd/layer-4/packages/engine/src/live-docs/document.ts.mdmd.md)) and the CLI's own help; when they disagree with this page, they win.

## A Live Doc, section by section

````markdown
# path/to/file.ts

## Metadata
- Layer: 4
- Archetype: implementation          (or test, sample, asset, ...)
- Code Path: path/to/file.ts
- Entry: command `build` of [`package.json`](../package.json.md)   (zero or more Entry lines)
- Generated At: 2026-10-15T15:49:39.824Z

## Authored
### Purpose
Written by a person: what the file is for.
### Notes
- Written by a person: what a maintainer must know, with links to the chat record where an origin explains.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Name` {#symbol-name}
- Type: function                      (type, class, interface, route, table, procedure, address, ...)
- Source: [source](../../path/to/file.ts#L19)
##### `Name` — Summary
The symbol's docstring, when it has one.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph.GraphFile`](./graph.ts.md#symbol-graphfile) (type-only)     resolved to a file and a symbol
- [`CENTRAL.ACCOUNT`](../Oracle/CENTRAL.ACCOUNT.sql.md#symbol-centralaccount) (contract)
- `net.tcp://payments-staging.example:8732/PaymentService` (configuration)   nothing in the workspace serves it
- `lodash`                                                                   an external package
<!-- LIVE-DOC:END Dependencies -->
````

- **Entry lines**, one per reason something outside the code starts the file: `program` (the language's entry point, naming the symbol when there is one), `command` (a manifest script or binary runs it, naming the script and linking the manifest), `module` (a manifest's main module), `opening` (a route, address, procedure, table or view the file serves, linking the symbol), `tooling` (a manifest or a compiler or runner configuration), `declared` (named in the configuration's `entryPoints`). A test is an entry by `Archetype: test` and carries no line.
- **Dependency qualifiers**: none for an import or a type usage within a folder; `(type-only)` when only types are used; `(contract)` when both sides carry the same route, procedure or table name; `(configuration)` when both sides carry the same address; `(declared)` when a person drew the edge on the board.
- **Re-Exported Symbol Anchors**: a third generated section, present only when the file re-exports symbols that live elsewhere, so that a link to the re-export lands on the origin.
- A `LIVE-DOC:BEGIN` … `LIVE-DOC:END` region is never edited by hand; the parser refuses anything outside the grammar.

## The graph behind the docs

`<root>/index.json` (gitignored, derived from the docs on every run of the generator) holds every doc's parsed model, every dependency resolved to the file it lands on, and each file's `inbound` and `outbound` adjacency. The CLI and the Explorer read it; so may you, for a question the CLI does not ask.

## The CLI

`npm run live-docs:inspect -- [options]`, from the repository root:

| Option | Meaning |
| --- | --- |
| `--from <path>` | The start; `path#Symbol` for a symbol-level search |
| `--to <path>` | The target; omit to list the terminal paths from `--from` |
| `--reachable` | Every file a path reaches from `--from`, nearest first, with its hops; without `--from`, the entry points, what they reach, what nothing reaches, what only a test reaches |
| `--direction outbound\|inbound\|both` | Outbound (default) follows what a file depends on; inbound what depends on it; both only with `--to` or `--reachable` |
| `--max-depth <n>` | Default 25 |
| `--json` | Data instead of text |
| `--verbose` | Full symbol lists |
| `--config <file>`, `--workspace <path>`, `--root`, `--base-layer`, `--extension` | Where the docs are, when not the current workspace's configuration |

The JSON of `--reachable` without `--from`: `{ kind: "reachable", maxDepth, from: "entries", starts: [{ codePath, entries, test }], reached: [{ codePath, hops }], unreachable: [codePath], unread: [codePath], testsOnly: [codePath] }`, where `unread` holds the files nothing reaches whose kind no reader handles yet (a workflow, a shell script), which are not dead code. Other commands: run with `--json` once and read the shape.

Other commands: `npm run live-docs:generate` (regenerate the docs and the graph; `--dry-run` reports drift, `--changed` limits scope), `npm run live-docs:lint` (structural and link checks on the docs), `npm run live-docs:visualize` (build the static Explorer into `dist/explorer/`), `npm run live-docs:board -- <board.md>` (read a board of systems and join it to the docs).

## The Explorer's addresses

Served from `dist/explorer/` (for example `npx http-server dist/explorer -p 8766 -c-1`):

| Address | Opens |
| --- | --- |
| `/?view=sources` | Knowledge Sources: the bundle's shape, most used and most using, the entry points with "Reachable from", what nothing reaches, what only tests reach, the unreferenced symbols, and the downloads |
| `/?view=local&node=<path>` | The Local Map with that file pinned, its neighbourhood laid out |
| `/?view=local&dir=<path>` | The Local Map with that directory opened |
| `/?view=local&mode=3d&node=<path>` | The same in the three-dimensional perspective |
| `/?view=world` | The World Map, when the bundle carries a board |
| `/?s=…` | A share link the Explorer writes: every pin, the perspective and the destination |

The search field at the top of every view finds directories, files and symbols and pins what it finds; once anything is pinned, the destination field beside it offers only what a path from the newest pin reaches.
