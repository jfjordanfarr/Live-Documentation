import { describe, expect, it } from "vitest";

import { formatBytes, poolSize, UNMEASURED_PEAK_MEMORY } from "./computeHistory";

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
