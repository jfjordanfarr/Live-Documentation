import { execFileSync } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { discoverDocuments, discoverTargetFiles } from "./discovery";
import { normalizeLiveDocumentationConfig, type LiveDocumentationConfigInput } from "../config/liveDocumentationConfig";

/**
 * A workspace with a file for every rule: hidden files and folders, files no
 * reader handles (a workflow, a `Makefile`), the repository's store,
 * installed packages at two depths, the default docs root and another folder
 * a configuration may name as its docs root, lock files of three kinds,
 * documents (markdown anywhere, an agent's skill among them, other prose
 * formats, licences and their kin by name, a note beside the docs root's base
 * layer and a readme inside it, a readme in the ignored build) beside source
 * files whose names only look like documents, a build the `.gitignore`
 * ignores, and trees a configuration may exclude.
 */
const FILES = [
  ".agents/skills/map/SKILL.md",
  ".config.json",
  ".devcontainer/devcontainer.json",
  ".git/hooks/pre-commit.js",
  ".github/workflows/ci.yml",
  ".gitignore",
  ".live-documentation/index.json",
  ".live-documentation/notes.md",
  ".live-documentation/source/helper.ts",
  ".live-documentation/source/readme.md",
  "CHANGELOG",
  "COPYING.txt",
  "LICENSE",
  "Makefile",
  "Pipfile.lock",
  "README.md",
  "dist/README.md",
  "dist/bundle.js",
  "docs/guide.rst",
  "docs/ld/index.json",
  "node_modules/dep/index.js",
  "package-lock.json",
  "packages/app/LICENSE-APACHE-2.0",
  "packages/app/node_modules/dep/index.js",
  "packages/app/packages.lock.json",
  "src/data.json",
  "src/index.ts",
  "src/license.ts",
  "src/notice_test.go",
  "src/readme-generator.ts",
  "tools/other.ts",
  "tools/self/x.ts",
  "vendor/lib.ts"
];

/** What the default discovers in that workspace: every file but the ones no configuration can have documented and the build git ignores. */
const DOCUMENTED = [
  ".config.json",
  ".devcontainer/devcontainer.json",
  ".github/workflows/ci.yml",
  ".gitignore",
  "Makefile",
  "docs/ld/index.json",
  "src/data.json",
  "src/index.ts",
  "src/license.ts",
  "src/notice_test.go",
  "src/readme-generator.ts",
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

  it("documents every file by default, hidden ones and ones no reader handles included, and never .git, node_modules, the docs root, lock files, documents or what .gitignore ignores", async () => {
    expect(await discover()).toEqual(DOCUMENTED);
  });

  it("holds configured globs and an include set to the same rules, whatever they name", async () => {
    expect(await discover({ glob: ["**/*.md", "**/*.json", "LICENSE", "CHANGELOG"] })).toEqual([".config.json", ".devcontainer/devcontainer.json", "docs/ld/index.json", "src/data.json"]);
    expect(await discover({}, ["**/*"])).toEqual(DOCUMENTED);
    expect(await discover({}, ["README.md", ".agents/skills/map/SKILL.md", "LICENSE", "packages/app/LICENSE-APACHE-2.0", "COPYING.txt", "CHANGELOG", "docs/guide.rst", "package-lock.json", "src/index.ts"]))
      .toEqual(["src/index.ts"]);
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
  /** The documents discovery finds in that workspace, as workspace-relative paths. */
  async function documents(config: LiveDocumentationConfigInput = {}): Promise<string[]> {
    return discoverDocuments({ workspaceRoot: workspace, config: normalizeLiveDocumentationConfig(config) });
  }

  it("finds the documents of the whole workspace, whatever the globs name, but the generated docs' own folder, the ignored build and what the configuration excludes", async () => {
    const all = [
      ".agents/skills/map/SKILL.md",
      ".live-documentation/notes.md",
      "CHANGELOG",
      "COPYING.txt",
      "LICENSE",
      "README.md",
      "docs/guide.rst",
      "packages/app/LICENSE-APACHE-2.0"
    ];
    expect(await documents()).toEqual(all);
    expect(await documents({ glob: ["src/**/*.ts"] })).toEqual(all);
    expect(await documents({ exclude: ["packages/**", "docs/guide.rst"] })).toEqual(all.filter((file) => !file.startsWith("packages/") && file !== "docs/guide.rst"));
    // The base layer follows the configuration: with the docs elsewhere, the readme under `.live-documentation/source` is a document like any other.
    expect(await documents({ root: "docs/ld" })).toContain(".live-documentation/source/readme.md");
    await fs.rm(path.join(workspace, ".gitignore"));
    expect(await documents()).toContain("dist/README.md");
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
