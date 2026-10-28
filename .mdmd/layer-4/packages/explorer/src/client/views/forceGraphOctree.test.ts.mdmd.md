# packages/explorer/src/client/views/forceGraphOctree.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphOctree.test.ts
- Generated At: 2026-10-28T18:35:56.779Z

## Authored
### Purpose
Holds the octree of `forceGraphOctree.ts` to its promises: every sphere in exactly one leaf, cells nested depth first with their spheres' true boxes, centres, widths and largest radii, a search for touching spheres that finds exactly what testing every pair finds, and a grid that stays put while a picture comes to rest.

### Notes
The structure is checked over clouds of 700 spheres at leaf sizes of one, three and the shipped sixteen, and again after every sphere moved, so the reused buffers hold a fresh tree: every sphere once in `order`, the root's run the whole, each cell's box, width, centre and largest radius recomputed from its own spheres, each leaf small or of width zero, and each split cell's two or more children following it and sharing its run in order. The touching search is compared with testing every pair, at three gaps, beside one sphere far larger than the rest, the shape of the T3 bundle. Moving a lone outer sphere forty units within its cell of the grid leaves the order and every cell's run unchanged. Forty spheres at one point make one leaf of width zero centred exactly there, and a crowd at one point inside a cloud shares a leaf; a line, one sphere and none build; radii, leaf sizes and positions the tree cannot hold are refused.

Written with the module on 2026-10-28. Seen to fail when the code was broken on purpose the same day: splitting about the spheres' own bounds failed the grid's test, a search that forgot a cell's largest radius failed the search's, leaves twice too large failed the structure's, and spheres at one point centred by a divided sum failed the point's. The grid's test at first moved the outermost sphere by a thousandth, which moved every plane of a grid about the spheres' own bounds too little to part any sphere from its cell, and passed; it now moves a lone sphere forty units within its own cell of the fixed grid, which would move such a grid's planes twenty.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphOctree.LEAF_SIZE`](./forceGraphOctree.ts.mdmd.md#symbol-leaf_size)
- [`forceGraphOctree.SphereOctree`](./forceGraphOctree.ts.mdmd.md#symbol-sphereoctree)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
