import { describe, expect, it } from "vitest";

import type { LocalEdge } from "./types";
import { GATHERED_WIDTH, gatheredDescription, gatheredWidth, gatherWires, ownWires } from "./wire-gathering";

/** A wire from what offers (`target`) to what uses (`source`), by file and symbol. */
const wire = (uses: string, usesSymbol: string | undefined, offers: string, offersSymbol: string | undefined): LocalEdge => ({
  sourceId: uses, targetId: offers, sourceSymbol: usesSymbol, targetSymbol: offersSymbol, direction: "outbound", kind: "import"
});

const wires = [
  wire("spec.ts", "a", "still.ts", "readPicture"),
  wire("spec.ts", "b", "still.ts", "localMapUrl"),
  wire("spec.ts", undefined, "still.ts", "readPicture"),
  wire("still.ts", "readPicture", "types.ts", "Payload"),
  wire("still.ts", "readPicture", "spec.ts", "helper"),
  wire("still.ts", "readPicture", "still.ts", "boxOf")
];

describe("gatherWires", () => {
  it("joins every pair of files once each way, counting and keeping its wires", () => {
    const gathered = gatherWires(wires, () => false);
    expect(gathered.map(each => [each.providerId, each.consumerId, each.members.length])).toEqual([
      ["still.ts", "spec.ts", 3],
      ["types.ts", "still.ts", 1],
      ["spec.ts", "still.ts", 1]
    ]);
    // Membership: the members are the wires themselves, in the order they came.
    expect(gathered[0].members).toEqual(wires.slice(0, 3));
    // Every wire between two files is in exactly one gathered wire; a file's wires to itself are in none.
    const counted = gathered.flatMap(each => each.members);
    expect(counted).toHaveLength(wires.length - 1);
    expect(counted).not.toContain(wires[5]);
  });

  it("gives a pair's keys distinct for each direction, and says when its wires read against the columns", () => {
    const gathered = gatherWires(wires, edge => edge.targetId === "spec.ts");
    expect(new Set(gathered.map(each => each.key)).size).toBe(3);
    expect(gathered.map(each => each.back)).toEqual([false, false, true]);
  });

  it("gathers nothing from no wires", () => {
    expect(gatherWires([], () => false)).toEqual([]);
  });
});

describe("ownWires", () => {
  it("keeps every wire with a pinned symbol at either end, and a self-reference only with both ends pinned", () => {
    const pinned = new Set(["still.ts readPicture"]);
    const own = ownWires(wires, (nodeId, symbol) => pinned.has(`${nodeId} ${symbol}`));
    expect(own).toEqual([wires[0], wires[2], wires[3], wires[4]]);
    pinned.add("still.ts boxOf");
    expect(ownWires(wires, (nodeId, symbol) => pinned.has(`${nodeId} ${symbol}`))).toContain(wires[5]);
  });
});

describe("gatheredWidth", () => {
  it("is one wire's width for one, grows with the count and stops at its ceiling", () => {
    expect(gatheredWidth(1)).toBe(GATHERED_WIDTH.least);
    expect(gatheredWidth(0)).toBe(GATHERED_WIDTH.least);
    const widths = [1, 2, 5, 10, 30, 60].map(gatheredWidth);
    for (let index = 1; index < widths.length; index += 1) expect(widths[index]).toBeGreaterThan(widths[index - 1]);
    expect(gatheredWidth(10_000)).toBe(GATHERED_WIDTH.greatest);
    for (const count of [1, 3, 59, 1e6]) {
      expect(gatheredWidth(count)).toBeGreaterThanOrEqual(GATHERED_WIDTH.least);
      expect(gatheredWidth(count)).toBeLessThanOrEqual(GATHERED_WIDTH.greatest);
    }
  });
});

describe("gatheredDescription", () => {
  it("names the two files and the count", () => {
    const [first, second] = gatherWires(wires, () => false);
    const name = (id: string): string => id;
    expect(gatheredDescription(first, name)).toBe("still.ts offers spec.ts 3 references");
    expect(gatheredDescription(second, name)).toBe("types.ts offers still.ts 1 reference");
  });
});
