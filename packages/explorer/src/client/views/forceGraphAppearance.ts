import { activePalette, type Colour, type Palette } from "../palette";

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

/** Unknown or absent file kinds receive the same neutral colour in the picture and key. */
export function spatialNodeStyle(archetype?: string): SpatialNodeStyle {
  const kind = (archetype ?? "").toLowerCase();
  return spatialNodeStyles()[Object.hasOwn(KIND_OF_ARCHETYPE, kind) ? KIND_OF_ARCHETYPE[kind] : "other"];
}
