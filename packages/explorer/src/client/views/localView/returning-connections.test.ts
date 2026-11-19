import { describe, expect, it } from "vitest";

import type { ExplorerNodePayload } from "../../../shared/types";
import { edgeKey, rankBranches } from "./branches";
import { BACKWARD_STRENGTHS, backwardStrength, connectionCount, MANY_BACKWARD, RETURN_CLEARANCE, returnRoute, returningConnections } from "./returning-connections";
import type { LocalEdge } from "./types";

function node(id: string): ExplorerNodePayload {
  return { id, name: id, codePath: id, codeRelativePath: id, docPath: `${id}.md`, docRelativePath: `${id}.md`,
    archetype: "implementation", dependencies: [], dependents: [], missingDependencies: [], publicSymbols: ["value"] };
}

/** A reference in which `uses` uses `offers`, by its two rows. */
const uses = (user: string, userRow: string, offers: string, offersRow: string, gathered?: number): LocalEdge => ({
  sourceId: user, targetId: offers, sourceSymbol: userRow, targetSymbol: offersRow, direction: "outbound", kind: "dependency",
  ...(gathered === undefined ? null : { gathered })
});

describe("the connections a picture draws against its left-to-right order", () => {
  // A ring of three files, as the estate's PaymentService, Hub and Gateway: a uses b, b uses c, c uses a twice; d uses a,
  // and a uses itself. The ranking stands the ring provider-first and must read the ring's closing references backward.
  const links = [
    uses("a", "run", "b", "plan"), uses("b", "plan", "c", "store"), uses("c", "store", "a", "Result"), uses("c", "load", "a", "Query"),
    uses("d", "main", "a", "run"), uses("a", "run", "a", "helper")
  ];
  const ranking = rankBranches(["a", "b", "c", "d"].map(node), links);
  const isBack = (edge: LocalEdge): boolean => ranking.back.has(edgeKey(edge));

  it("counts each returning reference between two files once for the picture and at both of its files, never a file's own", () => {
    // Provider-first, the ring stands a, c, b: a's use of b is the one reference that reads against the order.
    const returning = returningConnections(links, isBack);
    expect(returning.edges).toEqual([links[0]]);
    expect(returning.total).toBe(1);
    expect([...returning.byFile].map(([file, edges]) => [file, connectionCount(edges)])).toEqual([["a", 1], ["b", 1]]);
    // The cards' feet together tell each return twice, once at each end; the picture tells it once.
    const feet = [...returning.byFile.values()].reduce((sum, edges) => sum + connectionCount(edges), 0);
    expect(feet).toBe(2 * returning.total);
    // Even said to read backward, a file's laces within one card join no two files.
    expect(returningConnections(links, () => true).edges).not.toContain(links[5]);
    expect(returningConnections(links, () => true).total).toBe(5);
  });

  it("counts a returning pair line by the links it stands for, and only what the picture draws", () => {
    const line = uses("p", "", "q", "", 4), back = uses("q", "x", "p", "y");
    const all = returningConnections([line, back, uses("q", "z", "p", "w")], () => true);
    expect(all.total).toBe(6);
    expect(connectionCount(all.byFile.get("p")!)).toBe(6);
    const drawn = returningConnections([line, back, uses("q", "z", "p", "w")], () => true, edge => edge.sourceSymbol !== "z");
    expect(drawn.total, "a return whose rows the picture hides draws no lace and is not counted").toBe(5);
    expect(returningConnections([back], () => false).total, "a forward reference does not return").toBe(0);
  });

  it("calls at two strengths, the stronger from the measured boundary", () => {
    expect(BACKWARD_STRENGTHS).toEqual(["none", "some", "many"]);
    expect(backwardStrength(0)).toBe("none");
    expect(backwardStrength(1)).toBe("some");
    expect(backwardStrength(MANY_BACKWARD - 1)).toBe("some");
    expect(backwardStrength(MANY_BACKWARD)).toBe("many");
  });
});

describe("a returning connection's route", () => {
  /** The route's numbers, in order: M fx fy, C (two controls) to the run's right end, L to its left end, C (two controls) to the pin. */
  const numbers = (d: string): number[] => d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  /** The height of the route's run back. */
  const runHeight = (d: string): number => numbers(d)[9];
  // The owner's picture in small: App.config at the left, a card between, PaymentService.cs at the right; the return
  // leaves PaymentService.cs's hub on its right and arrives at App.config's on its left, both at their names.
  const config = { left: 0, right: 200, top: 100, bottom: 300 };
  const between = { left: 300, right: 500, top: 220, bottom: 400 };
  const service = { left: 600, right: 800, top: 100, bottom: 300 };
  const from = { x: 806, y: 124 }, to = { x: -6, y: 124 };

  it("runs back above both cards, clear of their tops, so that it crosses neither name", () => {
    const route = returnRoute(from, to, [config, between, service]);
    expect(runHeight(route)).toBe(100 - RETURN_CLEARANCE);
    expect(route.startsWith(`M ${from.x} ${from.y} `)).toBe(true);
    expect(route.endsWith(` ${to.x} ${to.y}`)).toBe(true);
  });

  it("turns out to the right of the offering card and in from the left of the using card", () => {
    const n = numbers(returnRoute(from, to, [config, service]));
    expect(Math.min(n[2], n[4])).toBeGreaterThan(from.x);
    expect(Math.max(n[10], n[12])).toBeLessThan(to.x);
  });

  it("is lifted above a higher box it would cross, and not by one it passes beneath or one beyond the pins", () => {
    const tall = { left: 300, right: 500, top: 40, bottom: 400 };
    expect(runHeight(returnRoute(from, to, [config, tall, service]))).toBe(40 - RETURN_CLEARANCE);
    const above = { left: 300, right: 500, top: 0, bottom: 60 };
    const beyond = { left: 900, right: 1100, top: 10, bottom: 400 };
    expect(runHeight(returnRoute(from, to, [config, above, beyond, service]))).toBe(100 - RETURN_CLEARANCE);
  });
});
