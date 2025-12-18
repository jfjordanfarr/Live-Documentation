# Multi-Hop Local Map Architecture Analysis

**Date:** 2025-12-18  
**Context:** Post-mortem of 12/17.2-12/17.3 failed multi-hop attempt  
**Related Chat:** `ChatHistory/2025/12/2025-12-17.2.md`, `ChatHistory/2025/12/2025-12-17.3.md`

---

## Executive Summary

The Local Map was engineered from the ground up for **exactly 3 columns** with a single center node. Multi-hop visualization requires a **foundational rewrite** of:

1. **Subgraph data model** — From single `LocalSubgraph` to `HopChain[]`
2. **Connection drawing** — From hardcoded 3-column logic to hop-aware edge routing
3. **Anchor registry** — From `columnRole:nodeId` keys to `hopIndex:columnRole:nodeId` keys
4. **CSS layout** — From `repeat(3, max-content)` to dynamic column count
5. **Symbol pinning** — From single `pinnedSymbol` to `pinnedPath: SymbolPin[]`
6. **Pathfinding** — From bidirectional BFS to **directional forward + reverse** searches

The failed 12/17.3 attempt proved that **bolting multi-hop onto the existing architecture breaks everything**: connection lines, symbol pinning, and visual coherence.

---

## User Vision (Extracted from 12/17.2 Chat)

### What the User Wants

> "What I expect to see are all the relevant nodes on the main Local Map visualization area. We will have to exceed three columns, hence my statement that the rendering will be the hardest part." — 12/17.2:L2577

> "If we have a symbol selected in either the FROM or TO, we will need to see that symbol pinned in the Local Map (with all the bells and whistles of collapsing irrelevant symbols on neighbor nodes). This means that you will have to engineer **multi-pinning**." — 12/17.2:L2577

> "If you want, we can commit this step and then work our way up to **multi-pinning**, where placing a pin inside a Dependent suddenly causes a new column to appear to the right of the prior Dependents column, itself carrying the Dependents of the secondary pinned symbol." — 12/17.2:L2577

> "We should allow this up to a maximum of N hops, and when I want to share the path between symbols between my work colleagues, I should be able to send them a link that shows the path between one pinned symbol and another." — 12/17.2:L2577

> "It is extraordinarily nontrivial work." — 12/17.2:L2577

### Directionality Concern (12/18 User Request)

> "One thing to note is that the current BFS implemented is bidirectional, which is _kinda_ okay. But what would be far better is if the search was performed once forward and once in reverse... If we adhered to directionality but allowed ourselves to search the reverse path (FROM to TO), then we could still give good paths to the user without hopping around the dependency chain in improper directions."

---

## Current Architecture Hardcoding

### 1. CSS Grid: 3 Columns Fixed

**File:** `packages/scripts/src/live-docs/explorer/client/styles/local.css`

```css
.local-layout {
  display: grid;
  grid-template-columns: repeat(3, max-content); /* HARDCODED */
  column-gap: var(--local-column-gap, 200px);
  align-items: stretch;
  justify-content: center;
}
```

**Fix Required:** Dynamic grid based on hop count:
```css
/* 2 + (2 × hopCount) columns: [Deps, Center, [Dependents, HopCenter]×N] */
grid-template-columns: repeat(auto-fill, max-content);
```

Or set via JS:
```typescript
layoutRoot.style.gridTemplateColumns = `repeat(${2 + hopCount * 2}, max-content)`;
```

---

### 2. Connection Drawing: Only Knows 3 Column Roles

**File:** `packages/scripts/src/live-docs/explorer/client/views/localView/connections.ts`

```typescript
currentSubgraph.links.forEach(edge => {
  // Column role mapping:
  // - Dependencies live in "upstream" column
  // - Center node in "center"
  // - Dependents in "downstream"
  const providerAnchor = isDependency
    ? measureAnchor(context.getAnchor(edge.targetId, "upstream", ...))   // Only knows upstream
    : measureAnchor(context.getAnchor(centerId, "center", ...));         // Only knows center

  const consumerAnchor = isDependency
    ? measureAnchor(context.getAnchor(centerId, "center", ...))          // Only knows center
    : measureAnchor(context.getAnchor(edge.sourceId, "downstream", ...)); // Only knows downstream
});
```

**The Problem:** 
- This iterates `currentSubgraph.links` — links for **one center node only**
- Has no concept of hop columns or their edges
- Uses fixed `ColumnRole` type: `"upstream" | "center" | "downstream"`

**Fix Required:**
- `ColumnRole` becomes `{ hopIndex: number, role: "deps" | "center" | "dependents" }`
- Connection drawing iterates over **all hop subgraphs**, not just the first
- Each hop pair `(center[n] → dependents[n])` draws edges independently

---

### 3. Anchor Registry: No Hop Awareness

**File:** `packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts`

```typescript
// Current registry key format
const anchorKey = `${columnRole}:${nodeId}:${symbol}`;
```

**The Problem:** If the same node appears in multiple columns (e.g., as a dependency AND a hop center), keys collide.

**Fix Required:**
```typescript
const anchorKey = `hop${hopIndex}:${columnRole}:${nodeId}:${symbol}`;
```

---

### 4. Subgraph Model: Single Center

**File:** `packages/scripts/src/live-docs/explorer/client/views/localView/types.ts`

```typescript
export interface LocalSubgraph {
  center: ExplorerNodePayload;        // ONE center
  nodes: ExplorerNodePayload[];       // Flat list of all nodes
  links: LocalEdge[];                 // Flat list of all edges
  inboundIds: Set<string>;            // IDs that are dependents of center
  outboundIds: Set<string>;           // IDs that are dependencies of center
}
```

**Fix Required:** Introduce hop-aware types:

```typescript
export interface HopSubgraph {
  hopIndex: number;
  center: ExplorerNodePayload;
  centerSymbol?: string;              // Pinned symbol on this hop's center
  dependencies: ExplorerNodePayload[];
  dependents: ExplorerNodePayload[];
  links: LocalEdge[];                 // Edges specific to this hop
}

export interface HopChain {
  hops: HopSubgraph[];
  fromNode: ExplorerNodePayload;
  toNode?: ExplorerNodePayload;       // undefined if exploring, set if pathfinding
  fromSymbol?: string;
  toSymbol?: string;
}
```

---

### 5. Pinning State: Single Symbol

**File:** `packages/scripts/src/live-docs/explorer/client/views/localView/controller.ts`

```typescript
/** Tracks which symbol is "pinned" (sticky highlight). Format: "nodeId:symbol" or null */
private pinnedSymbol: string | null = null;
```

**Fix Required:** Multi-pin array tracking the full path:

```typescript
interface SymbolPin {
  nodeId: string;
  symbol: string;
  hopIndex: number;
}

private pinnedPath: SymbolPin[] = [];
```

---

### 6. Render Function: Hardcoded 3 Columns

**File:** `packages/scripts/src/live-docs/explorer/client/views/localView/render.ts`

```typescript
export function renderLocalView(controller: LocalViewController): void {
  // ...
  const centerColumn = createHierarchicalColumn(...);
  layoutRoot.appendChild(centerColumn);
  
  const dependenciesColumn = createStackedColumn(...);
  layoutRoot.insertBefore(dependenciesColumn, centerColumn);
  
  const dependentsColumn = createStackedColumn(...);
  layoutRoot.appendChild(dependentsColumn);
  // EXACTLY 3 columns created, always
}
```

**Fix Required:** Loop over `hopChain.hops` and create columns dynamically:

```typescript
export function renderLocalView(controller: LocalViewController): void {
  const hopChain = controller.buildHopChain();
  
  // Hop 0: Original node's dependencies
  layoutRoot.appendChild(createDepsColumn(hopChain.hops[0]));
  
  hopChain.hops.forEach((hop, i) => {
    // Each hop adds: center column + dependents column
    layoutRoot.appendChild(createCenterColumn(hop, i));
    layoutRoot.appendChild(createDependentsColumn(hop, i));
  });
}
```

---

## Pathfinding Architecture Changes

### Current: Bidirectional BFS

The current pathfind.ts treats the graph as **undirected** — it traverses edges in both directions to find any connecting path.

**Problem:** This can yield paths that hop "backwards" against dependency flow, which is semantically confusing when rendered.

### Proposed: Directional Forward + Reverse Searches

1. **Forward search (FROM → TO):** Follow dependency direction only (outbound edges)
2. **Reverse search (TO → FROM):** Follow dependent direction only (inbound edges)
3. **Select the better path:** If both succeed, prefer the shorter or more semantically coherent one
4. **Render with correct arrow direction:** Forward paths flow left-to-right; reverse paths may need visual indicator that they're "looking upstream"

```typescript
interface PathfindResult {
  path: string[];           // Node IDs in order
  direction: "forward" | "reverse";
  hops: number;
}

function findDirectionalPath(
  from: string, 
  to: string, 
  maxHops: number
): { forward?: PathfindResult; reverse?: PathfindResult } {
  const forward = bfsForward(from, to, maxHops);
  const reverse = bfsReverse(from, to, maxHops);  // Actually searches to→from on inbound edges
  return { forward, reverse };
}
```

---

## Tech Debt Indicators

Per `npm run tech-debt`:

| File | Lines | Issue |
|------|-------|-------|
| `explorer/client/index.ts` | **1834** | Main entry point, monolithic |
| `explorer/client/views/localView/controller.ts` | **1206** | Core logic, tightly coupled |

Both exceed the 1000-line threshold for reliable LLM edits. **The controller.ts file should be split** before attempting multi-hop:

- `controller.ts` → Core orchestration (~300 lines)
- `controller-pan-zoom.ts` → Pan/zoom/drag handling (~300 lines)
- `controller-connections.ts` → Connection highlighting logic (~300 lines)
- `controller-pinning.ts` → Symbol pinning state machine (~200 lines)
- `controller-subgraph.ts` → Subgraph building (~200 lines)

---

## Estimated Effort

| Component | Effort | Risk |
|-----------|--------|------|
| Split controller.ts | 1 session | Low |
| New type system (HopChain, SymbolPin) | 1 session | Low |
| Dynamic CSS grid | 0.5 session | Low |
| Anchor registry with hop awareness | 1 session | Medium |
| Render function rewrite | 2 sessions | High |
| Connection drawing rewrite | 2 sessions | High |
| Directional pathfinding | 1 session | Medium |
| Integration & debugging | 2 sessions | High |

**Total:** 10-12 sessions (spread across multiple days)

---

## Recommended Implementation Order

1. **Split controller.ts** — Reduce file size below LLM edit threshold
2. **Introduce HopChain/SymbolPin types** — Type-safe foundation
3. **Update anchor registry** — Add hop index to keys
4. **Dynamic CSS grid** — Allow arbitrary column count
5. **Refactor render to use hop loop** — One column pair per hop
6. **Refactor connection drawing** — Hop-aware edge routing
7. **Directional pathfinding** — Forward + reverse BFS
8. **Symbol auto-pinning from pathfind** — Wire FROM/TO to pinnedPath
9. **URL serialization** — Shareable multi-hop paths
10. **Visual polish** — Animations, transitions, collapse states

---

## Key Insight from User

> "This isn't anywhere close to 'fixed' or 'working'. Not even close... I think we need to throw out and discard everything but the chat history from this changeset and start over." — 12/17.3

The 12/17.3 attempt failed because it tried to add multi-hop as a **layer on top** of the existing 3-column architecture. The architecture must be **rebuilt from the type system up** to natively support N columns.

---

## CLI Proof: Directional Pathfinding Works (2025-12-18)

Per user guidance, we proved the directional pathfinding algorithm headlessly via the Inspect CLI before attempting rendering. The `--direction both` option was added to `npm run live-docs:inspect` and validated:

### Test Cases

```powershell
# File-level dual-direction search
npm run live-docs:inspect -- --from "scripts/live-docs/explorer/client/views/localView/controller.ts" --to "scripts/live-docs/explorer/client/views/localView/connections.ts" --direction both

# Result:
# Dual-direction search from ... to ...:
#   FORWARD PATH (outbound, 1 hop(s)): controller.ts → connections.ts
#   REVERSE PATH (inbound): No path found.

# Symbol-level dual-direction search  
npm run live-docs:inspect -- --from "packages/shared/src/liveDocGraph.ts#LiveDocGraph" --to "packages/shared/src/symdb/evidence.ts#EvidenceExtractor" --direction both --json
```

### Conclusion

The algorithm correctly:
1. **Forward (outbound):** Follows dependency edges from source to target
2. **Reverse (inbound):** Follows dependent edges (what depends on source, can we reach target?)
3. **Reports both results independently:** Shows which direction(s) found a path

This proves the BFS infrastructure is sound. The next step is adapting this for rendering:
- The pathfinding returns hop chains that can fuel dynamic column generation
- Each hop in the chain becomes a column pair (deps | node | consumers)
- Connections route between adjacent columns using hop indices

---

## Appendix: Files to Modify

| File | Lines | Changes Required |
|------|-------|------------------|
| `types.ts` | 78 | Add `HopSubgraph`, `HopChain`, `SymbolPin` |
| `controller.ts` | 1206 | Split into 5 files; add `pinnedPath`, `buildHopChain()` |
| `render.ts` | 852 | Hop-loop rendering, dynamic column creation |
| `connections.ts` | 417 | Hop-aware edge routing |
| `runtime.ts` | ~150 | Anchor registry with hop keys |
| `local.css` | ~300 | Dynamic grid, hop column styling |
| `pathfind.ts` | ~400 | Directional BFS (forward + reverse) |

