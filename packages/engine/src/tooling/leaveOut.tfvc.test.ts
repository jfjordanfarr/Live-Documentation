import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { leaveOut } from "./leaveOut";

/**
 * `leaveOut`'s `.tfignore` half held to Microsoft's own TFVC code: for each tree recorded in
 * `__fixtures__/tfignore-oracle.json`, every file TFVC's change scanner judged (Team Explorer Everywhere's
 * `LocalItemExclusionEvaluator`, compiled unchanged and run with no global exclusion list), whether it is left out and
 * which `.tfignore` and line decided. Where a file lies under a folder `tf add /recursive` does not enter, the function
 * follows `tf add`, by the root's ruling of 2026-11-21 that a folder left out is left out whole: the file is left out by
 * a `.tfignore`, and where the change scanner kept it by a `!` line, the folder's answer names that line in a note. The
 * scanner's verdicts stay recorded, and those cases are marked here, not dropped. The recording and the oracle are described in the probe of 2026-11-21,
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/`.
 */

interface RecordedTree {
  name: string;
  files: string[];
  tfignores: Record<string, string>;
  verdicts: Array<{ path: string; excluded: boolean; source: string | null; line: number | null; add: string }>;
}

const recorded = JSON.parse(fs.readFileSync(path.join(__dirname, "__fixtures__", "tfignore-oracle.json"), "utf8")) as { trees: RecordedTree[] };

/**
 * Where the function differs from the recording on purpose: the recording ran on Linux, where TEE compares a pattern's
 * folder part with regard to case (`java.io.File.equals`), and the function compares it without, as TEE does on
 * Windows, where TFVC's workspaces are.
 */
const ON_WINDOWS = new Map([["b-case docs/y.md", { excluded: true, source: ".tfignore", line: 2 }]]);

describe("leaveOut's .tfignore half against TFVC's own code", () => {
  for (const tree of recorded.trees) {
    it(tree.name, () => {
      const decide = leaveOut({ ignoreFiles: Object.entries(tree.tfignores).map(([file, text]) => ({ path: file, text })) });
      const reached = tree.verdicts.filter((verdict) => !verdict.add.startsWith("unreached:"));
      const ours = reached.map(({ path: file }) => {
        const verdict = decide.file(file);
        const rule = verdict.rule?.kind === "tfignore" ? verdict.rule : undefined;
        return { path: file, excluded: !verdict.kept, source: rule?.file ?? null, line: rule?.line ?? null };
      });
      const expected = reached.map(({ path: file, excluded, source, line }) => ({ path: file, excluded, source, line, ...ON_WINDOWS.get(`${tree.name} ${file}`) }));
      expect(ours).toEqual(expected);
      // Follows `tf add`: a file under a folder it does not enter is left out by a .tfignore, and a `!` line the scanner kept it by is named.
      for (const { path: file, excluded, source, line, add } of tree.verdicts.filter((verdict) => verdict.add.startsWith("unreached:"))) {
        const verdict = decide.file(file);
        expect({ file, kept: verdict.kept, kind: verdict.rule?.kind }).toEqual({ file, kept: false, kind: "tfignore" });
        // A `!` line in a .tfignore at or above the folder is named; one in a .tfignore inside it is never read, as `tf add` never reads it.
        const folder = add.slice("unreached:".length);
        const inside = source !== null && source.toLowerCase().startsWith(`${folder.toLowerCase()}/`);
        if (!excluded && !inside) expect(verdict.notes?.some((note) => note.startsWith(`${source} line ${line},`)), `${file}: a note names ${source} line ${line}`).toBe(true);
        if (!excluded && inside) expect(verdict.notes?.some((note) => note.startsWith(`${source} `)) ?? false, `${file}: ${source} lies inside a folder not entered, and is not read`).toBe(false);
      }
    });
  }
});
