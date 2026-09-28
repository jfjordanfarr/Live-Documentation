# Visualizing Your Codebase

## Metadata

- Layer: 1
- Guide Type: task-tutorial

The Explorer is a static web page that renders your Live Doc graph. This guide covers its views, how to share what you are looking at, and how to publish the bundle.

---

## Building and opening the Explorer

```bash
npm run live-docs:visualize
npx serve dist/explorer
```

`live-docs:visualize` reads the mirror and writes a self-contained bundle to `dist/explorer/`. Open it through any static server; most browsers block the page's data fetch when it is opened as a plain file.

---

## The Views

### Membrane Map (default)

Your workspace as nested membranes: directories contain directories, and files sit inside them as cards. A breadcrumb at the top shows where you are; use a directory's **Explore** control to drill in and the breadcrumb to climb back out.

- A file card starts collapsed, showing its name, path and symbol count. Click it to expand its symbol rows.
- Each symbol row has an inbound pin on the left and an outbound pin on the right. **Pin** a symbol (or **pin all** on a card) and the map re-lays itself as a left-to-right dependency flow: what feeds the pinned symbol on one side, what depends on it on the other, with connection lines between pins. Directory membranes persist as bands across the flow so you keep your bearings.
- Hovering a symbol fades everything not connected to it. Pinning keeps that focus.
- **Back to Browse** returns to the directory view.

### Force Graph

The whole workspace as a physics layout. Files that talk to each other settle near each other, which makes this the quickest way to see a system's natural clusters and its outliers. Markdown documents linked from Live Docs (READMEs, design notes) appear as smaller purple nodes. Drag to rotate, scroll to zoom, click a node to open it.

### Knowledge Sources

Graph statistics and health warnings: files with unusually high fan-out (likely barrel files) or fan-in, and isolated files with no connections at all. The export controls described below live here too.

### Local Map and Circuit Board

Two earlier views that remain available. The Local Map shows one file in the centre with its dependencies on the left and its dependents on the right, symbol wires between them, and From/To inputs for pathfinding (see [Tracing Impact](tracing-impact.mdmd.md)). The Circuit Board is a directory treemap. Both are being folded into the Membrane Map.

---

## Around the views

- **Search** (`Ctrl+P`) finds any file or symbol by name.
- **Show Tests** and **Show Assets** toggle those archetypes in and out of every view.
- The **detail panel** opens when you select a file: its authored `Purpose` and `Notes`, its public symbols, and buttons to open it in another view or download its markdown.
- The **legend** in the sidebar names the colours: inbound is green, outbound is blue, and test-backed files carry a gold outline.

---

## Sharing what you see

Every change to the view — the active view, the focused file, pinned symbols, expanded cards, path endpoints — is written into the page URL. Copy the address bar and send it; the recipient lands on the same picture. Because the bundle is static, the link works from any host that serves the folder, including GitHub Pages.

### The graph as data

The picture is drawn from the graph index, which the generator writes to `<root>/index.json` (`.mdmd/index.json` in this repository) after every run. It holds every Live Doc as parsed, every link resolved to the file it lands on, and each file's inbound and outbound neighbours. Read it directly when you want the data rather than the picture; it is never committed, so regenerate to refresh it.

---

## Publishing the bundle

```bash
npm run live-docs:visualize
```

| Path                 | Contents                                         |
| -------------------- | ------------------------------------------------ |
| `index.html`         | The viewer                                       |
| `explorer-data.json` | The graph index and the bundled related markdown |
| `static/`            | Scripts and styles                               |

Copy `dist/explorer/` to any static host. This repository's own Explorer is published to GitHub Pages by the `pages.yml` workflow.

### Bundle size

Expect roughly 3 MB for 600 files. Everything a Live Doc links to is bundled so it can be read offline; use `bundleExclude` in your config to keep large or private markdown out (see [Getting Started](getting-started.mdmd.md#configuration)).

---

## Exporting documentation

The Knowledge Sources view can download the documentation as a single flattened markdown file or as a ZIP that preserves directory structure, for the Live Docs alone, the related markdown alone, or both.

---

## Troubleshooting

### The Explorer shows stale data

The bundle is a snapshot. After regenerating Live Docs, rebuild it with `npm run live-docs:visualize`.

### Files are missing

Only files with Live Docs appear. Check your `glob` configuration and run `npm run live-docs:generate`.

### The Force Graph is slow

At a thousand nodes or more the physics layout gets sluggish. Use the Membrane Map for navigation and the Force Graph for the overview.

---

## Related Guides

- [Getting Started](getting-started.mdmd.md)
- [Tracing Impact](tracing-impact.mdmd.md)
- [CLI Reference](cli-reference.mdmd.md)
