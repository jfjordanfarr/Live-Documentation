import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { activePalette, channels, choosePalette, customProperties, DEFAULT_PALETTE, isPaletteName, mix, PALETTES, paletteStylesheet, rgba, TODAY, unitChannels } from "./palette";

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
