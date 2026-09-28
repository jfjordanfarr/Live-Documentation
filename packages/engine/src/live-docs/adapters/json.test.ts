import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";

import type { WorkspaceFileIndex } from "./index";
import { jsonAdapter } from "./json";

describe("JSON Adapter", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "json-adapter-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("file index requirement", () => {
    it("returns empty dependencies when file index is not provided", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({ file: "./src/index.ts" }));

      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });

    it("returns empty dependencies when file index is empty", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({ file: "./src/index.ts" }));

      const fileIndex: WorkspaceFileIndex = new Set();
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });
  });

  describe("reference detection", () => {
    it("extracts relative path references with ./", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        include: ["./src/index.ts"]
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["src/index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("./src/index.ts");
      expect(result!.dependencies[0].resolvedPath).toBe("src/index.ts");
    });

    it("extracts relative path references with ../", async () => {
      // Create nested structure: tempDir/src/nested/config.json -> tempDir/lib/utils.ts
      const srcDir = path.join(tempDir, "src", "nested");
      const libDir = path.join(tempDir, "lib");
      fs.mkdirSync(srcDir, { recursive: true });
      fs.mkdirSync(libDir, { recursive: true });

      const jsonPath = path.join(srcDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        util: "../../lib/utils.ts"
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["lib/utils.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("../../lib/utils.ts");
      expect(result!.dependencies[0].resolvedPath).toBe("lib/utils.ts");
    });

    it("extracts workspace-relative path references", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        entry: "packages/engine/src/index.ts"
      }));

      const fileIndex: WorkspaceFileIndex = new Set([
        "packages/engine/src/index.ts"
      ]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("packages/engine/src/index.ts");
      expect(result!.dependencies[0].resolvedPath).toBe("packages/engine/src/index.ts");
    });

    it("extracts bare filename references in same directory", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        expected: "expected.json"
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["expected.json"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("expected.json");
      expect(result!.dependencies[0].resolvedPath).toBe("expected.json");
    });

    it("handles nested objects and arrays", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        files: {
          include: ["./src/a.ts", "./src/b.ts"],
          entry: "./src/main.ts"
        }
      }));

      const fileIndex: WorkspaceFileIndex = new Set([
        "src/a.ts",
        "src/b.ts",
        "src/main.ts"
      ]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(3);
      const resolvedPaths = result!.dependencies.map(d => d.resolvedPath);
      expect(resolvedPaths).toContain("src/a.ts");
      expect(resolvedPaths).toContain("src/b.ts");
      expect(resolvedPaths).toContain("src/main.ts");
    });
  });

  describe("non-path filtering", () => {
    it("ignores URLs", async () => {
      const jsonPath = path.join(tempDir, "package.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        homepage: "https://github.com/user/repo",
        repository: "git+https://github.com/user/repo.git"
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });

    it("ignores version strings", async () => {
      const jsonPath = path.join(tempDir, "deps.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        dependencies: {
          "lodash": "^4.17.21",
          "express": "~5.0.0",
          "vitest": ">=1.0.0"
        }
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });

    it("ignores glob patterns", async () => {
      const jsonPath = path.join(tempDir, "tsconfig.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        include: ["src/**/*.ts"],
        exclude: ["**/node_modules/**"]
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["src/index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });

    it("ignores scoped npm package names", async () => {
      const jsonPath = path.join(tempDir, "deps.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        dependencies: {
          "@types/node": "^20.0.0"
        }
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });
  });

  describe("file index validation", () => {
    it("only includes references to files that exist in the index", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        exists: "./src/exists.ts",
        missing: "./src/missing.ts"
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["src/exists.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].resolvedPath).toBe("src/exists.ts");
    });

    it("deduplicates references to the same file", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        include: ["./src/index.ts"],
        entry: "./src/index.ts",
        main: "src/index.ts"
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["src/index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
    });
  });

  describe("invalid JSON handling", () => {
    it("returns empty analysis for invalid JSON", async () => {
      const jsonPath = path.join(tempDir, "invalid.json");
      fs.writeFileSync(jsonPath, "{ invalid json }");

      const fileIndex: WorkspaceFileIndex = new Set(["src/index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.symbols).toHaveLength(0);
      expect(result!.dependencies).toHaveLength(0);
    });

    it("returns null for unreadable files", async () => {
      const jsonPath = path.join(tempDir, "nonexistent.json");

      const fileIndex: WorkspaceFileIndex = new Set(["src/index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).toBeNull();
    });
  });

  describe("symbols output", () => {
    it("publishes every key path, joined the way IConfiguration addresses nested settings", async () => {
      const jsonPath = path.join(tempDir, "appsettings.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        entry: "./src/index.ts",
        Hangfire: { Queue: "telemetry", Workers: [1, 2] }
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["src/index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.symbols.map((symbol) => `${symbol.kind} ${symbol.name}`)).toEqual([
        "key entry",
        "key Hangfire",
        "key Hangfire:Queue",
        "key Hangfire:Workers"
      ]);
    });
  });
});

describe("JSON Adapter on package.json", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "json-adapter-package-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("publishes the package, links workspace packages by name and keeps the rest external with their ranges", async () => {
    const manifestPath = path.join(tempDir, "packages", "explorer", "package.json");
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify({
      name: "@live-documentation/explorer",
      version: "0.0.0",
      main: "./src/index.ts",
      scripts: { build: "tsc" },
      dependencies: { "@live-documentation/engine": "*", d3: "^7.9.0" },
      devDependencies: { vitest: "^3.0.0" },
      peerDependencies: { typescript: "" }
    }));
    const symbolIndex = new Map([
      ["@live-documentation/engine", [{ liveDocPath: "d", sourcePath: "packages/engine/package.json", anchor: "symbol-live-documentationengine", kind: "package" }]]
    ]);

    const result = await jsonAdapter.analyze({ absolutePath: manifestPath, workspaceRoot: tempDir, fileIndex: new Set(["packages/explorer/src/index.ts"]), symbolIndex });

    expect(result?.symbols).toEqual([{ name: "@live-documentation/explorer", kind: "package", location: { line: 1, character: 1 } }]);
    expect(result?.dependencies).toEqual([
      { specifier: "packages/engine/package.json", resolvedPath: "packages/engine/package.json", symbols: ["@live-documentation/engine"], kind: "import" },
      { specifier: "d3@^7.9.0",      symbols: [], kind: "import" },
      { specifier: "typescript",     symbols: [], kind: "import" },
      { specifier: "vitest@^3.0.0",  symbols: [], kind: "import" }
    ]);
  });
});
