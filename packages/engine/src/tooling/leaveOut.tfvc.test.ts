import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { leaveOut } from "./leaveOut";

/**
 * `leaveOut`'s `.tfignore` half held to Microsoft's own TFVC code: for each tree recorded in
 * `__fixtures__/tfignore-oracle.json`, every file TFVC's change scanner judged (Team Explorer Everywhere's
 * `LocalItemExclusionEvaluator`, compiled unchanged and run with no global exclusion list), whether it is left out and
 * which `.tfignore` and line decided. The recording and the oracle are described in the probe of 2026-11-21,
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/`.
 */

interface RecordedTree {
  name: string;
  files: string[];
  tfignores: Record<string, string>;
  verdicts: Array<{ path: string; excluded: boolean; source: string | null; line: number | null }>;
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
      const ours = tree.verdicts.map(({ path: file }) => {
        const verdict = decide.file(file);
        const rule = verdict.rule?.kind === "tfignore" ? verdict.rule : undefined;
        return { path: file, excluded: !verdict.kept, source: rule?.file ?? null, line: rule?.line ?? null };
      });
      const expected = tree.verdicts.map((verdict) => ({ ...verdict, ...ON_WINDOWS.get(`${tree.name} ${verdict.path}`) }));
      expect(ours).toEqual(expected);
    });
  }
});
