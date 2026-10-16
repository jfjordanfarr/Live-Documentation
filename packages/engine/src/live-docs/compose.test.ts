import path from "node:path";
import { describe, expect, it } from "vitest";

import { composeDependencies, composeEntries, composeSymbolBlocks, computePublicSymbolHeadingInfo } from "./compose";
import type { WorkspaceSymbolIndex } from "./coreTypes";
import { renderLiveDoc, parseLiveDoc } from "./document";

const workspaceRoot = path.resolve("/workspace-root");
const liveDocsRootAbsolute = path.join(workspaceRoot, ".live-documentation", "source");
const sourceRelativePath = "packages/engine/src/contracts/dependencies.ts";
const sourceAbsolute = path.join(workspaceRoot, sourceRelativePath);
const docDir = path.dirname(path.join(liveDocsRootAbsolute, `${sourceRelativePath}.md`));

describe("composeSymbolBlocks", () => {
  it("gives each symbol its heading, kind, source line and documentation", () => {
    const symbols = [
      {
        name: "DependencyGraphEdge",
        kind: "interface",
        location: { line: 16, character: 1 },
        documentation: { summary: "Represents a dependency edge.", source: "tsdoc" }
      },
      { name: "INSPECT_DEPENDENCIES_REQUEST", kind: "const", location: { line: 3, character: 1 } }
    ];
    const headings = computePublicSymbolHeadingInfo(symbols);
    const blocks = composeSymbolBlocks({ headings, docDir, sourceAbsolute, sourceRelativePath });

    expect(blocks).toEqual([
      {
        name: "DependencyGraphEdge",
        slug: "symbol-dependencygraphedge",
        kind: "interface",
        flags: [],
        source: { path: "../../../../../../packages/engine/src/contracts/dependencies.ts", line: 16 },
        references: [],
        sections: [{ title: "Summary", body: ["Represents a dependency edge."] }]
      },
      {
        name: "INSPECT_DEPENDENCIES_REQUEST",
        slug: "symbol-inspect_dependencies_request",
        kind: "const",
        flags: [],
        source: { path: "../../../../../../packages/engine/src/contracts/dependencies.ts", line: 3 },
        references: [],
        sections: []
      }
    ]);
  });

  it("links a type reference to the doc that declares it, or within the doc when declared here", () => {
    const symbolIndex: WorkspaceSymbolIndex = new Map([
      ["Widget", [{ liveDocPath: ".live-documentation/source/packages/engine/src/types.ts.md", sourcePath: "packages/engine/src/types.ts", anchor: "symbol-widget", kind: "interface" }]],
      ["Edge", [{ liveDocPath: ".live-documentation/source/packages/engine/src/contracts/dependencies.ts.md", sourcePath: sourceRelativePath, anchor: "symbol-edge", kind: "interface" }]]
    ]);
    const headings = computePublicSymbolHeadingInfo([
      {
        name: "walk",
        kind: "function",
        typeReferences: [
          { name: "Edge", role: "return", isArrayElement: true },
          { name: "Widget", role: "parameter", parameterName: "from" },
          { name: "Unknown", role: "parameter", parameterName: "options", isPromiseResolution: true }
        ]
      }
    ]);
    const [block] = composeSymbolBlocks({ headings, docDir, sourceAbsolute, sourceRelativePath, symbolIndex, liveDocsRootAbsolute });

    expect(block.references).toEqual([
      { role: "Returns", types: [{ name: "Edge", link: "#symbol-edge", array: true }] },
      {
        role: "Parameters",
        parameters: [
          { name: "from", types: [{ name: "Widget", link: "../types.ts.md#symbol-widget" }] },
          { name: "options", types: [{ name: "Unknown", promise: true }] }
        ]
      }
    ]);
  });

  it("links a type declared here within the doc, whatever other files declare under that name", () => {
    const symbolIndex: WorkspaceSymbolIndex = new Map([
      ["PathResult", [
        { liveDocPath: ".live-documentation/source/packages/explorer/src/state.ts.md", sourcePath: "packages/explorer/src/state.ts", anchor: "symbol-pathresult", kind: "interface" },
        { liveDocPath: ".live-documentation/source/packages/engine/src/contracts/dependencies.ts.md", sourcePath: sourceRelativePath, anchor: "symbol-pathresult", kind: "interface" }
      ]]
    ]);
    const headings = computePublicSymbolHeadingInfo([
      { name: "walk", kind: "function", typeReferences: [{ name: "PathResult", role: "return" }] }
    ]);
    const [block] = composeSymbolBlocks({ headings, docDir, sourceAbsolute, sourceRelativePath, symbolIndex, liveDocsRootAbsolute });

    expect(block.references).toEqual([{ role: "Returns", types: [{ name: "PathResult", link: "#symbol-pathresult" }] }]);
  });

  it("links a type this file only re-exports to the file that declares it", () => {
    const symbolIndex: WorkspaceSymbolIndex = new Map([
      ["Widget", [
        { liveDocPath: ".live-documentation/source/packages/engine/src/contracts/dependencies.ts.md", sourcePath: sourceRelativePath, anchor: "symbol-widget", kind: "type", isReExport: true },
        { liveDocPath: ".live-documentation/source/packages/engine/src/types.ts.md", sourcePath: "packages/engine/src/types.ts", anchor: "symbol-widget", kind: "interface" }
      ]]
    ]);
    const headings = computePublicSymbolHeadingInfo([
      { name: "walk", kind: "function", typeReferences: [{ name: "Widget", role: "return" }] }
    ]);
    const [block] = composeSymbolBlocks({ headings, docDir, sourceAbsolute, sourceRelativePath, symbolIndex, liveDocsRootAbsolute });

    expect(block.references).toEqual([{ role: "Returns", types: [{ name: "Widget", link: "../types.ts.md#symbol-widget" }] }]);
  });

  it("never links a type to a file of another language", () => {
    const symbolIndex: WorkspaceSymbolIndex = new Map([
      ["Quantity", [
        { liveDocPath: ".live-documentation/source/src/model/Quantity.java.md", sourcePath: "src/model/Quantity.java", anchor: "symbol-quantity", kind: "class" }
      ]]
    ]);
    const headings = computePublicSymbolHeadingInfo([
      { name: "walk", kind: "function", typeReferences: [{ name: "Quantity", role: "return" }] }
    ]);
    const [block] = composeSymbolBlocks({ headings, docDir, sourceAbsolute, sourceRelativePath, symbolIndex, liveDocsRootAbsolute });

    expect(block.references).toEqual([{ role: "Returns", types: [{ name: "Quantity" }] }]);
  });
});

describe("composeDependencies", () => {
  it("links each imported symbol to its anchor and keeps external modules as text", () => {
    const headings = computePublicSymbolHeadingInfo([]);
    const dependencies = composeDependencies({
      analysis: {
        symbols: [],
        dependencies: [
          { specifier: "../types", resolvedPath: "packages/engine/src/types.ts", symbols: ["Widget", "Edge"], kind: "import", isTypeOnly: true },
          { specifier: "../index", resolvedPath: "packages/engine/src/index.ts", symbols: [], kind: "export" },
          { specifier: "node:path", symbols: ["basename", "join"], kind: "import" },
          { specifier: "vitest", symbols: [], kind: "import" }
        ]
      },
      docDir,
      liveDocsRootAbsolute,
      docExtension: ".md",
      headings
    });

    expect(dependencies).toEqual([
      { label: "node:path", symbols: ["basename", "join"], qualifiers: [] },
      { label: "index", link: "../index.ts.md", qualifiers: ["re-export"] },
      { label: "types.Edge", link: "../types.ts.md#symbol-edge", qualifiers: ["type-only"] },
      { label: "types.Widget", link: "../types.ts.md#symbol-widget", qualifiers: ["type-only"] },
      { label: "vitest", qualifiers: [] }
    ]);
  });

  it("keeps a dependency observed from a contract or from configuration on lines of its own, with its basis as the qualifier", () => {
    const headings = computePublicSymbolHeadingInfo([]);
    const dependencies = composeDependencies({
      analysis: {
        symbols: [],
        dependencies: [
          { specifier: "packages/engine/src/api.ts", resolvedPath: "packages/engine/src/api.ts", symbols: ["ApiOptions"], kind: "import" },
          { specifier: "packages/engine/src/api.ts", resolvedPath: "packages/engine/src/api.ts", symbols: ["POST api/widgets"], kind: "import", basis: "contract" },
          { specifier: "net.tcp://hub:8731/Hub", symbols: [], kind: "import", basis: "configuration" }
        ]
      },
      docDir,
      liveDocsRootAbsolute,
      docExtension: ".md",
      headings
    });

    expect(dependencies).toEqual([
      { label: "net.tcp://hub:8731/Hub", qualifiers: ["configuration"] },
      { label: "api.ApiOptions", link: "../api.ts.md#symbol-apioptions", qualifiers: [] },
      { label: "api.POST api/widgets", link: "../api.ts.md#symbol-post-apiwidgets", qualifiers: ["contract"] }
    ]);
  });

  it("composes only what the grammar can write back", () => {
    const headings = computePublicSymbolHeadingInfo([{ name: "walk", kind: "function", location: { line: 1, character: 1 } }]);
    const doc = {
      codePath: sourceRelativePath,
      layer: 4,
      archetype: "implementation",
      entries: [],
      authored: "### Purpose\nWalks.\n\n### Notes\nNone.",
      symbols: composeSymbolBlocks({ headings, docDir, sourceAbsolute, sourceRelativePath }),
      dependencies: composeDependencies({
        analysis: { symbols: [], dependencies: [{ specifier: "./graph", resolvedPath: "packages/engine/src/contracts/graph.ts", symbols: ["walk"], kind: "import" }] },
        docDir,
        liveDocsRootAbsolute,
        docExtension: ".md",
        headings
      })
    };
    expect(parseLiveDoc(renderLiveDoc(doc))).toEqual(doc);
  });
});

describe("composeEntries", () => {
  const compose = (args: Partial<Parameters<typeof composeEntries>[0]>) => composeEntries({
    analysis: { symbols: [], dependencies: [] },
    sourceRelativePath,
    headings: [],
    declaredBy: [],
    config: { entryPoints: [] },
    docDir,
    liveDocsRootAbsolute,
    docExtension: ".md",
    ...args
  });

  it("writes nothing for a file nothing starts", () => {
    expect(compose({})).toEqual([]);
  });

  it("links the program's symbol when the doc has it, names it bare when it does not, and writes none when the language names none", () => {
    const headings = computePublicSymbolHeadingInfo([{ name: "main", kind: "function" }]);
    expect(compose({ analysis: { symbols: [], dependencies: [], program: { symbol: "main" } }, headings })).toEqual([{ reason: "program", symbol: { name: "main", link: "#symbol-main" } }]);
    expect(compose({ analysis: { symbols: [], dependencies: [], program: { symbol: "main" } } })).toEqual([{ reason: "program", symbol: { name: "main" } }]);
    expect(compose({ analysis: { symbols: [], dependencies: [], program: {} } })).toEqual([{ reason: "program" }]);
    // Two symbols named main, as Java's `String main(int)` beside `void main(String[])`: the line picks the heading.
    const overloads = computePublicSymbolHeadingInfo([
      { name: "main", kind: "method", location: { line: 10, character: 1 } },
      { name: "main", kind: "method", location: { line: 20, character: 1 } }
    ]);
    expect(compose({ analysis: { symbols: [], dependencies: [], program: { symbol: "main", line: 20 } }, headings: overloads })).toEqual([{ reason: "program", symbol: { name: "main", link: "#symbol-main-method-overload-2" } }]);
    expect(compose({ analysis: { symbols: [], dependencies: [], program: { symbol: "main", line: 99 } }, headings: overloads })).toEqual([{ reason: "program", symbol: { name: "main", link: "#symbol-main-method-overload-1" } }]);
  });

  it("writes the commands by name and the module, each linking the manifest that declares it", () => {
    const declaredBy = [
      { declarer: "package.json", reason: "command" as const, name: "lint" },
      { declarer: "packages/engine/package.json", reason: "module" as const },
      { declarer: "package.json", reason: "command" as const, name: "build" }
    ];
    expect(compose({ declaredBy })).toEqual([
      { reason: "command", command: "build", declarer: { label: "package.json", link: "../../../../package.json.md" } },
      { reason: "command", command: "lint", declarer: { label: "package.json", link: "../../../../package.json.md" } },
      { reason: "module", declarer: { label: "packages/engine/package.json", link: "../../package.json.md" } }
    ]);
  });

  it("writes one opening per route, address, procedure or table the file serves, and tooling for a manifest or a configuration a tool reads", () => {
    const headings = computePublicSymbolHeadingInfo([
      { name: "GET api/payments", kind: "route" },
      { name: "PaymentsController", kind: "class" },
      { name: "dbo.Payment", kind: "table" }
    ]);
    expect(compose({ headings })).toEqual([
      { reason: "opening", symbol: { name: "GET api/payments", link: "#symbol-get-apipayments" } },
      { reason: "opening", symbol: { name: "dbo.Payment", link: "#symbol-dbopayment" } }
    ]);
    // A manifest is tooling by its name, whether or not it publishes a package: a workspace's root Cargo.toml publishes none.
    for (const name of ["package.json", "Hub/Hub.csproj", "Legacy/Legacy.VBPROJ", "crates/Cargo.toml", "Cargo.toml", "app/pyproject.toml", "go.mod", "parent/pom.xml"]) {
      expect(compose({ sourceRelativePath: name }), name).toEqual([{ reason: "tooling" }]);
    }
    for (const name of ["tests/e2e/playwright.config.ts", "tsconfig.json", "packages/cli/tsconfig.build.json", "Hub/App.config", "Portal/Web.config", "Portal/packages.config", "vitest.config.mts"]) {
      expect(compose({ sourceRelativePath: name }), name).toEqual([{ reason: "tooling" }]);
    }
    for (const name of ["src/config.ts", "src/app.config/settings.ts", "appsettings.json", "rustfmt.toml", "cargo.toml", "settings.xml", "go.mod.bak"]) {
      expect(compose({ sourceRelativePath: name }), name).toEqual([]);
    }
  });

  it("writes tooling for a manifest known only by its content, by the package or project it publishes", () => {
    // A PowerShell module's .psd1 publishes its module as a package; its name could be a data file's.
    expect(compose({ sourceRelativePath: "Modules/Tools/Tools.psd1", headings: computePublicSymbolHeadingInfo([{ name: "Tools", kind: "package" }]) })).toEqual([{ reason: "tooling" }]);
    expect(compose({ sourceRelativePath: "src/Hub.proj", headings: computePublicSymbolHeadingInfo([{ name: "Hub", kind: "library" }]) })).toEqual([{ reason: "tooling" }]);
  });

  it("writes no tooling for a file of a manifest's kind that publishes nothing, as a PowerShell data file", () => {
    expect(compose({ sourceRelativePath: "config/settings.psd1" })).toEqual([]);
    expect(compose({ sourceRelativePath: "config/settings.psd1", headings: computePublicSymbolHeadingInfo([{ name: "Settings", kind: "function" }]) })).toEqual([]);
  });

  it("writes declared for a file the configuration names, by path or by glob, after every other reason", () => {
    expect(compose({ config: { entryPoints: ["packages/engine/src/contracts/dependencies.ts"] } })).toEqual([{ reason: "declared" }]);
    expect(compose({ config: { entryPoints: ["packages/**/contracts/*.ts"] } })).toEqual([{ reason: "declared" }]);
    expect(compose({ config: { entryPoints: ["packages/*/contracts/*.ts"] } })).toEqual([]);
    expect(compose({
      analysis: { symbols: [], dependencies: [], program: {} },
      declaredBy: [{ declarer: "package.json", reason: "command", name: "start" }],
      sourceRelativePath: "tsconfig.json",
      config: { entryPoints: ["tsconfig.json"] }
    }).map((entry) => entry.reason)).toEqual(["program", "command", "tooling", "declared"]);
  });
});
