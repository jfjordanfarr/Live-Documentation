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

Which view the page opens on depends on the bundle: the **World Map** when it was built with a board (`--board <board.md>`), otherwise the **Membrane Map**. The sidebar switches between views, and **Back** and **Forward** retrace your moves between views, files and folders; pins, pan and zoom change the current place without adding a step.

### World Map

The outside of an estate: each system a closed piece on a board, with blue doors where it offers an opening (a route, a service address, a stored procedure, a table) and green doors where it uses one, wires door to door, districts as tints, and a declared tunnel where a wire crosses between them. What a piece stands on hangs beneath it. Drag to orbit, scroll to zoom; a hover peeks, and a click pins a panel in which every name is a link. Wheel in on a piece, double-click it, or follow the link in its panel to open it into the Membrane Map focused on its folder. Pieces sit where you put them; **save board** downloads the board text with the positions written in. The board text's grammar is in [Boards](../../layer-3/boards.mdmd.md).

### Local Map

One file in the centre with the files it uses on the left and the files that use it on the right, its public symbols as rows, and a wire from the blue pin of the file that offers a symbol to the green pin of the file that uses it. Click a file to retain its whole neighbourhood, or pin one symbol to retain only that: every retained file keeps its neighbourhood, every reference among the retained files is drawn, and the clicked card stays where it was while the rest arranges around it. Directories are drawn as bands behind the cards. Hovering a symbol fades everything not connected to it. From and To inputs find a path (see [Tracing Impact](tracing-impact.mdmd.md)). The **3D** control, or wheeling out past a deliberate boundary, folds the cards into named points that take their places in the Force Graph; the same gesture in reverse brings them back.

### Force Graph

The whole workspace as a physics layout, one line per pair of files that reference each other, with its count. Files that talk to each other settle near each other, which makes this the quickest way to see a system's natural clusters and its outliers. Markdown documents linked from Live Docs (READMEs, design notes) appear as smaller purple nodes, and asset files such as JSON manifests as grey ones when **Show Assets** is on. Drag to rotate, scroll to zoom; a search or a link centres the camera on a file without losing the direction you were looking from. Click a node to select and centre it; the **2D** control, or wheeling in past the boundary, opens it in the Local Map.

### Membrane Map

Your workspace as nested membranes: directories contain directories, and files sit inside them as cards. A breadcrumb at the top shows where you are; use a directory's **Explore** control to drill in and the breadcrumb to climb back out.

- A file card starts collapsed, showing its name, path and symbol count. Click it to expand its symbol rows.
- Each symbol row has an inbound pin on the left and an outbound pin on the right. **Pin** a symbol (or **pin all** on a card) and the map re-lays itself as a left-to-right dependency flow: what feeds the pinned symbol on one side, what depends on it on the other, with connection lines between pins. Directory membranes persist as bands across the flow so you keep your bearings.
- Hovering a symbol fades everything not connected to it. Pinning keeps that focus.
- **Back to Browse** returns to the directory view.

### Knowledge Sources

What the bundle is (its docs root, its files by kind, directory and extension, when they were generated), the files most used and most using, the files and public symbols that nothing references or only tests reference, and the related markdown that Live Docs link to. Every file named is a button that opens it in the detail panel; every directory counted is a door into the Local Map. The lists say only what the docs say: an entry point a script names and a file nothing needs look alike there. The export controls described below live here too.

### Circuit Board

An earlier directory treemap, still present.

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

The Knowledge Sources view can download the documentation as a single flattened markdown file or as a ZIP that preserves directory structure, for the Live Docs alone, the related markdown alone, or both; and the panel's own facts as one JSON file, so that what it shows can be handed on as data.

---

## Troubleshooting

### The Explorer shows stale data

The bundle is a snapshot. After regenerating Live Docs, rebuild it with `npm run live-docs:visualize`.

### Files are missing

Only files with Live Docs appear. Check your `glob` configuration and run `npm run live-docs:generate`.

### The Force Graph is slow

At a thousand nodes or more the physics layout gets sluggish. Use the Local Map or the Membrane Map for reading and the Force Graph for the overview.

---

## Related Guides

- [Getting Started](getting-started.mdmd.md)
- [Tracing Impact](tracing-impact.mdmd.md)
- [CLI Reference](cli-reference.mdmd.md)
