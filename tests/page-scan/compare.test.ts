import { describe, expect, it } from "vitest";

import { differencesBetween, heldToLedger, type LedgerEntry } from "./compare";

/** The comparison of the page's output with Node's, and the ledger that can only shrink truthfully. */

describe("the comparison of what the page and Node wrote", () => {
  it("finds nothing where every file is the same", () => {
    expect(differencesBetween({ "a.md": "x\ny" }, { "a.md": "x\ny" })).toEqual([]);
  });

  it("names a file written by one side alone, and a file that differs by its first differing line and the count of lines", () => {
    expect(differencesBetween({ "a.md": "x\ny\nz", "b.md": "" }, { "a.md": "x\nY\nZ", "c.md": "" })).toEqual([
      { file: "a.md", kind: "differs", first: { line: 2, page: "y", node: "Y" }, lines: 2 },
      { file: "b.md", kind: "only in the page" },
      { file: "c.md", kind: "only under Node" }
    ]);
  });
});

describe("the ledger of differences", () => {
  const entry: LedgerEntry = { fixture: "f", file: "a.md", kind: "differs", first: { line: 2, page: "y", node: "Y" }, lines: 1, what: "", cause: "" };

  it("passes a difference it lists, for its own fixture only", () => {
    expect(heldToLedger("f", [{ file: "a.md", kind: "differs", first: { line: 2, page: "y", node: "Y" }, lines: 1 }], [entry])).toEqual({ unlisted: [], gone: [] });
  });

  it("fails a difference it does not list, and one it lists that now differs otherwise", () => {
    const otherwise = { file: "a.md", kind: "differs" as const, first: { line: 3, page: "z", node: "Z" }, lines: 1 };
    expect(heldToLedger("f", [otherwise], [entry])).toEqual({ unlisted: [otherwise], gone: [entry] });
  });

  it("fails an entry that no longer occurs, so that the ledger can only shrink truthfully", () => {
    expect(heldToLedger("f", [], [entry])).toEqual({ unlisted: [], gone: [entry] });
    expect(heldToLedger("g", [], [entry])).toEqual({ unlisted: [], gone: [] });
  });
});
