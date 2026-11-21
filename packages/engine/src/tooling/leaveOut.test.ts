import { describe, expect, it } from "vitest";

import { leaveOut } from "./leaveOut";

/** What `leaveOut` decides beyond git's and TFVC's own rules: its own folders, whole folders, case, the evidence rules. */

/** The names a small tree holds, by folder, a folder's with a trailing slash, as the evidence rules ask. */
const NAMES: Record<string, string[]> = {
  "": ["App.csproj", "bin/", "packages/", "web/", "src/", "lib/"],
  packages: ["Newtonsoft.Json.13.0.3/", "repositories.config"],
  web: ["node_modules/", "bin/"],
  "web/node_modules": ["left-pad/"],
  "web/node_modules/left-pad": ["package.json", "index.js"],
  src: ["packages/"],
  "src/packages": ["IPackageController.cs", "PackageController.cs"],
  lib: ["Lib.csproj", "obj/", ".tfignore"]
};
const names = (folder: string): string[] => NAMES[folder] ?? [];

describe("leaveOut", () => {
  it("never scans the tool's own output nor a version control's own folder, whatever the ignore files and the person say", () => {
    const decide = leaveOut({ ignoreFiles: [{ path: ".gitignore", text: "!.live-documentation/\n" }], person: ["!.live-documentation/**", "!.git/"], ownOutput: [".live-documentation"] });
    expect(decide.folder(".live-documentation")).toMatchObject({ kept: false, rule: { kind: "own output", folder: ".live-documentation" }, prunable: true });
    expect(decide.file(".live-documentation/source/a.ts.md")).toMatchObject({ kept: false, rule: { kind: "own output" } });
    for (const folder of [".git", "sub/.hg", ".svn", "$tf", ".tf1", "$TF"]) expect(decide.folder(folder)).toMatchObject({ kept: false, rule: { kind: "version control" } });
    expect(decide.folder(".tf16").kept).toBe(true);
    // A worktree's `.git` is a file that points at its repository.
    expect(decide.file(".git")).toMatchObject({ kept: false, rule: { kind: "version control" } });
  });

  it("leaves a folder out whole under a .tfignore, as tf add does, and names the ! line that could have kept something inside", () => {
    const decide = leaveOut({ ignoreFiles: [{ path: ".tfignore", text: "packages\n!packages\\keep\\x.targets\n" }] });
    const folder = decide.folder("packages");
    expect(folder).toMatchObject({ kept: false, prunable: true, rule: { kind: "tfignore", file: ".tfignore", line: 1 } });
    expect(folder.notes).toEqual([".tfignore line 2, `!packages\\keep\\x.targets`, may name files inside folders left out whole; they are not looked for"]);
    expect(decide.file("packages/keep/x.targets")).toMatchObject({ kept: false, rule: { line: 1 } });
  });

  it("reads a person's patterns without regard to case, and .gitignore as the repository says", () => {
    const folded = leaveOut({ ignoreFiles: [{ path: ".gitignore", text: "packages/\n" }], gitIgnoreCase: true });
    const exact = leaveOut({ ignoreFiles: [{ path: ".gitignore", text: "packages/\n" }], gitIgnoreCase: false });
    expect(folded.folder("Packages").kept).toBe(false);
    expect(exact.folder("Packages").kept).toBe(true);
    expect(leaveOut({ ignoreFiles: [], person: ["bin/"] }).folder("Bin").kept).toBe(false);
  });

  it("leaves out by evidence: bin beside a project file, packages holding NuGet's folders, node_modules holding packages, and nothing by its name alone", () => {
    const decide = leaveOut({ ignoreFiles: [], evidence: { names, apply: true } });
    expect(decide.folder("bin")).toMatchObject({ kept: false, rule: { kind: "evidence", pattern: "bin/ beside a project file" } });
    expect(decide.folder("packages").kept).toBe(false);
    expect(decide.folder("web/node_modules").kept).toBe(false);
    expect(decide.folder("web/bin").kept).toBe(true);
    expect(decide.folder("src/packages").kept).toBe(true);
  });

  it("applies evidence beneath any ignore file, a .gitignore's ! among them, and lets only a person's ! keep what it finds", () => {
    const ignoreFiles = [{ path: ".gitignore", text: "!packages/\n" }, { path: "lib/.tfignore", text: "packages\n" }];
    expect(leaveOut({ ignoreFiles, evidence: { names, apply: true } }).folder("packages")).toMatchObject({ kept: false, rule: { kind: "evidence" } });
    expect(leaveOut({ ignoreFiles, evidence: { names, apply: true } }).folder("lib/obj")).toMatchObject({ kept: false, rule: { kind: "evidence", pattern: "obj/ beside a project file" } });
    expect(leaveOut({ ignoreFiles, evidence: { names, apply: true }, person: ["!packages/"] }).folder("packages")).toMatchObject({ kept: true, rule: { kind: "person" } });
  });

  // The trial page of 2026-11-21, fifth leg: keeping a `packages` folder that a `.tfignore` names kept the folder and
  // left its every package out, since a TFVC entry matches any folder of a path; the person's keep is of all of it.
  it("lets a person's ! on a folder keep what an ignore file left out only by that folder's name", () => {
    const ignoreFiles = [{ path: ".tfignore", text: "packages\n*.pdb\n" }];
    const decide = leaveOut({ ignoreFiles, evidence: { names, apply: true }, person: ["!/packages/"] });
    expect(decide.folder("packages")).toMatchObject({ kept: true, rule: { kind: "person" } });
    expect(decide.folder("packages/Newtonsoft.Json.13.0.3").kept).toBe(true);
    expect(decide.file("packages/Newtonsoft.Json.13.0.3/lib/Newtonsoft.Json.dll").kept).toBe(true);
    // What the ignore file names by a thing's own name still holds inside, and so does a `packages` deeper down.
    expect(decide.file("packages/Newtonsoft.Json.13.0.3/lib/Newtonsoft.Json.pdb")).toMatchObject({ kept: false, rule: { kind: "tfignore", line: 2 } });
    expect(decide.folder("packages/Newtonsoft.Json.13.0.3/packages")).toMatchObject({ kept: false, rule: { kind: "tfignore", line: 1 } });
    // Elsewhere the entry leaves its folders out as before.
    expect(decide.folder("src/packages")).toMatchObject({ kept: false, rule: { kind: "tfignore", line: 1 } });
  });

  // The trial page of 2026-11-21, fifth leg: DNN's `!DNN [Pp]latform/[Cc]omponents` was said to reach into 177 `bin`
  // folders deeper down, read only as far as its first `[`.
  it("names a ! line beside a folder left out whole only when its parts could name something inside the folder", () => {
    const text = "[Bb]in/\n!DNN [Pp]latform/[Cc]omponents\n!DNN [Pp]latform/*/[Bb]in/keep.dll\n!**/kept.dll\n!other/bin/x\n";
    const notes = leaveOut({ ignoreFiles: [{ path: ".gitignore", text }] }).folder("DNN Platform/Library/bin").notes ?? [];
    expect(notes.map((note) => note.slice(0, note.indexOf(","))).sort()).toEqual([".gitignore line 3", ".gitignore line 4"]);
  });

  // A lazy walk lists a folder only after deciding it; the trial page of 2026-11-21 missed every nested .gitignore until
  // a folder's own ignore files were asked for when something inside it is decided, and not when it is.
  it("asks for a folder's own ignore files only when something inside it is decided", () => {
    const asked: string[] = [];
    const decide = leaveOut({ ignoreFiles: (folder) => {
      asked.push(folder);
      return folder === "a" ? [{ path: "a/.gitignore", text: "*.log\n" }] : [];
    } });
    expect(decide.folder("a").kept).toBe(true);
    expect(asked).toEqual([""]);
    expect(decide.file("a/x.log").kept).toBe(false);
    expect(asked).toEqual(["", "a"]);
  });

  it("only reports what evidence finds when it is not applied", () => {
    const decide = leaveOut({ ignoreFiles: [], evidence: { names, apply: false } });
    expect(decide.folder("packages")).toMatchObject({ kept: true, prunable: false, evidence: { kind: "evidence", index: 2 } });
    expect(decide.file("packages/Newtonsoft.Json.13.0.3/lib/x.dll").kept).toBe(true);
  });
});
