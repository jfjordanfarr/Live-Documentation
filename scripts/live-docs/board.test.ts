/**
 * The board report's `--files` lists (2026-11-22, after the parity probe found a wire's evidence and a thing's files
 * only in the World Map's panels): each list is cut at {@link LISTED} with the number left out said.
 */
import { describe, expect, it } from "vitest";

import type { BoardGraph } from "@live-documentation/engine/live-docs/boardGraph";

import { LISTED, renderBoardReport } from "./board";

const files = Array.from({ length: LISTED + 5 }, (_, index) => `big/file${String(index).padStart(2, "0")}.ts`);
const derived = {
  things: [{ thing: { name: "big", kind: "service", holds: [] }, folder: "big", files, doors: [], standsOn: [], ghosts: [] }],
  wires: [{ from: "big", to: "small", basis: "source", edges: LISTED + 1,
    lines: Array.from({ length: LISTED + 1 }, (_, index) => ({ from: `big/file${String(index).padStart(2, "0")}.ts`, to: "small/a.ts", label: "a" })) }],
  issues: []
} as unknown as BoardGraph;

describe("renderBoardReport with files", () => {
  it("lists a thing's files and a wire's edges, each at most LISTED, and counts the rest", () => {
    const lines = renderBoardReport("board.md", "A board", [""], derived, [], true);
    expect(lines).toContain(`    files (${LISTED + 5}):`);
    expect(lines).toContain("      big/file00.ts uses small/a.ts (a)");
    expect(lines).toContain("      … and 5 more, not listed");
    expect(lines).toContain("      … and 1 more, not listed");
    expect(lines.filter((line) => line.startsWith("      big/file")).length).toBe(LISTED * 2);
  });

  it("lists neither without it", () => {
    const lines = renderBoardReport("board.md", "A board", [""], derived, []);
    expect(lines.some((line) => line.startsWith("    files"))).toBe(false);
    expect(lines.some((line) => line.includes(" uses "))).toBe(false);
  });
});
