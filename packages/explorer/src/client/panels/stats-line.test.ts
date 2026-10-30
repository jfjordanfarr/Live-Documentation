import { describe, expect, it } from "vitest";

import { statsLineOf } from "./stats-line";

describe("statsLineOf", () => {
  it("prints the files, the documented references rather than the links, and the dependencies outside the scan, with separators", () => {
    expect(statsLineOf({ nodes: 885, links: 4622, references: 4651, dependenciesOutsideScan: 854 }))
      .toBe(`885 files, ${(4651).toLocaleString()} references, 854 dependencies outside the scan`);
    expect(statsLineOf({ nodes: 12000, links: 1, references: 3, dependenciesOutsideScan: 0 }))
      .toBe(`${(12000).toLocaleString()} files, 3 references, 0 dependencies outside the scan`);
  });

  it("leaves the dependencies out where they are not known, as at a moment of the history", () => {
    expect(statsLineOf({ nodes: 3, links: 3, references: 4 })).toBe("3 files, 4 references");
  });
});
