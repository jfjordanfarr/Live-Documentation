import { describe, expect, it } from "vitest";

import { rowSegments } from "./held-lines";
import { cutAtEnd, cutInMiddle, ELLIPSIS, oneLineName } from "./name-cut";

/** Every character as wide as every other, 6 units: a width is a count of characters, the ellipsis one of them. */
const measure = (text: string): number => text.length * 6;
const cut = (name: string, characters: number, where: "end" | "middle"): string => oneLineName(name, rowSegments(name), characters * 6, measure, where);

describe("a symbol's name held to one line", () => {
  it("is untouched where it fits, by either cut", () => {
    expect(cut("DEFAULT_RULES", 13, "end")).toBe("DEFAULT_RULES");
    expect(cut("DEFAULT_RULES", 13, "middle")).toBe("DEFAULT_RULES");
    expect(cut("DocumentationRule", 40, "middle")).toBe("DocumentationRule");
  });

  it("is cut at its end with as many first characters as fit before the ellipsis", () => {
    // Twenty-four characters hold twenty-three of the name and the ellipsis.
    expect(cut("DocumentationLinkEnforcementResult", 24, "end")).toBe("DocumentationLinkEnforc" + ELLIPSIS);
    expect(cut("DocumentationLinkEnforcementResult", 24, "end")).toHaveLength(24);
    // One character and the ellipsis at the least: a name is never erased.
    expect(cutAtEnd("resolveCodeToDocumentationMap", 3, measure)).toBe("r" + ELLIPSIS);
    // A space before the ellipsis is not kept.
    expect(cutAtEnd("PaymentsContext (class)", 17 * 6, measure)).toBe("PaymentsContext" + ELLIPSIS);
  });

  it("is cut in its middle at its seams, the first and the last pieces kept", () => {
    // Twenty characters: "Documentation" and "Result" with the ellipsis between; "Link" would not fit with them.
    expect(cut("DocumentationLinkEnforcementResult", 20, "middle")).toBe("Documentation" + ELLIPSIS + "Result");
    // Twenty-four: one more segment fits beside them, and the cut that keeps the most of the name is taken.
    expect(cut("DocumentationLinkEnforcementResult", 24, "middle")).toBe("DocumentationLink" + ELLIPSIS + "Result");
    // Names that share their start and differ at their end stay told apart, which an end cut loses.
    expect(cut("DocumentationLinkViolation", 24, "middle")).toBe("Documentation" + ELLIPSIS + "Violation");
    expect(cut("DocumentationLinkEnforcementResult", 18, "end")).toBe(cut("DocumentationLinkViolation", 18, "end"));
    expect(cut("DocumentationLinkEnforcementResult", 24, "middle")).not.toBe(cut("DocumentationLinkViolation", 24, "middle"));
  });

  it("keeps the most of the name that fits, and of equals the one with more of its end", () => {
    // Seams aa, Bbb, Cc, Dddd. Nine characters: "aaBbb…Dddd" is ten and does not fit; "aa…CcDddd" is nine and keeps
    // eight of the name, more than "aa…Dddd".
    expect(cutInMiddle("aaBbbCcDddd", ["aa", "Bbb", "Cc", "Dddd"], 9 * 6, measure)).toBe("aa" + ELLIPSIS + "CcDddd");
    // Eight characters hold only "aa…Dddd".
    expect(cutInMiddle("aaBbbCcDddd", ["aa", "Bbb", "Cc", "Dddd"], 8 * 6, measure)).toBe("aa" + ELLIPSIS + "Dddd");
  });

  it("where the first and the last pieces do not fit together, keeps as many last pieces as fit, whole, behind a leading ellipsis", () => {
    // Two names of one card that share their start, in fourteen characters: "refresh…Presentation" needs twenty. An end
    // cut draws both "refreshReadin…"; the last pieces tell them apart.
    expect(cut("refreshReadingPresentation", 14, "end")).toBe(cut("refreshReadingGeometry", 14, "end"));
    expect(cut("refreshReadingPresentation", 14, "middle")).toBe(ELLIPSIS + "Presentation");
    expect(cut("refreshReadingGeometry", 14, "middle")).toBe(ELLIPSIS + "Geometry");
    // As many last pieces as fit: nineteen characters do not hold "Documentation…Result", twenty, and hold the last two
    // pieces behind the ellipsis, not the last three.
    expect(cut("DocumentationLinkEnforcementResult", 19, "middle")).toBe(ELLIPSIS + "EnforcementResult");
    // Twenty-one characters hold "Documentation…Result" and not "Documentation…Violation", which needs twenty-three.
    expect(cut("DocumentationLinkViolation", 21, "middle")).toBe(ELLIPSIS + "LinkViolation");
    // The first and the last piece together are still preferred where they fit.
    expect(cut("DocumentationLinkViolation", 23, "middle")).toBe("Documentation" + ELLIPSIS + "Violation");
  });

  it("gives a name with one seam its last piece behind the ellipsis, since it has no piece to leave out between two", () => {
    expect(cutInMiddle("PaymentService", ["Payment", "Service"], 11 * 6, measure)).toBe(ELLIPSIS + "Service");
    expect(cutInMiddle("PaymentService", ["Payment", "Service"], 8 * 6, measure)).toBe(ELLIPSIS + "Service");
  });

  it("cuts at the end only where not even the last piece fits behind the ellipsis, or the name has no seam", () => {
    // Ten characters do not hold "…Presentation", thirteen: no piece is broken to keep an end.
    expect(cut("refreshReadingPresentation", 10, "middle")).toBe("refreshRe" + ELLIPSIS);
    expect(cut("refreshReadingPresentation", 10, "middle")).toBe(cut("refreshReadingPresentation", 10, "end"));
    expect(cutInMiddle("PaymentService", ["Payment", "Service"], 7 * 6, measure)).toBe("Paymen" + ELLIPSIS);
    // A name of one piece has no seam.
    expect(cutInMiddle("enforcement", ["enforcement"], 6 * 6, measure)).toBe("enfor" + ELLIPSIS);
  });

  it("never draws wider than its room, and keeps both ends of the name it cuts in its middle", () => {
    for (const name of ["DocumentationLinkEnforcementResult", "runDocumentationLinkEnforcement", "resolveCodeToDocumentationMap", "parseDocumentationAnchors", "DocumentationTargetMap"]) {
      for (let characters = 4; characters <= name.length; characters += 1) {
        for (const where of ["end", "middle"] as const) {
          const drawn = cut(name, characters, where);
          expect(measure(drawn), `${name} at ${characters}, ${where}`).toBeLessThanOrEqual(characters * 6);
          if (drawn !== name) expect(drawn).toContain(ELLIPSIS);
          // What is drawn is the name's own characters about the ellipsis: its start, and for a middle cut its end.
          const [start, end] = drawn.split(ELLIPSIS);
          expect(name.startsWith(start)).toBe(true);
          expect(name.endsWith(end ?? "")).toBe(true);
        }
      }
    }
  });
});
