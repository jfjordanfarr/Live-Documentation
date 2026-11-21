import { describe, expect, it } from "vitest";

import type { LocalEdge } from "./types";
import { NODE_HUB } from "./wire-gathering";
import { headText, listText, nameList, referencesOf, runWords, sentence, wireWords } from "./wire-words";

const names: Record<string, string> = {
  "src/PaymentService.cs": "PaymentService.cs",
  "src/PaymentsContext.cs": "PaymentsContext.cs",
  "src/Refunds.cs": "Refunds.cs",
  "src/Ledger.cs": "Ledger.cs",
  "src/Audit.cs": "Audit.cs",
  "src/Report.cs": "Report.cs"
};
const nameOf = (id: string): string => names[id] ?? id;

/** A reference from the using file's symbol to the offering file's: in the model the user is the source. */
function reference(user: string, provider: string, usedSymbol?: string, extra: Partial<LocalEdge> = {}): LocalEdge {
  return { sourceId: `src/${user}`, targetId: `src/${provider}`, sourceSymbol: "Post", targetSymbol: usedSymbol, kind: "dependency", direction: "outbound", ...extra };
}

describe("what a wire says", () => {
  it("names the using file first, then what it uses, the symbol and one reference", () => {
    const words = wireWords([reference("PaymentService.cs", "PaymentsContext.cs", "Orders")], nameOf);
    expect(headText(words)).toBe("PaymentService.cs uses PaymentsContext.cs");
    expect(listText(words.used)).toBe("Orders");
    expect(sentence(words)).toBe("PaymentService.cs uses PaymentsContext.cs: Orders, 1 reference");
  });

  it("counts the references the scan found between a reference's two ends", () => {
    const words = wireWords([reference("PaymentService.cs", "PaymentsContext.cs", "Orders", { referenceCount: 4 })], nameOf);
    expect(words.references).toBe(4);
    expect(sentence(words)).toBe("PaymentService.cs uses PaymentsContext.cs: Orders, 4 references");
  });

  it("names an end with no symbol as the row does, Internals", () => {
    expect(listText(wireWords([reference("PaymentService.cs", "PaymentsContext.cs", undefined)], nameOf).used)).toBe("Internals");
    expect(listText(wireWords([reference("PaymentService.cs", "PaymentsContext.cs", "__internals__")], nameOf).used)).toBe("Internals");
  });

  it("says a pair line's offered symbols, a few and a count of the rest, and its links as references", () => {
    const line: LocalEdge = {
      ...reference("PaymentService.cs", "PaymentsContext.cs", NODE_HUB), sourceSymbol: NODE_HUB, gathered: 6,
      standsFor: ["Orders", "Payments", "Orders", "Refunds", "Ledger", undefined].map(targetSymbol => ({ sourceSymbol: "Post", targetSymbol }))
    };
    const words = wireWords([line], nameOf);
    expect(words.used).toEqual({ shown: ["Orders", "Payments", "Refunds"], more: 2 });
    expect(sentence(words)).toBe("PaymentService.cs uses PaymentsContext.cs: Orders, Payments, Refunds +2, 6 references");
  });

  it("says the overview band's gathered wire from all its members", () => {
    const members = [
      reference("PaymentService.cs", "PaymentsContext.cs", "Orders", { referenceCount: 2 }),
      reference("PaymentService.cs", "PaymentsContext.cs", "Payments")
    ];
    const words = wireWords(members, nameOf);
    expect(headText(words)).toBe("PaymentService.cs uses PaymentsContext.cs");
    expect(words.references).toBe(3);
  });

  it("leaves the symbols out where a wire carries none it can name, and says its references alone", () => {
    const hubs = reference("PaymentService.cs", "PaymentsContext.cs", NODE_HUB, { sourceSymbol: NODE_HUB });
    expect(sentence(wireWords([hubs], nameOf))).toBe("PaymentService.cs uses PaymentsContext.cs, 1 reference");
  });

  it("says a bundle's shared run as the offering and who uses it", () => {
    const members = ["PaymentService.cs", "Refunds.cs", "Ledger.cs", "Audit.cs", "Report.cs"]
      .map(user => reference(user, "PaymentsContext.cs", "Orders"));
    const words = runWords(members, nameOf);
    expect(headText(words)).toBe("PaymentsContext.cs is used by PaymentService.cs, Refunds.cs, Ledger.cs +2");
    expect(sentence(words)).toBe("PaymentsContext.cs is used by PaymentService.cs, Refunds.cs, Ledger.cs +2: Orders, 5 references");
  });
});

describe("the parts of the words", () => {
  it("keeps the first few distinct names in order and counts the others", () => {
    expect(nameList(["a", "b", "a", "c", "d"], 2)).toEqual({ shown: ["a", "b"], more: 2 });
    expect(nameList([])).toEqual({ shown: [], more: 0 });
  });

  it("weighs a wire as the layout does: a pair line by its links, a reference by its count, else one", () => {
    expect(referencesOf(reference("A", "B", "x", { gathered: 3, referenceCount: 9 }))).toBe(3);
    expect(referencesOf(reference("A", "B", "x", { referenceCount: 9 }))).toBe(9);
    expect(referencesOf(reference("A", "B", "x"))).toBe(1);
  });
});
