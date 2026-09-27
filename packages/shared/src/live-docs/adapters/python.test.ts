import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { pythonAdapter } from "./python";

describe("pythonAdapter", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "python-adapter-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  async function write(files: Record<string, string>): Promise<void> {
    for (const [relative, content] of Object.entries(files)) {
      const absolute = path.join(workspaceRoot, relative);
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, content, "utf8");
    }
  }

  async function analyze(relative: string) {
    const result = await pythonAdapter.analyze({ absolutePath: path.join(workspaceRoot, relative), workspaceRoot });
    return result!;
  }

  it("publishes classes with their public members and nested classes, and nothing private", async () => {
    await write({
      "shapes.py": [
        "LIMIT = 10",
        "_hidden = 1",
        "",
        "class Outer:",
        "    '''An outer class.'''",
        "",
        "    size: int = 0",
        "    _secret = None",
        "",
        "    def run(self) -> None:",
        "        pass",
        "",
        "    @property",
        "    def label(self) -> str:",
        "        return ''",
        "",
        "    @label.setter",
        "    def label(self, value: str) -> None:",
        "        pass",
        "",
        "    def _helper(self):",
        "        pass",
        "",
        "    class Inner:",
        "        def go(self):",
        "            pass",
        "",
        "def _private():",
        "    pass",
        ""
      ].join("\n")
    });

    const { symbols } = await analyze("shapes.py");
    expect(symbols.map((symbol) => [symbol.name, symbol.kind, symbol.qualifiedName])).toEqual([
      ["LIMIT", "variable", undefined],
      ["Outer", "class", undefined],
      ["size", "field", "Outer.size"],
      ["run", "method", "Outer.run"],
      ["label", "property", "Outer.label"],
      ["Inner", "class", "Outer.Inner"],
      ["go", "method", "Outer.Inner.go"]
    ]);
    expect(symbols[1].documentation?.summary).toBe("An outer class.");
  });

  it("follows a package's re-exports to the file that defines a name", async () => {
    await write({
      "pkg/__init__.py": "from .models import Thing\n",
      "pkg/models.py":   "class Thing:\n    pass\n",
      "app.py":          "from pkg import Thing\n\nThing()\n"
    });

    const { dependencies } = await analyze("app.py");
    expect(dependencies).toEqual([
      { specifier: "pkg", resolvedPath: "pkg/__init__.py", symbols: [], kind: "import" },
      { specifier: "pkg/models.py", resolvedPath: "pkg/models.py", symbols: ["Thing"], kind: "import" }
    ]);
  });

  it("links a submodule imported by name and the symbols used through it", async () => {
    await write({
      "pkg/__init__.py": "",
      "pkg/util.py":     "class Tool:\n    pass\n\ndef helper():\n    pass\n",
      "app.py":          "from pkg import util\n\ntool: util.Tool = util.helper()\n"
    });

    const { dependencies, symbols } = await analyze("app.py");
    expect(dependencies).toEqual([
      { specifier: "pkg", resolvedPath: "pkg/__init__.py", symbols: [], kind: "import" },
      { specifier: "pkg.util", resolvedPath: "pkg/util.py", symbols: ["Tool", "helper"], kind: "import" }
    ]);
    expect(symbols[0].typeReferences).toEqual([{ name: "Tool", role: "property" }]);
  });

  it("resolves attribute uses through a module import, aliased or not", async () => {
    await write({
      "pkg/__init__.py": "",
      "pkg/util.py":     "def helper():\n    pass\n\ndef other():\n    pass\n",
      "aliased.py":      "import pkg.util as u\n\nu.helper()\n",
      "dotted.py":       "import pkg.util\n\npkg.util.other()\n"
    });

    expect((await analyze("aliased.py")).dependencies).toEqual([
      { specifier: "pkg.util", resolvedPath: "pkg/util.py", symbols: ["helper"], kind: "import" }
    ]);
    expect((await analyze("dotted.py")).dependencies).toEqual([
      { specifier: "pkg.util", resolvedPath: "pkg/util.py", symbols: ["other"], kind: "import" }
    ]);
  });

  it("counts imports inside functions and under TYPE_CHECKING, not the ones in strings and comments", async () => {
    await write({
      "pkg/__init__.py": "",
      "pkg/util.py":     "def helper():\n    pass\n",
      "pkg/models.py":   "class Thing:\n    pass\n",
      "app.py": [
        '"""Docs that mention `import fake` are not imports."""',
        "from typing import TYPE_CHECKING",
        "# from fake2 import nothing",
        "",
        "if TYPE_CHECKING:",
        "    from pkg.models import Thing",
        "",
        "def build() -> 'Thing':",
        "    from pkg import util",
        "    return util.helper()",
        ""
      ].join("\n")
    });

    const { dependencies } = await analyze("app.py");
    expect(dependencies.map((dependency) => [dependency.resolvedPath ?? dependency.specifier, dependency.symbols])).toEqual([
      ["pkg/__init__.py", []],
      ["pkg/models.py", ["Thing"]],
      ["pkg/util.py", ["helper"]],
      ["typing", ["TYPE_CHECKING"]]
    ]);
  });

  it("links the names a wildcard import brings in only when the file uses them", async () => {
    await write({
      "pkg/__init__.py": 'from .models import Thing, Other\n\n__all__ = ["Thing", "Other"]\n',
      "pkg/models.py":   "class Thing:\n    pass\n\nclass Other:\n    pass\n",
      "app.py":          "from pkg import *\n\nThing()\n"
    });

    const { dependencies } = await analyze("app.py");
    expect(dependencies).toEqual([
      { specifier: "pkg", resolvedPath: "pkg/__init__.py", symbols: [], kind: "import" },
      { specifier: "pkg/models.py", resolvedPath: "pkg/models.py", symbols: ["Thing"], kind: "import" }
    ]);
  });

  it("records parameter and return types by name, seen through module aliases", async () => {
    await write({
      "pkg/__init__.py": "",
      "pkg/models.py":   "class Thing:\n    pass\n",
      "app.py":          "import pkg.models as models\n\ndef build(item: models.Thing, count: int) -> list[models.Thing]:\n    return [item]\n"
    });

    const { symbols } = await analyze("app.py");
    expect(symbols[0].typeReferences).toEqual([
      { name: "Thing", role: "parameter", parameterName: "item" },
      { name: "Thing", role: "type-argument" }
    ]);
  });

  it("resolves absolute imports from the workspace root and from src, wherever the importer sits", async () => {
    await write({
      "src/pkg/__init__.py": "",
      "src/pkg/core.py":     "def run():\n    pass\n",
      "src/pkg/app.py":      "from pkg.core import run\n",
      "tests/test_app.py":   "from pkg import core\n\ncore.run()\n"
    });

    expect((await analyze("src/pkg/app.py")).dependencies).toEqual([
      { specifier: "pkg.core", resolvedPath: "src/pkg/core.py", symbols: ["run"], kind: "import" }
    ]);
    expect((await analyze("tests/test_app.py")).dependencies).toEqual([
      { specifier: "pkg", resolvedPath: "src/pkg/__init__.py", symbols: [], kind: "import" },
      { specifier: "pkg.core", resolvedPath: "src/pkg/core.py", symbols: ["run"], kind: "import" }
    ]);
  });

  it("leaves a name out when the re-export it follows leads outside the workspace", async () => {
    await write({
      "pkg/__init__.py": "from json import loads as parse\n",
      "app.py":          "from pkg import parse\n"
    });

    expect((await analyze("app.py")).dependencies).toEqual([
      { specifier: "pkg", resolvedPath: "pkg/__init__.py", symbols: [], kind: "import" }
    ]);
  });
});
