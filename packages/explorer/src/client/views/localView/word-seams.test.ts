import { describe, expect, it } from "vitest";

import { countOf, seamBefore, seamsOf } from "./word-seams";

describe("seamsOf", () => {
  it("cuts a name after its separators and at its camel humps, and keeps acronyms whole", () => {
    expect(seamsOf("LiveDocGeneratorResult")).toEqual(["Live", "Doc", "Generator", "Result"]);
    expect(seamsOf("packages/engine/src/live-docs")).toEqual(["packages/", "engine/", "src/", "live-", "docs"]);
    expect(seamsOf("summarizeChange.ts")).toEqual(["summarize", "Change.ts"]);
    expect(seamsOf("BINARY_SNIFF_BYTES")).toEqual(["BINARY_", "SNIFF_", "BYTES"]);
    expect(seamsOf("parseJSONFile")).toEqual(["parse", "JSON", "File"]);
    expect(seamsOf("IPaymentHub.cs")).toEqual(["IPayment", "Hub.cs"]);
    expect(seamsOf("v2Beta")).toEqual(["v2", "Beta"]);
  });

  it("never leaves a segment shorter than two characters or a tail shorter than three, and joins back to the name", () => {
    expect(seamsOf(".live-docs.config.json")).toEqual([".live-", "docs.", "config.", "json"]);
    expect(seamsOf("x.y")).toEqual(["x.y"]);
    expect(seamsOf("main.test.ts")).toEqual(["main.", "test.ts"]);
    expect(seamsOf("generator.ts")).toEqual(["generator.ts"]);
    expect(seamsOf("a/b/c")).toEqual(["a/", "b/c"]);
    expect(seamsOf("ab")).toEqual(["ab"]);
    expect(seamsOf("a")).toEqual(["a"]);
    expect(seamsOf("")).toEqual([]);
    expect(seamsOf("tests/")).toEqual(["tests/"]);
    for (const name of ["LiveDocGeneratorResult", "packages/engine/src/live-docs", ".live-docs.config.json", "README.md", "a/b/c"]) {
      expect(seamsOf(name).join("")).toBe(name);
    }
  });

  it("leaves a plain word and a sentence alone, since spaces break on their own", () => {
    expect(seamsOf("generator")).toEqual(["generator"]);
    expect(seamsOf("Scan root")).toEqual(["Scan root"]);
  });
});

describe("seamBefore", () => {
  it("says where a line may start: at a seam or after a space, never inside a segment or at the ends", () => {
    const name = "LiveDocGeneratorResult";
    expect([...name].map((_, index) => seamBefore(name, index)).map(Number).join("")).toBe("0000100100000000100000");
    expect(seamBefore("Scan root", 5)).toBe(true);
    expect(seamBefore("Scan root", 4)).toBe(false);
    expect(seamBefore(name, 0)).toBe(false);
    expect(seamBefore(name, name.length)).toBe(false);
  });
});

describe("countOf", () => {
  it("keeps a count with its unit on one line and agrees the unit with the count", () => {
    expect(countOf(1, "symbol")).toBe("1\u00a0symbol");
    expect(countOf(2, "symbol")).toBe("2\u00a0symbols");
    expect(countOf(0, "file")).toBe("0\u00a0files");
    expect(countOf(1, "directory", "directories")).toBe("1\u00a0directory");
    expect(countOf(3, "directory", "directories")).toBe("3\u00a0directories");
  });
});
