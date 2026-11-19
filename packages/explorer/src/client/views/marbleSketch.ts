/**
 * A file's marble sketch (a trial, 2026-11-18, the owner on seeing the marbles as the default: "some kind of
 * semi-random (i.e. periodic like Perlin Noise) algorithm which "hashes" (scare quotes) the contents of a file or its
 * live documentation file to produce the specific pattern shown on the marble. Minor changes to files produce subtle
 * shifts on the surface of these little marble planets. Massive changes to files completely changes their patterns").
 *
 * A sketch is the opposite of a hash: it keeps nearness. Each fact a file's Live Doc lists is a feature, and each feature
 * has a fixed direction in a space of eight dimensions, made from the feature's text by an ordinary hash; the sketch is
 * the weighted sum of its features' directions, brought to unit length. One feature more among forty moves the sum a
 * little; a file whose features are mostly new has a mostly new sum. The marble's shader reads the sketch's eight numbers
 * as the strengths of eight fixed smooth waves over the ball (`MARBLE_WAVES` in forceGraphAppearance.ts), so that a small
 * move of the sketch is a small bend of the veins.
 *
 * The features are the facts that a file holds both today and at every step of the history, so that the marble of a
 * step and today's agree where the file did not change: its count of public symbols, each a feature of its own (the
 * history carries the count and not the names), and each file it uses, weighted by the root of the references it makes
 * to it. The file's own path is one more feature, of the weight of one symbol, so that two files that list the same
 * facts still differ. The files that use a file are not its features: its own Live Doc does not list them, and the blue
 * vein already says how many there are. Pure: no DOM.
 *
 * @module marbleSketch
 */

/** The sketch's dimensions: the waves over the ball, one strength each. */
export const SKETCH_DIMENSIONS = 8;

/** One fact of a file, as text, and how much it counts. */
export interface SketchFeature { text: string; weight: number }

/** A sketch: `SKETCH_DIMENSIONS` numbers whose squares sum to one. */
export type Sketch = readonly number[];

// A NUL never stands in a path, so that the parts of a feature's text cannot run into one another.
const SEP = "\u0000";

/** The FNV-1a hash of a text, 32 bits. */
function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193);
  return hash >>> 0;
}

/** A small generator of numbers in [0, 1) from a 32-bit state (mulberry32). */
function generator(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

const directions = new Map<string, Sketch>();

/**
 * A feature's fixed direction, a unit vector of `SKETCH_DIMENSIONS` numbers drawn from its text: normal numbers, so that
 * every direction is as likely as any other, the same on every load.
 */
export function featureDirection(text: string): Sketch {
  let direction = directions.get(text);
  if (direction) return direction;
  const next = generator(fnv1a(text));
  const values: number[] = [];
  while (values.length < SKETCH_DIMENSIONS) {
    // Box and Muller's pair of normal numbers from two uniform ones; the first is kept off zero.
    const radius = Math.sqrt(-2 * Math.log(1 - next())), angle = 2 * Math.PI * next();
    values.push(radius * Math.cos(angle), radius * Math.sin(angle));
  }
  values.length = SKETCH_DIMENSIONS;
  const length = Math.hypot(...values) || 1;
  direction = values.map(value => value / length);
  if (directions.size > 50_000) directions.clear();
  directions.set(text, direction);
  return direction;
}

/** The weight of the file's own path among its features: one symbol's. */
export const OWN_PATH_WEIGHT = 1;

/**
 * A file's sketch from its features and its path: their directions summed by weight, in the order of their texts so that
 * the order they are given in does not matter, and brought to unit length. A file of no features is its path's direction.
 */
export function sketchOf(id: string, features: Iterable<SketchFeature>): Sketch {
  const all = [...features, { text: `file${SEP}${id}`, weight: OWN_PATH_WEIGHT }]
    .sort((a, b) => (a.text < b.text ? -1 : a.text > b.text ? 1 : a.weight - b.weight));
  const sum = new Array<number>(SKETCH_DIMENSIONS).fill(0);
  for (const { text, weight } of all) {
    if (!(weight > 0)) continue;
    const direction = featureDirection(text);
    for (let i = 0; i < SKETCH_DIMENSIONS; i++) sum[i] += weight * direction[i];
  }
  const length = Math.hypot(...sum);
  // A sum that cancels to nothing, which only weights chosen to do so could make, falls back to the path alone.
  return length > 1e-9 ? sum.map(value => value / length) : featureDirection(`file${SEP}${id}`);
}

/**
 * The features of a file from what its Live Doc lists that the history also carries: one for each of its public symbols,
 * named by the file and the symbol's place in the count, and one for each file it uses, weighted by the square root of
 * the references it makes to it (as if each reference were a feature of its own direction).
 */
export function fileFeatures(id: string, symbolCount: number, uses: ReadonlyMap<string, number>): SketchFeature[] {
  const features: SketchFeature[] = [];
  for (let k = 1; k <= symbolCount; k++) features.push({ text: `symbol${SEP}${id}${SEP}${k}`, weight: 1 });
  for (const [target, references] of uses) features.push({ text: `uses${SEP}${target}`, weight: Math.sqrt(Math.max(1, references)) });
  return features;
}

/** The distance between two sketches, 0 for the same and 2 for opposite. */
export const sketchDistance = (a: Sketch, b: Sketch): number => Math.hypot(...a.map((value, i) => value - b[i]));

interface SketchGraph {
  nodes: readonly { id: string; publicSymbols?: readonly string[]; symbolCount?: number }[];
  links: readonly { source: string | { id: string }; target: string | { id: string }; referenceCount?: number }[];
}

const sketchesByGraph = new WeakMap<object, ReadonlyMap<string, Sketch>>();

/**
 * Every file's sketch in a scan's graph, today's or a moment of the history's, by id: its symbols by count (a moment's
 * files carry the count alone, today's the names, of which the count is taken), and the files it uses with the
 * references it makes to each, summed over the links between the two.
 */
export function marbleSketches(graph: SketchGraph): ReadonlyMap<string, Sketch> {
  const known = sketchesByGraph.get(graph);
  if (known) return known;
  const uses = new Map<string, Map<string, number>>();
  for (const link of graph.links) {
    const source = typeof link.source === "string" ? link.source : link.source.id, target = typeof link.target === "string" ? link.target : link.target.id;
    if (source === target) continue;
    const of = uses.get(source) ?? uses.set(source, new Map()).get(source)!;
    of.set(target, (of.get(target) ?? 0) + Math.max(1, link.referenceCount ?? 1));
  }
  const sketches = new Map<string, Sketch>();
  const none = new Map<string, number>();
  for (const node of graph.nodes) {
    const count = node.symbolCount ?? node.publicSymbols?.length ?? 0;
    sketches.set(node.id, sketchOf(node.id, fileFeatures(node.id, Number.isFinite(count) ? count : 0, uses.get(node.id) ?? none)));
  }
  sketchesByGraph.set(graph, sketches);
  return sketches;
}
