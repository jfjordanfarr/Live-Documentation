# packages/explorer/src/client/views/forceGraphOctree.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphOctree.ts
- Generated At: 2026-10-28T18:35:56.800Z

## Authored
### Purpose
Holds the 3D Local Map's spheres in an octree built afresh from their positions at every evaluation of the field, so that [`forceGraphPhysics.ts`](forceGraphPhysics.ts.mdmd.md) can sum the repulsion by Barnes and Hut's approximation and find every overlapping pair without testing every pair.

### Notes
Made on 2026-10-28, after the T3 bundle's 3D view froze the day before: one exact evaluation of its 21,720 spheres took 2.2 seconds and the first tick fifteen of them (the diagnosis in `AI-Agent-Workspace/Probes/2026-10-27/t3-code/3d-startup.md`), and the owner decided that an approximation may be the field's default with the exact sum kept as the oracle. The tree is this module's own, with no dependency: `d3-octree` is only a transitive dependency of `d3-force-3d` and is not imported.

The cells live in flat typed arrays, not an object each, for speed at tens of thousands of spheres, and are stored depth first: a cell's first child follows it and `next` names the first cell after its subtree, so a walk is one loop that descends or skips, and a cell is a leaf when `next` is its own index plus one. Each cell holds a run of `order`, the spheres in the tree's order, with the smallest box around their centres, their mean position (the centre of charge, every sphere carrying the same charge), the box's largest side as its width, and the largest radius among them. A walk over the spheres in `order` knows whether a cell holds the sphere it is at by comparing positions in that order, which is how the field keeps a sphere from pushing itself.

Cells are split about the centres of a grid fixed in space, an origin-centred cube whose side is a power of two, so that the cells stay the same while a picture comes to rest unless a sphere crosses one; because the cubes of such a grid nest, the tree is the same whichever power of two the picture fills. A cell whose spheres all fall into one octant is narrowed to it without a cell of its own, so every split cell has two children or more and a tree over n spheres holds fewer than 2n cells; spheres that all stand at one point share an unsplit leaf of width zero, centred exactly at that point; below sixty-four halvings, spheres the grid cannot part share a leaf. A leaf holds up to sixteen spheres: of 2, 4, 8, 16 and 32, sixteen gave the fastest evaluation at the T3 seed at an approximation of 0.7 and a slightly smaller error than eight.

`touching` finds every sphere a sphere could stand closer to than their clearance, reckoned as the field reckons a pair so that none it would find is missed, and passes over a cell only when its box lies beyond the reach of its own largest sphere. Searching every sphere as far as the largest sphere's reach, the first way, tested 530 candidates a sphere at the T3 seed, where the largest radius is 66.8 and the median 5.8, and took 687 ms of an evaluation's 1,100; by each cell's own largest radius it finds there exactly the overlapping pairs, each sphere itself beside them, in about 75 ms.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LEAF_SIZE` {#symbol-leaf_size}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphOctree.ts#L25)

##### `LEAF_SIZE` — Summary
The most bodies a leaf holds before it is split, unless its bodies cannot be split: of 2, 4, 8, 16 and 32, sixteen gave
the fastest evaluation at the T3 seed at an approximation of 0.7 and a slightly smaller error than eight (2026-10-28).

#### `SphereOctree` {#symbol-sphereoctree}
- Type: class
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphOctree.ts#L31)

##### `SphereOctree` — Summary
The octree over one set of spheres, rebuilt in place by `build`; its arrays are valid until the next build.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
