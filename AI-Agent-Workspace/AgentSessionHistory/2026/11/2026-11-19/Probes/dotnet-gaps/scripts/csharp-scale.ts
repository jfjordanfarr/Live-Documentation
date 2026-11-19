// Runs the C# adapter's two passes over the first N C# files of a corpus (sorted, seeded order), with every project file
// in the index, and prints the time and the docs' dependencies digest, so that runs of 400, 1,000 and 2,000 files can be
// compared before and after a change. Usage: csharp-scale.ts <corpus> <count> <out.json>
import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { buildWorkspaceIndexes } from "/workspaces/Live-Documentation/.claude/worktrees/agent-ac7ef8df4222b2e4b/packages/engine/src/live-docs/discovery";
import { csharpAdapter } from "/workspaces/Live-Documentation/.claude/worktrees/agent-ac7ef8df4222b2e4b/packages/engine/src/live-docs/adapters/csharp";

async function walk(root: string, dir: string, out: string[]): Promise<void> {
  for (const entry of await fs.readdir(path.join(root, dir), { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === ".live-documentation" || entry.name === "node_modules" || entry.name === "bin" || entry.name === "obj") continue;
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await walk(root, rel, out);
    else out.push(rel);
  }
}

function seededOrder<T>(items: T[], seed: number): T[] {
  let state = seed;
  const random = () => ((state = (state * 1103515245 + 12345) % 2147483648) / 2147483648);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function main(): Promise<void> {
  const [root, countText, outFile] = process.argv.slice(2);
  const all: string[] = [];
  await walk(root, "", all);
  all.sort();
  const projects = all.filter((file) => /\.(cs|vb|fs)proj$/iu.test(file));
  const cs = seededOrder(all.filter((file) => file.endsWith(".cs")), 1119).slice(0, Number(countText)).sort();
  const fileIndex = new Set([...projects, ...cs]);
  const targetFiles = [...fileIndex].sort().map((file) => path.join(root, file));
  const started = process.hrtime.bigint();
  const cpu0 = process.cpuUsage();
  const { symbols } = await buildWorkspaceIndexes({ targetFiles, workspaceRoot: root, liveDocsRoot: ".live-documentation/source", docExtension: ".md", fileIndex });
  const indexed = process.hrtime.bigint();
  const results: Record<string, unknown> = {};
  for (const file of cs) {
    const result = await csharpAdapter.analyze({ absolutePath: path.join(root, file), workspaceRoot: root, fileIndex, symbolIndex: symbols });
    results[file] = result?.dependencies;
  }
  const done = process.hrtime.bigint();
  const cpu = process.cpuUsage(cpu0);
  const digest = createHash("sha256").update(JSON.stringify(results)).digest("hex").slice(0, 16);
  await fs.writeFile(outFile, JSON.stringify(results));
  const counters = (globalThis as { __csharpCounters?: Record<string, number> }).__csharpCounters ?? {};
  console.log(JSON.stringify({
    files: cs.length,
    indexSeconds: Number(indexed - started) / 1e9,
    analyzeSeconds: Number(done - indexed) / 1e9,
    cpuSeconds: (cpu.user + cpu.system) / 1e6,
    digest,
    counters
  }));
}
void main();
