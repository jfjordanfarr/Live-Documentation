import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import type { HistoryLens } from "@live-documentation/engine/live-docs/history/format";
import { writeStoredTree } from "@live-documentation/engine/live-docs/history/git";
import { lensOf } from "@live-documentation/engine/live-docs/history/lens";
import type { MainlineChange } from "@live-documentation/engine/live-docs/history/versionControl";

import { generateLiveDocs } from "../generator";
import { poolMemory } from "./computeHistory";
import { regenerate, Scratch, workerBound, workerTask, type Worker } from "./regenerate";
import { summarizeChange, treeOptions, type WorkerReport } from "./summarizeChange";

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
    expect(await writeStoredTree(path.join(repository, ".git"), commit, tree, treeOptions(configuration, tree))).toEqual([]);
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

/** A change of a line of stand-ins, numbered. */
function change(number: number): MainlineChange {
  return { id: `${number}`.padStart(40, "0"), parents: [], date: "2026-11-20T00:00:00Z", author: "Ada", subject: `change ${number}` };
}

/**
 * A pool whose workers are stand-ins: each answers its nth change (from 0) with what `report` gives, and every call is
 * logged as `worker:change`, and `worker:end` when a worker is ended.
 */
async function standInPool(changes: number, jobs: number, memory: number, report: (worker: number, nth: number) => Partial<WorkerReport>): Promise<{ calls: string[]; published: string[]; timings: number[]; lines: string[] }> {
  const calls: string[] = [];
  const lines: string[] = [];
  const published: string[] = [];
  let started = 0;
  const startWorker = async (): Promise<Worker> => {
    const worker = started++;
    let nth = 0;
    return {
      summarize: async (task) => {
        const said: WorkerReport = { peakMemory: 1, unwritten: [], warned: [], broughtForward: nth > 0, marked: [], published: true, unmapped: [], heldMemory: 1, heapShare: 0, ...report(worker, nth++) };
        calls.push(`${worker}:${Number(task.id)}`);
        if (said.published) published.push(`${Number(task.id)}`);
        return said;
      },
      end: async () => {
        calls.push(`${worker}:end`);
      }
    };
  };
  const configuration = normalizeLiveDocumentationConfig({ root: ".mdmd", baseLayer: "layer-4" });
  const { timings } = await regenerate(Array.from({ length: changes }, (_, index) => change(index + 1)), {
    store: "unused",
    configuration,
    lens: { key: "stand-in", configuration } as unknown as HistoryLens,
    cacheFolder: "unused",
    keepIndex: false,
    jobs,
    memory,
    scratch: new Scratch(),
    progress: (line) => lines.push(line),
    startWorker
  });
  return { calls, published, timings, lines };
}

describe("a worker whose tree-sitter runtime faulted", () => {
  // A fault after a worker's first change may come of a state an earlier change left, which a fresh process would not
  // make (the independent review of 2026-11-20, its fourth round): that change goes once more, to a fresh worker.
  it("has its change summarized again by a fresh worker, written once, and the worker ended", async () => {
    const { calls, published, timings } = await standInPool(3, 1, 1e12, (worker, nth) => (worker === 0 && nth === 1 ? { marked: ["runtime"], published: false } : {}));
    expect(calls).toEqual(["0:1", "0:2", "0:end", "1:2", "1:3", "1:end"]);
    expect(published).toEqual(["1", "2", "3"]);
    expect(timings).toHaveLength(3);
  });

  it("in its first change is ended after it, the change written as a fresh process makes it and never summarized again", async () => {
    const { calls, published } = await standInPool(2, 1, 1e12, (_worker, nth) => (nth === 0 ? { marked: ["runtime"] } : {}));
    expect(calls).toEqual(["0:1", "0:end", "1:2", "1:end"]);
    expect(published).toEqual(["1", "2"]);
  });

  it("fails the run where a fresh worker does not write its first change", async () => {
    await expect(standInPool(1, 1, 1e12, () => ({ marked: ["runtime"], published: false }))).rejects.toThrow("a fresh worker did not write");
  });
});

describe("a file that failed for a cause of the machine's", () => {
  // A failed system call (too many open files, a full disk) is no property of the change, so its summary is never
  // written: the change is tried once more by a fresh worker, and the run stops if it fails again (2026-11-20).
  const machine = { published: false, marked: ["unmapped" as const], unmapped: [{ path: "src/a.ts", reason: "EMFILE: too many open files, open 'src/a.ts'" }], machineFailure: { path: "src/a.ts", error: "EMFILE: too many open files, open 'src/a.ts'" } };

  it("is tried once more by a fresh worker, even in a worker's first change", async () => {
    const { calls, published } = await standInPool(2, 1, 1e12, (worker, nth) => (worker === 0 && nth === 0 ? machine : {}));
    expect(calls).toEqual(["0:1", "0:end", "1:1", "1:2", "1:end"]);
    expect(published).toEqual(["1", "2"]);
  });

  it("stops the run, naming the change, the file and the error, when the fresh worker fails so too", async () => {
    await expect(standInPool(1, 1, 1e12, () => machine)).rejects.toThrow(`the summary of ${"1".padStart(40, "0")} failed twice for a cause of the machine's: src/a.ts: EMFILE: too many open files`);
  });
});

/**
 * What the run's last lines say of the changes a fresh process decided and of the files the generator could not map,
 * each counted as it is named. Until a review of 2026-11-20 the files were counted once at every change that held one,
 * so that one file standing unmapped through 500 changes read as 500 files, and a change counted as decided by a fresh
 * process only where the fresh process was itself marked: a change refused by a warm worker for a mark the fresh one
 * does not repeat, the very case the mark exists for, had its own line and was missing from the totals.
 */
describe("the run's last lines", () => {
  const deep = { path: "src/deep.ts", reason: "Maximum call stack size exceeded" };
  const other = { path: "src/other.ts", reason: "ENAMETOOLONG: name too long, open '.mdmd/layer-4/src/other.ts.mdmd.md'" };

  it("count the files the generator could not map once each, and the changes at which any was", async () => {
    // A file not mapped marks the worker, so each such change is a fresh worker's first, and the worker is ended after it.
    const unmapped = [[deep], [deep, other], []];
    const { lines } = await standInPool(3, 1, 1e12, (worker) => (unmapped[worker].length > 0 ? { marked: ["unmapped"], unmapped: unmapped[worker] } : {}));
    expect(lines).toContain("2 files the generator could not map, at 2 of the 3 changes regenerated; each summary names its own");
    expect(lines).toContain("2 of the 3 changes regenerated were decided by a fresh process: a file the generator could not map");
  });

  it("count a change a warm worker was marked at and a fresh one decided, by what the warm worker was marked for", async () => {
    const refused = await standInPool(2, 1, 1e12, (worker, nth) => (worker === 0 && nth === 1 ? { marked: ["deep"], published: false } : {}));
    expect(refused.lines).toContain(`${"2".padStart(40, "0").slice(0, 8)}: its worker, which had summarized earlier changes, was marked: a file nested beyond the reading depth; summarized again in a fresh worker`);
    expect(refused.lines).toContain("1 of the 2 changes regenerated were decided by a fresh process: a file nested beyond the reading depth");
    // The fresh worker marked for another reason: the change is counted by the first worker's, once.
    const otherwise = await standInPool(2, 1, 1e12, (worker, nth) => (worker === 0 && nth === 1 ? { marked: ["deep"], published: false } : worker === 1 ? { marked: ["unmapped"], unmapped: [deep] } : {}));
    expect(otherwise.lines.filter((line) => line.includes("decided by a fresh process"))).toEqual([
      `${"2".padStart(40, "0").slice(0, 8)}: decided by a fresh process, its worker ended after it: a file the generator could not map`,
      "1 of the 2 changes regenerated were decided by a fresh process: a file nested beyond the reading depth"
    ]);
  });

  it("count a change tried again for a cause of the machine's under that reason alone, and a file truly not mapped beside it under its own", async () => {
    // The generator's catch marks the worker for every failure before anyone knows whose it is, so a failure of the
    // machine's comes with the mark of a file not mapped: counted under it, the person would read that a file of theirs
    // could not be mapped when nothing is wrong with the file (the root, 2026-11-20).
    const failure = { path: deep.path, error: "EMFILE: too many open files" };
    const machine = { published: false, marked: ["unmapped" as const], unmapped: [deep], machineFailure: failure };
    const alone = await standInPool(2, 1, 1e12, (worker, nth) => (worker === 0 && nth === 0 ? machine : {}));
    expect(alone.lines.filter((line) => line.includes("changes regenerated were decided by a fresh process"))).toEqual([
      "1 of the 2 changes regenerated were decided by a fresh process: a file that failed for a cause of the machine's"
    ]);
    expect(alone.lines.some((line) => line.includes("files the generator could not map, at"))).toBe(false);
    // The same change holding a file beyond the depth and another the generator truly could not map: each still counts.
    const beside = { ...machine, marked: ["deep" as const, "unmapped" as const], unmapped: [deep, other] };
    const both = await standInPool(2, 1, 1e12, (worker, nth) => (worker === 0 && nth === 0 ? beside : {}));
    expect(both.lines.filter((line) => line.includes("changes regenerated were decided by a fresh process"))).toEqual([
      "1 of the 2 changes regenerated were decided by a fresh process: a file nested beyond the reading depth",
      "1 of the 2 changes regenerated were decided by a fresh process: a file the generator could not map",
      "1 of the 2 changes regenerated were decided by a fresh process: a file that failed for a cause of the machine's"
    ]);
  });

  it("say once, with the number of changes that gave it, each file the generator warned it could not map", async () => {
    const warned = [`could not map ${deep.path}: ${deep.reason}`];
    const { lines } = await standInPool(3, 1, 1e12, (_worker, nth) => (nth < 2 ? { warned } : {}));
    expect(lines).toContain(`the generator warned at 2 of the 3 changes regenerated: could not map ${deep.path}: ${deep.reason}`);
  });
});

/**
 * Git's `core.ignorecase` is part of the lens, and each worker's tree pins git's setting to the value keyed. The worker's
 * end of that route is held by a real worker (`history-workers.test.ts`), which builds its own task; until the review
 * of the cache's key (2026-11-20) nothing held the command's end, the task the pool sends.
 */
describe("the task a worker is sent", () => {
  const configuration = normalizeLiveDocumentationConfig({ root: ".mdmd", baseLayer: "layer-4" });
  const generator = { version: "0.0.0", code: "0a1b2c3d4e5f6a7b", commit: "dec184ec", modified: null };
  const context = (ignoresCase: boolean) => ({ configuration, lens: lensOf(generator, configuration, { ignoresCase }), cacheFolder: "cache", keepIndex: false });

  it("carries the lens's word that the repository matches names without regard to case: true where the lens says so, false where it does not", () => {
    expect(workerTask(change(1), context(true)).ignoresCase).toBe(true);
    expect(workerTask(change(1), context(false)).ignoresCase).toBe(false);
    expect(workerTask(change(1), context(true)).lens).not.toBe(workerTask(change(1), context(false)).lens);
  });
});

describe("a worker's memory", () => {
  // A worker lives for the whole run, and what still grows in it with each change was not found: the workers together
  // never hold more than the pool was sized by (the independent review of 2026-11-20, its fourth round).
  it("is replaced after a change that leaves it holding more than its share of the pool's memory", async () => {
    // Two workers sharing 1,000 bytes: 500 each.
    const { calls, published } = await standInPool(4, 2, 1000, (worker, nth) => ({ heldMemory: worker === 0 && nth === 0 ? 501 : 500 }));
    expect(calls.filter((call) => call.startsWith("0:"))).toEqual(["0:1", "0:end"]);
    expect(published.sort()).toEqual(["1", "2", "3", "4"]);
  });

  it("is replaced after a change that leaves its heap holding more than half the heap's limit", async () => {
    const { calls } = await standInPool(2, 1, 1e12, (worker) => ({ heapShare: worker === 0 ? 0.51 : 0.5 }));
    expect(calls).toEqual(["0:1", "0:end", "1:2", "1:end"]);
  });

  it("bounds each worker by its share of the memory the pool was sized by", () => {
    expect(workerBound(poolMemory({ totalMemory: 64e9 }), 19)).toBeCloseTo(32e9 / 19);
    expect(workerBound(poolMemory({ totalMemory: 64e9 }), 1)).toBe(32e9);
  });
});

describe("a worker's summary", () => {
  it("writes nothing of a change, neither a text nor the summary nor the index, when it may not be kept", async () => {
    const isolated = { ...process.env, GIT_CONFIG_GLOBAL: os.devNull, GIT_CONFIG_NOSYSTEM: "1" };
    const scratch = await fs.mkdtemp(path.join(os.tmpdir(), "history-refused-"));
    try {
      const tree = path.join(scratch, "tree");
      await fs.mkdir(path.join(tree, "src"), { recursive: true });
      await fs.writeFile(path.join(tree, "src", "m.py"), "import os\n");
      execFileSync("git", ["init", "--quiet", "-b", "main"], { cwd: tree, env: isolated });
      execFileSync("git", ["add", "--all"], { cwd: tree, env: isolated });
      const configuration = normalizeLiveDocumentationConfig({ root: ".mdmd", baseLayer: "layer-4" });
      const cache = path.join(scratch, "cache");
      const task = { tree, configuration, lens: "stand-in", commit: "0".repeat(40), summaryPath: path.join(cache, "s.json.gz"), textStore: path.join(cache, "texts"), indexPath: path.join(cache, "s.index.json.gz") };
      await expect(summarizeChange(task, () => undefined, () => false)).resolves.toEqual({ published: false, unmapped: [] });
      await expect(fs.readdir(scratch)).resolves.toEqual(["tree"]);
      await expect(summarizeChange(task, () => undefined, () => true)).resolves.toEqual({ published: true, unmapped: [] });
      expect((await fs.readdir(cache)).sort()).toEqual(["s.index.json.gz", "s.json.gz", "texts"]);
    } finally {
      await fs.rm(scratch, { recursive: true, force: true });
    }
  });
});

describe("a tree written anew", () => {
  // Until 2026-11-20 a line said only ", its tree written anew", with no reason and no total, even where a cause of the
  // repository's own (a name the disk takes for another's, one too long) wrote every tree anew (the independent review
  // of that day). The worker's report carries the reason (`WorkingTree.writtenAnew`, made in `git.ts`).
  it("says why on its change's line, and the run's last lines count the changes by reason", async () => {
    const reasons = ["no earlier tree stood to bring forward", undefined, "the tree held a name its writer did not write", "the tree held a name its writer did not write"];
    const lines: string[] = [];
    const configuration = normalizeLiveDocumentationConfig({ root: ".mdmd", baseLayer: "layer-4" });
    const startWorker = async (): Promise<Worker> => ({
      summarize: async (task) => {
        const reason = reasons[Number(task.id) - 1];
        return { peakMemory: 1, unwritten: [], warned: [], broughtForward: reason === undefined, ...(reason !== undefined ? { writtenAnew: reason } : {}), marked: [], published: true, unmapped: [], heldMemory: 1, heapShare: 0 };
      },
      end: async () => undefined
    });
    await regenerate(Array.from({ length: 4 }, (_, index) => change(index + 1)), {
      store: "unused",
      configuration,
      lens: { key: "stand-in", configuration } as unknown as HistoryLens,
      cacheFolder: "unused",
      keepIndex: false,
      jobs: 1,
      memory: 1e12,
      scratch: new Scratch(),
      progress: (line) => lines.push(line),
      startWorker
    });
    const regenerated = lines.filter((line) => /^\d+\/4 regenerated: /u.test(line));
    expect(regenerated.map((line) => line.split(" in ")[1].replace(/^[\d.]+ s/u, "").split("; ")[0])).toEqual([
      ", its tree written anew: no earlier tree stood to bring forward",
      "",
      ", its tree written anew: the tree held a name its writer did not write",
      ", its tree written anew: the tree held a name its writer did not write"
    ]);
    expect(lines.slice(-2)).toEqual([
      "trees written anew at 1 of the 4 changes regenerated: no earlier tree stood to bring forward",
      "trees written anew at 2 of the 4 changes regenerated: the tree held a name its writer did not write"
    ]);
  });
});
