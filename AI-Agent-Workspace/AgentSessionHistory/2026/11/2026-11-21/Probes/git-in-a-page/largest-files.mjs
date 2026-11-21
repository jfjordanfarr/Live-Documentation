// Probe of November 21, 2026 (not product code): the largest files of a repository's head and how long the reader
// takes to give each one's bytes, for the longest stretch a page could go without drawing while it reads them.
//   node largest-files.mjs <folder holding .git> [how many]
import { openRepository } from "./git-reader.mjs";
import { nodeHost } from "./node-host.mjs";

const [folder, countText = "5"] = process.argv.slice(2);
const host = nodeHost(folder);
const repository = await openRepository(host, ".git");
const head = await repository.commit((await repository.resolve("HEAD")).id);
const sized = [];
let total = 0;
for (const [file, id, mode] of await repository.files(head.tree)) {
  if (mode === "160000") continue;
  const size = (await repository.blob(id)).length;
  total += size;
  sized.push({ file, id, size });
}
sized.sort((a, b) => b.size - a.size);
const out = [];
for (const entry of sized.slice(0, Number(countText))) {
  const freshHost = nodeHost(folder);
  const fresh = await openRepository(freshHost, ".git");
  const started = performance.now();
  await fresh.blob(entry.id);
  const readMs = Math.round(performance.now() - started);
  await freshHost.close();
  out.push({ file: entry.file, megabytes: +(entry.size / 1048576).toFixed(1), readMs });
}
await host.close();
console.log(JSON.stringify({ files: sized.length, headMegabytes: +(total / 1048576).toFixed(1), overOneMegabyte: sized.filter((e) => e.size > 1048576).length, largest: out }));
