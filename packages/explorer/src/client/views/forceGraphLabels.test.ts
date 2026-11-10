import { describe, expect, it } from "vitest";

import { placeSpatialLabels, type SpatialLabel, type SpatialLabelBody } from "./forceGraphLabels";

const label = (id: string, priority = 3): SpatialLabel => ({ id, priority, x: 120, y: 90, radius: 10, width: 110, height: 28 });

describe("spatial names", () => {
  it("gives a subject room before contextual names, without shrinking either", () => {
    const names = [label("context", 5), label("subject", 0)];
    const placed = placeSpatialLabels(names, { width: 240, height: 160 }, [], new Map());
    expect(placed.get("subject")).toEqual({ x: 65, y: 107, width: 110, height: 28, side: 0 });
    expect(placed.get("context")).toEqual({ x: 65, y: 45, width: 110, height: 28, side: 1 });
  });

  it("moves around a panel, keeps a usable side on the next frame and never clips a name at the viewport edge", () => {
    const item = label("a");
    const viewport = { width: 240, height: 160 };
    const placed = placeSpatialLabels([item], viewport, [{ x: 0, y: 100, width: 240, height: 60 }], new Map());
    expect(placed.get("a")?.side).toBe(1);
    const again = placeSpatialLabels([{ ...item, x: 125 }], viewport, [], new Map([["a", 1]]));
    expect(again.get("a")?.side).toBe(1);
    const edge = placeSpatialLabels([{ ...item, x: 10 }], viewport, [], new Map());
    expect(edge.get("a")?.side).toBe(2);
    expect(edge.get("a")?.width).toBe(110);
  });

  it("leaves a crowded name for more space instead of overlapping it", () => {
    const item = { ...label("a"), width: 300 };
    expect(placeSpatialLabels([item], { width: 240, height: 160 }, [], new Map()).size).toBe(0);
    expect(placeSpatialLabels([{ ...item, x: 200 }], { width: 400, height: 160 }, [], new Map()).size).toBe(1);
  });

  it("keeps a contextual name off a higher-priority sphere even when its text would fit", () => {
    const subject = { ...label("subject", 0), x: 180, y: 120, radius: 15 };
    const context = label("context", 5);
    const placed = placeSpatialLabels([context, subject], { width: 340, height: 220 }, [], new Map());
    expect(placed.has("subject")).toBe(true);
    const box = placed.get("context")!;
    expect(box.side).not.toBe(0);
    const dx = Math.max(box.x, Math.min(subject.x, box.x + box.width)) - subject.x;
    const dy = Math.max(box.y, Math.min(subject.y, box.y + box.height)) - subject.y;
    expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(subject.radius + 2);
  });

  it("stands a name outside its own ring's visible edge", () => {
    // A ten-pixel sphere has a sixteen-pixel outer ring. The name must clear the latter, including on a retained diagonal.
    const ringed = { ...label("ringed"), radius: 16 };
    const placed = placeSpatialLabels([ringed], { width: 340, height: 220 }, [], new Map([[ringed.id, 4]]));
    const box = placed.get(ringed.id)!;
    expect(box.side).toBe(4);
    expect(Math.hypot(box.x - ringed.x, box.y - ringed.y)).toBeGreaterThanOrEqual(ringed.radius + 2);
    expect(placeSpatialLabels([ringed], { width: 340, height: 220 }, [], new Map()).get(ringed.id)?.y).toBe(90 + 16 + 7);
  });

  it.each([0, 3])("keeps a name clear of an unnamed ring with priority %i", priority => {
    const context = label("context");
    const ring: SpatialLabelBody = { id: "unnamed", priority, x: 195, y: 120, radius: 25 };
    // The first position clears the ten-pixel sphere but intersects its ring. Its name is absent from the candidates.
    const sphereOnly = placeSpatialLabels([context], { width: 340, height: 220 }, [], new Map(), [{ ...ring, radius: 10 }]);
    expect(sphereOnly.get(context.id)?.side).toBe(0);
    const placed = placeSpatialLabels([context], { width: 340, height: 220 }, [], new Map(), [ring]);
    const box = placed.get(context.id)!;
    expect(box.side).toBe(1);
    const dx = Math.max(box.x, Math.min(ring.x, box.x + box.width)) - ring.x;
    const dy = Math.max(box.y, Math.min(ring.y, box.y + box.height)) - ring.y;
    expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(ring.radius + 2);
    expect(placed.has(ring.id)).toBe(false);
  });

  it("rechecks a remembered side against new visible geometry while preserving its priority rules", () => {
    const context = label("context"), viewport = { width: 340, height: 220 };
    const ring: SpatialLabelBody = { id: "new", priority: 3, x: 195, y: 120, radius: 25 };
    const before = placeSpatialLabels([context], viewport, [], new Map());
    const remembered = new Map([[context.id, before.get(context.id)!.side]]);
    expect(remembered.get(context.id)).toBe(0);
    expect(placeSpatialLabels([context], viewport, [], remembered, [ring]).get(context.id)?.side).toBe(1);
    expect(placeSpatialLabels([context], viewport, [], remembered, [{ ...ring, priority: 5 }]).get(context.id)?.side).toBe(0);
  });

  it("avoids the visible edge of an unnamed ring whose centre is outside the viewport", () => {
    const context = { ...label("near-edge"), x: 63 };
    const ring: SpatialLabelBody = { id: "outside", priority: 3, x: -10, y: 120, radius: 25 };
    const viewport = { width: 340, height: 220 };
    // The text begins at the viewport's eight-pixel inset. The off-screen centre cannot disclose a name, but its
    // outer ring reaches fifteen pixels into the viewport and would meet that text.
    expect(placeSpatialLabels([context], viewport, [], new Map(), [{ ...ring, radius: 10 }]).get(context.id)?.side).toBe(0);
    const box = placeSpatialLabels([context], viewport, [], new Map(), [ring]).get(context.id)!;
    expect(box.side).toBe(1);
    expect(box.x).toBe(8);
    const dx = Math.max(box.x, Math.min(ring.x, box.x + box.width)) - ring.x;
    const dy = Math.max(box.y, Math.min(ring.y, box.y + box.height)) - ring.y;
    expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(ring.radius + 2);
  });

  it("reserves no body at a popped chip's point while keeping its own offset", () => {
    const chip = { ...label("popped", 0), x: 120, y: 120, radius: 60, clear: 0, width: 50, height: 20 };
    const context = label("released");
    const placed = placeSpatialLabels([chip, context], { width: 340, height: 300 }, [], new Map());
    expect(placed.get(chip.id)?.y).toBe(120 + 60 + 7);
    expect(placed.get(context.id)?.side).toBe(0);
    // The released name may cover the chip's old centre, where there is now no visible body.
    const box = placed.get(context.id)!;
    expect(box.y).toBeLessThan(chip.y);
    expect(box.y + box.height).toBeGreaterThan(chip.y);
  });

  it("lays the names of directories popped one inside another apart, each beside the skin it had, and keeps nothing clear of them (third round)", () => {
    // Three popped directories, one inside the next, the centroids of what they released nearly one point and their skins nested.
    const popped = [{ id: "popped:src", radius: 120 }, { id: "popped:src/client", radius: 70 }, { id: "popped:src/client/views", radius: 30 }]
      .map(({ id, radius }, i) => ({ id, priority: 4, x: 400 + i, y: 300 - i, radius, clear: 0, width: 60, height: 24 }));
    const inner = { ...label("shell:src/client/views/localView", 5), x: 400, y: 220, radius: 4 };
    const placed = placeSpatialLabels([...popped, inner], { width: 800, height: 700 }, [], new Map());
    const tops = popped.map(item => placed.get(item.id)!.y);
    // Each below its own skin: the outer one farthest from the point, none on another.
    expect(tops).toEqual([300 + 120 + 7, 299 + 70 + 7, 298 + 30 + 7]);
    // A released shell's own name, less important, may still stand within what they released, beside its sphere.
    expect(placed.get(inner.id)?.side).toBe(0);
    expect(placeSpatialLabels([...popped.map(item => ({ ...item, clear: undefined })), inner], { width: 800, height: 700 }, [], new Map()).get(inner.id)?.side).not.toBe(0);
  });
});
