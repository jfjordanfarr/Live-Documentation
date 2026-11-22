import { pathToFileURL } from "node:url";
import { Worker } from "node:worker_threads";
import { constants, deflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";

import { writeScan } from "./storedForm";
import { everyFact, seededScan } from "./testScans";

/** What became of one mutant. */
interface Finding {
  seed: number;
  kind: string;
  size: number;
  outcome: "facts" | "refused" | "crash" | "unshaped" | "hang" | "worker died";
  detail: string;
  held: number;
}

/** The most memory a read may hold beyond what the worker held before it: 48 MiB, and 64 bytes for each byte read. */
const bound = (size: number): number => 48 * 1024 * 1024 + 64 * size;

/** How long one mutant may take before the reader is taken to hang. Real reads of these files take milliseconds. */
const DEADLINE_MS = 10_000;

/** A raw deflate stream of 256 MiB of zeros: about 256 KB that a reader trusting it would inflate whole. */
function bombOf(): Uint8Array {
  return new Uint8Array(deflateRawSync(Buffer.alloc(256 * 1024 * 1024), { level: constants.Z_BEST_SPEED }));
}

async function bases(): Promise<Uint8Array[]> {
  const out: Uint8Array[] = [];
  for (const scan of [everyFact(), seededScan(3, 300)]) {
    const written = await writeScan(scan);
    if (!written.ok) throw new Error(written.reason);
    out.push(written.value);
  }
  return out;
}

/** Runs the reader at `readerUrl` over the mutants of seeds `from` to `to` in a worker it can stop. */
function fuzz(readerUrl: string, baseFiles: Uint8Array[], bomb: Uint8Array, from: number, to: number): Promise<Finding[]> {
  return new Promise((resolve) => {
    const findings: Finding[] = [];
    let seed = from;
    const worker = new Worker(new URL("./fuzz/worker.mjs", import.meta.url), {
      workerData: { readerUrl, bases: baseFiles, bomb, from, to },
      resourceLimits: { maxOldGenerationSizeMb: 1024 }
    });
    let timer: ReturnType<typeof setTimeout>;
    const arm = (): void => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        findings.push({ seed, kind: "?", size: 0, outcome: "hang", detail: `no answer in ${DEADLINE_MS} ms`, held: 0 });
        void worker.terminate();
      }, DEADLINE_MS);
    };
    arm();
    worker.on("message", (message: Finding | { done: true }) => {
      if ("done" in message) {
        clearTimeout(timer);
        void worker.terminate();
        return;
      }
      findings.push(message);
      seed = message.seed + 1;
      arm();
    });
    worker.on("error", (error) => {
      findings.push({ seed, kind: "?", size: 0, outcome: "worker died", detail: String(error), held: 0 });
    });
    worker.on("exit", () => {
      clearTimeout(timer);
      resolve(findings);
    });
  });
}

const faults = (findings: Finding[]): Finding[] => findings.filter((f) => !(f.outcome === "facts" || f.outcome === "refused") || f.held > bound(f.size));

describe("the stored form's reader, against mutants of valid files", () => {
  it(
    "returns facts or a refusal for every mutant, in bounded time and memory",
    async () => {
      const findings = await fuzz(pathToFileURL(`${__dirname}/storedForm.ts`).href, await bases(), bombOf(), 0, 800);
      expect(findings.length).toBe(800);
      expect(faults(findings)).toEqual([]);
      // Every kind of mutation was made, and most were refused: the fuzzer reached the reader's checks.
      expect(new Set(findings.map((f) => f.kind)).size).toBeGreaterThanOrEqual(8);
      expect(findings.filter((f) => f.outcome === "refused").length).toBeGreaterThan(700);
    },
    180_000
  );

  it(
    "finds out a careless reader: the fuzzer can fail",
    async () => {
      // The same mutants, read by a reader that trusts what a file declares. Seeds 3, 11 and 19 are bombs; 2 and 10
      // lie about a length or count.
      const findings = await fuzz(pathToFileURL(`${__dirname}/fuzz/careless.mjs`).href, await bases(), bombOf(), 0, 24);
      const kinds = new Set(faults(findings).map((f) => f.outcome === "facts" || f.outcome === "refused" ? "over its memory" : f.outcome));
      expect(kinds.size).toBeGreaterThanOrEqual(2);
    },
    180_000
  );
});
