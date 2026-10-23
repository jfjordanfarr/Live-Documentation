import { describe, expect, it } from "vitest";

import { placeSpatialLabels, type SpatialLabel } from "./forceGraphLabels";

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
});
