# Tracing Impact with Live Documentation

_Current as of 2026-10-23; example outputs are dated snapshots, not current totals._

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
Path from scripts/live-docs/generate.ts to packages/engine/src/live-docs/core.ts (2 hop(s), outbound).
  1. scripts/live-docs/generate.ts […] -> packages/generator/src/generator.ts […]
  2. packages/generator/src/generator.ts […] -> packages/engine/src/live-docs/core.ts […]
```

Each hop names the file and the Live Doc the edge was read from.

### Symbol-level pathfinding

Trace connections between specific symbols, not just files, with `path#Symbol`:

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

Without `--to`, the result is a fan-out: every terminal path away from the file, up to 200 of them. For a module as widely used as the configuration loader that list is long. `--max-depth` shortens it and `--json` returns the paths as data.

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

Where a fan-out lists paths, `--reachable` lists files: each once, with the fewest hops to it, nearest first, one list per direction. It is the same walk the Explorer's destination field runs from the newest pin, which offers these files and says how far. A fan-out runs one way only; asked for both it says so.

### What the entry points reach

```bash
npm run live-docs:inspect -- --reachable
```

```
Files a path reaches from the entry points (max depth 25), nearest first.
Entry points: 190 files
  package.json [.mdmd/layer-4/package.json.mdmd.md]  tooling
  packages/cli/src/index.ts [.mdmd/layer-4/packages/cli/src/index.ts.mdmd.md]  command live-docs of packages/cli/package.json; module of packages/cli/package.json
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

Choose a file, symbol or directory in the search bar; it becomes the newest pin. **Path to** chooses the destination from that pin. Connected matches say how far they are and whether the connection runs the other way; a fold discloses matches with no path. In 2D a successful path names its files, orders providers before consumers and draws the relevant symbol connections. A reverse-only result explains that the requested direction has no path and offers the reverse question. Inspecting a hop keeps the path; clearing the destination returns to exploration with the pins kept.

The Explorer's provider-to-consumer direction corresponds to the CLI's **inbound** walk. The CLI's default **outbound** direction follows a consumer to what it depends on. Both use the engine's walk; their default questions differ.

The intended contract is visible results, named endpoints and ordered hops, and operable recovery in **both** 2D and 3D. The October 23 review found that 3D hides feedback available in 2D; this remains [open remediation work](../../layer-3/live-documentation-explorer.mdmd.md#remediation-work). Switching to 2D currently reveals that feedback. Showing every alternative shortest route or every symbol chain is a separate historical proposal, not a prerequisite for making the existing route usable.

---

## CLI Reference

| Flag                                    | Description                                       |
| --------------------------------------- | ------------------------------------------------- |
| `--from <path[#symbol]>`                | Starting artifact (required for pathfinding)      |
| `--to <path[#symbol]>`                  | Destination artifact (optional; omit for fan-out) |
| `--reachable`                           | Every file a path reaches from `--from`, with hops |
| `--direction <outbound\|inbound\|both>` | Traversal direction (default: `outbound`); `both` with `--to` or `--reachable` |
| `--max-depth <n>`                       | Maximum hops (default: 25)                        |
| `--json`                                | Machine-readable output                           |
| `--verbose`                             | Include full symbol lists in output               |

---

## Related Guides

- [Getting Started](getting-started.mdmd.md)
- [Visualizing Your Codebase](visualizing-codebase.mdmd.md)
- [CLI Reference](cli-reference.mdmd.md)
