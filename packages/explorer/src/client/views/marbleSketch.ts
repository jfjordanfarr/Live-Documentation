/**
 * A file's marble sketch (a trial, 2026-11-18, the owner on seeing the marbles as the default: "some kind of
 * semi-random (i.e. periodic like Perlin Noise) algorithm which "hashes" (scare quotes) the contents of a file or its
 * live documentation file to produce the specific pattern shown on the marble. Minor changes to files produce subtle
 * shifts on the surface of these little marble planets. Massive changes to files completely changes their patterns").
 *
 * A sketch is the opposite of a hash: it keeps nearness. Each fact a file's Live Doc lists is a feature, and each feature
 * has a fixed direction in a space of eight dimensions, made from the feature's text by an ordinary hash. The features'
 * directions are summed by weight, and each of the sum's eight components is wrapped through a sine,
 * `strength = SKETCH_STRENGTH · sin(sum / SKETCH_TURN)`. The marble's shader reads the eight strengths as those of eight
 * fixed smooth waves over the ball (`MARBLE_WAVES` in forceGraphAppearance.ts), so that a small move of a strength is a
 * small bend of the veins.
 *
 * The wrap took the place of bringing the sum to unit length (2026-11-19). A unit length divides every change by the
 * file's size: on a file of 2,500 lines, the sketch of its own lines moved by 0.01 to 0.03 for a commit of thirty lines,
 * which no eye could see. Without it, one feature more moves each component of the sum by the same amount in a file of
 * five features or five hundred, about 0.35 (one component of a unit direction in eight dimensions), and so turns each
 * wave's argument by about 0.35 / `SKETCH_TURN` radians: one fact is a subtle shift, many are plain, and enough wrap
 * round to another marble, periodic as the owner asked. The strengths are bounded by `SKETCH_STRENGTH`, the same for the
 * same facts in any order, and near for near facts: a change of the sum moves them by at most `SKETCH_STRENGTH /
 * SKETCH_TURN` times as much. A file of few facts has a small sum and so weak strengths, a nearly plain marble; a file
 * with much in it has a rich one.
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

/**
 * How much change of a component of the features' sum turns its wave's strength by a radian. Chosen by eye on
 * 2026-11-19 from sheets at 2, 4 and 8 (the marble-patterns pictures of November 18): one fact is a shift found when
 * looked for, and a commit of thirty lines to a large file a shift seen at a glance.
 */
export const SKETCH_TURN = 4;

/**
 * The strength of a wave at the crest of its sine. A large file's components are spread evenly round the circle, where
 * a sine's root mean square is 1/√2, so one half gives each strength a root mean square of 1/√8 and the eight together
 * a length of about one: the unit length the sketch had before the wrap, so that a Vein Bend means what it meant.
 */
export const SKETCH_STRENGTH = 0.5;

/** One fact of a file, as text, and how much it counts. */
export interface SketchFeature { text: string; weight: number }

/** A sketch: `SKETCH_DIMENSIONS` strengths, each within ±`SKETCH_STRENGTH`. */
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
 * The features' directions summed by weight, with the file's path among them, in the order of their texts so that the
 * order they are given in does not matter: the sum before the wrap.
 */
export function featureSum(id: string, features: Iterable<SketchFeature>): number[] {
  const all = [...features, { text: `file${SEP}${id}`, weight: OWN_PATH_WEIGHT }]
    .sort((a, b) => (a.text < b.text ? -1 : a.text > b.text ? 1 : a.weight - b.weight));
  const sum = new Array<number>(SKETCH_DIMENSIONS).fill(0);
  for (const { text, weight } of all) {
    if (!(weight > 0)) continue;
    const direction = featureDirection(text);
    for (let i = 0; i < SKETCH_DIMENSIONS; i++) sum[i] += weight * direction[i];
  }
  return sum;
}

/** A sum's strengths: each component wrapped through a sine, `turn` of it a radian. */
export const strengthsOf = (sum: readonly number[], turn: number = SKETCH_TURN): Sketch => sum.map(value => SKETCH_STRENGTH * Math.sin(value / turn));

/** A file's sketch from its features and its path. */
export const sketchOf = (id: string, features: Iterable<SketchFeature>, turn: number = SKETCH_TURN): Sketch => strengthsOf(featureSum(id, features), turn);

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

/** The distance between two sketches, 0 for the same. */
export const sketchDistance = (a: Sketch, b: Sketch): number => Math.hypot(...a.map((value, i) => value - b[i]));

interface SketchGraph {
  nodes: readonly { id: string; publicSymbols?: readonly string[]; symbolCount?: number }[];
  links: readonly { source: string | { id: string }; target: string | { id: string }; referenceCount?: number }[];
}

const sumsByGraph = new WeakMap<object, ReadonlyMap<string, readonly number[]>>();
const sketchesByGraph = new WeakMap<object, ReadonlyMap<string, Sketch>>();

/**
 * Every file's features' sum in a scan's graph, today's or a moment of the history's, by id: its symbols by count (a
 * moment's files carry the count alone, today's the names, of which the count is taken), and the files it uses with the
 * references it makes to each, summed over the links between the two.
 */
export function marbleFeatureSums(graph: SketchGraph): ReadonlyMap<string, readonly number[]> {
  const known = sumsByGraph.get(graph);
  if (known) return known;
  const uses = new Map<string, Map<string, number>>();
  for (const link of graph.links) {
    const source = typeof link.source === "string" ? link.source : link.source.id, target = typeof link.target === "string" ? link.target : link.target.id;
    if (source === target) continue;
    const of = uses.get(source) ?? uses.set(source, new Map()).get(source)!;
    of.set(target, (of.get(target) ?? 0) + Math.max(1, link.referenceCount ?? 1));
  }
  const sums = new Map<string, readonly number[]>();
  const none = new Map<string, number>();
  for (const node of graph.nodes) {
    const count = node.symbolCount ?? node.publicSymbols?.length ?? 0;
    sums.set(node.id, featureSum(node.id, fileFeatures(node.id, Number.isFinite(count) ? count : 0, uses.get(node.id) ?? none)));
  }
  sumsByGraph.set(graph, sums);
  return sums;
}

/** Every file's sketch in a scan's graph, by id: its features' sum wrapped (`marbleFeatureSums`, `strengthsOf`). */
export function marbleSketches(graph: SketchGraph): ReadonlyMap<string, Sketch> {
  const known = sketchesByGraph.get(graph);
  if (known) return known;
  const sketches = new Map([...marbleFeatureSums(graph)].map(([id, sum]) => [id, strengthsOf(sum)]));
  sketchesByGraph.set(graph, sketches);
  return sketches;
}
