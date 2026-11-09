import * as fs from "node:fs/promises";
import * as os from "node:os";
import path from "node:path";
import ts from "typescript";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { composeDependencies, composeReExports, composeSymbolBlocks, computePublicSymbolHeadingInfo } from "./compose";
import { buildWorkspaceIndexes } from "./discovery";
import { renderLiveDoc, parseLiveDoc, type LiveDoc } from "./document";
import { deriveLiveDocGraph, linkTarget } from "./graph";
import { analyzeSourceFile } from "./sourceAnalysis";

const location = { root: ".live-documentation", baseLayer: "source", extension: ".md" };

/** A doc at `docPath` for `codePath`, rendered and parsed so the test reads what a consumer reads. */
function doc(codePath: string, parts: Partial<LiveDoc>): { docPath: string; doc: LiveDoc } {
  const text = renderLiveDoc({ codePath, layer: 4, archetype: "implementation", entries: [], authored: "### Purpose\nX.\n\n### Notes\nNone.", symbols: [], dependencies: [], ...parts });
  return { docPath: `${location.root}/${location.baseLayer}/${codePath}${location.extension}`, doc: parseLiveDoc(text) };
}

describe("deriveLiveDocGraph", () => {
  const types = doc("src/types.ts", {
    symbols: [{ name: "Widget", slug: "symbol-widget", kind: "interface", flags: [], references: [], sections: [] }],
    entries: [{ reason: "command", command: "types", declarer: { label: "package.json", link: "../package.json.md" } }]
  });
  const walk = doc("src/graph/walk.ts", {
    symbols: [
      {
        name: "walk",
        slug: "symbol-walk",
        kind: "function",
        flags: [],
        references: [
          { role: "Returns", types: [{ name: "Edge", link: "#symbol-edge", array: true }] },
          {
            role: "Parameters",
            parameters: [
              { name: "from", types: [{ name: "Widget", link: "../types.ts.md#symbol-widget" }] },
              { name: "options", types: [{ name: "Options" }] }
            ]
          }
        ],
        sections: []
      },
      { name: "Edge", slug: "symbol-edge", kind: "interface", flags: [], references: [], sections: [] }
    ],
    dependencies: [
      { label: "node:path", symbols: ["join"], qualifiers: [] },
      { label: "types.Widget", link: "../types.ts.md#symbol-widget", qualifiers: ["type-only"] },
      { label: "missing", link: "../missing.ts.md", qualifiers: [] },
      { label: "index", link: "../index.ts.md", qualifiers: ["re-export"] },
      { label: "types.POST api/widgets", link: "../types.ts.md#symbol-post-apiwidgets", qualifiers: ["contract"] },
      { label: "net.tcp://hub:8731/Hub", qualifiers: ["configuration"] }
    ]
  });
  const index = doc("src/index.ts", { dependencies: [{ label: "walk", link: "./graph/walk.ts.md", qualifiers: ["re-export"] }] });
  const graph = deriveLiveDocGraph([walk, index, types], location);

  it("keys the files by code path, in order, each carrying its parsed doc, Entry lines included", () => {
    expect(Object.keys(graph.files)).toEqual(["src/graph/walk.ts", "src/index.ts", "src/types.ts"]);
    expect(graph.files["src/types.ts"]).toMatchObject({ ...types.doc, docPath: types.docPath });
    expect(graph.files["src/types.ts"].entries).toEqual([{ reason: "command", command: "types", declarer: { label: "package.json", link: "../package.json.md" } }]);
    expect(graph.files["src/index.ts"].entries).toEqual([]);
  });

  it("makes one edge per dependency line and per linked type reference, resolved where a doc answers", () => {
    expect(graph.files["src/graph/walk.ts"].edges).toEqual([
      { kind: "import", label: "node:path" },
      { kind: "import", label: "types.Widget", link: "../types.ts.md#symbol-widget", to: "src/types.ts", toSymbol: "symbol-widget", typeOnly: true },
      { kind: "import", label: "missing", link: "../missing.ts.md" },
      { kind: "re-export", label: "index", link: "../index.ts.md", to: "src/index.ts" },
      { kind: "import", label: "types.POST api/widgets", link: "../types.ts.md#symbol-post-apiwidgets", to: "src/types.ts", toSymbol: "symbol-post-apiwidgets", basis: "contract" },
      { kind: "import", label: "net.tcp://hub:8731/Hub", basis: "configuration" },
      { kind: "returns", label: "Edge", link: "#symbol-edge", to: "src/graph/walk.ts", toSymbol: "symbol-edge", from: "symbol-walk" },
      { kind: "parameter", label: "Widget", link: "../types.ts.md#symbol-widget", to: "src/types.ts", toSymbol: "symbol-widget", from: "symbol-walk", parameter: "from" }
    ]);
  });

  it("derives the file-level adjacency both ways, without self edges", () => {
    expect(graph.files["src/graph/walk.ts"].outbound).toEqual(["src/index.ts", "src/types.ts"]);
    expect(graph.files["src/graph/walk.ts"].inbound).toEqual(["src/index.ts"]);
    expect(graph.files["src/index.ts"]).toMatchObject({ outbound: ["src/graph/walk.ts"], inbound: ["src/graph/walk.ts"] });
    expect(graph.files["src/types.ts"]).toMatchObject({ outbound: [], inbound: ["src/graph/walk.ts"] });
  });

  it("refuses two docs for one code path", () => {
    expect(() => deriveLiveDocGraph([types, { ...types, docPath: "elsewhere.md" }], location)).toThrow("two docs describe src/types.ts");
  });
});

describe("linkTarget", () => {
  const from = ".live-documentation/source/src/graph/walk.ts.md";

  it("resolves a relative link to the doc and the file it mirrors", () => {
    expect(linkTarget(from, "../types.ts.md#symbol-widget", location)).toEqual({
      docPath: ".live-documentation/source/src/types.ts.md",
      codePath: "src/types.ts",
      anchor: "symbol-widget"
    });
  });

  it("names the doc itself for a bare fragment", () => {
    expect(linkTarget(from, "#symbol-edge", location)).toEqual({ docPath: from, codePath: "src/graph/walk.ts", anchor: "symbol-edge" });
  });

  it("returns nothing for a link that leaves the docs, is absolute, or is not a Live Doc", () => {
    expect(linkTarget(from, "../../../../README.md", location)).toBeUndefined();
    expect(linkTarget(from, "https://example.com/x.md", location)).toBeUndefined();
    expect(linkTarget(from, "../../../../src/graph/walk.ts", location)).toBeUndefined();
    expect(linkTarget(from, "../types.ts", location)).toBeUndefined();
  });

  it("matches the extension without regard to case, as the workspace mount does", () => {
    expect(linkTarget(from, "../Types.ts.MD", location)?.codePath).toBe("src/Types.ts");
  });
});


describe("TypeScript binding facts through analysis, composition, markdown and graph", () => {
  let workspace: string;
  let graph: ReturnType<typeof deriveLiveDocGraph>;
  const sources: Record<string, string> = {
    "src/camera.ts": "export interface Camera { zoom: number } export default class Lens {}",
    "src/barrel.ts": 'export { Camera as PublicCamera, default as PublicLens } from "./camera";',
    "src/star.ts": 'export * from "./camera";',
    "src/loose.ts": "export interface Loose {}",
    "src/nested.ts": 'import type { Camera } from "./camera"; export type NestedConditional = number extends (number extends infer Camera ? Camera : never) ? Camera : never;',
    "src/wrong/names.ts": "export interface Camera { theta: number; phi: number } export interface Lens {} export interface PublicCamera {} export interface PublicLens {} export interface Loose {}",
    "src/wrong/external.ts": 'import type { Camera } from "three"; export function external(camera: Camera): Camera { throw 0; }',
    "src/wrong/use.ts": `
      import BorrowedLens, { Camera, Camera as Renamed } from "../camera";
      import * as Internal from "../camera";
      import type { PublicCamera, PublicLens } from "../barrel";
      import type { Camera as FromStar } from "../star";
      import type { Camera as External } from "three";
      import * as THREE from "three";
      import type { Camera as Missing } from "../missing";
      export interface Own {}
      export function inspect(camera: Camera, alias: Renamed, namespace: Internal.Camera, lens: BorrowedLens,
        publicType: PublicCamera, publicLens: PublicLens, star: FromStar,
        external: External, qualifiedExternal: THREE.Camera, missing: Missing, own: Own, loose: Loose): void {}
      export function separate(outer: Camera, callback: <Camera>(outer: Camera) => Camera): void {}
      export function generic<Camera>(value: Camera): Camera { throw 0; }
      export function inherited<Camera>(callback: <Other>(value: Camera) => Other): void {}
      export type Mapped = { [Camera in "one"]: Camera };
      export type Conditional = string extends infer Camera ? Camera : Camera;
      export class Derived extends BorrowedLens {}
      export interface Contract extends Internal.Camera {}
    `
  };

  beforeAll(async () => {
    workspace = await fs.mkdtemp(path.join(os.tmpdir(), "live-docs-type-bindings-"));
    for (const [file, text] of Object.entries(sources)) {
      await fs.mkdir(path.dirname(path.join(workspace, file)), { recursive: true });
      await fs.writeFile(path.join(workspace, file), text, "utf8");
    }
    const liveDocsRoot = `${location.root}/${location.baseLayer}`;
    const liveDocsRootAbsolute = path.join(workspace, liveDocsRoot);
    const { symbols: symbolIndex } = await buildWorkspaceIndexes({ workspaceRoot: workspace,
      targetFiles: Object.keys(sources).map(file => path.join(workspace, file)), liveDocsRoot, docExtension: location.extension });
    const documents = [];
    for (const sourceRelativePath of Object.keys(sources)) {
      const sourceAbsolute = path.join(workspace, sourceRelativePath);
      const analysis = await analyzeSourceFile(sourceAbsolute, workspace, undefined, symbolIndex);
      const headings = computePublicSymbolHeadingInfo(analysis.symbols);
      const docDir = path.dirname(path.join(liveDocsRootAbsolute, `${sourceRelativePath}${location.extension}`));
      documents.push(doc(sourceRelativePath, {
        symbols: composeSymbolBlocks({ headings, docDir, sourceAbsolute, sourceRelativePath, symbolIndex,
          liveDocsRootAbsolute, dependencies: analysis.dependencies }),
        dependencies: composeDependencies({ analysis, docDir, liveDocsRootAbsolute, docExtension: location.extension, headings, symbolIndex }),
        reExports: analysis.reExportedSymbols?.length ? composeReExports({ reExports: analysis.reExportedSymbols, docDir, liveDocsRootAbsolute,
          docExtension: location.extension, symbolIndex }) : undefined
      }));
    }
    graph = deriveLiveDocGraph(documents, location);
  });

  afterAll(async () => { if (workspace) await fs.rm(workspace, { recursive: true, force: true }); });

  const consumer = () => graph.files["src/wrong/use.ts"];
  const signatureEdges = () => consumer().edges.filter(edge => edge.kind !== "import" && edge.kind !== "re-export");

  it("rejects external and unresolved import collisions while retaining direct, alias, namespace and default internal edges", () => {
    const parameters = signatureEdges().filter(edge => edge.from === "symbol-inspect");
    expect(graph.files["src/wrong/external.ts"].edges.filter(edge => edge.kind !== "import")).toEqual([]);
    expect(graph.files["src/wrong/external.ts"].outbound).toEqual([]);
    expect(parameters.filter(edge => ["external", "qualifiedExternal", "missing"].includes(edge.parameter ?? ""))).toEqual([]);
    for (const parameter of ["camera", "alias", "namespace", "lens"]) {
      expect(parameters.filter(edge => edge.parameter === parameter)).toEqual([expect.objectContaining({
        kind: "parameter", to: "src/camera.ts", parameter, toSymbol: parameter === "lens" ? "symbol-lens" : "symbol-camera"
      })]);
    }
    expect(signatureEdges().filter(edge => edge.to === "src/wrong/names.ts").map(edge => edge.label)).toEqual(["Loose"]);
  });

  it("keeps proven named/star re-export declaration targets ahead of barrel anchors and unrelated namesakes", () => {
    const edges = signatureEdges().filter(edge => edge.from === "symbol-inspect");
    for (const parameter of ["publicType", "publicLens", "star"]) {
      expect(edges.filter(edge => edge.parameter === parameter)).toEqual([expect.objectContaining({
        to: "src/camera.ts", toSymbol: parameter === "publicLens" ? "symbol-lens" : "symbol-camera"
      })]);
    }
    expect(signatureEdges()).toContainEqual(expect.objectContaining({ from: "symbol-derived", kind: "extends", to: "src/camera.ts", toSymbol: "symbol-lens" }));
    expect(signatureEdges()).toContainEqual(expect.objectContaining({ from: "symbol-contract", kind: "extends", to: "src/camera.ts", toSymbol: "symbol-camera" }));
  });

  it("preserves a genuine imported parameter beside its same-name bound generic without introducing bound edges", () => {
    const edges = signatureEdges();
    expect(edges.filter(edge => edge.from === "symbol-separate")).toEqual([
      expect.objectContaining({ kind: "parameter", parameter: "outer", label: "Camera", to: "src/camera.ts" })
    ]);
    for (const from of ["symbol-generic", "symbol-inherited", "symbol-mapped"]) expect(edges.filter(edge => edge.from === from), from).toEqual([]);
    expect(edges.filter(edge => edge.from === "symbol-conditional")).toEqual([
      expect.objectContaining({ kind: "returns", label: "Camera", to: "src/camera.ts" })
    ]);
    const separate = consumer().symbols.find(symbol => symbol.slug === "symbol-separate")!;
    expect(separate.references).toContainEqual({ role: "Parameters", parameters: [{ name: "outer", types: [
      { name: "Camera", link: "../camera.ts.md#symbol-camera" }, { name: "Camera" }
    ] }] });
  });

  it("agrees with TypeScript that nested conditional inference does not bind the outer true branch", () => {
    const program = ts.createProgram([path.join(workspace, "src/nested.ts")], { noLib: true, types: [] });
    const source = program.getSourceFile(path.join(workspace, "src/nested.ts"))!;
    const alias = source.statements.find((statement): statement is ts.TypeAliasDeclaration =>
      ts.isTypeAliasDeclaration(statement) && statement.name.text === "NestedConditional")!;
    const checker = program.getTypeChecker();
    expect(program.getSyntacticDiagnostics(source)).toEqual([]);
    expect(program.getSemanticDiagnostics(source)).toEqual([]);
    // The nested conditional reduces to number. The outer true branch is the imported interface, with its zoom property.
    expect(checker.getTypeAtLocation(alias.name).getProperties().map(symbol => symbol.name)).toEqual(["zoom"]);
    const documented = graph.files["src/nested.ts"].edges.filter(edge => edge.kind === "returns");
    expect(documented).toEqual([expect.objectContaining({ kind: "returns", to: "src/camera.ts", toSymbol: "symbol-camera" })]);
  });

  it("retains origin-free local and legacy name resolution alongside imported bindings", () => {
    const edges = signatureEdges().filter(edge => edge.from === "symbol-inspect");
    expect(edges).toContainEqual(expect.objectContaining({ parameter: "own", to: "src/wrong/use.ts", toSymbol: "symbol-own" }));
    // Loose has no known binding: its existing same-language proximity rule still applies.
    expect(edges).toContainEqual(expect.objectContaining({ parameter: "loose", to: "src/wrong/names.ts", toSymbol: "symbol-loose" }));
  });
});
