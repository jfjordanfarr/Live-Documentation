import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { matchesPattern, resolveList, resolveText, tokenTable, TokenError, type RosettaManifest } from "./tokens";

const PROGRAMS = path.resolve(__dirname, "../../integration/programs");
const manifest = JSON.parse(fs.readFileSync(path.join(PROGRAMS, "rosetta-manifest.json"), "utf8")) as RosettaManifest;

/**
 * Every file of a program that git does not ignore, tracked or not yet added, as a sample built from that folder names it
 * (discovery keeps the same files, by `gitIgnored`). Read from git and not from the disk: a working copy also holds what
 * a build left behind (Java's `target/classes`, C#'s `obj`), which git ignores and no map holds; a walk of the disk put
 * those files in the table and failed three cases here on the day the suite landed (2026-11-18).
 */
function filesOf(program: string): string[] {
  return execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", "."], { cwd: program, encoding: "utf8" })
    .split("\0").filter(Boolean);
}
const tableFor = (language: string, root = "") => {
  const variant = manifest.variants.find(candidate => candidate.language === language)!;
  return tokenTable(manifest, language, filesOf(path.join(PROGRAMS, variant.path)).map(id => `${root}${id}`), root);
};

describe("matchesPattern", () => {
  it("matches a file's own name, ignoring case, and never a longer name that only begins the same", () => {
    expect(matchesPattern("src/com/rosetta/app/Main.java", "main.*")).toBe(true);
    expect(matchesPattern("src/processor.ts", "Processor.*")).toBe(true);
    expect(matchesPattern("src/com/rosetta/types/ProcessorConfig.java", "Processor.*")).toBe(false);
  });

  it("matches a directory pattern only directly inside a directory of that name", () => {
    expect(matchesPattern("src/Models/Record.cs", "Models/*")).toBe(true);
    expect(matchesPattern("src/Models/Deep/Record.cs", "Models/*")).toBe(false);
    expect(matchesPattern("Record.cs", "Models/*")).toBe(false);
  });
});

describe("the Rosetta manifest as a token table", () => {
  it("places every source file of every program in a part, and gives every part a subject", () => {
    for (const variant of manifest.variants) {
      const table = tableFor(variant.language);
      expect(table.unplaced, variant.language).toEqual([]);
      for (const part of ["main", "processor", "models", "types", "helpers"] as const) expect(table.subject[part], `${variant.language} ${part}`).toBeDefined();
      expect(table.files.test.length, `${variant.language} tests`).toBe(3);
    }
    // Python keeps its types in core_types.py, which the manifest names since the scenario suite first read it (2026-11-18).
    expect(tableFor("python").subject.types).toBe("src/core_types.py");
  });

  it("without the map's references, chooses a part's subject by its name, then the C family's header first", () => {
    expect(tableFor("c").subject.processor).toBe("src/processor.h");
    expect(tableFor("cpp").subject.helpers).toBe("src/helpers.hpp");
    expect(tableFor("cpp").subject.types).toBe("src/types.hpp");
    expect(tableFor("java").subject.main).toBe("src/com/rosetta/app/Main.java");
    expect(tableFor("java").files.models).toEqual(["src/com/rosetta/models/ModelFactory.java", "src/com/rosetta/models/Record.java", "src/com/rosetta/models/Report.java"]);
    expect(tableFor("go").subject.main).toBe("src/main/main.go");
  });

  it("with the map's references, chooses the file of the part that most files of other parts use", () => {
    const c = manifest.variants.find(variant => variant.language === "c")!;
    const ids = filesOf(path.join(PROGRAMS, c.path));
    const references = [
      { consumer: "src/main.c", provider: "src/processor.h" },
      { consumer: "src/test_processor.c", provider: "src/processor.h" },
      // A file's use of its own part counts for nothing: the implementation includes its header.
      { consumer: "src/processor.c", provider: "src/processor.h" },
      // A tie between two files named for the part goes to the implementation.
      { consumer: "src/processor.c", provider: "src/helpers.h" },
      { consumer: "src/processor.c", provider: "src/helpers.c" }
    ];
    const table = tokenTable(manifest, "c", ids, "", references);
    expect(table.subject.processor).toBe("src/processor.h");
    expect(table.subject.helpers).toBe("src/helpers.c");

    const java = manifest.variants.find(variant => variant.language === "java")!;
    const models = "src/com/rosetta/models/";
    const used = tokenTable(manifest, "java", filesOf(path.join(PROGRAMS, java.path)), "", [
      { consumer: "src/com/rosetta/app/Main.java", provider: `${models}Record.java` },
      { consumer: "src/com/rosetta/processor/Processor.java", provider: `${models}Record.java` },
      { consumer: "src/com/rosetta/processor/Processor.java", provider: `${models}Report.java` },
      { consumer: "src/com/rosetta/app/Main.java", provider: `${models}ModelFactory.java` }
    ]);
    expect(used.subject.models).toBe(`${models}Record.java`);
  });

  it("gives a part a directory only where the part lives apart, never the program's shared folder", () => {
    expect(tableFor("csharp").directory.models).toBe("src/Models");
    expect(tableFor("go").directory.processor).toBe("src/processor");
    expect(tableFor("typescript").directory).toEqual({});
    expect(tableFor("ruby").directory).toEqual({});
  });

  it("resolves against the repository's own map, where the programs sit under their path", () => {
    const root = "tests/integration/programs/typescript/rosetta/";
    const table = tableFor("typescript", root);
    expect(resolveText("?view=local&node={processor}", table)).toBe(`?view=local&node=${root}src/processor.ts`);
  });
});

describe("resolving tokens", () => {
  const java = tableFor("java");

  it("spreads a whole part into its files and keeps literals", () => {
    expect(resolveList(["{main}", "{models*}", "README"], java)).toEqual([
      "src/com/rosetta/app/Main.java",
      "src/com/rosetta/models/ModelFactory.java",
      "src/com/rosetta/models/Record.java",
      "src/com/rosetta/models/Report.java",
      "README"
    ]);
  });

  it("refuses what it cannot give rather than guessing", () => {
    expect(() => resolveText("{models/}", tableFor("typescript"))).toThrow(TokenError);
    expect(() => resolveText("{widgets}", java)).toThrow(TokenError);
    expect(() => resolveText("{models*}", java)).toThrow(TokenError);
  });
});
