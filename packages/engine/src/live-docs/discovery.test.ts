import { execFileSync } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { discoverTargetFiles } from "./discovery";
import { normalizeLiveDocumentationConfig, type LiveDocumentationConfigInput } from "../config/liveDocumentationConfig";

/**
 * A workspace with a file for every rule: hidden files and folders, the
 * repository's store, installed packages at two depths, the default docs root
 * and another folder a configuration may name as its docs root, lock files of
 * three kinds, a build the `.gitignore` ignores, and trees a configuration
 * may exclude.
 */
const FILES = [
  ".config.json",
  ".devcontainer/devcontainer.json",
  ".git/hooks/pre-commit.js",
  ".gitignore",
  ".live-documentation/index.json",
  ".live-documentation/source/helper.ts",
  "Pipfile.lock",
  "dist/bundle.js",
  "docs/ld/index.json",
  "node_modules/dep/index.js",
  "package-lock.json",
  "packages/app/node_modules/dep/index.js",
  "packages/app/packages.lock.json",
  "src/data.json",
  "src/index.ts",
  "tools/other.ts",
  "tools/self/x.ts",
  "vendor/lib.ts"
];

describe("discoverTargetFiles", () => {
  let workspace: string;

  beforeEach(async () => {
    workspace = await fs.mkdtemp(path.join(os.tmpdir(), "discover-target-files-"));
    for (const file of FILES) {
      await fs.mkdir(path.dirname(path.join(workspace, file)), { recursive: true });
      await fs.writeFile(path.join(workspace, file), file === ".gitignore" ? "dist/\n" : "", "utf8");
    }
  });

  afterEach(async () => {
    await fs.rm(workspace, { recursive: true, force: true });
  });

  /** The discovered files as workspace-relative paths, in the order discovery returns them. */
  async function discover(config: LiveDocumentationConfigInput = {}, include: string[] = []): Promise<string[]> {
    const files = await discoverTargetFiles({
      workspaceRoot: workspace,
      config: normalizeLiveDocumentationConfig(config),
      include: new Set(include),
      changedOnly: false
    });
    return files.map((file) => path.relative(workspace, file).split(path.sep).join("/"));
  }

  it("reads hidden files and folders like any other, and never .git, node_modules, the docs root, lock files or what .gitignore ignores", async () => {
    expect(await discover()).toEqual([
      ".config.json",
      ".devcontainer/devcontainer.json",
      "docs/ld/index.json",
      "src/data.json",
      "src/index.ts",
      "tools/other.ts",
      "tools/self/x.ts",
      "vendor/lib.ts"
    ]);
  });

  it("holds an include set to the same rules, lock files of every kind among them", async () => {
    expect(await discover({}, ["**/*"])).toEqual([
      ".config.json",
      ".devcontainer/devcontainer.json",
      ".gitignore",
      "docs/ld/index.json",
      "src/data.json",
      "src/index.ts",
      "tools/other.ts",
      "tools/self/x.ts",
      "vendor/lib.ts"
    ]);
  });

  it("derives the docs root from the configuration, however it is spelled", async () => {
    for (const root of ["docs/ld", "./docs/ld/", path.join(workspace, "docs", "ld")]) {
      const files = await discover({ root });
      expect(files, root).toContain(".live-documentation/index.json");
      expect(files, root).toContain(".live-documentation/source/helper.ts");
      expect(files, root).not.toContain("docs/ld/index.json");
    }
  });

  it("documents the build once the .gitignore no longer ignores it", async () => {
    await fs.rm(path.join(workspace, ".gitignore"));
    expect(await discover()).toContain("dist/bundle.js");
  });

  it("skips what the configuration excludes, by path or by glob, and nothing beside", async () => {
    const files = await discover({ exclude: ["vendor/**", "./tools/self/x.ts"] });
    expect(files).not.toContain("vendor/lib.ts");
    expect(files).not.toContain("tools/self/x.ts");
    expect(files).toContain("tools/other.ts");
    expect(files).toContain("src/index.ts");
  });
  it("keeps a file git tracks although the .gitignore ignores its folder, as git itself does", async () => {
    // `.vscode/` is ignored, and `.vscode/settings.json` is committed on purpose with `git add -f`.
    await fs.appendFile(path.join(workspace, ".gitignore"), ".vscode/\n", "utf8");
    await fs.mkdir(path.join(workspace, ".vscode"), { recursive: true });
    await fs.writeFile(path.join(workspace, ".vscode/settings.json"), "{}", "utf8");
    await fs.writeFile(path.join(workspace, ".vscode/tasks.json"), "{}", "utf8");
    const git = (...args: string[]): void => { execFileSync("git", args, { cwd: workspace, stdio: "ignore" }); };
    git("init", "-q");
    git("-c", "user.email=test@example.com", "-c", "user.name=test", "add", "-f", ".vscode/settings.json");

    const found = await discover();

    expect(found).toContain(".vscode/settings.json");
    expect(found).not.toContain(".vscode/tasks.json");
  });
});
