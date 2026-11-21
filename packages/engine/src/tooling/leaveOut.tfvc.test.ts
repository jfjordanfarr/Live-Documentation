import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { fromTfignores, leaveOut } from "./leaveOut";

/**
 * A tree's `.tfignore` files taken into one list by `fromTfignores` and decided by `leaveOut`, its names matched
 * without regard to case, held to Microsoft's own TFVC code; the list's deciding line is traced back to the file and
 * line it was taken from: for each tree recorded in
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

/**
 * A file inside a version control's own folder, which the function never scans (the root's ruling of 2026-11-21) and
 * TEE judges like any other on Linux, where `.git` is not hidden.
 */
const inVersionControl = (file: string): boolean => file.split("/").slice(0, -1).some((part) => /^(?:\.git|\.hg|\.svn)$/iu.test(part));

describe("a tree's .tfignore files taken into one list, against TFVC's own code", () => {
  for (const tree of recorded.trees) {
    it(tree.name, () => {
      const taken = fromTfignores(Object.entries(tree.tfignores).map(([file, text]) => ({ path: file, text })));
      expect(taken.needsIgnoreCase).toBe(true);
      const decide = leaveOut({ list: taken.lines.join("\n"), ignoreCase: true });
      const origin = (number: number | undefined) => (number === undefined ? undefined : taken.from[number - 1]);
      for (const { path: file } of tree.verdicts.filter((verdict) => inVersionControl(verdict.path))) expect(decide.file(file)).toMatchObject({ kept: false, fixed: "version control" });
      // A line the translator said it cannot carry: the verdicts TFVC gave by it are set apart, and there must be some.
      const unsaid = new Set(taken.differences.map((difference) => /^(.*) line (\d+),/u.exec(difference)).filter((found) => found !== null).map((found) => `${found[1]}:${found[2]}`));
      const byUnsaid = (verdict: RecordedTree["verdicts"][number]): boolean => unsaid.has(`${verdict.source}:${verdict.line}`);
      for (const line of unsaid) expect(tree.verdicts.some((verdict) => `${verdict.source}:${verdict.line}` === line), `${line} decides something`).toBe(true);
      const reached = tree.verdicts.filter((verdict) => !verdict.add.startsWith("unreached:") && !inVersionControl(verdict.path) && !byUnsaid(verdict));
      const ours = reached.map(({ path: file }) => {
        const verdict = decide.file(file);
        const from = origin(verdict.line?.number);
        return { path: file, excluded: !verdict.kept, source: from?.file ?? null, line: from?.line ?? null };
      });
      const expected = reached.map(({ path: file, excluded, source, line }) => ({ path: file, excluded, source, line, ...ON_WINDOWS.get(`${tree.name} ${file}`) }));
      expect(ours).toEqual(expected);
      // Follows `tf add`: a file under a folder it does not enter is left out by a .tfignore, and a `!` line the scanner kept it by is named.
      for (const { path: file, excluded, source, line, add } of tree.verdicts.filter((verdict) => verdict.add.startsWith("unreached:") && !byUnsaid(verdict))) {
        const verdict = decide.file(file);
        expect({ file, kept: verdict.kept, fromTfignore: origin(verdict.line?.number) !== undefined }).toEqual({ file, kept: false, fromTfignore: true });
        const named = (verdict.notes ?? []).map((note) => origin(Number(/^line (\d+),/u.exec(note)?.[1])));
        // A `!` line in a .tfignore at or above the folder is named; one in a .tfignore inside it is never read, as `tf add` never reads it.
        const folder = add.slice("unreached:".length);
        const inside = source !== null && source.toLowerCase().startsWith(`${folder.toLowerCase()}/`);
        if (!excluded && !inside) expect(named.some((each) => each?.file === source && each.line === line), `${file}: a note names ${source} line ${line}`).toBe(true);
      }
    });
  }
});
