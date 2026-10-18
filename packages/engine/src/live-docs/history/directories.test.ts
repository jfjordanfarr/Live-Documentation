import { describe, expect, it } from "vitest";

import { directoryRenames } from "./directories";

describe("directoryRenames", () => {
  it("names a directory renamed whole, and its renamed subdirectories", () => {
    const before = ["src/core/a.ts", "src/core/b.ts", "src/core/deep/c.ts", "src/app/main.ts"];
    const after = ["src/engine/a.ts", "src/engine/b.ts", "src/engine/deep/c.ts", "src/app/main.ts"];
    const renamed: Array<[string, string]> = [
      ["src/core/a.ts", "src/engine/a.ts"],
      ["src/core/b.ts", "src/engine/b.ts"],
      ["src/core/deep/c.ts", "src/engine/deep/c.ts"]
    ];
    expect(directoryRenames(before, after, renamed)).toEqual([
      ["src/core", "src/engine"],
      ["src/core/deep", "src/engine/deep"]
    ]);
  });

  it("still names the rename when some files died with it, and when files were born under the new name", () => {
    const before = ["lib/a.ts", "lib/b.ts", "lib/gone.ts"];
    const after = ["pkg/a.ts", "pkg/b.ts", "pkg/new.ts"];
    expect(directoryRenames(before, after, [["lib/a.ts", "pkg/a.ts"], ["lib/b.ts", "pkg/b.ts"]])).toEqual([["lib", "pkg"]]);
  });

  it("names nothing when a file is left under the old path", () => {
    const before = ["lib/a.ts", "lib/b.ts"];
    const after = ["pkg/a.ts", "lib/b.ts"];
    expect(directoryRenames(before, after, [["lib/a.ts", "pkg/a.ts"]])).toEqual([]);
  });

  it("names nothing when the files move into a directory that already stood: a merge is the files' renames and the old directory's death", () => {
    const before = ["views/membrane/pin.ts", "views/graph.ts"];
    const after = ["views/pin.ts", "views/graph.ts"];
    expect(directoryRenames(before, after, [["views/membrane/pin.ts", "views/pin.ts"]])).toEqual([]);
  });

  it("names nothing for a flattening into the parent, which stood", () => {
    const before = ["tools/__tests__/a.test.ts", "tools/a.ts"];
    const after = ["tools/a.test.ts", "tools/a.ts"];
    expect(directoryRenames(before, after, [["tools/__tests__/a.test.ts", "tools/a.test.ts"]])).toEqual([]);
  });

  it("gives a split to the destination with strictly the most renames, and a tied split to none", () => {
    const before = ["old/a.ts", "old/b.ts", "old/c.ts"];
    const majority = directoryRenames(before, ["x/a.ts", "x/b.ts", "y/c.ts"], [["old/a.ts", "x/a.ts"], ["old/b.ts", "x/b.ts"], ["old/c.ts", "y/c.ts"]]);
    expect(majority).toEqual([["old", "x"]]);
    const tied = directoryRenames(["old/a.ts", "old/b.ts"], ["x/a.ts", "y/b.ts"], [["old/a.ts", "x/a.ts"], ["old/b.ts", "y/b.ts"]]);
    expect(tied).toEqual([]);
  });

  it("follows matching names up: a package renamed while its inner folders are restructured is still renamed whole", () => {
    // The shape of packages/server to packages/generator: the manifests keep their places and src/features/live-docs flattens into src.
    const before = ["packages/server/package.json", "packages/server/tsconfig.json", "packages/server/src/features/live-docs/generator.ts"];
    const after = ["packages/generator/package.json", "packages/generator/tsconfig.json", "packages/generator/src/generator.ts"];
    const renamed: Array<[string, string]> = [
      ["packages/server/package.json", "packages/generator/package.json"],
      ["packages/server/tsconfig.json", "packages/generator/tsconfig.json"],
      ["packages/server/src/features/live-docs/generator.ts", "packages/generator/src/generator.ts"]
    ];
    expect(directoryRenames(before, after, renamed)).toEqual([
      ["packages/server", "packages/generator"],
      ["packages/server/src/features/live-docs", "packages/generator/src"]
    ]);
  });

  it("gives a new directory claimed by two old ones to the one with strictly the most renames, and a tie to none", () => {
    const before = ["d/y.ts", "d/z.ts", "d/sub/x.ts"];
    const after = ["e/y.ts", "e/z.ts", "e/x.ts"];
    const renamed: Array<[string, string]> = [["d/y.ts", "e/y.ts"], ["d/z.ts", "e/z.ts"], ["d/sub/x.ts", "e/x.ts"]];
    expect(directoryRenames(before, after, renamed)).toEqual([["d", "e"]]);
    const tied = directoryRenames(["d/y.ts", "d/sub/x.ts"], ["e/y.ts", "e/x.ts"], [["d/y.ts", "e/y.ts"], ["d/sub/x.ts", "e/x.ts"]]);
    expect(tied).toEqual([]);
  });

  it("never renames the workspace root, and a rename within one directory moves no directory", () => {
    expect(directoryRenames(["a.ts"], ["src/a.ts"], [["a.ts", "src/a.ts"]])).toEqual([]);
    expect(directoryRenames(["src/a.ts"], ["a.ts"], [["src/a.ts", "a.ts"]])).toEqual([]);
    expect(directoryRenames(["src/a.ts"], ["src/b.ts"], [["src/a.ts", "src/b.ts"]])).toEqual([]);
  });
});
