import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { pythonAdapter } from "./python";

describe("pythonAdapter dependency resolution", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "python-resolution-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  describe("simple imports (import X)", () => {
    it("resolves local module as .py file", async () => {
      // Create util.py
      const utilPath = path.join(workspaceRoot, "util.py");
      await fs.writeFile(utilPath, "def helper(): pass\n", "utf8");

      // Create main.py that imports util
      const mainPath = path.join(workspaceRoot, "main.py");
      await fs.writeFile(mainPath, "import util\n", "utf8");

      const result = await pythonAdapter.analyze({ absolutePath: mainPath, workspaceRoot });

      expect(result?.dependencies).toHaveLength(1);
      expect(result?.dependencies?.[0]).toMatchObject({
        specifier: "util",
        resolvedPath: "util.py",
        symbols: [],
        kind: "import"
      });
    });

    it("resolves local package module with __init__.py", async () => {
      // Create utils/__init__.py
      const utilsDir = path.join(workspaceRoot, "utils");
      await fs.mkdir(utilsDir, { recursive: true });
      await fs.writeFile(path.join(utilsDir, "__init__.py"), "# package\n", "utf8");

      // Create main.py that imports utils
      const mainPath = path.join(workspaceRoot, "main.py");
      await fs.writeFile(mainPath, "import utils\n", "utf8");

      const result = await pythonAdapter.analyze({ absolutePath: mainPath, workspaceRoot });

      expect(result?.dependencies).toHaveLength(1);
      expect(result?.dependencies?.[0]).toMatchObject({
        specifier: "utils",
        resolvedPath: "utils/__init__.py",
        symbols: [],
        kind: "import"
      });
    });

    it("does not resolve stdlib modules", async () => {
      const mainPath = path.join(workspaceRoot, "main.py");
      await fs.writeFile(mainPath, "import os\nimport json\nimport typing\n", "utf8");

      const result = await pythonAdapter.analyze({ absolutePath: mainPath, workspaceRoot });

      expect(result?.dependencies).toHaveLength(3);
      for (const dep of result?.dependencies ?? []) {
        expect(dep.resolvedPath).toBeUndefined();
      }
    });

    it("handles aliased imports", async () => {
      const utilPath = path.join(workspaceRoot, "utilities.py");
      await fs.writeFile(utilPath, "def helper(): pass\n", "utf8");

      const mainPath = path.join(workspaceRoot, "main.py");
      await fs.writeFile(mainPath, "import utilities as util\n", "utf8");

      const result = await pythonAdapter.analyze({ absolutePath: mainPath, workspaceRoot });

      expect(result?.dependencies).toHaveLength(1);
      expect(result?.dependencies?.[0]).toMatchObject({
        specifier: "utilities",
        resolvedPath: "utilities.py",
        symbols: []
      });
    });
  });

  describe("from imports (from X import Y)", () => {
    it("resolves module and extracts imported symbols", async () => {
      const utilPath = path.join(workspaceRoot, "util.py");
      await fs.writeFile(utilPath, "def summarize(): pass\ndef format(): pass\n", "utf8");

      const mainPath = path.join(workspaceRoot, "main.py");
      await fs.writeFile(mainPath, "from util import summarize, format\n", "utf8");

      const result = await pythonAdapter.analyze({ absolutePath: mainPath, workspaceRoot });

      expect(result?.dependencies).toHaveLength(1);
      expect(result?.dependencies?.[0]).toMatchObject({
        specifier: "util",
        resolvedPath: "util.py",
        symbols: ["format", "summarize"],
        kind: "import"
      });
    });

    it("handles aliased symbol imports", async () => {
      const utilPath = path.join(workspaceRoot, "util.py");
      await fs.writeFile(utilPath, "def summarize_values(): pass\n", "utf8");

      const mainPath = path.join(workspaceRoot, "main.py");
      await fs.writeFile(mainPath, "from util import summarize_values as summarize\n", "utf8");

      const result = await pythonAdapter.analyze({ absolutePath: mainPath, workspaceRoot });

      expect(result?.dependencies?.[0]).toMatchObject({
        specifier: "util",
        resolvedPath: "util.py",
        symbols: ["summarize_values"]
      });
    });

    it("handles wildcard imports without symbols", async () => {
      const utilPath = path.join(workspaceRoot, "util.py");
      await fs.writeFile(utilPath, "def helper(): pass\n", "utf8");

      const mainPath = path.join(workspaceRoot, "main.py");
      await fs.writeFile(mainPath, "from util import *\n", "utf8");

      const result = await pythonAdapter.analyze({ absolutePath: mainPath, workspaceRoot });

      expect(result?.dependencies?.[0]).toMatchObject({
        specifier: "util",
        resolvedPath: "util.py",
        symbols: []
      });
    });

    it("extracts class imports as symbols", async () => {
      const modelsPath = path.join(workspaceRoot, "models.py");
      await fs.writeFile(modelsPath, "class User: pass\nclass Post: pass\n", "utf8");

      const mainPath = path.join(workspaceRoot, "main.py");
      await fs.writeFile(mainPath, "from models import User, Post\n", "utf8");

      const result = await pythonAdapter.analyze({ absolutePath: mainPath, workspaceRoot });

      expect(result?.dependencies?.[0]).toMatchObject({
        specifier: "models",
        resolvedPath: "models.py",
        symbols: ["Post", "User"]
      });
    });
  });

  describe("relative imports", () => {
    it("resolves single-dot relative import", async () => {
      // Create package structure: src/main.py, src/helpers.py
      const srcDir = path.join(workspaceRoot, "src");
      await fs.mkdir(srcDir, { recursive: true });
      await fs.writeFile(path.join(srcDir, "__init__.py"), "", "utf8");
      await fs.writeFile(path.join(srcDir, "helpers.py"), "def validate(): pass\n", "utf8");

      const mainPath = path.join(srcDir, "main.py");
      await fs.writeFile(mainPath, "from .helpers import validate\n", "utf8");

      const result = await pythonAdapter.analyze({ absolutePath: mainPath, workspaceRoot });

      expect(result?.dependencies).toHaveLength(1);
      expect(result?.dependencies?.[0]).toMatchObject({
        specifier: ".helpers",
        resolvedPath: "src/helpers.py",
        symbols: ["validate"]
      });
    });

    it("resolves double-dot relative import to parent directory", async () => {
      // Create package structure: src/utils.py, src/sub/main.py
      const srcDir = path.join(workspaceRoot, "src");
      const subDir = path.join(srcDir, "sub");
      await fs.mkdir(subDir, { recursive: true });
      await fs.writeFile(path.join(srcDir, "__init__.py"), "", "utf8");
      await fs.writeFile(path.join(srcDir, "utils.py"), "def helper(): pass\n", "utf8");
      await fs.writeFile(path.join(subDir, "__init__.py"), "", "utf8");

      const mainPath = path.join(subDir, "main.py");
      await fs.writeFile(mainPath, "from ..utils import helper\n", "utf8");

      const result = await pythonAdapter.analyze({ absolutePath: mainPath, workspaceRoot });

      expect(result?.dependencies?.[0]).toMatchObject({
        specifier: "..utils",
        resolvedPath: "src/utils.py",
        symbols: ["helper"]
      });
    });
  });

  describe("nested directory structure", () => {
    it("resolves sibling module in same directory", async () => {
      // Create: src/main.py, src/helpers.py (no __init__.py required for direct siblings)
      const srcDir = path.join(workspaceRoot, "src");
      await fs.mkdir(srcDir, { recursive: true });
      await fs.writeFile(path.join(srcDir, "helpers.py"), "def validate(): pass\n", "utf8");

      const mainPath = path.join(srcDir, "main.py");
      await fs.writeFile(mainPath, "from helpers import validate\n", "utf8");

      const result = await pythonAdapter.analyze({ absolutePath: mainPath, workspaceRoot });

      expect(result?.dependencies?.[0]).toMatchObject({
        specifier: "helpers",
        resolvedPath: "src/helpers.py",
        symbols: ["validate"]
      });
    });
  });

  describe("real-world patterns matching fixtures", () => {
    it("matches python/basics/src/main.py import pattern", async () => {
      // Recreate the fixture structure
      const srcDir = path.join(workspaceRoot, "src");
      await fs.mkdir(srcDir, { recursive: true });

      await fs.writeFile(
        path.join(srcDir, "util.py"),
        "def summarize_values(values): pass\n",
        "utf8"
      );
      await fs.writeFile(
        path.join(srcDir, "helpers.py"),
        "def validate_seed(seed): pass\n",
        "utf8"
      );

      const mainPath = path.join(srcDir, "main.py");
      await fs.writeFile(
        mainPath,
        [
          "from util import summarize_values",
          "from helpers import validate_seed",
          "",
          "def run(seed: int) -> str:",
          "    pass"
        ].join("\n"),
        "utf8"
      );

      const result = await pythonAdapter.analyze({ absolutePath: mainPath, workspaceRoot });

      expect(result?.dependencies).toHaveLength(2);

      const helpersDep = result?.dependencies?.find((d) => d.specifier === "helpers");
      expect(helpersDep).toMatchObject({
        specifier: "helpers",
        resolvedPath: "src/helpers.py",
        symbols: ["validate_seed"]
      });

      const utilDep = result?.dependencies?.find((d) => d.specifier === "util");
      expect(utilDep).toMatchObject({
        specifier: "util",
        resolvedPath: "src/util.py",
        symbols: ["summarize_values"]
      });
    });

    it("matches python/pipeline/src/pipeline.py import pattern", async () => {
      const srcDir = path.join(workspaceRoot, "src");
      await fs.mkdir(srcDir, { recursive: true });
      await fs.writeFile(path.join(srcDir, "__init__.py"), "", "utf8");

      await fs.writeFile(path.join(srcDir, "metrics.py"), "def compute_summary(): pass\n", "utf8");
      await fs.writeFile(path.join(srcDir, "repositories.py"), "def load_series(): pass\n", "utf8");
      await fs.writeFile(path.join(srcDir, "validators.py"), "def ensure_not_empty(): pass\n", "utf8");

      const pipelinePath = path.join(srcDir, "pipeline.py");
      await fs.writeFile(
        pipelinePath,
        [
          "from dataclasses import dataclass",
          "",
          "from metrics import compute_summary",
          "from repositories import load_series",
          "from validators import ensure_not_empty",
          "",
          "def build_report(): pass"
        ].join("\n"),
        "utf8"
      );

      const result = await pythonAdapter.analyze({ absolutePath: pipelinePath, workspaceRoot });

      // Should have 4 deps: dataclasses (stdlib, unresolved) + 3 local modules
      expect(result?.dependencies).toHaveLength(4);

      const dataclassesDep = result?.dependencies?.find((d) => d.specifier === "dataclasses");
      expect(dataclassesDep?.resolvedPath).toBeUndefined();
      expect(dataclassesDep?.symbols).toContain("dataclass");

      const metricsDep = result?.dependencies?.find((d) => d.specifier === "metrics");
      expect(metricsDep).toMatchObject({
        resolvedPath: "src/metrics.py",
        symbols: ["compute_summary"]
      });

      const repositoriesDep = result?.dependencies?.find((d) => d.specifier === "repositories");
      expect(repositoriesDep).toMatchObject({
        resolvedPath: "src/repositories.py",
        symbols: ["load_series"]
      });

      const validatorsDep = result?.dependencies?.find((d) => d.specifier === "validators");
      expect(validatorsDep).toMatchObject({
        resolvedPath: "src/validators.py",
        symbols: ["ensure_not_empty"]
      });
    });
  });
});
