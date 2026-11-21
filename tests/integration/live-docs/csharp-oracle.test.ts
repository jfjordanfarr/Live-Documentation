/**
 * The C# adapter, held to the C# compiler's own binding. For every C# fixture
 * that carries `expected/csharp-compiler.json`, written by `npm run
 * oracle:csharp -- <fixture> --write` where .NET is (Roslyn binding every
 * simple name, each project's references as MSBuild evaluates them), the
 * adapter reads each C# file as the generator has it read, the fixture's files
 * its index, and the C# file pairs it draws are set beside the compiler's by
 * `compareCSharp`. Nothing here runs `dotnet`. The record names every file it
 * was compiled from with a digest, and a fixture whose C# or project files are
 * new, gone or changed since fails until the record is written again, so that
 * no file of a fixture goes ungraded.
 *
 * Where they disagree the disagreement is listed, in words, and the list must
 * equal the register below exactly: a miss fixed, or a new one, fails the
 * test until the register says so. Each entry names its cause.
 */
import { globSync } from "glob";
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { compareCSharp, compiledSources, type CompilerRecord, type CSharpReport } from "../../../scripts/oracle/csharp-compare";
import { folderFiles } from "../../../scripts/oracle/powershell-compare";
import { sourceDigests, sourcesDiffer } from "../../../scripts/oracle/sources";

const INTEGRATION_ROOT = path.resolve(__dirname, "..");

/**
 * The measured misses, fixture by fixture. `names` holds the cases an
 * independent review of the reader found on 2026-11-21: a nested type named
 * inside a class that inherits it, which C# finds in the base class before any
 * `using`, and an alias to the non-generic one of two types that differ only
 * by arity; both were mended the same day. The other C# samples had none
 * when their records were first kept, the same day.
 *
 * Its one known miss, found by the review's second pass and not mended: a
 * member a type inherits hides a type of the same name where an expression is
 * read, so `Gadget * 2` inside `MemberOverUsing : Base` is `Base`'s property;
 * the reader does not tell where an expression is read from where a type is,
 * for a type's own members either, and takes `Gadget` for the class a `using`
 * brings in.
 */
const MEASURED_MISSES: Record<string, string[]> = {
  "programs/csharp/basic":    [],
  "programs/csharp/estate":   [],
  "programs/csharp/names":    ["the adapter draws App/MemberOverUsing.cs → App/Other.cs on a namesake"],
  "programs/csharp/rosetta":  [],
  "programs/csharp/webforms": []
};

/** Discover compiler records independently of the register of measured misses. */
function measuredFixtures(root = INTEGRATION_ROOT): string[] {
  return globSync(["programs/**/expected/csharp-compiler.json", "fixtures/**/expected/csharp-compiler.json"], { cwd: root, dot: true, nodir: true })
    .map((file) => path.posix.dirname(path.posix.dirname(file.replace(/\\/gu, "/"))))
    .sort();
}

/** Every disagreement of a report, in words. */
function disagreements(report: CSharpReport): string[] {
  const only = report.edges.adapterOnly;
  return [
    ...report.projects.xml.map((project) => `MSBuild could not evaluate ${project}`),
    ...report.conditional.map((reference) => `a reference under a condition the default configuration does not meet: ${reference}`),
    ...only.namesake.map((edge) => `the adapter draws ${edge} on a namesake`),
    ...only.conditional.map((edge) => `the adapter draws ${edge} on a reference under such a condition`),
    ...only.other.map((edge) => `the adapter draws ${edge}, the compiler does not`),
    ...report.edges.compilerOnly.map((edge) => `the compiler binds ${edge}, the adapter does not draw it`)
  ];
}

describe("the C# adapter against the C# compiler's binding", () => {
  it("finds the fixtures that carry the compiler's record", () => {
    expect(measuredFixtures()).toEqual(Object.keys(MEASURED_MISSES).sort());
  });

  it("discovers a new compiler record without adding it to the miss register", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "csharp-oracle-discovery-"));
    try {
      const expected = path.join(root, "programs", "csharp", "new-case", "expected");
      fs.mkdirSync(expected, { recursive: true });
      fs.writeFileSync(path.join(expected, "csharp-compiler.json"), "{}\n");
      expect(measuredFixtures(root)).toEqual(["programs/csharp/new-case"]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  for (const fixture of measuredFixtures()) {
    it(`agrees with the compiler on ${fixture}, but for its measured misses, its record compiled from its sources as they stand`, async () => {
      const fixtureDir = path.join(INTEGRATION_ROOT, fixture);
      const kept       = JSON.parse(fs.readFileSync(path.join(fixtureDir, "expected", "csharp-compiler.json"), "utf8")) as CompilerRecord;
      const present    = sourceDigests(fixtureDir, compiledSources(folderFiles(fixtureDir)));
      expect(sourcesDiffer(present, kept.sources), `write the record again: npm run oracle:csharp -- tests/integration/${fixture} --write`).toEqual([]);
      const report     = await compareCSharp(fixtureDir, kept);
      expect(report.edges.compiler).toBeGreaterThan(0);
      expect(disagreements(report)).toEqual(MEASURED_MISSES[fixture]);
    });
  }
});
