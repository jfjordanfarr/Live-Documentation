import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  DEFAULT_RULES,
  formatDocumentationLinkComment,
  parseDocumentationAnchors,
  resolveCodeToDocumentationMap,
  runDocumentationLinkEnforcement,
  type DocumentationDocumentAnchors
} from "./documentationLinks";

const FIXTURE_ROOT = path.resolve(
  __dirname,
  "./__fixtures__/documentation-links"
);

interface WorkspaceHandle {
  root: string;
  docPath: string;
  codePath: string;
  cleanup(): void;
}

const workspaces: WorkspaceHandle[] = [];

afterEach(() => {
  while (workspaces.length > 0) {
    const handle = workspaces.pop();
    if (handle) {
      handle.cleanup();
    }
  }
});

describe("documentationLinks", () => {
  it("parses documentation anchors and backlinks", () => {
    const workspace = createWorkspace();
    const parsed = parseDocumentationAnchors(workspace.docPath, {
      workspaceRoot: workspace.root
    });

    expect(parsed.docPath).toBe(workspace.docPath);
    const anchor = parsed.anchors.find((entry) => entry.slug === "source-breadcrumbs");
    expect(anchor).toBeDefined();
    expect(anchor?.codePaths).toContain(workspace.codePath);
    expect(anchor?.backlinks).toContain(workspace.codePath);
  });

  it("resolves code to documentation targets with backlink preference", () => {
    const workspace = createWorkspace();
    const document: DocumentationDocumentAnchors = {
      ...parseDocumentationAnchors(workspace.docPath, { workspaceRoot: workspace.root }),
      rule: DEFAULT_RULES[0]
    };
    const map = resolveCodeToDocumentationMap([document]);

    const target = map.get(workspace.codePath);
    expect(target).toBeDefined();
    expect(target?.docPath).toBe(workspace.docPath);
    expect(target?.slug).toBe("source-breadcrumbs");
    expect(target?.label).toBe(DEFAULT_RULES[0].label);
    expect(target?.hasBacklink).toBe(true);
  });

  it("formats documentation link comments for supported extensions", () => {
    const workspace = createWorkspace();
    const document: DocumentationDocumentAnchors = {
      ...parseDocumentationAnchors(workspace.docPath, { workspaceRoot: workspace.root }),
      rule: DEFAULT_RULES[0]
    };
    const map = resolveCodeToDocumentationMap([document]);
    const target = map.get(workspace.codePath);
    expect(target).toBeDefined();

    const comment = formatDocumentationLinkComment(workspace.codePath, target!);
    expect(comment).toBe(
      `// ${DEFAULT_RULES[0].label}: ${workspace.docPath}#source-breadcrumbs`
    );
  });

  it("detects and optionally fixes missing documentation comments", () => {
    const workspace = createWorkspace();
    const firstPass = runDocumentationLinkEnforcement({
      workspaceRoot: workspace.root
    });

    expect(firstPass.scannedDocuments).toBe(1);
    expect(firstPass.scannedFiles).toBe(1);
    expect(firstPass.fixedFiles).toBe(0);
    expect(firstPass.violations).toHaveLength(1);
  expect(firstPass.violations[0]?.kind).toBe("missing-breadcrumb");

    const secondPass = runDocumentationLinkEnforcement({
      workspaceRoot: workspace.root,
      fix: true
    });

    expect(secondPass.fixedFiles).toBe(1);
    expect(secondPass.violations).toHaveLength(0);

    const codeSource = fs.readFileSync(
      path.join(workspace.root, workspace.codePath),
      "utf8"
    );
    const documentationComment = codeSource
      .split(/\r?\n/)
      .find((line) => line.includes(DEFAULT_RULES[0].label));
    expect(documentationComment).toBe(
      `// ${DEFAULT_RULES[0].label}: ${workspace.docPath}#source-breadcrumbs`
    );
  });
});

function createWorkspace(): WorkspaceHandle {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "documentation-links-"));
  const docPath = ".mdmd/layer-4/tooling/sample-tool.mdmd.md";
  const codePath = "packages/shared/src/tooling/__fixtures__/documentation-links/sample-tool.ts";

  const docAbsolute = path.join(root, docPath);
  fs.mkdirSync(path.dirname(docAbsolute), { recursive: true });
  fs.copyFileSync(path.join(FIXTURE_ROOT, "sample-tool.mdmd.md"), docAbsolute);
  const docSource = fs.readFileSync(docAbsolute, "utf8");
  fs.writeFileSync(
    docAbsolute,
    docSource.replaceAll(
      "./sample-tool.ts",
      "../../../packages/shared/src/tooling/__fixtures__/documentation-links/sample-tool.ts"
    )
  );

  const codeAbsolute = path.join(root, codePath);
  fs.mkdirSync(path.dirname(codeAbsolute), { recursive: true });
  fs.writeFileSync(codeAbsolute, "// header\nexport function sampleTool() {}\n");

  const handle: WorkspaceHandle = {
    root,
    docPath,
    codePath,
    cleanup() {
      fs.rmSync(root, { recursive: true, force: true });
    }
  };

  workspaces.push(handle);
  return handle;
}
