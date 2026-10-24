# packages/explorer/src/client/views/forceGraphAppearance.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphAppearance.ts
- Generated At: 2026-10-24T19:41:34.719Z

## Authored
### Purpose
Keeps the spatial map's file-archetype colours and their names together, so its spheres and legend describe the same kinds. Unknown and absent kinds share a neutral fallback.

### Notes
Extracted from `forceGraphView.ts` during the [October 24 Connections review](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-12). The [October 23 review](../../../../../../../AI-Agent-Workspace/Screenshots/2026-10-23/README.md) had found that the sidebar described offer/use colours while the spatial map coloured whole files by archetype. These colours retain their existing meaning; they do not describe dependency direction.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SPATIAL_NODE_STYLES` {#symbol-spatial_node_styles}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L2)

##### `SPATIAL_NODE_STYLES` — Summary
The file kinds actually coloured by the spatial map, shared with its legend.

#### `spatialNodeStyle` {#symbol-spatialnodestyle}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L15)

##### `spatialNodeStyle` — Summary
Unknown or absent file kinds receive the same neutral colour in the picture and key.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
