import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { LIVE_DOCUMENTATION_FILE_EXTENSION } from "../config/liveDocumentationConfig";

import {
  collectExportedSymbols,
  computePublicSymbolHeadingInfo,
  renderPublicSymbolLines
} from "./core";

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

    const rendered = renderPublicSymbolLines({
      analysis: {
        symbols,
        dependencies: []
      },
      docDir,
      sourceAbsolute,
      workspaceRoot,
      sourceRelativePath,
      headings
    });

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
