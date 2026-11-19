/**
 * Every colour the Explorer draws, keyed by what the colour means (the colour pass of 2026-11-16). A palette is one
 * table from meanings to colours; the stylesheets read it as custom properties, written at build into the page's first
 * stylesheet and, for a palette chosen by name, onto the page's root; the 3D map, the 2D wires, the World Map and the
 * transition's canvas read it here. Nothing else in the client writes a colour: a unit test keeps it so.
 *
 * Every value is an opaque `#rrggbb`. A colour drawn at an opacity, or mixed toward another, is derived where it is
 * drawn from the meaning it shows (`rgba` here, and in a stylesheet `rgba(var(--meaning-rgb), alpha)`), never stored as a
 * second literal.
 *
 * Pure: no DOM. The mutable things are which palette is in force (`activePalette`) and whether files are drawn as
 * marbles (`marblesDrawn`) and in which pattern (`marblePattern`), each chosen at startup and again from Tuning.
 */

/** A colour, `#rrggbb`. */
export type Colour = `#${string}`;

/** The tints a World Map region may wear, by the names a board's legend gives them. */
export interface WorldTints {
  blue: Colour;
  orange: Colour;
  green: Colour;
  grey: Colour;
  violet: Colour;
  rose: Colour;
}

/** The World Map in one of its two forms, the white board or the dark one. */
export interface WorldForm {
  /** Around the board. */
  page: Colour;
  /** The bench the pieces stand on. */
  board: Colour;
  /** The tools, help, tour and evidence panels. */
  panel: Colour;
  /** Panel borders, the bench's edge, the tool groups' rules. */
  line: Colour;
  /** Names and headings. */
  text: Colour;
  /** Sub-labels and help; what one piece stands on (its dotted line, its strands). */
  muted: Colour;
  /** Kinds in labels, counters, tiers. */
  faint: Colour;
  /** A piece's offering door; also the World's focus ring, pressed tool and links. */
  offers: Colour;
  /** A piece's using door. */
  uses: Colour;
  /** A declared crossing between regions, and the board names whose folder was not found. */
  warm: Colour;
  /** Dashes running along a wire from what offers to what uses. */
  flow: Colour;
  /** A piece's footprint and the panels' shadows. */
  shade: Colour;
  /** A piece's faces, shaded by the camera between these two ends. */
  faceLight: Colour;
  faceDark: Colour;
  /** A face's edge, and a drum's dashed edge. */
  faceEdge: Colour;
  drumEdge: Colour;
  /** The regions' tints. */
  tints: WorldTints;
}

/** One palette: every meaning the Explorer draws in colour. */
export interface Palette {
  /** The ground everything stands on, deepest first, and the black and white that shadows and washes are made of. */
  ground: {
    page: Colour;
    deep: Colour;
    surface: Colour;
    raised: Colour;
    card: Colour;
    cardHover: Colour;
    control: Colour;
    glass: Colour;
    shade: Colour;
    sheen: Colour;
  };
  /** Lines: borders and outlines. */
  line: {
    border: Colour;
    interactive: Colour;
    hover: Colour;
    /** An opened directory's outline on the 2D map, a step under a card's border. */
    membrane: Colour;
  };
  /** The tones of text, strongest first, the panels' two quiet tones, a 2D card's three, and words on a selected fill. */
  text: {
    strong: Colour;
    normal: Colour;
    secondary: Colour;
    muted: Colour;
    subtle: Colour;
    disabled: Colour;
    panelMuted: Colour;
    panelSubtle: Colour;
    cardFileName: Colour;
    cardSymbolName: Colour;
    cardProse: Colour;
    onSelected: Colour;
  };
  /** What is selected, active, pressed or focused. */
  state: {
    selected: Colour;
    selectedHover: Colour;
  };
  /** A connection's two ends: blue what an interface offers, green what uses it, at every scale. */
  role: {
    offers: Colour;
    uses: Colour;
  };
  /** A file's kind, and the one grey that the closed directories' cells wear when kinds are not told apart. */
  kind: {
    implementation: Colour;
    test: Colour;
    asset: Colour;
    document: Colour;
    directory: Colour;
    other: Colour;
    oneGrey: Colour;
    oneGreyRim: Colour;
  };
  /** A 2D card whose file tests use: its halo and border, and the words naming the tests. */
  hasTests: {
    mark: Colour;
    text: Colour;
    textMuted: Colour;
    label: Colour;
  };
  /** A file the commit shown changed. */
  history: {
    changed: Colour;
  };
  /** The signals: the 3D button's cue that connections run backward in 2D, an error, a path found. */
  signal: {
    cue: Colour;
    cueText: Colour;
    error: Colour;
    pathFound: Colour;
  };
  /** Links: to a file, inside a card's prose, a symbol named, inline code. */
  link: {
    file: Colour;
    fileHover: Colour;
    prose: Colour;
    symbol: Colour;
    code: Colour;
  };
  /** The badges on a symbol's row naming a type it returns, takes, extends or implements, and the plain badge. */
  typeRef: {
    returnsText: Colour;
    takesText: Colour;
    extends: Colour;
    extendsText: Colour;
    implements: Colour;
    implementsText: Colour;
    plain: Colour;
    plainText: Colour;
  };
  /** A file's private implementation, drawn as one dashed Internals row and its dot. */
  internals: {
    ground: Colour;
    line: Colour;
    text: Colour;
    pin: Colour;
    pinLine: Colour;
  };
  /** The 3D map: its ground and lights, its wires by what they mean, its skins, its labels, and the key's neutral sample. */
  scene: {
    ground: Colour;
    ambientLight: Colour;
    directionalLight: Colour;
    /** A reference between two files, and the path asked for. */
    wire: Colour;
    /** From a document to a file its links name. */
    citedBy: Colour;
    /** During the change of perspective, a 3D wire with no 2D counterpart. */
    unmatchedWire: Colour;
    skin: Colour;
    skinShine: Colour;
    cloud: Colour;
    hoverRim: Colour;
    keySample: Colour;
    labelGround: Colour;
    labelLine: Colour;
    labelText: Colour;
    chipText: Colour;
    chipLine: Colour;
    directoryLabel: Colour;
    directoryLabelLine: Colour;
    /** A name travelling during the change of perspective. */
    travellingName: Colour;
  };
  /** The World Map, in its light form and its dark one. */
  world: {
    light: WorldForm;
    dark: WorldForm;
  };
  /**
   * Where today draws one meaning in a second value that a person can tell apart from the first, kept so that today's
   * picture is unchanged. Each belongs to a meaning above; a palette that draws every meaning once deletes this group
   * and has the readers of its custom properties (`--second-…`) read that meaning instead.
   */
  secondValues: {
    /** Offers: the 2D pins and the return badge, beside the wires' `role.offers`. */
    offersPin: Colour;
    /** Uses: the 2D pins and the parameter badge, beside `role.uses`. */
    usesPin: Colour;
    /** Selected: the 2D subject card's ring, beside `state.selected`. */
    selectedRing: Colour;
    /** Hover in Knowledge Sources' bundled tree, beside `state.selected`. */
    sourcesHover: Colour;
    /** The details panel's test label, in the has-tests violet rather than `kind.test`. */
    testLabel: Colour;
    /** The details panel's kind labels' tints. */
    implementationLabelTint: Colour;
    testLabelTint: Colour;
    assetLabelTint: Colour;
    /** The path finder's error and success washes, beside `signal.error` and `signal.pathFound`. */
    errorWash: Colour;
    pathFoundWash: Colour;
    /** The light World's pressed tool, where the dark World derives its own from `offers`. */
    worldLightPressed: Colour;
    /** The World Map's wires in each form, beside that form's `offers` and `uses`: today the 2D map's role colours in both. */
    worldLightWireOffers: Colour;
    worldLightWireUses: Colour;
    worldDarkWireOffers: Colour;
    worldDarkWireUses: Colour;
  };
}

/** The palette drawn until the colour pass: every value as the Explorer drew it on 2026-11-16. */
export const TODAY: Palette = {
  ground: {
    page: "#18181a", deep: "#111111", surface: "#1e1e1e", raised: "#1f1f22", card: "#232326", cardHover: "#2f2f33",
    control: "#333333", glass: "#222225", shade: "#000000", sheen: "#ffffff"
  },
  line: { border: "#2f2f34", interactive: "#3f3f46", hover: "#777777", membrane: "#3d3d45" },
  text: {
    strong: "#ffffff", normal: "#e4e4e4", secondary: "#cccccc", muted: "#888888", subtle: "#777777", disabled: "#666666",
    panelMuted: "#9ca3bc", panelSubtle: "#6c7484", cardFileName: "#f2f2f2", cardSymbolName: "#ededed", cardProse: "#b0b0b0",
    onSelected: "#ffffff"
  },
  state: { selected: "#0091ff", selectedHover: "#0070d4" },
  role: { offers: "#38bdf8", uses: "#34d399" },
  kind: {
    implementation: "#0091ff", test: "#28a745", asset: "#e83e8c", document: "#9966cc", directory: "#e9984d", other: "#888888",
    oneGrey: "#b9c1cc", oneGreyRim: "#e4e9ef"
  },
  hasTests: { mark: "#8a5cff", text: "#e7e5ff", textMuted: "#cbc8f8", label: "#a59fe0" },
  history: { changed: "#ffffff" },
  signal: { cue: "#e9b86d", cueText: "#f2c98a", error: "#ff8888", pathFound: "#8bd49a" },
  link: { file: "#7dd3fc", fileHover: "#a5f3fc", prose: "#9ed2fa", symbol: "#f0abfc", code: "#e8a0ff" },
  typeRef: {
    returnsText: "#64c8ff", takesText: "#64ffc8", extends: "#ff6890", extendsText: "#ff96b4", implements: "#ffbc57",
    implementsText: "#ffd28c", plain: "#646478", plainText: "#b4b4c8"
  },
  internals: { ground: "#282832", line: "#646478", text: "#e6e6f0", pin: "#505064", pinLine: "#78788c" },
  scene: {
    ground: "#000011", ambientLight: "#cccccc", directionalLight: "#ffffff", wire: "#ffffff", citedBy: "#d6b2f0",
    unmatchedWire: "#9baec5", skin: "#83b9d4", skinShine: "#52708a", cloud: "#8bacc7", hoverRim: "#dbedff",
    keySample: "#aeb8c6", labelGround: "#080c16", labelLine: "#485164", labelText: "#ffffff", chipText: "#eeeeee",
    chipLine: "#555555", directoryLabel: "#f4c18d", directoryLabelLine: "#6f5237", travellingName: "#15191f"
  },
  world: {
    light: {
      page: "#e3e6eb", board: "#ffffff", panel: "#ffffff", line: "#c3cad4", text: "#0f141b", muted: "#4b5563", faint: "#8b95a5",
      offers: "#0284c7", uses: "#059669", warm: "#c17f16", flow: "#ffffff", shade: "#000000",
      faceLight: "#ffffff", faceDark: "#98a2b1", faceEdge: "#505c6b", drumEdge: "#505c6b",
      tints: { blue: "#ddeaf8", orange: "#f9e8d8", green: "#daf1e6", grey: "#e5e8eb", violet: "#ebe3f7", rose: "#f8e2e8" }
    },
    dark: {
      page: "#0b0d11", board: "#14171d", panel: "#161b23", line: "#283040", text: "#e6ebf2", muted: "#94a1b3", faint: "#5f6d80",
      offers: "#38bdf8", uses: "#34d399", warm: "#e2b45f", flow: "#ffffff", shade: "#000000",
      faceLight: "#4a5468", faceDark: "#1f2530", faceEdge: "#0b0d11", drumEdge: "#6b7a90",
      tints: { blue: "#17202c", orange: "#25211d", green: "#19241f", grey: "#212327", violet: "#221d2b", rose: "#2a1d20" }
    }
  },
  secondValues: {
    offersPin: "#0091ff", usesPin: "#00d3aa", selectedRing: "#007acc", sourcesHover: "#00c896", testLabel: "#8a5cff",
    implementationLabelTint: "#64c864", testLabelTint: "#6496ff", assetLabelTint: "#c89664", errorWash: "#f44336",
    pathFoundWash: "#4caf50", worldLightPressed: "#e0f2fe", worldLightWireOffers: "#38bdf8", worldLightWireUses: "#34d399",
    worldDarkWireOffers: "#38bdf8", worldDarkWireUses: "#34d399"
  }
};

/**
 * The palette proposed in the colour pass (2026-11-16, root's design, measured): one hue for one meaning in every view.
 * Blue and green stay with the two roles and nothing else wears them; the kinds move off them (implementation, the
 * common case, goes quiet; a test file takes the violet the 2D cards already use for having tests; a document leaves
 * violet for a paper yellow); what is selected is neutral, so the interface wears no data colour; three quiet tones of
 * text are lifted to 4.5:1 on a card; the type badges keep only the plain badge's look, since each tells its role by
 * its icon and rose and amber now belong to the asset and the directory. Every second value equals its meaning, and
 * each World form draws its doors and its wires in its own blue and green.
 */
export const PROPOSED: Palette = {
  ...TODAY,
  role: { offers: "#23a1ef", uses: "#5ee7b5" },
  kind: { ...TODAY.kind, implementation: "#a8b2c3", test: "#8a5cff", asset: "#db547e", document: "#f1d96e" },
  state: { selected: "#f2f2f2", selectedHover: "#d0d0d4" },
  text: { ...TODAY.text, muted: "#939393", subtle: "#8a8a8a", panelSubtle: "#828a9a", onSelected: "#111318" },
  typeRef: { ...TODAY.typeRef, extends: "#646478", extendsText: "#b4b4c8", implements: "#646478", implementsText: "#b4b4c8" },
  scene: { ...TODAY.scene, citedBy: "#f9f0ba" },
  world: {
    light: { ...TODAY.world.light, offers: "#046aac", uses: "#008e60", warm: "#a86003" },
    dark: { ...TODAY.world.dark, offers: "#23a1ef", uses: "#5ee7b5" }
  },
  secondValues: {
    ...TODAY.secondValues, offersPin: "#23a1ef", usesPin: "#5ee7b5", selectedRing: "#f2f2f2", sourcesHover: "#d0d0d4",
    implementationLabelTint: "#a8b2c3", testLabelTint: "#8a5cff", assetLabelTint: "#db547e",
    worldLightWireOffers: "#046aac", worldLightWireUses: "#008e60", worldDarkWireOffers: "#23a1ef", worldDarkWireUses: "#5ee7b5"
  }
};

/**
 * The proposed palette with the kinds kept near today's blue and green (the owner's earlier lean, made valid by root's
 * measurement, 2026-11-17): implementation and test near today's colours, the two roles a step lighter so that every
 * identity still stands apart, and every second value equal to its meaning. A test file's kind label in the details
 * panel is the test kind's green, as the test sphere is; a 2D card that tests use keeps the has-tests violet.
 */
export const VIVID_KINDS: Palette = {
  ...PROPOSED,
  role: { offers: "#1bc3f3", uses: "#24fcba" },
  kind: { ...PROPOSED.kind, implementation: "#0c84fa", test: "#0a8e00" },
  world: { light: PROPOSED.world.light, dark: { ...PROPOSED.world.dark, offers: "#1bc3f3", uses: "#24fcba" } },
  secondValues: {
    ...PROPOSED.secondValues, offersPin: "#1bc3f3", usesPin: "#24fcba", testLabel: "#0a8e00", implementationLabelTint: "#0c84fa", testLabelTint: "#0a8e00",
    worldDarkWireOffers: "#1bc3f3", worldDarkWireUses: "#24fcba"
  }
};

/** The palettes a viewer may choose, by name. */
export const PALETTES = { today: TODAY, proposed: PROPOSED, vividKinds: VIVID_KINDS } as const satisfies Record<string, Palette>;

/** A palette's name. */
export type PaletteName = keyof typeof PALETTES;

/** The palette drawn when none is chosen. */
export const DEFAULT_PALETTE: PaletteName = "today";

/** Whether a saved name is a palette's. */
export const isPaletteName = (name: unknown): name is PaletteName => typeof name === "string" && Object.hasOwn(PALETTES, name);

/** A cell mask's luminance where the cells stay drawn: not a colour a person sees, and fixed in every palette. */
export const MASK_KEEP: Colour = "#ffffff";
/** A cell mask's luminance where the cells fade, at a field's end. */
export const MASK_FADE: Colour = "#111111";

let active: Palette = TODAY;
let marbles = false;
/**
 * How a marble's veins wind (a trial, 2026-11-18, the owner's wish that "Minor changes to files produce subtle shifts on
 * the surface of these little marble planets. Massive changes to files completely changes their patterns"): one pattern
 * for every file, turned by its path, the default; or bent by a sketch of what its Live Doc lists (views/marbleSketch.ts),
 * its axis kept by its path; or its axis taken from the sketch too. The shares of blue, green and clear glass stay.
 */
export type MarblePattern = "one" | "doc" | "doc-axis";

let pattern: MarblePattern = "one";

/** The palette in force. */
export const activePalette = (): Palette => active;

/**
 * Whether files are drawn as marbles (the marble trial, 2026-11-17): each file's colour its kind's glass with veins of
 * what it offers and what it uses (`marbleOf` in views/forceGraphAppearance.ts). Off until the page applies the
 * viewer's choice as it starts, which is on unless they turned it off (the default since 2026-11-18).
 */
export const marblesDrawn = (): boolean => marbles;

/**
 * How the marbles' veins wind (the pattern trial, 2026-11-18): one pattern for every file, turned by its path; or bent by
 * a sketch of what its Live Doc lists, its axis kept by its path (`doc`) or taken from the sketch too (`doc-axis`).
 */
export const marblePattern = (): MarblePattern => pattern;

/** A palette by name, the default for a name no palette has. */
export const paletteNamed = (name: unknown): Palette => PALETTES[isPaletteName(name) ? name : DEFAULT_PALETTE];

const listeners = new Set<(palette: Palette) => void>();

/**
 * Calls `listener` each time another palette is put in force, the marbles are turned on or off or their pattern changes, so that what a script
 * drew is drawn again as it now should be; returns the unsubscription.
 */
export function whenPaletteChanges(listener: (palette: Palette) => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Puts a palette in force by name, the default for a name no palette has, tells whoever listens if it changed, and returns it. */
export function choosePalette(name: unknown): Palette {
  const chosen = paletteNamed(name);
  if (chosen === active) return active;
  active = chosen;
  for (const listener of listeners) listener(active);
  return active;
}

/** Turns the marbles on or off, and tells whoever listens to the palette if that changed: the same redraw, nothing moving. */
export function chooseMarbles(on: boolean): void {
  if (on === marbles) return;
  marbles = on;
  for (const listener of listeners) listener(active);
}

/** Chooses how the marbles' veins wind, and tells whoever listens to the palette if that changed: the same redraw, nothing moving. */
export function chooseMarblePattern(chosen: MarblePattern): void {
  if (chosen === pattern) return;
  pattern = chosen;
  for (const listener of listeners) listener(active);
}

/** A colour's channels, 0 to 255. */
export function channels(colour: string): [number, number, number] {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(colour);
  if (!match) throw new Error(`A palette's colour is #rrggbb, not ${JSON.stringify(colour)}.`);
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

/** A colour at an opacity, as `rgba(r, g, b, alpha)`, the alpha written as given. */
export function rgba(colour: string, alpha: number | string): string {
  const [r, g, b] = channels(colour);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** A colour's channels, 0 to 1, for a shader. */
export const unitChannels = (colour: string): [number, number, number] => channels(colour).map(value => value / 255) as [number, number, number];

/** A colour between two, `t` of the way from `a` to `b`, each channel rounded, as `rgb(r,g,b)`. */
export function mix(a: string, b: string, t: number): string {
  const A = channels(a), B = channels(b);
  return `rgb(${A.map((value, i) => Math.round(value + (B[i] - value) * t)).join(",")})`;
}

const kebab = (key: string): string => key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

/**
 * A palette as the stylesheets read it: one custom property for each meaning, named by its place in the table
 * (`ground.cardHover` is `--ground-card-hover`, `world.dark.tints.blue` is `--world-dark-tints-blue`), and beside it
 * its channels (`--ground-card-hover-rgb: 47, 47, 51`), from which a stylesheet draws the colour at an opacity as
 * `rgba(var(--ground-card-hover-rgb), 0.5)`: a colour the browser keeps, computes and animates as it always has.
 */
export function customProperties(palette: Palette): Array<[string, string]> {
  const properties: Array<[string, string]> = [];
  const walk = (value: object, prefix: string): void => {
    for (const [key, entry] of Object.entries(value) as Array<[string, Colour | object]>) {
      const name = `${prefix}-${kebab(key)}`;
      if (typeof entry === "string") properties.push([name, entry], [`${name}-rgb`, channels(entry).join(", ")]);
      else walk(entry, name);
    }
  };
  walk(palette, "-");
  return properties;
}

/** The stylesheet that sets a palette's custom properties on the page's root: the build writes the default's. */
export function paletteStylesheet(palette: Palette): string {
  return `/* Generated from the Explorer's palette (client/palette.ts); edit the palette, not this file. */\n:root {\n${customProperties(palette).map(([name, value]) => `    ${name}: ${value};`).join("\n")}\n}\n`;
}
