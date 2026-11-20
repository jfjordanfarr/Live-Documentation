import { execFileSync } from "node:child_process";
import nodeFs from "node:fs";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { normalizeLiveDocumentationConfig, type LiveDocumentationConfigInput } from "../config/liveDocumentationConfig";
import { gitIgnores } from "../tooling/gitIgnored";
import { discoverDocuments, discoverTargetFiles, inWorkspaceOrder } from "./discovery";

const foldersGitIgnoresWhole = (root: string): ReadonlySet<string> => gitIgnores(root)?.folders ?? new Set();

/** Whether this disk tells apart two names that differ in case alone, as Linux's do and Windows' and macOS's do not. */
const diskTellsCaseApart = ((): boolean => {
  const probe = nodeFs.mkdtempSync(path.join(os.tmpdir(), "case-probe-"));
  nodeFs.writeFileSync(path.join(probe, "a"), "");
  const apart = !nodeFs.existsSync(path.join(probe, "A"));
  nodeFs.rmSync(probe, { recursive: true, force: true });
  return apart;
})();

/**
 * A workspace with a file for every rule: hidden files and folders, files no
 * reader handles (a workflow, a `Makefile`), the repository's store,
 * installed packages at two depths, the default docs root and another folder
 * a configuration may name as its docs root, dependency and container lock files,
 * documents (markdown anywhere, an agent's skill among them, other prose
 * formats, licences and their kin by name, a note beside the docs root's base
 * layer and a readme inside it, a readme in the ignored build) beside source
 * files whose names only look like documents, a build the `.gitignore`
 * ignores, and trees a configuration may exclude.
 */
const FILES = [
  ".agents/skills/map/SKILL.md",
  ".config.json",
  ".devcontainer-lock.json",
  ".devcontainer/devcontainer-lock.json",
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

describe("inWorkspaceOrder", () => {
  it("orders files by their workspace paths, the same whether the platform spells them with slashes or backslashes", () => {
    const relative = ["Data/Order.cs", "DataAccess/Order.cs", "Shop.Data/Customer.cs", "Shop.Data2/Customer.cs", "src/a.cs", "src0/a.cs"];
    const linux = relative.map((file) => ({ absolute: `/repo/${file}`, relative: file }));
    const windows = relative.map((file) => ({ absolute: `C:\\repo\\${file.split("/").join("\\")}`, relative: file }));
    // An order of the absolute paths, as discovery once sorted, puts Windows's `DataAccess\\` before `Data\\`.
    expect([...windows].sort((a, b) => (a.absolute < b.absolute ? -1 : 1)).map((file) => file.relative)).not.toEqual(relative);
    expect(inWorkspaceOrder([...linux].reverse()).map((file) => file.relative)).toEqual(relative);
    expect(inWorkspaceOrder([...windows].reverse()).map((file) => file.relative)).toEqual(relative);
  });
});

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

  it("reads file symlinks but never mistakes directory or dangling symlinks for source or documents", async () => {
    await fs.symlink("src/index.ts", path.join(workspace, "entry.ts"));
    await fs.symlink("README.md", path.join(workspace, "guide.md"));
    await fs.symlink(".agents/skills", path.join(workspace, "skills"));
    await fs.symlink("src", path.join(workspace, "directory.md"));
    await fs.symlink("missing.ts", path.join(workspace, "dangling.ts"));
    await fs.symlink("missing.md", path.join(workspace, "dangling.md"));

    expect(await discover()).toEqual([...DOCUMENTED, "entry.ts"].sort());
    expect(await discover({}, ["skills", "directory.md", "dangling.ts", "entry.ts"]))
      .toEqual(["entry.ts"]);
    expect(await documents()).toContain("guide.md");
    expect(await documents()).not.toContain("directory.md");
    expect(await documents()).not.toContain("dangling.md");
  });

  it("leaves container feature locks out even when named explicitly, while keeping configuration and similarly named source files", async () => {
    const configuration = ".devcontainer.json";
    const source = "src/devcontainer-lock.json.ts";
    await fs.writeFile(path.join(workspace, configuration), '{"features":{}}', "utf8");
    await fs.writeFile(path.join(workspace, source), "export const lock = 1;", "utf8");
    const include = [".devcontainer-lock.json", ".devcontainer/devcontainer-lock.json", ".devcontainer/devcontainer.json", configuration, source];

    expect(await discover({}, include)).toEqual([".devcontainer.json", ".devcontainer/devcontainer.json", source]);
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

/**
 * A pattern in `exclude` follows what git does for the repository: where git's `core.ignorecase` is true, as git sets
 * it on a clone on Windows or macOS, the pattern matches a path in any case; otherwise exactly (the root's ruling of
 * 2026-11-19, after the Windows and command-line probe found `vendor/**` missing `Vendor/`). Each case imitates one.
 */
describe("exclude and the case of a path", () => {
  const folders: string[] = [];
  afterEach(async () => {
    for (const folder of folders.splice(0)) await fs.rm(folder, { recursive: true, force: true });
  });

  async function repository(ignoreCase: boolean | undefined): Promise<string> {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "discovery-case-"));
    folders.push(root);
    execFileSync("git", ["init", "-q"], { cwd: root });
    if (ignoreCase !== undefined) execFileSync("git", ["config", "core.ignorecase", String(ignoreCase)], { cwd: root });
    await fs.mkdir(path.join(root, "Vendor"));
    await fs.writeFile(path.join(root, "Vendor", "Lib.cs"), "class Lib { }\n");
    await fs.writeFile(path.join(root, "App.cs"), "class App { }\n");
    return root;
  }

  async function found(root: string): Promise<string[]> {
    const config = normalizeLiveDocumentationConfig({ exclude: ["vendor/**"] });
    return (await discoverTargetFiles({ workspaceRoot: root, config, include: new Set(), changedOnly: false })).map((file) => path.relative(root, file).split(path.sep).join("/"));
  }

  it("matches in any case where git ignores case", async () => {
    expect(await found(await repository(true))).toEqual(["App.cs"]);
  });

  it("matches exactly where git does not, and where git says nothing", async () => {
    expect(await found(await repository(false))).toEqual(["App.cs", "Vendor/Lib.cs"]);
    expect(await found(await repository(undefined))).toEqual(["App.cs", "Vendor/Lib.cs"]);
  });
});

/**
 * Since 2026-11-20 the walk does not read the folders git ignores whole, and finds the same files and documents as
 * before. Each case is one where a wrong shortening would find another list: a folder that holds a tracked file, the
 * kinds of excludes file, nested repositories, odd names, git's case rule, and the paths git refuses, after which
 * discovery reads the root `.gitignore` alone. A folder `.git/info/exclude` names stands for what that rule keeps and
 * git's own answer drops.
 */
describe("the folders git ignores whole", () => {
  const folders: string[] = [];
  const globalConfig = process.env.GIT_CONFIG_GLOBAL;
  afterEach(async () => {
    for (const folder of folders.splice(0)) await fs.rm(folder, { recursive: true, force: true });
    if (globalConfig === undefined) delete process.env.GIT_CONFIG_GLOBAL;
    else process.env.GIT_CONFIG_GLOBAL = globalConfig;
  });

  async function repository(files: Record<string, string>): Promise<string> {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "discovery-ignored-"));
    folders.push(root);
    for (const [relative, text] of Object.entries(files)) {
      await fs.mkdir(path.dirname(path.join(root, relative)), { recursive: true });
      await fs.writeFile(path.join(root, relative), text);
    }
    git(root, "init", "-q");
    return root;
  }

  function git(root: string, ...args: string[]): void {
    execFileSync("git", ["-C", root, "-c", "user.email=test@example.com", "-c", "user.name=test", ...args], { stdio: "ignore" });
  }

  async function found(root: string, config: LiveDocumentationConfigInput = {}): Promise<{ files: string[]; documents: string[] }> {
    const normalized = normalizeLiveDocumentationConfig(config);
    const files = await discoverTargetFiles({ workspaceRoot: root, config: normalized, include: new Set(), changedOnly: false });
    return { files: files.map((file) => path.relative(root, file).split(path.sep).join("/")), documents: await discoverDocuments({ workspaceRoot: root, config: normalized }) };
  }

  it("never reads a folder git ignores whole, and reads one that holds a tracked file", async () => {
    const root = await repository({ ".gitignore": "build/\nmixed/\n", "a.ts": "", "README.md": "", "build/deep/b.ts": "", "mixed/kept.ts": "", "mixed/sub/c.ts": "" });
    git(root, "add", "-f", "mixed/kept.ts");
    // Every folder the shortened walks read, they read through the file system they hand glob, which reads the others
    // with `fs.readdir`; walks that shortened nothing would read none through it, and are red here too.
    const read: string[] = [];
    const note = (folder: unknown): void => {
      read.push(path.relative(root, String(folder)).split(path.sep).join("/"));
    };
    const readdir = nodeFs.readdir;
    const spy = vi.spyOn(nodeFs, "readdir").mockImplementation(((...args: unknown[]) => {
      note(args[0]);
      return Reflect.apply(readdir, nodeFs, args);
    }) as unknown as typeof nodeFs.readdir);
    let result: { files: string[]; documents: string[] };
    try {
      result = await found(root);
    } finally {
      spy.mockRestore();
    }
    expect(result).toEqual({ files: [".gitignore", "a.ts", "mixed/kept.ts"], documents: ["README.md"] });
    // Both walks, the files' and the documents', read the workspace and `mixed`, and nothing else.
    expect([...new Set(read)].sort()).toEqual(["", "mixed"]);
  });

  it("keeps a tracked file inside an ignored folder and what no excludes file names, and drops what each kind names", async () => {
    const excludes = path.join(await fs.mkdtemp(path.join(os.tmpdir(), "discovery-global-")), "excludes");
    folders.push(path.dirname(excludes));
    await fs.writeFile(excludes, "global/\n");
    await fs.writeFile(`${excludes}.gitconfig`, `[core]\n\texcludesFile = ${excludes}\n`);
    process.env.GIT_CONFIG_GLOBAL = `${excludes}.gitconfig`;
    const root = await repository({
      ".gitignore": "build/\nmixed/\n*.log\n", "a.ts": "",
      "build/b.ts": "", "build/deep/README.md": "",
      "mixed/kept.ts": "", "mixed/dropped.ts": "", "mixed/sub/c.ts": "", "mixed/sub/NOTES.md": "",
      "logs/x.log": "", "part/y.log": "", "part/kept.ts": "",
      "sub/.gitignore": "local/\n", "sub/local/d.ts": "", "sub/kept.ts": "",
      "excluded/e.ts": "", "global/g.ts": "", "global/README.md": "", "README.md": ""
    });
    await fs.appendFile(path.join(root, ".git", "info", "exclude"), "excluded/\n");
    git(root, "add", "-f", "mixed/kept.ts");

    expect(await found(root)).toEqual({ files: [".gitignore", "a.ts", "mixed/kept.ts", "part/kept.ts", "sub/.gitignore", "sub/kept.ts"], documents: ["README.md"] });
    expect([...foldersGitIgnoresWhole(root)].sort()).toEqual(["build", "excluded", "global", "logs", "mixed/sub", "sub/local"]);
  });

  it("does not walk a nested repository or a worktree inside an ignored folder, and reads one elsewhere as before", async () => {
    const root = await repository({ ".gitignore": "ignored/\n", "a.ts": "", "ignored/nested/n.ts": "", "open/nested/m.ts": "", "open/nested/.gitignore": "build/\n", "open/nested/build/out.ts": "" });
    git(root, "add", ".gitignore", "a.ts");
    git(root, "commit", "-qm", "first");
    git(path.join(root, "ignored", "nested"), "init", "-q");
    git(path.join(root, "open", "nested"), "init", "-q");
    git(root, "worktree", "add", "-q", "--detach", "ignored/worktree");

    // Git reads the nested repository's .gitignore for the paths it is given, as it did before; its `.git` is never documented.
    expect((await found(root)).files).toEqual([".gitignore", "a.ts", "open/nested/.gitignore", "open/nested/m.ts"]);
    expect([...foldersGitIgnoresWhole(root)]).toEqual(["ignored"]);
  });

  it("reads names with spaces, glob characters, other alphabets and a newline as names", async () => {
    const odd = "a [b]*{c,d} é\nf";
    const root = await repository({ ".gitignore": "/odd*\n", [`odd ${odd}/x.ts`]: "", [`kept ${odd}/y.ts`]: "", "[b]/z.ts": "" });
    expect((await found(root)).files).toEqual([".gitignore", "[b]/z.ts", `kept ${odd}/y.ts`]);
    expect([...foldersGitIgnoresWhole(root)]).toEqual([`odd ${odd}`]);
  });

  it("follows git's case rule where git matches names without regard to case, and exactly where it does not", async () => {
    for (const ignoreCase of [true, false]) {
      const root = await repository({ ".gitignore": "Build/\n", "build/a.ts": "", "b.ts": "" });
      git(root, "config", "core.ignorecase", String(ignoreCase));
      expect((await found(root)).files).toEqual(ignoreCase ? [".gitignore", "b.ts"] : [".gitignore", "b.ts", "build/a.ts"]);
    }
  });

  it("judges each path by its name, a name a tracked file's wildcard pattern would match among them", async () => {
    const root = await repository({ ".gitignore": "build/\n*.log\n", "a1/build/x.ts": "", "a[1]/build/x.ts": "", "a1.log": "", "a[1].log": "", "b?/out/x.ts": "", "bc/out/x.ts": "", "a\\b/out/x.ts": "", "ab/out/x.ts": "", "kept.ts": "" });
    await fs.appendFile(path.join(root, ".git", "info", "exclude"), "out/\n");
    git(root, "add", "-f", "a1/build/x.ts", "a1.log", "bc/out/x.ts", "ab/out/x.ts");
    // Asked as patterns, `a[1]/build/x.ts` matched the tracked `a1/build/x.ts` and was kept, and so each of the others;
    // `a[1]/build` is not a folder git ignores whole, since its pattern matches a tracked file's folder, so it is walked.
    expect((await found(root)).files).toEqual([".gitignore", "a1.log", "a1/build/x.ts", "ab/out/x.ts", "bc/out/x.ts", "kept.ts"]);
  });

  // Two such folders can only be made where the disk tells case apart; on a disk that folds case there is one.
  it.runIf(diskTellsCaseApart)("reads as empty only the folder git names, not one whose name differs from it in case alone, where the disk tells case apart", async () => {
    const root = await repository({ ".gitignore": "/Build/\n", "Build/a.ts": "", "build/b.ts": "" });
    git(root, "config", "core.ignorecase", "false");
    expect((await found(root)).files).toEqual([".gitignore", "build/b.ts"]);
    expect([...foldersGitIgnoresWhole(root)]).toEqual(["Build"]);
  });

  it("judges a submodule's files by the submodule's own git, and a nested repository's by its own", async () => {
    const root = await repository({ ".gitignore": "build/\n", "build/a.ts": "", "excluded/e.ts": "", "module/b.ts": "", "module/.gitignore": "own.ts\n", "module/own.ts": "", "module/mine.ts": "", "module/x.gen": "", "module/build/m.ts": "", "nest/n.ts": "", "nest/y.gen": "", "nest/mine.ts": "", "c.ts": "" });
    await fs.appendFile(path.join(root, ".git", "info", "exclude"), "excluded/\n*.gen\n");
    git(path.join(root, "module"), "init", "-q");
    git(path.join(root, "module"), "add", "b.ts", "x.gen", ".gitignore");
    git(path.join(root, "module"), "commit", "-qm", "module");
    await fs.appendFile(path.join(root, "module", ".git", "info", "exclude"), "mine.ts\n");
    git(path.join(root, "nest"), "init", "-q");
    await fs.appendFile(path.join(root, "nest", ".git", "info", "exclude"), "mine.ts\n");
    git(root, "add", "module");

    // The outer `build/` and `*.gen` reach no file of the inner repositories, which their own git does not ignore; their
    // own `.gitignore` and `.git/info/exclude` do. Until this form `module/build/m.ts`, `module/x.gen` (which the
    // submodule tracks) and `nest/y.gen` were dropped by the outer rules, and `module/mine.ts` and `nest/mine.ts` kept.
    expect((await found(root)).files).toEqual([".gitignore", "c.ts", "module/.gitignore", "module/b.ts", "module/build/m.ts", "module/x.gen", "nest/n.ts", "nest/y.gen"]);
  });

  it("asks of a path through a link to a folder as its link: ignored with the link, else judged by the root .gitignore alone", async () => {
    const root = await repository({ ".gitignore": "*.gen.ts\n", "src/real/r.ts": "", "src/real/s.gen.ts": "", "src/real/t.local.ts": "", "build/kept.ts": "" });
    await fs.appendFile(path.join(root, ".git", "info", "exclude"), "build/\n*.local.ts\n");
    for (const folder of ["build", "open"]) {
      await fs.mkdir(path.join(root, folder), { recursive: true });
      await fs.symlink(path.join("..", "src", "real"), path.join(root, folder, "link"));
    }
    // A tracked file keeps `build` from being a folder git ignores whole, so that the walk finds what is under its link.
    git(root, "add", "-f", "build/kept.ts");

    // `*/**/*.ts` follows both links; `build/link` lies in a folder git ignores, and so does all that is under it. Git
    // judges no path beyond `open/link`, which it does not ignore: the root .gitignore alone drops `s.gen.ts` there.
    expect((await found(root, { glob: ["*/**/*.ts", "**/*.md"] })).files).toEqual(["build/kept.ts", "open/link/r.ts", "open/link/t.local.ts", "src/real/r.ts"]);
    expect((await found(root)).files).toEqual([".gitignore", "build/kept.ts", "src/real/r.ts"]);
    // The run is told of the files git cannot judge, and only of them.
    const warnings: string[] = [];
    const warned = async (glob: string[]): Promise<void> => {
      await discoverTargetFiles({ workspaceRoot: root, config: normalizeLiveDocumentationConfig({ glob }), include: new Set(), changedOnly: false, warn: (message) => warnings.push(message) });
    };
    await warned(["**/*"]);
    expect(warnings).toEqual([]);
    await warned(["*/**/*.ts"]);
    expect(warnings).toEqual([expect.stringContaining("of 3 file(s), such as open/link/r.ts, reached through a link to a folder")]);
  });

  it("judges a folder or a file whose path begins with a colon by its name", async () => {
    const root = await repository({ ".gitignore": "build/\n/:*\n!/:kept.ts\n", "build/a.ts": "", ":(bad)/c.ts": "", ":!x.ts": "", ":kept.ts": "", "excluded/e.ts": "", "d.ts": "" });
    await fs.appendFile(path.join(root, ".git", "info", "exclude"), "excluded/\n");

    // Until 2026-11-20 git refused `:(bad)/c.ts` and `:!x.ts`, and the root .gitignore alone was read.
    expect((await found(root)).files).toEqual([".gitignore", ":kept.ts", "d.ts"]);
    expect([...foldersGitIgnoresWhole(root)].sort()).toEqual([":(bad)", "build", "excluded"]);
  });

  it("walks whole by the rule for no git where the listing fails, before the walk or after it, and says so but where git says there is no repository", async () => {
    const root = await repository({ ".gitignore": "build/\n", "build/a.ts": "", "excluded/e.ts": "", "b.local.ts": "", "c.ts": "" });
    await fs.appendFile(path.join(root, ".git", "info", "exclude"), "excluded/\n*.local.ts\n");
    const warnings: string[] = [];
    const warn = (message: string): void => {
      warnings.push(message);
    };
    const told = async (): Promise<{ files: string[]; documents: string[] }> => {
      const config = normalizeLiveDocumentationConfig({});
      const files = await discoverTargetFiles({ workspaceRoot: root, config, include: new Set(), changedOnly: false, warn });
      return { files: files.map((file) => path.relative(root, file).split(path.sep).join("/")), documents: await discoverDocuments({ workspaceRoot: root, config, warn }) };
    };
    expect(await told()).toEqual({ files: [".gitignore", "c.ts"], documents: [] });
    expect(warnings).toEqual([]);
    // Outside any repository, by git's own word, the rule for no git is the rule: nothing to warn of.
    const plain = await fs.mkdtemp(path.join(os.tmpdir(), "discovery-plain-"));
    folders.push(plain);
    await fs.writeFile(path.join(plain, "a.ts"), "");
    await discoverTargetFiles({ workspaceRoot: plain, config: normalizeLiveDocumentationConfig({}), include: new Set(), changedOnly: false, warn });
    expect(warnings).toEqual([]);
    // A git whose listing fails, as one whose output passes the buffer would, from the `after`-th listing on: no folder
    // is left unread, and the root .gitignore alone judges, as with no git at all.
    const bin = await fs.mkdtemp(path.join(os.tmpdir(), "discovery-git-"));
    folders.push(bin);
    const real = execFileSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).trim();
    const count = path.join(bin, "count");
    await fs.writeFile(path.join(bin, "git"), `#!/bin/sh\nfor a in "$@"; do if [ "$a" = ls-files ]; then n=$(cat "${count}"); echo $((n + 1)) > "${count}"; [ "$n" -ge "$GIT_FAILS_AFTER" ] && exit 128; fi; done\nexec "${real}" "$@"\n`, { mode: 0o755 });
    const searchPath = process.env.PATH;
    process.env.PATH = `${bin}${path.delimiter}${searchPath ?? ""}`;
    try {
      // Failing from the first listing, and from the second, the one taken after the walk to judge it: the walk the
      // first listing shortened, which left `excluded/` unread, is made again whole.
      for (const after of ["0", "1"]) {
        await fs.writeFile(count, "0");
        process.env.GIT_FAILS_AFTER = after;
        expect(await found(root), `failing after ${after}`).toEqual({ files: [".gitignore", "b.local.ts", "c.ts", "excluded/e.ts"], documents: [] });
        // Never in silence: each walk says why git's word was not had (until 2026-11-20 neither did).
        warnings.length = 0;
        await fs.writeFile(count, "0");
        await told();
        expect(warnings, `failing after ${after}`).toEqual([
          expect.stringMatching(after === "0" ? /^git could not be asked what it ignores in .* \(git exited with 128\)/u : /^git could not be asked what it ignores in .* after the walk \(git exited with 128\)/u),
          expect.stringContaining("git could not be asked what it ignores")
        ]);
      }
    } finally {
      process.env.PATH = searchPath;
      delete process.env.GIT_FAILS_AFTER;
    }
  });

  it("judges by git's listing taken after the walk a folder a build makes while the walk runs", async () => {
    const root = await repository({ ".gitignore": "dist/\n", "a.ts": "" });
    // A stand-in for a build: the walk's first read of a folder makes `dist/` and a file in it, after the listing that
    // shortens the walk and before the one that judges it.
    const readdir = nodeFs.readdir;
    let built = false;
    const spy = vi.spyOn(nodeFs, "readdir").mockImplementation(((...args: unknown[]) => {
      if (!built) {
        built = true;
        nodeFs.mkdirSync(path.join(root, "dist"));
        nodeFs.writeFileSync(path.join(root, "dist", "out.js"), "");
      }
      return Reflect.apply(readdir, nodeFs, args);
    }) as unknown as typeof nodeFs.readdir);
    try {
      // Judged by the listing taken before the walk, `dist/out.js` was kept: a build output given a doc.
      expect((await found(root)).files).toEqual([".gitignore", "a.ts"]);
    } finally {
      spy.mockRestore();
    }
  });

  it("warns from both walks of a file in a nested repository git cannot be asked about, documents included", async () => {
    const root = await repository({ "a.ts": "", "nest/b.ts": "", "nest/README.md": "" });
    git(path.join(root, "nest"), "init", "-q");
    await fs.writeFile(path.join(root, "nest", ".git", "index"), "not an index\n");
    const warnings: string[] = [];
    const config = normalizeLiveDocumentationConfig({});
    await discoverTargetFiles({ workspaceRoot: root, config, include: new Set(), changedOnly: false, warn: (message) => warnings.push(message) });
    expect(await discoverDocuments({ workspaceRoot: root, config, warn: (message) => warnings.push(message) })).toEqual(["nest/README.md"]);
    expect(warnings).toEqual([expect.stringContaining("of 1 file(s), such as nest/b.ts,"), expect.stringContaining("of 1 file(s), such as nest/README.md,")]);
  });

  it("judges by the rule for no git, and warns, a nested repository whose configuration git cannot read", async () => {
    const root = await repository({ ".gitignore": "*.tmp\n", "a.ts": "", "nest/b.ts": "", "nest/x.log": "", "nest/y.tmp": "", "nest/.gitignore": "*.log\n" });
    git(path.join(root, "nest"), "init", "-q");
    await fs.appendFile(path.join(root, "nest", ".git", "config"), "[broken\n");
    const warnings: string[] = [];
    const files = await discoverTargetFiles({ workspaceRoot: root, config: normalizeLiveDocumentationConfig({}), include: new Set(), changedOnly: false, warn: (message) => warnings.push(message) });
    // Git does not enter the folder, and its own git refuses: the workspace's .gitignore alone judges its files. Until
    // 2026-11-20 it was taken for a folder of the outer repository, and every file in it kept, `y.tmp` too, in silence.
    expect(files.map((file) => path.relative(root, file).split(path.sep).join("/"))).toEqual([".gitignore", "a.ts", "nest/.gitignore", "nest/b.ts", "nest/x.log"]);
    expect(warnings).toEqual([expect.stringContaining("of 4 file(s), such as nest/.gitignore,")]);
  });

  it("finds nothing in a workspace that lies inside a folder an outer repository ignores", async () => {
    const outer = await repository({ ".gitignore": "inner/\n", "inner/a.ts": "", "inner/README.md": "", "inner/:(bad).ts": "" });
    const root = path.join(outer, "inner");
    // Git names the workspace itself (`./`), which reads as empty; every file in it is ignored.
    expect(await found(root)).toEqual({ files: [], documents: [] });
    expect([...foldersGitIgnoresWhole(root)]).toEqual([""]);
  });
});
