# Quickstart: Live Documentation

> **⚠️ This document has been superseded by the Layer 1 User Guides:**
>
> - [Getting Started](../../.mdmd/layer-1/guides/getting-started.mdmd.md) — Installation, configuration, first session
> - [Tracing Impact](../../.mdmd/layer-1/guides/tracing-impact.mdmd.md) — Dependency pathfinding
> - [Visualizing Your Codebase](../../.mdmd/layer-1/guides/visualizing-codebase.mdmd.md) — Explorer views and shareability
> - [CLI Reference](../../.mdmd/layer-1/guides/cli-reference.mdmd.md) — Complete command catalog
>
> This file is retained for historical task references but should not be updated. New documentation should be added to the Layer 1 guides.

---

Live Documentation pairs every tracked workspace asset with a markdown artifact that combines an **authored preamble** (`Purpose`, `Notes`) and **generated sections** (`Public Symbols`, `Dependencies`, archetype-specific evidence). This quickstart walks through staging those docs under `/.live-documentation/<baseLayer>/` (default `source/`), exploring them visually, and distributing them as static sites.

---

## The Four Experience Loops

Live Documentation supports four distinct workflows:

| Loop                  | User                   | Action                                | System Response                                              |
| --------------------- | ---------------------- | ------------------------------------- | ------------------------------------------------------------ |
| **Writer's Loop**     | Technical Writers, PMs | Edit markdown, reference a moved file | IDE underlines the broken link; Quick Fix heals it           |
| **Developer's Loop**  | Engineers              | Modify a core utility                 | "Ripple Effect" shows every impacted file (code + docs)      |
| **Explorer's Loop**   | Architects, Onboarders | Run the Visualizer                    | Interactive Circuit Board / Local Map / Force Graph views    |
| **Maintainer's Loop** | Leads, Ops             | Prepare a commit                      | SlopCop audits block if links, symbols, or assets are broken |

---

## Prerequisites

- **Node.js 22.x** (see `.nvmrc`)
- **VS Code 1.91+** (optional — CLI works standalone)
- Git tooling for large workspace diffs

---

## Bootstrap the Workspace

```powershell
# 1. Clone and install
git clone https://github.com/jfjordanfarr/Live-Documentation.git
cd Live-Documentation
npm install

# 2. Build packages
npm run build

# 3. Generate the world
npm run live-docs:generate

# 4. Verify the truth
npm run graph:audit
```

For VS Code extension development, launch the `Launch Extension` configuration. The language server exposes regeneration and lint services once the dev host is ready.

---

## Configure Live Documentation

Live Docs are configured via a JSON config file (or CLI flags).

This repository uses `.live-docs.config.json` at the repo root. For your own repo, you can start by copying it or creating a new config file.

Example (new repo): create `live-docs.config.json` at your repo root:

```json
{
  "root": ".live-documentation",
  "baseLayer": "source",
  "extension": ".md",
  "slugDialect": "github",
  "requireRelativeLinks": true,
  "glob": [
    "packages/**/src/**/*.{ts,tsx,js,jsx,mjs,cjs,mts,cts}",
    "scripts/**/*.{ts,tsx,mjs,cjs}",
    "tests/**/*.{ts,tsx,js,jsx,mjs,cjs,mts,cts,cs,cshtml,py,java,rb,rs,c,cpp,h,html,css,json,ps1,psm1}"
  ]
}
```

Then point the generator to it:

```powershell
npm run live-docs:generate -- --config live-docs.config.json
```

This repository uses an internal MDMD convention and overrides these defaults via `.live-docs.config.json`.

### Implementation References (for curious readers)

- Generator CLI entrypoint: [`scripts/live-docs/generate.ts`](../../scripts/live-docs/generate.ts)
- Inspect CLI entrypoint: [`scripts/live-docs/inspect.ts`](../../scripts/live-docs/inspect.ts)
- Explorer server entrypoint: [`packages/scripts/src/live-docs/explorer/server/index.ts`](../../packages/scripts/src/live-docs/explorer/server/index.ts)
- Static Explorer builder: [`packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts`](../../packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts)

**Key Options**

| Setting                | Default               | Purpose                                                   |
| ---------------------- | --------------------- | --------------------------------------------------------- |
| `root`                 | `.live-documentation` | Filesystem root for staged docs                           |
| `baseLayer`            | `source`              | Folder mirroring the source tree                          |
| `extension`            | `.md`                 | Output extension for Live Docs                            |
| `slugDialect`          | `github`              | Header slug strategy (`github`, `azure-devops`, `gitlab`) |
| `requireRelativeLinks` | `true`                | Forces relative links for repo-backed wikis               |
| `glob`                 | `[...]`               | Glob patterns defining which assets receive Live Docs     |

---

## The Explorer: Visual Understanding

The Live Documentation Explorer provides three interactive views for navigating your codebase visually.

### Launch the Explorer Server

```powershell
npm run live-docs:visualize
# Opens http://localhost:3000
```

### Three Views

| View              | Purpose                                                                                       | Best For                                                              |
| ----------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Circuit Board** | Macroscopic "motherboard" map showing clusters and hubs                                       | Architecture overview, identifying hotspots                           |
| **Local Map**     | 3-column layout: Inbound → Active Node → Outbound (plus an optional From/To pathfinding mode) | Understanding a single file's relationships; tracing multi-hop chains |
| **Force Graph**   | Physics-based network visualization                                                           | Discovering unexpected connections                                    |

### Explorer Features

- **Hover highlighting**: Dim unrelated connections to trace symbol-to-symbol relationships
- **Sticky pins**: Click a symbol to "pin" the highlight (mobile-friendly)
- **Type reference badges**: Click cyan badges to navigate to type definitions
- **Test-backed glow**: Purple shadow indicates files with test coverage
- **Detail panel**: Full markdown rendering of the selected artifact's Live Doc
- **Non-headless inspect (From/To)**: Provide `From` and `To` endpoints in the Local Map and the explorer auto-runs (debounced) pathfinding to render the multi-hop chain or a deterministic “no connection” result.

### Headless JSON API

For automation and AI-assistant use, query the Local Map data directly:

```powershell
# Get structured JSON for any node's neighborhood
Invoke-RestMethod "http://localhost:3000/local-map?nodeId=packages/shared/src/live-docs/core.ts&pretty=1"
```

Returns: center node, upstream/downstream neighbors, edges with symbol anchors, layout statistics.

---

## Static Site Export (GitHub Pages)

Generate a fully static Explorer bundle for hosting anywhere:

```powershell
npm run live-docs:visualize:static
# Output: dist/explorer/ (~5MB for a 600-node workspace)
```

**What's Bundled**:

- `index.html` — Self-contained viewer
- `explorer-data.json` — Graph (nodes, links), symbol index, all Live Doc markdown
- Provenance metadata (commit hash, generator version, timestamp)

**Deployment**:

```powershell
# Copy to any static host
Copy-Item dist/explorer/* /path/to/gh-pages/ -Recurse

# Or serve locally for testing
npx serve dist/explorer
```

The static bundle works offline, embeds in Teams/Slack cards, and survives vendor switches.

---

## Trace Dependency Paths (Inspect CLI)

The inspect CLI provides "Oracle of Bacon" style pathfinding through the Live Doc graph.

### Walk Outbound or Inbound Chains

```powershell
npm run live-docs:inspect -- --from packages/server/src/main.ts --to packages/shared/src/types.ts --json
```

Output kind: `"path"` with `nodes` array tracing each hop, plus a `hops` collection mirroring the rendered edges. Add `--direction inbound` to reverse the traversal.

### List Terminal Fan-Out

```powershell
npm run live-docs:inspect -- --from packages/server/src/main.ts --direction outbound --json
```

Omitting `--to` returns kind: `"fanout"` alongside `terminalPaths` up to `maxDepth` (default 25). Use this before risky edits to see where data ultimately lands.

### Diagnose Missing Edges

```powershell
npm run live-docs:inspect -- --from packages/server/src/foo.ts --to packages/shared/src/bar.ts --json
```

When no path exists: exits code 1, reports kind: `"not-found"`, and enumerates a `frontier` array with reasons (`terminal`, `max-depth`, `missing-doc`).

### Quick Summary (Default Mode)

```powershell
npm run live-docs:inspect -- packages/shared/src/live-docs/core.ts
```

Without `--from`/`--to` flags, emits a markdown summary of the artifact's Live Doc metadata (useful for Copilot prompt fuel).

---

## Stage 0: Generate

**Goal**: Materialise Live Docs for your workspace.

```powershell
# Dry-run first to see what would change
npm run live-docs:generate -- --dry-run

# Execute when satisfied
npm run live-docs:generate

# Regenerate only recently modified files
npm run live-docs:generate -- --changed
```

**What gets created**:

- `Metadata` frontmatter: Live Doc ID, archetype, source path, provenance hash
- `Purpose` / `Notes` headers seeded from templates — **you write these**
- `Public Symbols` / `Dependencies` / `Observed Evidence` — **machine-generated** (fenced with HTML markers)

**Editing rules**: Populate the authored sections manually. Never edit inside `<!-- LIVE-DOC:BEGIN ... -->` fences — lint fails if you do.

---

## Stage 1: Lint

**Goal**: Validate structure before commits.

```powershell
npm run live-docs:lint
```

**What's enforced**:

- Relative links only (no absolute paths)
- Generated-marker integrity (fences intact)
- Evidence presence (unless waived)
- Slug dialect compliance (`github`, `azure-devops`, `gitlab`)

**Wire into safe-commit**: The repo's `npm run safe:commit` already chains the lint pass. Every commit validates Live Doc structure automatically.

---

## Stage 2: Explore

**Goal**: Navigate the dependency graph visually.

```powershell
# Interactive server
npm run live-docs:visualize

# Static bundle for hosting
npm run live-docs:visualize:static

# CLI pathfinder
npm run live-docs:inspect -- --from <path> --to <path>
```

Use the Explorer to identify:

- Architectural hotspots (Circuit Board)
- Single-file impact (Local Map)
- Unexpected connections (Force Graph)

---

## Stage 3: Sustain

**Goal**: Integrate Live Docs into daily workflow.

### Daily Commands

| Task                    | Command                                      |
| ----------------------- | -------------------------------------------- |
| Regenerate after edits  | `npm run live-docs:generate -- --changed`    |
| Trace dependencies      | `npm run live-docs:inspect -- --from <path>` |
| Validate before commit  | `npm run safe:commit`                        |
| Audit coverage gaps     | `npm run graph:audit`                        |
| Visualize relationships | `npm run live-docs:visualize`                |

### CI Integration (Coming Soon)

```yaml
# Tier 1: Every push (<3min)
- npm audit
- npm run lint
- npm run build
- npm run test:unit

# Tier 2: Nightly (~15min)
- npm run test:integration
- npm run live-docs:generate
- npm run live-docs:visualize:static
- Deploy to GitHub Pages

# Tier 3: Pre-release (manual)
- npm run safe:commit -- --benchmarks
```

---

## CLI Reference

| Command                                            | Purpose                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `npm run live-docs:generate`                       | Regenerate Live Docs (supports `--dry-run`, `--changed`)                              |
| `npm run live-docs:lint`                           | Validate structural markers, links, slug dialect                                      |
| `npm run live-docs:inspect -- <path>`              | Emit markdown summary for an artifact                                                 |
| `npm run live-docs:inspect -- --from <a> --to <b>` | Find path between two artifacts                                                       |
| `npm run live-docs:visualize`                      | Launch interactive Explorer server                                                    |
| `npm run live-docs:visualize:static`               | Build static bundle for hosting                                                       |
| `npm run live-docs:system`                         | Materialise System views (default output: `AI-Agent-Workspace/tmp/system-cli-output`) |
| `npm run live-docs:migrate -- --dry-run`           | Audit drift between staged docs and `.mdmd/layer-4/`                                  |
| `npm run graph:audit`                              | Flag files missing Live Docs or evidence                                              |
| `npm run graph:snapshot`                           | Rebuild SQLite cache and JSON fixture                                                 |

### ~~LLM Enrichment~~ _(Descoped 2026-02-17)_

> LLM integration has been removed from the project scope. Users bring their own AI assistants and consume Live Docs as structured context. This eliminates trust, safety, and cost concerns from the tool itself.

~~| Command | Purpose |~~
~~|---------|---------|~~
~~| `npm run live-docs:enrich -- --scope <path>` | Extract semantic relationships via LLM (requires explicit invocation, budget-capped) |~~
~~| `npm run live-docs:synthesize -- --file <path>` | Generate human-readable prose for `_Pending authored purpose_` placeholders |~~

~~Both commands stage outputs with provenance metadata and require human promotion. No background LLM calls occur without explicit user invocation.~~

### Brownfield Integration

Existing markdown (READMEs, ADRs, design notes) is never overwritten by `live-docs:generate`. Link-connected brownfield docs appear in the Force Graph as read-only nodes when "Show Related Documentation" is enabled. This single checkbox controls visibility of all link-connected markdown (System-layer docs, brownfield docs, chat history).

**Force Graph visualization** (shipped 2026-01-08):

- Purple nodes (#9966cc) with smaller size distinguish Related Docs from Live Docs
- Single-hop link discovery: 452 unique links found, 60 files bundled
- Click handling opens Related Docs in the Detail Panel
- Circuit Board/Local Map buttons hidden for non-Live-Doc nodes

**Export options** (shipped 2026-01-09):
The Knowledge Sources panel includes an "Export Documentation" section with:

- **Bundle type dropdown**: Live Docs / Related Docs / All Documentation
- **Format radio buttons**: Flattened Markdown / ZIP Archive
- ZIP archives preserve directory structure with `live-docs/` and `related-docs/` folders

For the full catalogue, see [CLI Reference](../../.mdmd/layer-1/guides/cli-reference.mdmd.md).

---

## Polyglot Support

Live Documentation analyzes multiple languages via its adapter system:

| Language              | Adapter                    | Symbols    | Dependencies |
| --------------------- | -------------------------- | ---------- | ------------ |
| TypeScript/JavaScript | Built-in (TS Compiler API) | ✅ Full    | ✅ Full      |
| C#                    | tree-sitter                | ✅ Partial | ✅ Partial   |
| Python                | tree-sitter                | ✅ Partial | ✅ Partial   |
| Rust                  | tree-sitter                | ✅ Partial | ✅ Partial   |
| C/C++                 | tree-sitter                | ✅ Partial | ✅ Partial   |
| Java                  | tree-sitter                | ✅ Partial | ✅ Partial   |
| Ruby                  | tree-sitter                | ✅ Partial | ✅ Partial   |
| Go                    | tree-sitter                | 🚧 Planned | 🚧 Planned   |

Tree-sitter adapters extract symbols and dependencies through pattern matching. The benchmark suite (`npm run test:benchmarks -- --mode ast`) validates extraction accuracy.

---

## Implementation Traceability

Core implementation lives in:

- [packages/shared/src/live-docs/](../../packages/shared/src/live-docs/) — Core contracts (metadata types, frontmatter schema)
- [scripts/live-docs/](../../scripts/live-docs/) — CLI entry points (generate, inspect, lint, system, migrate)
- [packages/server/src/features/live-docs/](../../packages/server/src/features/live-docs/) — Server-side orchestration

Copilot instruction files that govern Live Doc authoring:

- `.github/instructions/mdmd.layer4.instructions.md` — Authored/generated schema
- `.github/instructions/mdmd.instructions.md` — General MDMD conventions

---

## Getting Help

- **Full CLI reference**: [CLI Reference](../../.mdmd/layer-1/guides/cli-reference.mdmd.md)
- **Architecture**: [.mdmd/layer-3/](../../.mdmd/layer-3/)
- **Development journey**: [AI-Agent-Workspace/Notes/Project Development Journey.md](../../AI-Agent-Workspace/Notes/Project%20Development%20Journey.md)
- **Chat history**: [AI-Agent-Workspace/ChatHistory/](../../AI-Agent-Workspace/ChatHistory/) — Fully auditable dev decisions

Keep this guide close as you onboard. Live Documentation's goal: **for any change in any file, provide the definitive answer to "What other files will be impacted?"**
