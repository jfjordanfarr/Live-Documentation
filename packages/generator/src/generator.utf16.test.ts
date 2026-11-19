/**
 * A source file saved as UTF-16 without a byte-order mark gets what its UTF-8 twin gets: its archetype and its
 * symbols. The binary sniff called such a file binary for its zero bytes, while the one reading step read it as text,
 * so the doc said it was a binary asset and listed the symbols its reader found (the joining of 2026-11-19): a head
 * the reading step reads as unmarked UTF-16 is not binary.
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { parseLiveDoc } from "@live-documentation/engine/live-docs/document";

import { generateLiveDocs } from "./generator";

const folders: string[] = [];
afterAll(() => {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

const silent = { info: () => undefined, warn: () => undefined, error: () => undefined };

describe("a source file saved as UTF-16 without a byte-order mark", () => {
  it("gets its UTF-8 twin's archetype and symbols", async () => {
    const workspace = mkdtempSync(path.join(tmpdir(), "generator-utf16-"));
    folders.push(workspace);
    const text = (name: string): string => `/** Lists the orders. */\nexport function ${name}(): string[] {\n  return [];\n}\n`;
    writeFileSync(path.join(workspace, "plain.ts"), text("listOrders"));
    writeFileSync(path.join(workspace, "saved.ts"), Buffer.from(text("listOrders"), "utf16le"));
    await generateLiveDocs({ workspaceRoot: workspace, config: normalizeLiveDocumentationConfig({}), logger: silent });
    const read = (name: string): { archetype: string; symbols: string[] } => {
      const doc = parseLiveDoc(readFileSync(path.join(workspace, ".live-documentation", "source", `${name}.md`), "utf8"));
      return { archetype: doc.archetype, symbols: doc.symbols.map((symbol) => symbol.name) };
    };
    const plain = read("plain.ts");
    expect(plain.symbols.length).toBeGreaterThan(0);
    expect(read("saved.ts")).toEqual(plain);
  });
});
