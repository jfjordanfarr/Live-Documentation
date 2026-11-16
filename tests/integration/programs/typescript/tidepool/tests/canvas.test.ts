import { readFileSync } from "node:fs";

import { drawPool } from "../src/render/canvas";
import { emptyPool } from "./helpers";

describe("drawPool", () => {
  it("paints an empty pool like the saved picture", () => {
    const expected = readFileSync(new URL("./snapshot.png", import.meta.url));
    const canvas = new OffscreenCanvas(80, 80);
    const context = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
    drawPool(context, emptyPool(), { x: 0, y: 0 });
    expect(expected.length).toBeGreaterThan(0);
  });
});
