import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { ResolvedSymbolLocation, WorkspaceSymbolIndex } from "../coreTypes";
import { normalizeDistributionName, parseRequirement, pyprojectAdapter } from "./pyproject";

describe("parseRequirement", () => {
  it("keeps the name and the specifier, and drops extras, markers and spaces", () => {
    expect(parseRequirement("requests[security]>=2.0; python_version<\"3.12\"")).toEqual({ name: "requests", version: ">=2.0" });
    expect(parseRequirement("Django >= 4.2, < 5")).toEqual({ name: "Django", version: ">=4.2,<5" });
    expect(parseRequirement("attrs (>=22.1)")).toEqual({ name: "attrs", version: ">=22.1" });
    expect(parseRequirement("typing_extensions; python_version < '3.11'")).toEqual({ name: "typing_extensions" });
    expect(parseRequirement("numpy")).toEqual({ name: "numpy" });
    expect(parseRequirement("zope.interface~=6.0")).toEqual({ name: "zope.interface", version: "~=6.0" });
  });

  it("reads a direct reference as the name and its URL, a marker after it dropped", () => {
    expect(parseRequirement("pip @ https://github.com/pypa/pip/archive/22.0.2.zip ; sys_platform == 'win32'")).toEqual({ name: "pip", version: "https://github.com/pypa/pip/archive/22.0.2.zip" });
    expect(parseRequirement("ledger[cli] @ file:///opt/ledger")).toEqual({ name: "ledger", version: "file:///opt/ledger" });
  });

  it("refuses text that names no distribution", () => {
    expect(parseRequirement("")).toBeUndefined();
    expect(parseRequirement(">=1.0")).toBeUndefined();
  });

  it("compares names as Python does", () => {
    expect(normalizeDistributionName("Zope.Interface")).toBe("zope-interface");
    expect(normalizeDistributionName("typing__extensions")).toBe("typing-extensions");
  });
});

describe("pyprojectAdapter", () => {
  let workspaceRoot: string;
  const write = async (file: string, content: string): Promise<void> => {
    await fs.mkdir(path.dirname(path.join(workspaceRoot, file)), { recursive: true });
    await fs.writeFile(path.join(workspaceRoot, file), content, "utf8");
  };
  const analyze = (file: string, fileIndex: string[], symbolIndex?: WorkspaceSymbolIndex) =>
    pyprojectAdapter.analyze({ absolutePath: path.join(workspaceRoot, file), workspaceRoot, fileIndex: new Set(fileIndex), symbolIndex });
  const distribution = (name: string, sourcePath: string): [string, ResolvedSymbolLocation[]] =>
    [name, [{ liveDocPath: `${sourcePath}.md`, sourcePath, anchor: `symbol-${name}`, kind: "package" }]];

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "pyproject-adapter-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("publishes the distribution and reads its dependencies, optional lists and groups, but not what builds it", async () => {
    await write("pyproject.toml", [
      "[build-system]",
      "requires = [\"hatchling>=1.24\"]",
      "build-backend = \"hatchling.build\"",
      "",
      "[project]",
      "name = \"ledger\"",
      "dependencies = [\"requests[security]>=2.0; python_version<'3.12'\", \"click\"]",
      "",
      "[project.optional-dependencies]",
      "pdf = [\"reportlab>=4\"]",
      "web = [\"flask==3.0.3\"]",
      "",
      "[dependency-groups]",
      "test = [\"pytest>=8\", { include-group = \"lint\" }]",
      "lint = [\"ruff\"]"
    ].join("\n"));

    const result = await analyze("pyproject.toml", ["pyproject.toml"]);

    expect(result?.symbols).toEqual([{ name: "ledger", kind: "package", location: { line: 1, character: 1 } }]);
    expect(result?.dependencies.map((dependency) => dependency.specifier)).toEqual([
      "click", "flask@==3.0.3", "pytest@>=8", "reportlab@>=4", "requests@>=2.0", "ruff"
    ]);
  });

  it("reads Poetry's dependencies and groups when [project] lists none, python passed over", async () => {
    await write("pyproject.toml", [
      "[tool.poetry]",
      "name = \"inventory\"",
      "",
      "[tool.poetry.dependencies]",
      "python = \"^3.11\"",
      "pydantic = \"^2.7\"",
      "httpx = { version = \"^0.27\", extras = [\"http2\"] }",
      "numpy = [{ version = \"<2\", python = \"<3.12\" }, { version = \">=2\", python = \">=3.12\" }]",
      "",
      "[tool.poetry.group.dev.dependencies]",
      "mypy = \"*\"",
      "",
      "[tool.poetry.dev-dependencies]",
      "black = \"^24\""
    ].join("\n"));

    const result = await analyze("pyproject.toml", ["pyproject.toml"]);

    expect(result?.symbols.map((symbol) => symbol.name)).toEqual(["inventory"]);
    expect(result?.dependencies.map((dependency) => dependency.specifier)).toEqual(["black@^24", "httpx@^0.27", "mypy@*", "numpy", "pydantic@^2.7"]);
  });

  it("takes [project]'s list over Poetry's main table, whose paths still say where a dependency comes from", async () => {
    await write("libs/core/pyproject.toml", "[project]\nname = \"Ledger_Core\"\n");
    await write("app/pyproject.toml", [
      "[project]",
      "name = \"app\"",
      "dependencies = [\"ledger-core\", \"rich>=13\"]",
      "",
      "[tool.poetry.dependencies]",
      "ledger-core = { path = \"../libs/core\", develop = true }",
      "rich = { source = \"internal\" }",
      "",
      "[tool.poetry.group.test.dependencies]",
      "pytest = \"^8\""
    ].join("\n"));
    const symbolIndex: WorkspaceSymbolIndex = new Map([distribution("Ledger_Core", "libs/core/pyproject.toml")]);

    const result = await analyze("app/pyproject.toml", ["app/pyproject.toml", "libs/core/pyproject.toml"], symbolIndex);

    expect(result?.dependencies).toEqual([
      { specifier: "libs/core/pyproject.toml", resolvedPath: "libs/core/pyproject.toml", symbols: ["Ledger_Core"], kind: "import" },
      { specifier: "pytest@^8", symbols: [], kind: "import" },
      { specifier: "rich@>=13", symbols: [], kind: "import" }
    ]);
  });

  it("links uv's path sources when the workspace holds them, a member by the name it publishes, and keeps a missing path by name", async () => {
    await write("packages/util/pyproject.toml", "[project]\nname = \"util\"\n");
    await write("pyproject.toml", [
      "[project]",
      "name = \"monorepo\"",
      "dependencies = [\"util\", \"gone>=1\", \"shared-models\", \"left-pad\"]",
      "",
      "[tool.uv.sources]",
      "util = { path = \"packages/util\", editable = true }",
      "gone = { path = \"packages/gone\" }",
      "shared-models = { workspace = true }"
    ].join("\n"));
    const symbolIndex: WorkspaceSymbolIndex = new Map([
      distribution("shared_models", "packages/models/pyproject.toml"),
      distribution("left-pad", "web/package.json")
    ]);

    const result = await analyze("pyproject.toml", ["pyproject.toml", "packages/util/pyproject.toml", "packages/models/pyproject.toml", "web/package.json"], symbolIndex);

    expect(result?.dependencies).toEqual([
      { specifier: "packages/models/pyproject.toml", resolvedPath: "packages/models/pyproject.toml", symbols: ["shared_models"], kind: "import" },
      { specifier: "packages/util/pyproject.toml", resolvedPath: "packages/util/pyproject.toml", symbols: ["util"], kind: "import" },
      { specifier: "gone@>=1", symbols: [], kind: "import" },
      { specifier: "left-pad", symbols: [], kind: "import" }
    ]);
  });

  it("declares each script and gui-script on the module it names, under the manifest's folder or its src/, and nothing for one the workspace lacks", async () => {
    await write("tools/pyproject.toml", [
      "[project]",
      "name = \"ledger\"",
      "",
      "[project.scripts]",
      "ledger = \"ledger.cli:main\"",
      "ledger-report = \"ledger.report:run [pdf]\"",
      "ledger-ghost = \"ledger.ghost:main\"",
      "",
      "[project.gui-scripts]",
      "ledger-gui = \"ledger_gui:start\"",
      "",
      "[tool.poetry.scripts]",
      "ledger-seed = { callable = \"seed:main\" }"
    ].join("\n"));
    const fileIndex = ["tools/pyproject.toml", "tools/src/ledger/__init__.py", "tools/src/ledger/cli.py", "tools/src/ledger/report/__init__.py", "tools/ledger_gui.py", "tools/seed.py"];

    const result = await analyze("tools/pyproject.toml", fileIndex);

    expect(result?.declares).toEqual([
      { reason: "command", file: "tools/ledger_gui.py", name: "ledger-gui" },
      { reason: "command", file: "tools/seed.py", name: "ledger-seed" },
      { reason: "command", file: "tools/src/ledger/cli.py", name: "ledger" },
      { reason: "command", file: "tools/src/ledger/report/__init__.py", name: "ledger-report" }
    ]);
  });

  it("publishes no symbol for a manifest that names no distribution", async () => {
    await write("pyproject.toml", "[tool.ruff]\nline-length = 100\n");
    expect(await analyze("pyproject.toml", ["pyproject.toml"])).toEqual({ symbols: [], dependencies: [] });
  });
});
