import { describe, expect, it } from "vitest";

import { scoreOf, type StartCosts, type StartSignals } from "./branch-restarts";
import { beginSearch, endpointKey, judgeAlignment, judgeStart, nextTrialKind, orderedRows, pinFor, rowBounds, type CardRows, type ResolvedPin } from "./branch-search";

describe("the continuing search", () => {
  const settings = { from: 5, to: 8, patience: 2 };

  it("begins at the seed after the first paint's last, running, with the shown picture's price to beat", () => {
    const state = beginSearch(settings, 1000);
    expect(state).toMatchObject({ next: 5, tried: 0, sinceBetter: 0, adopted: 0, shown: 1000, best: 1000, priced: null, status: "running" });
  });

  it("is capped at once with no seed to try, and settled with no patience", () => {
    expect(beginSearch({ from: 5, to: 4, patience: 2 }, 1000).status).toBe("capped");
    expect(beginSearch({ from: 5, to: 8, patience: 0 }, 1000).status).toBe("settled");
  });

  it("adopts a start priced strictly below the shown picture, and the shown price becomes the start's own without churn", () => {
    const first = judgeStart(beginSearch(settings, 1000), 900, 850);
    expect(first.adopt).toBe(true);
    expect(first.state).toMatchObject({ next: 6, tried: 1, sinceBetter: 0, adopted: 1, shown: 850, best: 850, priced: 900, status: "running" });
    // Priced equal to the shown picture, it is not adopted; but at 800 without churn it betters the best found, so the patience begins again.
    const equal = judgeStart(first.state, 850, 800);
    expect(equal.adopt).toBe(false);
    expect(equal.state).toMatchObject({ next: 7, tried: 2, sinceBetter: 0, adopted: 1, shown: 850, best: 800, priced: 850 });
  });

  it("settles after the patience of starts that better nothing, and caps past the last seed", () => {
    let { state } = judgeStart(beginSearch(settings, 1000), 1100, 1050);
    expect(state.status).toBe("running");
    ({ state } = judgeStart(state, 1200, 1150));
    expect(state).toMatchObject({ tried: 2, sinceBetter: 2, best: 1000, status: "settled" });
    // Settled, it judges nothing more.
    expect(judgeStart(state, 1, 1)).toEqual({ state, adopt: false });
    const long = { from: 5, to: 6, patience: 10 };
    let run = judgeStart(beginSearch(long, 1000), 1100, 1050).state;
    expect(run.status).toBe("running");
    run = judgeStart(run, 1100, 1050).state;
    expect(run).toMatchObject({ next: 7, status: "capped" });
  });

  it("a better start refused for its churn keeps the search going, and the next better one is adopted on its own account", () => {
    // Shown at 1000; a start at 990 with 150 of churn is refused, but found; two more that better nothing do not settle a patience of three.
    let { state } = judgeStart(beginSearch({ from: 5, to: 20, patience: 3 }, 1000), 1140, 990);
    expect(state).toMatchObject({ adopted: 0, shown: 1000, best: 990, sinceBetter: 0, status: "running" });
    ({ state } = judgeStart(state, 1300, 1200));
    ({ state } = judgeStart(state, 1300, 1200));
    expect(state).toMatchObject({ sinceBetter: 2, status: "running" });
    // A start at 980 with no churn is adopted; the shown and the best are its own.
    const adopted = judgeStart(state, 980, 980);
    expect(adopted.adopt).toBe(true);
    expect(adopted.state).toMatchObject({ adopted: 1, shown: 980, best: 980, sinceBetter: 0, status: "running" });
    // Under the old rule the two unbettering starts after the refusal would have been three with it, and a patience of three settled.
  });

  it("an adoption on the last seed caps the search as well", () => {
    const { state } = judgeStart(beginSearch({ from: 5, to: 5, patience: 3 }, 1000), 900, 850);
    expect(state).toMatchObject({ adopted: 1, shown: 850, status: "capped" });
  });

  it("alternates pending alignment and seed trials, then finishes alignments after the last seed", () => {
    let state = beginSearch({ from: 5, to: 6, patience: 10 }, 1000);
    let preferAlignment = true;
    const kinds: string[] = [];
    for (let trial = 0; trial < 5; trial++) {
      const kind = nextTrialKind(state, true, preferAlignment);
      expect(kind).not.toBeNull();
      kinds.push(kind!);
      preferAlignment = kind === "seed";
      state = (kind === "seed" ? judgeStart : judgeAlignment)(state, 1100, 1100).state;
    }
    expect(kinds).toEqual(["alignment", "seed", "alignment", "seed", "alignment"]);
    expect(state).toMatchObject({ next: 7, tried: 2, sinceBetter: 2, status: "capped" });
    expect(nextTrialKind(state, false, preferAlignment)).toBeNull();
    expect(nextTrialKind(beginSearch(settings, 1000), false, true)).toBe("seed");
  });

  it("allows pending alignments after seed patience settles, including a search begun without seeds", () => {
    const settled = judgeStart(beginSearch({ from: 5, to: 8, patience: 1 }, 1000), 1100, 1100).state;
    expect(settled.status).toBe("settled");
    for (const state of [settled, beginSearch({ from: 5, to: 4, patience: 2 }, 1000)]) {
      expect(nextTrialKind(state, true, false)).toBe("alignment");
      expect(nextTrialKind(state, true, true)).toBe("alignment");
      expect(nextTrialKind(state, false, false)).toBeNull();
      const accepted = judgeAlignment(state, 900, 900);
      expect(accepted.adopt).toBe(true);
      expect(accepted.state).toMatchObject({ next: state.next, tried: state.tried, sinceBetter: state.sinceBetter, status: state.status, shown: 900 });
    }
  });

  it("judges the complete alignment score strictly, so fewer steps cannot hide a more expensive picture", () => {
    const costs: StartCosts = { crossing: 80, height: 1, churn: 100, evenness: 1, levelness: 1, steps: 50 };
    const signals: StartSignals = { vertical: 100, crossings: 0, height: 100, churn: 0, unevenness: 0, unlevel: 0, steps: 2 };
    const state = beginSearch(settings, scoreOf(signals, costs));
    const expensive = scoreOf({ ...signals, vertical: 210, steps: 0 }, costs);
    const equal = scoreOf({ ...signals, vertical: 200, steps: 0 }, costs);
    const better = scoreOf({ ...signals, vertical: 190, steps: 0 }, costs);
    expect(judgeAlignment(state, expensive, expensive).adopt).toBe(false);
    expect(judgeAlignment(state, equal, equal).adopt).toBe(false);
    const accepted = judgeAlignment(state, better, better);
    expect(accepted.adopt).toBe(true);
    expect(accepted.state).toMatchObject({ shown: 290, best: 290, adopted: 1, next: 5, tried: 0, sinceBetter: 0 });
    expect(state.shown).toBe(300);
  });

  it("records an alignment's improvement without consuming or resetting ordering patience", () => {
    const state = judgeStart(beginSearch({ from: 5, to: 8, patience: 3 }, 1000), 1100, 1100).state;
    expect(state.sinceBetter).toBe(1);
    // Refused at the churn-inclusive price, but still the best picture found without churn.
    const refused = judgeAlignment(state, 1050, 900);
    expect(refused.adopt).toBe(false);
    expect(refused.state).toMatchObject({ shown: 1000, best: 900, adopted: 0, priced: 1050, next: 6, tried: 1, sinceBetter: 1, status: "running" });
    const accepted = judgeAlignment(refused.state, 950, 850);
    expect(accepted.adopt).toBe(true);
    expect(accepted.state).toMatchObject({ shown: 850, best: 850, adopted: 1, next: 6, tried: 1, sinceBetter: 1, status: "running" });
  });
});

describe("a card's rows measured once", () => {
  // Header 50, rows A (20 tall, pins at 10), B (30 tall, inbound 15, no outbound), a second a (duplicate name), Internals (18, inbound 9); gap 6.
  const card: CardRows = {
    header: 50, gap: 6,
    rows: [
      { key: "a\u00000", height: 20 },
      { key: "b\u00000", height: 30 },
      { key: "a\u00001", height: 22 },
      { key: "__internals__\u00000", height: 18 }
    ],
    internals: "__internals__\u00000",
    endpoints: new Map<string, ResolvedPin | null>([
      [endpointKey("inbound", "a"), { row: "a\u00000", offset: 10 }],
      [endpointKey("inbound", "b"), { row: "b\u00000", offset: 15 }],
      [endpointKey("inbound", "zzz"), { row: "__internals__\u00000", offset: 9 }],
      [endpointKey("inbound", undefined), { row: "__internals__\u00000", offset: 9 }],
      [endpointKey("outbound", "b"), { row: null, offset: 90 }],
      [endpointKey("outbound", undefined), { row: null, offset: 90 }],
      [endpointKey("outbound", "hidden"), null]
    ])
  };

  it("stands the named rows first, a row per mention, the rest after in their order, Internals last", () => {
    expect(orderedRows(card, ["b", "a"]).map(row => row.key)).toEqual(["b\u00000", "a\u00000", "a\u00001", "__internals__\u00000"]);
    expect(orderedRows(card, ["a", "a", "b"]).map(row => row.key)).toEqual(["a\u00000", "a\u00001", "b\u00000", "__internals__\u00000"]);
    expect(orderedRows(card, ["__internals__", "b"]).map(row => row.key)).toEqual(["b\u00000", "a\u00000", "a\u00001", "__internals__\u00000"]);
    expect(orderedRows(card, undefined).map(row => row.key)).toEqual(card.rows.map(row => row.key));
  });

  it("places a pin by the rows above it and the gaps between", () => {
    expect(pinFor(card, undefined, "inbound", "a")).toBe(60);
    expect(pinFor(card, ["b", "a"], "inbound", "a")).toBe(50 + 30 + 6 + 10);
    expect(pinFor(card, ["b", "a"], "inbound", "b")).toBe(65);
    // The runtime chose Internals for the unknown inbound symbol and the hub for outbound requests.
    expect(pinFor(card, undefined, "inbound", "zzz")).toBe(50 + 20 + 6 + 30 + 6 + 22 + 6 + 9);
    expect(pinFor(card, undefined, "inbound", undefined)).toBe(50 + 20 + 6 + 30 + 6 + 22 + 6 + 9);
    expect(pinFor(card, undefined, "outbound", "b")).toBe(90);
    expect(pinFor(card, ["b", "a"], "outbound", undefined)).toBe(90);
    expect(pinFor(card, undefined, "outbound", "hidden")).toBeNull();
    expect(() => pinFor({ ...card, rows: card.rows.slice(0, 3) }, undefined, "inbound", "zzz")).toThrow(/missing row/u);
    expect(() => pinFor(card, undefined, "outbound", "unrecorded")).toThrow(/no resolved outbound endpoint/u);
  });

  it("rounds as the page's measurement does, half pixels up", () => {
    const halves: CardRows = { header: 10.5, gap: 6, rows: [{ key: "a\u00000", height: 19 }], internals: null,
      endpoints: new Map([[endpointKey("inbound", "a"), { row: "a\u00000", offset: 9 }]]) };
    expect(pinFor(halves, undefined, "inbound", "a")).toBe(20);
  });

  it("keeps exact-case and normalized aliases attached to the duplicate row the runtime resolved", () => {
    const duplicates: CardRows = {
      header: 50, gap: 6, internals: null,
      rows: [{ key: "item\u00000", height: 14 }, { key: "item\u00001", height: 14 }, { key: "other\u00000", height: 14 }],
      // Raw item resolves its exact first row; Item and the normalized ITEM alias resolve the last registered row.
      endpoints: new Map([
        [endpointKey("outbound", "item"), { row: "item\u00000", offset: 7 }],
        [endpointKey("outbound", "Item"), { row: "item\u00001", offset: 7 }],
        [endpointKey("outbound", "ITEM"), { row: "item\u00001", offset: 7 }]
      ])
    };
    expect(pinFor(duplicates, undefined, "outbound", "item")).toBe(57);
    expect(pinFor(duplicates, undefined, "outbound", "Item")).toBe(77);
    expect(pinFor(duplicates, ["other", "item", "item"], "outbound", "item")).toBe(77);
    expect(pinFor(duplicates, ["other", "item", "item"], "outbound", "Item")).toBe(97);
    expect(pinFor(duplicates, ["other", "item", "item"], "outbound", "ITEM")).toBe(97);
  });

  it("retains file-level and no-row asset hubs, while explicitly hidden endpoints remain absent", () => {
    const asset: CardRows = {
      header: 0, gap: 0, rows: [], internals: null,
      endpoints: new Map<string, ResolvedPin | null>([
        [endpointKey("inbound", undefined), { row: null, offset: 103.5 }],
        [endpointKey("outbound", undefined), { row: null, offset: 103.5 }],
        [endpointKey("outbound", "unknown"), { row: null, offset: 103.5 }],
        [endpointKey("inbound", "hidden"), null]
      ])
    };
    expect(pinFor(asset, [], "inbound", undefined)).toBe(104);
    expect(pinFor(asset, [], "outbound", undefined)).toBe(104);
    expect(pinFor(asset, [], "outbound", "unknown")).toBe(104);
    expect(pinFor(asset, [], "inbound", "hidden")).toBeNull();
  });

  it("uses grid tracks rather than protruding glyph boxes for mixed-height warehouse rows", () => {
    const withLabel = (top: number, bottom: number) => rowBounds([
      { top: 0, bottom: 14, marginTop: 0, marginBottom: 0 },
      { top, bottom, marginTop: -2, marginBottom: -2 }
    ]);
    expect(withLabel(-2, 16)).toEqual({ top: 0, bottom: 14 });
    expect(withLabel(-1.5, 15.5)).toEqual({ top: 0, bottom: 14 });
    expect(rowBounds([
      { top: 4, bottom: 18, marginTop: 4, marginBottom: 0 },
      { top: -0.5, bottom: 18.5, marginTop: -2, marginBottom: -2 }
    ])).toEqual({ top: 0, bottom: 18 });
    expect(rowBounds([])).toBeNull();
    const names = ["add", "report", "builder", "build", "lines", "__internals__"];
    const report: CardRows = {
      header: 56, gap: 6, internals: "__internals__\u00000",
      rows: names.map(name => ({ key: `${name}\u00000`, height: name === "__internals__" ? 18 : 14 })),
      endpoints: new Map(names.map(name => [endpointKey("inbound", name), { row: `${name}\u00000`, offset: name === "__internals__" ? 11 : 7 }]))
    };
    expect(names.map(name => pinFor(report, undefined, "inbound", name))).toEqual([63, 83, 103, 123, 143, 167]);
    expect(pinFor(report, ["lines", "add", "report", "builder", "build"], "inbound", "lines")).toBe(63);
    expect(pinFor(report, ["lines", "add", "report", "builder", "build"], "inbound", "__internals__")).toBe(167);
  });
});
