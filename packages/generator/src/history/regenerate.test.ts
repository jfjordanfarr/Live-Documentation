import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { writeStoredTree } from "@live-documentation/engine/live-docs/history/git";

import { generateLiveDocs } from "../generator";
import { treeOptions } from "./regenerate";

/**
 * What the history's tree holds (`treeOptions`) against what the generator looks for in a tree by names alone: every
 * name stands, an excluded image or recording only empty, so a scan nested under a folder the configuration excludes
 * is still found, and the generator still warns of it.
 */
describe("a commit's tree as the history writes it, emptying the images and recordings the configuration excludes", () => {
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
      "archive/clip.webm": "not a recording\n",
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

  it("writes every name, empties the excluded images and recordings, and the generator warns of a nested scan as over a checkout", async () => {
    const tree = path.join(scratch, "tree");
    await fs.mkdir(tree);
    expect(await writeStoredTree(repository, commit, tree, treeOptions(configuration, tree))).toEqual([]);
    // No reader reads a picture's or a recording's bytes: their names stand, empty. A note, and a configuration file, are whole.
    expect(await fs.readFile(path.join(tree, "archive", "picture.png"), "utf8")).toBe("");
    expect(await fs.readFile(path.join(tree, "archive", "clip.webm"), "utf8")).toBe("");
    expect(await fs.readFile(path.join(tree, "archive", "notes.md"), "utf8")).toBe("# Notes\n");
    expect(await fs.readFile(path.join(tree, "archive", "sub", ".live-docs.config.json"), "utf8")).toBe("{}\n");
    expect(await fs.readFile(path.join(tree, "src", "a.ts"), "utf8")).toBe("/** A. */\nexport const a = 1;\n");
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
});
