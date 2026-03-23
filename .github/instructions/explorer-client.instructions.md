---
applyTo: "packages/scripts/src/live-docs/explorer/client/**/*.ts"
---

# Explorer Client Code Conventions

This file governs the Live Documentation Explorer client-side code, including the Circuit Board, Local Map, and Force Graph views.

> **Planned**: The **Membrane Map** will unify Circuit Board and Local Map into a single zoomable treemap. See [membrane-map.mdmd.md](../../.mdmd/layer-3/membrane-map.mdmd.md) for the architecture and [Stage 12](../../.mdmd/layer-2/work-items/feature-backlog.mdmd.md#stage-12--membrane-map) for work items. Until Membrane Map lands, all three views remain actively maintained.

## Architecture

The Local Map view follows a clean separation of concerns established during the 12/18 multi-hop refactor:

1. **Pure-function modules** (testable without DOM):
   - `state.ts` — Observable `StateStore<T>`, `LocalMapState`, action functions
   - `layout-math.ts` — Column counting, layout computation, geometric math
   - `connection-geometry.ts` — Bézier paths, gradient generation, rectangle operations

2. **DOM-touching modules**:
   - `render.ts` — Produces DOM from layout + state
   - `connections.ts` — SVG connection drawing
   - `controller.ts` — Orchestrates state, render, and event handling
   - `runtime.ts` — Anchor registry, runtime utilities

## State Management

- Use the `StateStore<T>` pattern from `state.ts` for reactive state management.
- Action functions should be **pure**: take old state, return new state.
- Derived queries (`getPinnedNodeIds`, `isSymbolPinned`, etc.) compute values from state without mutation.

## Path Mode vs. Exploration Mode

The Local Map has two distinct modes:

1. **Exploration Mode** (single `FROM`, no `TO`):
   - Shows 3-column layout: Dependencies | Center | Dependents
   - `activePath` is `null`

2. **Path Mode** (both `FROM` and `TO` specified):
   - Shows N columns: FROM | VIA 1 | VIA 2 | ... | TO
   - `activePath` contains the path result
   - Dependencies column is **not** rendered in path mode
   - Destination's dependents column is **not** rendered

## Connection Drawing

- Anchors are registered with `hopIndex` for multi-hop paths.
- Use `getAnchorWithHop()` and `registerAnchorWithHop()` for path-mode anchor lookups.
- In path mode, all columns have `columnRole = "center"`; use `pathIndex` to distinguish them.
- Connection drawing must check `activePath` to determine which lookup strategy to use.

## Barrel File Resolution

When resolving symbol types to Live Doc links, always prefer the **actual source** over barrel re-exports:

- Use `isBarrelFilePath()` from `coreUtils.ts` to detect barrel files.
- Use `compareSymbolLocationsPreferOrigin()` to sort locations with origins first.
- This prevents false dependency edges through barrel re-exports (e.g., `index.ts`).

## Technical Debt Acknowledgment

Several files in this folder exceed the 1000-line threshold flagged by the tech debt detector:

- `index.ts` — consider extracting app initialization from view orchestration
- `controller.ts` — consider extracting pan/zoom, selection, and subgraph-building into separate modules
- `render.ts` — may benefit from splitting path-mode and exploration-mode rendering

When making changes to these large files, prefer extracting functionality into the pure-function modules to reduce maintenance burden.
