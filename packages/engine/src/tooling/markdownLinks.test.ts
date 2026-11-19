import { describe, expect, it } from "vitest";

import { namedCharacterReference } from "./htmlEntities";
import { inlineTokens, linkPath, readingSteps, readMarkdownLinks } from "./markdownLinks";

const destinations = (document: string): string[] => readMarkdownLinks(document).links.map((link) => link.destination);

describe("the blocks that decide whether a link is one", () => {
  it("reads no link in a fenced block, closed only by a fence of its own character at least as long with nothing after it", () => {
    const document = [
      "[before](a.md)",
      "````md",
      "[fenced](no.md)",
      "```ts",
      "[still fenced](no.md)",
      "````",
      "~~~",
      "[tilde fenced](no.md)",
      "~~~~",
      "   ```",
      "[indented fence](no.md)",
      "   ```",
      "[after](b.md)",
      "```",
      "[an unclosed fence runs to the end](no.md)"
    ].join("\n");
    expect(destinations(document)).toEqual(["a.md", "b.md"]);
  });

  it("reads a link across the lines of a paragraph, and in headings, list items and block quotes", () => {
    const document = [
      "# The [heading](h.md)",
      "A [link whose text",
      "wraps](wrapped.md) and one whose title is on the next line [t](t.md",
      "  \"the title\").",
      "- [an item](item.md)",
      "    - [a nested item](nested.md)",
      "> [quoted](quoted.md \"a",
      "> title\")",
      "1. [numbered](numbered.md)"
    ].join("\n");
    expect(readMarkdownLinks(document).links.map((link) => [link.destination, link.title])).toEqual([
      ["h.md", undefined], ["wrapped.md", undefined], ["t.md", "the title"], ["item.md", undefined],
      ["nested.md", undefined], ["quoted.md", "a\ntitle"], ["numbered.md", undefined]
    ]);
  });

  it("ends a paragraph at a blank line, a heading, a thematic break and a list item, so that no link spans one", () => {
    for (const between of ["", "# heading", "---", "***", "- item", "==="]) {
      expect(destinations(`[a\n${between}\nb](no.md)`)).toEqual([]);
    }
  });

  it("reads a document with CRLF line endings as one with LF", () => {
    const lf = "[a](a.md \"t\nu\")\n```\n[b](b.md)\n```\n[c]: c.md\n\n[c]";
    expect(readMarkdownLinks(lf.replace(/\n/gu, "\r\n")).links.map(({ destination, title }) => [destination, title]))
      .toEqual(readMarkdownLinks(lf).links.map(({ destination, title }) => [destination, title]));
  });

  it("differs from CommonMark where the module says: an indented code block and an HTML block are read as text", () => {
    expect(destinations("Text\n\n    [indented](read.md)\n\n<div>\n[in a block](read.md)\n</div>")).toEqual(["read.md", "read.md"]);
  });

  it("gives each link's offsets in the document, so that an audit can say where it stands", () => {
    const document = "One\r\n\r\nSee ![an image](i.png) in [a link](l.md).";
    const [image, link] = readMarkdownLinks(document).links;
    expect(document.slice(image.start, image.end)).toBe("![an image](i.png)");
    expect(document.slice(image.textStart, image.textEnd)).toBe("an image");
    expect(document.slice(link.start, link.end)).toBe("[a link](l.md)");
    const crlf = "[a](b.md)\r\nx [c][zz]\r\n";
    const reading = readMarkdownLinks(crlf);
    expect(crlf.slice(reading.links[0].start, reading.links[0].end)).toBe("[a](b.md)");
    expect(crlf.slice(reading.unresolved[0].start, reading.unresolved[0].end)).toBe("[c][zz]");
  });
});

describe("references", () => {
  it("takes a reference's destination from the first definition of its label, wherever it stands, and reports a label none defines", () => {
    const document = [
      "[full][Plan], [collapsed][], [shortcut] and [missing][nowhere], [also missing][].",
      "",
      "[plan]: docs/plan.md \"The plan\"",
      "[collapsed]: <docs/a b.md>",
      "[shortcut]:",
      "  docs/c.md",
      "[plan]: docs/second.md"
    ].join("\n");
    const reading = readMarkdownLinks(document);
    expect(reading.links.map((link) => [link.kind, link.destination, link.title])).toEqual([
      ["reference", "docs/plan.md", "The plan"], ["reference", "docs/a b.md", undefined], ["reference", "docs/c.md", undefined]
    ]);
    expect(reading.unresolved.map(({ label, start, end }) => [label, document.slice(start, end)])).toEqual([
      ["nowhere", "[missing][nowhere]"], ["also missing", "[also missing][]"]
    ]);
  });

  it("reads a definition only where a paragraph begins, never in its middle", () => {
    expect(destinations("Some text\n[plan]: docs/plan.md\n\n[plan]")).toEqual([]);
  });
});

describe("inline text", () => {
  it("gives what claims characters before a link, in order, with what each stands for", () => {
    expect(inlineTokens("`a](b)` \\* &amp; <span>[x](<y z>)</span> <https://e.test>").map(({ kind, start, end, ...rest }) => [kind, start, end, "text" in rest ? rest.text : rest.destination]))
      .toEqual([
        ["code", 0, 7, "a](b)"], ["escape", 8, 10, "*"], ["reference-character", 11, 16, "&"], ["html", 17, 23, "<span>"],
        ["inline", 23, 33, "y z"], ["html", 33, 40, "</span>"], ["autolink", 41, 57, "https://e.test"]
      ]);
  });
});

/** Paragraphs built to make a reader read the same characters again and again, each of about `size` characters. */
export const HOSTILE: Record<string, (size: number) => string> = {
  "a run of unclosed destinations, [a](": (size) => "[a](".repeat(size / 4),
  "destinations with balanced parentheses and no closer": (size) => "[a](()()()".repeat(size / 10),
  "unclosed comments": (size) => "<!-- ".repeat(size / 5),
  "unclosed processing instructions": (size) => "<? ".repeat(size / 3),
  "unclosed declarations": (size) => "<!a ".repeat(size / 4),
  "unclosed CDATA sections": (size) => "<![CDATA[ ".repeat(size / 10),
  "many images": (size) => "![a](b) ".repeat(size / 8),
  "unmatched openers, then links": (size) => "[".repeat(size / 7) + "[a](b)".repeat(size / 7),
  "backtick runs of every length": (size) => {
    let text = "";
    for (let length = 1; text.length < size; length += 1) text += `${"`".repeat(length)} `;
    return text;
  },
  "unclosed titles": (size) => "[a](b \"x ".repeat(size / 9)
};

/** The steps a reading takes, counted by the module. */
export function stepsOf(read: () => unknown, counter: { count: number }): number {
  const before = counter.count;
  read();
  return counter.count - before;
}

describe("the work of reading", () => {
  // Counted, not timed, since a busy machine makes any time limit a coin toss.
  for (const [name, paragraph] of Object.entries(HOSTILE)) {
    it(`grows with the text, not with its square: ${name}`, () => {
      const small = stepsOf(() => readMarkdownLinks(paragraph(2_000)), readingSteps);
      const large = stepsOf(() => readMarkdownLinks(paragraph(20_000)), readingSteps);
      expect(small).toBeGreaterThan(0);
      expect(large / small, `${small} steps, then ${large} for ten times the text`).toBeLessThan(12);
    });
  }
});

describe("linkPath", () => {
  it("reads a path as a browser reads a URL reference: fragment, then query, set apart before percent-decoding", () => {
    expect(linkPath("notes/plan%20%28draft%29.md#open-questions")).toEqual({ path: "notes/plan (draft).md", fragment: "open-questions" });
    expect(linkPath("a%23b.md#top")).toEqual({ path: "a#b.md", fragment: "top" });
    expect(linkPath("c%3Fd.md?plain=1")).toEqual({ path: "c?d.md" });
    expect(linkPath("#only-a-fragment")).toEqual({ path: "", fragment: "only-a-fragment" });
    expect(linkPath("100%.md")).toEqual({ path: "100%.md" });
  });
});

describe("HTML's named character references", () => {
  it("are all here, each with its semicolon, one or two code points", () => {
    expect(namedCharacterReference("auml")).toBe("ä");
    expect(namedCharacterReference("NotEqualTilde")).toBe("≂̸");
    expect(namedCharacterReference("ClockwiseContourIntegral")).toBe("∲");
    expect(namedCharacterReference("bogus")).toBeUndefined();
  });
});
