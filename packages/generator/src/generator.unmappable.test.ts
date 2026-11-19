/**
 * A run that meets a file it cannot map finishes: the file is skipped and named by its source path with the reason,
 * every other doc is written, the index is written over what could be mapped, and the result counts the failures for
 * the command to exit 1 on. Until 2026-11-19 one doc the generator's own reader refused stopped the run after every
 * doc was written and before the index, and the refusal named the doc, not the source (the cold run of that day).
 *
 * The writer is wrapped here so that it writes, for one file, a doc the reader refuses: any real fault of that kind is
 * mended once found, and the run must survive the next one.
 */
import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";

import { generateLiveDocs } from "./generator";

vi.mock("@live-documentation/engine/live-docs/document", async (importOriginal) => {
  const original = await importOriginal<typeof import("@live-documentation/engine/live-docs/document")>();
  return {
    ...original,
    renderLiveDoc: (doc: Parameters<typeof original.renderLiveDoc>[0]) => {
      const text = original.renderLiveDoc(doc);
      // A line the grammar has no place for, in the generated section, as a scanner's runaway name once wrote one.
      return doc.codePath === "src/hostile.ts" ? text.replace("### Public Symbols\n", "### Public Symbols\nnot a line of the grammar\n") : text;
    }
  };
});

const folders: string[] = [];
afterAll(() => {
  for (const folder of folders.splice(0)) {
    chmodSync(folder, 0o755);
    rmSync(folder, { recursive: true, force: true });
  }
});

const silent = { info: () => undefined, warn: () => undefined, error: () => undefined };

describe("a run that meets a file it cannot map", () => {
  it("skips and names that file by its source path, writes every other doc and the index, and counts the failure", async () => {
    const workspace = mkdtempSync(path.join(tmpdir(), "generator-unmappable-"));
    folders.push(workspace);
    const src = path.join(workspace, "src");
    mkdirSync(src);
    writeFileSync(path.join(src, "a.ts"), "export const a = 1;\n");
    writeFileSync(path.join(src, "b.ts"), "import { a } from \"./a\";\nexport const b = a;\n");
    writeFileSync(path.join(src, "hostile.ts"), "export const hostile = 2;\n");

    const result = await generateLiveDocs({ workspaceRoot: workspace, config: normalizeLiveDocumentationConfig({}), logger: silent });

    expect(result.failed).toEqual([{ sourcePath: "src/hostile.ts", reason: expect.stringContaining("its own reader refuses") }]);
    expect(result.failed[0].reason).toContain("line ");
    expect(existsSync(path.join(workspace, ".live-documentation", "source", "src", "a.ts.md"))).toBe(true);
    expect(existsSync(path.join(workspace, ".live-documentation", "source", "src", "b.ts.md"))).toBe(true);
    expect(existsSync(path.join(workspace, ".live-documentation", "source", "src", "hostile.ts.md"))).toBe(false);
    expect(result.index).toBe(".live-documentation/index.json");
    expect(existsSync(path.join(workspace, ".live-documentation", "index.json"))).toBe(true);
  });

  it.skipIf(process.platform === "win32" || process.getuid?.() === 0)("skips and names a file that cannot be opened, and goes on", async () => {
    const workspace = mkdtempSync(path.join(tmpdir(), "generator-unreadable-"));
    folders.push(workspace);
    writeFileSync(path.join(workspace, "a.ts"), "export const a = 1;\n");
    writeFileSync(path.join(workspace, "locked.py"), "def locked():\n    pass\n");
    chmodSync(path.join(workspace, "locked.py"), 0o000);
    try {
      const result = await generateLiveDocs({ workspaceRoot: workspace, config: normalizeLiveDocumentationConfig({}), logger: silent });
      expect(result.failed).toEqual([{ sourcePath: "locked.py", reason: expect.stringContaining("EACCES") }]);
      expect(existsSync(path.join(workspace, ".live-documentation", "source", "a.ts.md"))).toBe(true);
      expect(existsSync(path.join(workspace, ".live-documentation", "index.json"))).toBe(true);
    } finally {
      chmodSync(path.join(workspace, "locked.py"), 0o644);
    }
  });
});
