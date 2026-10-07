import { describe, expect, it } from "vitest";

import { beginSearch, judgeStart, orderedRows, pinFor, type CardRows } from "./branch-search";

describe("the continuing search", () => {
  const settings = { from: 5, to: 8, patience: 2 };

  it("begins at the seed after the first paint's last, running, with the shown picture's price to beat", () => {
    const state = beginSearch(settings, 1000);
    expect(state).toMatchObject({ next: 5, tried: 0, sinceAdoption: 0, adopted: 0, shown: 1000, priced: null, status: "running" });
  });

  it("is capped at once with no seed to try, and settled with no patience", () => {
    expect(beginSearch({ from: 5, to: 4, patience: 2 }, 1000).status).toBe("capped");
    expect(beginSearch({ from: 5, to: 8, patience: 0 }, 1000).status).toBe("settled");
  });

  it("adopts a start priced strictly below the shown picture, and the shown price becomes the start's own without churn", () => {
    const first = judgeStart(beginSearch(settings, 1000), 900, 850);
    expect(first.adopt).toBe(true);
    expect(first.state).toMatchObject({ next: 6, tried: 1, sinceAdoption: 0, adopted: 1, shown: 850, priced: 900, status: "running" });
    const equal = judgeStart(first.state, 850, 800);
    expect(equal.adopt).toBe(false);
    expect(equal.state).toMatchObject({ next: 7, tried: 2, sinceAdoption: 1, adopted: 1, shown: 850, priced: 850 });
  });

  it("settles after the patience of starts without an adoption, and caps past the last seed", () => {
    let { state } = judgeStart(beginSearch(settings, 1000), 1100, 1050);
    expect(state.status).toBe("running");
    ({ state } = judgeStart(state, 1200, 1150));
    expect(state).toMatchObject({ tried: 2, sinceAdoption: 2, status: "settled" });
    // Settled, it judges nothing more.
    expect(judgeStart(state, 1, 1)).toEqual({ state, adopt: false });
    const long = { from: 5, to: 6, patience: 10 };
    let run = judgeStart(beginSearch(long, 1000), 1100, 1050).state;
    expect(run.status).toBe("running");
    run = judgeStart(run, 1100, 1050).state;
    expect(run).toMatchObject({ next: 7, status: "capped" });
  });

  it("an adoption on the last seed caps the search as well", () => {
    const { state } = judgeStart(beginSearch({ from: 5, to: 5, patience: 3 }, 1000), 900, 850);
    expect(state).toMatchObject({ adopted: 1, shown: 850, status: "capped" });
  });
});

describe("a card's rows measured once", () => {
  // Header 50, rows A (20 tall, pins at 10), B (30 tall, inbound 15, no outbound), a second a (duplicate name), Internals (18, inbound 9); gap 6.
  const card: CardRows = {
    header: 50, gap: 6,
    rows: [
      { key: "a\u00000", height: 20, inbound: 10, outbound: 10 },
      { key: "b\u00000", height: 30, inbound: 15, outbound: null },
      { key: "a\u00001", height: 22, inbound: 11, outbound: 11 },
      { key: "__internals__\u00000", height: 18, inbound: 9, outbound: null }
    ],
    internals: "__internals__\u00000"
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
    // A pin the row has not, or no row named: the card's own anchor, the Internals row, answers on the sides it has.
    expect(pinFor(card, undefined, "inbound", "zzz")).toBe(50 + 20 + 6 + 30 + 6 + 22 + 6 + 9);
    expect(pinFor(card, undefined, "inbound", undefined)).toBe(50 + 20 + 6 + 30 + 6 + 22 + 6 + 9);
    expect(pinFor(card, undefined, "outbound", "b")).toBeNull();
    expect(pinFor(card, undefined, "outbound", undefined)).toBeNull();
    expect(pinFor({ ...card, internals: null, rows: card.rows.slice(0, 3) }, undefined, "inbound", "zzz")).toBeNull();
  });

  it("rounds as the page's measurement does, half pixels up", () => {
    const halves: CardRows = { header: 10.5, gap: 6, rows: [{ key: "a\u00000", height: 19, inbound: 9, outbound: 9 }], internals: null };
    expect(pinFor(halves, undefined, "inbound", "a")).toBe(20);
  });
});
