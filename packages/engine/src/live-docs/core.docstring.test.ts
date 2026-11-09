import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import {
  collectExportedSymbols,
  computePublicSymbolHeadingInfo,
  composeSymbolBlocks
} from "./core";
import { renderSymbolBlocks } from "./document";
import { LIVE_DOCUMENTATION_FILE_EXTENSION } from "../config/liveDocumentationConfig";


describe("TypeScript docstring bridging", () => {
  it("captures structured metadata from JSDoc blocks", () => {
    const workspaceRoot = path.resolve("/__workspace__");
    const sourceRelativePath = "packages/server/src/features/live-docs/generation/docstringFixture.ts";
    const sourceAbsolute = path.join(workspaceRoot, sourceRelativePath);

    const sourceText = `/**
 * Orchestrates Live Docs generation for test coverage.
 *
 * @remarks
 * Ensures consistent extraction for structured docstrings.
 *
 * @template T - Result payload type.
 * @param options - Command options bag.
 * @param options.workspaceRoot - Root where artifacts are written.
 * @param options.includePatterns - Optional glob list for filtering.
 * @returns Resolves when generation completes.
 * @throws {RangeError} If includePatterns contains raw brackets.
 * @see https://example.test/docs
 * @deprecated Use runGenerator instead.
 * @example
 * \`\`\`ts
 * await orchestrate({ workspaceRoot: "/tmp" });
 * \`\`\`
 */
export async function orchestrate<T>(options: { workspaceRoot: string; includePatterns?: string[] }): Promise<void> {
  if (!options.workspaceRoot) {
    throw new RangeError("workspaceRoot is required");
  }
  if (options.includePatterns?.some((pattern) => pattern.includes("["))) {
    throw new RangeError("includePatterns must not contain raw brackets");
  }
}
`;

    const sourceFile = ts.createSourceFile(
      sourceAbsolute,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS
    );

    const symbols = collectExportedSymbols(sourceFile);
    expect(symbols).toHaveLength(1);

    const symbol = symbols[0];
    expect(symbol.name).toBe("orchestrate");
    expect(symbol.documentation).toBeDefined();

    const documentation = symbol.documentation!;
    expect(documentation.summary).toBe("Orchestrates Live Docs generation for test coverage.");
    expect(documentation.remarks).toContain("structured docstrings");

    expect(documentation.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "options",
          description: "Command options bag."
        }),
        expect.objectContaining({
          name: "options.workspaceRoot",
          description: "Root where artifacts are written."
        }),
        expect.objectContaining({
          name: "options.includePatterns",
          description: "Optional glob list for filtering."
        })
      ])
    );

    expect(documentation.typeParameters).toEqual([
      {
        name: "T",
        description: "Result payload type."
      }
    ]);

    expect(documentation.returns).toBe("Resolves when generation completes.");

    expect(documentation.exceptions).toEqual([
      {
        type: "RangeError",
        description: "If includePatterns contains raw brackets."
      }
    ]);

    expect(documentation.links).toEqual([
      {
        kind: "href",
        target: "https://example.test/docs",
        text: undefined
      }
    ]);

    expect(documentation.rawFragments).toEqual(["@deprecated Use runGenerator instead."]);

    expect(documentation.examples?.[0]).toMatchObject({
      code: 'await orchestrate({ workspaceRoot: "/tmp" });',
      language: "ts"
    });

    const docAbsolute = path.join(
      workspaceRoot,
      ".live-documentation",
      "source",
      `${sourceRelativePath}${LIVE_DOCUMENTATION_FILE_EXTENSION}`
    );
    const docDir = path.dirname(docAbsolute);

    const headings = computePublicSymbolHeadingInfo(symbols);

    const rendered = renderSymbolBlocks(composeSymbolBlocks({ headings, docDir, sourceAbsolute, sourceRelativePath }));

    const summaryIndex = rendered.indexOf("##### `orchestrate` — Summary");
    expect(summaryIndex).toBeGreaterThan(-1);
    expect(rendered[summaryIndex + 1]).toBe(
      "Orchestrates Live Docs generation for test coverage."
    );

    const parametersIndex = rendered.indexOf("##### `orchestrate` — Parameters");
    expect(parametersIndex).toBeGreaterThan(-1);
    expect(rendered.slice(parametersIndex + 1, parametersIndex + 4)).toEqual([
      "- `options`: Command options bag.",
      "- `options.includePatterns`: Optional glob list for filtering.",
      "- `options.workspaceRoot`: Root where artifacts are written."
    ]);

    const returnsIndex = rendered.indexOf("##### `orchestrate` — Returns");
    expect(returnsIndex).toBeGreaterThan(-1);
    expect(rendered[returnsIndex + 1]).toBe("Resolves when generation completes.");

    const exceptionsIndex = rendered.indexOf("##### `orchestrate` — Exceptions");
    expect(exceptionsIndex).toBeGreaterThan(-1);
    expect(rendered[exceptionsIndex + 1]).toBe(
      "- `RangeError`: If includePatterns contains raw brackets."
    );

    const examplesIndex = rendered.indexOf("##### `orchestrate` — Examples");
    expect(examplesIndex).toBeGreaterThan(-1);
    expect(rendered[examplesIndex + 1]).toBe("```ts");
    expect(rendered[examplesIndex + 2]).toBe('await orchestrate({ workspaceRoot: "/tmp" });');
    expect(rendered[examplesIndex + 3]).toBe("```");

    const linksIndex = rendered.indexOf("##### `orchestrate` — Links");
    expect(linksIndex).toBeGreaterThan(-1);
    expect(rendered[linksIndex + 1]).toBe(
      "- [https://example.test/docs](https://example.test/docs)"
    );

    const additionalIndex = rendered.indexOf("##### `orchestrate` — Additional Documentation");
    expect(additionalIndex).toBeGreaterThan(-1);
    expect(rendered[additionalIndex + 1]).toBe("- @deprecated Use runGenerator instead.");
  });

  it("appends suffixes when normalized symbol slugs collide", () => {
    const symbols = [
      { name: "LayoutConstants", kind: "interface" },
      { name: "layoutConstants", kind: "const" }
    ];

    const headings = computePublicSymbolHeadingInfo(symbols);
    expect(headings).toHaveLength(2);

    const interfaceHeading = headings.find((heading) => heading.symbol.name === "LayoutConstants");
    const constHeading = headings.find((heading) => heading.symbol.name === "layoutConstants");

    expect(interfaceHeading?.displayName).toBe("LayoutConstants (interface)");
    expect(interfaceHeading?.slug).toBe("symbol-layoutconstants-interface");

    expect(constHeading?.displayName).toBe("layoutConstants (const)");
    expect(constHeading?.slug).toBe("symbol-layoutconstants-const");
  });
});


describe("TypeScript signature bindings", () => {
  const symbolsOf = (text: string) => collectExportedSymbols(ts.createSourceFile("binding.ts", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS));

  it("keeps named, renamed, namespace and default import identities, including heritage", () => {
    const symbols = symbolsOf(`
      import Lens, { Camera as Eye } from "three";
      import * as THREE from "three";
      export function inspect(eye: Eye, qualified: THREE.Camera, lens: Lens): void {}
      export class Derived extends Eye {}
      export interface Contract extends THREE.Camera {}
    `);
    expect(symbols[0].typeReferences).toEqual([
      { name: "Eye", role: "parameter", parameterName: "eye", binding: { kind: "import", specifier: "three", exportedName: "Camera" } },
      { name: "THREE.Camera", role: "parameter", parameterName: "qualified", binding: { kind: "import", specifier: "three", exportedName: "Camera" } },
      { name: "Lens", role: "parameter", parameterName: "lens", binding: { kind: "import", specifier: "three", exportedName: "default" } }
    ]);
    expect(symbols[1].typeReferences).toEqual([{ name: "Eye", role: "extends", binding: { kind: "import", specifier: "three", exportedName: "Camera" } }]);
    expect(symbols[2].typeReferences).toEqual([{ name: "THREE.Camera", role: "extends", binding: { kind: "import", specifier: "three", exportedName: "Camera" } }]);
  });

  it("keeps a genuine import and a shadowed generic separate even at the same parameter name and role", () => {
    const [symbol] = symbolsOf(`import type { Camera } from "./camera";
      export function inspect(outer: Camera, callback: <Camera>(outer: Camera) => Camera): void {}`);
    expect(symbol.typeReferences).toEqual([
      { name: "Camera", role: "parameter", parameterName: "outer", binding: { kind: "import", specifier: "./camera", exportedName: "Camera" } },
      { name: "Camera", role: "parameter", parameterName: "outer", binding: { kind: "bound" } },
      { name: "Camera", role: "return", binding: { kind: "bound" } }
    ]);
  });

  it("recognizes inherited, mapped and inferred bindings at their lexical scope, leaving origin-free types alone", () => {
    const symbols = symbolsOf(`import type { Camera } from "./camera";
      export function generic<Camera>(callback: <Other>(value: Camera) => Other): Camera { throw 0; }
      export type Mapped = { [Camera in "one"]: Camera };
      export type Conditional = string extends infer Camera ? Camera : Camera;
      export type NestedConditional = string extends (number extends infer Camera ? string : string) ? Camera : never;
      export function local(value: Own): Own { throw 0; }
      export default class NamedLens {}
    `);
    expect(symbols[0].typeReferences).toEqual([
      { name: "Camera", role: "parameter", parameterName: "value", binding: { kind: "bound" } },
      { name: "Other", role: "return", binding: { kind: "bound" } },
      { name: "Camera", role: "return", binding: { kind: "bound" } }
    ]);
    expect(symbols[1].typeReferences).toEqual([{ name: "Camera", role: "property", binding: { kind: "bound" } }]);
    expect(symbols[2].typeReferences).toEqual([
      { name: "Camera", role: "return", binding: { kind: "bound" } },
      { name: "Camera", role: "return", binding: { kind: "import", specifier: "./camera", exportedName: "Camera" } }
    ]);
    expect(symbols[3].typeReferences).toEqual([
      { name: "Camera", role: "return", binding: { kind: "import", specifier: "./camera", exportedName: "Camera" } }
    ]);
    expect(symbols[4].typeReferences).toEqual([
      { name: "Own", role: "parameter", parameterName: "value" }, { name: "Own", role: "return" }
    ]);
    expect(symbols[5].isDefault).toBe(true);
  });
});
