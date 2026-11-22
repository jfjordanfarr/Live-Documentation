// Probe of 2026-11-22 (not product code): the whole read with sections inflated strictly in order, against a window
// that inflates ahead only sections whose headers have passed every header-only check, bounded by a constant of raw
// bytes in flight. It writes a copy of the module with the window into a scratch folder, and times both, interleaved.
//
//   node <this folder>/window.mjs <module.ts> <scratch dir> <window MiB> <runs> <file.bin>...
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [modulePath, scratch, windowMiB, runs, ...files] = process.argv.slice(2);
const strict = readFileSync(modulePath, "utf8");
const from = "    const rawOf_ = (f: Frame, what: string): Promise<Uint8Array> => rawOf(bytes, f, what);";
if (!strict.includes(from)) throw new Error("the module's reading is not where it was");
const windowed = strict.replace(
  from,
  `    // The window: sections inflated ahead, in order, while the raw bytes in flight stay within a constant.
    const WINDOW = ${Number(windowMiB)} * 1024 * 1024;
    const pending = new Map<Frame, Promise<Uint8Array>>();
    let ahead = 0;
    let inFlight = 0;
    const top = (): void => {
      while (ahead < frames.length && (inFlight === 0 || inFlight + frames[ahead].rawLength <= WINDOW)) {
        const f = frames[ahead++];
        const p = rawOf(bytes, f, KIND_NAMES[f.kind]);
        p.catch(() => undefined);
        pending.set(f, p);
        inFlight += f.rawLength;
      }
    };
    const rawOf_ = async (f: Frame, what: string): Promise<Uint8Array> => {
      top();
      const p = pending.get(f);
      if (p === undefined) return rawOf(bytes, f, what);
      pending.delete(f);
      try {
        return await p;
      } finally {
        inFlight -= f.rawLength;
        top();
      }
    };`
);
const strictPath = path.join(scratch, "strict.ts");
const windowPath = path.join(scratch, "window.ts");
writeFileSync(strictPath, strict);
writeFileSync(windowPath, windowed);
const strictModule = await import(strictPath);
const windowModule = await import(windowPath);

for (const file of files) {
  const bytes = new Uint8Array(readFileSync(file));
  const times = { strict: [], window: [] };
  for (let r = 0; r < Number(runs); r += 1) {
    for (const [name, m] of [["strict", strictModule], ["window", windowModule]]) {
      const start = performance.now();
      const read = await m.readScan(bytes);
      if (!read.ok) throw new Error(`${name}: ${read.reason}`);
      times[name].push(Math.round(performance.now() - start));
    }
  }
  const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  console.log(JSON.stringify({ file: path.basename(file), windowMiB: Number(windowMiB), strict: times.strict, window: times.window, strictMedian: median(times.strict), windowMedian: median(times.window) }));
}
