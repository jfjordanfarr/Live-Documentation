import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { activePalette, channels, choosePalette, customProperties, DEFAULT_PALETTE, isPaletteName, mix, PALETTES, paletteStylesheet, PROPOSED, rgba, TODAY, unitChannels, whenPaletteChanges, type Palette } from "./palette";

describe("the palette", () => {
  it("holds every meaning as one opaque #rrggbb colour, each named once as a custom property with its channels beside it", () => {
    for (const palette of Object.values(PALETTES)) {
      const properties = customProperties(palette);
      for (const [name, value] of properties) {
        expect(value, name).toMatch(name.endsWith("-rgb") ? /^\d{1,3}, \d{1,3}, \d{1,3}$/ : /^#[0-9a-f]{6}$/);
        expect(name, name).toMatch(/^--[a-z]+(-[a-z]+)*$/);
      }
      expect(new Set(properties.map(([name]) => name)).size).toBe(properties.length);
      const sheet = paletteStylesheet(palette);
      for (const [name, value] of properties) expect(sheet).toContain(`${name}: ${value};`);
    }
  });

  it("names a custom property by its place in the table", () => {
    const names = new Map(customProperties(TODAY));
    expect(names.get("--ground-card-hover")).toBe(TODAY.ground.cardHover);
    expect(names.get("--role-offers")).toBe(TODAY.role.offers);
    expect(names.get("--world-dark-tints-blue")).toBe(TODAY.world.dark.tints.blue);
    expect(names.get("--second-values-offers-pin")).toBe(TODAY.secondValues.offersPin);
    expect(names.get("--signal-cue-rgb")).toBe("233, 184, 109");
  });

  it("puts a palette in force by name, and the default for a name it does not have", () => {
    expect(choosePalette("today")).toBe(TODAY);
    expect(activePalette()).toBe(TODAY);
    expect(choosePalette("no such palette")).toBe(PALETTES[DEFAULT_PALETTE]);
    expect(isPaletteName("today")).toBe(true);
    expect(isPaletteName("toString")).toBe(false);
    expect(isPaletteName(undefined)).toBe(false);
  });

  it("derives a colour at an opacity, between two colours and as a shader reads it", () => {
    expect(channels("#e9984d")).toEqual([233, 152, 77]);
    expect(() => channels("blue")).toThrow(/#rrggbb/);
    expect(rgba("#e9984d", 0.35)).toBe("rgba(233, 152, 77, 0.35)");
    expect(rgba("#ffffff", "1.000")).toBe("rgba(255, 255, 255, 1.000)");
    expect(mix("#000000", "#ffffff", 0.5)).toBe("rgb(128,128,128)");
    expect(unitChannels("#ff0000")).toEqual([1, 0, 0]);
  });
});

/**
 * Today's palette draws what the Explorer drew before its colours were gathered into one table (2026-11-16, at
 * 5d98d3a6): the strings the 3D map's accessors returned, the shader's constants, the World's tints as the browser
 * resolves their `hsl()`, and the transition's background.
 */
describe("today's palette draws what was drawn before", () => {
  const { kind, scene, role, world, history } = TODAY;

  it("colours the 3D map's wires and spheres as before", () => {
    expect(rgba(kind.directory, 0.35)).toBe("rgba(233, 152, 77, 0.35)");
    expect(rgba(kind.document, 0.4)).toBe("rgba(153, 102, 204, 0.4)");
    expect(rgba(scene.citedBy, 0.55)).toBe("rgba(214, 178, 240, 0.55)");
    expect(rgba(scene.wire, 0.9)).toBe("rgba(255, 255, 255, 0.9)");
    expect(rgba(scene.wire, 0.16)).toBe("rgba(255, 255, 255, 0.16)");
    expect(rgba(history.changed, "1.000")).toBe("rgba(255, 255, 255, 1.000)");
    expect({ ...kind }).toMatchObject({ implementation: "#0091ff", test: "#28a745", asset: "#e83e8c", document: "#9966cc", directory: "#e9984d", other: "#888888" });
    expect([scene.ground, scene.ambientLight, scene.directionalLight]).toEqual(["#000011", "#cccccc", "#ffffff"]);
  });

  it("gives the wrappers' shader its constants to within half a step of eight bits", () => {
    const before: Array<[string, number[]]> = [[scene.skin, [0.514, 0.725, 0.831]], [scene.skinShine, [0.32, 0.44, 0.54]], [scene.cloud, [0.545, 0.675, 0.78]], [scene.hoverRim, [0.86, 0.93, 1]], [history.changed, [1, 1, 1]]];
    for (const [colour, constants] of before) {
      unitChannels(colour).forEach((value, i) => expect(Math.abs(value - constants[i]), colour).toBeLessThanOrEqual(0.5 / 255));
    }
  });

  it("draws the 2D and World wires in the roles' colours, and the World's tints as their hsl() resolved", () => {
    expect([role.offers, role.uses]).toEqual(["#38bdf8", "#34d399"]);
    const hsl = (h: number, s: number, l: number): string => {
      const a = (s / 100) * Math.min(l / 100, 1 - l / 100), f = (n: number): number => { const k = (n + h / 30) % 12; return l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
      return `#${[f(0), f(8), f(4)].map(value => Math.round(value * 255).toString(16).padStart(2, "0")).join("")}`;
    };
    expect(world.light.tints).toEqual({ blue: hsl(212, 68, 92), orange: hsl(30, 72, 91), green: hsl(150, 45, 90), grey: hsl(215, 12, 91), violet: hsl(262, 55, 93), rose: hsl(345, 60, 93) });
    expect(world.dark.tints).toEqual({ blue: hsl(214, 32, 13), orange: hsl(30, 12, 13), green: hsl(150, 18, 12), grey: hsl(215, 8, 14), violet: hsl(262, 20, 14), rose: hsl(345, 18, 14) });
  });

  it("runs the transition's background from the 2D ground to the 3D ground", () => {
    // Before, it ran from rgb(30,30,30) to rgb(0,0,12); the 3D ground is #000011, 1.3 apart in OKLab x100, so one.
    expect(mix(TODAY.ground.surface, scene.ground, 0)).toBe("rgb(30,30,30)");
    expect(mix(TODAY.ground.surface, scene.ground, 1)).toBe("rgb(0,0,17)");
    expect(mix(TODAY.ground.surface, scene.ground, 0.5)).toBe("rgb(15,15,24)");
  });
});

/**
 * What makes a palette valid (the colour pass, 2026-11-16, root's proposal): the colours that tell a fact apart stand
 * apart, for full colour vision and under simulated red-green colour blindness; a mark stands out from its ground, and
 * words from a card. Distances are OKLab x100; protanopia and deuteranopia are simulated after Machado, Oliveira and
 * Fernandes (2009) at full severity, the matrices and arithmetic of the colour pass's theme sketch; contrast is WCAG's.
 */
const linear = (hex: string): number[] => channels(hex).map(value => value / 255).map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
const labOf = ([r, g, b]: number[]): number[] => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
};
const SIMULATED = {
  protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]]
} as const;
type Vision = keyof typeof SIMULATED | "full";
const seen = (hex: string, vision: Vision): number[] => {
  const rgb = linear(hex);
  return labOf(vision === "full" ? rgb : SIMULATED[vision].map(row => Math.max(0, Math.min(1, row[0] * rgb[0] + row[1] * rgb[1] + row[2] * rgb[2]))));
};
/** Two colours' distance in OKLab x100, as a person of that vision sees them. */
const apart = (a: string, b: string, vision: Vision): number => { const p = seen(a, vision), q = seen(b, vision); return 100 * Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
const luminance = (hex: string): number => { const [r, g, b] = linear(hex); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
/** WCAG contrast. */
const contrast = (a: string, b: string): number => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/** Every way a palette falls short, one sentence each; none for a valid palette. */
function shortfalls(palette: Palette): string[] {
  const found: string[] = [];
  const pairs = (named: Record<string, string>): void => {
    const entries = Object.entries(named);
    for (let i = 0; i < entries.length; i++) for (let j = i + 1; j < entries.length; j++) {
      const [[a, x], [b, y]] = [entries[i], entries[j]];
      if (apart(x, y, "full") < 15) found.push(`${a} and ${b} are ${apart(x, y, "full").toFixed(1)} apart`);
      for (const vision of ["protanopia", "deuteranopia"] as const) if (apart(x, y, vision) < 8) found.push(`${a} and ${b} are ${apart(x, y, vision).toFixed(1)} apart under ${vision}`);
    }
  };
  const stands = (named: Record<string, string>, grounds: Record<string, string>, floor: number): void => {
    for (const [mark, colour] of Object.entries(named)) for (const [ground, under] of Object.entries(grounds)) {
      if (contrast(colour, under) < floor) found.push(`${mark} stands at ${contrast(colour, under).toFixed(2)}:1 on ${ground}`);
    }
  };
  // The colours that identify. `kind.other` is left out on purpose: nothing produces it today. The offering pin is
  // the offering role as the 2D cards draw it, so it is held to the same distances.
  const { role, kind, history, ground, scene, text, world, secondValues } = palette;
  const identities = { offers: role.offers, uses: role.uses, implementation: kind.implementation, test: kind.test, asset: kind.asset, document: kind.document, directory: kind.directory, changed: history.changed };
  pairs(identities);
  if (secondValues.offersPin !== role.offers) pairs({ "offering pin": secondValues.offersPin, implementation: kind.implementation });
  stands(identities, { "the page": ground.page, "a card": ground.card, "the 3D ground": scene.ground }, 3);
  for (const form of ["light", "dark"] as const) {
    const marks = { [`${form} offers`]: world[form].offers, [`${form} uses`]: world[form].uses, [`${form} warm`]: world[form].warm };
    pairs(marks);
    stands(marks, { [`the ${form} board`]: world[form].board }, 3);
  }
  const words = { strong: text.strong, normal: text.normal, secondary: text.secondary, muted: text.muted, subtle: text.subtle, panelMuted: text.panelMuted, panelSubtle: text.panelSubtle, cardFileName: text.cardFileName, cardSymbolName: text.cardSymbolName, cardProse: text.cardProse };
  stands(words, { "a card": ground.card }, 4.5);
  return found;
}

describe("a valid palette", () => {
  it("measures as the colour pass's bench did", () => {
    expect(apart("#38bdf8", "#0091ff", "full")).toBeCloseTo(12.7, 1);
    expect(apart("#28a745", "#e9984d", "protanopia")).toBeCloseTo(2.5, 1);
    expect(contrast("#ffffff", "#000000")).toBeCloseTo(21, 5);
  });

  it("is what the proposed palette is: every identity apart, every mark and word standing out", () => {
    expect(shortfalls(PROPOSED)).toEqual([]);
    // Its closest pairs, as root's bench measured them.
    expect(apart(PROPOSED.role.offers, PROPOSED.kind.implementation, "full")).toBeCloseTo(15.2, 1);
    expect(Math.min(apart(PROPOSED.role.uses, PROPOSED.kind.document, "protanopia"), apart(PROPOSED.role.uses, PROPOSED.kind.document, "deuteranopia"))).toBeCloseTo(8.5, 1);
  });

  it("is not what today's palette is, as a stated fact: its offering pin is its implementation, and a test and a directory are 2.5 apart under protanopia", () => {
    const today = shortfalls(TODAY);
    expect(TODAY.secondValues.offersPin).toBe(TODAY.kind.implementation);
    expect(today).toContain("offering pin and implementation are 0.0 apart");
    expect(today).toContain("test and directory are 2.5 apart under protanopia");
  });
});

describe("changing the palette", () => {
  it("tells whoever listens when another palette comes into force, and only then", () => {
    const heard: Palette[] = [];
    const stop = whenPaletteChanges(palette => heard.push(palette));
    choosePalette("today");
    choosePalette("proposed");
    choosePalette("proposed");
    choosePalette("today");
    stop();
    choosePalette("proposed");
    choosePalette("today");
    expect(heard).toEqual([PROPOSED, TODAY]);
  });

  it("changes under the proposed palette exactly the values named for it, and every second value to its meaning", () => {
    const today = new Map(customProperties(TODAY)), changed = customProperties(PROPOSED).filter(([name, value]) => !name.endsWith("-rgb") && today.get(name) !== value).map(([name]) => name);
    expect(changed.sort()).toEqual([
      "--kind-asset", "--kind-document", "--kind-implementation", "--kind-test", "--role-offers", "--role-uses", "--scene-cited-by",
      "--second-values-asset-label-tint", "--second-values-implementation-label-tint", "--second-values-offers-pin", "--second-values-selected-ring",
      "--second-values-sources-hover", "--second-values-test-label-tint", "--second-values-uses-pin", "--second-values-world-dark-wire-offers",
      "--second-values-world-dark-wire-uses", "--second-values-world-light-wire-offers", "--second-values-world-light-wire-uses",
      "--state-selected", "--state-selected-hover", "--text-muted", "--text-on-selected", "--text-panel-subtle", "--text-subtle",
      "--type-ref-extends", "--type-ref-extends-text", "--type-ref-implements", "--type-ref-implements-text",
      "--world-dark-offers", "--world-dark-uses", "--world-light-offers", "--world-light-uses", "--world-light-warm"
    ].sort());
    const { secondValues: second, role, state, kind, world } = PROPOSED;
    expect([second.offersPin, second.usesPin, second.selectedRing, second.implementationLabelTint, second.testLabelTint, second.testLabel, second.assetLabelTint])
      .toEqual([role.offers, role.uses, state.selected, kind.implementation, kind.test, kind.test, kind.asset]);
    expect([second.worldLightWireOffers, second.worldLightWireUses, second.worldDarkWireOffers, second.worldDarkWireUses]).toEqual([world.light.offers, world.light.uses, world.dark.offers, world.dark.uses]);
  });
});

/** A colour written out where a palette's meaning should be read: hex, a colour function of numbers, a named colour, `0x`. */
const NAMED = "aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen";
const NAMED_WORD = new RegExp(`(?<![\\w-])(?:${NAMED.split(" ").join("|")})(?![\\w-])`, "i");
const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/i;
// A named colour given as a colour, in a string: to a colour property, a canvas style or an SVG paint, in code or
// in markup (quoted, or ended as a declaration is); a name bare in code is a variable's.
const NAMED_VALUE = new RegExp(`(?:colou?r|fill|stroke|background(?:-color)?|stop-color|fillStyle|strokeStyle|setClearColor)["']?\\s*[:=(,]\\s*(?:["'\`](${NAMED.split(" ").join("|")})(?![\\w-])|(${NAMED.split(" ").join("|")})\\s*;)`, "i");
const COLOUR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(\s*[\d.]/i;

/** Every colour literal in a stylesheet or a script, by line. */
function colourLiterals(source: string, language: "css" | "ts"): string[] {
  const found: string[] = [];
  source.split("\n").forEach((line, index) => {
    const at = (what: string): void => { found.push(`${index + 1}: ${what}`); };
    const hex = HEX.exec(line), call = COLOUR_FUNCTION.exec(line);
    if (hex) at(hex[0]);
    if (call) at(call[0]);
    if (language === "ts") {
      const number = /\b0x[0-9a-f]{6}\b/i.exec(line);
      if (number) at(number[0]);
      const named = NAMED_VALUE.exec(line);
      if (named) at(named[1] ?? named[2]);
    }
  });
  if (language === "css") {
    // A named colour in a declaration's value; a selector is followed by a brace, a value by a semicolon or a brace.
    const css = source.replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, " "));
    for (const match of css.matchAll(/([a-z-]+)\s*:\s*([^;{}]+)(?=[;}])/gi)) {
      const named = NAMED_WORD.exec(match[2]);
      if (named) found.push(`${css.slice(0, match.index).split("\n").length}: ${named[0]} in ${match[1]}`);
    }
  }
  return found;
}

describe("no colour is written outside the palette", () => {
  it("finds a colour written out, and nothing else", () => {
    expect(colourLiterals("a { color: #fff; }", "css")).toHaveLength(1);
    expect(colourLiterals("a { box-shadow: 0 0 2px rgba(0, 0, 0, .2); }", "css")).toHaveLength(1);
    expect(colourLiterals("a { background: white; }", "css")).toHaveLength(1);
    expect(colourLiterals("a { white-space: nowrap; color: var(--text-normal); }\n#detail-body:hover { fill: transparent; }", "css")).toEqual([]);
    expect(colourLiterals(`const c = "#38bdf8";`, "ts")).toHaveLength(1);
    expect(colourLiterals(`renderer.setClearColor(0x000011, 1);`, "ts")).toHaveLength(1);
    expect(colourLiterals("context.fillStyle = \"white\";", "ts")).toHaveLength(1);
    expect(colourLiterals("const html = `<rect fill=\"black\"/>`;", "ts")).toHaveLength(1);
    expect(colourLiterals("const html = `<pre style=\"color:red;\">`;", "ts")).toHaveLength(1);
    expect(colourLiterals("const sphere = { color: white, alpha };", "ts")).toEqual([]);
    expect(colourLiterals("const look = closedCells === \"grey\" ? 1 : 0; return `rgb(${A.join(\",\")})`;", "ts")).toEqual([]);
  });

  it("finds none in the Explorer's client outside the palette and the tests", () => {
    const root = __dirname, found: string[] = [];
    const walk = (directory: string): void => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) { walk(full); continue; }
        if (full === path.join(root, "palette.ts") || /\.test\.ts$/.test(entry.name)) continue;
        const language = entry.name.endsWith(".css") ? "css" : entry.name.endsWith(".ts") ? "ts" : null;
        if (language) for (const literal of colourLiterals(fs.readFileSync(full, "utf8"), language)) found.push(`${path.relative(root, full)}:${literal}`);
      }
    };
    walk(root);
    expect(found).toEqual([]);
  });
});
