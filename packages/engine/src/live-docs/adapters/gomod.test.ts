import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { ResolvedSymbolLocation, WorkspaceSymbolIndex } from "../coreTypes";
import { goModAdapter, readGoMod } from "./gomod";

describe("readGoMod", () => {
  it("reads the module, the single-line and block requires, the replacements, and passes over indirect requirements and other directives", () => {
    const goMod = readGoMod([
      "// The depot service.",
      "module \"example.com/depot\" // quoted, as Go allows",
      "",
      "go 1.22",
      "toolchain go1.22.4",
      "godebug default=go1.21",
      "",
      "require github.com/google/uuid v1.6.0",
      "require golang.org/x/sys v0.21.0 // indirect",
      "",
      "require (",
      "\tgithub.com/spf13/cobra v1.8.0",
      "\tgithub.com/inconshreveable/mousetrap v1.1.0 // indirect",
      "\tgithub.com/stretchr/testify v1.9.0 // indirectly needed, but a direct import",
      "\texample.com/shared v0.0.0",
      ")",
      "",
      "replace example.com/shared => ../shared",
      "replace (",
      "\tgithub.com/spf13/cobra v1.8.0 => github.com/fork/cobra v1.8.1",
      ")",
      "exclude github.com/google/uuid v1.5.0",
      "retract v0.9.0",
      "tool golang.org/x/tools/cmd/stringer"
    ].join("\n"));

    expect(goMod).toEqual({
      module: "example.com/depot",
      requires: [
        { path: "github.com/google/uuid", version: "v1.6.0" },
        { path: "github.com/spf13/cobra", version: "v1.8.0" },
        { path: "github.com/stretchr/testify", version: "v1.9.0" },
        { path: "example.com/shared", version: "v0.0.0" }
      ],
      replaces: [
        { path: "example.com/shared", version: undefined, target: "../shared", targetVersion: undefined },
        { path: "github.com/spf13/cobra", version: "v1.8.0", target: "github.com/fork/cobra", targetVersion: "v1.8.1" }
      ]
    });
  });

  it("reads a module file with nothing but its module", () => {
    expect(readGoMod("module rosetta\n\ngo 1.21\n")).toEqual({ module: "rosetta", requires: [], replaces: [] });
  });
});

describe("goModAdapter", () => {
  let workspaceRoot: string;
  const write = async (file: string, content: string): Promise<void> => {
    await fs.mkdir(path.dirname(path.join(workspaceRoot, file)), { recursive: true });
    await fs.writeFile(path.join(workspaceRoot, file), content, "utf8");
  };
  const analyze = (file: string, fileIndex: string[], symbolIndex?: WorkspaceSymbolIndex) =>
    goModAdapter.analyze({ absolutePath: path.join(workspaceRoot, file), workspaceRoot, fileIndex: new Set(fileIndex), symbolIndex });
  const goModule = (name: string, sourcePath: string): [string, ResolvedSymbolLocation[]] =>
    [name, [{ liveDocPath: `${sourcePath}.md`, sourcePath, anchor: `symbol-${name}`, kind: "package" }]];

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "gomod-adapter-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("publishes the module, links a requirement replaced by a workspace folder, writes a module replacement in its place, and keeps the rest external", async () => {
    await write("shared/go.mod", "module example.com/shared\n");
    await write("depot/go.mod", [
      "module example.com/depot",
      "",
      "require (",
      "\texample.com/shared v0.0.0",
      "\texample.com/gone v0.0.0",
      "\tgithub.com/spf13/cobra v1.8.0",
      "\tgithub.com/google/uuid v1.6.0",
      "\tgolang.org/x/sys v0.21.0 // indirect",
      ")",
      "",
      "replace example.com/shared => ../shared",
      "replace example.com/gone => ./vendor/gone",
      "replace github.com/spf13/cobra v1.8.0 => github.com/fork/cobra v1.8.1",
      "replace github.com/google/uuid v1.5.0 => ../uuid"
    ].join("\n"));
    const symbolIndex: WorkspaceSymbolIndex = new Map([goModule("example.com/shared", "shared/go.mod")]);

    const result = await analyze("depot/go.mod", ["depot/go.mod", "shared/go.mod"], symbolIndex);

    expect(result?.symbols).toEqual([{ name: "example.com/depot", kind: "package", location: { line: 1, character: 1 } }]);
    expect(result?.dependencies).toEqual([
      { specifier: "shared/go.mod", resolvedPath: "shared/go.mod", symbols: ["example.com/shared"], kind: "import" },
      { specifier: "example.com/gone", symbols: [], kind: "import" },
      { specifier: "github.com/fork/cobra@v1.8.1", symbols: [], kind: "import" },
      { specifier: "github.com/google/uuid@v1.6.0", symbols: [], kind: "import" }
    ]);
  });

  it("links a requirement on a module a workspace go.mod publishes, as a go.work would, and never to a package of another ecosystem", async () => {
    await write("go.mod", "module example.com/app\nrequire (\n\texample.com/lib v1.2.0\n\tleft-pad v1.0.0\n)\n");
    const symbolIndex: WorkspaceSymbolIndex = new Map([goModule("example.com/lib", "lib/go.mod"), goModule("left-pad", "web/package.json")]);

    const result = await analyze("go.mod", ["go.mod", "lib/go.mod", "web/package.json"], symbolIndex);

    expect(result?.dependencies).toEqual([
      { specifier: "lib/go.mod", resolvedPath: "lib/go.mod", symbols: ["example.com/lib"], kind: "import" },
      { specifier: "left-pad@v1.0.0", symbols: [], kind: "import" }
    ]);
    expect(result?.declares).toBeUndefined();
  });
});
