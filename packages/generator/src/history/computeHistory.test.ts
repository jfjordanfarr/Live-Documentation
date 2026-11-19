import { describe, expect, it } from "vitest";

import { DEFAULT_AUTHORED_BLOCK, type LiveDoc } from "@live-documentation/engine/live-docs/document";
import { deriveLiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { Interner } from "@live-documentation/engine/live-docs/history/codec";
import { rowsOfSummary } from "@live-documentation/engine/live-docs/history/rows";
import { summarizeGraph } from "@live-documentation/engine/live-docs/history/summary";

import { formatBytes, headDifferences, poolSize, UNMEASURED_PEAK_MEMORY } from "./computeHistory";

describe("the check at the head", () => {
  const doc = (codePath: string, fields: Partial<LiveDoc>): { docPath: string; doc: LiveDoc } => ({
    docPath: `.mdmd/layer-4/${codePath}.mdmd.md`,
    doc: { codePath, layer: 4, archetype: "implementation", entries: [], authored: DEFAULT_AUTHORED_BLOCK, symbols: [], dependencies: [], ...fields }
  });
  const committed = deriveLiveDocGraph(
    [
      doc("src/a.ts", {
        dependencies: [{ label: "src/b.ts", link: "b.ts.mdmd.md", qualifiers: [] }],
        symbols: [{ name: "make", slug: "make", kind: "function", flags: [], references: [{ role: "Returns", types: [{ name: "B", link: "b.ts.mdmd.md#b" }] }], sections: [{ title: "Summary", body: ["Makes."] }] }]
      }),
      doc("src/b.ts", { symbols: [{ name: "B (interface)", slug: "b", kind: "interface", flags: [], references: [], sections: [] }] })
    ],
    { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" }
  );
  const texts = new Interner();
  const textId = (hash: string): number => texts.id(hash);
  const replayed = rowsOfSummary(summarizeGraph(committed, "lens", "head").summary, textId);

  it("finds nothing where the replayed rows are those of the committed graph, its links read from its edges", () => {
    expect(headDifferences(replayed, committed, textId)).toEqual([]);
  });

  it("finds a symbol, a link or a word the replay lost", () => {
    const lost = new Map(replayed);
    lost.set("src/a.ts", { ...replayed.get("src/a.ts")!, symbols: [{ ...replayed.get("src/a.ts")!.symbols[0], references: [] }] });
    const differences = headDifferences(lost, committed, textId);
    expect(differences.some((line) => line.includes("the symbol make of src/a.ts"))).toBe(true);
    expect(differences).toContain("the link src/a.ts#make -returns-> src/b.ts#b x1 is missing");
    const unworded = new Map(replayed);
    unworded.set("src/b.ts", { ...replayed.get("src/b.ts")!, authored: "unread" });
    expect(headDifferences(unworded, committed, textId)[0]).toContain("the authored of src/b.ts");
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
});

describe("formatBytes", () => {
  it("names a size in the unit a person reads it in", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(206 * 1024 ** 2)).toBe("206.0 MB");
    expect(formatBytes(1.5 * GIBIBYTE)).toBe("1.50 GB");
  });
});
