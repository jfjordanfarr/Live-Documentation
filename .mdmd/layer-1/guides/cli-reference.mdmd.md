# CLI Reference

## Metadata

- Layer: 1
- Guide Type: reference

Complete catalog of Live Documentation CLI commands for external adopters. All commands are invoked via `npm run <script> [-- <options>]`.

> **Note**: This reference covers user-facing commands. Contributor tooling (test suites, fixture management, audits) is in the [Internal Tooling Reference](../../layer-2/internal-tooling.mdmd.md).

---

## Live Documentation Suite

### Generation & Materialization

| Command                      | Purpose                                |
| ---------------------------- | -------------------------------------- |
| `npm run live-docs:generate` | Regenerate Live Docs for tracked files |
| `npm run live-docs:targets`  | Rebuild the target manifest            |

#### `live-docs:generate`

Scans your workspace and materializes the documentation mirror.

```bash
# Preview changes without writing
npm run live-docs:generate -- --dry-run

# Regenerate all Live Docs
npm run live-docs:generate

# Regenerate only recently modified files
npm run live-docs:generate -- --changed

# Custom workspace and config
npm run live-docs:generate -- --workspace /path/to/repo --config custom.json
```

**Options:**
| Flag | Description |
|------|-------------|
| `--dry-run` | Preview without writing files |
| `--changed` | Only process modified files |
| `--workspace <path>` | Target workspace root |
| `--config <file>` | Path to config file |

---

### Validation & Linting

| Command                  | Purpose                               |
| ------------------------ | ------------------------------------- |
| `npm run live-docs:lint` | Validate Live Doc structure and links |

#### `live-docs:lint`

Validates structural markers, relative links, slug dialect compliance, and evidence placeholders.

```bash
npm run live-docs:lint -- --workspace /path/to/repo
```

**What's Enforced:**

- Relative links only (no absolute paths)
- Generated-marker integrity (fences intact)
- Evidence presence (unless waived)
- Slug dialect compliance (`github`, `azure-devops`, `gitlab`)

---

### Inspection & Pathfinding

| Command                     | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `npm run live-docs:inspect` | Query dependency paths and artifact metadata |
| `npm run live-docs:orphans` | Find Live Docs without corresponding sources |

#### `live-docs:inspect`

The "Oracle of Bacon" for code. Traces dependency chains through the Live Doc graph.

```bash
# Quick summary of an artifact
npm run live-docs:inspect -- packages/shared/src/types.ts

# Find path between two files
npm run live-docs:inspect -- --from src/auth.ts --to src/api.ts

# Symbol-level pathfinding
npm run live-docs:inspect -- --from src/auth.ts#validateToken --to src/api.ts#handler

# Reverse lookup (who depends on this?)
npm run live-docs:inspect -- --from src/types.ts --direction inbound

# Fan-out (what does this depend on?)
npm run live-docs:inspect -- --from src/main.ts --direction outbound

# Bidirectional search
npm run live-docs:inspect -- --from src/main.ts --direction both

# Machine-readable output
npm run live-docs:inspect -- --from src/auth.ts --to src/api.ts --json
```

**Options:**
| Flag | Description |
|------|-------------|
| `--from <path[#symbol]>` | Starting artifact |
| `--to <path[#symbol]>` | Destination artifact |
| `--direction <outbound\|inbound\|both>` | Traversal direction (default: `outbound`) |
| `--max-depth <n>` | Maximum hops (default: 25) |
| `--json` | Machine-readable output |
| `--verbose` | Include additional diagnostics |

---

### Visualization

| Command                       | Purpose                      |
| ----------------------------- | ---------------------------- |
| `npm run live-docs:visualize` | Build static Explorer bundle |

#### `live-docs:visualize`

Builds a self-contained static Explorer bundle: the Membrane Map, Force Graph and Knowledge Sources views, plus the earlier Local Map and Circuit Board. Deployable to GitHub Pages or any static host. See [Visualizing Your Codebase](visualizing-codebase.mdmd.md).

```bash
npm run live-docs:visualize -- --output ./public --pretty
```

**Options:**
| Flag | Description |
|------|-------------|
| `--output <dir>` | Output directory (default: `dist/explorer/`) |
| `--local-maps <path...>` | Precompute Local Map JSON for these files into `local-maps/` |
| `--all-local-maps` | Precompute Local Map JSON for every file (large) |
| `--commit <hash>`, `--ref <name>` | Stamp provenance into the bundle |
| `--config <file>` | Path to config file |
| `--pretty` | Pretty-print JSON for debugging |

---

## Related Guides

- [Getting Started](getting-started.mdmd.md) — Installation and first session
- [Tracing Impact](tracing-impact.mdmd.md) — Dependency pathfinding in depth
- [Visualizing Your Codebase](visualizing-codebase.mdmd.md) — Explorer features
