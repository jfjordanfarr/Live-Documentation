# Live Documentation

**The Offline-First, Falsifiable Truth for Your Codebase.**

> **Documentation should be a compilation target, not a creative writing exercise.** Live Documentation treats markdown as a structured artifact derived directly from your code, ensuring that what you read matches what you run.

Live Documentation is a VS Code extension and CLI suite that mirrors every tracked workspace artifact into **deterministic, machine-verified markdown** stored locally under `/.live-documentation/`.

It is a **falsifiable graph of knowledge** that lives in your repo, works offline, and guarantees provenance.

**[🔗 Explore the Live Demo →](https://jfjordanfarr.github.io/Live-Documentation/)**

---

## The Challenge: Durable Intelligence

In the age of AI, generating documentation is easy. Ensuring its **correctness** and **longevity** is the real challenge.

- **Cloud-hosted wikis** often drift from the codebase they describe.
- **AI chat contexts** are powerful but ephemeral; the insight vanishes when the session ends.
- **"Just-in-time" maps** provide great transient understanding but leave no permanent artifact for the team.

Live Documentation bridges this gap by creating a **permanent, audit-proof library** inside your own project.

---

## Core Philosophy: The Pit of Success

Live Documentation is designed to make correctness automatic. Point it at any directory of interconnected files, and it finds the public connection surface between them—generating markdown documents with headers for each public symbol that serve as a **lightweight, verifiable AST**.

1. **Markdown as AST**: We treat markdown files as Abstract Syntax Trees. They are structured data nodes linked to your code.
2. **Offline-First**: No API keys. No cloud dependencies. Your documentation is generated locally and stored in Git.
3. **Automatic Correctness**: We don't nag you to update docs—we generate them from your source code directly.
   - *The Old Way:* You forget to update the docs. A user complains 6 months later.
   - *The Live Doc Way:* You run `live-docs:generate`. The documentation is 100% correct automatically. **No busywork. No drift.**

---

## Competitive Landscape

Live Documentation is designed to complement, not replace, other tools in the ecosystem by focusing on **local ownership** and **determinism**.

| Feature | **Live Documentation** | **Google CodeWiki** | **Windsurf Codemaps** | **GitLab Knowledge Graph** |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Goal** | **Falsifiable Truth** | Exploration & Search | Flow State & Speed | Cross-Project Intelligence |
| **Hosting** | **Local & Git-based** | Cloud-hosted | Local (Session-based) | Server-side |
| **Truth Source** | **Deterministic AST** | AI Generation | AI Annotation | Language Server Index |
| **Offline Access** | **100%** | No | Yes | No |
| **Durability** | **High** (Version Controlled) | Low (External Service) | Low (Ephemeral) | High (Database) |
| **Cost** | **Free** (Open Source) | Free (Public Repos) | Paid Product | Paid Enterprise Feature |

**Why this matters:**

- **CodeWiki** and **GitLab's Knowledge Graph** are powerful, but they own the data. If you leave their platform, you lose the intelligence.
- **Windsurf's CodeMaps** are incredible for speed, but the map disappears when you close the tab.
- **Live Documentation** writes the intelligence *back into your repo*. It travels with your code, works offline, and survives any vendor switch.

---

## CLI Tooling Reference

### The Pathfinder (LD-402)

```powershell
npm run live-docs:inspect -- --from <path>
```

Traces the dependency graph to answer "What does this touch?" or "What touches this?". This is the **"Oracle of Bacon" for code**: find the shortest path between any two artifacts.

- **Hop-chain tracing**: `npm run live-docs:inspect -- --from <path> --to <path>`
- **Reverse lookup**: `npm run live-docs:inspect -- --from <path> --direction inbound`
- **Machine-readable output**: add `--json`

### Visualization Explorer

```powershell
npm run live-docs:visualize
```

Starts a local Explorer server with Circuit Board (treemap), Local Map (3-column symbol view), and Force Graph views. Also exposes a headless endpoint: `GET /local-map?nodeId=<path>`.

### Static Export

```powershell
npm run live-docs:visualize:static
```

Builds a fully static Explorer bundle to `dist/explorer/` for offline viewing or GitHub Pages deployment.

### Generate Live Docs

```powershell
npm run live-docs:generate
```

Scans your workspace and materializes the documentation mirror. Add `-- --dry-run` to preview changes.

### Quality Gates

- `npm run safe:commit` — the full readiness gate (lint + tests + audits + reports).
- `npm run slopcop:markdown` — verifies every markdown link in your project.
- `npm run graph:audit` — audits documentation coverage expectations against the workspace.

---

## Security Posture

- **Offline-first**: No telemetry. No external HTTP calls required for core functionality.
- **No lifecycle scripts**: `postinstall`/`preinstall` hooks are explicitly avoided.
- **Localhost-only LLM access**: Optional LLM provider defaults to none; when enabled, only local endpoints (Ollama, VS Code's configured provider) are used.

---

## Native Dependencies (better-sqlite3)

Some workflows require native bindings for both Node and VS Code's Electron runtime. If tests fail due to ABI mismatch, run:

```powershell
npm run rebuild:better-sqlite3:force
```

---

## Roadmap

- **Codebase-Mirrored Live Documentation**: **Complete**. (Supports TS, C#, Python, Ruby, Rust, Java, C, PowerShell).
- **Docstring Extraction (code→docs)**: **Complete**. (Adapters harvest TypeScript/JSDoc, Python, Ruby, Rust, PowerShell comment-based help).
- **"Oracle of Bacon" Visual Pathfinder**: **In Progress**. (Non-headless Explorer UI for symbol↔symbol hop-chain tracing—the visual equivalent of `live-docs:inspect --from --to`).
- **Docstring Write-Back (docs→code)**: **Wishlist**. (External LLM agents already handle this well; we focus on the map).

---

## Future Vision

- **Universal Showcase**: Point us at any public repo, and we materialize its graph instantly in the browser. No install required.
- **Greenfield Generative UX**: A document-based interface where you write pseudocode (Live Docs), and the system generates implementation skeletons.

---

## About "MDMD" (Internal Convention)

This repository uses a four-layer documentation convention under `.mdmd/` as an internal organization strategy. Consumers of Live Documentation are not required to adopt this convention—by default, output goes to `/.live-documentation/source/`.

---

## Getting Started

### Prerequisites

- Node.js 22.x (see `.nvmrc`)
- VS Code 1.91+ (for extension features)

### Installation

```powershell
npm install
npm run build
npm run live-docs:generate
npm run graph:audit
```
