import { describe, expect, it } from "vitest";

import type { ExplorerLinkPayload, ExplorerNodePayload } from "../../../shared/types";
import { unconnectedRow, unconnectedSymbols } from "./unconnected-symbols";

const node = (id: string, publicSymbols: string[], extended?: ExplorerNodePayload["publicSymbolsExtended"]): ExplorerNodePayload => ({
  id, name: id, codePath: id, codeRelativePath: id, docPath: `${id}.md`, docRelativePath: `${id}.md`, archetype: "implementation",
  dependencies: [], dependents: [], missingDependencies: [], publicSymbols, ...(extended ? { publicSymbolsExtended: extended } : null)
});

const link = (source: string, target: string, sourceSymbol?: string, targetSymbol?: string): ExplorerLinkPayload =>
  ({ source, target, kind: "dependency", sourceSymbol, targetSymbol, referenceCount: 1 });

describe("unconnectedSymbols", () => {
  // One file with a symbol of each kind, beside the files it is tied to.
  const subject = node("a.ts", ["usedElsewhere", "usesElsewhere", "Inside", "usesInside", "alone"], [
    { name: "usedElsewhere" },
    { name: "usesElsewhere", typeReferences: [{ typeName: "Thing", role: "return", isResolved: true, targetId: "b.ts", targetAnchor: "thing" }] },
    { name: "Inside" },
    // A type of its own file is not resolved to another file: the card draws it as a lace.
    { name: "usesInside", typeReferences: [{ typeName: "Inside", role: "parameter", parameterName: "value", isResolved: false }] },
    { name: "alone" }
  ]);
  const graph = {
    nodes: [subject, node("b.ts", ["Thing"]), node("c.ts", ["user"]), node("empty.ts", [])],
    links: [
      link("c.ts", "a.ts", "user", "usedElsewhere"),
      link("a.ts", "b.ts", "usesElsewhere", "Thing")
    ]
  };

  it("leaves out a symbol another file uses, one that uses another file, and both ends of a tie within the file", () => {
    expect([...unconnectedSymbols(graph).get("a.ts") ?? []]).toEqual(["alone"]);
  });

  it("names a file only when it has a symbol nothing touches, so a file with no symbols is absent", () => {
    const found = unconnectedSymbols(graph);
    expect(found.has("b.ts")).toBe(false);
    expect(found.has("c.ts")).toBe(false);
    expect(found.has("empty.ts")).toBe(false);
  });

  it("does not count a file-level link, which names no symbol, as touching any symbol", () => {
    const found = unconnectedSymbols({ nodes: [node("x.ts", ["one", "two"]), node("y.ts", [])], links: [link("y.ts", "x.ts")] });
    expect([...found.get("x.ts") ?? []]).toEqual(["one", "two"]);
  });

  it("reads endpoints that a force simulation has replaced with objects", () => {
    const found = unconnectedSymbols({ nodes: [node("x.ts", ["one", "two"])], links: [{ ...link("y.ts", "x.ts", "u", "one"), target: { id: "x.ts" } }] });
    expect([...found.get("x.ts") ?? []]).toEqual(["two"]);
  });
});

describe("unconnectedRow", () => {
  const row = { unconnected: true, wholeCard: true, asked: false, revealed: false };

  it("leaves every row as it is under Shown", () => {
    expect(unconnectedRow("shown", row)).toBe("shown");
  });

  it("fades or folds only an unconnected row of a card that draws every row", () => {
    expect(unconnectedRow("dimmed", row)).toBe("dimmed");
    expect(unconnectedRow("folded", row)).toBe("folded");
    expect(unconnectedRow("folded", { ...row, unconnected: false })).toBe("shown");
    expect(unconnectedRow("dimmed", { ...row, wholeCard: false })).toBe("shown");
    expect(unconnectedRow("folded", { ...row, wholeCard: false })).toBe("shown");
  });

  it("never touches a row the person asked for, and shows the folded rows once the count is pressed", () => {
    expect(unconnectedRow("folded", { ...row, asked: true })).toBe("shown");
    expect(unconnectedRow("dimmed", { ...row, asked: true })).toBe("shown");
    expect(unconnectedRow("folded", { ...row, revealed: true })).toBe("shown");
    // Faded rows stay faded when the count's press has shown a card's other rows: nothing was hidden to show.
    expect(unconnectedRow("dimmed", { ...row, revealed: true })).toBe("dimmed");
  });
});
