# Multi-Path Visualization Design

**Date:** 2026-03-09  
**Context:** Pathfinding algorithm analysis and proposed rendering improvements  
**Related Notes:** `multi-hop-local-map-architecture.md` (Dec 2025 post-mortem)

---

## Executive Summary

The current pathfinding implementation (CLI and Explorer) uses single-parent BFS, which returns **exactly one** shortest path between `FROM` and `TO`. When multiple shortest paths exist, the chosen path is arbitrary (determined by JavaScript `Set` insertion order). Near-miss paths (one hop longer) and symbol-divergent paths (same file-level route, different symbol chains) are invisible.

This document specifies three proposed enhancements to the Local Map pathfinding visualization, each building on the last:

1. **All-Shortest-Paths Merged DAG** — show every path tied at shortest length
2. **Near-Miss (+1) Paths** — show dimmed alternate paths one hop longer
3. **Symbol-Divergent Paths Through Same File** — show distinct symbol chains through the same file nodes

---

## Current Behavior

### Algorithm (All Three Implementations)

All pathfinding implementations use the same BFS pattern:

- **CLI file-level** (`inspect/pathfind.ts`): `searchGraph()` with `Map<string, string>` parents
- **CLI symbol-aware** (`inspect/pathfind-symbol.ts`): `searchSymbolPath()` with composite `codePath#symbol` visited keys
- **Explorer client** (`explorer/client/pathfind.ts`): `findPath()` → `directedBFS()` with `Map<string, string>` parents

The single-parent map means: when BFS reaches a node via neighbor A, then later also reaches it via neighbor B at the same depth, B is discarded. Only one parent is recorded per node, so only one shortest path can be reconstructed.

### Current Rendering (Path Mode)

When `FROM` and `TO` are set and a path is found, `renderPathModeColumns()` creates one column per node in the path:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   FROM   │───▸│  Via 1   │───▸│  Via 2   │───▸│    TO    │
│ auth.ts  │    │ middle.ts│    │ utils.ts │    │ types.ts │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

This is a **linear chain**: one card per hop column, one connection between adjacent columns. No branching, no alternatives.

---

## Proposed Enhancement 1: All-Shortest-Paths Merged DAG

### Motivation

When the graph has multiple shortest paths of equal length, the user sees an arbitrary one. The other paths may traverse important intermediaries that are invisible.

### Algorithm Change

Replace `Map<string, string>` (single parent) with `Map<string, Set<string>>` (parent set):

```typescript
// Current
const parents = new Map<string, string>();
if (!parents.has(neighbor)) {
  parents.set(neighbor, current);
}

// Proposed
const parents = new Map<string, Set<string>>();
const depth = new Map<string, number>();

if (!depth.has(neighbor)) {
  depth.set(neighbor, depth.get(current)! + 1);
  parents.set(neighbor, new Set([current]));
} else if (depth.get(neighbor) === depth.get(current)! + 1) {
  parents.get(neighbor)!.add(current); // Same depth → additional parent
}
```

### Reconstruction

Walk backwards from `TO` following all parents to enumerate every shortest path. The result is a **DAG** (directed acyclic graph) rather than a single chain.

### Rendering

Where paths diverge, the hop column shows multiple cards vertically:

```
                          ┌──────────┐
                     ┌───▸│ route-A  │───┐
┌──────────┐         │    │ auth.ts  │   │    ┌──────────┐
│   FROM   │────────┤    └──────────┘   ├───▸│    TO    │
│ main.ts  │         │    ┌──────────┐   │    │ types.ts │
└──────────┘         └───▸│ route-B  │───┘    └──────────┘
                          │ guard.ts │
                          └──────────┘
```

Both `auth.ts` and `guard.ts` are valid intermediaries at hop 1. They are stacked within the same column, and connections fan out from `FROM` and converge into `TO`.

---

## Proposed Enhancement 2: Near-Miss (+1) Paths

### Motivation

Sometimes the "interesting" path is one hop longer than the shortest. A maintainer may want to see that `FROM → A → B → C → TO` exists alongside the 3-hop shortest path, because `B` is a critical module.

### Algorithm Change

After BFS finds the shortest path at depth `k`, continue BFS for **one additional level** (`k+1`). Paths of length `k+1` that reach `TO` are collected as "near-miss" paths.

```typescript
// After finding shortest at depth k:
while (queue.length > 0) {
  const current = queue.shift()!;
  if (depth.get(current)! > k + 1) break; // Stop at k+1
  // Continue normal BFS logic, collecting parents
}
```

### Rendering

Near-miss paths render with **dimmed/dashed** styling to distinguish them from shortest paths:

```
                          ┌──────────┐
                     ┌───▸│ route-A  │───────────────────┐
┌──────────┐         │    │ auth.ts  │                    │    ┌──────────┐
│   FROM   │────────┤    └──────────┘                    ├───▸│    TO    │
│ main.ts  │         │    ┌╌╌╌╌╌╌╌╌╌╌┐    ┌╌╌╌╌╌╌╌╌╌╌┐  │    │ types.ts │
└──────────┘         └╌╌─▸┊ route-B  ┊╌╌─▸┊ detour   ┊╌╌┘    └──────────┘
                          ┊ guard.ts ┊    ┊ extra.ts  ┊
                          └╌╌╌╌╌╌╌╌╌╌┘    └╌╌╌╌╌╌╌╌╌╌┘
```

**Visual rules:**

- Shortest-path cards: solid borders, full opacity, solid connection lines
- Near-miss cards: dashed borders, reduced opacity (~60%), dashed connection lines
- Near-miss columns only appear when they contain nodes not already in a shortest-path column
- A toggle in the pathfind toolbar enables/disables near-miss display (default: off)

### CSS Sketch

```css
.local-card.near-miss {
  border-style: dashed;
  opacity: 0.6;
}

.connection-line.near-miss {
  stroke-dasharray: 6 4;
  opacity: 0.5;
}
```

---

## Proposed Enhancement 3: Symbol-Divergent Paths Through Same File

### Motivation

Two shortest paths may traverse the **same files** but through **different symbols**. At file level they look identical, but at symbol level they represent distinct dependency chains. The current file-level BFS cannot distinguish them.

### Example

```
FROM: main.ts#startApp
  → middleware.ts#validateAuth  → handler.ts#processRequest  → TO: db.ts#query
  → middleware.ts#rateLimit     → handler.ts#throttle         → TO: db.ts#query
```

Both paths go `main.ts → middleware.ts → handler.ts → db.ts`, but through completely different symbols.

### Algorithm Change

Port `searchSymbolPath()` from the CLI (`pathfind-symbol.ts`) to the Explorer client. The symbol-aware BFS uses composite visited keys (`filePath#symbolName`) so the same file can appear multiple times in the visited set with different symbols.

### Rendering

Same file cards appear once per column, but **multiple connection lines** route through different symbol anchors on the card:

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│ middleware.ts │        │  handler.ts  │        │              │
│              │        │              │        │              │
│ validateAuth ●───────▸● processReq   │        │              │
│              │        │              ●───────▸●  db.ts       │
│ rateLimit    ●───────▸● throttle     │        │  query       │
│              │        │              ●───────▸●              │
└──────────────┘        └──────────────┘        └──────────────┘
```

Each `●` is a symbol anchor. Connections route from one symbol anchor to another, making it visually clear that two distinct chains pass through the same physical file.

**Visual rules:**

- Each distinct symbol chain gets a unique color from a small palette (max 4-5 distinguishable colors)
- Hovering a connection line highlights the full chain end-to-end and dims all others
- The pathfind result includes `symbolChains: SymbolChain[]` alongside the file-level `nodeIds`
- When symbol selection is active in FROM or TO, only chains involving those symbols are highlighted

### Data Model Extension

```typescript
interface SymbolChain {
  hops: SymbolHop[];
}

interface SymbolHop {
  nodeId: string;
  symbol: string;
}

// Extended PathResult
interface PathResult {
  nodeIds: string[]; // File-level path (existing)
  fromSymbol?: string; // (existing)
  toSymbol?: string; // (existing)
  isReversed: boolean; // (existing)
  symbolChains?: SymbolChain[]; // NEW: all symbol-level paths through the same file chain
}
```

---

## Combined View: All Three Enhancements

When all enhancements are active, the Local Map in path mode renders a rich DAG:

```
                          ┌────────────────┐
                     ┌───▸│  auth.ts       │
                     │    │                │
                     │    │ validateAuth ●─┼──────────────────┐
┌──────────┐         │    │ checkRole    ●─┼──────┐           │
│ FROM     │         │    └────────────────┘      │           │    ┌────────────┐
│ main.ts  │────────┤                             ▼           ▼    │     TO     │
│          │         │    ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐    ┌──────────────┐  │ db.ts      │
│ startApp ●         └╌╌─▸┊  guard.ts      ┊    │ handler.ts   │  │            │
└──────────┘              ┊                ┊    │              ●──▸● query     │
                          ┊ rateLimit    ●─┼╌╌─▸● processReq  │  │            │
                          └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘    │ throttle   ●──▸●            │
                                                 └──────────────┘  └────────────┘
```

- Solid borders/lines: shortest path(s)
- Dashed borders/lines: near-miss (+1) paths
- Multiple symbol anchors with distinct connections: symbol-divergent chains
- Hover highlights the full chain

---

## Implementation Considerations

### Dependency on Multi-Hop Architecture

These enhancements are **additive to, not a replacement for**, the multi-hop rendering architecture described in `multi-hop-local-map-architecture.md`. The multi-hop work (dynamic column count, hop-aware anchors, HopChain data model) is a prerequisite. The enhancements in this document layer on top:

| Enhancement        | Prerequisite                                                               |
| ------------------ | -------------------------------------------------------------------------- |
| All-shortest-paths | Multi-parent BFS only; no layout changes beyond stacking cards in a column |
| Near-miss (+1)     | Extended BFS + dimmed card/connection CSS + toolbar toggle                 |
| Symbol-divergent   | Symbol-aware BFS ported to client + multi-line connection routing per card |

### Complexity Budget

The three enhancements are ordered by increasing complexity:

1. **All-shortest-paths**: Algorithm change only (BFS parent tracking). Rendering change is minimal — same column count, just potentially multiple cards per column.
2. **Near-miss (+1)**: BFS extended by one level + new CSS class + toolbar toggle. Moderate.
3. **Symbol-divergent**: Requires porting `searchSymbolPath()` to the browser, extending `PathResult`, and adding multi-line connection routing. Most complex.

Each can ship independently. Enhancement 1 is recommended as the starting point.

### Performance Guardrails

- **All-shortest-paths**: Cap the number of reconstructed paths (e.g., max 8). For dense graphs the DAG can be exponentially wide.
- **Near-miss (+1)**: Only one extra BFS level; negligible cost. Cap near-miss paths displayed at 4.
- **Symbol-divergent**: Cap symbol chains at 6 per file pair. The symbol-aware BFS is O(symbols × files) rather than O(files), so it's heavier.

---

## Related Work

- **Dec 2025 multi-hop post-mortem** (`multi-hop-local-map-architecture.md`): Documents the architectural hardcoding that makes dynamic column counts difficult. The HopChain data model proposed there is the foundation for multi-path rendering.
- **CAP-008 Data Parity** (Layer 1 Vision): States that the Explorer must "sprawl beyond one-hop columns when From/To provided" — multi-path visualization fulfils this vision more completely.
- **Stream LV1-E** (Layer 2 Roadmap): Currently marked complete for single-path. Multi-path would be a new stream.
- **CLI `pathfind-fanout.ts`**: The `enumerateTerminalPaths()` function already uses DFS to find up to 200 terminal paths. Its enumeration logic could inform the all-shortest-paths reconstruction.
