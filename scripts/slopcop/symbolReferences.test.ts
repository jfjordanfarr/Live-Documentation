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
