# Live Documentation

**The Universal Map for Any Codebase. Offline-First. Shareable. AI-Ready.**

> Point Live Documentation at any folder of interconnected files, and it reveals the public connection surface between them—generating markdown documents that serve as a **lightweight, verifiable AST** for your entire workspace.

Live Documentation is a VS Code extension and CLI suite that transforms any codebase into a **navigable, shareable, falsifiable graph of knowledge**.

**[🔗 Explore the Live Demo →](https://jfjordanfarr.github.io/Live-Documentation/)**

---

## The Core Insight

Software is a web of interconnected files. Understanding that web has always required holding complex mental models, reading code line-by-line, or trusting ephemeral AI explanations.

**Live Documentation takes a different approach**: we generate a markdown file for every source file, using **markdown headers as lightweight AST nodes** and **markdown links as edges**. The result is a **pseudocode surface of your entire workspace**—a common language that:

- **Engineers** can inspect for ripple effects before merging
- **Architects** can explore visually without reading implementation details
- **Non-technical stakeholders** can navigate to understand what the system does
- **AI assistants** can consume as structured ground truth

This shared representation closes communication gaps—not just between humans, but between humans and machines.

---

## What Makes This Different

### The Bridge Between Blueprints and Code

If you've ever used node-based visual programming (Unreal Blueprints, Blender nodes, Max/MSP), you know the power of seeing connections explicitly. But "real" code lives in text files, and the connections between them are implicit—hidden in import statements and function calls.

**Live Documentation makes those connections explicit and visual.** Every public symbol becomes a navigable anchor. Every dependency becomes a traceable edge. The Explorer lets you zoom from macro (entire workspace) to micro (individual symbols) without leaving the map.

### Shareable Understanding

Found a critical dependency path? **Share the link.** The Explorer generates stable URLs for any node, any path, any view. When you need to explain "here's exactly how data flows from A to B," you send a hyperlink—not a wall of text or a screenshot that goes stale.

### Durable Truth

- **Cloud wikis** drift from code. **AI chat contexts** vanish when the session ends. **Just-in-time maps** disappear when you close the tab.
- **Live Documentation** writes the intelligence *back into your repo*. It travels with your code, works offline, and survives any vendor switch. Delete the cache? Regenerate it deterministically.

### Machine-Readable by Design

Every CLI command has a `--json` mode. Every visual surface reads from the same underlying graph. When your AI coding assistant needs to know "what depends on this file?" or "what's the shortest path between these two modules?"—it can query the same ground truth that humans see.

---

## How It Works

Live Documentation turns your workspace into a navigable markdown graph:

1. **Discovery**: Selects source artifacts via configurable glob patterns.
2. **Analysis**: Extracts public symbols and dependency edges (language-aware where possible).
3. **Materialization**: Writes deterministic markdown mirrors—each file gets a `.md` companion with headers for every public symbol.
4. **Exploration**: Visual tools (Circuit Board, Local Map, Force Graph) and CLI commands let you navigate, trace paths, and share links.
5. **Consumption**: AI assistants, CI pipelines, and human reviewers all read from the same markdown-as-AST corpus.

---

## The Explorer: See Your Code Like Never Before

Live Documentation includes a visual Explorer with three complementary views:

| View | Purpose |
|------|---------|
| **Circuit Board** | Macro view—see your entire workspace as a treemap of interconnected clusters |
| **Local Map** | Micro view—focus on one file, see its symbols, and trace connections to neighbors |
| **Force Graph** | Discovery view—explore the natural clustering of your codebase through physics simulation |

### Path Mode: The "Oracle of Bacon" for Code

Select a **FROM** artifact and a **TO** artifact, and the Explorer shows you the shortest path between them—hop by hop, symbol by symbol. This is impact analysis made visual: before you change a core utility, see exactly which files depend on it and how.

The same pathfinding is available via CLI:

```powershell
npm run live-docs:inspect -- --from src/auth.ts --to src/api/endpoints.ts
```

### Shareable Links

Every view generates stable URLs. When you need to explain a complex dependency chain, share the link. Your colleagues see exactly what you see—no screenshots, no "scroll down to line 247."

---

## Supported Languages

Live Documentation is polyglot. Support varies by language (some have richer symbol graphs than others), but all are unified into the same markdown mirror format.

- **TypeScript / JavaScript**: Full analysis via the TypeScript compiler API (public symbols + module dependency resolution).
- **C / C++**: Adapter-based symbol + include/import extraction.
- **C#**: Adapter-based symbol + using/namespace extraction; also supports ASP.NET ecosystems via markup files.
- **ASP.NET Markup**: `.aspx`, `.ascx`, `.cshtml`, `.razor` (dependency-centric extraction; connects code-behind + configuration conventions).
- **Java**: Adapter-based symbol + import extraction.
- **Python**: Adapter-based symbol + import/from extraction.
- **Ruby**: Adapter-based symbol + require extraction.
- **Rust**: Adapter-based symbol + use/mod extraction.
- **PowerShell**: Adapter-based extraction for `.ps1`, `.psm1`, `.psd1`.
- **HTML / CSS**: Dependency extraction for assets and references.

---

## Competitive Landscape

| Feature | **Live Documentation** | **Google CodeWiki** | **Windsurf Codemaps** | **GitLab Knowledge Graph** |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Goal** | **Falsifiable Truth** | Exploration & Search | Flow State & Speed | Cross-Project Intelligence |
| **Hosting** | **Local & Git-based** | Cloud-hosted | Local (Session-based) | Server-side |
| **Durability** | **High** (Version Controlled) | Low (External Service) | Low (Ephemeral) | High (Database) |
| **Offline Access** | **100%** | No | Yes | No |
| **Shareable Links** | **Yes** (stable URLs) | Yes | No | Yes |
| **AI-Consumable** | **Yes** (`--json` everywhere) | No | No | API only |
| **Cost** | **Free** (MIT License) | Free (Public Repos) | Paid | Enterprise |

**The key difference**: Other tools own the data or let it vanish. Live Documentation writes intelligence *back into your repo* where it belongs.

---

## CLI Reference

### Generate Live Docs

```powershell
npm run live-docs:generate
```

Scans your workspace and materializes the documentation mirror. Add `-- --dry-run` to preview changes.

### The Pathfinder

```powershell
npm run live-docs:inspect -- --from <path>
```

Traces the dependency graph to answer "What does this touch?" or "What touches this?".

- **Hop-chain tracing**: `npm run live-docs:inspect -- --from <path> --to <path>`
- **Reverse lookup**: `--direction inbound` | **Bidirectional**: `--direction both`
- **Machine-readable output**: add `--json` for AI/automation consumption

### Visualization Explorer

```powershell
npm run live-docs:visualize          # Interactive server
npm run live-docs:visualize:static   # Static export for GitHub Pages
```

### Quality Gates

- `npm run safe:commit` — full readiness gate (lint + tests + audits)
- `npm run slopcop:markdown` — verify every markdown link is valid
- `npm run graph:audit` — audit documentation coverage

---

## Security & Privacy

- **Offline-first**: No telemetry. No external HTTP calls required for core functionality.
- **No lifecycle scripts**: `postinstall`/`preinstall` hooks are explicitly avoided.
- **Localhost-only by default**: All network calls are constrained to localhost. See [SECURITY.md](SECURITY.md) for details.

---

## Configuration

Live Documentation adapts to your documentation conventions:

```json
{
  "root": ".live-documentation",
  "baseLayer": "source",
  "extension": ".md",
  "slugDialect": "github"
}
```

This repository uses an internal MDMD convention (`.mdmd/layer-4/*.mdmd.md`) to prove the flexibility. Your project can use whatever structure fits your team.

---

## Getting Started

```powershell
# Prerequisites: Node.js 22.x, VS Code 1.91+

npm install
npm run build
npm run live-docs:generate   # Materialize the graph
npm run live-docs:visualize  # Explore it visually
```

---

## Native Dependencies

Some workflows require native SQLite bindings. If tests fail due to ABI mismatch:

```powershell
npm run rebuild:better-sqlite3:force
```

---

## License

MIT — use it, fork it, ship it.
