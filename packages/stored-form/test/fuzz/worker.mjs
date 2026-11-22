// The fuzzer's worker: reads every mutant of a range of seeds with the reader it is given, and says after each what
// the reader returned and the most memory the read held. A worker, so that the test can stop a reader that hangs and
// bound one that would take the machine's memory. It loads the reader's source as it stands (Node strips the types).
import { setFlagsFromString } from "node:v8";
import { runInNewContext } from "node:vm";
import { parentPort, workerData } from "node:worker_threads";

import { mutant } from "./mutants.mjs";

const { readerUrl, bases, bomb, from, to } = workerData;
const reader = await import(readerUrl);
// A collection before each read, so that what a read holds is measured from what the worker holds at rest.
setFlagsFromString("--expose-gc");
const gc = runInNewContext("gc");

const used = () => {
  const m = process.memoryUsage();
  return m.heapUsed + m.arrayBuffers + m.external;
};
let peak = 0;
const sampler = setInterval(() => {
  peak = Math.max(peak, used());
}, 1);

/** A reader's answer is facts or a refusal that says why, and nothing else. */
const shaped = (r) => r !== null && typeof r === "object" && ((r.ok === true && "value" in r) || (r.ok === false && typeof r.reason === "string" && r.reason.length > 0));

for (let seed = from; seed < to; seed += 1) {
  const base = bases[Math.floor(seed / 8) % bases.length];
  const { kind, bytes } = mutant(base, seed, bomb);
  gc();
  const baseline = used();
  peak = baseline;
  let outcome;
  let detail = "";
  try {
    const read = await reader.readScan(bytes);
    const resumed = await reader.resumeFrom(bytes);
    const text = read.ok ? await reader.textOf(bytes) : { ok: false, reason: "not read" };
    // One set of facts, one name: what a reader accepts, written again from the facts it read, has the same name.
    let again;
    if (read.ok && reader.writeScan) {
      const written = await reader.writeScan({ head: read.value.head, files: read.value.files });
      again = written.ok ? await reader.readScan(written.value) : written;
    }
    if (!shaped(read) || !shaped(resumed) || !shaped(text)) {
      outcome = "unshaped";
    } else if (again !== undefined && !(again.ok && again.value.name === read.value.name)) {
      outcome = "a second name";
      detail = again.ok ? `${read.value.name} written again is ${again.value.name}` : `its facts cannot be written again: ${again.reason}`;
    } else {
      outcome = read.ok ? "facts" : "refused";
      detail = read.ok ? "" : read.reason;
    }
  } catch (error) {
    outcome = "crash";
    detail = `${error?.name}: ${error?.message}`;
  }
  peak = Math.max(peak, used());
  parentPort.postMessage({ seed, kind, size: bytes.length, outcome, detail: detail.slice(0, 200), held: peak - baseline });
}
clearInterval(sampler);
parentPort.postMessage({ done: true });
