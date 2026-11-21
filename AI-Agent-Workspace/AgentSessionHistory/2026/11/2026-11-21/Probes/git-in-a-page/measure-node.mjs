// Probe of November 21, 2026 (not product code): one task of the workload under Node, through the disk host, the same
// workload the page runs. Prints one JSON line with the process's peak resident memory.
//   node measure-node.mjs <folder holding .git> <task>      (tasks as in measure-page.mjs)
import { nodeHost } from "./node-host.mjs";
import { describe, measure } from "./workload.mjs";

const [folder, task = "all"] = process.argv.slice(2);
const tasks = { all: {}, commits: { blobs: false }, newest100: { limit: 100, headTree: true } };
const host = nodeHost(folder);
const t0 = performance.now();
const described = await describe(host);
const listedMs = Math.round(performance.now() - t0);
const result = await measure(host, { ...tasks[task], memory: () => Math.round(process.memoryUsage().heapUsed / 1048576) });
await host.close();
console.log(JSON.stringify({ folder: folder.split("/").at(-1), task, listedMs, files: described.files, result, peakRssMB: Math.round(process.resourceUsage().maxRSS / 1024) }));
