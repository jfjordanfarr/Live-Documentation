# packages/explorer/src/client/views/forceGraphScope.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphScope.ts
- Generated At: 2026-11-02T06:07:14.773Z

## Authored
### Purpose
Decides what the 3D Local Map shows: the hops of connections around what a person asked about, each shown sphere's hop and how many of its connections the picture leaves out, and where a picture starts when nothing is asked about, the same on the page and in the headless layout lab.

### Notes
Written on 2026-10-31 for discovery, the owner's direction that the 3D Local Map should hide by default and reveal by hops ([Turn 4 of the October 31 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4): "In the 3D Local Map, the whole universe is shown -- always. What if _that's_ the mistake?"; [Turn 7](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-7): "hiding rather than showing nodes ... discovery should be the default mode of interaction"). `spatialScope` is a breadth-first walk from the attention set over the links that connect in the layout, up to the tuning's hops, counted once per pair however many links join it; a sphere reached by two routes has the nearer hop, and attention not in the picture is ignored as the reveal ignores it. The counts beyond are the frontier's "more here", which the view writes into a frontier sphere's name. `startOf` is the owner's "priority fallbacks" of [Turn 8](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-8): in Structure the scan root's hub; in Connections the files the repository declares as entry points (`Entry: declared`, the configuration's `entryPoints`), failing those the most connected file, ties by id, never a document or a hub. The entries a doc infers are not used for the start because, measured that day, the programs' mains named the integration sample programs here and fixture scripts on T3 Code, and the software's centre in neither; the declared entries here are the Explorer's page and stylesheet, and on T3 nothing is declared. That fallback reached a third of the repository. On [November 2](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-01.1.record.md#turn-6--november-2-the-3d-exploration-pass), the owner chose Structure as the fresh default when there is no declared entry. An explicit or remembered layout still wins, and Connections still has its deterministic fallback when deliberately selected.

The component landmarks choose one real member of each disconnected component by degree and then identity, including every isolated file. The renderer uses those identities and component sizes to prioritize names; they do not add nodes or relationships to the scope. Temporary directory discovery resolves an exact hub or its sole collapsed descendant, then collects only that directory's file/document members within containment hops. This lets Connections carry the same discovered neighborhood without silently retaining an entire subtree.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `StartableNode` {#symbol-startablenode}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L24)
- Extends: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)

##### `StartableNode` — Summary
What the start reads of a node beyond its links: a hub's directory, a document's kind, a file's entry reasons.

#### `directoryHubOf` {#symbol-directoryhubof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L33)

##### `directoryHubOf` — Summary
Resolve a directory in the pruned containment tree, including an ancestor collapsed into its only descendant hub.

#### `directoryMembersWithinHops` {#symbol-directorymemberswithinhops}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L45)
- Constraints: [`StartableNode`](#symbol-startablenode)

##### `directoryMembersWithinHops` — Summary
Files/documents inside a discovered directory's visible containment neighborhood, without opening its whole subtree.

#### `defaultSpatialLayout` {#symbol-defaultspatiallayout}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L54)
- Returns: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)

##### `defaultSpatialLayout` — Summary
A fresh 3D visit starts from declared entries when present, otherwise from the directory structure.

#### `SpatialScope (interface)` {#symbol-spatialscope-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L59)

##### `SpatialScope (interface)` — Summary
The shown part of a picture: each shown sphere's hop from what was asked about, and the frontier's counts beyond.

#### `connectedNeighbours` {#symbol-connectedneighbours}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L69)
- Parameters: `link`: [`SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- Constraints: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)

##### `connectedNeighbours` — Summary
Each node's connected neighbours over the links that connect in the layout, counted once however many links join a pair.

#### `spatialScope (function)` {#symbol-spatialscope-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L88)
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
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L110)
- Parameters: `beside`: `ReadonlyMap`

##### `mostConnectedFirst` — Summary
Most connected first, then by id, so that a choice is the same on every machine.

#### `componentLandmarks` {#symbol-componentlandmarks}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L115)
- Parameters: `beside`: `ReadonlyMap`

##### `componentLandmarks` — Summary
One real file and member count for each disconnected component, including isolates; ties are deterministic.

#### `startOf` {#symbol-startof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L137)
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
- [`directory-state.under`](./localView/directory-state.ts.mdmd.md#symbol-under)
<!-- LIVE-DOC:END Dependencies -->
