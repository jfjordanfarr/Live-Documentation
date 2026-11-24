import nodePath from "node:path";
import { describe, expect, it } from "vitest";

import enginePath, { basename, dirname, extname, isAbsolute, join, normalize, posix, relative, resolve, sep } from "./enginePath";

describe("enginePath POSIX parity with node:path.posix", () => {
  const samples = [
    "",
    ".",
    "..",
    "/",
    "//",
    "///",
    "./",
    "../",
    "/a/b/c",
    "/a/b/c/",
    "/a//b///c/.",
    "/a/b/../c",
    "/a/b/../../..",
    "a/b/c",
    "a/b/c/",
    "a/b/../c",
    "../../a/b",
    ".gitignore",
    "/.gitignore",
    "dir/.gitignore",
    "foo.d.ts",
    "foo.ts",
    "foo.",
    "dir.with.dots/file",
    "dir.with.dots/.hidden",
    "dir.with.dots/..hidden",
    "a/..",
    "..",
    "a/b/..c",
    "file\\with\\backslashes.ts"
  ];

  it("matches node:path.posix on normalize, dirname, basename, extname, and isAbsolute", () => {
    expect(sep).toBe("/");
    expect(enginePath.posix).toBe(posix);
    expect(posix.posix).toBe(posix);

    for (const sample of samples) {
      expect(normalize(sample), `normalize(${JSON.stringify(sample)})`).toBe(nodePath.posix.normalize(sample));
      expect(posix.normalize(sample), `posix.normalize(${JSON.stringify(sample)})`).toBe(nodePath.posix.normalize(sample));
      expect(dirname(sample), `dirname(${JSON.stringify(sample)})`).toBe(nodePath.posix.dirname(sample));
      expect(posix.dirname(sample), `posix.dirname(${JSON.stringify(sample)})`).toBe(nodePath.posix.dirname(sample));
      expect(basename(sample), `basename(${JSON.stringify(sample)})`).toBe(nodePath.posix.basename(sample));
      expect(basename(sample, ".ts"), `basename(${JSON.stringify(sample)}, ".ts")`).toBe(nodePath.posix.basename(sample, ".ts"));
      expect(basename(sample, sample), `basename(${JSON.stringify(sample)}, self)`).toBe(nodePath.posix.basename(sample, sample));
      expect(extname(sample), `extname(${JSON.stringify(sample)})`).toBe(nodePath.posix.extname(sample));
      expect(isAbsolute(sample), `isAbsolute(${JSON.stringify(sample)})`).toBe(nodePath.posix.isAbsolute(sample));
    }
  });

  it("matches node:path.posix on join", () => {
    const cases: string[][] = [
      [],
      [""],
      ["", ""],
      ["/", "a", "b"],
      ["a", "b", "c"],
      ["a/", "/b", "../c"],
      [".", "a", "..", "b"],
      ["/ws", ".mdmd", "layer-4", "src/a.ts.mdmd.md"]
    ];
    for (const args of cases) {
      expect(join(...args), `join(${JSON.stringify(args)})`).toBe(nodePath.posix.join(...args));
      expect(posix.join(...args), `posix.join(${JSON.stringify(args)})`).toBe(nodePath.posix.join(...args));
    }
  });

  it("matches node:path.posix on resolve with absolute anchors", () => {
    const cases: string[][] = [
      ["/ws", "src/a.ts"],
      ["/ws", "../other/b.ts"],
      ["/ws/a", "/abs/b"],
      ["/ws", "", "src", "./x/../y.ts"],
      ["/"],
      ["/a/b", "../../.."]
    ];
    for (const args of cases) {
      expect(resolve(...args), `resolve(${JSON.stringify(args)})`).toBe(nodePath.posix.resolve(...args));
      expect(posix.resolve(...args), `posix.resolve(${JSON.stringify(args)})`).toBe(nodePath.posix.resolve(...args));
    }
    // Relative-only resolve anchors at "/" without needing process.cwd().
    expect(resolve("src", "a.ts")).toBe("/src/a.ts");
  });

  it("matches node:path.posix on relative", () => {
    const pairs: Array<[string, string]> = [
      ["/ws", "/ws"],
      ["/ws", "/ws/src/a.ts"],
      ["/ws/src/a.ts", "/ws"],
      ["/ws/src/a", "/ws/src/b"],
      ["/ws/src/deep/file.ts", "/ws/lib/util.ts"],
      ["/", "/a/b"],
      ["/a/b", "/"],
      ["/ws/a", "/ws/ab"],
      ["/ws/ab", "/ws/a"]
    ];
    for (const [from, to] of pairs) {
      expect(relative(from, to), `relative(${from}, ${to})`).toBe(nodePath.posix.relative(from, to));
      expect(posix.relative(from, to), `posix.relative(${from}, ${to})`).toBe(nodePath.posix.relative(from, to));
    }
  });
});

describe("enginePath Windows drive-letter and UNC handling", () => {
  it("recognizes absolute Windows drive and UNC roots while rejecting drive-relative paths", () => {
    expect(isAbsolute("C:\\work\\Shop")).toBe(true);
    expect(isAbsolute("C:/work/Shop")).toBe(true);
    expect(isAbsolute("C:\\")).toBe(true);
    expect(isAbsolute("C:/")).toBe(true);
    expect(isAbsolute("C:")).toBe(false);
    expect(isAbsolute("C:relative\\file.ts")).toBe(false);
    expect(isAbsolute("\\\\server\\share\\proj")).toBe(true);
    // Strict posix namespace treats Windows drive letters as ordinary relative names.
    expect(posix.isAbsolute("C:/work/Shop")).toBe(false);
  });

  it("normalizes, joins, resolves, and inspects Windows drive paths into forward-slash form", () => {
    expect(normalize("C:\\work\\Shop\\..\\App\\src\\")).toBe("C:/work/App/src/");
    expect(normalize("C:\\")).toBe("C:/");
    expect(join("C:\\work\\Shop", "src\\a.ts")).toBe("C:/work/Shop/src/a.ts");
    expect(resolve("C:\\work\\Shop", "src\\..\\lib\\a.ts")).toBe("C:/work/Shop/lib/a.ts");
    expect(resolve("C:\\work\\Shop", "D:\\other\\b.ts")).toBe("D:/other/b.ts");
    expect(dirname("C:\\work\\Shop\\src\\a.ts")).toBe("C:/work/Shop/src");
    expect(dirname("C:\\work")).toBe("C:/");
    expect(dirname("C:\\")).toBe("C:/");
    expect(basename("C:\\work\\Shop\\a.ts")).toBe("a.ts");
    expect(basename("C:\\work\\Shop\\a.ts", ".ts")).toBe("a");
    expect(basename("C:\\")).toBe("");
    expect(extname("C:\\work\\Shop\\a.d.ts")).toBe(".ts");
  });

  it("computes relative paths across matching drives (case-insensitive) and preserves target across differing drives", () => {
    expect(relative("C:\\work\\Shop", "C:\\work\\Shop\\src\\a.ts")).toBe("src/a.ts");
    expect(relative("c:/work/Shop/src", "C:\\work\\Shop\\lib\\b.ts")).toBe("../lib/b.ts");
    expect(relative("C:\\work\\Shop", "D:\\other\\b.ts")).toBe("D:/other/b.ts");
    expect(relative("C:\\work\\Shop", "/posix/other")).toBe("/posix/other");
  });

  it("handles Windows UNC paths cleanly", () => {
    expect(normalize("\\\\server\\share\\a\\..\\b.ts")).toBe("//server/share/b.ts");
    expect(join("\\\\server\\share\\proj", "src\\index.ts")).toBe("//server/share/proj/src/index.ts");
    expect(dirname("\\\\server\\share\\proj\\index.ts")).toBe("//server/share/proj");
    expect(relative("\\\\server\\share\\proj", "\\\\server\\share\\proj\\src\\index.ts")).toBe("src/index.ts");
  });
});
