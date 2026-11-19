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
import type { HistorySequence } from "../../../packages/engine/src/live-docs/history/format";
import { momentAt, seek } from "../../../packages/engine/src/live-docs/history/sequence";
import type { CommitSummary } from "../../../packages/engine/src/live-docs/history/summary";
import { generateLiveDocs } from "../../../packages/generator/src/generator";
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
 * exclusion, so the generator writes a `Cited By` line for it, and the doc reader cannot read a link holding `)` back
 * (`document.ts`; the independent review of 2026-11-19, finding 3): the summarizing process fails and the history with
 * it. The fault is the reader's, older than the history's change, and owed to the builder who owns the doc reader and
 * writer; this case waits on that mend, and is to become an ordinary case, the history finishing, once it lands.
 */
describe("the history over a document whose name holds parentheses (waiting on the doc reader's mend)", () => {
  it.fails("finishes, the document's citation read back", () => {
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
 * the summary reads the citing path from the `Cited By` line's link, decoding it and dropping what follows `#`, but the
 * generator writes that link as a plain path, so `docs/C#.md` is kept as `docs/C` and `docs/50%41off.md` as
 * `docs/50Aoff.md`, and the check at the head fails. On the branch that mends the doc writer and reader, a generated
 * link's path is percent-encoded and the reader decodes it, so the right mend takes the citing path from the doc
 * reader's model when the branches join; these cases wait on that joining, and are to become ordinary cases then.
 */
describe("the history over a citing document whose name holds # or a percent-escape (waiting on the joining with the doc reader's mend)", () => {
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

  it.fails("holds docs/C#.md as it is named, the check at the head passing", async () => {
    expect(await checkedHistory("C#.md")).toBe(0);
  }, 300_000);

  it.fails("holds docs/50%41off.md as it is named, the check at the head passing", async () => {
    expect(await checkedHistory("50%41off.md")).toBe(0);
  }, 300_000);
});
