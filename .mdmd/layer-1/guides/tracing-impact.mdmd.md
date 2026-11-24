# Tracing Impact with Live Documentation

_Current as of 2026-11-24; example outputs are dated snapshots, not current totals._

## Metadata

- Layer: 1
- Guide Type: task-tutorial

When you change a file, what else moves? Live Documentation answers with dependency pathfinding: the shortest path between any two artifacts, or everything that depends on one.

---

## The Inspect CLI

`live-docs:inspect` traces chains through the Live Doc graph. Think of it as the "Oracle of Bacon" for code. The original examples are output from this repository on 2026-09-28; reachability examples were added with the October work. Counts and paths can change; the bracketed Live Doc path after each file is shortened to `[…]`.

### Find the path between two files

```bash
npm run live-docs:inspect -- --from scripts/live-docs/generate.ts --to packages/engine/src/live-docs/core.ts
```

```
Path from scripts/live-docs/generate.ts to packages/engine/src/live-docs/core.ts, 2 hop(s): each file uses the next.
  1. scripts/live-docs/generate.ts […] uses packages/generator/src/generator.ts […]
  2. packages/generator/src/generator.ts […] uses packages/engine/src/live-docs/core.ts […]
```

Each hop names the file and the Live Doc the edge was read from. Without `--direction`, the command searches outbound first and then inbound, telling the route as asked (`uses` or `is used by`).

### Symbol-level pathfinding

Trace connections between specific symbols, not just files, with `path#Symbol` (or Windows-safe `path:Symbol`):

```bash
npm run live-docs:inspect -- --from packages/generator/src/generator.ts#generateLiveDocs --to packages/engine/src/live-docs/core.ts#analyzeSourceFile --json
```

```json
{
  "kind": "symbol-path",
  "direction": "outbound",
  "length": 1,
  "from": { "codePath": "packages/generator/src/generator.ts", "symbol": "generateLiveDocs" },
  "to": { "codePath": "packages/engine/src/live-docs/core.ts", "symbol": "analyzeSourceFile" },
  "hops": [
    {
      "from": { "codePath": "packages/generator/src/generator.ts", "symbol": "generateLiveDocs" },
      "to": { "codePath": "packages/engine/src/live-docs/core.ts", "symbol": "analyzeSourceFile" }
    }
  ]
}
```

### See what depends on a file (inbound)

```bash
npm run live-docs:inspect -- --from packages/engine/src/config/liveDocumentationConfig.ts --direction inbound
```

Without `--to` or `--reachable`, the command lists the file's **direct neighbours** each way asked (`outbound`, `inbound`, or `both`), sorted by path and counted, up to 200 per direction with the remainder counted (until 2026-11-22 this printed every terminal path whole). It also prints declarations named by the file's documentation and files whose documentation names it (`documentation.names` and `documentation.namedBy` in `--json`), plus related markdown (`Cites:` / `Cited by:`, `documents` in `--json`). `--max-depth` applies to `--to` and `--reachable`, not direct-neighbour listings, and a directory passed to `--from` requires `--to` or `--reachable`.

### See what a file depends on (outbound)

```bash
npm run live-docs:inspect -- --from packages/generator/src/generator.ts --direction outbound
```

### Everything a path reaches

```bash
npm run live-docs:inspect -- --from packages/generator/src/generator.ts --reachable --direction both
```

```
Files a path reaches from packages/generator/src/generator.ts (max depth 25), nearest first.
outbound (what it depends on): 59 files
  1 hop   packages/engine/src/config/liveDocumentationConfig.ts […]
  1 hop   packages/engine/src/live-docs/core.ts […]
  ...
  2 hops  packages/engine/src/live-docs/graph.ts […]
  ...
inbound (what depends on it): 13 files
  1 hop   scripts/live-docs/generate.ts […]
  ...
```

Where `--from` alone lists direct neighbours, `--reachable` walks further and lists every file a path reaches: each once, with the fewest hops to it, nearest first, one list per direction (`outbound`, `inbound`, or `both`). It is the same walk the Explorer's destination field runs from the newest pin, which offers these files and says how far. Both `--from` alone and `--reachable` accept `--direction both`.

### What the entry points reach

```bash
npm run live-docs:inspect -- --reachable
```

```
Files a path reaches from the entry points (max depth 25), nearest first.
Entry points: 190 files
  package.json [.mdmd/layer-4/package.json.mdmd.md]  tooling
  ...
  packages/generator/src/generator.ts [.mdmd/layer-4/packages/generator/src/generator.ts.mdmd.md]  module of packages/generator/package.json
  ...
  scripts/live-docs/inspect.ts [.mdmd/layer-4/scripts/live-docs/inspect.ts.mdmd.md]  command live-docs:inspect of package.json
  ...
  tests/e2e/search-bar.spec.ts [.mdmd/layer-4/tests/e2e/search-bar.spec.ts.mdmd.md]  test
Reached: 455 files
  1 hop   packages/engine/src/config/liveDocumentationConfig.ts […]
  ...
Unreachable from any entry: 27 files
  tests/integration/programs/csharp/estate/Portal/App_Code/Site.master […]  implementation
  ...
Not read, so neither reached nor unreachable (no reader handles their kind yet): 15 files
  .github/workflows/ci.yml […]
  ...
Reached only from tests: 0 files
```

Without `--from`, `--reachable` walks from every file something outside the code starts, as the docs' `Entry` lines say: a program, a script a manifest runs, a package's module, a route or table served, a file a tool reads, one the configuration declares, or a test. It lists the entries with their reasons, what they reach, what no entry reaches (with its archetype: a dead file, or one loaded by a path the docs cannot read until it is declared), and what only a test reaches. The Knowledge Sources panel shows the same walk and exports the same object as JSON; `--json` prints it here.

### Before refactoring a utility

See every consumer before changing a shared function:

```bash
npm run live-docs:inspect -- --from packages/engine/src/tooling/pathUtils.ts --direction inbound --json
```

### After adding a dependency

Verify the import chain is what you expect:

```bash
npm run live-docs:inspect -- --from scripts/live-docs/inspect.ts --to packages/engine/src/live-docs/graphFiles.ts
```

### Finding a file's tests

Tests import the code they exercise, so trace inbound from the source file:

```bash
npm run live-docs:inspect -- --from packages/generator/src/generator.ts --to packages/generator/src/generator.test.ts --direction inbound
```

---

## Paths in the Explorer

Choose a file, symbol or directory in the search bar; it becomes the newest pin. **Path to** chooses the destination from that pin. Connected matches say how far they are; a fold discloses matches with no path. In both representations a successful path names its files, from the end you asked from to the end you asked for, in a shared report above the map, with the relation said between them: "is used by" where each file is used by the next, "uses" where each file uses the next. Each hop is an inspection button, reached by Tab and activated by Enter or Space; long routes scroll to reveal the focused hop. The 2D drawing adds the relevant symbol connections. The 2D drawing always sets what offers before what uses it, so a path asked from the file that depends is drawn with that file at the right and told from it. Inspecting a hop keeps the path; clearing the destination returns to exploration with the pins kept.

Both the Explorer and the CLI answer a path whichever way the dependency runs and tell it from the asked start to the asked destination. When no direction is forced, the Explorer searches provider-to-consumer first (the CLI's **inbound** walk) and then consumer-to-provider; the CLI searches **outbound** first and then **inbound** (passing `--direction` restricts the CLI to one way or prints both). Both use the engine's walk.

The October 23 repair made path results visible in **both** 2D and 3D; see the [playtest](../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-23/Screenshots/path-feedback/README.md). Since 2026-11-22, paths run in either direction directly and are told as asked (`uses` or `is used by`), so no separate Reverse action is needed; each hop button and Clear work by keyboard. Clearing returns focus to the destination and keeps the pins. Switching representation, inspecting evidence, reloading or opening a shared link preserves the question. Navigating to World Map or Knowledge Sources hides the report without discarding it; a new destination question opens Local Map even when no path exists. Showing every alternative shortest route or every symbol chain is a separate historical proposal, not a prerequisite for making the existing route usable.

---

## CLI Reference

| Flag                                    | Description                                       |
| --------------------------------------- | ------------------------------------------------- |
| `--from <path[#symbol]>`                | Starting artifact: a file, directory, or symbol (`path#Symbol` or Windows-safe `path:Symbol`); a symbol requires `--to`, and a directory requires `--to` or `--reachable` |
| `--to <path[#symbol]>`                  | Destination artifact (file, directory, or symbol); omit with a file `--from` to list direct neighbours, documentation references, and cited docs |
| `--reachable`                           | Every file a path reaches from `--from`, with hops; without `--from`, what the declared entry points reach |
| `--groups`                              | List the disconnected groups of files in today's graph (standalone; takes no `--from`, `--to`, or `--direction`) |
| `--direction <outbound\|inbound\|both>` | Traversal direction (`outbound` default for `--from` alone and `--reachable`; with `--to`, omitting `--direction` searches `outbound` then `inbound`) |
| `--max-depth <n>`                       | Maximum hops for `--to` and `--reachable` (default: 25) |
| `--at <commit>`                         | Inspect a recorded historical commit (`--from`, `--from` + `--to`, or `--reachable`; add `--words` with `--from` for authored prose and symbol descriptions) |
| `--between <a> <b>`                     | Compare two recorded historical commits           |
| `--json`                                | Machine-readable output                           |
| `--verbose`                             | Include full symbol lists in output (default: slim) |

---

## Related Guides

- [Getting Started](getting-started.mdmd.md)
- [Visualizing Your Codebase](visualizing-codebase.mdmd.md)
- [CLI Reference](cli-reference.mdmd.md)
