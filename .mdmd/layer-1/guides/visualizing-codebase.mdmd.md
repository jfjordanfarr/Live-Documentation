# Visualizing Your Codebase

_Current as of 2026-10-23. This guide describes the available controls; the known gaps below link to the accepted remediation target._

## Metadata

- Layer: 1
- Guide Type: task-tutorial

The Explorer is a static web page that renders your Live Doc graph. This guide covers its views, how to share an exploration, and how to publish the bundle.

---

## Building and opening the Explorer

```bash
npm run live-docs:visualize
npx serve dist/explorer
```

`live-docs:visualize` reads the mirror and writes a self-contained bundle to `dist/explorer/`. Open it through any static server; most browsers block the page's data fetch when it is opened as a plain file.

---

## The Views

A fresh page opens on the **World Map** when the bundle carries a board (`--board <board.md>`), otherwise the **Local Map** at its entry point or workspace root. A shared or remembered place takes precedence. The sidebar has three views: World Map, Local Map and Knowledge Sources. **Back** and **Forward** retrace places; pins, pan and zoom change the current place without adding a step.

### World Map

The outside of an estate: each system is a piece on a board, with blue doors where it offers an opening and green doors where it uses one. Wires connect doors; regions group pieces; declared crossings describe connections between regions. What a piece stands on hangs beneath it. Imagined pieces are hollow and dashed.

Drag to orbit and scroll to zoom. Hover peeks; click retains an evidence panel. Wheel in on a piece, double-click it, or use the link in its panel to open its folder in the **Local Map**, in the remembered 2D or 3D representation. **Save board** downloads board text with the positions written in. See [Boards](../../layer-3/boards.mdmd.md).

### Local Map

One view has two representations, chosen by the explicit **2D** and **3D** controls. The choice is remembered and travels in shared links. Scrolling zooms within the active representation; it does not switch between them.

In **2D**, files are cards with public symbols as rows and directories as bands behind them. Providers stand to the left of consumers: a wire leaves the offering file's blue pin and enters the using file's green pin. Open a directory to disclose its contents; its name remains available as context.

Click a file, symbol or directory name to **inspect** its evidence. The separate **Pin** action retains its connections; **Centre** deliberately changes the map subject or frames the directory. **More** exposes contextual actions. Inspection, retention and navigation are separate, so reading another file need not move the map. Retaining several files shows their relevant neighbourhoods and references together. Hovering previews connections by fading irrelevant content.

In **3D**, files are spheres and references are aggregated into counted lines between file pairs. Choose **Connections** for the layout shaped by documented references, or **Structure** for directory hubs joined by containment. In Structure, references are revealed for hover, retained files and paths. Drag to orbit and scroll to zoom. Search or Centre frames the subject with its immediate connections while preserving the viewing direction. **Fit current scope** recovers the current path, retained scope or subject neighbourhood after orbiting or zooming away, without changing pins or the question. File and directory names stay at reading size: the subject, pins and path endpoints have priority, with further names revealed where they fit. A name opens evidence; its tooltip gives the full path. The reader and pin tray provide ways to inspect and return.

The filters distinguish tests, binary assets and related markdown. Text manifests such as `package.json` are documented files, not binary assets. Related documents can enter through a Live Doc's authored links or the generated **Cited By** section; the controls distinguish these directions. Tuning holds layout settings and an export of their values.

### Knowledge Sources

The bundle's inventory, entry points, reachability, related documentation and exports. Entry points are declared by the docs; the engine's walk says what they reach, what only tests reach and what no entry reaches. **Not read** separates files no adapter understands from files the graph can judge unreachable. **Reachable from** asks the walk from a chosen file or directory. Counts and lists report the graph's knowledge, not a proof that an unreferenced file is dead code.

---

## Search, paths and evidence

The search bar finds files, symbols and directories. Choosing a subject brings it into the Local Map and makes it the newest pin. With a pin present, **Path to** asks for a destination from the newest pin; it lists connected matches and discloses matches for which no path exists. Both Local Map representations show the answer and an ordered row of named hops, from provider to consumer. A reverse-only result offers the reverse question; a disconnected result says no path either way. Tab reaches recovery, Clear and the hop inspection buttons; long routes scroll to keep the focused hop visible. The 2D drawing also shows relevant symbol connections. See [Tracing Impact](tracing-impact.mdmd.md#paths-in-the-explorer).

The reader shows authored Purpose and Notes, public symbols, dependencies and related documents. Its own navigation lets you read linked evidence while keeping the map's place. On narrow or short viewports it fills the screen and provides Close to return to the map.

### Known gaps and intended behavior

The [accepted remediation checklist](../../layer-3/live-documentation-explorer.mdmd.md#remediation-work) records unfinished work found on October 23. The shared path report and reverse recovery are repaired in both representations. The current 3D identity/framing pass adds prioritized names, neighbourhood arrivals and explicit Fit recovery. Direction, wire depth and the legend still need correction, as do initial 2D clipping, panels, remaining label/control details, search ordering, counts and tuning.

The checklist distinguishes the current identity/framing pass from the remaining outcomes, including truthful visible encodings and counts. Use 2D for the path's detailed symbol connections; its result and recovery controls are available in either representation.

---

## History

When the bundle carries history, the 3D Local Map offers **History**. Its scrubber steps or plays the sequence, and its panel explains each step. The default axis follows calendar time; Tuning also offers spacing by step and tick granularity. The address can name a commit. Leaving 3D returns to today's graph. A bundle without history names the command to compute it in Knowledge Sources. See [Change over Time](../../layer-3/change-over-time.mdmd.md#current-delivery-and-remaining-work) for remaining work, including panel proportions and making absent pins clear at the point of use.

---

## Sharing what you see

Copy the address bar to share the view, subject, pins, representation, path and inspection carried by its state. The recipient needs the same bundle and, for a historical moment, that moment in its history. A link restores the exploration; it does not promise identical physics coordinates or pixels on another viewport.

### The graph as data

The generator writes the graph index to `<root>/index.json` (`.mdmd/index.json` in this repository). It holds parsed Live Docs, resolved links and inbound and outbound neighbours. It is derived and never committed; regenerate it to refresh the data. CLI inspection reads the same graph. Knowledge Sources exports its facts as JSON.

---

## Publishing the bundle

```bash
npm run live-docs:visualize
```

| Path | Contents |
| --- | --- |
| `index.html` | The viewer |
| `explorer-data.json` | The graph index and admitted related markdown |
| `static/` | Scripts and styles |
| `explorer-history.json` | The selected history, when included |

Copy `dist/explorer/` to a static host. This repository's own Explorer is published to GitHub Pages by `pages.yml`. Bundle size depends on graph, admitted documents and history. Use `bundleExclude` to leave out large or private markdown, and `--history none|all|since <date>|last <n>` to choose history coverage. See [configuration](getting-started.mdmd.md#configuration). The page reads only its own site; links do not grant permission to fetch arbitrary external content.

---

## Exporting documentation

Knowledge Sources downloads a flattened markdown file or a ZIP preserving directory structure, for Live Docs, related markdown, or both. These exports preserve the underlying evidence even when the picture shows only part of it.

---

## Troubleshooting

### The Explorer shows stale data

The bundle is a snapshot. Regenerate Live Docs, then rebuild with `npm run live-docs:visualize`.

### Files are missing

Check discovery configuration and regenerate. In the page, check filters, directory disclosure and the historical moment as well: a documented file can be outside the current picture.

### The 3D picture is difficult to read

Use **Fit current scope** to recover the relevant scene, move closer to reveal more names, or use the explicit 2D control for file and symbol detail. The reader supplies evidence. The [remediation checklist](../../layer-3/live-documentation-explorer.mdmd.md#remediation-work) tracks the remaining 3D legibility work. Performance depends on the graph and renderer; there is no fixed file-count threshold that establishes usability.

---

## Related Guides

- [Getting Started](getting-started.mdmd.md)
- [Tracing Impact](tracing-impact.mdmd.md)
- [CLI Reference](cli-reference.mdmd.md)
