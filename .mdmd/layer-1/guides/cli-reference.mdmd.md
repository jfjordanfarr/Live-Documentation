# CLI Reference

_Current as of 2026-11-19._

## Metadata

- Layer: 1
- Guide Type: reference

Complete catalog of Live Documentation CLI commands for external adopters. All commands are invoked via `npm run <script> [-- <options>]`, from the root of this checkout, or from any other folder as `npm --prefix <checkout> run <script> [-- <options>]`. A path you type is taken from the folder you run the command from, though npm runs the script itself in the checkout. With no `--workspace`, a command works on the nearest folder, from there up, that holds a `.live-docs.config.json`, as git finds a repository, and on the folder itself when none does: run from `scripts/` in this checkout, `npm run live-docs:generate` maps the whole checkout. Every command prints its options on `--help` (as `npm run live-docs:inspect -- --help`), refuses an option it does not know on one line, and exits 1 when it fails. A failure is said in a line; run the same command again with `--stack`, which every command takes, to see where it failed and what caused it. Each reads the configuration of the folder it works on, its `.live-docs.config.json`, unless `--config <file>` names another; without either it uses the defaults. In the examples, a word in angle brackets, such as `<folder>`, stands for your own value.

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
| `--workspace <path>` | The folder to document (default: the nearest folder, from the current directory up, that holds a `.live-docs.config.json`; else the current directory) |
| `--config <file>` | The configuration (default: the workspace's `.live-docs.config.json` when it has one) |

`--changed` requires Git status. If Git cannot report status, the command fails with the Git error; run full generation in a folder without Git. The file and symbol indexes still cover the full workspace, so a changed file can link to an unchanged provider. `--include` also uses full workspace context while rendering only its explicit subset.

In a git repository, what git ignores is left out, by git's own word: every `.gitignore`, `.git/info/exclude` and the global excludes file. When git cannot be asked, because it is not on the path or refuses a folder whose owner it does not trust, the run warns, and only the folder's own `.gitignore` is read, so that what the others hide, a .NET project's `bin/` and `obj/` among it, gets docs unless the configuration's `exclude` names it. Outside a repository the run says that only that `.gitignore` and `exclude` are read.

Every run ends by naming the kinds of file no reader reads, with how many of each, as `Not read, so their docs hold no symbols or links: 87 .vb, 5 .sln`: each such file still gets a doc, saying only that it is there, so the map does not show what those files use or offer. Pictures, fonts and recordings are not counted, since they hold nothing to read.

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
| `--at <commit>` | Inspect the generated historical graph at a commit: with `--from`, the file's symbols, dependency lines and links that day; with `--from` and `--to`, the links between two files or two symbols (`path#Symbol`); with `--reachable`, the walk from that commit's entries. |
| `--words` | With `--at` and `--from`, the file's words that day: its authored block and each symbol's description, or why they cannot be read. |
| `--between <a> <b>` | Compare two recorded historical graphs. |
| `--direction <outbound\|inbound\|both>` | Traversal direction (default: `outbound`); `both` with `--to` or `--reachable` |
| `--max-depth <n>` | Maximum hops (default: 25) |
| `--json` | Machine-readable output |
| `--verbose` | Include additional diagnostics |
| `--workspace <path>` | The folder whose docs to read (default: the nearest folder, from the current directory up, that holds a `.live-docs.config.json`; else the current directory) |
| `--config <file>` | The configuration (default: the workspace's `.live-docs.config.json` when it has one) |

`--groups` describes today's entire graph and does not combine with path, reachability or history selectors. Historical inspection supports a file's rows and wires, the links between two files or symbols, a file's words, or entry reachability at one commit, and changes between commits; `--at` and `--between` do not accept `--direction`, and only `--at` takes `--to`. `--between` also takes no `--from` or `--reachable`. A doc that stood at a commit in a form today's reader finds no authored block in, as this repository's mirror before 2026-09-27, prints its words as not readable rather than as the generator's placeholder.

---

### History

`npm run live-docs:history -- [--every <n>] [--since <date>] [--step commit|day|week|tag] [--jobs <n>] [--remove-superseded] [--check-head] [--rederive] [--stop-after <minutes>]` regenerates sampled mainline commits under one lens into `<root>/history/history.json`, with a cache beside it and the words of every step in a `<root>/history/history-words-<hash>/` folder the sequence names. `--every` applies only to commit sampling. A repeat run builds only the missing cache entries, and summarizes again a commit whose cached summary does not read where the run reads it, or that first named a text the store lacks or holds changed; every text is read at every run. When the line has only grown since the last run, and the lens, the code that reads summaries into the sequence, git's version and the configuration are the same, it goes on from the sequence the last run wrote, recorded beside it in `<root>/history/history-resume.json`, and writes the bytes a whole derivation would. The code is every file of the engine and the generator but a test, so any commit that touches either package derives every step once at the next run; a repository that only uses the tool goes on every time. A record that is not whole and sound is not believed, and a run that meets damage it cannot mend by summarizing again derives every step instead, once; either way it says so. That is a trade: such a run reads only the last written commit's summary and the new ones, so a damaged older summary is found and summarized again at the next whole derivation, not at once, while the sequence already written stays right, since it was made when those summaries read and the record holds it to its own hash. `--rederive` derives every step again, reading every summary. Without `--jobs` the pool is as many processes as half the memory the process may use holds at the peak one was measured to take on this repository, at most one fewer than the processors it may run on. Every run lists the cache folders of other lenses with their sizes; `--remove-superseded` removes them: while the current lens is being filled it keeps only the newest lens a whole history was written from, and removes that too once the current lens holds every sampled commit. `--check-head` holds the last commit's rows, words and links to the Live Docs committed there and fails where they differ, comparing no file the last commit's tree did not hold (below), which it names with why; without it the check applies only when this generator runs unmodified from the commit the history ends at, and the output says when it was skipped and why. `--stop-after` starts no commit after that many minutes; a run stopped so writes no history, keeps what it summarized for the next run, and exits with code 3. One run at a time writes under a history folder. An entry a commit's tree does not hold is not read at that commit: a symbolic link that leads to no file of the tree (a link to a file is read as a copy of it), a name this disk cannot hold or another name standing where it goes, or a name that is not UTF-8. The run prints each, and lists them all in `<root>/history/unwritten.txt`, a line each with the commit, the path and the reason. A file the generator could not map at a commit is named in that commit's summary with the reason, and warned once with the number of commits that gave it; a doc committed for it never stands in for it. Commits are summarized by a pool of worker processes, each started once and given runs of consecutive commits one at a time, keeping its commit's tree from one commit to the next and touching only what differs; a commit holding a file nested deeper than the reading depth, a file the generator could not map, or one on which the parser's runtime faulted is summarized by a fresh process, which costs that commit the time a fresh process takes, and the run says so for each such commit and counts them by reason in its last lines; a file that failed for a cause of the machine's (too many open files, a full disk) is tried once more in a fresh process, and the run stops, naming the commit, the file and the error, if it fails again; to give them a larger heap for a large repository, raise node's as usual, `NODE_OPTIONS=--max-old-space-size=8192 npm run live-docs:history`, which the history carries to those processes and no other option of `NODE_OPTIONS`. The output is derived and never committed; its directory ignores itself. Use the inspection flags above to ask about a recorded commit or compare two of them.

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
| `--workspace <path>` | The folder whose docs to read (default: the nearest folder, from the current directory up, that holds a `.live-docs.config.json`; else the current directory) |
| `--output <dir>` | Output directory (default: `dist/explorer/` in this checkout, whichever folder is mapped) |
| `--config <file>` | The configuration (default: the workspace's `.live-docs.config.json` when it has one) |
| `--board <file>` | A board file (see `live-docs:board`) to draw the World Map from, in place of the configuration's `board`; the bundle then opens on it |
| `--history none\|all\|since <date>\|last <n>` | Choose how much generated history is included in the Explorer bundle. |
| `--pretty` | Pretty-print JSON for debugging |

---

## Related Guides

- [Getting Started](getting-started.mdmd.md) — Installation and first session
- [Tracing Impact](tracing-impact.mdmd.md) — Dependency pathfinding in depth
- [Visualizing Your Codebase](visualizing-codebase.mdmd.md) — Explorer features
