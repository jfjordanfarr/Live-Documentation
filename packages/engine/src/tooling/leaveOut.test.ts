import { describe, expect, it } from "vitest";

import { leaveOut } from "./leaveOut";

/** What `leaveOut` decides beyond git's and TFVC's own rules: the tool's own output, whole folders, the starting lists. */

describe("leaveOut", () => {
  it("never scans the tool's own output, whatever the ignore files and the person say", () => {
    const decide = leaveOut({ ignoreFiles: [{ path: ".gitignore", text: "!.live-documentation/\n" }], person: ["!.live-documentation/**"], ownOutput: [".live-documentation"] });
    expect(decide.folder(".live-documentation")).toMatchObject({ kept: false, rule: { kind: "own output", folder: ".live-documentation" }, prunable: true });
    expect(decide.file(".live-documentation/source/a.ts.md")).toMatchObject({ kept: false, rule: { kind: "own output" } });
  });

  it("leaves a folder out whole under a .tfignore, as tf add does, and names the ! line that could have kept something inside", () => {
    const decide = leaveOut({ ignoreFiles: [{ path: ".tfignore", text: "packages\n!packages\\keep\\x.targets\n" }] });
    const folder = decide.folder("packages");
    expect(folder).toMatchObject({ kept: false, prunable: true, rule: { kind: "tfignore", file: ".tfignore", line: 1 } });
    expect(folder.notes).toEqual([".tfignore line 2, `!packages\\keep\\x.targets`, may name files inside folders left out whole; they are not looked for"]);
    expect(decide.file("packages/keep/x.targets")).toMatchObject({ kept: false, rule: { line: 1 } });
  });

  it("reads a person's patterns and a starting list without regard to case, and .gitignore as the repository says", () => {
    const folded = leaveOut({ ignoreFiles: [{ path: ".gitignore", text: "packages/\n" }], gitIgnoreCase: true });
    const exact = leaveOut({ ignoreFiles: [{ path: ".gitignore", text: "packages/\n" }], gitIgnoreCase: false });
    expect(folded.folder("Packages").kept).toBe(false);
    expect(exact.folder("Packages").kept).toBe(true);
    expect(leaveOut({ ignoreFiles: [], person: ["bin/"] }).folder("Bin").kept).toBe(false);
    expect(leaveOut({ ignoreFiles: [], startingList: ["obj/"] }).folder("src/OBJ").kept).toBe(false);
  });

  it("offers the starting list only where no ignore file stands at or above", () => {
    const decide = leaveOut({ ignoreFiles: [{ path: "a/.tfignore", text: "*.log\n" }], startingList: ["bin/"] });
    expect(decide.folder("a/bin").kept).toBe(true);
    expect(decide.folder("b/bin").kept).toBe(false);
  });

  it("leaves out by evidence: bin beside a project file, packages holding NuGet's folders, node_modules holding packages", () => {
    const names: Record<string, string[]> = {
      "": ["App.csproj", "bin/", "packages/", "web/", "src/"],
      packages: ["Newtonsoft.Json.13.0.3/", "repositories.config"],
      web: ["node_modules/", "bin/"],
      "web/node_modules": ["left-pad/"],
      "web/node_modules/left-pad": ["package.json", "index.js"],
      src: ["packages/"],
      "src/packages": ["IPackageController.cs", "PackageController.cs"]
    };
    const decide = leaveOut({ ignoreFiles: [], startingList: { evidence: (folder) => names[folder] ?? [] } });
    expect(decide.folder("bin")).toMatchObject({ kept: false, rule: { kind: "starting list", pattern: "bin/ beside a project file" } });
    expect(decide.folder("packages").kept).toBe(false);
    expect(decide.folder("web/node_modules").kept).toBe(false);
    // No project file beside it, and no NuGet folder inside: kept.
    expect(decide.folder("web/bin").kept).toBe(true);
    expect(decide.folder("src/packages").kept).toBe(true);
  });
});
