import { describe, expect, it } from "vitest";

import { differencesBetween, heldToLedger, type LedgerEntry, type MultipleReadEntry, readMoreThanOnce, readsHeldToLedger } from "./compare";

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

describe("the files a scan reads more than once, held to the ledger", () => {
  const entry: MultipleReadEntry = { fixture: "f", file: ".live-documentation/source/a.ts.md", times: 2, why: "" };

  it("are the files read more than once, in path order", () => {
    expect(readMoreThanOnce({ "b.cs": 1, "z.ts": 3, "a.ts": 2 })).toEqual([{ file: "a.ts", times: 2 }, { file: "z.ts", times: 3 }]);
    expect(readMoreThanOnce({ "a.ts": 1 })).toEqual([]);
  });

  it("pass a file the ledger lists for its fixture, at the count it lists", () => {
    expect(readsHeldToLedger("f", [{ file: entry.file, times: 2 }], [entry])).toEqual({ unlisted: [], gone: [] });
  });

  it("fail a file it does not list, one read more often than it lists, and an entry no longer found", () => {
    expect(readsHeldToLedger("f", [{ file: "src/a.cs", times: 2 }], [entry])).toEqual({ unlisted: [{ file: "src/a.cs", times: 2 }], gone: [entry] });
    expect(readsHeldToLedger("f", [{ file: entry.file, times: 3 }], [entry])).toEqual({ unlisted: [{ file: entry.file, times: 3 }], gone: [entry] });
    expect(readsHeldToLedger("g", [{ file: entry.file, times: 2 }], [entry])).toEqual({ unlisted: [{ file: entry.file, times: 2 }], gone: [] });
  });
});
