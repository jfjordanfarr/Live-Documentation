# Getting Started with Live Documentation

## Metadata
- Layer: 1
- Guide Type: getting-started

Live Documentation transforms any codebase into a **navigable, shareable, falsifiable graph of knowledge**. This guide walks you through your first session: from installation to visual exploration.

---

## Prerequisites

- **Node.js 22.x** (see `.nvmrc`)
- **Git** for version control
- **VS Code 1.91+** (optional — CLI works standalone)

---

## Installation

### From Source (Development)

```powershell
# Clone the repository
git clone https://github.com/jfjordanfarr/Live-Documentation.git
cd Live-Documentation

# Install dependencies
npm install

# Build all packages
npm run build
```

### As an NPM Package (Coming Soon)

```powershell
npm install -g live-documentation
```

---

## Your First Live Docs Session

### Step 1: Generate the Documentation Mirror

Live Documentation creates a markdown file for every source file in your workspace. Each Live Doc contains:

- **Authored sections** (`Purpose`, `Notes`) — you write these
- **Generated sections** (`Public Symbols`, `Dependencies`) — machine-maintained

```powershell
# Preview what would be created
npm run live-docs:generate -- --dry-run

# Generate for real
npm run live-docs:generate
```

Output lands in `.live-documentation/source/` by default (or your configured path).

### Step 2: Explore Visually

Launch the Explorer to see your codebase as an interactive graph:

```powershell
npm run live-docs:visualize
# Opens http://localhost:3000
```

You'll see three complementary views:

| View | Purpose |
|------|---------|
| **Circuit Board** | Macro view — entire workspace as a treemap of interconnected clusters |
| **Local Map** | Micro view — focus on one file, see its symbols, trace connections |
| **Force Graph** | Discovery view — physics-based clustering reveals natural groupings |

### Step 3: Trace a Dependency Path

Wondering how file A connects to file B? Use the pathfinder:

```powershell
npm run live-docs:inspect -- --from src/core/auth.ts --to src/api/endpoints.ts
```

Or use the Explorer's Local Map: enter "From" and "To" artifacts to see the hop-by-hop chain visually.

### Step 4: Validate Your Live Docs

Before committing, ensure your Live Docs are structurally sound:

```powershell
npm run live-docs:lint
```

This validates:
- Relative links (no absolute paths)
- Generated-marker integrity
- Slug dialect compliance

---

## Configuration

Create a `live-docs.config.json` at your repository root:

```json
{
  "root": ".live-documentation",
  "baseLayer": "source",
  "extension": ".md",
  "slugDialect": "github",
  "requireRelativeLinks": true,
  "glob": [
    "src/**/*.{ts,tsx,js,jsx}",
    "lib/**/*.{ts,tsx,js,jsx}"
  ]
}
```

### Key Settings

| Setting | Default | Purpose |
|---------|---------|---------|
| `root` | `.live-documentation` | Where Live Docs are materialized |
| `baseLayer` | `source` | Subfolder mirroring your source tree |
| `extension` | `.md` | File extension for Live Docs |
| `slugDialect` | `github` | Header anchor style (`github`, `azure-devops`, `gitlab`) |
| `requireRelativeLinks` | `true` | Enforce relative links for repo-backed wikis |
| `glob` | `[...]` | Which files receive Live Docs |

Point the generator to your config:

```powershell
npm run live-docs:generate -- --config live-docs.config.json
```

---

## The Four Experience Loops

Live Documentation supports four distinct workflows depending on your role:

| Loop | User | Action | System Response |
|------|------|--------|-----------------|
| **Writer's Loop** | Technical Writers, PMs | Edit markdown, reference a moved file | IDE underlines the broken link; Quick Fix heals it |
| **Developer's Loop** | Engineers | Modify a core utility | "Ripple Effect" shows every impacted file |
| **Explorer's Loop** | Architects, Onboarders | Run the Visualizer | Interactive views reveal structure |
| **Maintainer's Loop** | Leads, Ops | Prepare a release | Lint validates structure before merge |

---

## Daily Commands

| Task | Command |
|------|---------|
| Regenerate after edits | `npm run live-docs:generate -- --changed` |
| Trace dependencies | `npm run live-docs:inspect -- --from <path>` |
| Validate structure | `npm run live-docs:lint` |
| Visualize relationships | `npm run live-docs:visualize` |

---

## Troubleshooting

### Native Module Errors (better-sqlite3)

If tests fail due to ABI mismatch:

```powershell
npm run rebuild:better-sqlite3:force
```

### Missing Live Docs

Run the audit to find gaps:

```powershell
npm run graph:audit
```

### Broken Links in Live Docs

The linter catches invalid references:

```powershell
npm run live-docs:lint
```

---

## Related Guides

- [Tracing Impact](tracing-impact.mdmd.md) — Deep dive into dependency pathfinding
- [Visualizing Your Codebase](visualizing-codebase.mdmd.md) — Explorer features and shareability
- [CLI Reference](cli-reference.mdmd.md) — Complete command catalog

---

## What's Next?

Once you're comfortable with the basics:

1. **Author the `Purpose` sections** — Fill in `_Pending authored purpose_` placeholders in your Live Docs
2. **Set up CI integration** — Add `npm run live-docs:generate` to your pipeline
3. **Export for your team** — Use `npm run live-docs:visualize:static` to create shareable static bundles
