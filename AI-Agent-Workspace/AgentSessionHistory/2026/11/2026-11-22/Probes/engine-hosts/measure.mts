// Measures one scan under Node: time, peak memory, reads per file, and a digest of what it wrote.
//   tsx --tsconfig tsconfig.base.json measure.mts <corpus> <label> [<budget in MiB>]
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
const fsSync = createRequire(import.meta.url)("node:fs") as typeof import("node:fs");
import path from "node:path";

const [corpus, label, budget] = process.argv.slice(2);
// An optional third argument: the bytes the run keeps between its passes (`readBudget`, from 2026-11-22), in MiB.
const readBudget = budget === undefined ? {} : { readBudget: Number(budget) * 1024 * 1024 };
const work = path.join(path.dirname(corpus), `run-${label}`);
fsSync.rmSync(work, { recursive: true, force: true });
fsSync.cpSync(corpus, work, { recursive: true });

const reads = new Map<string, number>();
const note = (file: unknown): void => {
  const key = path.resolve(String(file));
  reads.set(key, (reads.get(key) ?? 0) + 1);
};
const promises = fsSync.promises as unknown as Record<string, (...args: unknown[]) => unknown>;
for (const name of ["readFile", "open"]) {
  const original = promises[name];
  promises[name] = function (this: unknown, ...args: unknown[]) {
    note(args[0]);
    return original.apply(this, args);
  };
}
const syncFs = fsSync as unknown as Record<string, (...args: unknown[]) => unknown>;
const originalSync = syncFs.readFileSync;
syncFs.readFileSync = function (this: unknown, ...args: unknown[]) {
  note(args[0]);
  return originalSync.apply(this, args);
};

const { generateLiveDocs } = await import("@live-documentation/generator/generator");
const quiet = (): undefined => undefined;
const started = performance.now();
const result = await generateLiveDocs({ workspaceRoot: work, ...readBudget, now: () => new Date("2026-01-01T00:00:00.000Z"), logger: { info: quiet, warn: quiet, error: quiet } });
const ms = performance.now() - started;

const docsRoot = path.join(work, ".live-documentation");
const sourceReads = [...reads].filter(([file]) => file.startsWith(`${work}/`) && !file.startsWith(`${docsRoot}/`));
const histogram: Record<number, number> = {};
for (const [, times] of sourceReads) histogram[times] = (histogram[times] ?? 0) + 1;
const digest = createHash("sha256");
for (const entry of fsSync.readdirSync(docsRoot, { recursive: true, withFileTypes: true }).filter((each) => each.isFile()).map((each) => path.join(each.parentPath, each.name)).sort()) {
  digest.update(path.relative(work, entry)).update("\0").update(fsSync.readFileSync(entry)).update("\0");
}
console.log(JSON.stringify({
  label,
  seconds: +(ms / 1000).toFixed(2),
  peakRssMB: Math.round(process.resourceUsage().maxRSS / 1024),
  processed: result.processed,
  failed: result.failed.length,
  sourceFilesRead: sourceReads.length,
  sourceReads: sourceReads.reduce((sum, [, times]) => sum + times, 0),
  readsPerFile: histogram,
  mostRead: sourceReads.sort((a, b) => b[1] - a[1]).slice(0, 3).map(([file, times]) => `${path.relative(work, file)} ${times}`),
  digest: digest.digest("hex").slice(0, 16)
}));
fsSync.rmSync(work, { recursive: true, force: true });
