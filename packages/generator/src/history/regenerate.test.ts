import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { writeStoredTree } from "@live-documentation/engine/live-docs/history/git";

import { generateLiveDocs, marksScan } from "../generator";
import { unread } from "./regenerate";

/**
 * What the history's tree leaves out (`unread`) against what the generator looks for in a tree by names alone: a
 * scan nested under a folder the configuration excludes is still written, so the generator still warns of it.
 */
describe("a commit's tree as the history writes it, leaving out what the configuration excludes", () => {
  const isolated = { ...process.env, GIT_CONFIG_GLOBAL: os.devNull, GIT_CONFIG_NOSYSTEM: "1", GIT_AUTHOR_NAME: "Ada", GIT_AUTHOR_EMAIL: "ada@example.invalid", GIT_COMMITTER_NAME: "Ada", GIT_COMMITTER_EMAIL: "ada@example.invalid" };
  const configuration = normalizeLiveDocumentationConfig({ root: ".mdmd", baseLayer: "layer-4", exclude: ["archive/**"] });
  let scratch: string;
  let repository: string;
  let commit: string;

  beforeAll(async () => {
    scratch = await fs.mkdtemp(path.join(os.tmpdir(), "history-unread-"));
    repository = path.join(scratch, "repository");
    const files: Record<string, string> = {
      "src/a.ts": "/** A. */\nexport const a = 1;\n",
      "archive/notes.md": "# Notes\n",
      "archive/picture.png": "not read\n",
      "archive/sub/.live-docs.config.json": "{}\n",
      "archive/other/.mdmd/layer-4/x.ts.mdmd.md": "# x\n"
    };
    for (const [file, text] of Object.entries(files)) {
      await fs.mkdir(path.dirname(path.join(repository, file)), { recursive: true });
      await fs.writeFile(path.join(repository, file), text);
    }
    execFileSync("git", ["init", "--quiet", "-b", "main"], { cwd: repository, env: isolated });
    execFileSync("git", ["add", "--all"], { cwd: repository, env: isolated });
    execFileSync("git", ["commit", "--quiet", "-m", "A nested scan under an excluded folder"], { cwd: repository, env: isolated });
    commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repository, env: isolated, encoding: "utf8" }).trim();
  });

  afterAll(async () => {
    await fs.rm(scratch, { recursive: true, force: true });
  });

  it("leaves out the excluded files and keeps those that mark a nested scan, so the generator warns of it as over a checkout", async () => {
    const tree = path.join(scratch, "tree");
    await fs.mkdir(tree);
    expect(await writeStoredTree(repository, commit, tree, { leaveOut: unread(configuration) })).toEqual([]);
    await expect(fs.access(path.join(tree, "archive", "picture.png"))).rejects.toThrow();
    await expect(fs.access(path.join(tree, "archive", "notes.md"))).rejects.toThrow();
    const warned = async (root: string): Promise<string[]> => {
      const warnings: string[] = [];
      await generateLiveDocs({ workspaceRoot: root, config: configuration, dryRun: true, logger: { info: () => undefined, warn: (message) => warnings.push(message), error: () => undefined } });
      return warnings.filter((warning) => warning.startsWith("A scan lies inside this folder")).sort();
    };
    const fromTree = await warned(tree);
    expect(fromTree).toHaveLength(2);
    expect(fromTree.join("\n")).toContain("archive/other");
    expect(fromTree.join("\n")).toContain("archive/sub");
    // The same warnings as over the whole commit.
    expect(fromTree).toEqual(await warned(repository));
  });

  it("names a scan's marks by the generator's own rule: a configuration file anywhere, anything under a docs root anywhere", () => {
    expect(marksScan("archive/sub/.live-docs.config.json", configuration)).toBe(true);
    expect(marksScan("archive/other/.mdmd/layer-4/x.ts.mdmd.md", configuration)).toBe(true);
    expect(marksScan("archive/other/.mdmd/layer-3/plan.md", configuration)).toBe(false);
    expect(marksScan("archive/my.live-docs.config.json", configuration)).toBe(false);
  });
});
