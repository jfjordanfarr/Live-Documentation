import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { DEFAULT_AUTHORED_BLOCK, type LiveDoc } from "@live-documentation/engine/live-docs/document";
import { deriveLiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { Interner } from "@live-documentation/engine/live-docs/history/codec";
import { rowsOfSummary } from "@live-documentation/engine/live-docs/history/rows";
import { shapeOfSummary } from "@live-documentation/engine/live-docs/history/shape";
import { summarizeGraph } from "@live-documentation/engine/live-docs/history/summary";

import { formatBytes, holdLock, nextPoolRecord, poolSize, UNMEASURED_PEAK_MEMORY, usableMachine } from "./computeHistory";
import { headDifferences, leftOutAtHead, type ReplayedMoment } from "./headCheck";

describe("the check at the head", () => {
  const doc = (codePath: string, fields: Partial<LiveDoc>): { docPath: string; doc: LiveDoc } => ({
    docPath: `.mdmd/layer-4/${codePath}.mdmd.md`,
    doc: { codePath, layer: 4, archetype: "implementation", entries: [], authored: DEFAULT_AUTHORED_BLOCK, symbols: [], dependencies: [], ...fields }
  });
  const committed = deriveLiveDocGraph(
    [
      doc("src/a.ts", {
        dependencies: [{ label: "src/b.ts", link: "b.ts.mdmd.md", qualifiers: ["type-only"] }],
        symbols: [{ name: "make", slug: "make", kind: "function", flags: [], references: [{ role: "Returns", types: [{ name: "B", link: "b.ts.mdmd.md#b" }] }], sections: [{ title: "Summary", body: ["Makes."] }] }]
      }),
      doc("src/b.ts", { symbols: [{ name: "B (interface)", slug: "b", kind: "interface", flags: [], references: [], sections: [] }] })
    ],
    { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" }
  );
  // The replayed side as the history would hold it: made here through the summary, which the check itself never uses.
  const { summary, texts: byHash } = summarizeGraph(committed, "lens", "head");
  const interner = new Interner();
  const replayed: ReplayedMoment = { shape: shapeOfSummary(summary), rows: rowsOfSummary(summary, (hash) => interner.id(hash)) };
  const textOf = (id: number): string => byHash.get(interner.values[id])!;

  it("finds nothing where the replayed moment is the committed graph, field by field, its links read from its edges", () => {
    expect(headDifferences(replayed, committed, textOf)).toEqual([]);
  });

  it("finds a symbol, a line, a link or a word the replay lost", () => {
    const a = replayed.rows.get("src/a.ts")!;
    const lost = { ...replayed, rows: new Map(replayed.rows) };
    lost.rows.set("src/a.ts", { ...a, symbols: [{ ...a.symbols[0], references: [] }] });
    const differences = headDifferences(lost, committed, textOf);
    expect(differences.some((line) => line.startsWith("the symbols of src/a.ts differ"))).toBe(true);
    expect(differences).toContain("the link src/a.ts#make -returns-> src/b.ts#b x1 is missing");
    const untyped = { ...replayed, rows: new Map(replayed.rows) };
    untyped.rows.set("src/a.ts", { ...a, dependencies: [{ ...a.dependencies[0], typeOnly: undefined }] });
    expect(headDifferences(untyped, committed, textOf)[0]).toContain("the dependencies of src/a.ts differ");
    const unworded = { ...replayed, rows: new Map(replayed.rows) };
    unworded.rows.set("src/b.ts", { ...replayed.rows.get("src/b.ts")!, authored: "unread" });
    expect(headDifferences(unworded, committed, textOf)[0]).toContain("the authored of src/b.ts differ");
    // A description is compared by its words, not by the id or hash it is stored under.
    const reworded = (id: number): string => (id === a.symbols[0].text ? JSON.stringify([{ title: "Summary", body: ["Unmakes."] }]) : textOf(id));
    expect(headDifferences(replayed, committed, reworded)[0]).toContain("the symbols of src/a.ts differ");
    const missing = { ...replayed, rows: new Map(replayed.rows) };
    missing.rows.delete("src/b.ts");
    expect(headDifferences(missing, committed, textOf)).toContain("src/b.ts has a committed doc and is not in the history's last step");
  });

  it("compares no committed file the head's tree left out, nor a link to or from it, and names each with why", () => {
    // The head's tree left `src/a.ts` out (on Windows, say, a name it reserves), so the history never read it nor its links.
    const unread = { ...replayed, rows: new Map(replayed.rows) };
    unread.rows.delete("src/a.ts");
    const reason = "its name cannot be written on Windows, where git refuses to check it out";
    const notCompared = leftOutAtHead(committed, new Map([["src/a.ts", reason]]));
    expect([...notCompared]).toEqual([["src/a.ts", reason]]);
    expect(headDifferences(unread, committed, textOf, new Set(notCompared.keys()))).toEqual([]);
    // Compared, the file and each of its links would fail the check where the history is right.
    const compared = headDifferences(unread, committed, textOf);
    expect(compared).toContain("src/a.ts has a committed doc and is not in the history's last step");
    expect(compared).toContain("the link src/a.ts#make -returns-> src/b.ts#b x1 is missing");
    // A doc whose own name the tree left out is passed over too, under its file's path; an entry no doc names, not at all.
    expect([...leftOutAtHead(committed, new Map([[".mdmd/layer-4/src/a.ts.mdmd.md", reason]]))]).toEqual([["src/a.ts", reason]]);
    expect([...leftOutAtHead(committed, new Map([["vendor/elsewhere.ts", reason]]))]).toEqual([]);
    // What is not left out is still compared: the other file's words lost are found.
    unread.rows.set("src/b.ts", { ...unread.rows.get("src/b.ts")!, authored: "unread" });
    expect(headDifferences(unread, committed, textOf, new Set(notCompared.keys()))).toEqual([expect.stringContaining("the authored of src/b.ts differ")]);
  });
});

const GIBIBYTE = 1024 ** 3;

describe("the pool's size", () => {
  it("runs as many processes as half the memory holds at the measured peak, at most one fewer than the processors", () => {
    // This machine: 20 processors and 62 GiB; at 1.5 GiB a process memory allows 20, the processors 19.
    expect(poolSize({ totalMemory: 62 * GIBIBYTE, processors: 20, peakMemory: 1.5 * GIBIBYTE })).toBe(19);
    // An 8 GiB laptop with eight processors: memory allows two, as the plan's measure of 2026-10-16 found right.
    expect(poolSize({ totalMemory: 8 * GIBIBYTE, processors: 8, peakMemory: 1.5 * GIBIBYTE })).toBe(2);
    // A hosted runner of four processors and 16 GiB: the processors allow three.
    expect(poolSize({ totalMemory: 16 * GIBIBYTE, processors: 4, peakMemory: 1.5 * GIBIBYTE })).toBe(3);
    // A repository whose commits take 6 GiB a process on the same runner: memory allows one.
    expect(poolSize({ totalMemory: 16 * GIBIBYTE, processors: 4, peakMemory: 6 * GIBIBYTE })).toBe(1);
  });

  it("never runs fewer than one", () => {
    expect(poolSize({ totalMemory: 2 * GIBIBYTE, processors: 1, peakMemory: UNMEASURED_PEAK_MEMORY })).toBe(1);
    expect(poolSize({ totalMemory: 1 * GIBIBYTE, processors: 8, peakMemory: UNMEASURED_PEAK_MEMORY })).toBe(1);
  });

  it("before any process was measured, expects the peak this repository's largest commit was measured to take", () => {
    // 526 MB measured on 2026-11-19, rounded up: an 8 GiB laptop of four processors runs three.
    expect(UNMEASURED_PEAK_MEMORY).toBeGreaterThan(526 * 1000 ** 2);
    expect(poolSize({ totalMemory: 8 * GIBIBYTE, processors: 4, peakMemory: UNMEASURED_PEAK_MEMORY })).toBe(3);
  });

  it("sizes by the memory a container's limit leaves, not the host's", () => {
    // Node reports a limit of 2^64 where none is set, as on this machine, and 0 where it cannot tell.
    expect(usableMachine({ totalMemory: 64 * GIBIBYTE, constrainedMemory: 2 ** 64, processors: 20 })).toEqual({ totalMemory: 64 * GIBIBYTE, processors: 20 });
    expect(usableMachine({ totalMemory: 64 * GIBIBYTE, constrainedMemory: 0, processors: 20 })).toEqual({ totalMemory: 64 * GIBIBYTE, processors: 20 });
    // A container held to 4 GiB on a 64 GiB host of twenty processors runs two, where the host's figures gave nineteen.
    const container = usableMachine({ totalMemory: 64 * GIBIBYTE, constrainedMemory: 4 * GIBIBYTE, processors: 20 });
    expect(poolSize({ ...container, peakMemory: UNMEASURED_PEAK_MEMORY })).toBe(2);
    expect(poolSize({ totalMemory: 64 * GIBIBYTE, processors: 20, peakMemory: UNMEASURED_PEAK_MEMORY })).toBe(19);
  });
});

describe("the record of a summarizing process's peak", () => {
  const MEGABYTE = 1024 ** 2;

  it("keeps the largest peak of every run under one lens", () => {
    const whole = nextPoolRecord(undefined, "a", 540 * MEGABYTE, 1173);
    expect(nextPoolRecord(whole, "a", 300 * MEGABYTE, 1)).toEqual({ lens: "a", peakMemory: 540 * MEGABYTE, changes: 1174 });
  });

  it("lets a small run under a new lens raise the estimate but never lower it, until the new lens has measured as many changes", () => {
    const whole = nextPoolRecord(undefined, "a", 540 * MEGABYTE, 1173);
    const sampled = nextPoolRecord(whole, "b", 200 * MEGABYTE, 48);
    expect(sampled).toEqual({ lens: "b", peakMemory: 540 * MEGABYTE, changes: 48 });
    expect(nextPoolRecord(whole, "b", 700 * MEGABYTE, 48).peakMemory).toBe(700 * MEGABYTE);
    // A whole history under the new lens is its own measure.
    expect(nextPoolRecord(whole, "b", 450 * MEGABYTE, 1173)).toEqual({ lens: "b", peakMemory: 450 * MEGABYTE, changes: 1173 });
  });
});

describe("formatBytes", () => {
  it("names a size in the unit a person reads it in", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(206 * 1024 ** 2)).toBe("206.0 MB");
    expect(formatBytes(1.5 * GIBIBYTE)).toBe("1.50 GB");
  });
});

describe("the claim on a history folder", () => {
  it("lets one of two runs meeting a dead claim at once hold the folder, never both, every time", async () => {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), "history-claims-"));
    const host = createHash("sha256").update(os.hostname()).digest("hex").slice(0, 12);
    const quiet = (): void => undefined;
    try {
      for (let round = 0; round < 25; round += 1) {
        await fs.writeFile(path.join(folder, `run.${host}.${2 ** 22 + 1}.dead.lock`), "");
        const outcomes = await Promise.allSettled([holdLock(folder, quiet), holdLock(folder, quiet)]);
        const held = outcomes.filter((outcome): outcome is PromiseFulfilledResult<string> => outcome.status === "fulfilled");
        expect(held, `round ${round}`).toHaveLength(1);
        expect(String((outcomes.find((outcome) => outcome.status === "rejected") as PromiseRejectedResult).reason)).toContain("another history run");
        // Only the holder's claim stands; the dead one is gone.
        expect(await fs.readdir(folder)).toEqual([path.basename(held[0].value)]);
        await fs.rm(held[0].value);
      }
    } finally {
      await fs.rm(folder, { recursive: true, force: true });
    }
  }, 60_000);

  it("is a claim with a name and nothing to read, so that no half-written claim is ever taken for a dead one", async () => {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), "history-claims-"));
    try {
      const claim = await holdLock(folder, () => undefined);
      expect(path.basename(claim)).toMatch(/^run\.[0-9a-f]{12}\.\d+\.[0-9a-f]+\.lock$/u);
      expect(path.basename(claim)).toContain(`.${process.pid}.`);
      expect(await fs.readFile(claim, "utf8")).toBe("");
      await expect(holdLock(folder, () => undefined)).rejects.toThrow(`another history run (process ${process.pid}`);
    } finally {
      await fs.rm(folder, { recursive: true, force: true });
    }
  }, 30_000);
});
