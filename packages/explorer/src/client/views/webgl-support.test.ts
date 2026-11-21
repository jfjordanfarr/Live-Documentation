import { describe, expect, it } from "vitest";

import { drawsWebgl, perspectiveRemembered, perspectiveShown, type CanvasSource } from "./webgl-support";

/** A canvas that answers the context request as told, recording what it was asked and whether the context was let go. */
function canvasThat(answer: "gives" | "refuses" | "throws"): { source: CanvasSource; asked: Array<[string, unknown]>; released: () => boolean } {
  const asked: Array<[string, unknown]> = [];
  let released = false;
  const context = { getExtension: (name: string) => name === "WEBGL_lose_context" ? { loseContext: () => { released = true; } } : null };
  const source: CanvasSource = () => ({
    getContext: ((kind: string, attributes?: unknown) => {
      asked.push([kind, attributes]);
      if (answer === "throws") throw new Error("refused");
      return answer === "gives" ? context : null;
    }) as HTMLCanvasElement["getContext"]
  });
  return { source, asked, released: () => released };
}

describe("drawsWebgl", () => {
  it("asks for the WebGL 2 context the 3D renderer asks for, and lets it go at once", () => {
    const canvas = canvasThat("gives");
    expect(drawsWebgl(canvas.source)).toBe(true);
    expect(canvas.asked).toEqual([["webgl2", { antialias: true, alpha: true }]]);
    expect(canvas.released()).toBe(true);
  });

  it("is a no where the browser answers with no context", () => {
    expect(drawsWebgl(canvasThat("refuses").source)).toBe(false);
  });

  it("is a no where asking throws", () => {
    expect(drawsWebgl(canvasThat("throws").source)).toBe(false);
  });
});

describe("perspectiveShown", () => {
  it("shows what was asked where both can be drawn", () => {
    expect(perspectiveShown("3d", true)).toBe("3d");
    expect(perspectiveShown("2d", true)).toBe("2d");
  });

  it("shows 2D for a request of 3D where 3D cannot be drawn", () => {
    expect(perspectiveShown("3d", false)).toBe("2d");
    expect(perspectiveShown("2d", false)).toBe("2d");
  });
});

describe("perspectiveRemembered", () => {
  it("remembers what is shown where both can be drawn", () => {
    expect(perspectiveRemembered("2d", "3d", true)).toBe("2d");
    expect(perspectiveRemembered("3d", "2d", true)).toBe("3d");
  });

  it("leaves a remembered 3D alone where 3D cannot be drawn", () => {
    expect(perspectiveRemembered("2d", "3d", false)).toBe("3d");
  });

  it("remembers what is shown where nothing was remembered before", () => {
    expect(perspectiveRemembered("2d", undefined, false)).toBe("2d");
  });
});
