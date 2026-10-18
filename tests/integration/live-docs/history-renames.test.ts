/**
 * The directory-rename rule over this repository's own history: the three
 * package renames of September 2026, read by hand on 2026-10-16 as whole
 * renames, and two merges into a directory that already stood, which are
 * deaths of the merged directory and never its rename. Git's own
 * `diff --name-status -M50%` and its trees at each commit are the input; the
 * expectation is the hand reading, not the rule's output.
 */
import { execFileSync } from "node:child_process";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { directoryRenames } from "../../../packages/engine/src/live-docs/history/directories";

const repoRoot = path.resolve(__dirname, "..", "..", "..");

/** Each commit, its parent, and what the hand reading expects of the directories it moved. */
const READINGS = [
  { commit: "cad63bdd", reading: "packages/server renamed to packages/generator", renamed: [["packages/server", "packages/generator"]] },
  { commit: "690f5d27", reading: "packages/shared renamed to packages/engine", renamed: [["packages/shared", "packages/engine"]] },
  { commit: "d23a6f90", reading: "packages/scripts renamed to packages/explorer", renamed: [["packages/scripts", "packages/explorer"]] },
  { commit: "86a74a76", reading: "scripts/doc-tools/__tests__ merged into scripts/doc-tools, which stood", notRenamed: ["scripts/doc-tools/__tests__"] },
  { commit: "1e36b33e", reading: "packages/explorer/src/client/views/membraneView merged into views, which stood", notRenamed: ["packages/explorer/src/client/views/membraneView"] }
] as const;

describe("the directory-rename rule over this repository's renames", () => {
  for (const entry of READINGS) {
    it(`${entry.commit}: ${entry.reading}`, (context) => {
      const absent = whyUnreadable(entry.commit);
      if (absent) {
        // Said plainly, so that a skip is never read as a pass.
        console.warn(`Skipped ${entry.commit}: ${absent}`);
        context.skip(absent);
      }
      const before = tree(`${entry.commit}^`);
      const after = tree(entry.commit);
      const renamed: Array<[string, string]> = [];
      for (const line of git(["diff", "--name-status", "-M50%", `${entry.commit}^`, entry.commit]).split("\n")) {
        const [status, from, to] = line.split("\t");
        if (status?.startsWith("R")) {
          renamed.push([from, to]);
        }
      }
      const directories = directoryRenames(before, after, renamed);
      if ("renamed" in entry) {
        for (const pair of entry.renamed) {
          expect(directories).toContainEqual([...pair]);
        }
      }
      if ("notRenamed" in entry) {
        for (const directory of entry.notRenamed) {
          expect(directories.map(([from]) => from)).not.toContain(directory);
        }
      }
      // A directory that stood before the step is never another's new name.
      for (const [, to] of directories) {
        expect(before.some((file) => file.startsWith(`${to}/`)), `${to} stood before ${entry.commit}`).toBe(false);
      }
    });
  }
});

/** Why the commit cannot be read here, or undefined when it can: a shallow clone, or a commit or parent this clone lacks. */
function whyUnreadable(commit: string): string | undefined {
  try {
    if (git(["rev-parse", "--is-shallow-repository"]).trim() === "true") {
      return "this clone is shallow, so the September 2026 renames may not be in it; fetch the whole history (CI checks out with fetch-depth 0)";
    }
    git(["cat-file", "-e", `${commit}^{commit}`]);
    git(["cat-file", "-e", `${commit}^^{commit}`]);
    return undefined;
  } catch {
    return `this clone does not hold ${commit} and its parent`;
  }
}

function tree(revision: string): string[] {
  return git(["ls-tree", "-r", "--name-only", revision]).split("\n").filter(Boolean);
}

function git(args: string[]): string {
  return execFileSync("git", ["-C", repoRoot, ...args], { encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "pipe"] });
}
