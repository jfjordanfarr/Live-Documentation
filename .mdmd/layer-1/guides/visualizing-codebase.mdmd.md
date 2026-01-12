# Visualizing Your Codebase

## Metadata
- Layer: 1
- Guide Type: task-tutorial

The Live Documentation Explorer provides three interactive views for navigating your codebase visually. This guide covers each view's strengths, the shareability features, and how to export static bundles for your team.

---

## Launching the Explorer

```powershell
npm run live-docs:visualize
# Opens http://localhost:3000
```

The Explorer reads from your Live Doc graph and presents three complementary views.

---

## The Three Views

### Circuit Board (Macro View)

A treemap visualization showing your entire workspace as interconnected clusters.

**Best for:**
- Architecture overview
- Identifying hotspots (densely connected files)
- Understanding package boundaries
- Spotting orphaned modules

**Interactions:**
- Click a cluster to zoom in
- Hover to see connection counts
- Use the breadcrumb trail to navigate back

### Local Map (Micro View)

A 3-column layout showing inbound → active node → outbound relationships.

**Best for:**
- Understanding a single file's role
- Symbol-level navigation
- Tracing multi-hop dependency chains
- Impact analysis before changes

**Interactions:**
- Click symbols to see type references
- Use "From/To" inputs for pathfinding (see [Tracing Impact](tracing-impact.mdmd.md))
- Expand inbound/outbound sections for full neighbor lists

### Force Graph (Discovery View)

A physics-based network visualization where related nodes cluster naturally.

**Best for:**
- Discovering unexpected connections
- Seeing natural component groupings
- Exploring brownfield documentation (when enabled)
- Presentations and demos

**Interactions:**
- Drag nodes to reposition
- Scroll to zoom
- Toggle "Show Related Documentation" to include brownfield docs

---

## Explorer Features

### Hover Highlighting

Hover over any node or symbol to dim unrelated connections. This helps you trace specific relationships without visual noise.

### Sticky Pins

Click a symbol to "pin" the highlight. Useful on mobile or when you need the highlight to persist while scrolling.

### Type Reference Badges

Cyan badges on symbols indicate type references. Click to navigate to the type definition.

### Test-Backed Glow

Files with test coverage show a purple shadow. Quickly identify which code is tested.

### Detail Panel

Select any node to see its full Live Doc rendered in the right panel:
- Authored sections (Purpose, Notes)
- Generated sections (Public Symbols, Dependencies)
- Evidence metadata (for supported archetypes)

---

## Sharing Views with Your Team

### URL State Preservation

Every interaction updates the URL with shareable parameters:

```
http://localhost:3000/?view=local&node=packages/shared/src/types.ts
```

Parameters:
| Param | Values | Purpose |
|-------|--------|---------|
| `view` | `circuit`, `local`, `force`, `sources` | Active view |
| `node` | `<file-path>` | Focused node |
| `from` | `<file-path>` | Pathfinding start (Local Map) |
| `to` | `<file-path>` | Pathfinding end (Local Map) |

**Share the URL** — colleagues see exactly what you see without "scroll to line 247" instructions.

### Headless JSON API

For automation or AI consumption, query the Local Map data directly:

```powershell
Invoke-RestMethod "http://localhost:3000/local-map?nodeId=packages/shared/src/types.ts&pretty=1"
```

Returns structured JSON with:
- Center node metadata
- Upstream/downstream neighbors
- Edge details with symbol anchors
- Layout statistics

---

## Static Site Export (GitHub Pages)

Generate a fully offline-capable Explorer bundle:

```powershell
npm run live-docs:visualize:static
# Output: dist/explorer/
```

### What's Bundled

| File | Contents |
|------|----------|
| `index.html` | Self-contained viewer |
| `explorer-data.json` | Graph (nodes, links), symbol index, all Live Doc markdown |
| `viewer-config.json` | Provenance metadata (commit hash, version, timestamp) |

### Deployment

```powershell
# GitHub Pages
Copy-Item dist/explorer/* docs/ -Recurse
git add docs/
git commit -m "Update Explorer static bundle"

# Any static host
npx serve dist/explorer
```

### Bundle Size

For a typical workspace (~600 nodes), expect ~5MB total. The bundle includes all Live Doc markdown, so users can browse documentation fully offline.

---

## Exporting Documentation

The Explorer's **Knowledge Sources** panel includes export options:

### Bundle Types

| Type | Contents |
|------|----------|
| **Live Docs** | Only the generated Live Documentation files |
| **Related Docs** | Brownfield documentation (READMEs, ADRs, etc.) |
| **All Documentation** | Everything |

### Export Formats

| Format | Structure |
|--------|-----------|
| **Flattened Markdown** | Single concatenated file |
| **ZIP Archive** | Preserves directory structure with `live-docs/` and `related-docs/` folders |

---

## Brownfield Integration

Existing markdown (READMEs, architecture diagrams, design notes) appears in the Force Graph when "Show Related Documentation" is enabled:

- **Purple nodes** (#9966cc) distinguish Related Docs from Live Docs
- **Smaller size** visually separates documentation from source code
- **Click handling** opens Related Docs in the Detail Panel
- **Circuit Board/Local Map buttons are hidden** for non-Live-Doc nodes

This "bridge, don't replace" strategy means your existing documentation is never overwritten—it's simply made navigable.

---

## Troubleshooting

### Explorer Shows Stale Data

After TypeScript rebuilds (`npm run build`), restart the server:

```powershell
# Stop the running server (Ctrl+C)
npm run live-docs:visualize
```

CSS changes are hot-reloadable; code changes require restart.

### Missing Nodes

Files only appear in the Explorer if they have Live Docs. Generate missing docs:

```powershell
npm run live-docs:generate
```

### Slow Force Graph

For large workspaces (1000+ nodes), the Force Graph can be sluggish. Try:
- Use Circuit Board for macro navigation
- Filter to a subsystem before switching to Force Graph
- Use `--changed` flag to regenerate only modified files

---

## Related Guides

- [Getting Started](getting-started.mdmd.md) — Installation and first session
- [Tracing Impact](tracing-impact.mdmd.md) — Dependency pathfinding in depth
- [CLI Reference](cli-reference.mdmd.md) — Complete command catalog
