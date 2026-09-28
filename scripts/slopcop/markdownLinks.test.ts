import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, afterEach } from "vitest";

import { findBrokenMarkdownLinks } from "./markdownLinks";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("markdown link audit", () => {
  it("detects broken inline links", () => {
    const workspace = createWorkspace();
    const docsDir = path.join(workspace, "docs");
    mkdirSync(docsDir, { recursive: true });

    writeFileSync(path.join(docsDir, "existing.md"), "# ok\n");

    const docPath = path.join(docsDir, "index.md");
    writeFileSync(
      docPath,
      [
        "[Working](existing.md)",
        "[Broken](missing.md)",
        "![Image](images/missing.png)"
      ].join("\n")
    );

    const issues = findBrokenMarkdownLinks(docPath, { workspaceRoot: workspace });

    expect(issues).toHaveLength(2);
    expect(issues.map(issue => issue.target)).toEqual([
      "missing.md",
      "images/missing.png"
    ]);
  });

  it("ignores external and anchor links", () => {
    const workspace = createWorkspace();
    const docPath = path.join(workspace, "README.md");
    writeFileSync(
      docPath,
      [
        "[External](https://example.com)",
        "[Anchor](#section)",
        "<https://github.com>",
        "mailto:links are fine"
      ].join("\n")
    );

    const issues = findBrokenMarkdownLinks(docPath, { workspaceRoot: workspace });

    expect(issues).toHaveLength(0);
  });

  it("resolves reference links and detects missing definitions", () => {
    const workspace = createWorkspace();
    const docPath = path.join(workspace, "guide.md");
    writeFileSync(path.join(workspace, "target.md"), "content");

    writeFileSync(
      docPath,
      [
        "[Valid][target]",
        "[Missing][absent]",
        "[NoDef][nodef]",
        "",
        "[target]: target.md",
        "[absent]: missing.md"
      ].join("\n")
    );

    const issues = findBrokenMarkdownLinks(docPath, { workspaceRoot: workspace });

    expect(issues).toHaveLength(2);
    expect(issues.map(issue => issue.target)).toEqual(["missing.md", "nodef"]);
  });

  it("handles workspace-root absolute paths", () => {
    const workspace = createWorkspace();
    const docPath = path.join(workspace, "docs", "overview.md");
    mkdirSync(path.dirname(docPath), { recursive: true });
    mkdirSync(path.join(workspace, "docs"), { recursive: true });
    writeFileSync(path.join(workspace, "README.md"), "root");
    writeFileSync(docPath, "[Root](/README.md)\n[Missing](/docs/absent.md)");

    const issues = findBrokenMarkdownLinks(docPath, { workspaceRoot: workspace });

    expect(issues).toHaveLength(1);
    expect(issues[0].target).toBe("/docs/absent.md");
  });

  it("ignores angle-bracket generics that are not autolinks", () => {
    const workspace = createWorkspace();
    const docPath = path.join(workspace, "README.md");
    writeFileSync(docPath, "Promise<void> and Result<Error> should not count as links");

    const issues = findBrokenMarkdownLinks(docPath, { workspaceRoot: workspace });

    expect(issues).toHaveLength(0);
  });

  it("applies ignore target patterns", () => {
    const workspace = createWorkspace();
    const docPath = path.join(workspace, "docs.md");
    writeFileSync(docPath, "[Ignore me](ghost.md)\n[Flag me](missing.md)");

    const ignorePattern = [/ghost\.md$/];
    const issues = findBrokenMarkdownLinks(docPath, {
      workspaceRoot: workspace,
      ignoreTargetPatterns: ignorePattern
    });

    expect(issues).toHaveLength(1);
    expect(issues[0].target).toBe("missing.md");
  });
});

function createWorkspace(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "slopcop-"));
  tempDirs.push(dir);
  return dir;
}
