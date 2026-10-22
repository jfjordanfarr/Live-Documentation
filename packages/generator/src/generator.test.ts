import { execFileSync } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  LIVE_DOCUMENTATION_FILE_EXTENSION,
  normalizeLiveDocumentationConfig
} from "@live-documentation/engine/config/liveDocumentationConfig";
import { analyzeSourceFile } from "@live-documentation/engine/live-docs/core";
import { UNREAD_NOTE } from "@live-documentation/engine/live-docs/document";

import { generateLiveDocs } from "./generator";

describe("generateLiveDocs pruning", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-live-docs-"));
    await fs.mkdir(path.join(workspaceRoot, "packages", "foo", "src"), { recursive: true });
    await fs.writeFile(
      path.join(workspaceRoot, "packages", "foo", "src", "index.ts"),
      [
        "export function example(): number {",
        "  return 1;",
        "}",
        ""
      ].join("\n"),
      "utf8"
    );
  });

  afterEach(async () => {
    if (workspaceRoot) {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("prunes stale docs without authored content while preserving authored stubs", async () => {
    const config = normalizeLiveDocumentationConfig({
      ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
      glob: ["packages/foo/src/**/*.ts"]
    });

    const initialResult = await generateLiveDocs({
      workspaceRoot,
      config,
      dryRun: false
    });

    expect(initialResult.deleted).toBe(0);
    expect(initialResult.deletedFiles).toHaveLength(0);

    const docRoot = path.join(
      workspaceRoot,
      DEFAULT_LIVE_DOCUMENTATION_CONFIG.root,
      DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer
    );
    const orphanDocPath = path.join(
      docRoot,
      "packages",
      "foo",
      "src",
      `orphan.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`
    );
    const preserveDocPath = path.join(
      docRoot,
      "packages",
      "foo",
      "src",
      `preserve.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`
    );

    await fs.mkdir(path.dirname(orphanDocPath), { recursive: true });

    const orphanDoc = [
      "# packages/foo/src/orphan.ts",
      "",
      "## Metadata",
      "- Layer: 4",
      "- Archetype: implementation",
      "- Code Path: packages/foo/src/orphan.ts",
      "",
      "## Authored",
      "### Purpose",
      "_Pending authored purpose_",
      "",
      "### Notes",
      "_Pending notes_",
      "",
      "## Generated",
      "<!-- LIVE-DOC:BEGIN Public Symbols -->",
      "### Public Symbols",
      "_No public symbols detected_",
      "<!-- LIVE-DOC:END Public Symbols -->",
      "",
      "<!-- LIVE-DOC:BEGIN Dependencies -->",
      "### Dependencies",
      "_No dependencies documented yet_",
      "<!-- LIVE-DOC:END Dependencies -->",
      ""
    ].join("\n");

    const authoredDoc = [
      "# packages/foo/src/preserve.ts",
      "",
      "## Metadata",
      "- Layer: 4",
      "- Archetype: implementation",
      "- Code Path: packages/foo/src/preserve.ts",
      "",
      "## Authored",
      "### Purpose",
      "Meaningful purpose text",
      "",
      "### Notes",
      "Meaningful notes",
      "",
      "## Generated",
      "<!-- LIVE-DOC:BEGIN Public Symbols -->",
      "### Public Symbols",
      "_No public symbols detected_",
      "<!-- LIVE-DOC:END Public Symbols -->",
      "",
      "<!-- LIVE-DOC:BEGIN Dependencies -->",
      "### Dependencies",
      "_No dependencies documented yet_",
      "<!-- LIVE-DOC:END Dependencies -->",
      ""
    ].join("\n");

    await fs.writeFile(orphanDocPath, orphanDoc, "utf8");
    await fs.writeFile(preserveDocPath, authoredDoc, "utf8");

    const infoMessages: string[] = [];
    const warnMessages: string[] = [];

    const result = await generateLiveDocs({
      workspaceRoot,
      config,
      dryRun: false,
      logger: {
        info: (message) => infoMessages.push(message),
        warn: (message) => warnMessages.push(message),
        error: (message) => {
          throw new Error(message);
        }
      }
    });

    expect(result.deleted).toBe(1);
    const expectedRoot = path.join(
      DEFAULT_LIVE_DOCUMENTATION_CONFIG.root,
      DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer,
      "packages",
      "foo",
      "src"
    );
    expect(result.deletedFiles).toContain(
      `${expectedRoot}/orphan.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`.replace(/\\/g, "/")
    );
    expect(result.deletedFiles).not.toContain(
      `${expectedRoot}/preserve.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`.replace(/\\/g, "/")
    );

    await expect(fs.stat(orphanDocPath)).rejects.toThrowError();
    await expect(fs.stat(preserveDocPath)).resolves.toBeDefined();

    expect(infoMessages.some((message) => message.includes("authored content detected"))).toBe(true);
    expect(infoMessages.some((message) => message.includes("Deleted stale Live Doc"))).toBe(true);
  });
});

describe("generateLiveDocs and files no reader handles", () => {
  let workspaceRoot: string;
  const silent = { info: () => undefined, warn: () => undefined, error: (message: string) => { throw new Error(message); } };
  const docOf = (source: string): string =>
    path.join(workspaceRoot, DEFAULT_LIVE_DOCUMENTATION_CONFIG.root, DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer, `${source}${LIVE_DOCUMENTATION_FILE_EXTENSION}`);
  const notesOf = async (source: string): Promise<string> => {
    const text = await fs.readFile(docOf(source), "utf8");
    return text.slice(text.indexOf("### Notes"), text.indexOf("## Generated"));
  };

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-unread-"));
    const files: Record<string, string> = {
      ".github/workflows/ci.yml": "on: push\njobs:\n  check:\n    runs-on: ubuntu-latest\n",
      "Makefile": "all:\n\tnpm test\n",
      "src/index.ts": "export const one = 1;\n",
      "logo.png": "\u0089PNG\r\n\u001a\n\u0000\u0000",
      "README.md": "# The project\n"
    };
    for (const [file, content] of Object.entries(files)) {
      await fs.mkdir(path.dirname(path.join(workspaceRoot, file)), { recursive: true });
      await fs.writeFile(path.join(workspaceRoot, file), content, "utf8");
    }
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("starts the doc of a file no reader handles with a note in its authored block, and leaves the generated regions to what was found", async () => {
    await generateLiveDocs({ workspaceRoot, config: normalizeLiveDocumentationConfig(), logger: silent });

    for (const unread of [".github/workflows/ci.yml", "Makefile"]) {
      expect(await notesOf(unread), unread).toContain(UNREAD_NOTE);
      const generated = (await fs.readFile(docOf(unread), "utf8")).split("## Generated")[1];
      expect(generated, unread).not.toContain("reader");
      expect(generated, unread).toContain("_No public symbols detected_");
    }
    for (const read of ["src/index.ts", "logo.png"]) {
      expect(await notesOf(read), read).toContain("_Pending notes_");
      expect(await notesOf(read), read).not.toContain(UNREAD_NOTE);
    }
    await expect(fs.stat(docOf("README.md"))).rejects.toThrowError();
  });

  it("writes the note once, so that what an author makes of it stays", async () => {
    const config = normalizeLiveDocumentationConfig();
    await generateLiveDocs({ workspaceRoot, config, logger: silent });
    const doc = docOf("Makefile");
    const authored = (await fs.readFile(doc, "utf8")).replace(UNREAD_NOTE, "- Builds and tests the project; a reader for make would draw its wires.");
    await fs.writeFile(doc, authored, "utf8");

    await generateLiveDocs({ workspaceRoot, config, logger: silent });

    const notes = await notesOf("Makefile");
    expect(notes).toContain("a reader for make would draw its wires");
    expect(notes).not.toContain(UNREAD_NOTE);
  });

  it("prunes a doc that holds nothing but the note once its file is gone, as it prunes the pending placeholders", async () => {
    const config = normalizeLiveDocumentationConfig();
    await generateLiveDocs({ workspaceRoot, config, logger: silent });
    await fs.rm(path.join(workspaceRoot, "Makefile"));

    const result = await generateLiveDocs({ workspaceRoot, config, logger: silent });

    expect(result.deletedFiles).toEqual([`${DEFAULT_LIVE_DOCUMENTATION_CONFIG.root}/${DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer}/Makefile${LIVE_DOCUMENTATION_FILE_EXTENSION}`]);
    await expect(fs.stat(docOf("Makefile"))).rejects.toThrowError();
  });
});

describe("generateLiveDocs and nested scans", () => {
  let workspaceRoot: string;
  const warnings: string[] = [];
  const logger = { info: () => undefined, warn: (message: string) => { warnings.push(message); }, error: () => undefined };

  beforeEach(async () => {
    warnings.length = 0;
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-nested-"));
    await fs.mkdir(path.join(workspaceRoot, "packages", "foo", "src"), { recursive: true });
    await fs.writeFile(path.join(workspaceRoot, "packages", "foo", "src", "index.ts"), "export const one = 1;\n", "utf8");
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("warns when a scan lies inside the folder being scanned, by its docs root or its configuration file", async () => {
    await fs.mkdir(path.join(workspaceRoot, "packages", "foo", DEFAULT_LIVE_DOCUMENTATION_CONFIG.root, DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer), { recursive: true });
    await fs.mkdir(path.join(workspaceRoot, "packages", "bar"), { recursive: true });
    await fs.writeFile(path.join(workspaceRoot, "packages", "bar", ".live-docs.config.json"), "{}\n", "utf8");
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["packages/foo/src/**/*.ts"] });

    await generateLiveDocs({ workspaceRoot, config, logger });

    expect(warnings).toEqual([
      "A scan lies inside this folder at packages/bar; a scan never lies inside another scan. Point at one of them.",
      "A scan lies inside this folder at packages/foo; a scan never lies inside another scan. Point at one of them."
    ]);
  });

  it("warns when the folder being scanned lies inside a scan", async () => {
    await fs.mkdir(path.join(workspaceRoot, DEFAULT_LIVE_DOCUMENTATION_CONFIG.root, DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer), { recursive: true });
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["src/**/*.ts"] });

    await generateLiveDocs({ workspaceRoot: path.join(workspaceRoot, "packages", "foo"), config, logger });

    expect(warnings).toEqual([`This folder lies inside a scan at ${workspaceRoot}; a scan never lies inside another scan. Point at one of them.`]);
  });

  it("says nothing when no scan nests", async () => {
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["packages/foo/src/**/*.ts"] });
    await generateLiveDocs({ workspaceRoot, config, logger });
    expect(warnings).toEqual([]);
  });
});

describe("generateLiveDocs changed files", () => {
  it("uses the whole workspace for links and entries while writing only the changed source", async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-changed-"));
    const runGit = (...args: string[]) => execFileSync("git", args, { cwd: workspaceRoot });
    const config = normalizeLiveDocumentationConfig({
      ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
      glob: ["src/**/*.ts", "package.json"]
    });
    const app = path.join(workspaceRoot, "src", "app.ts");
    const model = path.join(workspaceRoot, "src", "model.ts");
    const other = path.join(workspaceRoot, "src", "other.ts");
    const doc = path.join(workspaceRoot, config.root, config.baseLayer, `src/app.ts${config.extension}`);

    try {
      await fs.mkdir(path.dirname(app), { recursive: true });
      await fs.writeFile(app, "import type { Item } from './model';\nexport function start(value: Item): Item { return value; }\n");
      await fs.writeFile(model, "export interface Item { id: string }\n");
      await fs.writeFile(other, "export const unrelated = 1;\n");
      await fs.writeFile(path.join(workspaceRoot, "package.json"), JSON.stringify({ name: "sample", main: "src/app.ts" }));
      runGit("init", "-q");
      runGit("add", "src", "package.json");
      runGit("-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", "initial");
      await generateLiveDocs({ workspaceRoot, config, now: () => new Date("2026-01-01T00:00:00.000Z") });

      await fs.writeFile(app, "import type { Item } from './model';\nexport function start(value: Item): Item { return value; }\nimport './other';\n");
      const changed = await generateLiveDocs({ workspaceRoot, config, changedOnly: true, now: () => new Date("2026-01-02T00:00:00.000Z") });
      const changedDoc = await fs.readFile(doc, "utf8");

      expect(changed.processed).toBe(1);
      expect(changed.files.map((file) => file.sourcePath)).toEqual(["src/app.ts"]);
      expect(changedDoc).toContain("model.ts");
      expect(changedDoc).toContain("Returns: [`Item`](./model.ts.md#symbol-item)");
      expect(changedDoc).toContain("Entry:");

      await generateLiveDocs({ workspaceRoot, config, now: () => new Date("2026-01-02T00:00:00.000Z") });
      expect(await fs.readFile(doc, "utf8")).toBe(changedDoc);
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("anchors Git status to a workspace nested inside a repository and ignores changes outside it", async () => {
    const repositoryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-nested-git-"));
    const workspaceRoot = path.join(repositoryRoot, "project");
    const runGit = (...args: string[]) => execFileSync("git", args, { cwd: repositoryRoot });
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["src/**/*.ts"] });
    const app = path.join(workspaceRoot, "src", "app.ts");
    const doc = path.join(workspaceRoot, config.root, config.baseLayer, `src/app.ts${config.extension}`);
    const now = () => new Date("2026-01-01T00:00:00.000Z");

    try {
      await fs.mkdir(path.dirname(app), { recursive: true });
      await fs.writeFile(app, "import type { Item } from './model';\nexport function use(value: Item): Item { return value; }\n");
      await fs.writeFile(path.join(workspaceRoot, "src", "model.ts"), "export interface Item { id: string }\n");
      await fs.writeFile(path.join(repositoryRoot, "outside.ts"), "export const outside = 1;\n");
      runGit("init", "-q");
      runGit("-c", "core.autocrlf=false", "add", "project/src", "outside.ts");
      runGit("-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", "initial");
      await generateLiveDocs({ workspaceRoot, config, now });

      await fs.writeFile(path.join(repositoryRoot, "outside.ts"), "export const outside = 2;\n");
      expect((await generateLiveDocs({ workspaceRoot, config, changedOnly: true, now })).processed).toBe(0);

      await fs.writeFile(app, "import type { Item } from './model';\nexport function use(value: Item): Item { return value; }\nimport './model';\n");
      const changed = await generateLiveDocs({ workspaceRoot, config, changedOnly: true, now });
      const changedDoc = await fs.readFile(doc, "utf8");
      expect(changed.files.map((file) => file.sourcePath)).toEqual(["src/app.ts"]);
      expect(changedDoc).toContain("Returns: [`Item`](./model.ts.md#symbol-item)");
      await generateLiveDocs({ workspaceRoot, config, now });
      expect(await fs.readFile(doc, "utf8")).toBe(changedDoc);
    } finally {
      await fs.rm(repositoryRoot, { recursive: true, force: true });
    }
  });

  it("prunes changed deletions and rename origins while preserving authored stale docs", async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-changed-removal-"));
    const runGit = (...args: string[]) => execFileSync("git", args, { cwd: workspaceRoot });
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["src/**/*.ts"] });
    const docPath = (source: string) => path.join(workspaceRoot, config.root, config.baseLayer, `${source}${config.extension}`);
    const now = () => new Date("2026-01-01T00:00:00.000Z");

    try {
      await fs.mkdir(path.join(workspaceRoot, "src"));
      await fs.writeFile(path.join(workspaceRoot, "src", "old name.ts"), "export const one = 1;\n");
      await fs.writeFile(path.join(workspaceRoot, "src", "deleted.ts"), "export const two = 2;\n");
      await fs.writeFile(path.join(workspaceRoot, "src", "authored.ts"), "export const retained = 4;\n");
      await fs.writeFile(path.join(workspaceRoot, "src", "untouched.ts"), "export const three = 3;\n");
      runGit("init", "-q");
      runGit("add", "src");
      runGit("-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", "initial");
      await generateLiveDocs({ workspaceRoot, config, now });

      const untouchedBefore = await fs.readFile(docPath("src/untouched.ts"), "utf8");
      await fs.writeFile(docPath("src/authored.ts"), (await fs.readFile(docPath("src/authored.ts"), "utf8")).replace("_Pending authored purpose_", "A manually retained explanation."));
      expect((await generateLiveDocs({ workspaceRoot, config, changedOnly: true, now })).processed).toBe(0);
      runGit("mv", "src/old name.ts", "src/new name.ts");
      await fs.rm(path.join(workspaceRoot, "src", "deleted.ts"));
      await fs.rm(path.join(workspaceRoot, "src", "authored.ts"));
      const changed = await generateLiveDocs({ workspaceRoot, config, changedOnly: true, now });
      const changedIndex = await fs.readFile(path.join(workspaceRoot, config.root, "index.json"), "utf8");

      expect(changed.files.map((file) => file.sourcePath)).toEqual(["src/new name.ts"]);
      expect(changed.deletedFiles).toContain(`${config.root}/${config.baseLayer}/src/old name.ts${config.extension}`);
      expect(changed.deletedFiles).toContain(`${config.root}/${config.baseLayer}/src/deleted.ts${config.extension}`);
      expect(changed.deletedFiles).not.toContain(`${config.root}/${config.baseLayer}/src/authored.ts${config.extension}`);
      await expect(fs.stat(docPath("src/old name.ts"))).rejects.toThrow();
      await expect(fs.stat(docPath("src/deleted.ts"))).rejects.toThrow();
      await expect(fs.stat(docPath("src/authored.ts"))).resolves.toBeDefined();
      expect(await fs.readFile(docPath("src/untouched.ts"), "utf8")).toBe(untouchedBefore);

      await generateLiveDocs({ workspaceRoot, config, now });
      expect(await fs.readFile(path.join(workspaceRoot, config.root, "index.json"), "utf8")).toBe(changedIndex);

    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("prunes the last source when a changed workspace has no remaining source files", async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-changed-empty-"));
    const runGit = (...args: string[]) => execFileSync("git", args, { cwd: workspaceRoot });
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["src/**/*.ts"] });
    const source = path.join(workspaceRoot, "src", "only.ts");
    const doc = path.join(workspaceRoot, config.root, config.baseLayer, `src/only.ts${config.extension}`);

    try {
      await fs.mkdir(path.dirname(source));
      await fs.writeFile(source, "export const only = 1;\n");
      runGit("init", "-q");
      runGit("add", "src");
      runGit("-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", "initial");
      await generateLiveDocs({ workspaceRoot, config });
      await expect(fs.stat(doc)).resolves.toBeDefined();

      await fs.rm(source);
      const changed = await generateLiveDocs({ workspaceRoot, config, changedOnly: true });
      expect(changed.processed).toBe(0);
      expect(changed.deletedFiles).toEqual([`${config.root}/${config.baseLayer}/src/only.ts${config.extension}`]);
      await expect(fs.stat(doc)).rejects.toThrow();
      const index = JSON.parse(await fs.readFile(path.join(workspaceRoot, config.root, "index.json"), "utf8")) as { files: Record<string, unknown> };
      expect(index.files).toEqual({});
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

});

describe("generateLiveDocs included files", () => {
  it("resolves an included file against sources outside the explicit subset", async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-included-context-"));
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["src/**/*.ts"] });
    const app = path.join(workspaceRoot, "src", "app.ts");
    const doc = path.join(workspaceRoot, config.root, config.baseLayer, `src/app.ts${config.extension}`);
    const now = () => new Date("2026-01-01T00:00:00.000Z");

    try {
      await fs.mkdir(path.dirname(app));
      await fs.writeFile(app, "export function use(value: Item): Item { return value; }\n");
      await fs.writeFile(path.join(workspaceRoot, "src", "model.ts"), "export interface Item { id: string }\n");
      await generateLiveDocs({ workspaceRoot, config, now });

      await fs.writeFile(app, "export function use(value: Item): Item { return value; }\nexport const extra = true;\n");
      const included = await generateLiveDocs({ workspaceRoot, config, include: ["src/app.ts"], now });
      const includedDoc = await fs.readFile(doc, "utf8");
      expect(included.processed).toBe(1);
      expect(includedDoc).toContain("model.ts");
      await generateLiveDocs({ workspaceRoot, config, now });
      expect(await fs.readFile(doc, "utf8")).toBe(includedDoc);
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("renders an explicitly included source outside the configured globs with workspace links", async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-included-outside-glob-"));
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["src/**/*.ts"] });
    const provider = path.join(workspaceRoot, "src", "model.ts");
    const tool = path.join(workspaceRoot, "tools", "tool.ts");
    const toolDoc = path.join(workspaceRoot, config.root, config.baseLayer, `tools/tool.ts${config.extension}`);
    const providerDoc = path.join(workspaceRoot, config.root, config.baseLayer, `src/model.ts${config.extension}`);

    try {
      await fs.mkdir(path.dirname(provider));
      await fs.mkdir(path.dirname(tool));
      await fs.writeFile(provider, "export interface Item { id: string }\n");
      await fs.writeFile(tool, "import type { Item } from '../src/model';\nexport function use(value: Item): Item { return value; }\n");

      const included = await generateLiveDocs({ workspaceRoot, config, include: ["tools/tool.ts"] });
      expect(included.files.map((file) => file.sourcePath)).toEqual(["tools/tool.ts"]);
      expect(await fs.readFile(toolDoc, "utf8")).toContain("Returns: [`Item`](../src/model.ts.md#symbol-item)");
      await expect(fs.stat(providerDoc)).rejects.toThrow();
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});

describe("full generation resolves current provider and manifest facts", () => {
  it("keeps full docs and graph current when a provider appears and a manifest retargets", async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "script-facts-full-"));
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["src/**/*.ts", "package.json"] });
    const app = path.join(workspaceRoot, "src", "app.ts");
    const model = path.join(workspaceRoot, "src", "model.ts");
    const manifest = path.join(workspaceRoot, "package.json");
    const doc = (source: string) => path.join(workspaceRoot, config.root, config.baseLayer, `${source}${config.extension}`);
    const graphPath = path.join(workspaceRoot, config.root, "index.json");
    const now = () => new Date("2026-01-01T00:00:00.000Z");
    try {
      await fs.mkdir(path.dirname(app));
      await fs.writeFile(app, "import type { Item } from './model';\nexport function start(value: Item): Item { return value; }\n");
      await fs.writeFile(manifest, JSON.stringify({ name: "sample", main: "src/app.ts" }));
      await generateLiveDocs({ workspaceRoot, config, now });
      const before = await fs.readFile(doc("src/app.ts"), "utf8");
      expect(before).toContain("Entry:");
      expect(before).not.toContain("./model.ts.md#symbol-item");
      await fs.writeFile(doc("src/app.ts"), before.replace("_Pending authored purpose_", "The app's authored purpose."));

      await fs.writeFile(model, "export interface Item { id: string }\n");
      await fs.writeFile(manifest, JSON.stringify({ name: "sample", main: "src/model.ts" }));
      await generateLiveDocs({ workspaceRoot, config, now });
      const appWithProvider = await fs.readFile(doc("src/app.ts"), "utf8");
      const modelWithEntry = await fs.readFile(doc("src/model.ts"), "utf8");
      expect(appWithProvider).toContain("The app's authored purpose.");
      expect(appWithProvider).toContain("Returns: [`Item`](./model.ts.md#symbol-item)");
      expect(appWithProvider).not.toContain("Entry:");
      expect(modelWithEntry).toContain("Entry:");
      const graph = JSON.parse(await fs.readFile(graphPath, "utf8")) as { files: Record<string, { outbound: string[] }> };
      expect(graph.files["src/app.ts"].outbound).toContain("src/model.ts");

      await fs.writeFile(model, "export interface Replacement { id: string }\n");
      await generateLiveDocs({ workspaceRoot, config, now });
      const appWithoutType = await fs.readFile(doc("src/app.ts"), "utf8");
      expect(appWithoutType).not.toContain("./model.ts.md#symbol-item");
      const stable = [appWithoutType, await fs.readFile(doc("src/model.ts"), "utf8"), await fs.readFile(graphPath, "utf8")];
      expect((await generateLiveDocs({ workspaceRoot, config, now })).written).toBe(0);
      expect([await fs.readFile(doc("src/app.ts"), "utf8"), await fs.readFile(doc("src/model.ts"), "utf8"), await fs.readFile(graphPath, "utf8")]).toEqual(stable);
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("keeps real direct, named, default and star-barrel anchors without inventing missing ones", async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generator-target-anchors-"));
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["src/**/*.ts"] });
    const source = (name: string) => path.join(workspaceRoot, "src", name);
    const doc = (name: string) => path.join(workspaceRoot, config.root, config.baseLayer, `src/${name}${config.extension}`);
    try {
      await fs.mkdir(path.join(workspaceRoot, "src"));
      await fs.writeFile(source("model.ts"), "export interface Item { id: string }\nexport interface Widget { id: string }\nexport const Widget = 1;\nexport default class DefaultThing {}\n");
      await fs.writeFile(source("named.ts"), "export { Item as Alias } from './model';\n");
      await fs.writeFile(source("star.ts"), "export * from './model';\n");
      await fs.writeFile(source("namespace.ts"), "export * as Models from './model';\n");
      await fs.writeFile(source("outer.ts"), "export * from './namespace';\n");
      await fs.writeFile(source("cycle-a.ts"), "export const A = 1;\nexport * from './cycle-b';\n");
      await fs.writeFile(source("cycle-b.ts"), "export const B = 1;\nexport * from './cycle-a';\n");
      await fs.writeFile(source("consumer.ts"), [
        "import { Item } from './star';",
        "import { Alias } from './named';",
        "import DefaultThing, { Missing } from './model';",
        "import { B } from './cycle-a';",
        "import { Models } from './namespace';",
        "import { Models as OuterModels } from './outer';",
        "import { Widget } from './star';",
        "export function use(value: Item): DefaultThing { return new DefaultThing(); }",
        "export { Alias, B, Models, OuterModels, Widget, Missing };",
        ""
      ].join("\n"));

      await generateLiveDocs({ workspaceRoot, config });
      const consumer = await fs.readFile(doc("consumer.ts"), "utf8");
      const star = await fs.readFile(doc("star.ts"), "utf8");
      const namespace = await fs.readFile(doc("namespace.ts"), "utf8");
      const outer = await fs.readFile(doc("outer.ts"), "utf8");
      const model = await fs.readFile(doc("model.ts"), "utf8");
      const cycle = await fs.readFile(doc("cycle-a.ts"), "utf8");
      expect(star).toContain("#### `Item` {#symbol-item}");
      expect(star).toContain("#### `Widget` {#symbol-widget}");
      expect(star).toContain("./model.ts.md#symbol-widget-interface");
      expect(star).not.toContain("./model.ts.md#symbol-widget)");
      expect(model).toContain("#### `Widget (interface)` {#symbol-widget-interface}");
      expect(cycle).toContain("#### `B` {#symbol-b}");
      expect(namespace).toContain("#### `Models` {#symbol-models}");
      expect(namespace).not.toContain("#### `Item` {#symbol-item}");
      expect(namespace).toContain("[`model`](./model.ts.md)");
      expect(outer).toContain("#### `Models` {#symbol-models}");
      expect(outer).toContain("./namespace.ts.md#symbol-models");
      expect(consumer).toContain("[`star.Item`](./star.ts.md#symbol-item)");
      expect(consumer).toContain("[`named.Alias`](./named.ts.md#symbol-alias)");
      expect(consumer).toContain("[`model.DefaultThing`](./model.ts.md#symbol-defaultthing)");
      expect(consumer).toContain("[`cycle-a.B`](./cycle-a.ts.md#symbol-b)");
      expect(consumer).toContain("[`star.Widget`](./star.ts.md#symbol-widget)");
      expect(consumer).toContain("[`outer.Models`](./outer.ts.md#symbol-models)");
      expect(consumer).toContain("[`model.Missing`](./model.ts.md)");
      expect(consumer).not.toContain("./model.ts.md#symbol-missing");
      expect(consumer).toContain("[`namespace.Models`](./namespace.ts.md#symbol-models)");
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});

describe("generateLiveDocs DOM targets", () => {
  it("links only scanned markup and ignores later edits to excluded markup", async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-dom-targets-"));
    const runGit = (...args: string[]) => execFileSync("git", args, { cwd: workspaceRoot, encoding: "utf8" });
    const config = normalizeLiveDocumentationConfig({
      ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
      glob: ["src/**/*.ts", "*.html"],
      exclude: ["excluded.html"]
    });
    const appDoc = path.join(workspaceRoot, config.root, config.baseLayer, `src/app.ts${config.extension}`);
    const now = () => new Date("2026-01-01T00:00:00.000Z");

    try {
      await fs.mkdir(path.join(workspaceRoot, "src"));
      await fs.writeFile(path.join(workspaceRoot, ".gitignore"), `${config.root}/\nignored.html\n`);
      await fs.writeFile(path.join(workspaceRoot, "src", "app.ts"), "export const target = document.getElementById('x');\n");
      await fs.writeFile(path.join(workspaceRoot, "visible.html"), '<main id="x"></main>\n');
      await fs.writeFile(path.join(workspaceRoot, "excluded.html"), '<main id="x"></main>\n');
      runGit("init", "-q");
      runGit("-c", "core.autocrlf=false", "add", ".gitignore", "src", "visible.html", "excluded.html");
      runGit("-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", "initial");
      await fs.writeFile(path.join(workspaceRoot, "ignored.html"), '<main id="x"></main>\n');
      expect(runGit("status", "--porcelain")).toBe("");
      const standalone = await analyzeSourceFile(path.join(workspaceRoot, "src", "app.ts"), workspaceRoot);
      expect(standalone.dependencies.map((entry) => entry.resolvedPath).sort()).toEqual(["excluded.html", "ignored.html", "visible.html"]);

      await generateLiveDocs({ workspaceRoot, config, now });
      const before = await fs.readFile(appDoc, "utf8");
      const graph = JSON.parse(await fs.readFile(path.join(workspaceRoot, config.root, "index.json"), "utf8")) as { files: Record<string, unknown> };
      expect(Object.keys(graph.files)).toEqual(["src/app.ts", "visible.html"]);
      expect(before).toContain("visible.html");
      expect(before).not.toContain("ignored.html");
      expect(before).not.toContain("excluded.html");

      await fs.writeFile(path.join(workspaceRoot, "ignored.html"), '<main id="different"></main>\n');
      expect(runGit("status", "--porcelain")).toBe("");
      await generateLiveDocs({ workspaceRoot, config, now });
      expect(await fs.readFile(appDoc, "utf8")).toBe(before);
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});

describe("generateLiveDocs changed-file status errors", () => {
  it("still permits full generation outside Git but reports that --changed needs Git status", async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-no-git-"));
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["src/**/*.ts"] });
    try {
      await fs.mkdir(path.join(workspaceRoot, "src"));
      await fs.writeFile(path.join(workspaceRoot, "src", "app.ts"), "export const app = 1;\n");
      expect((await generateLiveDocs({ workspaceRoot, config })).processed).toBe(1);
      await expect(generateLiveDocs({ workspaceRoot, config, changedOnly: true })).rejects.toThrow(/Cannot use --changed.*Git status failed/u);
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("surfaces a broken Git status rather than treating it as an empty change set", async () => {
    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-broken-git-"));
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["src/**/*.ts"] });
    try {
      await fs.mkdir(path.join(workspaceRoot, "src"));
      await fs.writeFile(path.join(workspaceRoot, "src", "app.ts"), "export const app = 1;\n");
      await fs.writeFile(path.join(workspaceRoot, ".git"), "gitdir: /missing/live-docs-git-directory\n");
      await expect(generateLiveDocs({ workspaceRoot, config, changedOnly: true })).rejects.toThrow(/Cannot use --changed.*Git status failed/u);
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});

describe("generateLiveDocs and the documents that cite a file", () => {
  let workspaceRoot: string;
  const docsRoot = (): string => path.join(workspaceRoot, DEFAULT_LIVE_DOCUMENTATION_CONFIG.root, DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer);
  const readDoc = (source: string): Promise<string> => fs.readFile(path.join(docsRoot(), `${source}${LIVE_DOCUMENTATION_FILE_EXTENSION}`), "utf8");
  const CITED_BY = /<!-- LIVE-DOC:BEGIN Cited By -->\n### Cited By\n([\s\S]*?)<!-- LIVE-DOC:END Cited By -->/u;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-live-docs-cited-by-"));
    await fs.mkdir(path.join(workspaceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(workspaceRoot, "docs", "archive"), { recursive: true });
    await fs.writeFile(path.join(workspaceRoot, "src", "model.ts"), "export interface Item { id: string }\n");
    await fs.writeFile(path.join(workspaceRoot, "src", "app.ts"), "import type { Item } from './model';\nexport function start(value: Item): Item { return value; }\n");
    await fs.writeFile(path.join(workspaceRoot, "README.md"), [
      "# The app",
      "The model is [here](src/model.ts) and the app starts in [start](.live-documentation/source/src/app.ts.md#symbol-start).",
      "```md",
      "[a fenced link counts for nothing](src/model.ts)",
      "```"
    ].join("\n"));
    await fs.writeFile(path.join(workspaceRoot, "docs", "notes.md"), "See [the app](../src/app.ts#L2), [the readme](../README.md) and [a file that is not there](../src/missing.ts).");
    await fs.writeFile(path.join(workspaceRoot, "docs", "archive", "old.md"), "Once the model was [here](../../src/model.ts).");
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("writes a Cited By section on each file a document links to, by its path or its doc's, outside fenced code and the bundle exclusions, and on no other", async () => {
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["src/**/*.ts"], bundleExclude: ["docs/archive/**"] });
    await generateLiveDocs({ workspaceRoot, config, dryRun: false });

    expect(CITED_BY.exec(await readDoc("src/model.ts"))?.[1]).toBe("- [`README.md`](../../../README.md)\n");
    expect(CITED_BY.exec(await readDoc("src/app.ts"))?.[1]).toBe("- [`README.md`](../../../README.md)\n- [`docs/notes.md`](../../../docs/notes.md)\n");
    const index = JSON.parse(await fs.readFile(path.join(workspaceRoot, DEFAULT_LIVE_DOCUMENTATION_CONFIG.root, "index.json"), "utf8")) as { files: Record<string, { citedBy?: unknown }> };
    expect(index.files["src/app.ts"].citedBy).toEqual([{ label: "README.md", link: "../../../README.md" }, { label: "docs/notes.md", link: "../../../docs/notes.md" }]);
  });

  it("writes no Cited By section when the configuration turns it off, and drops the section once the document's link goes", async () => {
    const off = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["src/**/*.ts"], bundleExclude: ["docs/archive/**"], citedBy: false });
    await generateLiveDocs({ workspaceRoot, config: off, dryRun: false });
    expect(await readDoc("src/model.ts")).not.toContain("Cited By");

    const on = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: ["src/**/*.ts"], bundleExclude: ["docs/archive/**"] });
    await generateLiveDocs({ workspaceRoot, config: on, dryRun: false });
    expect(await readDoc("src/model.ts")).toContain("<!-- LIVE-DOC:BEGIN Cited By -->");

    await fs.writeFile(path.join(workspaceRoot, "README.md"), "# The app\nNothing linked any more.\n");
    const result = await generateLiveDocs({ workspaceRoot, config: on, dryRun: false });
    expect(result.files.find((record) => record.sourcePath === "src/model.ts")?.change).toBe("updated");
    expect(await readDoc("src/model.ts")).not.toContain("Cited By");
    // The notes still cite the app, and the readme no longer does.
    expect(CITED_BY.exec(await readDoc("src/app.ts"))?.[1]).toBe("- [`docs/notes.md`](../../../docs/notes.md)\n");
  });
});
