# Live Documentation

**A map of any codebase. Offline, static, shareable, markdown-first.**

> Point Live Documentation at any folder of interconnected files, and it reveals the public connection surface between them—generating markdown documents that serve as a **lightweight, verifiable AST** for your entire workspace.

Live Documentation is a CLI suite and a static Explorer that turn any codebase into a **navigable, shareable graph of what connects to what**.

**[🔗 Explore the Live Demo →](https://jfjordanfarr.github.io/Live-Documentation/)**

---

## Quick Links

| Guide                                                                          | Description                                               |
| ------------------------------------------------------------------------------ | --------------------------------------------------------- |
| [Getting Started](.mdmd/layer-1/guides/getting-started.mdmd.md)                | Installation, configuration, and your first session       |
| [Tracing Impact](.mdmd/layer-1/guides/tracing-impact.mdmd.md)                  | Dependency pathfinding and "what will this change break?" |
| [Visualizing Your Codebase](.mdmd/layer-1/guides/visualizing-codebase.mdmd.md) | Explorer views, shareability, and static exports          |
| [CLI Reference](.mdmd/layer-1/guides/cli-reference.mdmd.md)                    | Complete command catalog                                  |

---

## The Core Insight

Software is a web of interconnected files. Understanding that web has always required holding complex mental models, reading code line-by-line, or trusting ephemeral AI explanations.

**Live Documentation takes a different approach**: we generate a markdown file for every source file, using **markdown headers as lightweight AST nodes** and **markdown links as edges**. The result is a **pseudocode surface of your entire workspace**—a common language that:

- **Engineers** can inspect for ripple effects before merging
- **Architects** can explore visually without reading implementation details
- **Non-technical stakeholders** can navigate to understand what the system does
- **Agents** can read, like anyone else, given the hosted site or the file

This shared representation closes the gap between the people who build a system and the people who need to understand it.

---

## What Makes This Different

### The Bridge Between Blueprints and Code

If you've ever used node-based visual programming (Unreal Blueprints, Blender nodes, Max/MSP), you know the power of seeing connections explicitly. But "real" code lives in text files, and the connections between them are implicit—hidden in import statements and function calls.

**Live Documentation makes those connections explicit and visual.** Every public symbol becomes a navigable anchor. Every dependency becomes a traceable edge. The Explorer lets you zoom from macro (entire workspace) to micro (individual symbols) without leaving the map.

### Shareable Understanding

Found a critical dependency path? **Share the link.** The Explorer generates stable URLs for any node, any path, any view. When you need to explain "here's exactly how data flows from A to B," you send a hyperlink—not a wall of text or a screenshot that goes stale.

### Durable Truth

- **Cloud wikis** drift from code. **AI chat contexts** vanish when the session ends. **Just-in-time maps** disappear when you close the tab.
- **Live Documentation** writes the intelligence _back into your repo_. It travels with your code, works offline, and survives any vendor switch. Delete the cache? Regenerate it deterministically.

### Written for people, readable by a machine

Every CLI command has a `--json` mode, and the Explorer reads the same graph index the CLI does, so whatever a person can learn by clicking, a script can learn by a command. Live Documentation calls no model and makes no network request. It is not shaped around feeding a coding agent context: an agent you point at a hosted Explorer, or hand the bundle, can read the same map as anyone else, and that is all it promises.

---

## How It Works

Live Documentation turns your workspace into a navigable markdown graph:

1. **Discovery**: Selects source artifacts via configurable glob patterns.
2. **Analysis**: Extracts public symbols and dependency edges (language-aware where possible).
3. **Materialization**: Writes deterministic markdown mirrors—each file gets a `.md` companion with headers for every public symbol.
4. **Exploration**: The Explorer's views (Knowledge Sources, World Map, Local Map) and CLI commands let you navigate, trace paths, and share links.
5. **Consumption**: Reviewers, CI checks and any agent you hand it to read the same markdown.

---

## The Explorer: See Your Code Like Never Before

Live Documentation includes a visual Explorer with three navigable views over one graph:

| View              | Purpose                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Knowledge Sources** | The graph’s inventory, related documentation and exports |
| **World Map**     | The outside: systems as closed pieces on a board, doors where they offer and use openings, wires between them     |
| **Local Map** | Files, symbols and directories in 2D, or file connectivity in 3D; the representation is remembered and travels in shared links |

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

- **TypeScript / JavaScript**: the TypeScript compiler API resolves public symbols and module dependencies.
- **C#, Python, Java, Go, Rust, C and C++**: tree-sitter parsers, with names resolved by each language's own rules (namespaces, packages, modules, crates, include directories) and measured against the compiler's resolution through SCIP indexers.
- **PowerShell**: a tree-sitter parser, on a grammar the engine builds and ships until upstream takes its fix, for functions with their comment-based help, classes and enums, what a module exports, and dot-sources, module imports, `using module` and `#requires`, paths found as Windows finds them; a module manifest (`.psd1`) is read as a manifest. Measured against PowerShell's own parser. No PowerShell installation is needed to generate docs.
- **Ruby**: a hand-written scanner for symbols and for requires; no compiler oracle yet.
- **ASP.NET markup**: `.aspx`, `.ascx`, `.cshtml`, `.razor`, connected to code-behind and configuration conventions.
- **.NET configuration and SQL**: the addresses and connection strings of `web.config` and `app.config`, and the procedures, tables and views of `.sql` files, read as the openings a system offers and uses.
- **Manifests**: `.csproj`, `packages.config`, `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `pom.xml` and a PowerShell module's `.psd1`, read as what a project stands on and what it starts.
- **HTML / CSS / JSON**: asset and reference extraction.

---

## Competitive Landscape

| Feature              | **Live Documentation**        | **Google CodeWiki**    | **Windsurf Codemaps** | **GitLab Knowledge Graph** |
| :------------------- | :---------------------------- | :--------------------- | :-------------------- | :------------------------- |
| **Primary Goal**     | **Falsifiable Truth**         | Exploration & Search   | Flow State & Speed    | Cross-Project Intelligence |
| **Hosting**          | **Local & Git-based**         | Cloud-hosted           | Local (Session-based) | Server-side                |
| **Durability**       | **High** (Version Controlled) | Low (External Service) | Low (Ephemeral)       | High (Database)            |
| **Offline Access**   | **100%**                      | No                     | Yes                   | No                         |
| **Shareable Links**  | **Yes** (stable URLs)         | Yes                    | No                    | Yes                        |
| **Machine-readable** | **Yes** (`--json` everywhere) | No                     | No                    | API only                   |
| **Cost**             | **Free** (MIT License)        | Free (Public Repos)    | Paid                  | Enterprise                 |

**The key difference**: Other tools own the data or let it vanish. Live Documentation writes intelligence _back into your repo_ where it belongs.

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
- **Everything a path reaches**: `--reachable` lists every file a path reaches from `--from`, nearest first, with its hops; without `--from`, the entry points the docs declare, what they reach, what nothing reaches and what only a test reaches
- **Machine-readable output**: add `--json` for AI/automation consumption

### Visualization Explorer

```powershell
npm run live-docs:visualize             # Static Explorer bundle in dist/explorer/; this repository's build carries its own board
npm run live-docs:board -- <board.md>   # Read a board, check it against the docs, and print its things, doors and wires
```

### Quality Gates

- `npm run live-docs:lint` — validate Live Doc structure and coverage

For contributors to this repository:

- `npm run safe:commit` — full readiness gate (lint + tests + audits)
- `npm run slopcop:markdown` — verify every markdown link is valid

---

## Security & Privacy

- **Offline-first**: No telemetry. No external HTTP calls required for core functionality.
- **No lifecycle scripts**: `postinstall`/`preinstall` hooks are explicitly avoided.
- **No network access**: the tool makes no network requests at all, not even to localhost. See [SECURITY.md](SECURITY.md) for how to verify that.

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

```bash
# Prerequisites: Node.js 22.x

npm install
npm run build
npm run live-docs:generate   # Materialize the graph
npm run live-docs:visualize  # Build the Explorer into dist/explorer/, then serve that folder
```

---

## License

MIT — use it, fork it, ship it.
