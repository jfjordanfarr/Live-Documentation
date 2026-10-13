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

it("sums documented multiplicity after endpoint aggregation, including reciprocal references", () => {
  expect(fileConnections([
    { source: "a", target: "b", kind: "dependency", referenceCount: 4 },
    { source: "b", target: "a", kind: "type-reference", referenceCount: 2 },
    { source: "b", target: "c", kind: "dependency" }
  ])).toEqual([
    { source: "a", target: "b", kind: "dependency", count: 6 },
    { source: "b", target: "c", kind: "dependency", count: 1 }
  ]);
});
