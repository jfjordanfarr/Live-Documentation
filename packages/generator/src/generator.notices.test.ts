/**
 * A reader says why it drew nothing through `notices` on its analysis result: a short fixed phrase it chooses and the
 * subject it concerns. The run counts each reason across files and returns it, for the command to say in one line a
 * reason; nothing of it is written into a Live Doc (the root's ruling of 2026-11-19, for the .NET reader's paths that
 * several projects hold, the SQL reader's computed strings and the PowerShell reader's loads it cannot follow).
 *
 * The analysis is wrapped here, a fake reader giving two reasons across three files, so that the count is held apart
 * from what any one reader says (the PowerShell reader's own notices are held in `powershell.test.ts`).
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";

import { generateLiveDocs } from "./generator";

const FAKE: Record<string, Array<{ reason: string; subject: string }>> = {
  "a.ts": [{ reason: "paths several projects hold, left unlinked", subject: "~/Default.aspx" }],
  "b.ts": [
    { reason: "paths several projects hold, left unlinked", subject: "~/Site.master" },
    { reason: "strings computed in part, not read", subject: "line 4" }
  ],
  "c.ts": [{ reason: "strings computed in part, not read", subject: "line 9" }]
};

vi.mock("@live-documentation/engine/live-docs/core", async (importOriginal) => {
  const original = await importOriginal<typeof import("@live-documentation/engine/live-docs/core")>();
  return {
    ...original,
    analyzeSourceFile: async (...args: Parameters<typeof original.analyzeSourceFile>) => {
      const analysis = await original.analyzeSourceFile(...args);
      const notices = FAKE[path.basename(args[0])];
      return notices ? { ...analysis, notices } : analysis;
    }
  };
});

const folders: string[] = [];
afterAll(() => {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

describe("the notices readers give", () => {
  it("are counted a reason across files, with their subjects, and written into no doc", async () => {
    const workspace = mkdtempSync(path.join(tmpdir(), "generator-notices-"));
    folders.push(workspace);
    for (const name of ["a.ts", "b.ts", "c.ts", "d.ts"]) writeFileSync(path.join(workspace, name), `export const ${name[0]} = 1;\n`);

    const result = await generateLiveDocs({ workspaceRoot: workspace, config: normalizeLiveDocumentationConfig({}), logger: { info: () => undefined, warn: () => undefined, error: () => undefined } });

    expect(result.notices).toEqual([
      { reason: "paths several projects hold, left unlinked", subjects: ["a.ts: ~/Default.aspx", "b.ts: ~/Site.master"] },
      { reason: "strings computed in part, not read", subjects: ["b.ts: line 4", "c.ts: line 9"] }
    ]);
    const { readFileSync } = await import("node:fs");
    expect(readFileSync(path.join(workspace, ".live-documentation", "source", "b.ts.md"), "utf8")).not.toContain("computed in part");
  });
});
