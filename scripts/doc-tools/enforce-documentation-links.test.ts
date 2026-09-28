import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_RULES } from "./documentationLinks";
import { runCli, EXIT_CODES } from "./enforce-documentation-links";

interface WorkspaceHandle {
  root: string;
  docPath: string;
  codePath: string;
  cleanup(): void;
}

const workspaces: WorkspaceHandle[] = [];

afterEach(() => {
  while (workspaces.length > 0) {
    const workspace = workspaces.pop();
    if (workspace) {
      workspace.cleanup();
    }
  }
});

describe("enforce-documentation-links CLI", () => {
  it("reports violations when documentation comments are missing", async () => {
    const workspace = createWorkspace();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    const exitCode = await runCli(["--workspace", workspace.root]);

    stdoutSpy.mockRestore();
    logSpy.mockRestore();

    expect(exitCode).toBe(EXIT_CODES.VIOLATIONS);
    expect(fileHasDocumentationComment(workspace)).toBe(false);
  });

  it("inserts documentation comments when --fix is provided", async () => {
    const workspace = createWorkspace();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    const exitCode = await runCli(["--workspace", workspace.root, "--fix"]);

    stdoutSpy.mockRestore();
    logSpy.mockRestore();

    expect(exitCode).toBe(EXIT_CODES.SUCCESS);
    expect(fileHasDocumentationComment(workspace)).toBe(true);
  });
});

function createWorkspace(): WorkspaceHandle {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "docs-link-cli-"));
  const docPath = ".mdmd/layer-4/tooling/sample-tool.mdmd.md";
  const codePath = "scripts/doc-tools/__fixtures__/documentation-links/sample-tool.ts";

  const docAbsolute = path.join(root, docPath);
  fs.mkdirSync(path.dirname(docAbsolute), { recursive: true });
  const sourceDoc = path.resolve(__dirname, "./__fixtures__/documentation-links/sample-tool.mdmd.md");
  fs.copyFileSync(sourceDoc, docAbsolute);
  const docSource = fs.readFileSync(docAbsolute, "utf8");
  fs.writeFileSync(
    docAbsolute,
    docSource.replaceAll(
      "./sample-tool.ts",
      "../../../scripts/doc-tools/__fixtures__/documentation-links/sample-tool.ts"
    )
  );

  const codeAbsolute = path.join(root, codePath);
  fs.mkdirSync(path.dirname(codeAbsolute), { recursive: true });
  fs.writeFileSync(codeAbsolute, "// placeholder implementation\nexport function sampleTool() {}\n");

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

function fileHasDocumentationComment(workspace: WorkspaceHandle): boolean {
  const codeAbsolute = path.join(workspace.root, workspace.codePath);
  const source = fs.readFileSync(codeAbsolute, "utf8");
  return source
    .split(/\r?\n/)
    .some((line) => line.includes(`${DEFAULT_RULES[0].label}: ${workspace.docPath}`));
}
