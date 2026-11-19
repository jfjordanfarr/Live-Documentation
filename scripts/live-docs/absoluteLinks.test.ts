import { describe, expect, it } from "vitest";

import { absoluteLinks } from "./absoluteLinks";

describe("absoluteLinks", () => {
  it("names a doc's links to the web and to a drive, read by the markdown link rule", () => {
    const doc = [
      "See [the site](https://example.com/a(b)) and [a page](<http://example.com/a b> \"t\") and [a drive](C:\\notes\\plan.md).",
      "And [ref][site].",
      "",
      "[site]: https://example.com/ref"
    ].join("\n");
    expect(absoluteLinks(doc)).toEqual([
      { target: "https://example.com/a(b)", kind: "web" },
      { target: "http://example.com/a b", kind: "web" },
      { target: "C:\\notes\\plan.md", kind: "drive" },
      { target: "https://example.com/ref", kind: "web" }
    ]);
  });

  it("names nothing that only describes a link: a code span, a fenced block, an autolink, a relative link", () => {
    const doc = [
      "A sentence about `[x](https://example.com)` and ``[y](C:\\z.md)``, an autolink <https://example.com> and [a doc](../a.md).",
      "```md",
      "[fenced](https://example.com)",
      "```"
    ].join("\n");
    expect(absoluteLinks(doc)).toEqual([]);
  });
});
