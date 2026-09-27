import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { findBrokenAssetReferences } from "./assetPaths";

describe("findBrokenAssetReferences", () => {
  it("flags missing assets referenced from HTML", () => {
    withWorkspace((workspace) => {
      writeFile(
        workspace,
        "docs/index.html",
        [
          "<html>",
          "  <body>",
          "    <img src=\"../images/existing.png\" />",
          "    <img src=\"../images/missing.png\" />",
          "  </body>",
          "</html>"
        ].join("\n")
      );
      writeFile(workspace, "images/existing.png", "");

      const issues = findBrokenAssetReferences(path.join(workspace, "docs/index.html"), {
        workspaceRoot: workspace
      });

      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({
        target: "../images/missing.png",
        attribute: "src",
        line: 4
      });
    });
  });

  it("resolves absolute paths against the workspace and configured asset roots", () => {
    withWorkspace((workspace) => {
      writeFile(
        workspace,
        "docs/home.html",
        "<img src=\"/images/banner.png\" />\n<img src=\"/images/gallery.png\" />"
      );
      writeFile(path.join(workspace, "public"), "images/banner.png", "");

      const issues = findBrokenAssetReferences(path.join(workspace, "docs/home.html"), {
        workspaceRoot: workspace,
        assetRootDirectories: [path.join(workspace, "public")]
      });

      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({
        target: "/images/gallery.png",
        attribute: "src"
      });
    });
  });

  it("ignores external and data URIs", () => {
    withWorkspace((workspace) => {
      writeFile(
        workspace,
        "docs/external.html",
        [
          "<img src=\"https://example.com/logo.png\" />",
          "<img src=\"data:image/png;base64,AAAA\" />",
          "<img src=\"//cdn.example.com/logo.png\" />"
        ].join("\n")
      );

      const issues = findBrokenAssetReferences(path.join(workspace, "docs/external.html"), {
        workspaceRoot: workspace
      });

      expect(issues).toHaveLength(0);
    });
  });

  it("detects missing CSS url() references", () => {
    withWorkspace((workspace) => {
      writeFile(
        workspace,
        "styles/site.css",
        [
          "body {",
          "  background-image: url(../images/background.png);",
          "  mask: url('https://example.com/mask.svg');",
          "  border-image: url(../images/existing.png);",
          "}"
        ].join("\n")
      );
      writeFile(workspace, "images/existing.png", "");

      const issues = findBrokenAssetReferences(path.join(workspace, "styles/site.css"), {
        workspaceRoot: workspace
      });

      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({
        target: "../images/background.png",
        attribute: "url",
        line: 2
      });
    });
  });

  it("honours ignore patterns", () => {
    withWorkspace((workspace) => {
      writeFile(
        workspace,
        "docs/ignore.html",
        "<img src=\"/static/placeholder.png\" />"
      );

      const issues = findBrokenAssetReferences(path.join(workspace, "docs/ignore.html"), {
        workspaceRoot: workspace,
        ignoreTargetPatterns: [/placeholder\.png$/]
      });

      expect(issues).toHaveLength(0);
    });
  });

  it("supports hashed filename ignore patterns", () => {
    withWorkspace((workspace) => {
      writeFile(
        workspace,
        "docs/app.html",
        "<script src=\"/scripts/app.1234abcd5678ef00.js\"></script>"
      );

      const issues = findBrokenAssetReferences(path.join(workspace, "docs/app.html"), {
        workspaceRoot: workspace,
        ignoreTargetPatterns: [/\.[a-f0-9]{8,}\.[a-z0-9]+$/i]
      });

      expect(issues).toHaveLength(0);
    });
  });

  it("captures missing stylesheet href references", () => {
    withWorkspace((workspace) => {
      writeFile(
        workspace,
        "docs/layout.html",
        [
          "<html>",
          "  <head>",
          "    <link rel=\"stylesheet\" href=\"/styles/site.css\" />",
          "    <link rel=\"stylesheet\" href=\"/styles/missing.css\" />",
          "  </head>",
          "</html>"
        ].join("\n")
      );
      writeFile(path.join(workspace, "styles"), "site.css", "body {}\n");

      const issues = findBrokenAssetReferences(path.join(workspace, "docs/layout.html"), {
        workspaceRoot: workspace
      });

      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({
        target: "/styles/missing.css",
        attribute: "href",
        line: 4
      });
    });
  });
});

function withWorkspace(callback: (workspace: string) => void): void {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "slopcop-assets-"));
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
