import { describe, expect, it } from "vitest";

import { fromGitignores, fromTfignores, leaveOut, proposeLines } from "./leaveOut";

/**
 * What `leaveOut` decides beyond git's own rules (held to git by `leaveOut.oracle.test.ts`): the two things outside the
 * list, the deciding line, whole folders and their notes, the list's case setting; the two translators' lines; and the
 * lines proposed from what the folders hold.
 */

/** The names a small tree holds, by folder, a folder's with a trailing slash, as the evidence rules ask. */
const NAMES: Record<string, string[]> = {
  "": ["App.csproj", "bin/", "packages/", "web/", "src/", "lib/"],
  packages: ["Newtonsoft.Json.13.0.3/", "repositories.config"],
  "packages/Newtonsoft.Json.13.0.3": ["lib/", "bin/"],
  web: ["node_modules/", "bin/"],
  "web/node_modules": ["left-pad/"],
  "web/node_modules/left-pad": ["package.json", "index.js"],
  src: ["packages/"],
  "src/packages": ["IPackageController.cs", "PackageController.cs"],
  lib: ["Lib.csproj", "obj/", "bin/"]
};
const names = (folder: string): string[] => NAMES[folder] ?? [];
const FOLDERS = ["bin", "packages", "packages/Newtonsoft.Json.13.0.3", "packages/Newtonsoft.Json.13.0.3/bin", "web", "web/bin", "web/node_modules", "web/node_modules/left-pad", "src", "src/packages", "lib", "lib/obj", "lib/bin"];

describe("leaveOut", () => {
  it("never scans the tool's own output nor a version control's own folder, whatever the list says", () => {
    const decide = leaveOut({ list: "!.live-documentation/**\n!.git/\n", ignoreCase: false, ownOutput: [".live-documentation"] });
    expect(decide.folder(".live-documentation")).toMatchObject({ kept: false, fixed: "own output", prunable: true });
    expect(decide.file(".live-documentation/source/a.ts.md")).toMatchObject({ kept: false, fixed: "own output" });
    for (const folder of [".git", "sub/.hg", ".svn", "$tf", ".tf1", "$TF"]) expect(decide.folder(folder)).toMatchObject({ kept: false, fixed: "version control" });
    expect(decide.folder(".tf16").kept).toBe(true);
    // A worktree's `.git` is a file that points at its repository.
    expect(decide.file(".git")).toMatchObject({ kept: false, fixed: "version control" });
  });

  it("names the line of the list that decided, a ! line too, and nothing where no line matched", () => {
    const decide = leaveOut({ list: "# build output\nbin/\n*.log\n!keep.log\n", ignoreCase: false });
    expect(decide.folder("src/bin")).toMatchObject({ kept: false, line: { number: 2, text: "bin/" }, prunable: true });
    expect(decide.file("a.log")).toEqual({ kept: false, line: { number: 3, text: "*.log" } });
    expect(decide.file("x/keep.log")).toEqual({ kept: true, line: { number: 4, text: "!keep.log" } });
    expect(decide.file("readme.md")).toEqual({ kept: true });
  });

  it("leaves a folder out whole, with its answer for what lies beneath, and notes a ! line that could have named something there", () => {
    const decide = leaveOut({ list: "packages/\n!packages/keep/x.targets\n", ignoreCase: false });
    const folder = decide.folder("packages");
    expect(folder).toMatchObject({ kept: false, prunable: true, line: { number: 1 } });
    expect(folder.notes).toEqual(["line 2, `!packages/keep/x.targets`, may name files inside folders left out whole; they are not looked for"]);
    expect(decide.file("packages/keep/x.targets")).toMatchObject({ kept: false, line: { number: 1 } });
  });

  it("matches names with regard to case or without, as the list's own setting says", () => {
    expect(leaveOut({ list: "packages/\n", ignoreCase: true }).folder("Packages").kept).toBe(false);
    expect(leaveOut({ list: "packages/\n", ignoreCase: false }).folder("Packages").kept).toBe(true);
  });

  // The trial page of 2026-11-21, fifth leg: DNN's `!DNN [Pp]latform/[Cc]omponents` was said to reach into 177 `bin`
  // folders deeper down, read only as far as its first `[`.
  it("names a ! line beside a folder left out whole only when its parts could name something inside the folder", () => {
    const list = "[Bb]in/\n!DNN [Pp]latform/[Cc]omponents\n!DNN [Pp]latform/*/[Bb]in/keep.dll\n!**/kept.dll\n!other/bin/x\n";
    const notes = leaveOut({ list, ignoreCase: false }).folder("DNN Platform/Library/bin").notes ?? [];
    expect(notes.map((note) => note.slice(0, note.indexOf(","))).sort()).toEqual(["line 3", "line 4"]);
  });
});

describe("fromGitignores", () => {
  it("puts a nested file's folder in front of its lines, keeps anchoring, ! and a trailing slash, and goes shallowest first", () => {
    const taken = fromGitignores([
      { path: "sub/.gitignore", text: "*.log\n/x/\ndocs/*.md\n!keep.log\n#comment\n" },
      { path: ".gitignore", text: "build/\n" },
      { path: "a[1]/.gitignore", text: "#x\n\\#y\n" }
    ]);
    expect(taken.lines).toEqual(["# .gitignore", "build/", "# a[1]/.gitignore", "a\\[1]/**/\\#y", "# sub/.gitignore", "sub/**/*.log", "sub/x/", "sub/docs/*.md", "!sub/**/keep.log"]);
    expect(taken.from[5]).toEqual({ file: "sub/.gitignore", line: 1 });
    expect(taken.needsIgnoreCase).toBe(false);
  });

  it("says where a list matching without case reaches a folder spelled otherwise than the one a nested file speaks for", () => {
    const taken = fromGitignores([{ path: "Build/.gitignore", text: "log\n" }], { folders: ["Build", "build"], ignoreCase: true });
    expect(taken.differences).toEqual(["Build/.gitignore speaks in place for Build/ alone; in the list, whose names match without regard to case, its lines reach build/ as well."]);
  });
});

describe("fromTfignores", () => {
  it("writes TFVC's lines in the list's syntax, and says what it cannot carry", () => {
    const taken = fromTfignores([{ path: "src/.tfignore", text: "\\bin\nobj\\\na\\b\\*.txt\n*.dll\nx*.\nmy[1].txt\n" }]);
    expect(taken.lines).toEqual(["# src/.tfignore", "/src/bin", "src/**/obj/", "src/a/b/**/*.txt", "src/**/*.dll", "src/**/x*.", "src/**/my\\[1].txt"]);
    expect(taken.differences).toEqual(["src/.tfignore line 5, `x*.`: TFVC lets a final \".\" match a name with no extension; the list's line does not."]);
    expect(taken.needsIgnoreCase).toBe(true);
  });

  it("follows each exclusion with its contents where a ! could keep the folder itself, as TFVC leaves out what lies beneath", () => {
    const taken = fromTfignores([{ path: ".tfignore", text: "bin\n!bin\n" }]);
    expect(taken.lines).toEqual(["# .tfignore", "bin", "bin/**", "!bin"]);
    const decide = leaveOut({ list: taken.lines.join("\n"), ignoreCase: true });
    expect(decide.folder("bin").kept).toBe(true);
    expect(decide.file("bin/x.dll").kept).toBe(false);
  });
});

describe("proposeLines", () => {
  it("proposes a name alone where every folder of that name is what the rule says, and exact lines where one is not", () => {
    const proposed = proposeLines(FOLDERS, names, true);
    expect(proposed.map((each) => each.line)).toEqual(["/bin/", "/lib/bin/", "obj/", "/packages/", "node_modules/"]);
    // `web/bin` has no project file beside it, so `bin/` alone would leave out what the exact lines keep; `src/packages`
    // holds source, so only the top `packages` is named; the `bin` inside it is not named again.
    expect(proposed.find((each) => each.line === "/packages/")?.folders).toEqual(["packages"]);
  });

  it("names folders spelled otherwise one by one for a list that matches case", () => {
    const folders = ["A", "B", "A/bin", "B/Bin"];
    const held: Record<string, string[]> = { A: ["A.csproj", "bin/"], B: ["B.csproj", "Bin/"] };
    expect(proposeLines(folders, (folder) => held[folder] ?? [], false).map((each) => each.line)).toEqual(["/A/bin/", "/B/Bin/"]);
    expect(proposeLines(folders, (folder) => held[folder] ?? [], true).map((each) => each.line)).toEqual(["bin/"]);
  });
});
