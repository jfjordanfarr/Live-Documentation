# Membrane Map

## Metadata

- Layer: 3
- Archetype: component
- Live Doc ID: COMP-membrane-map

## Authored

### Purpose

Document the Membrane Map: the planned successor to the Circuit Board and Local Map Explorer views. The Membrane Map unifies directory-level browsing and symbol-level exploration into a single zoomable treemap where directories render as nested containing rectangles ("membranes"), files render as cards inside their directory membrane, and dependency connections pierce membrane boundaries to show cross-directory coupling.

### Design Origin

The Membrane Map concept emerged from Dev Day 79 (2026-03-22.1.md) when a misunderstanding about the Circuit Board's sibling-directory rendering led to a fundamental redesign insight: instead of navigating between separate macro (Circuit Board) and micro (Local Map) views, a single spatial substrate can support multiple levels of detail depending on the user's focus.

### Core Concepts

#### Membranes as Directories

Each directory in the workspace is a nested rectangle — a **membrane**. Membranes contain child membranes (subdirectories) and file cards. The spatial nesting is the primary organizational axis: files that live together appear together. Ancestor directories drift into background at increasing sizes as the user zooms, providing persistent spatial context without breadcrumb-only navigation.

#### Barrel Files as Membrane Boundaries

In languages with barrel/index files (TypeScript `index.ts`, Python `__init__.py`, Rust `mod.rs`), the barrel file IS the membrane's public API surface. Connections from outside the membrane terminate at the membrane boundary rather than routing to the barrel file as an interior node. When the membrane is expanded, barrel files render as thin "edge nodes" positioned along the membrane border, visually reinforcing their role as the public surface.

This isomorphism (barrel = membrane boundary) resolves the existing problem where the Local Map misleadingly presents barrel files as rich artifacts with many symbols, when they are actually routing tables for the directory's true contents.

#### Pin-Level Fidelity

**Focal node**: The user-selected file renders at full detail — every public symbol appears as a named pin with inbound (left) and outbound (right) anchors. This preserves the current Local Map's symbol-level connection routing.

**Connected nodes**: Files that connect to the focal node render with reduced detail — name plus only the pins relevant to the active connections. Nodes in distant membranes may render at even lower detail (card name with connection-count badge on the membrane boundary).

**Hierarchical pins for nested types**: Languages like C# support nested public classes (`EventBus.Options`, `EventBus.EventArgs<T>`). Pins for nested types render hierarchically under their parent type on the node card, with connections routing to the specific nested pin.

#### French Corset (Self-Referential Connections)

When a symbol on a file depends on another symbol in the same file (e.g., `buildStaticExplorer` calling `buildLocalMapJson`), the connection wraps around the card from one outbound pin to another symbol's inbound pin. This existing Local Map pattern is preserved unchanged in the Membrane Map.

### Rendering Modes

The Membrane Map is a spatial substrate that supports multiple rendering modes on the same coordinate system. The layout stays the same — files are positioned by where they live in the directory tree. What changes is what gets drawn.

| Mode        | Purpose                                      | Pin Detail                                     | Connection Visibility                   |
| ----------- | -------------------------------------------- | ---------------------------------------------- | --------------------------------------- |
| **Browse**  | Directory overview (replaces Circuit Board)  | None — tiles and aggregate metrics only        | None                                    |
| **Explore** | Symbol-level inspection (replaces Local Map) | Full on focal node; relevant pins on neighbors | All connections to/from focal node      |
| **Compare** | Two focal nodes simultaneously               | Full on both focal nodes                       | Cross-membrane connections between both |
| **Path**    | Hop-by-hop pathfinding                       | Medium — path-relevant pins only               | Path connections highlighted            |

Browse → Explore transition occurs when the user selects a file card. The membrane layout remains stable; only the detail level changes.

### Namespace Mode (C# Enhancement)

For languages where namespaces do not align with directories (primarily C#), the Membrane Map supports an alternative hierarchy function that groups files by namespace rather than directory:

- **Directory mode** (default): `pathToHierarchy("src/Helpers/ServiceHelper.cs") → ["src", "Helpers"]`
- **Namespace mode**: `namespaceToHierarchy("App.Services") → ["App", "Services"]`

Everything downstream — pins, connections, edge bundling, zoom, rendering — is identical. The membrane containers simply represent different grouping units.

**Disagreement between directory and namespace membranes is itself an architectural signal**: a file whose physical location doesn't match its namespace indicates either a misplaced file or a namespace inconsistency. The two modes together with the Force Graph form a three-axis exploration capability:

| View                         | Axis                            | Insight                                           |
| ---------------------------- | ------------------------------- | ------------------------------------------------- |
| **Membrane Map (directory)** | Organizational — filesystem     | "Where do files physically live?"                 |
| **Membrane Map (namespace)** | Logical — type system grouping  | "How does the developer mentally organize types?" |
| **Force Graph**              | Topological — coupling strength | "What's the emergent shape?"                      |

Namespace mode uses data already extracted by the C# heuristic system (`extractCSharpNamespace()` in `packages/shared/src/inference/heuristics/csharp.ts`). No new extraction logic is required.

### Edge Bundling

When many connections cross the same membrane boundary, individual lines become visual noise. The Membrane Map aggregates dense cross-membrane connections at the membrane level: a single thick edge with a count badge replaces N individual connections. Expanding either endpoint membrane reveals the individual connections.

### Phase-Out Plan

The Membrane Map is the planned successor to both Circuit Board and Local Map. The transition is additive:

1. **Prototype phase**: Build the Membrane Map as a new view alongside existing Circuit Board and Local Map, using those as reference implementations for correctness checks.
2. **Feature parity phase**: Ensure all existing Circuit Board and Local Map functionality is available in the Membrane Map.
3. **Stabilisation phase**: Run both old and new views in parallel until confidence is established.
4. **Retirement phase**: Remove Circuit Board and Local Map views; update documentation.

Timeline is not fixed — phase-out occurs when the Membrane Map achieves feature parity and stability.

### Adapter Requirements

The Membrane Map surfaces a gap in the C# adapter: **nested public types** are currently extracted as flat sibling symbols. To render hierarchical pins accurately, the adapter needs:

1. Track brace depth during symbol extraction
2. Maintain a stack of enclosing type names
3. Emit symbols with qualified names: `EventBus`, `EventBus.Options`, `EventBus.EventArgs`

This is an adapter-level enhancement documented in [Polyglot Adapters](polyglot-adapters.mdmd.md). It does not affect the Membrane Map's spatial model.

### Open Questions

- **Path mode rendering**: Should multi-hop pathfinding render on the membrane substrate (connections piercing multiple membrane layers) or retain the current column layout? The membrane view may be worse for linear narratives. Requires prototyping to resolve.
- **Hub nodes**: Files with very high connection counts create visual clutter even with edge bundling. May need dedicated "hub" rendering (minimised card with radial connection summary).
- **Performance**: Large workspaces (1000+ files) require lazy rendering — only expand membranes that are visible in the viewport. The current Circuit Board `innerHTML = ""` teardown/rebuild pattern must be replaced with persistent DOM elements that resize.

## System References

### Components

_No implementation files exist yet. This section will be populated as the Membrane Map is built._

### Related Architecture

- [Live Documentation Explorer](live-documentation-explorer.mdmd.md) — Parent component; the Membrane Map is a view within the Explorer
- [Polyglot Adapters](polyglot-adapters.mdmd.md) — Nested type extraction enhancement needed for Membrane Map hierarchical pins

## Evidence

- Design origin: [2026-03-22.1.md chat log](../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-22.1.md) — full design conversation including barrel-as-membrane, namespace mode, and cross-language pressure testing
- UC-094 (Unified View Continuum) and UC-087 (Circuit Board Reimagined) in `user-use-case-census.md`
