# Tracing Impact with Live Documentation

## Metadata

- Layer: 1
- Guide Type: task-tutorial

When you change a file, what else moves? Live Documentation answers with dependency pathfinding: the shortest path between any two artifacts, or everything that depends on one.

---

## The Inspect CLI

`live-docs:inspect` traces chains through the Live Doc graph. Think of it as the "Oracle of Bacon" for code. Every example below is real output from this repository as of 2026-09-28; the bracketed Live Doc path after each file is shortened to `[…]`.

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

### Both directions

```bash
npm run live-docs:inspect -- --from packages/generator/src/generator.ts --direction both
```

```
Terminal both paths from packages/generator/src/generator.ts (max depth 25, 8 path(s) listed, limit 200).
  1. packages/generator/src/generator.ts […] -> tests/integration/live-docs/round-trip.test.ts […]
  2. packages/generator/src/generator.ts […] -> tests/integration/live-docs/rosettaParity.test.ts […]
  ...
  6. packages/generator/src/generator.ts […] -> scripts/oracle/compare.ts […] -> tests/integration/live-docs/oracle.test.ts […]
  7. packages/generator/src/generator.ts […] -> scripts/live-docs/generate.ts […]
  8. packages/generator/src/generator.ts […] -> packages/generator/src/generator.test.ts […]
```

---

## Machine-Readable Output

Add `--json` for scripts and automation:

```bash
npm run live-docs:inspect -- --from scripts/live-docs/inspect.ts --to packages/engine/src/live-docs/graphFiles.ts --json
```

```json
{
  "kind": "path",
  "direction": "outbound",
  "length": 1,
  "from": {
    "codePath": "scripts/live-docs/inspect.ts",
    "docPath": ".mdmd/layer-4/scripts/live-docs/inspect.ts.mdmd.md"
  },
  "to": {
    "codePath": "packages/engine/src/live-docs/graphFiles.ts",
    "docPath": ".mdmd/layer-4/packages/engine/src/live-docs/graphFiles.ts.mdmd.md"
  },
  "nodes": [
    { "codePath": "scripts/live-docs/inspect.ts", "docPath": "..." },
    { "codePath": "packages/engine/src/live-docs/graphFiles.ts", "docPath": "..." }
  ],
  "hops": [
    {
      "from": { "codePath": "scripts/live-docs/inspect.ts", "docPath": "..." },
      "to": { "codePath": "packages/engine/src/live-docs/graphFiles.ts", "docPath": "..." }
    }
  ]
}
```

### Output kinds

| Kind          | Meaning                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `path`        | A path was found between `from` and `to`                                                                                 |
| `symbol-path` | The same, for a `path#Symbol` query                                                                                      |
| `fanout`      | No `--to` was given; the result lists where traversal from `from` ends up                                                |
| `not-found`   | No connection exists (exit code 1). A `frontier` array lists the closest reachable nodes and why traversal stopped there |

### When there is no path

```bash
npm run live-docs:inspect -- --from packages/engine/src/live-docs/graphFiles.ts --to scripts/live-docs/inspect.ts
```

```
No dependency path found from packages/engine/src/live-docs/graphFiles.ts to scripts/live-docs/inspect.ts (outbound).
Closest reachable frontier:
  - packages/engine/src/live-docs/document.ts […] — terminal
  - packages/engine/src/live-docs/graph.ts […] — terminal
  - packages/engine/src/live-docs/graphFiles.ts […] — missing-doc (missing glob)
  - packages/engine/src/live-docs/graphFiles.ts […] — missing-doc (missing node:fs)
  - packages/engine/src/live-docs/graphFiles.ts […] — missing-doc (missing node:path)
```

The dependency runs the other way (the inspector reads the graph), so the search stops at the reader's own leaves: workspace files with no further dependencies and the external modules that have no Live Doc.

---

## Visual Pathfinding in the Explorer

The Explorer's **Local Map** view has From and To inputs: enter both, click **Find Path**, and the hop-by-hop chain renders as columns. If no connection exists in the chosen direction you get a "no path" message; try the other direction, since the search is directional.

In the **Membrane Map**, pinning a symbol lays out what feeds it and what depends on it, and following pins from card to card walks a path hop by hop. See [Visualizing Your Codebase](visualizing-codebase.mdmd.md).

Either way, the result is encoded in the page URL, so a path you found can be sent as a link.

---

## Common Patterns

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

## CLI Reference

| Flag                                    | Description                                       |
| --------------------------------------- | ------------------------------------------------- |
| `--from <path[#symbol]>`                | Starting artifact (required for pathfinding)      |
| `--to <path[#symbol]>`                  | Destination artifact (optional; omit for fan-out) |
| `--direction <outbound\|inbound\|both>` | Traversal direction (default: `outbound`)         |
| `--max-depth <n>`                       | Maximum hops (default: 25)                        |
| `--json`                                | Machine-readable output                           |
| `--verbose`                             | Include full symbol lists in output               |

---

## Related Guides

- [Getting Started](getting-started.mdmd.md)
- [Visualizing Your Codebase](visualizing-codebase.mdmd.md)
- [CLI Reference](cli-reference.mdmd.md)
