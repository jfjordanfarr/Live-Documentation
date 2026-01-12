# CLI Reference

## Metadata
- Layer: 1
- Guide Type: reference

Complete catalog of Live Documentation CLI commands for external adopters. All commands are invoked via `npm run <script> [-- <options>]`.

> **Note**: This reference covers user-facing commands. Internal development tooling (test suites, fixture management, etc.) is documented separately for contributors.

---

## Live Documentation Suite

### Generation & Materialization

| Command | Purpose |
|---------|---------|
| `npm run live-docs:generate` | Regenerate Live Docs for tracked files |
| `npm run live-docs:system` | Materialize System-layer views on demand |
| `npm run live-docs:targets` | Rebuild the target manifest |

#### `live-docs:generate`

Scans your workspace and materializes the documentation mirror.

```powershell
# Preview changes without writing
npm run live-docs:generate -- --dry-run

# Regenerate all Live Docs
npm run live-docs:generate

# Regenerate only recently modified files
npm run live-docs:generate -- --changed

# Include System-layer materialization
npm run live-docs:generate -- --system

# Custom workspace and config
npm run live-docs:generate -- --workspace /path/to/repo --config custom.json
```

**Options:**
| Flag | Description |
|------|-------------|
| `--dry-run` | Preview without writing files |
| `--changed` | Only process modified files |
| `--system` | Also materialize System views |
| `--system-output <dir>` | Custom System output directory |
| `--system-clean` | Remove stale System files |
| `--workspace <path>` | Target workspace root |
| `--config <file>` | Path to config file |

#### `live-docs:system`

Materialize System-layer views without touching the tracked mirror.

```powershell
npm run live-docs:system -- --output ./system-views --clean
```

**Options:**
| Flag | Description |
|------|-------------|
| `--output <dir>` | Output directory (default: `AI-Agent-Workspace/tmp/system-cli-output`) |
| `--clean` | Remove stale files before generating |
| `--dry-run` | Preview without writing |
| `--workspace <path>` | Target workspace root |
| `--config <file>` | Path to config file |

---

### Validation & Linting

| Command | Purpose |
|---------|---------|
| `npm run live-docs:lint` | Validate Live Doc structure and links |

#### `live-docs:lint`

Validates structural markers, relative links, slug dialect compliance, and evidence placeholders.

```powershell
npm run live-docs:lint -- --workspace /path/to/repo
```

**What's Enforced:**
- Relative links only (no absolute paths)
- Generated-marker integrity (fences intact)
- Evidence presence (unless waived)
- Slug dialect compliance (`github`, `azure-devops`, `gitlab`)

---

### Inspection & Pathfinding

| Command | Purpose |
|---------|---------|
| `npm run live-docs:inspect` | Query dependency paths and artifact metadata |
| `npm run live-docs:orphans` | Find Live Docs without corresponding sources |

#### `live-docs:inspect`

The "Oracle of Bacon" for code. Traces dependency chains through the Live Doc graph.

```powershell
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

| Command | Purpose |
|---------|---------|
| `npm run live-docs:visualize` | Launch interactive Explorer server |
| `npm run live-docs:visualize:static` | Build static Explorer bundle |

#### `live-docs:visualize`

Launches the Explorer HTTP server with Circuit Board, Local Map, and Force Graph views.

```powershell
npm run live-docs:visualize -- --port 8080
```

**Options:**
| Flag | Description |
|------|-------------|
| `--port <number>` | HTTP port (default: 3000) |

**JSON API:**
```powershell
Invoke-RestMethod "http://localhost:3000/local-map?nodeId=<path>&pretty=1"
```

#### `live-docs:visualize:static`

Builds a fully static Explorer bundle for GitHub Pages or any static host.

```powershell
npm run live-docs:visualize:static -- --output ./public --pretty
```

**Options:**
| Flag | Description |
|------|-------------|
| `--output <dir>` | Output directory (default: `dist/explorer/`) |
| `--pretty` | Pretty-print JSON for debugging |

---

## Related Guides

- [Getting Started](getting-started.mdmd.md) — Installation and first session
- [Tracing Impact](tracing-impact.mdmd.md) — Dependency pathfinding in depth
- [Visualizing Your Codebase](visualizing-codebase.mdmd.md) — Explorer features
