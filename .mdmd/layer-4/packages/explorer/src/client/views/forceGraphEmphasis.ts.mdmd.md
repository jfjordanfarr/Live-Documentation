# packages/explorer/src/client/views/forceGraphEmphasis.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphEmphasis.ts
- Generated At: 2026-11-01T22:32:19.526Z

## Authored
### Purpose
Give the displayed commit a stable visual event: changed nodes become white immediately, while the rest keep their normal colour or an optionally dimmed background. The next commit replaces the changed set; playback time does not alter brightness.

### Notes
Created for the [October 31 change-emphasis request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-8), then corrected after the owner's [November 1 live playback observation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/Summarized/2026-11-01.1.SUMMARIZED.md#turn-3): the old fade reduced darkening over an interval, making unaffected nodes steadily brighten before the next commit reset them. The owner's metaphor is a network of occasionally firing fireflies, with sharp local events against a steady field.

Glow uses white for the whole displayed commit. Dim leaves unaffected nodes and wires at a fifth of their base alpha; Both combines the two; None keeps ordinary appearance. A changed wire can rise to .85 alpha. There is no clock or play-state input. Pair keys are undirected so both endpoints name the same counted wire.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `glows` {#symbol-glows}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L20)

##### `glows` — Summary
Whether the mode glows the changed.

#### `dims` {#symbol-dims}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L22)

##### `dims` — Summary
Whether the mode dims the unchanged.

#### `emphasizedSphere` {#symbol-emphasizedsphere}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L35)
- Parameters: `mode`: [`ChangeEmphasis`](../types.ts.mdmd.md#symbol-changeemphasis)

##### `emphasizedSphere` — Summary
A sphere's colour for the displayed commit: changed spheres white and whole where the mode glows; unchanged ones
dimmed where the mode dims. The result remains constant until the changed set, mode or deliberate attention changes.

#### `emphasizedWireAlpha` {#symbol-emphasizedwirealpha}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L43)
- Parameters: `mode`: [`ChangeEmphasis`](../types.ts.mdmd.md#symbol-changeemphasis)

##### `emphasizedWireAlpha` — Summary
A white reference wire's alpha under the emphasis: a changed wire's raised toward the glow, an unchanged one's reduced, where the mode says so.

#### `pairKey` {#symbol-pairkey}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L50)

##### `pairKey` — Summary
The key of an undirected pair of files, the same whichever end is named first.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ChangeEmphasis`](../types.ts.mdmd.md#symbol-changeemphasis) (type-only)
<!-- LIVE-DOC:END Dependencies -->
