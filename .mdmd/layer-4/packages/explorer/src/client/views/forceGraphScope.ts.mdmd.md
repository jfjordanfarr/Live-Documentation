# packages/explorer/src/client/views/forceGraphScope.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphScope.ts
- Generated At: 2026-10-31T20:07:01.100Z

## Authored
### Purpose
Decides what the 3D Local Map shows: the hops of connections around what a person asked about, each shown sphere's hop and how many of its connections the picture leaves out, and where a picture starts when nothing is asked about, the same on the page and in the headless layout lab.

### Notes
Written on 2026-10-31 for discovery, the owner's direction that the 3D Local Map should hide by default and reveal by hops ([Turn 4 of the October 31 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4): "In the 3D Local Map, the whole universe is shown -- always. What if _that's_ the mistake?"; [Turn 7](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-7): "hiding rather than showing nodes ... discovery should be the default mode of interaction"). `spatialScope` is a breadth-first walk from the attention set over the links that connect in the layout, up to the tuning's hops, counted once per pair however many links join it; a sphere reached by two routes has the nearer hop, and attention not in the picture is ignored as the reveal ignores it. The counts beyond are the frontier's "more here", which the view writes into a frontier sphere's name. `startOf` is the owner's "priority fallbacks" of [Turn 8](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-8): in Structure the scan root's hub; in Connections the files the repository declares as entry points (`Entry: declared`, the configuration's `entryPoints`), failing those the most connected file, ties by id, never a document or a hub. The entries a doc infers are not used for the start because, measured that day, the programs' mains named the integration sample programs here and fixture scripts on T3 Code, and the software's centre in neither; the declared entries here are the Explorer's page and stylesheet, and on T3 nothing is declared, so it starts at Binding.ts, whose two hops are a third of that repository, which the Hops Shown lever narrows.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `StartableNode` {#symbol-startablenode}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L23)
- Extends: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)

##### `StartableNode` — Summary
What the start reads of a node beyond its links: a hub's directory, a document's kind, a file's entry reasons.

#### `SpatialScope (interface)` {#symbol-spatialscope-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L31)

##### `SpatialScope (interface)` — Summary
The shown part of a picture: each shown sphere's hop from what was asked about, and the frontier's counts beyond.

#### `connectedNeighbours` {#symbol-connectedneighbours}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L41)
- Parameters: `link`: [`SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- Constraints: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)

##### `connectedNeighbours` — Summary
Each node's connected neighbours over the links that connect in the layout, counted once however many links join a pair.

#### `spatialScope (function)` {#symbol-spatialscope-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L60)
- Returns: [`SpatialScope`](#symbol-spatialscope-interface)
- Parameters: `attention`: `ReadonlySet`; `link`: [`SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- Constraints: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)

##### `spatialScope (function)` — Summary
The spheres shown around what was asked about: the attention set itself at hop 0, then every sphere a connecting link
reaches from what is shown, a hop at a time, up to `hops` hops. A sphere reached by two routes has the nearer hop.
Attention that is not among the nodes is ignored, as the reveal ignores it. With `hops` zero only the attention set is
shown. The counts beyond say, for each shown sphere, how many of its connected spheres the picture leaves out: the
frontier's "more here".

#### `mostConnectedFirst` {#symbol-mostconnectedfirst}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L82)
- Parameters: `beside`: `ReadonlyMap`

##### `mostConnectedFirst` — Summary
Most connected first, then by id, so that a choice is the same on every machine.

#### `startOf` {#symbol-startof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L91)
- Parameters: `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout); `link`: [`SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- Constraints: [`StartableNode`](#symbol-startablenode)

##### `startOf` — Summary
Where a picture starts when nothing is asked about: in the structure layout the scan root's hub; in the connections
layout the files the repository declares as its entry points, and failing those the most connected file, ties by id.
A document or a hub is never the connections start. An empty picture has no start.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`forceGraphLayout.SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink) (type-only)
- [`forceGraphLayout.SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode) (type-only)
<!-- LIVE-DOC:END Dependencies -->
