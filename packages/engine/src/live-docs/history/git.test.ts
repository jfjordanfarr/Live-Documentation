import { describe, expect, it } from "vitest";

import { parseMainline, parseNameStatus, parseTags } from "./git";

describe("parseMainline", () => {
  it("reads each record after rev-list's commit line, a subject with spaces and an author with a comma included", () => {
    const output = [
      "commit 1111",
      "\u001e1111\u001f\u001f2026-01-05T10:00:00+00:00\u001fFarr, Jordan\u001fBegin with a core",
      "commit 2222",
      "\u001e2222\u001f1111\u001f2026-01-06T10:00:00+02:00\u001fAda\u001fMerge: two parents",
      "commit 3333",
      "\u001e3333\u001f2222 9999\u001f2026-01-07T10:00:00Z\u001fAda\u001f",
      ""
    ].join("\n");
    expect(parseMainline(output)).toEqual([
      { id: "1111", parents: [], date: "2026-01-05T10:00:00+00:00", author: "Farr, Jordan", subject: "Begin with a core" },
      { id: "2222", parents: ["1111"], date: "2026-01-06T10:00:00+02:00", author: "Ada", subject: "Merge: two parents" },
      { id: "3333", parents: ["2222", "9999"], date: "2026-01-07T10:00:00Z", author: "Ada", subject: "" }
    ]);
    expect(parseMainline("")).toEqual([]);
  });
});

describe("parseNameStatus", () => {
  it("reads renames and in-place changes from the NUL-separated listing, a path with a tab or a newline included", () => {
    const output = ["M", "src/a.ts", "R087", "src/old\tname.ts", "src/new.ts", "A", "src/born.ts", "D", "src/dead.ts", "T", "bin/tool", "C075", "x.ts", "y.ts", "M", "doc\nwith newline.md", ""].join("\0");
    expect(parseNameStatus(output)).toEqual({
      renamed: [["src/old\tname.ts", "src/new.ts"]],
      modified: ["src/a.ts", "bin/tool", "doc\nwith newline.md"]
    });
    expect(parseNameStatus("")).toEqual({ renamed: [], modified: [] });
  });
});

describe("parseTags", () => {
  it("names an annotated tag's peeled commit and a light tag's own", () => {
    expect([...parseTags("aaaa bbbb\ncccc \n\n")]).toEqual(["bbbb", "cccc"]);
  });
});
