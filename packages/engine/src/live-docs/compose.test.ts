import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { composeDependencies, composeEntries, composeReExports, composeSymbolBlocks, computePublicSymbolHeadingInfo } from "./compose";
import type { TypeReference, WorkspaceSymbolIndex } from "./coreTypes";
import { buildWorkspaceIndexes } from "./discovery";
import { renderLiveDoc, parseLiveDoc, symbolName } from "./document";
import { analyzeSourceFile } from "./sourceAnalysis";

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


describe("import-bound signature composition", () => {
  const provider = "src/camera.ts", barrel = "src/barrel.ts";
  const located = (sourcePath: string, anchor: string, extra = {}) => ({ sourcePath, liveDocPath: `.live-documentation/source/${sourcePath}.md`, anchor, kind: "interface", ...extra });
  const index: WorkspaceSymbolIndex = new Map([
    ["Camera", [located("src/wrong.ts", "symbol-camera"), located(provider, "symbol-camera")]],
    ["PublicCamera", [located(barrel, "symbol-publiccamera", { isReExport: true, reExport: { sourcePath: provider, exportedName: "Camera" } })]],
    ["Lens", [located(provider, "symbol-lens")]],
    ["default", [located(provider, "symbol-lens")]]
  ]);
  const compose = (reference: TypeReference, dependencies: Parameters<typeof composeSymbolBlocks>[0]["dependencies"] = []) =>
    composeSymbolBlocks({ headings: computePublicSymbolHeadingInfo([{ name: "inspect", kind: "function", typeReferences: [reference] }]),
      docDir, sourceAbsolute, sourceRelativePath, symbolIndex: index, liveDocsRootAbsolute, dependencies })[0].references;

  it("does not guess a workspace target for external, unresolved or lexical bindings", () => {
    for (const binding of [{ kind: "bound" } as const,
      { kind: "import", specifier: "three", exportedName: "Camera" } as const,
      { kind: "import", specifier: "./missing", exportedName: "Camera" } as const]) {
      expect(compose({ name: "Camera", role: "return", binding }, [{ specifier: "three", symbols: ["Camera"], kind: "import" }]))
        .toEqual([{ role: "Returns", types: [{ name: "Camera" }] }]);
    }
  });

  it("uses symbolTargets and recorded re-export providers while retaining the source spelling", () => {
    const dependencies = [{ specifier: "./barrel", resolvedPath: barrel, symbols: ["ImportedCamera"], kind: "import" as const,
      symbolTargets: { ImportedCamera: "PublicCamera" } }];
    const references = compose({ name: "Eye", role: "return", binding: { kind: "import", specifier: "./barrel", exportedName: "ImportedCamera" } }, dependencies);
    expect(references).toEqual([{ role: "Returns", types: [{ name: "Eye", link: "../../../../src/camera.ts.md#symbol-camera" }] }]);
  });

  it("keeps a known barrel anchor when its provider is not indexed, and resolves default identity", () => {
    const unresolvedProvider: WorkspaceSymbolIndex = new Map([["PublicCamera", [located(barrel, "symbol-publiccamera", {
      isReExport: true, reExport: { sourcePath: "src/outside.ts", exportedName: "Camera" }
    })]]]);
    const [block] = composeSymbolBlocks({ headings: computePublicSymbolHeadingInfo([{ name: "inspect", kind: "function", typeReferences: [
      { name: "Eye", role: "return", binding: { kind: "import", specifier: "./barrel", exportedName: "PublicCamera" } }
    ] }]), docDir, sourceAbsolute, sourceRelativePath, symbolIndex: unresolvedProvider, liveDocsRootAbsolute,
    dependencies: [{ specifier: "./barrel", resolvedPath: barrel, symbols: ["PublicCamera"], kind: "import" }] });
    expect(block.references).toEqual([{ role: "Returns", types: [{ name: "Eye", link: "../../../../src/barrel.ts.md#symbol-publiccamera" }] }]);
    expect(compose({ name: "ImportedLens", role: "return", binding: { kind: "import", specifier: "./camera", exportedName: "default" } },
      [{ specifier: "./camera", resolvedPath: provider, symbols: ["ImportedLens"], kind: "import" }]))
      .toEqual([{ role: "Returns", types: [{ name: "ImportedLens", link: "../../../../src/camera.ts.md#symbol-lens" }] }]);
  });
});

describe("a type two files declare alike", () => {
  it("resolves to one of them whatever order the files were discovered in, as Windows and Linux order them differently", () => {
    // Equally near, equally deep, neither a barrel: once the order of discovery decided, and Windows discovers
    // `Shop.Data2\` before `Shop.Data\`, the reverse of Linux.
    const locations = ["Shop.Data/Customer.cs", "Shop.Data2/Customer.cs"].map((sourcePath) => ({
      liveDocPath: `.live-documentation/source/${sourcePath}.md`,
      sourcePath,
      anchor: "symbol-customer",
      kind: "class"
    }));
    const programPath = "App/Program.cs";
    const resolveIn = (order: typeof locations): string | undefined => {
      const headings = computePublicSymbolHeadingInfo([{ name: "Run", kind: "method", typeReferences: [{ name: "Customer", role: "parameter", parameterName: "customer" }] }]);
      const [block] = composeSymbolBlocks({
        headings,
        docDir: path.dirname(path.join(liveDocsRootAbsolute, `${programPath}.md`)),
        sourceAbsolute: path.join(workspaceRoot, programPath),
        sourceRelativePath: programPath,
        symbolIndex: new Map([["Customer", order]]),
        liveDocsRootAbsolute
      });
      const parameters = block.references.find((reference) => reference.role === "Parameters");
      return parameters?.role === "Parameters" ? parameters.parameters[0].types[0].link : undefined;
    };
    expect(resolveIn([...locations])).toBe("../Shop.Data/Customer.cs.md#symbol-customer");
    expect(resolveIn([...locations].reverse())).toBe("../Shop.Data/Customer.cs.md#symbol-customer");
  });
});

describe("composeDependencies", () => {
  it("uses only target anchors present in the workspace index, retaining missing names as file links", () => {
    const types = "packages/engine/src/types.ts";
    const barrel = "packages/engine/src/barrel.ts";
    const index: WorkspaceSymbolIndex = new Map([
      ["Widget", [{ liveDocPath: `.live-documentation/source/${types}.md`, sourcePath: types, anchor: "symbol-widget-interface", kind: "interface" }]],
      ["Alias", [{ liveDocPath: `.live-documentation/source/${barrel}.md`, sourcePath: barrel, anchor: "symbol-alias", kind: "type", isReExport: true }]]
    ]);
    const dependencies = composeDependencies({
      analysis: { symbols: [], dependencies: [
        { specifier: "../types", resolvedPath: types, symbols: ["Widget", "Missing"], kind: "import" },
        { specifier: "../barrel", resolvedPath: barrel, symbols: ["Alias"], kind: "import" }
      ] },
      docDir, liveDocsRootAbsolute, docExtension: ".md", headings: [], symbolIndex: index
    });
    expect(dependencies).toEqual([
      { label: "barrel.Alias", link: "../barrel.ts.md#symbol-alias", qualifiers: [] },
      { label: "types.Missing", link: "../types.ts.md", qualifiers: [] },
      { label: "types.Widget", link: "../types.ts.md#symbol-widget-interface", qualifiers: [] }
    ]);
  });

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

describe("composeReExports", () => {
  it("keeps the barrel's anchor while linking its origin to the provider's disambiguated heading", () => {
    const provider = "packages/engine/src/types.ts";
    const reExports = [{ name: "Widget", kind: "interface", sourceModulePath: provider }];
    const index: WorkspaceSymbolIndex = new Map([["Widget", [
      { liveDocPath: `.live-documentation/source/${provider}.md`, sourcePath: provider, anchor: "symbol-widget-interface", kind: "interface" },
      { liveDocPath: `.live-documentation/source/${provider}.md`, sourcePath: provider, anchor: "symbol-widget-const", kind: "const" }
    ]]]);
    const args = { reExports, headings: [], docDir, liveDocsRootAbsolute, docExtension: ".md" };
    expect(composeReExports({ ...args, symbolIndex: index })).toEqual([{ name: "Widget", slug: "symbol-widget", flags: [], from: { label: "types", link: "../types.ts.md#symbol-widget-interface" } }]);
    expect(composeReExports({ ...args, symbolIndex: new Map() })[0].from?.link).toBe("../types.ts.md");
    expect(composeReExports(args)[0].from?.link).toBe("../types.ts.md#symbol-widget");
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

describe("the anchor of every symbol's heading", () => {
  it("anchors a name of punctuation or symbols only by its code points, apart from every name the GitHub slug keeps", () => {
    const headings = computePublicSymbolHeadingInfo(["$", "$$", "€", "+", "_24", "u24", "24"].map((name) => ({ name, kind: "const" })));
    expect(headings.map((heading) => [heading.displayName, heading.slug])).toEqual([
      ["$", "symbol-~24"],
      ["$$", "symbol-~24~24"],
      ["€", "symbol-~20ac"],
      ["+", "symbol-~2b"],
      ["_24", "symbol-_24"],
      ["u24", "symbol-u24"],
      ["24", "symbol-24"]
    ]);
    // Each anchor reads back from the doc its heading is written into.
    const doc = parseLiveDoc(
      renderLiveDoc({
        codePath: "src/money.ts",
        layer: 4,
        archetype: "implementation",
        entries: [],
        generatedAt: "2026-11-19T00:00:00.000Z",
        authored: "### Purpose\nSelects.",
        symbols: headings.map((heading) => ({ name: heading.displayName, slug: heading.slug, kind: "const", flags: [], sections: [], references: [] })),
        dependencies: []
      })
    );
    expect(doc.symbols.map((symbol) => symbol.slug)).toEqual(headings.map((heading) => heading.slug));
  });

  it("keeps a symbol-only name's code points when it is told apart by its kind, so that one name's anchor never depends on another's", () => {
    const both = computePublicSymbolHeadingInfo([
      { name: "$", kind: "const" },
      { name: "$", kind: "type" },
      { name: "$$", kind: "const" },
      { name: "$$", kind: "type" }
    ]);
    expect(both.map((heading) => [heading.displayName, heading.slug])).toEqual([
      ["$ (const)", "symbol-~24-const"],
      ["$ (type)", "symbol-~24-type"],
      ["$$ (const)", "symbol-~24~24-const"],
      ["$$ (type)", "symbol-~24~24-type"]
    ]);
    const alone = computePublicSymbolHeadingInfo([{ name: "$$", kind: "const" }, { name: "$$", kind: "type" }]);
    expect(alone.map((heading) => heading.slug)).toEqual(["symbol-~24~24-const", "symbol-~24~24-type"]);
    // A name the slug keeps is anchored as before, by the name it displays.
    expect(computePublicSymbolHeadingInfo([{ name: "Widget", kind: "interface" }, { name: "Widget", kind: "const" }, { name: "load", kind: "function" }, { name: "load", kind: "function" }]).map((heading) => heading.slug)).toEqual([
      "symbol-widget-interface",
      "symbol-widget-const",
      "symbol-load-function-overload-1",
      "symbol-load-function-overload-2"
    ]);
  });

  it("writes every name a file can hold into a heading that reads back as that name, backticks, spaces and emptiness included", () => {
    const names = ["a`b", "``x", "`", " a", "a ", "   ", "plain", ""];
    const headings = computePublicSymbolHeadingInfo(names.map((name) => ({ name, kind: "key" })));
    // An empty name is its own; the doc writes it quoted, `` `""` ``, and a key spelled with two quotes, which begins with one, quoted too.
    const empty = computePublicSymbolHeadingInfo([{ name: "", kind: "key" }, { name: '""', kind: "key" }, { name: "a", kind: "key" }]);
    expect(empty.map((heading) => [heading.displayName, heading.slug])).toEqual([
      ["", "symbol-~"],
      ['""', "symbol-~22~22"],
      ["a", "symbol-a"]
    ]);
    const emptyText = renderLiveDoc({ codePath: "keys.json", layer: 4, entries: [], authored: "### Purpose\nHolds keys.", symbols: empty.map((heading) => ({ name: heading.displayName, slug: heading.slug, kind: "key", flags: [], sections: [], references: [] })), dependencies: [] });
    expect(emptyText).toContain('\n#### `""` {#symbol-~}\n- Type: key\n\n#### `"\\"\\""` {#symbol-~22~22}\n');
    expect(parseLiveDoc(emptyText).symbols.map((symbol) => symbol.name)).toEqual(["", '""', "a"]);
    const text = renderLiveDoc({
      codePath: "config.json",
      layer: 4,
      archetype: "implementation",
      entries: [{ reason: "program", symbol: { name: "a`b" } }],
      generatedAt: "2026-11-19T00:00:00.000Z",
      authored: "### Purpose\nHolds keys.",
      symbols: headings.map((heading) => ({ name: heading.displayName, slug: heading.slug, kind: "key", flags: [], sections: [{ title: "Summary", body: ["A key."] }], references: [] })),
      dependencies: []
    });
    const doc = parseLiveDoc(text);
    expect(doc.symbols.map((symbol) => [symbol.name, symbol.slug])).toEqual(headings.map((heading) => [heading.displayName, heading.slug]));
    expect(doc.entries[0].symbol).toEqual({ name: "a`b" });
  });

  it("gives a name that ends in a parenthesised word its kind, so that the heading's name is the whole name", () => {
    const headings = computePublicSymbolHeadingInfo([{ name: "build (prod)", kind: "key" }, { name: "x (key)", kind: "key" }, { name: "x", kind: "key" }]);
    expect(headings.map((heading) => [heading.displayName, heading.slug])).toEqual([
      ["build (prod) (key)", "symbol-build-prod"],
      ["x (key) (key)", "symbol-x-key"],
      ["x", "symbol-x"]
    ]);
    expect(headings.map((heading) => symbolName({ name: heading.displayName }))).toEqual(["build (prod)", "x (key)", "x"]);
  });

  it("anchors two re-exports one anchor would name apart, by the rule of two symbols, in the doc and in the workspace index alike", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "re-export-anchors-"));
    try {
      await fs.mkdir(path.join(root, "src"));
      await fs.writeFile(path.join(root, "src", "a.ts"), "export const Foo = 1;\n");
      await fs.writeFile(path.join(root, "src", "b.ts"), "export const foo = 2;\n");
      // The barrel also declares `FOO`, whose anchor its re-exports must keep apart from, too: one doc, one namespace.
      await fs.writeFile(path.join(root, "src", "index.ts"), "export * from \"./a\";\nexport * from \"./b\";\nexport const FOO = 3;\n");
      const barrel = path.join(root, "src", "index.ts");
      const { symbols: index } = await buildWorkspaceIndexes({
        targetFiles: ["a.ts", "b.ts", "index.ts"].map((name) => path.join(root, "src", name)),
        workspaceRoot: root,
        liveDocsRoot: "docs/layer-4",
        docExtension: ".md"
      });
      const analysis = await analyzeSourceFile(barrel, root, undefined, index);
      const reExports = composeReExports({
        reExports: analysis.reExportedSymbols ?? [],
        headings: computePublicSymbolHeadingInfo(analysis.symbols),
        docDir: path.join(root, "docs", "layer-4", "src"),
        liveDocsRootAbsolute: path.join(root, "docs", "layer-4"),
        docExtension: ".md",
        symbolIndex: index
      });
      // `Foo` and `foo` once shared `symbol-foo`, so a link to `foo` through the barrel landed on `Foo`.
      expect(computePublicSymbolHeadingInfo(analysis.symbols).map((heading) => heading.slug)).toEqual(["symbol-foo"]);
      expect(reExports.map((entry) => [entry.name, entry.slug])).toEqual([["Foo", "symbol-foo-1"], ["foo", "symbol-foo-2"]]);
      expect(["FOO", "Foo", "foo"].map((name) => index.get(name)?.find((location) => location.sourcePath === "src/index.ts")?.anchor)).toEqual(["symbol-foo", "symbol-foo-1", "symbol-foo-2"]);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });
});
