import * as path from "node:path";
import { describe, expect, it } from "vitest";
import type { InitializeParams } from "vscode-languageserver/node";

import {
  fileUriToPath,
  resolveWorkspaceRoot
} from "./environment";

function params(overrides: Partial<InitializeParams> = {}): InitializeParams {
  return {
    processId: null,
    rootUri: null,
    capabilities: {} as never,
    workspaceFolders: null,
    ...overrides
  };
}

describe("resolveWorkspaceRoot", () => {
  const normalize = (value: string | undefined): string | undefined => value?.replace(/\\/g, "/");

  it("returns first workspace folder", () => {
    const result = resolveWorkspaceRoot(
      params({ workspaceFolders: [{ uri: "file:///workspace", name: "workspace" }] })
    );
    expect(normalize(result)).toBe(normalize(path.resolve("/workspace")));
  });

  it("falls back to rootUri", () => {
    const result = resolveWorkspaceRoot(params({ workspaceFolders: [], rootUri: "file:///fallback" }));
    expect(normalize(result)).toBe(normalize(path.resolve("/fallback")));
  });

  it("resolves rootPath", () => {
    const result = resolveWorkspaceRoot(params({ workspaceFolders: [], rootUri: null, rootPath: "./relative" }));
    expect(result).toBe(path.resolve("./relative"));
  });
});

describe("fileUriToPath", () => {
  it("converts file URIs", () => {
    expect(fileUriToPath("file:///project/file.ts").replace(/\\/g, "/")).toBe(
      path.resolve("/project/file.ts").replace(/\\/g, "/")
    );
  });

  it("resolves plain paths", () => {
    expect(fileUriToPath("./relative/file.ts")).toBe(path.resolve("./relative/file.ts"));
  });
});
