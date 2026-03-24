import { describe, it, expect } from "vitest";
import {
  classifyTrace,
  computeFrontTrace,
  computeBackTrace,
  routeConnection,
  routeConnections,
} from "./routing";
import type { PinAnchor, ConnectionToRoute } from "./routing";

// ─── Helpers ───────────────────────────────────────────────────────

function makeAnchor(x: number, y: number, direction: "inbound" | "outbound", pinRadius = 6): PinAnchor {
  return { center: { x, y }, direction, pinRadius };
}

// ─── classifyTrace ─────────────────────────────────────────────────

describe("classifyTrace", () => {
  it("classifies left-to-right flow as front", () => {
    const outbound = makeAnchor(100, 50, "outbound");
    const inbound = makeAnchor(300, 50, "inbound");
    expect(classifyTrace(outbound, inbound)).toBe("front");
  });

  it("classifies right-to-left flow as back", () => {
    const outbound = makeAnchor(300, 50, "outbound");
    const inbound = makeAnchor(100, 50, "inbound");
    expect(classifyTrace(outbound, inbound)).toBe("back");
  });

  it("classifies same-X as back (edge case: outbound edge >= inbound edge)", () => {
    const outbound = makeAnchor(200, 50, "outbound");
    const inbound = makeAnchor(200, 50, "inbound");
    // outbound edge = 200 + 6 = 206, inbound edge = 200 - 6 = 194
    // 206 >= 194 → back
    expect(classifyTrace(outbound, inbound)).toBe("back");
  });

  it("classifies near-overlap as back when edges overlap", () => {
    const outbound = makeAnchor(195, 50, "outbound", 6);
    const inbound = makeAnchor(205, 50, "inbound", 6);
    // outbound edge = 195 + 6 = 201, inbound edge = 205 - 6 = 199
    // 201 >= 199 → back
    expect(classifyTrace(outbound, inbound)).toBe("back");
  });

  it("classifies well-separated pins as front regardless of vertical position", () => {
    const outbound = makeAnchor(50, 500, "outbound");
    const inbound = makeAnchor(800, 20, "inbound");
    expect(classifyTrace(outbound, inbound)).toBe("front");
  });

  it("uses pin radius in edge calculation", () => {
    // With radius 50: outbound edge = 100 + 50 = 150, inbound edge = 160 - 50 = 110
    // 150 >= 110 → back
    const outbound = makeAnchor(100, 50, "outbound", 50);
    const inbound = makeAnchor(160, 50, "inbound", 50);
    expect(classifyTrace(outbound, inbound)).toBe("back");

    // With radius 5: outbound edge = 100 + 5 = 105, inbound edge = 160 - 5 = 155
    // 105 < 155 → front
    const outboundSmall = makeAnchor(100, 50, "outbound", 5);
    const inboundSmall = makeAnchor(160, 50, "inbound", 5);
    expect(classifyTrace(outboundSmall, inboundSmall)).toBe("front");
  });
});

// ─── computeFrontTrace ─────────────────────────────────────────────

describe("computeFrontTrace", () => {
  it("produces a front trace with a valid SVG path", () => {
    const outbound = makeAnchor(100, 50, "outbound");
    const inbound = makeAnchor(400, 80, "inbound");
    const result = computeFrontTrace(outbound, inbound);

    expect(result.kind).toBe("front");
    expect(result.path.d).toMatch(/^M\s/);
    expect(result.path.approximateLength).toBeGreaterThan(0);
    expect(result.source).toBe(outbound);
    expect(result.target).toBe(inbound);
  });

  it("offsets path start/end by pin radius", () => {
    const outbound = makeAnchor(100, 50, "outbound", 8);
    const inbound = makeAnchor(400, 50, "inbound", 8);
    const result = computeFrontTrace(outbound, inbound);

    // Path should start at outbound.x + radius = 108
    // and end at inbound.x - radius = 392
    const pathD = result.path.d;
    expect(pathD).toMatch(/^M\s+108/);
  });

  it("produces reasonable path length for known geometry", () => {
    const outbound = makeAnchor(0, 0, "outbound", 0);
    const inbound = makeAnchor(300, 0, "inbound", 0);
    const result = computeFrontTrace(outbound, inbound);

    // Straight horizontal: path ≈ 300 (may be slightly longer for Bézier)
    expect(result.path.approximateLength).toBeGreaterThan(250);
    expect(result.path.approximateLength).toBeLessThan(400);
  });
});

// ─── computeBackTrace ──────────────────────────────────────────────

describe("computeBackTrace", () => {
  it("produces a back trace with polygon point strings for stubs", () => {
    const outbound = makeAnchor(300, 50, "outbound");
    const inbound = makeAnchor(100, 50, "inbound");
    const result = computeBackTrace(outbound, inbound);

    expect(result.kind).toBe("back");
    expect(result.outboundStubPoints).toBeTruthy();
    expect(result.inboundStubPoints).toBeTruthy();
    expect(result.source).toBe(outbound);
    expect(result.target).toBe(inbound);
  });

  it("produces different stub polygons for each end", () => {
    const outbound = makeAnchor(400, 100, "outbound");
    const inbound = makeAnchor(200, 80, "inbound");
    const result = computeBackTrace(outbound, inbound);

    expect(result.outboundStubPoints).not.toBe(result.inboundStubPoints);
  });

  it("returns valid SVG polygon point strings", () => {
    const outbound = makeAnchor(300, 50, "outbound", 6);
    const inbound = makeAnchor(100, 50, "inbound", 6);
    const result = computeBackTrace(outbound, inbound);

    // Polygon points should be comma-separated x,y pairs with spaces
    const pointPattern = /^[\d.]+,[\d.]+(\s+[\d.]+,[\d.]+)*$/;
    expect(result.outboundStubPoints).toMatch(pointPattern);
    expect(result.inboundStubPoints).toMatch(pointPattern);
  });
});

// ─── routeConnection ──────────────────────────────────────────────

describe("routeConnection", () => {
  it("routes a forward connection as front trace", () => {
    const outbound = makeAnchor(50, 100, "outbound");
    const inbound = makeAnchor(500, 100, "inbound");
    const result = routeConnection(outbound, inbound);

    expect(result.kind).toBe("front");
  });

  it("routes a backward connection as back trace", () => {
    const outbound = makeAnchor(500, 100, "outbound");
    const inbound = makeAnchor(50, 100, "inbound");
    const result = routeConnection(outbound, inbound);

    expect(result.kind).toBe("back");
  });

  it("accepts custom tuning parameters", () => {
    const outbound = makeAnchor(50, 100, "outbound");
    const inbound = makeAnchor(500, 100, "inbound");
    const tuning = { stubFactor: 0.5, stubMin: 30, stubMaxOffset: 200, verticalOffset: 0.2 };
    const result = routeConnection(outbound, inbound, tuning);

    expect(result.kind).toBe("front");
    expect((result as { path: { approximateLength: number } }).path.approximateLength).toBeGreaterThan(0);
  });
});

// ─── routeConnections (batch) ──────────────────────────────────────

describe("routeConnections", () => {
  it("routes an empty batch", () => {
    const result = routeConnections([]);
    expect(result.size).toBe(0);
  });

  it("routes a mixed batch of front and back connections", () => {
    const connections: ConnectionToRoute[] = [
      {
        id: "a→b",
        outbound: makeAnchor(100, 50, "outbound"),
        inbound: makeAnchor(400, 50, "inbound"),
      },
      {
        id: "c→d",
        outbound: makeAnchor(400, 150, "outbound"),
        inbound: makeAnchor(100, 150, "inbound"),
      },
    ];

    const result = routeConnections(connections);

    expect(result.size).toBe(2);
    expect(result.get("a→b")!.kind).toBe("front");
    expect(result.get("c→d")!.kind).toBe("back");
  });

  it("handles degenerate same-point anchors without NaN", () => {
    const anchor = makeAnchor(100, 100, "outbound", 0);
    const inbound = makeAnchor(100, 100, "inbound", 0);
    // Same point, zero radius — classified as back (edge >= edge)
    const result = routeConnection(anchor, inbound);
    expect(result.kind).toBe("back");
    // Stubs should still produce valid polygon strings (no NaN)
    if (result.kind === "back") {
      expect(result.outboundStubPoints).not.toContain("NaN");
      expect(result.inboundStubPoints).not.toContain("NaN");
    }
  });

  it("handles negative coordinates from pan/zoom transforms", () => {
    const outbound = makeAnchor(-200, -150, "outbound");
    const inbound = makeAnchor(300, -50, "inbound");
    const result = routeConnection(outbound, inbound);
    expect(result.kind).toBe("front");
    if (result.kind === "front") {
      expect(result.path.d).toMatch(/^M\s/);
      expect(result.path.approximateLength).toBeGreaterThan(0);
      expect(result.path.d).not.toContain("NaN");
    }
  });

  it("front trace with extreme vertical separation has longer path than horizontal", () => {
    const outbound = makeAnchor(0, 0, "outbound", 0);
    const inboundHoriz = makeAnchor(300, 0, "inbound", 0);
    const inboundDiag = makeAnchor(300, 500, "inbound", 0);
    const horizResult = computeFrontTrace(outbound, inboundHoriz);
    const diagResult = computeFrontTrace(outbound, inboundDiag);
    // Diagonal path should be longer than purely horizontal
    expect(diagResult.path.approximateLength).toBeGreaterThan(horizResult.path.approximateLength);
  });

  it("preserves correlation IDs", () => {
    const connections: ConnectionToRoute[] = [
      {
        id: "edge-1",
        outbound: makeAnchor(0, 0, "outbound"),
        inbound: makeAnchor(200, 0, "inbound"),
      },
      {
        id: "edge-2",
        outbound: makeAnchor(0, 100, "outbound"),
        inbound: makeAnchor(200, 100, "inbound"),
      },
    ];

    const result = routeConnections(connections);
    expect([...result.keys()]).toEqual(["edge-1", "edge-2"]);
  });
});
