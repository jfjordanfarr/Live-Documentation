import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { findSymbolReferenceAnomalies } from "./symbolReferences";

describe("findSymbolReferenceAnomalies", () => {
  it("anchors a heading by its rendered text, so an emphasized suffix or inline code does not change the slug", () => {
    withWorkspace((workspace) => {
      writeFile(
        workspace,
        "docs/log.md",
        [
          "### The Native Views Are the Base _(Recorded 2026-10-03)_",
          "A decision.",
          "### Use `renderLiveDoc` for [docs](guide.md)",
          "Another."
        ].join("\n")
      );
      writeFile(
        workspace,
        "docs/links.md",
        [
          "See [the decision](log.md#the-native-views-are-the-base-recorded-2026-10-03).",
          "And [the other](log.md#use-renderlivedoc-for-docs).",
          "Not [the markdown's own underscores](log.md#the-native-views-are-the-base-_recorded-2026-10-03_)."
        ].join("\n")
      );
      const issues = findSymbolReferenceAnomalies({
        workspaceRoot: workspace,
        files: [path.join(workspace, "docs/log.md"), path.join(workspace, "docs/links.md")]
      });
      expect(issues.map((issue) => `${issue.kind} ${issue.slug}`)).toEqual([
        "missing-anchor the-native-views-are-the-base-_recorded-2026-10-03_"
      ]);
    });
  });

  it("looks an anchor up in a markdown file it was not given, and reports nothing of that file's own", () => {
    withWorkspace((workspace) => {
      // The archive, outside the audit: a real heading, a heading that is only text inside a fence, a dead link of its own.
      writeFile(
        workspace,
        "archive/record.md",
        ["## Turn 8", "``````text", "## The fourth option", "``````", "## Turn 8", "A [dead link](#nowhere)."].join("\n")
      );
      writeFile(workspace, "src/tool.ts", "export const tool = 1;\n");
      writeFile(
        workspace,
        "docs/design.md",
        [
          "See [the turn](../archive/record.md#turn-8).",
          "And [the reply's own heading](../archive/record.md#the-fourth-option).",
          "And [a line of source](../src/tool.ts#L1), and [a file that is not there](../archive/gone.md#turn-1).",
          // A transcript is cited by line: the lines are there, or they are not.
          "And [the owner's turn](../archive/record.md#L2), [a stretch of it](../archive/record.md#L2-L6), [past its end](../archive/record.md#L2-L7)."
        ].join("\n")
      );
      const issues = findSymbolReferenceAnomalies({ workspaceRoot: workspace, files: [path.join(workspace, "docs/design.md")] });
      expect(issues.map((issue) => `${issue.kind} ${issue.slug} ${path.basename(issue.file)}`)).toEqual([
        "missing-anchor the-fourth-option design.md",
        "missing-anchor l2-l7 design.md"
      ]);
    });
  });

  it("flags duplicate headings and missing anchors across markdown files", () => {
    withWorkspace((workspace) => {
      writeFile(
        workspace,
        "docs/guide.md",
        [
          "# Introduction",
          "Some intro text.",
          "# Introduction",
          "## Overview",
          "More details."
        ].join("\n")
      );

      writeFile(
        workspace,
        "docs/links.md",
        [
          "See the [introduction](guide.md#introduction).",
          "Broken [section](guide.md#missing-section).",
          "Another [local missing](#nope).",
          "# Local Section"
        ].join("\n")
      );

      const guide = path.join(workspace, "docs/guide.md");
      const links = path.join(workspace, "docs/links.md");

      const issues = findSymbolReferenceAnomalies({
        workspaceRoot: workspace,
        files: [guide, links]
      });

      expect(issues).toHaveLength(3);

      const duplicate = issues.find((issue) => issue.kind === "duplicate-heading");
      expect(duplicate).toBeDefined();
      expect(duplicate).toMatchObject({
        file: guide,
        slug: "introduction-1",
        severity: "warn"
      });

      const missingGuide = issues.find(
        (issue) => issue.kind === "missing-anchor" && issue.targetFile === guide && issue.slug === "missing-section"
      );
      expect(missingGuide).toBeDefined();

      const missingLocal = issues.find(
        (issue) => issue.kind === "missing-anchor" && issue.file === links && issue.slug === "nope"
      );
      expect(missingLocal).toBeDefined();
    });
  });

  it("honours ignore patterns and rule overrides", () => {
    withWorkspace((workspace) => {
      writeFile(
        workspace,
        "docs/guide.md",
        ["# Intro", "# Intro"].join("\n")
      );

      writeFile(
        workspace,
        "docs/index.md",
        ["Read [intro](guide.md#intro)", "Missing [ignored](guide.md#noise)", "# Index"].join("\n")
      );

      const guide = path.join(workspace, "docs/guide.md");
      const indexDoc = path.join(workspace, "docs/index.md");

      const issues = findSymbolReferenceAnomalies({
        workspaceRoot: workspace,
        files: [guide, indexDoc],
        duplicateHeading: "off",
        ignoreSlugPatterns: [/^noise$/]
      });

      expect(issues).toHaveLength(0);
    });
  });

  it("recognises explicitly defined heading anchors", () => {
    withWorkspace((workspace) => {
      writeFile(
        workspace,
        "docs/guide.md",
        [
          "# Intro {#custom-intro}",
          "## Details {#custom-details}",
          "Guidance."
        ].join("\n")
      );

      writeFile(
        workspace,
        "docs/index.md",
        [
          "See the [intro](guide.md#custom-intro).",
          "Check [details](guide.md#custom-details).",
          "Missing [section](guide.md#missing-anchor).",
          "# Index"
        ].join("\n")
      );

      const guide = path.join(workspace, "docs/guide.md");
      const indexDoc = path.join(workspace, "docs/index.md");

      const issues = findSymbolReferenceAnomalies({
        workspaceRoot: workspace,
        files: [guide, indexDoc]
      });

      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({
        kind: "missing-anchor",
        targetFile: guide,
        slug: "missing-anchor"
      });
    });
  });

  it("ignores headings inside nested code fences with different lengths", () => {
    withWorkspace((workspace) => {
      writeFile(
        workspace,
        "docs/nested.md",
        [
          "# Real Heading",
          "",
          "````markdown",
          "# Fenced Heading",
          "",
          "```bash",
          "echo hello",
          "```",
          "",
          "## Still Fenced",
          "````",
          "",
          "## Another Real Heading"
        ].join("\n")
      );

      const nested = path.join(workspace, "docs/nested.md");

      const issues = findSymbolReferenceAnomalies({
        workspaceRoot: workspace,
        files: [nested]
      });

      // No duplicates — the fenced headings should be invisible
      expect(issues).toHaveLength(0);
    });
  });
});

describe("findSymbolReferenceAnomalies at the edges of GitHub's rendering", () => {
  /**
   * Writes `target` as an unaudited markdown file, links to each fragment from an audited document, and returns the
   * fragments the audit reports missing, in order.
   */
  function missing(target: string, fragments: string[], targetName = "archive/record.md"): string[] {
    let reported: string[] = [];
    withWorkspace((workspace) => {
      writeFile(workspace, targetName, target);
      writeFile(workspace, "docs/design.md", fragments.map((fragment) => `- [link](../${targetName}#${fragment})`).join("\n"));
      reported = findSymbolReferenceAnomalies({ workspaceRoot: workspace, files: [path.join(workspace, "docs/design.md")] })
        .map((issue) => issue.slug);
    });
    return reported;
  }

  it("slugs a heading as GitHub does: a repeated heading's suffix, punctuation, non-ASCII letters, code and emphasis, setext", () => {
    const target = [
      "# Turn 8",
      "# Turn 8",
      "## Café au lait",
      "## What's new? (v2) — notes",
      "## The `inline` and **bold** _emphasis_",
      "Setext Title",
      "============",
      "Second Setext",
      "---"
    ].join("\n");
    expect(
      missing(target, [
        "turn-8",
        "turn-8-1",
        "turn-8-2",
        "Turn-8",
        "café-au-lait",
        "caf%C3%A9-au-lait",
        "whats-new-v2--notes",
        "the-inline-and-bold-emphasis",
        "setext-title",
        "second-setext"
      ])
    ).toEqual(["turn-8-2"]);
  });

  it("finds no heading inside a fence of backticks or tildes, of any length, and a fence closes only on a bare run as long", () => {
    const target = [
      "## Before",
      "``` ts",
      "## In backticks",
      "```ts",
      "## Still in backticks, since a run with words after it does not close",
      "```",
      "~~~~",
      "## In tildes",
      "~~~",
      "## Still in tildes, since a shorter run does not close",
      "~~~~~",
      "```not`a fence",
      "## After",
      "`````",
      "## Never closed, so in code to the end"
    ].join("\n");
    expect(
      missing(target, [
        "before",
        "in-backticks",
        "still-in-backticks-since-a-run-with-words-after-it-does-not-close",
        "in-tildes",
        "still-in-tildes-since-a-shorter-run-does-not-close",
        "after",
        "never-closed-so-in-code-to-the-end"
      ])
    ).toEqual([
      "in-backticks",
      "still-in-backticks-since-a-run-with-words-after-it-does-not-close",
      "in-tildes",
      "still-in-tildes-since-a-shorter-run-does-not-close",
      "never-closed-so-in-code-to-the-end"
    ]);
  });

  it("takes an anchor written in HTML as a target, but not one written inside code", () => {
    const target = [
      '<a id="turn-3"></a>',
      "Some words <a name='old-name'>here</a>.",
      'An example: `<a id="in-a-span">`.',
      "```html",
      '<a id="in-a-fence"></a>',
      "```"
    ].join("\n");
    expect(missing(target, ["turn-3", "old-name", "in-a-span", "in-a-fence"])).toEqual(["in-a-span", "in-a-fence"]);
  });

  it("holds a citation of lines to the lines the file has, with or without a final line break, LF or CRLF", () => {
    const fragments = ["L3", "L4", "L0", "L2C3", "L1C1-L3C2", "L3-L1", "L1-L4", "L12-14"];
    const reported = ["l4", "l0", "l1-l4", "l12-14"];
    expect(missing("a\nb\nc\n", fragments)).toEqual(reported);
    expect(missing("a\nb\nc", fragments)).toEqual(reported);
    expect(missing("a\r\nb\r\nc\r\n", fragments)).toEqual(reported);
    expect(missing("## Turn 1\r\nWords.\r\n## Turn 1\r\n", ["turn-1", "turn-1-1", "L3", "L4"])).toEqual(["l4"]);
  });

  it("decodes a percent-encoded path, and leaves a directory or a file that is not there to the link audit", () => {
    withWorkspace((workspace) => {
      writeFile(workspace, "archive/my notes.md", "## Intro");
      fs.mkdirSync(path.join(workspace, "archive/folder.md"), { recursive: true });
      writeFile(
        workspace,
        "docs/design.md",
        [
          "[encoded](../archive/my%20notes.md#intro), [encoded, missing](../archive/my%20notes.md#outro)",
          "[a directory](../archive/folder.md#intro), [another](../archive/#intro), [not there](../archive/gone.md#intro)"
        ].join("\n")
      );
      const issues = findSymbolReferenceAnomalies({ workspaceRoot: workspace, files: [path.join(workspace, "docs/design.md")] });
      expect(issues.map((issue) => issue.slug)).toEqual(["outro"]);
    });
  });

  it("does not check a link written inside code, which is an example", () => {
    withWorkspace((workspace) => {
      writeFile(workspace, "archive/record.md", "## Turn 1");
      writeFile(
        workspace,
        "docs/design.md",
        [
          "A link in a span: `[x](../archive/record.md#in-a-span)`.",
          "```markdown",
          "[x](../archive/record.md#in-a-fence)",
          "```",
          "[x](../archive/record.md#outside)"
        ].join("\n")
      );
      const issues = findSymbolReferenceAnomalies({ workspaceRoot: workspace, files: [path.join(workspace, "docs/design.md")] });
      expect(issues.map((issue) => `${issue.slug} ${issue.line}`)).toEqual(["outside 5"]);
    });
  });
});

function withWorkspace(callback: (workspace: string) => void): void {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "slopcop-symbols-"));
  try {
    callback(workspace);
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
}

function writeFile(root: string, relative: string, content: string): void {
  const fullPath = path.join(root, relative);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
}
