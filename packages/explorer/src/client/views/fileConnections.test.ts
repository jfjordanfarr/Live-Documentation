import { expect, it } from "vitest";

import { fileConnections } from "./fileConnections";

it("collapses parallel and reciprocal references without mutating canonical links", () => {
  const links = [
    { source: "a", target: "b", kind: "reference" },
    { source: "a", target: "b", kind: "reference" },
    { source: "b", target: "a", kind: "reference" },
    { source: "a", target: "a", kind: "reference" },
    { source: "related:guide", target: "a", kind: "related-doc" }
  ];
  const before = JSON.stringify(links);
  expect(fileConnections(links)).toEqual([
    { source: "a", target: "b", kind: "reference", count: 3 },
    { source: "a", target: "related:guide", kind: "related-doc", count: 1 }
  ]);
  expect(JSON.stringify(links)).toBe(before);
});
