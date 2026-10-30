import { expect, it } from "vitest";

import { fileConnections } from "./fileConnections";

it("collapses parallel and reciprocal references to one pair that remembers its directions, without mutating canonical links", () => {
  const links = [
    { source: "a", target: "b", kind: "reference" },
    { source: "a", target: "b", kind: "reference" },
    { source: "b", target: "a", kind: "reference" },
    { source: "a", target: "a", kind: "reference" },
    { source: "related:guide", target: "a", kind: "related-doc" }
  ];
  const before = JSON.stringify(links);
  expect(fileConnections(links)).toEqual([
    // a uses b twice, b uses a once: one pair, in path order, each direction counted.
    { source: "a", target: "b", kind: "reference", count: 3, forward: 2, backward: 1 },
    // The pair's endpoints stand in path order whichever way the reference ran: the document uses the file.
    { source: "a", target: "related:guide", kind: "related-doc", count: 1, forward: 0, backward: 1 }
  ]);
  expect(JSON.stringify(links)).toBe(before);
});

it("sums documented multiplicity after endpoint aggregation, including reciprocal references, direction by direction", () => {
  expect(fileConnections([
    { source: "a", target: "b", kind: "dependency", referenceCount: 4 },
    { source: "b", target: "a", kind: "type-reference", referenceCount: 2 },
    { source: "b", target: "c", kind: "dependency" }
  ])).toEqual([
    { source: "a", target: "b", kind: "dependency", count: 6, forward: 4, backward: 2 },
    { source: "b", target: "c", kind: "dependency", count: 1, forward: 1, backward: 0 }
  ]);
});

it("counts a one-way pair as forward or backward by where its user stands in path order", () => {
  expect(fileConnections([{ source: "z", target: "a", kind: "dependency", referenceCount: 3 }]))
    .toEqual([{ source: "a", target: "z", kind: "dependency", count: 3, forward: 0, backward: 3 }]);
});
