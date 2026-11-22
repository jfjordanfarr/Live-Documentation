/**
 * How a history question finds the file a person names at a commit: in any case, as today's questions do, with two
 * files that differ by case alone named back, after the Windows and command-line probe of 2026-11-19 found `--at` with
 * `--from` taking a name only as spelled.
 */
import { describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import type { Moment } from "@live-documentation/engine/live-docs/history/sequence";

import { codePathOf, count, fileNamedAt, HistoryRefusal } from "./history";

/** A moment holding the files named; nothing else of a moment is read here. */
function momentOf(...codePaths: string[]): Moment {
  return { shape: { files: new Map(codePaths.map((codePath) => [codePath, {}])) }, rows: new Map() } as unknown as Moment;
}

describe("codePathOf", () => {
  const config = normalizeLiveDocumentationConfig({});

  it("reads a doc's path as its file's, its docs folder and suffix in any case, with backslashes", () => {
    expect(codePathOf("src\\app\\view.ts", config)).toBe("src/app/view.ts");
    expect(codePathOf(".live-documentation/source/src/app/view.ts.md", config)).toBe("src/app/view.ts");
    expect(codePathOf(".Live-Documentation\\Source\\src\\app\\view.ts.MD", config)).toBe("src/app/view.ts");
  });
});

describe("fileNamedAt", () => {
  it("is the file as spelled, else the one file that differs by case alone, else the name as given", () => {
    const moment = momentOf("src/app/View.ts", "src/app/main.ts");
    expect(fileNamedAt(moment, "src/app/View.ts")).toBe("src/app/View.ts");
    expect(fileNamedAt(moment, "SRC/APP/view.ts")).toBe("src/app/View.ts");
    expect(fileNamedAt(moment, "src/app/Nowhere.ts")).toBe("src/app/Nowhere.ts");
  });

  it("names back two files that differ by case alone, unless one is named as spelled", () => {
    const twins = momentOf("src/Readme.ts", "src/readme.ts");
    expect(fileNamedAt(twins, "src/readme.ts")).toBe("src/readme.ts");
    expect(() => fileNamedAt(twins, "src/README.ts")).toThrow(HistoryRefusal);
    expect(() => fileNamedAt(twins, "src/README.ts")).toThrow("src/README.ts names 2 files that differ only in case at that commit: src/Readme.ts, src/readme.ts; give one as it is spelled.");
  });
});

describe("count", () => {
  // `--between` printed "Renamed whole: 0 directorys" until 2026-11-22 (the parity probe of that day).
  it("takes the plural a noun is given, and adds an s to one given none", () => {
    expect(count(0, "directory", "directories")).toBe("0 directories");
    expect(count(1, "directory", "directories")).toBe("1 directory");
    expect(count(2, "file")).toBe("2 files");
  });
});
