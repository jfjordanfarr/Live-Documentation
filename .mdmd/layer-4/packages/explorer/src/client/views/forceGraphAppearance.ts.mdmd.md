# packages/explorer/src/client/views/forceGraphAppearance.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphAppearance.ts
- Generated At: 2026-11-17T01:03:04.635Z

## Authored
### Purpose
Pairs each kind of file the spatial maps colour with the word the keys give it, its colour read from the palette in force, so that the spheres, the 2D cells and both keys describe the same kinds. Unknown and absent kinds share a neutral fallback.

### Notes
Extracted from `forceGraphView.ts` during the [October 24 Connections review](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-12). The [October 23 review](../../../../../../../AI-Agent-Workspace/Screenshots/2026-10-23/README.md) had found that the sidebar described offer/use colours while the spatial map coloured whole files by archetype. These colours retain their existing meaning; they do not describe dependency direction. Since the [November 16 colour pass](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-1) the colours live in the palette (`palette.ts`), and the three kinds that nothing produces (interface, configuration, script) are gone.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialKind` {#symbol-spatialkind}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L14)

##### `SpatialKind` — Summary
A kind the maps colour.

#### `SpatialNodeStyle (interface)` {#symbol-spatialnodestyle-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L17)

##### `SpatialNodeStyle (interface)` — Summary
A kind's colour and its word.

#### `spatialNodeStyles` {#symbol-spatialnodestyles}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L27)

##### `spatialNodeStyles` — Summary
The file kinds the spatial maps colour, in the keys' order, one object each for as long as a palette is in force.

#### `spatialKindOf` {#symbol-spatialkindof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L38)
- Returns: [`SpatialKind`](#symbol-spatialkind)

##### `spatialKindOf` — Summary
The kind an archetype is drawn as; an unknown or absent one is `other`.

#### `spatialNodeStyle (function)` {#symbol-spatialnodestyle-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L44)
- Returns: [`SpatialNodeStyle`](#symbol-spatialnodestyle-interface)

##### `spatialNodeStyle (function)` — Summary
Unknown or absent file kinds receive the same neutral colour in the picture and key.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`palette.Colour`](../palette.ts.mdmd.md#symbol-colour)
- [`Palette`](../palette.ts.mdmd.md#symbol-palette)
- [`palette.activePalette`](../palette.ts.mdmd.md#symbol-activepalette)
<!-- LIVE-DOC:END Dependencies -->
