# CLI Reference

_Current as of 2026-11-12._

## Metadata

- Layer: 1
- Guide Type: reference

Complete catalog of Live Documentation CLI commands for external adopters. All commands are invoked via `npm run <script> [-- <options>]`, from the root of this checkout. Every command prints its options on `--help` (as `npm run live-docs:inspect -- --help`), refuses an option it does not know on one line, and exits 1 when it fails. Each reads the configuration of the folder it works on, its `.live-docs.config.json`, unless `--config <file>` names another; without either it uses the defaults. In the examples, a word in angle brackets, such as `<folder>`, stands for your own value.

> **Note**: This reference covers user-facing commands. Contributor tooling (test suites, fixture management, audits) is in the [Internal Tooling Reference](../../layer-2/internal-tooling.mdmd.md).

---

## Live Documentation Suite

### Generation & Materialization

| Command                      | Purpose                                |
| ---------------------------- | -------------------------------------- |
| `npm run live-docs:generate` | Regenerate Live Docs for selected source files |

#### `live-docs:generate`

Scans your workspace, materializes the documentation mirror, and writes the graph index to `<root>/index.json`, which is derived from the docs and never committed.

```bash
# Preview changes without writing
npm run live-docs:generate -- --dry-run

# Check whether committed Live Docs match source, without writing
npm run live-docs:generate -- --check

# Regenerate all Live Docs
npm run live-docs:generate

# Regenerate only recently modified files
npm run live-docs:generate -- --changed

# Another folder, with a configuration file of your choosing
npm run live-docs:generate -- --workspace <folder> --config <file>
```

**Options:**
| Flag | Description |
|------|-------------|
| `--dry-run` | Preview without writing files |
| `--check` | Fail when a doc would be created, updated or deleted; leave docs and the derived index untouched |
| `--changed` | Only process Git-modified source files, using the full workspace for link resolution |
| `--include <pattern>` | Render an explicit file or glob subset using workspace-wide resolution context; repeat to include several |
| `--workspace <path>` | The folder to document (default: the current directory) |
| `--config <file>` | The configuration (default: the workspace's `.live-docs.config.json` when it has one) |

`--changed` requires Git status. If Git cannot report status, the command fails with the Git error; run full generation in a folder without Git. The file and symbol indexes still cover the full workspace, so a changed file can link to an unchanged provider. `--include` also uses full workspace context while rendering only its explicit subset.

`--dry-run` reports differences but succeeds. `--check` uses the same non-writing comparison and exits unsuccessfully when the mirror is stale. `npm run livedocs` regenerates then lints locally; `npm run ci-check` requests `--check` explicitly before verification, so CI checks the committed mirror rather than repairing it.

---

### Validation & Linting

| Command                  | Purpose                               |
| ------------------------ | ------------------------------------- |
| `npm run live-docs:lint` | Validate Live Doc structure and links |

#### `live-docs:lint`

Validates the structure of every generated doc and its links, and warns about what a person still has to write.

```bash
npm run live-docs:lint
npm run live-docs:lint -- --workspace <folder>
```

**What's Enforced:**

- Every doc parses under the Live Doc grammar; a refusal names the line
- Relative links only (no absolute paths)

**What's Warned About:**

- Authored `Purpose` or `Notes` still holding the placeholder text
- Files with no dependencies and no dependents, which usually means no adapter understood them

---

### Inspection & Pathfinding

| Command                     | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `npm run live-docs:inspect` | Query dependency paths and artifact metadata |
| `npm run live-docs:orphans` | Find Live Docs without corresponding sources |

#### `live-docs:inspect`

The "Oracle of Bacon" for code. Traces dependency chains through the Live Doc graph.

Every question starts from a file named by `--from`, except `--reachable` alone, `--groups` and `--between`. The examples name files of this repository.

```bash
# Find path between two files
npm run live-docs:inspect -- --from scripts/live-docs/generate.ts --to packages/engine/src/live-docs/core.ts

# Symbol-level pathfinding (a symbol needs --to)
npm run live-docs:inspect -- --from packages/generator/src/generator.ts#generateLiveDocs --to packages/engine/src/live-docs/core.ts#analyzeSourceFile

# Reverse lookup (who depends on this?)
npm run live-docs:inspect -- --from packages/engine/src/config/liveDocumentationConfig.ts --direction inbound

# Fan-out (what does this depend on?)
npm run live-docs:inspect -- --from packages/generator/src/generator.ts --direction outbound

# Bidirectional search between two files
npm run live-docs:inspect -- --from packages/generator/src/generator.ts --to packages/generator/src/generator.test.ts --direction both

# Everything a path reaches from a file, nearest first, both ways
npm run live-docs:inspect -- --from packages/generator/src/generator.ts --reachable --direction both

# The entry points, what they reach, what nothing reaches, and what only a test reaches
npm run live-docs:inspect -- --reachable

# Machine-readable output
npm run live-docs:inspect -- --from scripts/live-docs/generate.ts --to packages/engine/src/live-docs/core.ts --json
```

**Options:**
| Flag | Description |
|------|-------------|
| `--from <path[#symbol]>` | Starting artifact; a symbol needs `--to` |
| `--to <path[#symbol]>` | Destination artifact |
| `--reachable` | List every file a path reaches from `--from`, nearest first, with its hops; without `--from`, the entry points the docs declare, what they reach, what nothing reaches and what only a test reaches |
| `--groups` | List the disconnected groups of files in the graph. |
| `--at <commit>` | Inspect the generated historical graph at a commit, with `--from` or `--reachable`. |
| `--between <a> <b>` | Compare two recorded historical graphs. |
| `--direction <outbound\|inbound\|both>` | Traversal direction (default: `outbound`); `both` with `--to` or `--reachable` |
| `--max-depth <n>` | Maximum hops (default: 25) |
| `--json` | Machine-readable output |
| `--verbose` | Include additional diagnostics |
| `--workspace <path>` | The folder whose docs to read (default: the current directory) |
| `--config <file>` | The configuration (default: the workspace's `.live-docs.config.json` when it has one) |

`--groups` describes today's entire graph and does not combine with path, reachability or history selectors. Historical inspection supports a file's wires or entry reachability at one commit, and changes between commits; `--at` and `--between` do not accept `--to` or `--direction`. `--between` also takes no `--from` or `--reachable`.

---

### History

`npm run live-docs:history -- [--every <n>] [--since <date>] [--step commit|day|week|tag] [--jobs <n>]` regenerates sampled mainline commits under one lens into `<root>/history/history.json`, with a cache beside it. `--every` applies only to commit sampling. A repeat run builds only the missing cache entries. The output is derived and never committed; its directory ignores itself. Use the inspection flags above to ask about a recorded commit or compare two of them.

### Boards

`npm run live-docs:board -- <board.md>` reads a board, validates it, joins it to the Live Docs, and prints its things, doors, wires and their bases. Without `<board.md>` it reads the board the configuration names as `board`; `npm run live-docs:board` reads this repository's own, `.mdmd/layer-3/board.mdmd.md`. The visualization command draws the same board as the World Map.

### Visualization

| Command                       | Purpose                      |
| ----------------------------- | ---------------------------- |
| `npm run live-docs:visualize` | Build static Explorer bundle |

#### `live-docs:visualize`

Builds a self-contained static Explorer bundle: the Local Map with explicit 2D and 3D representations, Knowledge Sources, and the World Map when a board is given. Deployable to GitHub Pages or any static host. The folder must be served, for example by `npx http-server dist/explorer -a 127.0.0.1 -p 8766 -c-1`: a page opened as a file cannot load its data. See [Visualizing Your Codebase](visualizing-codebase.mdmd.md).

The World Map is drawn from the board the configuration names as `board`, this repository's `.mdmd/layer-3/board.mdmd.md`, unless `--board` names another; a folder whose configuration names none gets an Explorer without a World Map.

```bash
npm run live-docs:visualize -- --output ./public --pretty
npm run live-docs:visualize -- --workspace <folder>
```

**Options:**
| Flag | Description |
|------|-------------|
| `--workspace <path>` | The folder whose docs to read (default: the current directory) |
| `--output <dir>` | Output directory (default: `dist/explorer/`) |
| `--config <file>` | The configuration (default: the workspace's `.live-docs.config.json` when it has one) |
| `--board <file>` | A board file (see `live-docs:board`) to draw the World Map from, in place of the configuration's `board`; the bundle then opens on it |
| `--history none\|all\|since <date>\|last <n>` | Choose how much generated history is included in the Explorer bundle. |
| `--pretty` | Pretty-print JSON for debugging |

---

## Related Guides

- [Getting Started](getting-started.mdmd.md) — Installation and first session
- [Tracing Impact](tracing-impact.mdmd.md) — Dependency pathfinding in depth
- [Visualizing Your Codebase](visualizing-codebase.mdmd.md) — Explorer features
