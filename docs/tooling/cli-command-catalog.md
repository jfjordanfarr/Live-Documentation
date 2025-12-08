# CLI Command Catalog

_Last updated: 2025-12-07_

This catalog summarizes the npm scripts supplied by the workspace. Invoke any command with `npm run <script> [-- <options>]`. Options listed below assume PowerShell (`;` joins commands) but work with other shells once translated.

## Live Documentation Suite

| Command | Purpose | Key Options |
| --- | --- | --- |
| `npm run livedocs` | Orchestrates the full Live Docs pipeline (Stage-0 capture through System materialisation) via `scripts/live-docs/run-all.ts`. | Inherits flags from downstream scripts; ensure environment variables are set before invoking. |
| `npm run live-docs:generate` | Regenerates Layer 4 docs in `.live-documentation/<baseLayer>/`. Can optionally emit System views. | `--dry-run`, `--changed`, `--system`, `--system-output <dir>`, `--system-clean`, `--workspace <path>`, `--config <file>` |
| `npm run live-docs:system` | Materialises System-layer "views" on demand without touching the tracked mirror. | `--output <dir>`, `--clean`, `--dry-run`, `--workspace <path>`, `--config <file>` |
| `npm run live-docs:lint` | Validates Live Doc structure, required sections, and relative links. | `--workspace <path>` |
| `npm run live-docs:targets` | Rebuilds the target manifest consumed by Stage 0 and analytics. | `--workspace <path>` |
| `npm run live-docs:report` | Emits diagnostics precision/recall summaries. | `--workspace <path>` |
| `npm run live-docs:co-activation` | Regenerates the co-activation analytics JSON used by System plans. | `--workspace <path>`, analytics-specific env vars |
| `npm run live-docs:orphans` | Finds Live Docs without corresponding source artifacts. | `--workspace <path>` |
| `npm run live-docs:visualize` | Launches the Explorer HTTP server (Circuit Board, Local Map, Force Graph views). Also exposes `/local-map?nodeId=<path>` JSON API for headless debugging. | `--port <number>` |
| `npm run live-docs:visualize:static` | Builds a fully static Explorer bundle (graph + symbols + all markdown) to `dist/explorer/`. Deployable to GitHub Pages or any static host. | `--output <dir>`, `--pretty` |

## Graph & Analysis Tooling

| Command | Purpose | Key Options |
| --- | --- | --- |
| `npm run graph:snapshot` | Rebuilds the workspace graph snapshot (SQLite + JSON). | `--workspace <path>` |
| `npm run graph:inspect` | Queries graph neighbours, dependencies, and symbol metadata. | `--file <path>`, `--id <symbol>`, `--list-kinds` |
| `npm run graph:audit` | Audits doc/test coverage against graph expectations. | `--workspace <path>`, `--json` |
| `npm run docs:links:enforce` | Ensures markdown/Live Doc links resolve. | `--workspace <path>`, `--json` |
| `npm run slopcop:markdown` | Enforces configured markdown slug/link rules. | `--json` |
| `npm run slopcop:assets` | Validates asset references in markdown. | `--json` |
| `npm run slopcop:symbols` | Checks markdown heading anchors (opt-in). | `--json` |

## Fixtures & Benchmarks

| Command | Purpose | Key Options |
| --- | --- | --- |
| `npm run fixtures:verify` | Validates repository fixtures stay in sync. | `--workspace <path>` |
| `npm run fixtures:record-fallback` | Records fallback inference fixtures. | Suite-specific flags inside script |
| `npm run fixtures:regenerate` | Rebuilds benchmark fixtures. | Benchmark mode switches |
| `npm run fixtures:sync-docs` | Syncs AST documentation fixtures. | `--workspace <path>` |
| `npm run test:benchmarks` | Executes benchmark suites. | `--mode <ast|self-similarity|all>`, `--report` |

## Testing & Verification

| Command | Purpose | Key Options |
| --- | --- | --- |
| `npm run test:unit` | Runs unit tests via Vitest. | `--runInBand`, standard Vitest flags |
| `npm run test:integration` | Executes VS Code integration tests. | `--workspace <path>` |
| `npm run test:contracts` | Runs server contract tests. | none |
| `npm run verify` | Aggregates lint + unit + integration checks. | `--mode` (forwarded to underlying tasks) |
| `npm run safe:commit` | Full pre-commit pipeline (verify, graph snapshot/audit, SlopCop, summary). | `--benchmarks`, `--skip-git-status` |
| `npm run ci-check` | CI-friendly variant of `safe:commit` that skips git status enforcement. | `--benchmarks` |

## Build & Maintenance

| Command | Purpose | Key Options |
| --- | --- | --- |
| `npm run build` | Builds shared, server, and extension workspaces. | Workspace-specific build flags |
| `npm run lint` | Runs ESLint across the repo. | Standard ESLint CLI args |
| `npm run format` | Checks formatting with Prettier. | Standard Prettier flags |
| `npm run rebuild:better-sqlite3:node` | Rebuilds `better-sqlite3` against the current Node headers. | `--force` |
| `npm run rebuild:better-sqlite3:force` | Forces the `better-sqlite3` rebuild even if cache exists. | none |

Both rebuild commands wrap [`scripts/rebuild-better-sqlite3.mjs`](../../scripts/rebuild-better-sqlite3.mjs), which prepares native binaries for the current Node and VS Code Electron runtimes and caches them by ABI.

### Adding New Commands

1. Define the script in `package.json`.
2. Document it here (purpose + options) and update `.github/copilot-instructions.md` if it affects daily workflows.
3. Mention the command in relevant MDMD docs (roadmap, falsifiability) when it changes guarantees or workflows.

Keeping this catalog current prevents drift between tooling and documentation—treat updates as part of Definition of Done for new CLIs.
