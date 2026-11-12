# Getting Started with Live Documentation

_Current as of 2026-11-12._

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

The mirror lands where the configuration says, mirroring the source tree: `.mdmd/layer-4/` in this repository, whose `.live-docs.config.json` says so, and `.live-documentation/source/` in a folder with no configuration.

### Step 2: Build and open the Explorer

The Explorer is a static web page built from the mirror:

```bash
npm run live-docs:visualize
npx http-server dist/explorer -a 127.0.0.1 -p 8766 -c-1
```

Then open `http://127.0.0.1:8766/`. The folder must be served: a page opened as a file cannot load its data, and says so. `http-server` comes with this checkout's `npm install`.

A fresh bundle opens on the **World Map** when it carries a board (the one the configuration names as `board`, or `--board <board.md>`), otherwise on the **Local Map** at its entry point or workspace root. A shared or remembered place takes precedence. The Local Map shows files, symbols and directories in 2D, or file connectivity and directory structure in 3D; switch explicitly with the **2D** and **3D** controls. Click an entity to inspect its evidence, use **Pin** to retain its connections, and **Centre** to navigate deliberately. **Knowledge Sources** reports the inventory, entry points and what they reach. See [Visualizing Your Codebase](visualizing-codebase.mdmd.md), including its current 3D usability gaps and accepted remediation target.

### Step 3: Trace a dependency path

```bash
npm run live-docs:inspect -- --from scripts/live-docs/generate.ts --to packages/engine/src/live-docs/core.ts
```

In the Explorer, choose a subject through search, which makes it the newest pin, then use **Path to** to choose a destination from the newest pin. The 2D Local Map shows the detailed route and its direction; making the result equally discoverable in 3D is open remediation work. See [Tracing Impact](tracing-impact.mdmd.md).

### Step 4: Validate the mirror

```bash
npm run live-docs:lint
```

This checks that every Live Doc parses and that its links are relative, and warns about `Purpose` and `Notes` still to be written and about files with no dependencies and no dependents.

---

## Mapping another folder

Live Documentation is not yet published to npm, so another folder is mapped from this checkout. `<folder>` stands for that folder's path:

```bash
npm run live-docs:generate -- --workspace <folder>
npm run live-docs:visualize -- --workspace <folder>
npx http-server dist/explorer -a 127.0.0.1 -p 8766 -c-1
```

The first command writes the folder's Live Docs inside it, under the folder's own `.live-docs.config.json` when it has one and under `.live-documentation/source/` when it has none. The second builds its Explorer into `dist/explorer/` here, with the World Map of the board the folder's configuration names, if it names one. The inspect and lint commands take the same `--workspace <folder>`.

A folder inside another that has Live Docs of its own, such as a sample inside this checkout, is documented with a warning: a scan never lies inside another, so a board that names both reads only the outer one.

---

## Configuration

Put `.live-docs.config.json` at the root of the folder you document; every command reads it from there, and `--config <file>` names another file instead:

```json
{
  "root": ".live-documentation",
  "baseLayer": "source",
  "extension": ".md",
  "slugDialect": "github",
  "requireRelativeLinks": true,
  "exclude": ["vendor/**"],
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
| `glob`                 | every file            | Which files receive Live Docs; by default every file, anywhere, but documents, lock files and what git ignores |
| `exclude`              | `[]`                  | Paths or globs discovery skips: a folder that documents itself, a vendored tree     |
| `bundleExclude`        | `[]`                  | Linked markdown the Explorer bundle must leave out (large archives, private notes) |
| `citedBy`              | `true`                | Whether each doc lists, under `Cited By`, the documents whose links name its file; `false` keeps the related documents to what the docs' own words cite |
| `sampleRoots`          | `[]`                  | Folders of sample programs inside the workspace: their files keep the roles they have in their own program instead of being taken for tests, and the Explorer does not open on their entry points |
| `entryPoints`          | `[]`                  | Paths or globs of files something outside the code starts that no rule finds, such as a bundler's entry; each one's doc says `Entry: declared` |
| `board`                | none                  | The board the Explorer draws its World Map from, as a path from the workspace root; `--board` takes its place, and with neither the Explorer opens on the Local Map |

```bash
npm run live-docs:generate -- --config .live-docs.config.json
```

---

## What Can You Do?

| Task                         | How                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| See the shape of a codebase  | Build the Explorer: open systems in the World Map and explore files and directories in the Local Map |
| Trace impact before a change | `npm run live-docs:inspect -- --from <file> --to <file>`, or pin the symbol in the Explorer   |
| Understand why a file exists | Inspect its `Purpose`; follow related documents in the reader             |
| Validate before merge        | `npm run live-docs:lint` in CI or a pre-commit hook                                          |
| Consume as data              | The graph index at `<root>/index.json`, `npm run live-docs:inspect -- --reachable --json`, or the raw markdown |

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

### The Explorer says it cannot load its data when opened as a file

A browser lets a page opened as a file load nothing beside it. Serve the folder instead: `npx http-server dist/explorer -a 127.0.0.1 -p 8766 -c-1`, then open `http://127.0.0.1:8766/`.

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
