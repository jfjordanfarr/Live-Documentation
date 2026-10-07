import { describe, expect, it } from "vitest";

import { fragmentsOf } from "./signals";

const file = (path: string): { codeRelativePath: string } => ({ codeRelativePath: path });

describe("the directories' fragments", () => {
  it("counts the runs beyond the first that each directory's cards form in a column", () => {
    // Directories together: nothing. x split around a y: one. Two directories each split: two. Across columns: summed.
    expect(fragmentsOf([[file("a/x/1"), file("a/x/2"), file("a/y/3")]])).toBe(0);
    expect(fragmentsOf([[file("a/x/1"), file("a/y/3"), file("a/x/2")]])).toBe(1);
    expect(fragmentsOf([[file("a/x/1"), file("a/y/3"), file("a/x/2"), file("a/y/4")]])).toBe(2);
    expect(fragmentsOf([[file("a/x/1"), file("a/y/3"), file("a/x/2")], [file("b/1"), file("c/2"), file("b/3")]])).toBe(2);
    expect(fragmentsOf([])).toBe(0);
    // Files at the root share the "" directory.
    expect(fragmentsOf([[file("1"), file("a/2"), file("3")]])).toBe(1);
  });
});
