import { describe, expect, it } from "vitest";

import { DEFAULT_AUTHORED_BLOCK } from "@live-documentation/engine/live-docs/document";
import { GitHubSlugger } from "@live-documentation/engine/tooling/githubSlugger";

import { renderMarkdown } from "./markdown";
import { authoredSections, readerOrder, type AuthoredSection } from "./reader-sections";

const joined = (sections: readonly AuthoredSection[]): string => sections.map(section => section.markdown).join("\n");
const headings = (sections: readonly AuthoredSection[]): Array<string | null> => sections.map(section => section.heading);

/** An authored block shaped like a long one: a Purpose, Notes with a fenced example and subheadings, and a third section. */
const LONG = [
  "### Purpose",
  "Coordinates generation.",
  "",
  "### Notes",
  "- Written on 2025-11-21 ([Turn 3](../ChatHistory/2025-11-21.md#turn-3)).",
  "",
  "#### Purpose",
  "A subheading stays inside its section.",
  "",
  "```markdown",
  "### Not a heading inside a fence",
  "```",
  "~~~",
  "### Nor inside a tilde fence",
  "~~~",
  "## A level-two line is words of the section too",
  "",
  "### Strategy",
  "Last words."
].join("\n");

describe("authoredSections", () => {
  it("cuts the block a new doc starts with into its Purpose and Notes, and loses nothing", () => {
    const sections = authoredSections(DEFAULT_AUTHORED_BLOCK);
    expect(headings(sections)).toEqual(["Purpose", "Notes"]);
    expect(joined(sections)).toBe(DEFAULT_AUTHORED_BLOCK);
  });

  it("cuts only at level-three headings outside fences, each section keeping its words in order", () => {
    const sections = authoredSections(LONG);
    expect(headings(sections)).toEqual(["Purpose", "Notes", "Strategy"]);
    expect(joined(sections)).toBe(LONG);
    expect(sections[1].markdown).toContain("### Not a heading inside a fence");
    expect(sections[1].markdown).toContain("#### Purpose\n");
    expect(sections[1].markdown.endsWith("## A level-two line is words of the section too\n")).toBe(true);
  });

  it("keeps words before the first heading as a section without one, and reads a heading's closing hashes away", () => {
    const text = "An opening line.\n\n### Purpose ###\nWhy.\n### Notes\nWhat.";
    const sections = authoredSections(text);
    expect(headings(sections)).toEqual([null, "Purpose", "Notes"]);
    expect(sections[0].markdown).toBe("An opening line.\n");
    expect(joined(sections)).toBe(text);
    expect(headings(authoredSections("Only words, no heading."))).toEqual([null]);
  });
});

describe("readerOrder", () => {
  it("puts Purpose above the generated facts and every other section after them, in the author's order", () => {
    const order = readerOrder(authoredSections(LONG));
    expect(headings(order.above)).toEqual(["Purpose"]);
    expect(headings(order.below)).toEqual(["Notes", "Strategy"]);
  });

  it("brings Purpose up wherever it was written, knows it in any case, and keeps opening words with it", () => {
    const order = readerOrder(authoredSections("Opening.\n### Notes\nN.\n### PURPOSE\nP.\n### Strategy\nS."));
    expect(headings(order.above)).toEqual([null, "PURPOSE"]);
    expect(headings(order.below)).toEqual(["Notes", "Strategy"]);
    const none = readerOrder(authoredSections("### Notes\nN."));
    expect(none.above).toEqual([]);
    expect(headings(none.below)).toEqual(["Notes"]);
  });

  it("renders, part by part with one slugger, exactly what the whole block renders, so every anchor keeps its id", () => {
    const slugger = new GitHubSlugger();
    const parts = authoredSections(LONG).map(section => renderMarkdown(section.markdown, { slugger }));
    expect(parts.join("\n")).toBe(renderMarkdown(LONG));
    expect(parts[1], "a second Purpose heading is purpose-1, as in the whole").toContain('id="purpose-1"');
    expect(renderMarkdown(authoredSections(LONG)[1].markdown), "a fresh slugger would name it again").toContain('id="purpose"');
  });
});
