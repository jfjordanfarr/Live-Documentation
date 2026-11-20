/**
 * A real worker of the history that meets a file the generator cannot map warns of it, by name and reason: the line
 * the history command gathers across the changes and prints (`summarizeChange.ts`), so that a person running it is
 * told, besides the summary that carries the file (`unmapped`). Until 2026-11-20 no test made a real worker give that
 * warning, and its removal left everything green (the reviewer's second look of that day). Beside
 * `history-workers.test.ts`, whose helpers are not exported; the smallest of them are copied here.
 */
import { fork } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { summarizedConfiguration } from "../../../packages/engine/src/live-docs/history/lens";
import { summarizingEnvironment, summarizingFlags } from "../../../packages/generator/src/history/regenerate";
import type { WorkerReport, WorkerTask } from "../../../packages/generator/src/history/summarizeChange";
import { buildRepository, git } from "./scripted-repository";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const tsconfigPath = path.join(repoRoot, "tsconfig.base.json");

// A private, short temporary folder for the trees and for tsx's socket, shared with no other run on the machine.
const privateTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "lww-"));
afterAll(() => {
  fs.rmSync(privateTemporary, { recursive: true, force: true });
});

/** A real worker, forked as the pool forks it, in a folder of its own (a copy of `startRealWorker` in `history-workers.test.ts`, without its imports). */
function startRealWorker(store: string): { summarize: (task: WorkerTask) => Promise<WorkerReport>; end: () => void } {
  const worker = path.join(repoRoot, "packages", "generator", "src", "history", "summarizeChange.ts");
  const folder = fs.mkdtempSync(path.join(privateTemporary, "worker-"));
  const child = fork(worker, ["--worker", store, folder], { stdio: ["ignore", "ignore", "pipe", "ipc"], env: summarizingEnvironment({ ...process.env, TMPDIR: privateTemporary, TSX_TSCONFIG_PATH: tsconfigPath }), execArgv: summarizingFlags(worker) });
  let errors = "";
  child.stderr?.setEncoding("utf8");
  child.stderr?.on("data", (text: string) => {
    errors += text;
  });
  const summarize = (task: WorkerTask): Promise<WorkerReport> =>
    new Promise<WorkerReport>((resolve, reject) => {
      child.once("message", (message) => resolve(message as WorkerReport));
      child.once("exit", (code) => reject(new Error(`the worker ended (exit ${code}): ${errors}`)));
      child.send(task);
    });
  return { summarize, end: () => child.disconnect() };
}

describe("a real worker over a file the generator cannot map", () => {
  it("warns of the file, by its path and the reason, which names no path of the worker's tree", async () => {
    const repository = fs.mkdtempSync(path.join(privateTemporary, "unmapped-"));
    const config = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };
    // A name the disk holds, whose doc's name it does not (`<name>.mdmd.md` is longer than 255 bytes).
    const long = `src/${"n".repeat(247)}.ts`;
    const [commit] = buildRepository(repository, [{ message: "A long name", date: "2026-01-05T10:00:00+00:00", write: { ".live-docs.config.json": `${JSON.stringify(config)}\n`, [long]: "export const x = 1;\n", "src/a.ts": "export const a = 1;\n" } }]);
    const store = git(repository, ["rev-parse", "--path-format=absolute", "--git-common-dir"]).trim();
    const cache = fs.mkdtempSync(path.join(privateTemporary, "cache-"));
    const task: WorkerTask = {
      configuration: summarizedConfiguration(normalizeLiveDocumentationConfig(config)),
      lens: "0123456789abcdef",
      commit,
      summaryPath: path.join(cache, `${commit}.json.gz`),
      textStore: path.join(cache, "texts")
    };
    const worker = startRealWorker(store);
    try {
      const report = await worker.summarize(task);
      expect(report.published).toBe(true);
      expect(report.unmapped.map(({ path: file }) => file)).toEqual([long]);
      const warnings = report.warned.filter((line) => line.startsWith("could not map "));
      expect(warnings).toEqual([`could not map ${long}: ${report.unmapped[0].reason}`]);
      expect(report.unmapped[0].reason).toMatch(/^ENAMETOOLONG/u);
      expect(warnings[0]).not.toContain(privateTemporary);
    } finally {
      worker.end();
    }
  }, 120_000);
});
