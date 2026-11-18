import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { matchesPattern, resolveList, resolveText, tokenTable, TokenError, type RosettaManifest } from "./tokens";

const PROGRAMS = path.resolve(__dirname, "../../integration/programs");
const manifest = JSON.parse(fs.readFileSync(path.join(PROGRAMS, "rosetta-manifest.json"), "utf8")) as RosettaManifest;

/** Every file under a program, as a sample built from that folder names it. */
function filesOf(program: string, folder = program): string[] {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => (entry.isDirectory()
    ? filesOf(program, path.join(folder, entry.name))
    : [path.relative(program, path.join(folder, entry.name)).split(path.sep).join("/")]));
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
  it("places every source file of every program but one, and names that one", () => {
    for (const variant of manifest.variants) {
      const table = tableFor(variant.language);
      expect(table.unplaced, variant.language).toEqual(variant.language === "python" ? ["src/core_types.py"] : []);
      // The manifest's types pattern does not reach Python's core_types.py; until it does, {types} is not applicable there.
      for (const part of ["main", "processor", "models", "helpers"] as const) expect(table.subject[part], `${variant.language} ${part}`).toBeDefined();
      expect(table.files.test.length, `${variant.language} tests`).toBe(3);
    }
  });

  it("chooses a part's subject by its name, then an implementation over its header, then the declared entry", () => {
    expect(tableFor("c").subject.processor).toBe("src/processor.c");
    expect(tableFor("cpp").subject.types).toBe("src/types.hpp");
    expect(tableFor("java").subject.main).toBe("src/com/rosetta/app/Main.java");
    expect(tableFor("java").files.models).toEqual(["src/com/rosetta/models/ModelFactory.java", "src/com/rosetta/models/Record.java", "src/com/rosetta/models/Report.java"]);
    expect(tableFor("go").subject.main).toBe("src/main/main.go");
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
    expect(() => resolveText("{types}", tableFor("python"))).toThrow(TokenError);
    expect(() => resolveText("{widgets}", java)).toThrow(TokenError);
    expect(() => resolveText("{models*}", java)).toThrow(TokenError);
  });
});
