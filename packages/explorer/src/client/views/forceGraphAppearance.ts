import { activePalette, channels, type Colour, type Palette } from "../palette";

/** The kinds of file the maps colour, each with the word the keys give it; the colours are the palette's. */
const KIND_LABELS = {
  implementation: "Implementation",
  test: "Test",
  asset: "Asset",
  document: "Document",
  directory: "Directory",
  other: "Other"
} as const satisfies Record<string, string>;

/** A kind the maps colour. */
export type SpatialKind = keyof typeof KIND_LABELS;

/** A kind's colour and its word. */
export interface SpatialNodeStyle { color: Colour; label: string }

/** The kind each archetype is drawn as; a document cited or citing is a `related-doc`. */
const KIND_OF_ARCHETYPE: Readonly<Record<string, SpatialKind>> = {
  implementation: "implementation", test: "test", asset: "asset", "related-doc": "document", directory: "directory", other: "other"
};

const stylesByPalette = new WeakMap<Palette, Readonly<Record<SpatialKind, SpatialNodeStyle>>>();

/** The file kinds the spatial maps colour, in the keys' order, one object each for as long as a palette is in force. */
export function spatialNodeStyles(): Readonly<Record<SpatialKind, SpatialNodeStyle>> {
  const palette = activePalette();
  let styles = stylesByPalette.get(palette);
  if (!styles) {
    styles = Object.fromEntries((Object.keys(KIND_LABELS) as SpatialKind[]).map(kind => [kind, { color: palette.kind[kind], label: KIND_LABELS[kind] }])) as Record<SpatialKind, SpatialNodeStyle>;
    stylesByPalette.set(palette, styles);
  }
  return styles;
}

/** The kind an archetype is drawn as; an unknown or absent one is `other`. */
export function spatialKindOf(archetype?: string): SpatialKind {
  const kind = (archetype ?? "").toLowerCase();
  return Object.hasOwn(KIND_OF_ARCHETYPE, kind) ? KIND_OF_ARCHETYPE[kind] : "other";
}

/** Unknown or absent file kinds receive the same neutral colour in the picture and key. */
export function spatialNodeStyle(archetype?: string): SpatialNodeStyle {
  return spatialNodeStyles()[spatialKindOf(archetype)];
}

/*
 * The marble (the owner's ask of 2026-11-16, Turns 7 to 9 of that day's record: "Admixtures of green and blue; marbles
 * in a galaxy, zoomable-into to see their gorgeous complexity, all computed elegantly and cheaply with simple color
 * lerping functions. Something that sends more is more blue. Something that receives more is more green", and root's
 * answer they took: "The glass is the kind ... The veins are what the file sends and receives ... From far away a marble
 * reads as one blended tint; zoom in and the bands separate"). A file's ball is its kind's colour as glass, carrying a
 * vein of the offering blue for the files that use it and one of the using green for the files it uses, side by side.
 * Everything that draws a marble reads it here: its two shares, its far tint and its seed.
 */

/** How many other files of the scan use a file, and how many it uses: facts of the whole scan, never of what is shown. */
export interface MarbleCounts { usedBy: number; uses: number }

/** How much of a ball each vein takes, 0 to 1 each and never more than 1 together: blue for what it offers, green for what it uses. */
export interface MarbleShares { offers: number; uses: number }

/** A file drawn as a marble: its glass, its veins' shares, and the number from its id that turns its pattern. */
export interface Marble extends MarbleShares { glass: Colour; seed: number }

/**
 * How much of its veins a count of files gives a ball: 1 a third, 3 two thirds, 7 or more all. Half this repository's
 * files are used by two or fewer and use one or none, so the curve rises early: on the first look at the whole picture,
 * with 15 files for all, the commonest balls read as a pale grey-aqua (2026-11-17).
 */
export const marbleAmount = (count: number): number => Math.min(1, Math.log2(1 + Math.max(0, count)) / Math.log2(8));

/**
 * The most of a ball each vein may take: on quiet glass, and on a tinted kind's glass (a test, an asset, a document)
 * less, so that its kind still reads from far away (measured in the tests beside this); and the most the two take
 * together, so that some glass always remains, the two keeping their proportion when held to it.
 */
export const MARBLE_VEINS = { quiet: 0.6, tinted: 0.15, together: 0.9 } as const;

/** The kinds whose glass is a colour of its own, which the veins must not drown. */
const TINTED_GLASS: ReadonlySet<SpatialKind> = new Set(["test", "asset", "document"]);

/** A ball's two shares, from its kind and its counts. */
export function marbleShares(kind: SpatialKind, counts: MarbleCounts): MarbleShares {
  const most = TINTED_GLASS.has(kind) ? MARBLE_VEINS.tinted : MARBLE_VEINS.quiet;
  const offers = marbleAmount(counts.usedBy) * most, uses = marbleAmount(counts.uses) * most, held = Math.min(1, MARBLE_VEINS.together / (offers + uses || 1));
  return { offers: offers * held, uses: uses * held };
}

const toLinear = (value: number): number => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
const toEncoded = (value: number): number => (value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055);

/**
 * The colour a marble reads as from far away: its glass and its two veins mixed in linear light by their shares, as the
 * eye averages a ball too small to tell its bands apart. A ball with no veins is its glass exactly.
 */
export function marbleTint(glass: string, shares: MarbleShares, palette: Palette = activePalette()): Colour {
  if (!shares.offers && !shares.uses) return glass as Colour;
  const [g, o, u] = [glass, palette.role.offers, palette.role.uses].map(colour => channels(colour).map(value => toLinear(value / 255)));
  const rest = 1 - shares.offers - shares.uses;
  const mixed = g.map((value, i) => value * rest + o[i] * shares.offers + u[i] * shares.uses);
  return `#${mixed.map(value => Math.round(Math.min(1, Math.max(0, toEncoded(value))) * 255).toString(16).padStart(2, "0")).join("")}`;
}

/** A number in [0, 1) from a file's id, the same on every page and every load, which turns its marble's pattern. */
export function marbleSeed(id: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) hash = Math.imul(hash ^ id.charCodeAt(i), 0x01000193);
  return (hash >>> 0) / 0x100000000;
}

const countsByGraph = new WeakMap<object, ReadonlyMap<string, MarbleCounts>>();

/**
 * Each file's two counts in a scan's graph, by id: the other files that use it, and the other files it uses, each file
 * counted once whatever the number of references between the two. Read from the links, each from the file that uses to
 * the file that offers, so that a moment of the history, whose files carry no dependency lines, counts as today does.
 */
export function marbleCounts(graph: { links: readonly { source: string | { id: string }; target: string | { id: string } }[] }): ReadonlyMap<string, MarbleCounts> {
  const known = countsByGraph.get(graph);
  if (known) return known;
  const users = new Map<string, Set<string>>(), used = new Map<string, Set<string>>();
  const add = (map: Map<string, Set<string>>, key: string, value: string): void => { (map.get(key) ?? map.set(key, new Set()).get(key)!).add(value); };
  for (const link of graph.links) {
    const source = typeof link.source === "string" ? link.source : link.source.id, target = typeof link.target === "string" ? link.target : link.target.id;
    if (source === target) continue;
    add(users, target, source);
    add(used, source, target);
  }
  const counts = new Map<string, MarbleCounts>();
  for (const id of new Set([...users.keys(), ...used.keys()])) counts.set(id, { usedBy: users.get(id)?.size ?? 0, uses: used.get(id)?.size ?? 0 });
  countsByGraph.set(graph, counts);
  return counts;
}

const NO_COUNTS: MarbleCounts = { usedBy: 0, uses: 0 };

/**
 * A file's two shares from its kind and the scan's counts. A document's citations are not counted: they are drawn as
 * citations, in their own colour, and the offering blue and the using green are a file's references alone, so that a
 * document is its yellow glass.
 */
export function fileShares(id: string, archetype: string | undefined, counts: ReadonlyMap<string, MarbleCounts>): MarbleShares {
  const kind = spatialKindOf(archetype);
  return kind === "document" || kind === "directory" ? { offers: 0, uses: 0 } : marbleShares(kind, counts.get(id) ?? NO_COUNTS);
}

/** A file's marble under the palette in force; null for what is no file, a directory's hub. */
export function marbleOf(id: string, archetype: string | undefined, counts: ReadonlyMap<string, MarbleCounts>, palette: Palette = activePalette()): Marble | null {
  const kind = spatialKindOf(archetype);
  return kind === "directory" ? null : { glass: palette.kind[kind], ...fileShares(id, archetype, counts), seed: marbleSeed(id) };
}

/**
 * The marble in a sphere's shaders: the vertex's attributes and what it hands on, and the fragment's pattern. A ball's
 * pattern stands in its own unit sphere, `MARBLE_LOCAL`, a direction the including shader defines, so that it turns with
 * nothing and never swims as the camera moves. Three vanes wind round an axis its seed chooses, warped; across a vane
 * the offering blue, then the using green, then clear glass, each as wide as its share, the two colours side by side and
 * never blended at close range. Each edge is filtered over the pixel's own footprint, read from the screen's
 * derivatives, and the whole pattern gives way to the far tint (the instance colour) as a vane's period nears a few
 * pixels, so that a distant ball is one steady colour and never shimmers. A small highlight makes the ball read as
 * glass, fading as the pattern does. With no marble (`spatialMarbleVeins.w` zero) none of this runs.
 *
 * Every chunk stands inside `#ifdef MARBLES`, and a material defines that only while marbles are drawn: with marbles
 * off its shaders are, to the compiler, the ones it had before marbles. A test inside the shader is not enough. The
 * software renderer the browser tests run on shades several pixels at once and pays for the three varyings on every
 * pixel and for much of the code a test skips: this repository's picture drew at 4.4 frames a second with the pattern
 * compiled in and no marble drawn, where it draws at 5.3 without (2026-11-17).
 */
export const MARBLE_VERTEX_PARS = `
#ifdef MARBLES
attribute vec3 spatialMarbleGlass;
attribute vec4 spatialMarbleVeins;
varying vec3 vMarbleGlass;
varying vec4 vMarbleVeins;
#endif`;

/** The vertex's hand-on of a marble's glass and veins. */
export const MARBLE_VERTEX = `
#ifdef MARBLES
vMarbleGlass = spatialMarbleGlass;
vMarbleVeins = spatialMarbleVeins;
#endif`;

/** The pattern's constants: the vanes round the axis (a whole number, so that the pattern closes), their twist along it, and its warp. */
const MARBLE_PATTERN = { vanes: 3, twist: 1.35, warp: 0.07 } as const;

/** The fragment's declarations and the pattern. */
export const MARBLE_FRAGMENT_PARS = `
#ifdef MARBLES
uniform vec3 uMarbleOffers;
uniform vec3 uMarbleUses;
varying vec3 vMarbleGlass;
varying vec4 vMarbleVeins;
float marbleDetail = 0.0;
// The share of [0, s) of every whole period that a pixel's footprint [t - w / 2, t + w / 2] covers.
float marbleCover(float t, float w, float s) {
  float a = t - 0.5 * w, b = t + 0.5 * w;
  return (floor(b) * s + min(fract(b), s) - floor(a) * s - min(fract(a), s)) / w;
}
vec3 marbleColour(vec3 p, vec3 far) {
  float seed = vMarbleVeins.z;
  float z = 2.0 * fract(seed * 7.31) - 1.0, around = 6.2831853 * fract(seed * 3.17);
  vec3 axis = vec3(sqrt(max(0.0, 1.0 - z * z)) * vec2(cos(around), sin(around)), z);
  vec3 u = normalize(cross(axis, abs(axis.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
  vec3 v = cross(axis, u);
  // Nudged off the axis, where the angle has no value.
  float h = dot(p, axis), x = dot(p, u) + 1.0e-6, y = dot(p, v);
  float turn = atan(y, x) / 6.2831853;
  float warp = ${MARBLE_PATTERN.warp.toFixed(3)} * sin(7.0 * h + 6.2831853 * seed) + ${(MARBLE_PATTERN.warp * 0.6).toFixed(3)} * sin(12.5663706 * turn + 4.0 * h);
  float along = ${MARBLE_PATTERN.twist.toFixed(3)} * h + warp + seed;
  float t = ${MARBLE_PATTERN.vanes.toFixed(1)} * turn + along;
  // The angle's seam, where it jumps by a whole turn, is crossed by reading the footprint from the angle turned half round.
  float w = max(min(fwidth(t), fwidth(${MARBLE_PATTERN.vanes.toFixed(1)} * (atan(-y, -x) / 6.2831853) + along)), 0.0001);
  float blue = marbleCover(t, w, vMarbleVeins.x);
  float green = marbleCover(t, w, vMarbleVeins.x + vMarbleVeins.y) - blue;
  vec3 near = vMarbleGlass * (1.0 - blue - green) + uMarbleOffers * blue + uMarbleUses * green;
  marbleDetail = smoothstep(3.0, 9.0, 1.0 / w);
  return mix(far, near, marbleDetail);
}
#endif`;

/** The fragment's colour, after the instance colour (the far tint) is read into `diffuseColor`. */
export const MARBLE_COLOUR = `
#ifdef MARBLES
if (vMarbleVeins.w > 0.5) diffuseColor.rgb = marbleColour(MARBLE_LOCAL, diffuseColor.rgb);
#endif`;

/** The glass's highlight, added to the light the ball sends out, where the pattern is drawn. */
export const MARBLE_SHINE = `
#ifdef MARBLES
if (vMarbleVeins.w > 0.5) {
  vec3 marbleLight = normalize(vec3(-0.45, 0.75, 0.5));
  outgoingLight += marbleDetail * 0.3 * pow(max(dot(reflect(-marbleLight, normalize(normal)), normalize(vViewPosition)), 0.0), 56.0);
}
#endif`;
