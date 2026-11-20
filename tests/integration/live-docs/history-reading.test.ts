/**
 * The history command over a repository that holds what this repository's own history never did (the independent
 * review of 2026-11-19): a folder the configuration excludes that included code imports, re-exports and takes an asset
 * from; documents the bundle excludes; and symbolic links to a document, to code and to a linked document. Its mirror
 * is generated in a checkout and committed, so that the check at the head holds the history's last step to it, and its
 * summaries and sequence are held to what each must say: every linked document in a summary, the bundle's exclusions
 * applied in the sequence, and an edit of them changing the sequence without a new summary.
 */
import { execFileSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as zlib from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { readLiveDocGraph } from "../../../packages/engine/src/live-docs/graphFiles";
import type { HistorySequence } from "../../../packages/engine/src/live-docs/history/format";
import { writeStoredTree } from "../../../packages/engine/src/live-docs/history/git";
import { momentAt, seek } from "../../../packages/engine/src/live-docs/history/sequence";
import type { CommitSummary } from "../../../packages/engine/src/live-docs/history/summary";
import { generateLiveDocs } from "../../../packages/generator/src/generator";
import { committedLiveDocGraph } from "../../../packages/generator/src/history/headCheck";
import { FIXTURE_GIT_ENV } from "./scripted-repository";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const tsconfigPath = path.join(repoRoot, "tsconfig.base.json");
const historyScript = path.join(repoRoot, "scripts", "live-docs", "history.ts");

/** A temporary folder of this file's own, for its repository and every command it runs (see `history.test.ts`). */
const privateTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "lr-"));
process.env.TMPDIR = privateTemporary;

const CONFIG = {
  root: ".mdmd",
  baseLayer: "layer-4",
  extension: ".mdmd.md",
  exclude: ["generated/**", "assets/**", "archive/**"],
  bundleExclude: ["archive/*.record.md", "notes/plan.md"]
};

let repository: string;
let commit: string;

function git(args: string[]): string {
  return execFileSync("git", args, { cwd: repository, env: FIXTURE_GIT_ENV, encoding: "utf8" }).trim();
}

function write(file: string, text: string): void {
  fs.mkdirSync(path.dirname(path.join(repository, file)), { recursive: true });
  fs.writeFileSync(path.join(repository, file), text, "utf8");
}

function link(file: string, target: string): void {
  fs.mkdirSync(path.dirname(path.join(repository, file)), { recursive: true });
  fs.symlinkSync(target, path.join(repository, file));
}

function history(args: string[]): { exitCode: number; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [tsxCli, "--tsconfig", tsconfigPath, historyScript, "--workspace", repository, "--jobs", "2", ...args], { encoding: "utf8", env: process.env });
  return { exitCode: result.status ?? 1, stdout: result.stdout, stderr: result.stderr };
}

function sequence(): HistorySequence {
  return JSON.parse(fs.readFileSync(path.join(repository, ".mdmd", "history", "history.json"), "utf8")) as HistorySequence;
}

function summary(): CommitSummary {
  const lens = sequence().lens.key;
  return JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(repository, ".mdmd", "history", lens, `${commit}.json.gz`))).toString("utf8")) as CommitSummary;
}

/** The document links of the sequence's last step, `file -> document`. */
function lastLinks(): string[] {
  const read = sequence();
  return [...seek(read, read.steps.length).docLinks].map((key) => key.replace("\u0000", " -> ")).sort();
}

beforeAll(async () => {
  repository = path.join(privateTemporary, "repository");
  fs.mkdirSync(repository);
  git(["init", "--quiet", "-b", "main"]);
  write(".live-docs.config.json", `${JSON.stringify(CONFIG, null, 2)}\n`);
  write("src/index.ts", 'export * from "../generated/api";\nimport { thing } from "../generated/types";\nimport logo from "../assets/logo.png";\n\n/** The thing and the logo. */\nexport const both = [thing, logo];\n');
  write("src/a.ts", "/** A. */\nexport const a = 1;\n");
  write("src/b.ts", "/** B. */\nexport const b = 2;\n");
  write("generated/api.ts", "/** The API. */\nexport interface Api {\n  name: string;\n}\n\n/** The API's value. */\nexport const api = 1;\n");
  write("generated/types.ts", "/** A thing. */\nexport const thing = 2;\n");
  write("assets/logo.png", "not a picture\n");
  write("AGENTS.md", "# Agents\n\nSee [a](src/a.ts).\n");
  link("CLAUDE.md", "AGENTS.md");
  link("lib/b.ts", "../src/b.ts");
  write("docs/guide.md", "# Guide\n");
  link("docs/alias.md", "guide.md");
  write("archive/day.record.md", "# A day\n");
  write("archive/kept.md", "# Kept\n");
  // A link beneath the docs root to a document outside it (the review's second pass): copied, it cites and is linked.
  write("notes/x/guide.md", "# A guide kept in notes\n\nSee [a](../../src/a.ts).\n");
  link(".mdmd/layer-1/guide.md", "../../notes/x/guide.md");
  // A document the bundle excludes that cites a file: the cache keeps the citation, the sequence leaves it out.
  write("notes/plan.md", "# Plan\n\nSee [a](../src/a.ts).\n");
  const config = normalizeLiveDocumentationConfig(CONFIG);
  await generateLiveDocs({ workspaceRoot: repository, config, logger: { info: () => undefined, warn: () => undefined, error: () => undefined } });
  // The authored words of `src/a.ts` link a linked document, a document the bundle excludes and one it keeps.
  const doc = path.join(repository, ".mdmd", "layer-4", "src", "a.ts.mdmd.md");
  const text = fs.readFileSync(doc, "utf8");
  fs.writeFileSync(doc, text.replace("### Notes\n", "### Notes\n- See [the alias](../../../docs/alias.md), [the guide](../../../docs/guide.md), [the layer-1 guide](../../layer-1/guide.md), [the day](../../../archive/day.record.md) and [what is kept](../../../archive/kept.md).\n"), "utf8");
  await generateLiveDocs({ workspaceRoot: repository, config, logger: { info: () => undefined, warn: () => undefined, error: () => undefined } });
  git(["add", "--all"]);
  git(["commit", "--quiet", "-m", "A repository with an excluded folder, documents the bundle excludes and links"]);
  commit = git(["rev-parse", "HEAD"]);
}, 300_000);

afterAll(() => {
  fs.rmSync(privateTemporary, { recursive: true, force: true });
});

describe("the history over excluded code, documents the bundle excludes and symbolic links", () => {
  it("holds its last step to the Live Docs committed at the head", () => {
    const run = history(["--check-head", "--keep-index"]);
    expect(run.exitCode, run.stderr).toBe(0);
    expect(run.stderr).toMatch(/the last step's \d+ files/u);
    // No link here leads anywhere but to a file of the tree, so none is named.
    expect(run.stderr).not.toContain("were not written into their trees");
  }, 300_000);

  it("reads excluded code an included file imports and re-exports, as a checkout does", () => {
    const index = summary().files.find((file) => file.path === "src/index.ts")!;
    // Resolved against the excluded files on disk, as a checkout's generator resolves them: a raw specifier would mean
    // the tree lacked them (the review's first finding).
    expect(index.dependencies.map((line) => line.label).sort()).toEqual(["../assets/logo.png", "api", "types.thing"]);
    expect((index.reExports ?? []).map((entry) => entry.name).sort()).toEqual(["Api", "api"]);
  });

  it("documents a link to code, and counts a link to a document as the document it leads to", () => {
    const kept = summary();
    expect(kept.files.map((file) => file.path)).toContain("lib/b.ts");
    expect(kept.files.find((file) => file.path === "src/a.ts")!.citedBy).toEqual([".mdmd/layer-1/guide.md", "AGENTS.md", "CLAUDE.md", "notes/plan.md", "notes/x/guide.md"]);
    expect(kept.docLinks).toEqual(expect.arrayContaining([["src/a.ts", "docs/alias.md"], ["src/a.ts", "docs/guide.md"]]));
  });

  it("keeps every linked document in the summary, the bundle's exclusions applied only where the sequence reads it", () => {
    expect(summary().docLinks).toEqual(expect.arrayContaining([["src/a.ts", "archive/day.record.md"], ["src/a.ts", "archive/kept.md"]]));
    expect(lastLinks()).toEqual(["src/a.ts -> .mdmd/layer-1/guide.md", "src/a.ts -> archive/kept.md", "src/a.ts -> docs/alias.md", "src/a.ts -> docs/guide.md"]);
  });

  it("keeps a citation the bundle excludes in the cache, the kept index as the summary, and leaves it out of the sequence", () => {
    // Nothing in the cache depends on the bundle's exclusions; every reader of it applies them (the review's second pass, finding 8).
    const lens = sequence().lens.key;
    const index = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(repository, ".mdmd", "history", lens, `${commit}.index.json.gz`))).toString("utf8")) as {
      files: Record<string, { citedBy?: Array<{ label: string }> }>;
    };
    expect((index.files["src/a.ts"].citedBy ?? []).map((entry) => entry.label)).toContain("notes/plan.md");
    const read = sequence();
    expect(momentAt(read, read.steps.length).rows.get("src/a.ts")!.citedBy).toEqual([".mdmd/layer-1/guide.md", "AGENTS.md", "CLAUDE.md", "notes/x/guide.md"]);
  });

  it("follows an edit of the bundle's exclusions at the next run, from the summaries it already holds", () => {
    const configFile = path.join(repository, ".live-docs.config.json");
    fs.writeFileSync(configFile, `${JSON.stringify({ ...CONFIG, bundleExclude: ["archive/*.md"] }, null, 2)}\n`, "utf8");
    try {
      const run = history([]);
      expect(run.exitCode, run.stderr).toBe(0);
      expect(run.stderr).toContain("1 in the cache under lens");
      expect(run.stderr).toContain("0 to regenerate");
      expect(lastLinks()).toEqual(["src/a.ts -> .mdmd/layer-1/guide.md", "src/a.ts -> docs/alias.md", "src/a.ts -> docs/guide.md"]);
    } finally {
      fs.writeFileSync(configFile, `${JSON.stringify(CONFIG, null, 2)}\n`, "utf8");
    }
  }, 300_000);
});

/**
 * A document the bundle excludes whose name holds parentheses, citing a file. The summary is made with no bundle
 * exclusion, so the generator writes a `Cited By` line for it; until the doc writer and reader were made to give every
 * name back (2026-11-19, the branch joined that evening), the reader could not read a link holding `)` back, the
 * summarizing process failed and the history with it (the independent review of 2026-11-19, finding 3). The case
 * waited on that mend as an expected failure and is an ordinary case since the joining.
 */
describe("the history over a document whose name holds parentheses", () => {
  it("finishes, the document's citation read back", () => {
    const here = path.join(privateTemporary, "parentheses");
    fs.mkdirSync(path.join(here, "src"), { recursive: true });
    fs.mkdirSync(path.join(here, "notes"), { recursive: true });
    fs.writeFileSync(path.join(here, ".live-docs.config.json"), `${JSON.stringify({ root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md", bundleExclude: ["notes/**"] })}\n`);
    fs.writeFileSync(path.join(here, "src", "a.ts"), "/** A. */\nexport const a = 1;\n");
    fs.writeFileSync(path.join(here, "notes", "plan (draft).md"), "# Plan\n\nSee [a](../src/a.ts).\n");
    for (const args of [["init", "--quiet", "-b", "main"], ["add", "--all"], ["commit", "--quiet", "-m", "A document with parentheses in its name"]]) {
      execFileSync("git", args, { cwd: here, env: FIXTURE_GIT_ENV });
    }
    const result = spawnSync(process.execPath, [tsxCli, "--tsconfig", tsconfigPath, historyScript, "--workspace", here, "--jobs", "1"], { encoding: "utf8", env: process.env });
    expect(result.status, result.stderr).toBe(0);
  }, 300_000);
});

/**
 * A citing document whose name holds `#` or a percent-escape (the second pass of the independent review, finding 1):
 * the first form of the summary's format 4 read the citing path from the `Cited By` line's link, decoding it and
 * dropping what follows `#`, so `docs/C#.md` was kept as `docs/C` and `docs/50%41off.md` as `docs/50Aoff.md`, and the
 * check at the head failed. Since the joining with the branch that makes the doc writer and reader give every name back,
 * the summary takes the citing path from the reader's model, the line's name, and the check holds.
 */
describe("the history over a citing document whose name holds # or a percent-escape", () => {
  async function checkedHistory(name: string): Promise<number | null> {
    const here = fs.mkdtempSync(path.join(privateTemporary, "citing-"));
    const config = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };
    fs.mkdirSync(path.join(here, "src"), { recursive: true });
    fs.mkdirSync(path.join(here, "docs"), { recursive: true });
    fs.writeFileSync(path.join(here, ".live-docs.config.json"), `${JSON.stringify(config)}\n`);
    fs.writeFileSync(path.join(here, "src", "a.ts"), "/** A. */\nexport const a = 1;\n");
    fs.writeFileSync(path.join(here, "docs", name), "# A note\n\nSee [a](../src/a.ts).\n");
    await generateLiveDocs({ workspaceRoot: here, config: normalizeLiveDocumentationConfig(config), logger: { info: () => undefined, warn: () => undefined, error: () => undefined } });
    for (const args of [["init", "--quiet", "-b", "main"], ["add", "--all"], ["commit", "--quiet", "-m", "A citing document with an awkward name"]]) {
      execFileSync("git", args, { cwd: here, env: FIXTURE_GIT_ENV });
    }
    return spawnSync(process.execPath, [tsxCli, "--tsconfig", tsconfigPath, historyScript, "--workspace", here, "--jobs", "1", "--check-head"], { encoding: "utf8", env: process.env }).status;
  }

  it("holds docs/C#.md as it is named, the check at the head passing", async () => {
    expect(await checkedHistory("C#.md")).toBe(0);
  }, 300_000);

  it("holds docs/50%41off.md as it is named, the check at the head passing", async () => {
    expect(await checkedHistory("50%41off.md")).toBe(0);
  }, 300_000);
});

/** A repository of its own, its mirror generated in a checkout and committed: its top level, its configuration and a quiet logger. */
async function mirrored(name: string, files: Record<string, string>): Promise<{ here: string; config: ReturnType<typeof normalizeLiveDocumentationConfig>; run: (args: string[]) => string }> {
  const here = fs.mkdtempSync(path.join(privateTemporary, `${name}-`));
  const config = normalizeLiveDocumentationConfig({ root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" });
  fs.writeFileSync(path.join(here, ".live-docs.config.json"), `${JSON.stringify({ root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" })}\n`);
  for (const [file, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(here, file)), { recursive: true });
    fs.writeFileSync(path.join(here, file), text);
  }
  await generateLiveDocs({ workspaceRoot: here, config, logger: { info: () => undefined, warn: () => undefined, error: () => undefined } });
  const run = (args: string[]): string => execFileSync("git", args, { cwd: here, env: FIXTURE_GIT_ENV, encoding: "utf8" }).trim();
  run(["init", "--quiet", "-b", "main"]);
  return { here, config, run };
}

/**
 * The check at the head reads the committed docs from git's object store, following a doc that is a symbolic link
 * through the commit's own listing as the tree writer does (the independent review of 2026-11-20, finding 2): the first
 * form of that reader knew the targets of the links among the docs alone, so that a doc reached through a link outside
 * the base layer, or through a folder that is a link, read as a link to nothing and the check failed falsely.
 */
describe("the committed docs read from the object store, through symbolic links", () => {
  it("reads a doc that is a link to a link outside the base layer, and one reached through a folder that is a link, as the tree writer writes them", async () => {
    const { here, config, run } = await mirrored("linked-docs", { "src/a.ts": "/** A. */\nexport const a = 1;\n", "src/b.ts": "/** B. */\nexport const b = 2;\n" });
    const docs = path.join(here, ".mdmd", "layer-4", "src");
    // a's doc: a link to `shared/a.ts.mdmd.md`, itself a link to the file in `real/`.
    fs.mkdirSync(path.join(here, "real"));
    fs.renameSync(path.join(docs, "a.ts.mdmd.md"), path.join(here, "real", "a.ts.mdmd.md"));
    fs.mkdirSync(path.join(here, "shared"));
    fs.symlinkSync("../real/a.ts.mdmd.md", path.join(here, "shared", "a.ts.mdmd.md"));
    fs.symlinkSync("../../../shared/a.ts.mdmd.md", path.join(docs, "a.ts.mdmd.md"));
    // b's doc: a link through `store`, a folder that is a link to `store-real`.
    fs.mkdirSync(path.join(here, "store-real", "docs"), { recursive: true });
    fs.renameSync(path.join(docs, "b.ts.mdmd.md"), path.join(here, "store-real", "docs", "b.ts.mdmd.md"));
    fs.symlinkSync("store-real", path.join(here, "store"));
    fs.symlinkSync("../../../store/docs/b.ts.mdmd.md", path.join(docs, "b.ts.mdmd.md"));
    run(["add", "--all"]);
    run(["commit", "--quiet", "-m", "Docs that are links through links and through a folder that is a link"]);
    const commit = run(["rev-parse", "HEAD"]);

    const committed = await committedLiveDocGraph(here, commit, config);
    // The oracle: the commit's tree as the history's tree writer writes it, read from the disk by the doc reader.
    const tree = fs.mkdtempSync(path.join(privateTemporary, "linked-tree-"));
    // The folder that is a link is not written as one, and what is read through it is written as a copy.
    expect((await writeStoredTree(path.join(here, ".git"), commit, tree)).map((entry) => entry.path)).toEqual(["store"]);
    const onDisk = await readLiveDocGraph({ workspaceRoot: tree, config });
    expect(Object.keys(committed.files)).toEqual(expect.arrayContaining(["src/a.ts", "src/b.ts"]));
    expect(Object.keys(committed.files).sort()).toEqual(Object.keys(onDisk.files).sort());
    for (const file of ["src/a.ts", "src/b.ts"]) expect(committed.files[file], file).toEqual(onDisk.files[file]);
  }, 120_000);
});

/**
 * A committed doc whose file the head's tree cannot hold under its own name (the independent review of 2026-11-20,
 * finding 4): here a name that is not UTF-8, which the tree writer leaves out on every disk, standing for the names
 * Windows reserves and the names a folding disk takes for one, which this disk holds. The check at the head reads the
 * committed docs from git's object store, where the name stands, and must not compare what the history never read.
 */
describe("the check at the head over a doc whose file the head's tree left out", () => {
  it("passes, naming the file it did not compare and why", async () => {
    const { here, run } = await mirrored("left-out", { "src/a.ts": "/** A. */\nexport const a = 1;\n", "src/cafe.ts": "/** A cafe. */\nexport const cafe = 2;\n" });
    // The file and its doc renamed to a name holding é as Latin-1 writes it, a byte that is not UTF-8. The doc carries
    // the code path a generator writes for that name: the byte read as U+FFFD, as node gives such a name and as the
    // history's tree writer names the entry it leaves out, so that the file is passed over by its code path.
    const doc = path.join(here, ".mdmd", "layer-4", "src", "cafe.ts.mdmd.md");
    fs.writeFileSync(doc, fs.readFileSync(doc, "utf8").replaceAll("cafe.ts", "caf�.ts"));
    const latin = (file: string): Buffer => Buffer.from(path.join(here, file).replace("cafe", "café"), "latin1");
    fs.renameSync(path.join(here, "src", "cafe.ts"), latin("src/cafe.ts"));
    fs.renameSync(doc, latin(".mdmd/layer-4/src/cafe.ts.mdmd.md"));
    run(["add", "--all"]);
    run(["commit", "--quiet", "-m", "A file whose name is not UTF-8, and its doc"]);
    const result = spawnSync(process.execPath, [tsxCli, "--tsconfig", tsconfigPath, historyScript, "--workspace", here, "--jobs", "1", "--check-head"], { encoding: "utf8", env: process.env });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).toContain("its name is not valid UTF-8");
    expect(result.stdout).toContain("not compared, since the head's tree did not hold them and so the history does not read them:");
    expect(result.stdout).toContain("src/caf�.ts (its name is not valid UTF-8, so it cannot be written under its own name)");
  }, 300_000);
});

/** A configuration saved as Windows tools save one: the history reads it as every other command does. */
describe("the history over a repository whose configuration is saved as UTF-16 with a byte-order mark", () => {
  it("reads the configuration and finishes", () => {
    const here = fs.mkdtempSync(path.join(privateTemporary, "utf16-"));
    fs.mkdirSync(path.join(here, "src"), { recursive: true });
    const text = `${JSON.stringify({ root: "docs-root", baseLayer: "files", extension: ".md" }, null, 2)}\r\n`;
    fs.writeFileSync(path.join(here, ".live-docs.config.json"), Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, "utf16le")]));
    fs.writeFileSync(path.join(here, "src", "a.ts"), "/** A. */\nexport const a = 1;\n");
    for (const args of [["init", "--quiet", "-b", "main"], ["add", "--all"], ["commit", "--quiet", "-m", "A configuration saved as UTF-16"]]) {
      execFileSync("git", args, { cwd: here, env: FIXTURE_GIT_ENV });
    }
    const result = spawnSync(process.execPath, [tsxCli, "--tsconfig", tsconfigPath, historyScript, "--workspace", here, "--jobs", "1"], { encoding: "utf8", env: process.env });
    expect(result.status, result.stderr).toBe(0);
    // The configuration's own docs root, not the default: the file was read.
    expect(fs.existsSync(path.join(here, "docs-root", "history", "history.json"))).toBe(true);
  }, 300_000);
});
