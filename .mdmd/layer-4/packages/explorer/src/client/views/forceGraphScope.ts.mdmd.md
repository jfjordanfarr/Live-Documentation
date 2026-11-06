# packages/explorer/src/client/views/forceGraphScope.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphScope.ts
- Generated At: 2026-11-05T23:08:51.447Z

## Authored
### Purpose
Decides what the 3D Local Map shows: the hops of connections around what a person asked about, each shown sphere's hop and how many of its connections the picture leaves out, and where a picture starts when nothing is asked about, the same on the page and in the headless layout lab.

### Notes
Written on 2026-10-31 for discovery, the owner's direction that the 3D Local Map should hide by default and reveal by hops ([Turn 4 of the October 31 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4): "In the 3D Local Map, the whole universe is shown -- always. What if _that's_ the mistake?"; [Turn 7](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-7): "hiding rather than showing nodes ... discovery should be the default mode of interaction"). `spatialScope` is a breadth-first walk from the attention set over the links that connect in the layout, up to the tuning's hops, counted once per pair however many links join it; a sphere reached by two routes has the nearer hop, and attention not in the picture is ignored as the reveal ignores it. The counts beyond are the frontier's "more here", which the view writes into a frontier sphere's name. `startOf` was the owner's "priority fallbacks" of [Turn 8](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-8): in Structure the scan root's hub; in Connections the files the repository declares as entry points (`Entry: declared`, the configuration's `entryPoints`), failing those the most connected file, ties by id, never a document or a hub. The entries a doc infers were not used because, measured that day, the programs' mains named the integration sample programs here and fixture scripts on T3 Code, and the software's centre in neither; the declared entries here are the Explorer's page and stylesheet, and on T3 nothing is declared; that fallback reached a third of the repository. Since 2026-11-02 ([Turn 3](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-02.1.record.md#turn-3) and [Turn 4](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-02.1.record.md#turn-4) of the November 2 record) the Connections start is the archipelago: every group's seed, the most connected file of each disconnected component, ties by id, never a document or a hub, and nothing grown, `startHops` saying that a start shows no hops in Connections and the tuning's in Structure. The owner would have the tool require less authorial intent of its user, and a declared entry as a seed would be "a special node which _might_ expand but might actually not". On [November 2](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/Summarized/2026-11-01.1.SUMMARIZED.md#turn-6), the owner chose Structure as the fresh default when there is no declared entry. An explicit or remembered layout still wins, and Connections still has its deterministic fallback when deliberately selected.

`componentMembers` names each disconnected component by its seed, with its members sorted, and `componentLandmarks` gives the seeds with their sizes, both over the connected neighbours of the links that connect in the layout, every node visited once. Since 2026-11-02 the seeds are part of the picture ([Turn 3](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-02.1.record.md#turn-3)): while anything is asked about, `spatialScope` adds the seed of every group the hops do not reach one past the last hop, drawn dimmed as the frontier is, and reports in `groups` the groups shown only by their seed with their sizes in files, which the view writes into the seed's name. A group of nothing but hubs is never a group of the picture's, and a group that holds hubs is a containment tree, whose handle is its top hub, the root when it stands, so that a moment before a pinned file's birth shows the root dimmed rather than nothing; the history specs of that day found the tree seeded by its first file by id. Before that day the landmarks only prioritised names, which the view no longer does: names stand at rest beside what was asked about, the rest at the Name At lever. Temporary directory discovery resolves an exact hub or its sole collapsed descendant, then collects only that directory's file/document members within containment hops. This lets Connections carry the same discovered neighborhood without silently retaining an entire subtree.

Since 2026-11-05 the scope also names each group's files (`groupFiles`), what `groups` counts, so that a [wrapper](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences) is drawn around the same files the count names.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `StartableNode` {#symbol-startablenode}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L29)
- Extends: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)

##### `StartableNode` — Summary
What the start reads of a node beyond its links: a hub's directory, a document's kind, a file's entry reasons.

#### `directoryHubOf` {#symbol-directoryhubof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L38)

##### `directoryHubOf` — Summary
Resolve a directory in the pruned containment tree, including an ancestor collapsed into its only descendant hub.

#### `directoryMembersWithinHops` {#symbol-directorymemberswithinhops}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L50)
- Constraints: [`StartableNode`](#symbol-startablenode)

##### `directoryMembersWithinHops` — Summary
Files/documents inside a discovered directory's visible containment neighborhood, without opening its whole subtree.

#### `defaultSpatialLayout` {#symbol-defaultspatiallayout}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L59)
- Returns: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)

##### `defaultSpatialLayout` — Summary
A fresh 3D visit starts from declared entries when present, otherwise from the directory structure.

#### `SpatialScope (interface)` {#symbol-spatialscope-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L64)

##### `SpatialScope (interface)` — Summary
The shown part of a picture: each shown sphere's hop from what was asked about, and the frontier's counts beyond.

#### `connectedNeighbours` {#symbol-connectedneighbours}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L86)
- Parameters: `link`: [`SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- Constraints: [`SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode)

##### `connectedNeighbours` — Summary
Each node's connected neighbours over the links that connect in the layout, counted once however many links join a pair.

#### `spatialScope (function)` {#symbol-spatialscope-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L105)
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
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L144)
- Parameters: `beside`: `ReadonlyMap`

##### `mostConnectedFirst` — Summary
Most connected first, then by id, so that a choice is the same on every machine.

#### `componentMembers` {#symbol-componentmembers}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L162)
- Parameters: `beside`: `ReadonlyMap`

##### `componentMembers` — Summary
Each disconnected component by its seed, with its members: the seed is the most connected member that may seed, ties
by id, so that the choice is the same on every machine; a component with no such member is seeded by its most
connected member. The walk visits every node once, so a picture of thousands of lone files costs what it holds.

#### `componentLandmarks` {#symbol-componentlandmarks}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L181)
- Parameters: `beside`: `ReadonlyMap`

##### `componentLandmarks` — Summary
One real file and member count for each disconnected component, including isolates; ties are deterministic.

#### `startOf` {#symbol-startof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L191)
- Parameters: `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout); `link`: [`SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink)
- Constraints: [`StartableNode`](#symbol-startablenode)

##### `startOf` — Summary
Where a picture starts when nothing is asked about: in the structure layout the scan root's hub, with the hops around
it; in the connections layout the archipelago, every group's seed and nothing grown, so the caller shows no hops
around this start (`startHops`). A document or a hub seeds a group only when it holds no file. An empty picture has
no start.

#### `startHops` {#symbol-starthops}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphScope.ts#L202)
- Parameters: `layout`: [`SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)

##### `startHops` — Summary
How many hops a layout's start shows around itself: a tree's root with its children, an archipelago's seeds alone.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`forceGraphLayout.SpatialLink`](./forceGraphLayout.ts.mdmd.md#symbol-spatiallink) (type-only)
- [`forceGraphLayout.SpatialNode`](./forceGraphLayout.ts.mdmd.md#symbol-spatialnode) (type-only)
- [`directory-state.under`](./localView/directory-state.ts.mdmd.md#symbol-under)
<!-- LIVE-DOC:END Dependencies -->
