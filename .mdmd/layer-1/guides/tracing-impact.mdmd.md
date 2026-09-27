# Tracing Impact with Live Documentation

## Metadata

- Layer: 1
- Guide Type: task-tutorial

When you change a file, what else moves? Live Documentation answers with dependency pathfinding: the shortest path between any two artifacts, or everything that depends on one.

---

## The Inspect CLI

`live-docs:inspect` traces chains through the Live Doc graph. Think of it as the "Oracle of Bacon" for code.

### Find the path between two files

```bash
npm run live-docs:inspect -- --from packages/server/src/main.ts --to packages/shared/src/types.ts
```

Output shows each hop in the chain:

```
Path found (3 hops):
  packages/server/src/main.ts
    → packages/server/src/services/auth.ts
    → packages/shared/src/utils/validation.ts
    → packages/shared/src/types.ts
```

### Symbol-level pathfinding

Trace connections between specific symbols, not just files:

```bash
npm run live-docs:inspect -- --from packages/server/src/main.ts#initializeServer --to packages/shared/src/types.ts#ConfigOptions
```

### See what depends on a file (inbound)

```bash
npm run live-docs:inspect -- --from packages/shared/src/types.ts --direction inbound
```

### See what a file depends on (outbound)

Omit `--to` to see the fan-out:

```bash
npm run live-docs:inspect -- --from packages/server/src/main.ts --direction outbound
```

### Bidirectional search

```bash
npm run live-docs:inspect -- --from packages/server/src/main.ts --direction both
```

---

## Machine-Readable Output

Add `--json` for scripts and automation:

```bash
npm run live-docs:inspect -- --from packages/server/src/main.ts --to packages/server/src/runtime/environment.ts --json
```

```json
{
  "kind": "path",
  "direction": "outbound",
  "length": 1,
  "from": {
    "codePath": "packages/server/src/main.ts",
    "docPath": ".mdmd/layer-4/packages/server/src/main.ts.mdmd.md"
  },
  "to": {
    "codePath": "packages/server/src/runtime/environment.ts",
    "docPath": ".mdmd/layer-4/packages/server/src/runtime/environment.ts.mdmd.md"
  },
  "nodes": [
    { "codePath": "packages/server/src/main.ts", "docPath": "..." },
    { "codePath": "packages/server/src/runtime/environment.ts", "docPath": "..." }
  ],
  "hops": [
    {
      "from": { "codePath": "packages/server/src/main.ts", "docPath": "..." },
      "to": { "codePath": "packages/server/src/runtime/environment.ts", "docPath": "..." }
    }
  ]
}
```

### Output kinds

| Kind        | Meaning                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `path`      | A path was found between `from` and `to`                                                                                 |
| `fanout`    | No `--to` was given; the result lists where traversal from `from` ends up                                                |
| `not-found` | No connection exists (exit code 1). A `frontier` array lists the closest reachable nodes and why traversal stopped there |

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
npm run live-docs:inspect -- --from packages/shared/src/utils/format.ts --direction inbound --json
```

### After adding a dependency

Verify the import chain is what you expect:

```bash
npm run live-docs:inspect -- --from src/new-feature.ts --to src/core/config.ts --direction outbound
```

### Checking test coverage

Trace from a source file to its test:

```bash
npm run live-docs:inspect -- --from src/auth.ts --to tests/auth.test.ts
```

---

## CLI Reference

| Flag                                    | Description                                       |
| --------------------------------------- | ------------------------------------------------- |
| `--from <path[#symbol]>`                | Starting artifact (required for pathfinding)      |
| `--to <path[#symbol]>`                  | Destination artifact (optional; omit for fan-out) |
| `--direction <outbound\|inbound\|both>` | Traversal direction (default: `outbound`)         |
| `--max-depth <n>`                       | Maximum hops                                      |
| `--json`                                | Machine-readable output                           |
| `--verbose`                             | Include additional diagnostics                    |

---

## Related Guides

- [Getting Started](getting-started.mdmd.md)
- [Visualizing Your Codebase](visualizing-codebase.mdmd.md)
- [CLI Reference](cli-reference.mdmd.md)
