# CLI Reference

_Current as of 2026-11-22._

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

In a git repository, what git ignores is left out, by git's own word: git's listing of what it ignores (`git ls-files --others --ignored --exclude-standard --directory`) is read as it stands, so every `.gitignore` counts, one that sparse checkout keeps off the disk among them, and `.git/info/exclude` and the global excludes file, with a tracked file never left out and names matched in case as git matches them. A file inside a submodule or a nested repository is judged by that repository's own git, by its own `.gitignore` files and `.git/info/exclude`, and what it tracks is never left out; the outer repository decides only whether the nested repository's folder is left out whole. Whether a folder that holds a `.git` is another repository is git's own word, asked of the repository around it: one whose `.git` names no repository, or below which the outer repository tracks a file in whatever case, is the outer repository's own. Git judges no file reached through a link to a folder: such a file is left out when git ignores the link or a folder it lies in, judged by the linked repository when git, asked in the linked folder, says it is that repository's top, and otherwise (a plain folder, or one in the middle of a repository, whether it holds no `.git` or one git climbs past) only the folder's own `.gitignore` is read for it, and the run warns; so too for a file in a nested repository whose git refuses to answer, for an owner it does not trust, a configuration it cannot read or a work tree elsewhere, and in a folder holding a `.git` of which git says nothing. For such a file the warning says what it may cost: a file its repository ignores may get a doc, and a file its repository tracks may be left out by that `.gitignore`. When git cannot be asked at all, because it is not on the path, refuses a folder whose owner it does not trust, finds the folder outside its work tree, or its listing fails in any other way, before the walk or after it, the run warns and says why in git's own words, the whole folder is walked, and only the folder's own `.gitignore` is read, so that what the others hide, a .NET project's `bin/` and `obj/` among it, gets docs unless the configuration's `exclude` names it, and a file the repository tracks may be left out. Outside a repository, where no `.git` lies in the folder or above it and `GIT_DIR` names none, nothing is left unwalked, and the run says that only that `.gitignore` and `exclude` are read, but each folder in it that holds a `.git`, a folder of several clones scanned as one, is asked directly, as a link to a repository's top is, and judges its own files by its own git; a file outside every repository is judged by that `.gitignore`, with nothing to warn of. A stale `GIT_DIR`, a `GIT_CEILING_DIRECTORIES` that hides the repository, or a `.git` above that names no repository is warned of instead. A folder the walk cannot read (permission denied, too many open files) is passed over where its files would have been left out, because its own repository's git ignores it (a database's volume a clone's `.gitignore` names, say) or `exclude` names everything in it; any other stops the run, for the scan cannot tell that everything in it would be left out (git cannot read the folder either, so a `.gitignore` rule for its contents, `cache/*`, never names it), naming the folder and the system's reason and the three ways past it: make it readable, have git ignore the folder itself (`cache/`), or name `cache/**` in `exclude` (`cache`, `cache/` and `cache/*` there leave paths below it unnamed, and `**/cache/**` cannot match a top-level `cache`, since `**` stands for one or more characters). A folder gone before it is read, or a link that loops or passes through a file, holds nothing to document. In a folder of clones, a clone below a folder whose own `.git` git refuses is still asked of its own files; only the files outside every clone that answers are unjudged and warned of.

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

Each doc is reported in the order of its path, so the same docs give the same report every run.

---

### Inspection & Pathfinding

| Command                     | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `npm run live-docs:inspect` | Query dependency paths and artifact metadata |
| `npm run live-docs:orphans` | Find Live Docs without corresponding sources |

#### `live-docs:orphans`

Lists the Live Docs whose source file no longer exists, reading the docs where the configuration puts them (its `root`, `baseLayer` and `extension`; `--root`, `--base-layer` and `--extension` stand in for them), and exits 1 when there is one. The generator never deletes a doc with authored content, so run it after deleting source files.

#### `live-docs:inspect`

The "Oracle of Bacon" for code. Traces dependency chains through the Live Doc graph.

Every question starts from a file named by `--from`, except `--reachable` alone, `--groups` and `--between`. The examples name files of this repository.

```bash
# Find path between two files
npm run live-docs:inspect -- --from scripts/live-docs/generate.ts --to packages/engine/src/live-docs/core.ts

# Symbol-level pathfinding (a symbol needs --to)
npm run live-docs:inspect -- --from packages/generator/src/generator.ts#generateLiveDocs --to packages/engine/src/live-docs/core.ts#analyzeSourceFile

# The files that use this one directly, counted
npm run live-docs:inspect -- --from packages/engine/src/config/liveDocumentationConfig.ts --direction inbound

# The files this one uses directly, counted
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
| `--from <path[#symbol]>` | Starting artifact: a file, or a directory standing for every file under it; a symbol needs `--to` |
| `--to <path[#symbol]>` | Destination artifact: a file, or a directory standing for every file under it |
| `--reachable` | List every file a path reaches from `--from`, nearest first, with its hops; without `--from`, the entry points the docs declare, what they reach, what nothing reaches and what only a test reaches |
| `--groups` | List the disconnected groups of files in the graph. |
| `--at <commit>` | Inspect the generated historical graph at a commit: with `--from`, the file's symbols, dependency lines and links that day; with `--from` and `--to`, the links between two files or two symbols (`path#Symbol`); with `--reachable`, the walk from that commit's entries. |
| `--words` | With `--at` and `--from`, the file's words that day: its authored block and each symbol's description, or why they cannot be read. |
| `--between <a> <b>` | Compare two recorded historical graphs. |
| `--direction <outbound\|inbound\|both>` | Traversal direction (default: `outbound`) |
| `--max-depth <n>` | Maximum hops (default: 25) |
| `--json` | Machine-readable output |
| `--verbose` | Include additional diagnostics |
| `--workspace <path>` | The folder whose docs to read (default: the nearest folder, from the current directory up, that holds a `.live-docs.config.json`; else the current directory) |
| `--config <file>` | The configuration (default: the workspace's `.live-docs.config.json` when it has one) |

With `--from` alone, a file's direct neighbours each way asked are listed by path and counted, at most 200 a way with the number left out said (until 2026-11-22 it printed every terminal path whole). After them, under headings of their own, come the declarations the file's documentation names (`Derived (permission) in App/Derived.cs`, the element's word where there is one) and the files whose documentation names it, each counted and cut at 200 the same way, and in `--json` as `documentation.names` and `documentation.namedBy`. That relation is the author's word and never a use: `--reachable`, a path and the unreachable list do not follow it. The Explorer does not draw it yet. When a path runs both ways between two ends, the one told is the one along what `--from` uses, sought first, since that is how a person tells a request. A directory as `--from` or `--to` (with or without its closing slash, in any case, and `.` or `./` for the scan root) stands for every file under it, as the Explorer's path ends do: the nearest file under it answers; when one end holds the other, the path runs between the inner end and the rest of the outer, and the first line ends by naming the ends as asked wherever they are not the files that answered (`; asked to PaymentService/`, `; asked from src/ without src/b.ts`); in `--json` every path, one way or both, carries `asked` (`from`, `to`, and `narrowed`: the end taken without the other, or `same`) beside the files that answered. With `--direction both`, a way that finds nothing says only what that walk tested: forward, that `--from` does not use `--to` directly or through other files; reverse, that `--to` does not use `--from` (`No file of Contracts/ uses a file of PaymentService/, directly or through other files.`); two ends that are the same, a file or a directory, are no path (`No path runs between src/ and src/: the two ends are the same.`), nor is a symbol to itself or to its own file; between nested ends every denial is worded from the ends the walk took (`No file of src/ outside src/lone/ uses a file of src/lone/`, `…, nor the other way; src/ taken without src/lone/.`); a directory named in another case is the one directory that answers, named back as it is spelled, and when two answer the command refuses and names both; and `--reachable` from a directory lists what any of its files reaches, its own files left out. A directory alone, with neither, is refused in one line. A route between two files is found whichever way the dependency runs and told as asked, from `--from` to `--to`, its first line saying which relation each step is: `Path from A to B, 11 hop(s): each file uses the next.`, or, where the dependency runs from `--to` back to `--from`, `… each file is used by the next.`, and each step after it in the same words (`1. A is used by C`). `--json` says the same as `direction` (`outbound` or `inbound`, the way the walk ran) and `each` (`uses` or `is used by`). A route is the shortest chain of dependencies, not the order in which code runs. With `--direction outbound` or `inbound` the search keeps to that way, and when no path runs so the answer is one line that gives the command for the way back (`No path runs from A to B (outbound); one runs the other way, 11 hop(s): npm run live-docs:inspect -- --from B --to A`). A route that runs neither way is one line too, `No path runs between A and B, either way.`; both exit 1, and `--json` keeps the walk's frontier.

`--groups` describes today's entire graph and does not combine with path, reachability or history selectors. Historical inspection supports a file's rows and wires, the links between two files or symbols, a file's words, or entry reachability at one commit, and changes between commits; `--at` and `--between` do not accept `--direction`, and only `--at` takes `--to`. `--between` also takes no `--from` or `--reachable`. A doc that stood at a commit in a form today's reader finds no authored block in, as this repository's mirror before 2026-09-27, prints its words as not readable rather than as the generator's placeholder.

---

### History

`npm run live-docs:history -- [--every <n>] [--since <date>] [--step commit|day|week|tag] [--jobs <n>] [--keep-workers] [--remove-superseded] [--check-head] [--rederive] [--stop-after <minutes>]` regenerates sampled mainline commits under one lens into `<root>/history/history.json`, with a cache beside it and the words of every step in a `<root>/history/history-words-<hash>/` folder the sequence names. `--every` applies only to commit sampling. The cache is kept per lens, whose key holds the configuration, the code that makes a summary and, of this repository's `package-lock.json`, only the entries of the packages that code loads, so that a tool no summary loads, pinned or bumped (the browser tests' Playwright, a linter), usually keeps the cache (a bump that moves a package the engine shares to another place in `node_modules` still moves the key, which costs a rebuild and is never unsafe); an installation that differs from the lock in those entries, after a pull without `npm ci`, is kept under a key of its own; Node's own version is outside the key but for its version of Unicode, so an upgrade of the runtime alone keeps it too. A repeat run builds only the missing cache entries, and summarizes again a commit whose cached summary does not read where the run reads it, or that first named a text the store lacks or holds changed; every text is read at every run. When the line has only grown since the last run, and the lens, the code that reads summaries into the sequence, git's version and the configuration are the same, it goes on from the sequence the last run wrote, recorded beside it in `<root>/history/history-resume.json`, and writes the bytes a whole derivation would. The code is every file of the engine and the generator but a test, with the same entries of the lock, so any commit that touches either package derives every step once at the next run; a repository that only uses the tool goes on every time. A record that is not whole and sound is not believed, and a run that meets damage it cannot mend by summarizing again derives every step instead, once; either way it says so. That is a trade: such a run reads only the last written commit's summary and the new ones, so a damaged older summary is found and summarized again at the next whole derivation, not at once, while the sequence already written stays right, since it was made when those summaries read and the record holds it to its own hash. `--rederive` derives every step again, reading every summary. Without `--jobs` the pool is as many processes as half the memory the process may use holds at the peak one was measured to take on this repository, at most one fewer than the processors it may run on. Every run lists the cache folders of other lenses with their sizes; `--remove-superseded` removes them: while the current lens is being filled it keeps only the newest lens a whole history was written from, and removes that too once the current lens holds every sampled commit. The same code's lens under the other way of running workers (with `--keep-workers` or without) is never removed, since neither way supersedes the other; every run lists it as kept, with its size, in words of its own. `--check-head` holds the last commit's rows, words and links to the Live Docs committed there and fails where they differ, comparing no file the history did not read at the last commit (below: an entry its tree did not hold, or a file the generator could not map), which it names with why; without it the check applies only when this generator runs unmodified from the commit the history ends at, and the output says when it was skipped and why. `--stop-after` starts no commit after that many minutes; a run stopped so writes no history, keeps what it summarized for the next run, and exits with code 3. One run at a time writes under a history folder. An entry a commit's tree does not hold is not read at that commit: a symbolic link that leads to no file of the tree (a link to a file is read as a copy of it), a name this disk cannot hold or another name standing where it goes, or a name that is not UTF-8. The run prints each, and lists them all in `<root>/history/unwritten.txt`, a line each with the commit, the path and the reason. A file the generator could not map at a commit is named in that commit's summary with the reason, warned once with the number of commits that gave it, and listed in `<root>/history/unmapped.txt` in the same form; a doc committed for it never stands in for it. Every run says how many files at how many commits each list holds and where it is, a run that summarizes nothing new too (`1 files at 1 commits could not be mapped by the generator, each for the reason the list gives; …`). The sequence itself does not yet mark either kind: such a file reads in it, and in the Explorer's timeline, as removed at the commit where it was not read and added again where it is next read, as a file truly removed and restored would; the two lists are where to tell them apart. Commits are summarized by a pool of worker processes, each given one commit, writing its tree whole and ended after it, so that every summary is what a fresh process makes of its commit alone, nothing carried from another commit; the run says so once, at its start. One exception, as before the pool: a file nested close to the limit of the stack (a TypeScript table a thousand levels deep, say) may be read in one run and not in another, by which files of the same commit were read before it and by timing, since V8 compiles on threads of its own; the cache keeps whichever the first run got. `--keep-workers` instead starts each worker once and gives it runs of consecutive commits one at a time, keeping its commit's tree from one commit to the next and touching only what differs. That is faster, the more so the smaller the commits, since a process's start and warm-up then dominate: over 210 of this repository's largest commits, 19 at a time, 9.3 minutes against 17.0; over seven tiny commits at one worker, 1.9 s against 8.6, and 11.4 s against 63.3 on a loaded machine. It is not yet shown to make the summaries a fresh process makes: for a file nested hundreds of levels deep a summary may depend on the worker, so it is not for a history you mean to keep. Every run over such a cache says so on its closing line, a run that regenerates nothing included. Its summaries are kept under a lens of their own, in a cache folder of their own, never mixed with those made a commit a worker. With it, a commit whose tree was written whole instead says why on its line (`…, its tree written anew: no earlier tree stood to bring forward`, for a worker's first commit; others name what stood in the way, such as a name the disk takes for another's), and the run's last lines count the commits by reason (`trees written anew at 14 of the 42 changes regenerated: …`), so that a cause of the repository's own that writes every tree whole is seen. With it too, a commit holding a file nested deeper than the reading depth, a file the generator could not map, or one on which the parser's runtime faulted is decided by a fresh process, and that costs more than a process's start: the fresh worker writes the commit's tree anew rather than bringing one forward; where the commit was not its worker's first, that worker summarized it already and wrote nothing of it, so the first such commit in a lane is summarized twice; and since a worker is ended after such a commit, the next commit of its lane starts a fresh worker too, so that while the file stands every later commit pays the same, a fresh process and a tree written whole, though summarized once. The run says so for each such commit, and its last lines count them by what the worker that first took each was marked for (`3 of the 42 changes regenerated were decided by a fresh process: a file nested beyond the reading depth`), and give the files the generator could not map once each, with the number of commits at which any was. A failure of the machine's rather than the file's (too many open files, a full disk) is never written into a summary wherever it is met: in the generator's pass over each file, its reader of re-exports, a language's own reader of a file or its probe of one, discovery's index pass and its walk of the folders, and the reader of a TypeScript configuration. The commit is tried once more in a fresh process, counted among those a fresh process decided under that reason alone (not also as a file the generator could not map, unless another file of it could not be mapped), and the run stops, naming the commit, the file and the error, if it fails again. To give the workers a larger heap for a large repository, raise node's as usual, `NODE_OPTIONS=--max-old-space-size=8192 npm run live-docs:history`, which the history carries to those processes and no other option of `NODE_OPTIONS`. The output is derived and never committed; its directory ignores itself. Use the inspection flags above to ask about a recorded commit or compare two of them.

### Boards

`npm run live-docs:board -- <board.md>` reads a board, validates it, joins it to the Live Docs, and prints its things, doors, wires and their bases. With `--files` it lists under each thing its files and under each wire the file-level edges behind it, as `A uses B (label)`, at most 20 of each with the number left out said. Without `<board.md>` it reads the board the configuration names as `board`; `npm run live-docs:board` reads this repository's own, `.mdmd/layer-3/board.mdmd.md`. The visualization command draws the same board as the World Map.

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
