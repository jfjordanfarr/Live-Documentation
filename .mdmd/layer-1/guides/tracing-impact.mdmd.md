# Tracing Impact with Live Documentation

## Metadata

- Layer: 1
- Guide Type: task-tutorial

When you change a core utility, what else will break? Live Documentation answers this with **dependency pathfinding** — trace the shortest path between any two artifacts, or enumerate everything that depends on a given file.

---

## The Inspect CLI

The `live-docs:inspect` command is your "Oracle of Bacon" for code. It traces dependency chains through the Live Doc graph.

### Find the Path Between Two Files

```powershell
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

### Symbol-Level Pathfinding

Trace connections between specific symbols, not just files:

```powershell
npm run live-docs:inspect -- --from packages/server/src/main.ts#initializeServer --to packages/shared/src/types.ts#ConfigOptions
```

### See What Depends on a File (Inbound)

Who imports this module? Use `--direction inbound`:

```powershell
npm run live-docs:inspect -- --from packages/shared/src/types.ts --direction inbound
```

### See What a File Depends On (Outbound)

What does this module reach? Omit `--to` to see the fan-out:

```powershell
npm run live-docs:inspect -- --from packages/server/src/main.ts --direction outbound
```

### Bidirectional Search

Search both directions simultaneously:

```powershell
npm run live-docs:inspect -- --from packages/server/src/main.ts --direction both
```

---

## Machine-Readable Output

Add `--json` for automation and AI consumption:

```powershell
npm run live-docs:inspect -- --from src/auth.ts --to src/api.ts --json
```

Returns structured data:

```json
{
  "kind": "path",
  "nodes": ["src/auth.ts", "src/middleware.ts", "src/api.ts"],
  "hops": [
    { "from": "src/auth.ts", "to": "src/middleware.ts", "symbol": "validateToken" },
    { "from": "src/middleware.ts", "to": "src/api.ts", "symbol": "authMiddleware" }
  ]
}
```

### Output Kinds

| Kind        | Meaning                                  |
| ----------- | ---------------------------------------- |
| `path`      | A path was found between from and to     |
| `fanout`    | No `--to` provided; shows terminal paths |
| `not-found` | No connection exists (exit code 1)       |

### Diagnosing "Not Found"

When no path exists, the response includes a `frontier` array explaining why traversal stopped:

```json
{
  "kind": "not-found",
  "frontier": [
    { "node": "src/orphan.ts", "reason": "terminal" },
    { "node": "src/deep.ts", "reason": "max-depth" },
    { "node": "src/missing.ts", "reason": "missing-doc" }
  ]
}
```

---

## Visual Pathfinding in the Explorer

The Explorer's **Local Map** view supports non-headless pathfinding (in progress: the **Membrane Map** will subsume Local Map pathfinding via its continuous pin spectrum — pathfinding is a pin population strategy, not a separate mode. See [Visualizing Your Codebase](visualizing-codebase.mdmd.md)):

1. Launch the Explorer: `npm run live-docs:visualize`
2. Switch to "Local Map" view
3. Enter a **From** artifact in the left input
4. Enter a **To** artifact in the right input
5. The hop-by-hop chain renders automatically (debounced)

If no connection exists, you'll see a clear "No path found" message with the same frontier diagnostics as the CLI.

### URL Shareability

Every pathfinding result generates a stable URL. Share it with colleagues:

```
http://localhost:3000/?view=local&from=src/auth.ts&to=src/api.ts
```

### Planned: Multi-Path Rendering

The current Explorer renders **one** shortest path. Planned enhancements (Stream LV1-F) will surface richer pathfinding results, which will also carry forward into the Membrane Map's pin-based pathfinding:

- **All shortest paths**: When multiple equally-short routes exist, the Local Map renders them as a merged DAG — divergent intermediaries stack vertically within their hop column, with connections fanning out and converging.
- **Near-miss (+1) paths**: Alternate paths one hop longer than the shortest render with dashed borders and dimmed connections. A toolbar toggle controls visibility.
- **Symbol-divergent paths**: When two shortest paths traverse the same files via different symbols, each chain renders as a distinct color-coded connection line routed through separate symbol anchors on the same card. Hovering highlights the full chain.

---

## Common Patterns

### Before Refactoring a Utility

See all consumers before changing a shared function:

```powershell
npm run live-docs:inspect -- --from packages/shared/src/utils/format.ts --direction inbound --json
```

### After Adding a New Dependency

Verify the import chain is as expected:

```powershell
npm run live-docs:inspect -- --from src/new-feature.ts --to node_modules/some-lib --direction outbound
```

### Investigating Test Coverage

Trace from a source file to its test:

```powershell
npm run live-docs:inspect -- --from src/auth.ts --to tests/auth.test.ts
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
| `--verbose`                             | Include additional diagnostics                    |

---

## Related Guides

- [Getting Started](getting-started.mdmd.md) — Installation and first session
- [Visualizing Your Codebase](visualizing-codebase.mdmd.md) — Explorer features in depth
- [CLI Reference](cli-reference.mdmd.md) — Complete command catalog
