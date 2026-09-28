# Getting Started with Live Documentation

## Metadata

- Layer: 1
- Guide Type: getting-started

Live Documentation turns a folder of source files into a map you can look at. This guide walks through a first session: install, generate the markdown mirror, build the Explorer, trace a dependency.

---

## Prerequisites

- **Node.js 22** (see `.nvmrc`)
- **Git**

---

## Installation

Live Documentation is not yet published to npm. Install from source:

```bash
git clone https://github.com/jfjordanfarr/Live-Documentation.git
cd Live-Documentation
npm install
npm run build
```

---

## Your First Session

### Step 1: Generate the documentation mirror

Live Documentation writes one markdown file per source file. Each Live Doc has:

- **Authored sections** (`Purpose`, `Notes`), which you write and which survive regeneration
- **Generated sections** (`Public Symbols`, `Dependencies`), which the tool maintains

```bash
# Preview what would be written
npm run live-docs:generate -- --dry-run

# Write the mirror
npm run live-docs:generate
```

Output lands in `.live-documentation/source/` by default, mirroring your source tree.

### Step 2: Build and open the Explorer

The Explorer is a static web page built from the mirror:

```bash
npm run live-docs:visualize
npx serve dist/explorer
```

It opens on the **Membrane Map**: your directories as nested membranes, files as cards. Click a card to see its symbols; pin a symbol to trace what flows in and out of it. The **Force Graph** shows the whole workspace as a physics layout, and **Knowledge Sources** reports graph statistics and health warnings. Two earlier views, Circuit Board and Local Map, are still present and are being folded into the Membrane Map. See [Visualizing Your Codebase](visualizing-codebase.mdmd.md).

### Step 3: Trace a dependency path

```bash
npm run live-docs:inspect -- --from src/core/auth.ts --to src/api/endpoints.ts
```

The same question can be asked in the Explorer: the Local Map view takes From and To artifacts, and pinning symbols in the Membrane Map follows their connections hop by hop. See [Tracing Impact](tracing-impact.mdmd.md).

### Step 4: Validate the mirror

```bash
npm run live-docs:lint
```

This checks relative links, generated-marker integrity, and slug dialect compliance.

---

## Configuration

Create `.live-docs.config.json` at the repository root and pass it with `--config`:

```json
{
  "root": ".live-documentation",
  "baseLayer": "source",
  "extension": ".md",
  "slugDialect": "github",
  "requireRelativeLinks": true,
  "glob": ["src/**/*.{ts,tsx,js,jsx}", "lib/**/*.{ts,tsx,js,jsx}"],
  "bundleExclude": ["docs/archive/**"]
}
```

| Setting                | Default               | Purpose                                                                            |
| ---------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| `root`                 | `.live-documentation` | Where Live Docs are written                                                        |
| `baseLayer`            | `source`              | Subfolder mirroring your source tree                                               |
| `extension`            | `.md`                 | File extension for Live Docs                                                       |
| `slugDialect`          | `github`              | Header anchor style (`github`, `azure-devops`, `gitlab`)                           |
| `requireRelativeLinks` | `true`                | Enforce relative links so the mirror works as a repo-hosted wiki                   |
| `glob`                 | `[...]`               | Which files receive Live Docs                                                      |
| `bundleExclude`        | `[]`                  | Linked markdown the Explorer bundle must leave out (large archives, private notes) |

```bash
npm run live-docs:generate -- --config .live-docs.config.json
```

---

## What Can You Do?

| Task                         | How                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| See the shape of a codebase  | Build the Explorer and browse the Membrane Map                                             |
| Trace impact before a change | `live-docs:inspect -- --from A --to B`, or pin the symbol in the Explorer                  |
| Understand why a file exists | Read its `Purpose`; design notes linked from Live Docs appear in the Force Graph           |
| Validate before merge        | `live-docs:lint` in CI or a pre-commit hook                                                |
| Consume as data              | The graph index at `<root>/index.json`, `live-docs:inspect -- --json`, or the raw markdown |

---

## Daily Commands

| Task                   | Command                                      |
| ---------------------- | -------------------------------------------- |
| Regenerate after edits | `npm run live-docs:generate -- --changed`    |
| Trace dependencies     | `npm run live-docs:inspect -- --from <path>` |
| Validate structure     | `npm run live-docs:lint`                     |
| Rebuild the Explorer   | `npm run live-docs:visualize`                |

---

## Troubleshooting

### The Explorer page is blank when opened as a file

Most browsers block the page's data fetch over `file://`. Serve the folder instead (`npx serve dist/explorer`).

### Broken links in Live Docs

```bash
npm run live-docs:lint
```

---

## Related Guides

- [Tracing Impact](tracing-impact.mdmd.md)
- [Visualizing Your Codebase](visualizing-codebase.mdmd.md)
- [CLI Reference](cli-reference.mdmd.md)

---

## What's Next?

1. **Author `Purpose` sections** — replace the `_Pending authored purpose_` placeholders with the sentence a new reader needs.
2. **Regenerate in CI** — run `npm run live-docs:generate` in your pipeline so the mirror never drifts from the code.
3. **Share the Explorer** — `dist/explorer/` is a self-contained static site.
