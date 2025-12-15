import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import type { InitializeParams } from "vscode-languageserver/node";

import {
  describeError,
  ensureDirectory,
  fileUriToPath,
  resolveDatabasePath,
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

describe("resolveDatabasePath", () => {
  const baseParams = params({ workspaceFolders: [{ uri: "file:///workspace", name: "workspace" }] });

  const normalizePath = (value: string): string => value.split(path.sep).join("/");

  it("prefers explicit storage path", () => {
    const result = resolveDatabasePath(baseParams, { storagePath: "C:/data" });
    expect(normalizePath(result)).toBe(normalizePath(path.join("C:/data", "live-documentation.db")));
  });

  it("falls back to workspace path", () => {
    const result = resolveDatabasePath(baseParams, {});
    expect(normalizePath(result)).toBe(
      normalizePath(path.join(path.resolve("/workspace"), ".live-documentation", "live-documentation.db"))
    );
  });

  it("uses temp directory when workspace missing", () => {
    const temp = path.join(os.tmpdir(), "live-documentation", "live-documentation.db");
    const result = resolveDatabasePath(params({ workspaceFolders: [] }), {});
    expect(normalizePath(result)).toBe(normalizePath(temp));
  });
});

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

describe("ensureDirectory", () => {
  it("creates directory when missing", () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), "env-dir-test-"));
    const target = path.join(base, "nested", "dir");

    expect(fs.existsSync(target)).toBe(false);

    try {
      ensureDirectory(target);

      expect(fs.existsSync(target)).toBe(true);
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("does not throw when directory is already present", () => {
    const existing = fs.mkdtempSync(path.join(os.tmpdir(), "env-dir-existing-"));

    try {
      expect(() => ensureDirectory(existing)).not.toThrow();
      expect(fs.existsSync(existing)).toBe(true);
    } finally {
      fs.rmSync(existing, { recursive: true, force: true });
    }
  });
});

describe("describeError", () => {
  it("renders Error instances", () => {
    expect(describeError(new TypeError("bad"))).toBe("TypeError: bad");
  });

  it("falls back to string conversion", () => {
    expect(describeError(42)).toBe("42");
  });
});
