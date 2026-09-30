# packages/explorer/src/client/persistence/place.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/persistence/place.ts
- Generated At: 2026-09-30T01:36:12.302Z

## Authored
### Purpose
Reads the place an Explorer address names, the view, the file in focus, the Membrane Map's open folders and the two ends of a path, as a key that tells a move from a change within a place.

### Notes
- It decodes the Membrane Map's compressed `?s=` because that one parameter carries both where the person is (the open folders) and what they did there (pins, cards, pan, zoom); comparing raw addresses would count a pin as a move.
- A path counts only once it has both ends, and the `?data=` parameter is ignored.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `placeOf` {#symbol-placeof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/place.ts#L11)

##### `placeOf` — Summary
Reads the place from an address's query, in either form the Explorer writes: `?view=&node=` or the compressed `?s=`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`compressed-url-state.decompressSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`url-state.viewNameToInternal`](./url-state.ts.mdmd.md#symbol-viewnametointernal)
<!-- LIVE-DOC:END Dependencies -->
