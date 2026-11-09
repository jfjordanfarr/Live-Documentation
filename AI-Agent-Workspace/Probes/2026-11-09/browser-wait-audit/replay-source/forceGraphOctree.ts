/**
 * An octree over the 3D Local Map's spheres, held in flat typed arrays and built afresh from their positions at every
 * evaluation of the field, so that the field can sum its repulsion by Barnes and Hut's approximation and find every
 * overlapping pair without testing every pair (`forceGraphPhysics.ts`).
 *
 * The cells are stored depth first: cell 0 is the root, a cell's first child follows it, and `next` names the first cell
 * after its subtree, so that a walk is one loop over indices that either descends or skips. Each cell holds a run of the
 * tree's order of the spheres, the smallest box around their centres, their mean position, the box's largest side and the
 * largest radius among them, so that a search for the spheres one sphere touches visits only the cells that could hold
 * one: searching every sphere as far as the largest sphere's reach tested 530 candidates a sphere at the T3 seed of
 * 2026-10-27, where the largest radius is 66.8 and the median 5.8, and took 687 ms of an evaluation's 1,100.
 *
 * Cells are split about the centres of a grid fixed in space, an origin-centred cube whose side is a power of two, rather
 * than about the bodies' own bounds, so that a small move of the outermost spheres does not shift every boundary: as the
 * picture comes to rest, the cells stay the same unless a sphere crosses one. A cell whose bodies all fall into one
 * octant is narrowed to it without a cell of its own, so every split cell has at least two children and a tree over n
 * bodies holds fewer than 2n cells; and since the cubes of such a grid nest, the tree is the same whichever power of two
 * the picture fills. A cell whose bodies all stand at one point is not split at all.
 */

/**
 * The most bodies a leaf holds before it is split, unless its bodies cannot be split: of 2, 4, 8, 16 and 32, sixteen gave
 * the fastest evaluation at the T3 seed at an approximation of 0.7 and a slightly smaller error than eight (2026-10-28).
 */
export const LEAF_SIZE = 16;

/** The deepest a cell is split below the root; bodies that a split this fine cannot part share a leaf. */
const MAX_DEPTH = 64;

/** The octree over one set of spheres, rebuilt in place by `build`; its arrays are valid until the next build. */
export class SphereOctree {
  /**
   * The bodies in the tree's order: cell c holds `order[start[c]]` up to, and not including, `order[end[c]]`, so that a
   * walk over the bodies in this order knows whether a cell holds the one it is at by two comparisons.
   */
  readonly order: Int32Array;
  /** How many cells the last build made. */
  cellCount = 0;
  readonly start: Int32Array;
  readonly end: Int32Array;
  /** The first cell after a cell's subtree; a cell is a leaf when this is its own index plus one. */
  readonly next: Int32Array;
  /** The mean position of a cell's bodies, its centre of charge when every body carries the same charge. */
  readonly centreX: Float64Array;
  readonly centreY: Float64Array;
  readonly centreZ: Float64Array;
  /** The smallest box around a cell's bodies. */
  readonly lowX: Float64Array;
  readonly lowY: Float64Array;
  readonly lowZ: Float64Array;
  readonly highX: Float64Array;
  readonly highY: Float64Array;
  readonly highZ: Float64Array;
  /** The box's largest side: zero exactly when every body of the cell stands at one point. */
  readonly width: Float64Array;
  /** The largest radius among a cell's spheres. */
  readonly largest: Float64Array;
  /** How many spheres the tree holds. */
  readonly count: number;
  private positions: Float64Array = new Float64Array(0);
  private readonly scratch: Int32Array;
  private readonly octant: Uint8Array;
  /** Nine child boundaries for each level of the build's recursion. */
  private readonly bounds: Int32Array;
  /** The next free place of each octant's run while a cell's bodies are sorted. */
  private readonly fill = new Int32Array(8);

  constructor(readonly radii: Float64Array, readonly leafSize: number = LEAF_SIZE) {
    if (!radii.every(radius => Number.isFinite(radius) && radius >= 0)) throw new Error("An octree's spheres need finite, nonnegative radii.");
    if (!(Number.isInteger(leafSize) && leafSize >= 1)) throw new Error("An octree's leaves must hold at least one body.");
    const count = this.count = radii.length;
    const cells = Math.max(1, 2 * count - 1);
    this.order = new Int32Array(count);
    this.scratch = new Int32Array(count);
    this.octant = new Uint8Array(count);
    this.start = new Int32Array(cells);
    this.end = new Int32Array(cells);
    this.next = new Int32Array(cells);
    this.centreX = new Float64Array(cells);
    this.centreY = new Float64Array(cells);
    this.centreZ = new Float64Array(cells);
    this.lowX = new Float64Array(cells);
    this.lowY = new Float64Array(cells);
    this.lowZ = new Float64Array(cells);
    this.highX = new Float64Array(cells);
    this.highY = new Float64Array(cells);
    this.highZ = new Float64Array(cells);
    this.width = new Float64Array(cells);
    this.largest = new Float64Array(cells);
    this.bounds = new Int32Array(9 * (MAX_DEPTH + 1));
  }

  /** Build the tree over these positions, x, y, z per body; they must stay unchanged while the tree is read. */
  build(positions: Float64Array): void {
    if (positions.length !== 3 * this.count) throw new Error("An octree needs three numbers per body.");
    if (!positions.every(Number.isFinite)) throw new Error("An octree needs finite positions.");
    this.positions = positions;
    this.cellCount = 0;
    if (!this.count) return;
    for (let i = 0; i < this.count; i++) this.order[i] = i;
    let extent = 0;
    for (const value of positions) extent = Math.max(extent, Math.abs(value));
    let half = 1;
    while (half < extent) half *= 2;
    while (half / 2 >= extent && half / 2 > 0 && extent > 0) half /= 2;
    this.split(0, this.count, 0, 0, 0, half, 0, 0);
  }

  /** The square of the distance from a point to cell c's box, zero inside it. */
  nearest2(c: number, px: number, py: number, pz: number): number {
    const dx = px < this.lowX[c] ? this.lowX[c] - px : px > this.highX[c] ? px - this.highX[c] : 0;
    const dy = py < this.lowY[c] ? this.lowY[c] - py : py > this.highY[c] ? py - this.highY[c] : 0;
    const dz = pz < this.lowZ[c] ? this.lowZ[c] - pz : pz > this.highZ[c] ? pz - this.highZ[c] : 0;
    return dx * dx + dy * dy + dz * dz;
  }

  /** The square of the distance from a point to the farthest corner of cell c's box. */
  farthest2(c: number, px: number, py: number, pz: number): number {
    const dx = Math.max(px - this.lowX[c], this.highX[c] - px);
    const dy = Math.max(py - this.lowY[c], this.highY[c] - py);
    const dz = Math.max(pz - this.lowZ[c], this.highZ[c] - pz);
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * Write into `found` every sphere whose centre stands within `radius` plus its own radius plus `gap` of the point, and
   * return how many there are: every sphere that a sphere of that radius there could stand closer to than their clearance.
   * The distance and the reach are reckoned as the field reckons a pair's, the point's coordinates less the sphere's and
   * the radius, the sphere's radius and the gap added in that order, so that no pair the field would find closer than its
   * clearance is missed; a cell is passed over only when its box lies beyond the reach of its largest sphere.
   */
  touching(px: number, py: number, pz: number, radius: number, gap: number, found: Int32Array): number {
    const x = this.positions;
    let count = 0;
    for (let c = 0; c < this.cellCount;) {
      const reach = radius + this.largest[c] + gap;
      if (this.nearest2(c, px, py, pz) > reach * reach) { c = this.next[c]; continue; }
      if (this.next[c] === c + 1) {
        for (let p = this.start[c]; p < this.end[c]; p++) {
          const j = this.order[p], a = 3 * j, clearance = radius + this.radii[j] + gap;
          const dx = px - x[a], dy = py - x[a + 1], dz = pz - x[a + 2];
          if (dx * dx + dy * dy + dz * dz <= clearance * clearance) found[count++] = j;
        }
      }
      c++;
    }
    return count;
  }

  /** Make the cell of order[start, end) inside the grid cube at (cx, cy, cz) of half-side `half`, and its subtree. */
  private split(start: number, end: number, cx: number, cy: number, cz: number, half: number, depth: number, level: number): void {
    const x = this.positions, cell = this.cellCount++;
    let lx = Infinity, ly = Infinity, lz = Infinity, hx = -Infinity, hy = -Infinity, hz = -Infinity, sx = 0, sy = 0, sz = 0, largest = 0;
    for (let p = start; p < end; p++) {
      const body = this.order[p], a = 3 * body, px = x[a], py = x[a + 1], pz = x[a + 2];
      if (this.radii[body] > largest) largest = this.radii[body];
      if (px < lx) lx = px;
      if (px > hx) hx = px;
      if (py < ly) ly = py;
      if (py > hy) hy = py;
      if (pz < lz) lz = pz;
      if (pz > hz) hz = pz;
      sx += px; sy += py; sz += pz;
    }
    const count = end - start, width = Math.max(hx - lx, hy - ly, hz - lz);
    this.start[cell] = start; this.end[cell] = end;
    this.lowX[cell] = lx; this.lowY[cell] = ly; this.lowZ[cell] = lz;
    this.highX[cell] = hx; this.highY[cell] = hy; this.highZ[cell] = hz;
    this.width[cell] = width;
    this.largest[cell] = largest;
    // Bodies at one point have that point as their centre exactly, which a sum divided back might miss by a rounding.
    if (width === 0) { this.centreX[cell] = lx; this.centreY[cell] = ly; this.centreZ[cell] = lz; }
    else { this.centreX[cell] = sx / count; this.centreY[cell] = sy / count; this.centreZ[cell] = sz / count; }
    this.next[cell] = cell + 1;
    if (count <= this.leafSize || width === 0) return;
    const bounds = this.bounds, at = 9 * level;
    for (;;) {
      if (depth >= MAX_DEPTH) return;
      if (this.partition(start, end, cx, cy, cz, at) > 1) break;
      // Every body fell into one octant: narrow the cube to it and split again, with no cell for the narrowing.
      const o = this.octant[start], quarter = half / 2;
      cx += o & 1 ? quarter : -quarter; cy += o & 2 ? quarter : -quarter; cz += o & 4 ? quarter : -quarter;
      half = quarter; depth++;
    }
    const quarter = half / 2;
    for (let o = 0; o < 8; o++) {
      const from = bounds[at + o], to = bounds[at + o + 1];
      if (from === to) continue;
      this.split(from, to, cx + (o & 1 ? quarter : -quarter), cy + (o & 2 ? quarter : -quarter), cz + (o & 4 ? quarter : -quarter), quarter, depth + 1, level + 1);
    }
    this.next[cell] = this.cellCount;
  }

  /** Sort order[start, end) by octant about the centre, writing the nine boundaries at `at`; return how many octants hold bodies. */
  private partition(start: number, end: number, cx: number, cy: number, cz: number, at: number): number {
    const x = this.positions, bounds = this.bounds;
    for (let o = 0; o <= 8; o++) bounds[at + o] = 0;
    for (let p = start; p < end; p++) {
      const a = 3 * this.order[p];
      const o = (x[a] >= cx ? 1 : 0) | (x[a + 1] >= cy ? 2 : 0) | (x[a + 2] >= cz ? 4 : 0);
      this.octant[p] = o;
      bounds[at + o + 1]++;
    }
    let occupied = 0;
    bounds[at] = start;
    for (let o = 0; o < 8; o++) {
      if (bounds[at + o + 1]) occupied++;
      bounds[at + o + 1] += bounds[at + o];
    }
    if (occupied > 1) {
      // Each body goes to the next free place of its octant's run, in the order it stood, then back in place.
      const fill = this.fill;
      for (let o = 0; o < 8; o++) fill[o] = bounds[at + o];
      for (let p = start; p < end; p++) this.scratch[fill[this.octant[p]]++] = this.order[p];
      for (let p = start; p < end; p++) this.order[p] = this.scratch[p];
    }
    return occupied;
  }
}
