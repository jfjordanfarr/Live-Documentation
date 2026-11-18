import { describe, expect, it } from "vitest";

import {
  cardsInsideDirectories,
  directoriesConnected,
  edgeSignsHonest,
  framedWhole,
  judgeFloor,
  lanesAtHome,
  LAWS,
  namesBreakAtSeams,
  noRouteAcrossACard,
  nothingOverTheTop,
  outlineIsGround,
  outlinesDrawn,
  pageHealthy,
  proseOneTone,
  rootColumnsAligned,
  routesForward,
  samePicture,
  siblingsApart,
  subjectInFrame,
  textTones,
  textWhole,
  tonesHeld,
  usesLeftOfferingsRight,
  wiresMatchData,
  wiresMatchOracle,
  wiresPlainAtRest
} from "./judgments";
import type { Reading, WireRead } from "./reading";

/**
 * A small good picture, drawn by hand: in a 1000 by 600 frame, helpers.ts offers to processor.ts, which offers to
 * main.ts, three cards in three columns inside one directory `src` beside an empty sibling `lib`, every wire leaving a right edge and reaching a left
 * one. Each test breaks one promise of it and expects the judgment to say so, and expects the good picture kept.
 */
const line = (from: [number, number], to: [number, number]): Array<[number, number]> => {
  const points: Array<[number, number]> = [];
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  for (let at = 0; at <= length; at += 8) points.push([from[0] + ((to[0] - from[0]) * at) / length, from[1] + ((to[1] - from[1]) * at) / length]);
  points.push(to);
  return points;
};
const wire = (provider: string, consumer: string, from: [number, number], to: [number, number], extra: Partial<WireRead> = {}): WireRead => ({
  key: `${consumer}|${provider}||`, consumer, provider, kind: "route", points: line(from, to), providerEnd: 0,
  occludedSamples: 0, foreignLaneSamples: 0, opacity: 0.7, filter: "none", ...extra
});

function good(): Reading {
  return {
    scenario: "hand-made", map: "/samples/rosetta/typescript/", address: "/samples/rosetta/typescript/?view=local&node=src%2Fprocessor.ts",
    viewport: { width: 1000, height: 700 },
    frame: { x: 0, y: 100, width: 1000, height: 600 },
    picture: { x: 140, y: 250, width: 720, height: 300 },
    edgeSigns: { above: false, below: false, left: false, right: false },
    scale: 1,
    look: "reading",
    cards: [
      { id: "src/helpers.ts", box: { x: 160, y: 300, width: 160, height: 120 }, subject: false, pinned: false, directory: "src" },
      { id: "src/processor.ts", box: { x: 420, y: 300, width: 160, height: 200 }, subject: true, pinned: false, directory: "src" },
      { id: "src/main.ts", box: { x: 680, y: 300, width: 160, height: 100 }, subject: false, pinned: false, directory: "src" }
    ],
    anchors: [
      { file: "src/helpers.ts", symbol: "format", side: "outbound", x: 320, y: 340 },
      { file: "src/processor.ts", symbol: "run", side: "inbound", x: 420, y: 340 },
      { file: "src/processor.ts", symbol: "run", side: "outbound", x: 580, y: 340 },
      { file: "src/main.ts", symbol: "main", side: "inbound", x: 680, y: 340 }
    ],
    wires: [
      wire("src/helpers.ts", "src/processor.ts", [320, 340], [420, 340]),
      wire("src/processor.ts", "src/main.ts", [580, 340], [680, 340])
    ],
    directories: [
      { directory: "", parent: null, drawn: false, segments: [0, 1, 2].map(column => ({ column, box: { x: 140 + 260 * column, y: 250, width: 200, height: 300 } })), insetPx: 0 },
      { directory: "src", parent: "", drawn: true, segments: [0, 1, 2].map(column => ({ column, box: { x: 148 + 260 * column, y: 280, width: 184, height: 240 } })), insetPx: 12 },
      // A sibling below src in the first column, holding no card here, so that the siblings' law has a pair to judge.
      { directory: "lib", parent: "", drawn: true, segments: [{ column: 0, box: { x: 148, y: 540, width: 184, height: 40 } }], insetPx: 12 }
    ],
    lanes: [{ box: { x: 360, y: 300, width: 20, height: 30 }, slots: [9] }],
    rootColumns: [{ x: 140, top: 300 }, { x: 400, top: 300 }],
    names: [
      { text: "processor.ts", lines: ["processor.ts"] },
      { text: "ProcessorConfig", lines: ["Processor", "Config"] },
      { text: "rosetta-manifest.json", lines: ["rosetta-", "manifest.json"] }
    ],
    textBoxes: 12,
    textFaults: [],
    tone: {
      fileName: 15, symbolName: 12, prose: 7, outline: 1.8, cardBorder: 2.4, outlineFillAlpha: 0.02,
      colours: { fileName: "rgb(242, 242, 242)", symbolName: "rgb(220, 220, 220)", purpose: "rgb(160, 160, 160)", description: "rgb(160, 160, 160)" }
    },
    consoleErrors: [],
    offSiteRequests: [],
    screenshot: "hand-made.png"
  };
}

/** The good picture with no subject: the root's overview, centred in the frame. */
function overview(): Reading {
  const reading = good();
  reading.cards = reading.cards.map(card => ({ ...card, subject: false }));
  return reading;
}

const outcome = (verdict: { outcome: string }): string => verdict.outcome;

describe("the hand-made good picture", () => {
  it("keeps every law, and every law applies to it or to its overview", () => {
    for (const law of LAWS) {
      const verdict = law(good());
      expect(verdict.findings, verdict.judgment).toEqual(verdict.outcome === "n/a" ? verdict.findings : []);
      expect(verdict.outcome === "kept" || law(overview()).outcome === "kept", verdict.judgment).toBe(true);
    }
  });
});

describe("floors", () => {
  it("rejects an empty page that every law would pass", () => {
    const empty: Reading = { ...good(), cards: [], wires: [], anchors: [], directories: [], lanes: [], picture: null, textBoxes: 0 };
    const verdict = judgeFloor(empty, { subject: "src/processor.ts", minWires: 1 });
    expect(outcome(verdict)).toBe("broken");
    expect(verdict.findings).toEqual(["src/processor.ts is not the subject", "0 wires drawn, fewer than 1", "the audit read no text at all"]);
    expect(judgeFloor(empty, { picture: true }).findings).toEqual(["no picture is drawn", "the audit read no text at all"]);
    expect(outcome(judgeFloor(good(), { subject: "src/processor.ts", drawn: ["src/main.ts"], minCards: 3, minWires: 2, lanes: true }))).toBe("kept");
  });

  it("rejects a picture where a pin asked for is not drawn pinned", () => {
    expect(judgeFloor(good(), { pinned: ["src/main.ts"] }).findings).toEqual(["src/main.ts is not drawn pinned"]);
  });
});

describe("laws, each against a picture that breaks it", () => {
  it("text: a collision and a cut", () => {
    const reading = good();
    reading.textFaults = [{ kind: "collision", text: "processor.ts", other: "run", amount: 40 }, { kind: "cut", text: "summarize", amount: 6 }];
    expect(textWhole(reading).findings).toEqual(['"processor.ts" collides with "run" over 40 px²', '"summarize" is cut off by 6 px']);
    // Farther out, names are held and cut at their end by design: only the collision is a fault there.
    reading.look = "connections";
    expect(textWhole(reading).findings).toEqual(['"processor.ts" collides with "run" over 40 px²']);
  });

  it("a card that falls below the inside of its directory", () => {
    const reading = good();
    reading.cards[2].box.height = 230;
    expect(cardsInsideDirectories(reading).findings).toEqual(["main.ts falls 22 px below the inside of src"]);
  });

  it("a directory broken between two columns", () => {
    const reading = good();
    reading.directories[1].segments[2].box.y = 600;
    expect(directoriesConnected(reading).findings).toEqual(["src breaks between columns 1 and 2"]);
  });

  it("two sibling directories overlapping in a column", () => {
    const reading = good();
    reading.directories.push({ directory: "tests", parent: "", drawn: true, segments: [{ column: 1, box: { x: 408, y: 500, width: 184, height: 60 } }], insetPx: 12 });
    expect(siblingsApart(reading).findings).toEqual(["src and tests overlap in column 1"]);
  });

  it("a wire that leaves its provider's left edge, and a using dot on a right edge", () => {
    const reading = good();
    reading.wires[0] = wire("src/helpers.ts", "src/processor.ts", [160, 340], [420, 340]);
    reading.anchors[3] = { ...reading.anchors[3], x: 840 };
    expect(usesLeftOfferingsRight(reading).findings).toEqual([
      "helpers.ts offers processor.ts from outside its right half",
      "the using dot of main on main.ts stands in the right half"
    ]);
  });

  it("a route that runs backward", () => {
    const reading = good();
    reading.wires[1] = wire("src/processor.ts", "src/main.ts", [580, 340], [680, 340], { providerEnd: 1 });
    expect(routesForward(reading).findings).toEqual(["processor.ts to main.ts runs backward"]);
  });

  it("a route across a card, and one through a stranger's lane", () => {
    const reading = good();
    reading.wires[0].occludedSamples = 3;
    reading.wires[1].foreignLaneSamples = 2;
    expect(noRouteAcrossACard(reading).findings).toEqual(["helpers.ts to processor.ts crosses another card (3 samples)"]);
    expect(lanesAtHome(reading).findings).toEqual(["processor.ts to main.ts runs in a lane inside a directory holding neither end (2 samples)"]);
  });

  it("a route that arcs over the top of the picture", () => {
    const reading = good();
    reading.wires[1].points.splice(5, 0, [630, 200]);
    expect(nothingOverTheTop(reading).findings).toEqual(["processor.ts to main.ts rises 100 px above the picture"]);
  });

  it("an overview off centre, and one wider than the frame that does not start at its padding", () => {
    const reading = overview();
    reading.picture = { x: 200, y: 250, width: 720, height: 300 };
    expect(framedWhole(reading).findings).toEqual(["the picture is 60 px off centre across"]);
    reading.picture = { x: 100, y: 250, width: 1400, height: 300 };
    expect(framedWhole(reading).findings).toEqual(["the picture is wider than the frame across but does not start at its padding (100 px where 20 px is the rule)"]);
    expect(outcome(framedWhole(good())), "a picture with a subject is framed on it, not whole").toBe("n/a");
  });

  it("a sign of more where the picture ends, and none where it continues", () => {
    const reading = good();
    reading.edgeSigns.below = true;
    reading.picture = { x: -40, y: 250, width: 720, height: 300 };
    expect(edgeSignsHonest(reading).findings).toEqual(["a sign says more below, where the picture ends inside the frame", "the picture continues to the left with no sign"]);
  });

  it("a subject that reaches outside the frame", () => {
    const reading = good();
    reading.cards[1].box.y = 60;
    expect(subjectInFrame(reading).findings).toEqual(["processor.ts reaches outside the frame"]);
  });

  it("a glowing wire, and routes at two strengths", () => {
    const reading = good();
    reading.wires[0].filter = "drop-shadow(0 0 4px blue)";
    reading.wires[1].opacity = 1;
    expect(wiresPlainAtRest(reading).findings).toEqual(["helpers.ts to processor.ts glows (drop-shadow(0 0 4px blue))", "routes at rest are drawn at 2 strengths: 0.7, 1"]);
  });

  it("names that do not lead their prose, and prose under the small-text contrast", () => {
    const reading = good();
    reading.tone = { ...reading.tone, fileName: 10, symbolName: 12, prose: 4 };
    expect(textTones(reading).findings).toEqual([
      "the prose stands at 4.00:1, under 4.5:1",
      "the file's name (10.00:1) is fainter than a symbol's (12.00:1)"
    ]);
    reading.tone = { ...reading.tone, fileName: 12, symbolName: 9, prose: 7 };
    expect(textTones(reading).findings).toEqual(["a symbol's name leads its prose by 1.29 times, under 1.5"]);
  });

  it("an outline that is not seen, one stronger than a card's border, and a filled one", () => {
    const reading = good();
    reading.tone = { ...reading.tone, outline: 1.2, outlineFillAlpha: 0.3 };
    expect(outlineIsGround(reading).findings).toEqual(["the outline stands at 1.20:1, under 1.5:1, and is not seen", "the outline is filled at alpha 0.30"]);
    reading.tone = { ...reading.tone, outline: 3, outlineFillAlpha: 0 };
    expect(outlineIsGround(reading).findings).toEqual(["the outline (3.00:1) is stronger than a card's border (2.40:1)"]);
  });

  it("a directory with no outline, and a root that draws one", () => {
    const reading = good();
    reading.directories[0].drawn = true;
    reading.directories[1].drawn = false;
    expect(outlinesDrawn(reading).findings).toEqual(["the root draws an outline", "src draws no outline"]);
  });

  it("root columns that start at different tops", () => {
    const reading = overview();
    reading.rootColumns[1].top = 312;
    expect(rootColumnsAligned(reading).findings).toEqual(["the root's columns start 12 px apart"]);
    expect(outcome(rootColumnsAligned(good())), "a picture with a subject arranges its columns by its wires").toBe("n/a");
  });

  it("a description in another tone than the Purpose", () => {
    const reading = good();
    reading.tone.colours.description = "rgb(200, 200, 200)";
    expect(proseOneTone(reading).findings).toEqual(["the Purpose is rgb(160, 160, 160) and a description rgb(200, 200, 200)"]);
  });

  it("a name broken inside a word, though one broken at a hump or after a hyphen is whole", () => {
    expect(outcome(namesBreakAtSeams(good()))).toBe("kept");
    const reading = good();
    reading.names[1].lines = ["Process", "orConfig"];
    expect(namesBreakAtSeams(reading).findings).toEqual(['"ProcessorConfig" breaks inside a word, as "Process / orConfig"']);
    expect(LAWS, "kept out of the table until the defect it reports is mended").not.toContain(namesBreakAtSeams);
  });

  it("a console error and a request to another site", () => {
    const reading = good();
    reading.consoleErrors = ["TypeError: x is undefined"];
    reading.offSiteRequests = ["https://example.com/font.woff2"];
    expect(pageHealthy(reading).findings).toEqual(["the console says: TypeError: x is undefined", "the page asked https://example.com/font.woff2"]);
  });
});

describe("relations", () => {
  it("rejects a reload that moved a card, lost a wire and changed a sign", () => {
    const after = good();
    after.cards[0].box.x += 5;
    after.wires.pop();
    after.edgeSigns.right = true;
    expect(samePicture("a reload gives the same picture", good(), after).findings).toEqual([
      "helpers.ts moved or resized by 5 px",
      "route main.ts to processor.ts: 1 before, 0 after",
      "the sign right changed"
    ]);
    expect(outcome(samePicture("a reload gives the same picture", good(), good()))).toBe("kept");
  });

  it("rejects a held name drawn in another tone farther out", () => {
    const far = good();
    far.look = "connections";
    expect(outcome(tonesHeld(good(), far))).toBe("kept");
    far.tone.colours.symbolName = "rgb(150, 150, 150)";
    expect(tonesHeld(good(), far).findings).toEqual(["a symbol's name is rgb(220, 220, 220) at reading and rgb(150, 150, 150) at connections"]);
  });
});

describe("oracle facts", () => {
  const oracle = [
    { consumer: "src/processor.ts", provider: "src/helpers.ts" },
    { consumer: "src/main.ts", provider: "src/processor.ts" },
    { consumer: "src/models.ts", provider: "src/types.ts" }
  ];
  const compiler = { edges: oracle, documents: ["src/main.ts", "src/processor.ts", "src/helpers.ts", "src/models.ts", "src/types.ts"], recordedMissing: [] };

  it("keeps a picture whose wires at the subject are the oracle's edges there, and ignores edges elsewhere", () => {
    expect(outcome(wiresMatchOracle(good(), "src/processor.ts", compiler))).toBe("kept");
  });

  it("neither confirms nor denies a wire to a file the compiler does not index", () => {
    const reading = good();
    reading.wires.push(wire("src/processor.ts", "expected/compiler-edges.json", [580, 340], [680, 340]));
    expect(outcome(wiresMatchOracle(reading, "src/processor.ts", compiler))).toBe("kept");
  });

  it("rejects a missing edge and an invented one", () => {
    const reading = good();
    reading.wires[1] = wire("src/processor.ts", "src/helpers.ts", [580, 340], [680, 340]);
    expect(wiresMatchOracle(reading, "src/processor.ts", compiler).findings).toEqual([
      "missing: src/main.ts uses src/processor.ts",
      "not in the compiler: src/helpers.ts uses src/processor.ts"
    ]);
  });

  it("excuses only the missing edges the oracle comparison records, by name, and never an invented one", () => {
    const reading = good();
    reading.wires[1] = wire("src/processor.ts", "src/helpers.ts", [580, 340], [680, 340]);
    const recorded = { ...compiler, recordedMissing: [{ consumer: "src/main.ts", provider: "src/processor.ts" }] };
    const verdict = wiresMatchOracle(reading, "src/processor.ts", recorded);
    expect(verdict.findings).toEqual(["not in the compiler: src/helpers.ts uses src/processor.ts"]);
    expect(verdict.known).toEqual(["missing: src/main.ts uses src/processor.ts, as the oracle comparison records"]);
    // A recorded gap the picture does not show excuses nothing else.
    reading.wires[1] = wire("src/processor.ts", "src/main.ts", [580, 340], [680, 340]);
    reading.wires.shift();
    expect(wiresMatchOracle(reading, "src/processor.ts", recorded).findings).toEqual(["missing: src/processor.ts uses src/helpers.ts"]);
  });

  it("judges the picture against its own data by the same rule, ranked as a relation", () => {
    const reading = good();
    reading.wires.pop();
    const verdict = wiresMatchData(reading, "src/processor.ts", oracle);
    expect(verdict.rank).toBe("relation");
    expect(verdict.findings).toEqual(["missing: src/main.ts uses src/processor.ts"]);
  });

  it("says so where there is no oracle, rather than passing", () => {
    expect(outcome(wiresMatchOracle(good(), "src/processor.ts", null))).toBe("n/a");
  });
});
