import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * The World Map reads a board and the graphs its things name, and never source: it knows what a person wrote and what
 * the docs know, and nothing else (the standing rule of 2026-10-09 in `.mdmd/layer-3/world-map.mdmd.md`). The rule said
 * a test held the World Map's modules to that import list; on 2026-11-12 no such test was found, and this is it.
 *
 * Each of the folder's modules may import its siblings, the engine's board, the board's join, the graph and the doc
 * reader, and three of the client's helpers that carry no facts of their own: HTML escaping, the address the page was
 * opened at, and the icon button. Anything else is a new way for the World Map to learn something, and is asked about
 * here first.
 */
const ALLOWED = new Set([
  "@live-documentation/engine/live-docs/board",
  "@live-documentation/engine/live-docs/boardGraph",
  "@live-documentation/engine/live-docs/graph",
  "@live-documentation/engine/live-docs/document",
  "../../graph-helpers",
  "../../persistence/url-state",
  "../../panels/icon-button"
]);

const folder = __dirname;
const modules = readdirSync(folder).filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts") && !name.endsWith(".d.ts"));

/** Every module a source file names: imports, re-exports and dynamic imports, as TypeScript reads them. */
function importsOf(file: string): string[] {
  return ts.preProcessFile(readFileSync(path.join(folder, file), "utf8"), true, true).importedFiles.map((entry) => entry.fileName);
}

/** Whether a module name is a sibling in this folder. */
function isSibling(name: string): boolean {
  return /^\.\/[^/]+$/u.test(name);
}

describe("the World Map's imports", () => {
  it("finds the folder's modules", () => {
    expect(modules).toEqual(expect.arrayContaining(["controller.ts", "index.ts", "layout.ts", "model.ts", "projection.ts"]));
  });

  it.each(modules)("%s imports only its siblings, the board, its join, the graph, the doc reader and three fact-free helpers", (file) => {
    const strangers = importsOf(file).filter((name) => !isSibling(name) && !ALLOWED.has(name));
    expect(strangers, `${file} imports what the World Map may not read`).toEqual([]);
  });
});
