/**
 * Which dependency lines a Live Doc marks "type-only", held to the TypeScript compiler's own word on each imported and
 * re-exported name (`ts.isTypeOnlyImportOrExportDeclaration`: a name is type-only by its own `type` or its
 * statement's). A line of one name is type-only when every statement of the file that brings that name from that file
 * brings it as a type; a line of the whole module, when every binding of every statement that names the module does.
 * Asked over a made folder holding every form, and over the sample program `typescript/tidepool`, whose files write
 * `import { type Rng }`. Written 2026-11-22, when the reader read only a statement's modifier: the 798 names of this
 * repository written `import { type A, b }` went unmarked, and six value names were marked for the statement before.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import ts from "typescript";
import { afterAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { readLiveDocGraph } from "../../../packages/engine/src/live-docs/graphFiles";
import { generateLiveDocs } from "../../../packages/generator/src/generator";

const REPO = path.resolve(__dirname, "..", "..", "..");
const made: string[] = [];
afterAll(() => {
  for (const folder of made) fs.rmSync(folder, { recursive: true, force: true });
});

const FORMS: Record<string, string> = {
  "src/a.ts": "export interface A { x: number }\nexport type B = string;\nexport const c = 1;\nexport function d(): number { return 1; }\nexport default class D {}\n",
  // A name typed by its own modifier beside a value; a name typed by its statement, then brought again as a value; an
  // alias; a package whose names are partly types and one whose names are all types.
  "src/b.ts": [
    'import type { A } from "./a";',
    'import { type B, c } from "./a";',
    'import D, { type A as Alias } from "./a";',
    'import { d } from "./a";',
    'import { type Expect, vi } from "vitest";',
    'import type { Mock } from "vitest";',
    'import { type Bar, type Baz } from "pkg-two";',
    "export const use = (value: A, other: B, alias: Alias, m: Mock, e: Expect, bar: Bar, baz: Baz): unknown => [c, d, vi, D, value, other, alias, m, e, bar, baz];",
    ""
  ].join("\n"),
  // The statement's modifier first and a value of the same file after: the value is not a type.
  "src/c.ts": 'import type { A } from "./a";\nimport { c, d } from "./a";\nexport const value = (a: A): number => c + d();\n',
  // Re-exports: a name's own modifier, a statement's, and a value.
  "src/d.ts": 'export { type A as ReA, c as reC } from "./a";\nexport type { B as ReB } from "./a";\n',
  // A module brought only as a type, and one brought as a type and for its effect.
  "src/e.ts": 'import type * as all from "./a";\nexport type Seen = all.A;\n',
  "src/f.ts": 'import type * as all from "./a";\nimport "./a";\nexport type Seen = all.A;\n'
};

/** The compiler's word on every line a doc writes of a file: its target (a file, or the specifier of a package), its name, and whether it is type-only. */
function compilerLines(root: string, file: string): Map<string, boolean> {
  const absolute = path.join(root, file);
  const source = ts.createSourceFile(absolute, fs.readFileSync(absolute, "utf8"), ts.ScriptTarget.Latest, true);
  const options: ts.CompilerOptions = { module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, allowImportingTsExtensions: true, noEmit: true };
  const byName = new Map<string, boolean[]>();
  const byModule = new Map<string, boolean[]>();
  const resolved = new Set<string>();
  const add = (map: Map<string, boolean[]>, key: string, typeOnly: boolean): void => {
    map.set(key, [...(map.get(key) ?? []), typeOnly]);
  };
  for (const statement of source.statements) {
    if (!(ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) || !statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const specifier = statement.moduleSpecifier.text;
    const resolution = ts.resolveModuleName(specifier, absolute, options, ts.sys).resolvedModule;
    const inside = resolution && !resolution.isExternalLibraryImport ? path.relative(root, resolution.resolvedFileName).split(path.sep).join("/") : undefined;
    const target = inside ?? specifier;
    if (inside) resolved.add(target);
    const bindings: Array<[string | undefined, ts.Node]> = [];
    if (ts.isImportDeclaration(statement)) {
      const clause = statement.importClause;
      if (clause?.name) bindings.push([clause.name.text, clause]);
      if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) bindings.push([undefined, clause.namedBindings]);
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) for (const element of clause.namedBindings.elements) bindings.push([(element.propertyName ?? element.name).text, element]);
    } else if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) bindings.push([element.name.text, element]);
    }
    // A statement that binds nothing (`import "./a"`) is a use at run time.
    if (bindings.length === 0) add(byModule, target, false);
    for (const [name, node] of bindings) {
      const typeOnly = ts.isTypeOnlyImportOrExportDeclaration(node);
      add(byModule, target, typeOnly);
      if (name !== undefined && inside) add(byName, `${target}#${name}`, typeOnly);
    }
  }
  const lines = new Map<string, boolean>();
  for (const [key, marks] of byName) lines.set(key, marks.every(Boolean));
  for (const [target, marks] of byModule) {
    const named = [...byName.keys()].some((key) => key.startsWith(`${target}#`));
    if (!(resolved.has(target) && named)) lines.set(target, marks.every(Boolean));
  }
  return lines;
}

/**
 * The lines the generated docs write of a file, as the graph read back from them holds them. A name's line into a file
 * that publishes no such symbol (a JSON file's default import, `import harbour from "../levels/harbour.json"`) has no
 * anchor and is labelled as the module is, so it is keyed as the name the compiler expects there.
 */
async function docLines(root: string, file: string, expected: Map<string, boolean>): Promise<Map<string, boolean>> {
  const graph = await readLiveDocGraph({ workspaceRoot: root, config: normalizeLiveDocumentationConfig() });
  const lines = new Map<string, boolean>();
  for (const edge of graph.files[file].edges) {
    if (edge.kind !== "import" && edge.kind !== "re-export") continue;
    const name = edge.toSymbol || (edge.to && expected.has(`${edge.to}#${edge.label}`)) ? edge.label.slice(edge.label.lastIndexOf(".") + 1) : undefined;
    lines.set(edge.to ? (name ? `${edge.to}#${name}` : edge.to) : edge.label, edge.typeOnly === true);
  }
  return lines;
}

async function generated(files: Record<string, string>): Promise<string> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "type-only-names-"));
  made.push(root);
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), text);
  }
  const quiet = (): undefined => undefined;
  const result = await generateLiveDocs({ workspaceRoot: root, config: normalizeLiveDocumentationConfig(), logger: { info: quiet, warn: quiet, error: quiet } });
  expect(result.failed).toEqual([]);
  return root;
}

describe("a dependency line's type-only mark, held to the TypeScript compiler", () => {
  it("over every form: each name's own modifier, its statement's, an alias, a package, a re-export and a module", async () => {
    const root = await generated(FORMS);
    for (const file of ["src/b.ts", "src/c.ts", "src/d.ts", "src/e.ts", "src/f.ts"]) {
      const expected = compilerLines(root, file);
      expect(Object.fromEntries(await docLines(root, file, expected)), file).toEqual(Object.fromEntries(expected));
    }
    // The compiler's answers are not one way throughout.
    const marks = ["src/b.ts", "src/c.ts", "src/d.ts", "src/e.ts", "src/f.ts"].flatMap((file) => [...compilerLines(root, file).values()]);
    expect(marks.filter(Boolean).length).toBeGreaterThan(3);
    expect(marks.filter((mark) => !mark).length).toBeGreaterThan(3);
  }, 120_000);

  it("over the sample program typescript/tidepool, every file's every line", async () => {
    const sample = path.join(REPO, "tests", "integration", "programs", "typescript", "tidepool");
    const files: Record<string, string> = {};
    const walk = (folder: string): void => {
      for (const entry of fs.readdirSync(path.join(sample, folder), { withFileTypes: true })) {
        const relative = folder ? `${folder}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          if (entry.name !== "node_modules" && !entry.name.startsWith(".")) walk(relative);
        } else if (/\.(ts|tsx|json)$/u.test(entry.name)) files[relative] = fs.readFileSync(path.join(sample, relative), "utf8");
      }
    };
    walk("");
    const root = await generated(files);
    let typed = 0;
    for (const file of Object.keys(files).filter((name) => name.endsWith(".ts"))) {
      const expected = compilerLines(root, file);
      typed += [...expected.values()].filter(Boolean).length;
      expect(Object.fromEntries(await docLines(root, file, expected)), file).toEqual(Object.fromEntries(expected));
    }
    expect(typed).toBe(14);
  }, 120_000);
});
