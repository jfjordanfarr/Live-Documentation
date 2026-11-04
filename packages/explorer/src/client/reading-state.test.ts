import { describe, expect, it } from "vitest";

import { chooseReading, descriptionIsOpen, readReadingChoices, readingFiles, releaseReading, scrubReadingChoices } from "./reading-state";

describe("deliberate reading independently of retention", () => {
  it("keeps a symbol open in a folded pinned card and lets the card action replace those overrides", () => {
    let reading = chooseReading([], "module.ts", undefined, false);
    reading = chooseReading(reading, "module.ts", "walk (function)", true);
    reading = chooseReading(reading, "neighbor.ts", undefined, true);
    expect(descriptionIsOpen(reading, "module.ts", "Walk (interface)", true)).toBe(false);
    expect(descriptionIsOpen(reading, "module.ts", "walk (function)", false)).toBe(true);
    expect(descriptionIsOpen(reading, "module.ts", undefined, true)).toBe(false);
    expect([...readingFiles(reading)]).toEqual(["module.ts", "neighbor.ts"]);

    reading = chooseReading(reading, "module.ts", undefined, false);
    expect(descriptionIsOpen(reading, "module.ts", "walk (function)", true)).toBe(false);
    expect([...readingFiles(reading)]).toEqual(["neighbor.ts"]);
    expect(releaseReading(reading, "module.ts")).toEqual([{ nodeId: "neighbor.ts", open: true }]);
  });

  it("validates persisted choices without guessing case, kind or a missing target", () => {
    const reading = readReadingChoices([
      null, ["a", true], { nodeId: "a", open: "false" }, { nodeId: "", open: true },
      { nodeId: "a", symbol: "", open: true }, { nodeId: "a", symbol: {}, open: true },
      { nodeId: "a", open: true }, { nodeId: "a", open: false },
      { nodeId: "a", symbol: "Walk (interface)", open: true },
      { nodeId: "a", symbol: "walk (function)", open: false },
      { nodeId: "a", symbol: "walk", open: true }, { nodeId: "gone", open: true }
    ]);
    const valid = scrubReadingChoices(reading, new Map([["a", { publicSymbols: ["Walk (interface)", "walk (function)"] }]]));
    expect(valid).toEqual([
      { nodeId: "a", open: false },
      { nodeId: "a", symbol: "Walk (interface)", open: true },
      { nodeId: "a", symbol: "walk (function)", open: false }
    ]);
    expect(descriptionIsOpen(valid, "a", "Walk (interface)", false)).toBe(true);
    expect(descriptionIsOpen(valid, "a", "walk (function)", true)).toBe(false);
    expect(descriptionIsOpen([], "unconfigured", "member", true)).toBe(true);
    expect(descriptionIsOpen([], "unconfigured", "member", false)).toBe(false);
  });
});
