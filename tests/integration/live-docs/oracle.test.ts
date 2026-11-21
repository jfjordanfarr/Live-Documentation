/**
 * The readers held to the oracles of every sample program that carries expectations, without a compiler present.
 *
 * The bookkeeping is asserted for every bucket: the comparison accounts for every edge the compiler, a person or a
 * project file asserts. The hand-verified edges are also held to the program's ledger
 * (`expected/hand-verified-misses.json`): a hand-verified edge is a truth a person asserted, so one the readers do not
 * draw fails the test unless the ledger lists it with its cause, and a listed edge that is drawn again, or no longer
 * asserted, fails it too. The compiler's missing and extra edges are held the same way to the ledger of causes the
 * sample programs share (`compiler-differences.json`), where each cause, in a sentence, says what the reader does and
 * what the compiler does and lists the edges it explains: an edge no cause lists fails, and so does a listed one that
 * is no longer found.
 */
import * as fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { COMPILER_LEDGER, compareFixture, heldToLedger, readCompilerCauses } from "../../../scripts/oracle/compare";

const FIXTURE_ROOT = path.resolve(__dirname, "../programs");

/** Every `<language>/<program>` under the sample programs that carries `expected/compiler-edges.json`. */
function measuredFixtures(): string[] {
  const directories = (parent: string): string[] =>
    fs.readdirSync(parent, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  return directories(FIXTURE_ROOT).flatMap((language) =>
    directories(path.join(FIXTURE_ROOT, language))
      .filter((program) => fs.existsSync(path.join(FIXTURE_ROOT, language, program, "expected", "compiler-edges.json")))
      .map((program) => `${language}/${program}`)
  );
}

const MEASURED_FIXTURES = measuredFixtures();

describe("oracle:compare", () => {
  it("finds fixtures that carry expectations", () => {
    expect(MEASURED_FIXTURES).toContain("csharp/estate");
  });

  it("fails a missed hand-verified edge its ledger does not list, and a listed one no longer missed", () => {
    const edge = { from: "a.cs", to: "b.config", via: "" };
    const miss = { from: "a.cs", to: "b.config", cause: "a reason" };
    expect(heldToLedger([edge], [miss])).toEqual({ unlisted: [], gone: [] });
    expect(heldToLedger([edge], [])).toEqual({ unlisted: [edge], gone: [] });
    expect(heldToLedger([], [miss])).toEqual({ unlisted: [], gone: [miss] });
  });

  it("tells a compiler's missing edge from an extra one of the same ends", () => {
    const missing = { program: "c/x", side: "missing" as const, from: "a.c", to: "b.c" };
    const extra   = { ...missing, side: "extra" as const };
    expect(heldToLedger([missing], [extra])).toEqual({ unlisted: [missing], gone: [extra] });
  });

  it("names in its ledger of causes only programs it measures, each difference under one cause", () => {
    const differences = readCompilerCauses(path.join(FIXTURE_ROOT, COMPILER_LEDGER)).flatMap((cause) => cause.differences);
    for (const difference of differences) expect(MEASURED_FIXTURES, difference.program).toContain(difference.program);
    const keys = differences.map((difference) => `${difference.program}|${difference.side}|${difference.from}|${difference.to}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  for (const fixture of MEASURED_FIXTURES) {
    it(`accounts for every expected edge of ${fixture}, each difference with the compiler and each hand-verified miss under a listed cause`, async () => {
      const fixtureDir = path.join(FIXTURE_ROOT, fixture);
      const expected   = JSON.parse(fs.readFileSync(path.join(fixtureDir, "expected", "compiler-edges.json"), "utf8")) as { edges: unknown[] };

      const report = await compareFixture(fixtureDir);

      expect(report.compiler.found.length + report.compiler.missing.length).toBe(expected.edges.length);
      for (const edge of report.compiler.extra) {
        expect(report.compiler.found).not.toContainEqual(edge);
      }
      expect({ unlisted: report.compiler.ledger.unlisted, gone: report.compiler.ledger.gone }).toEqual({ unlisted: [], gone: [] });
      if (report.handVerified) {
        const handVerified = JSON.parse(fs.readFileSync(path.join(fixtureDir, "expected", "hand-verified-edges.json"), "utf8")) as { edges: unknown[] };
        expect(report.handVerified.found.length + report.handVerified.missing.length).toBe(handVerified.edges.length);
        expect({ unlisted: report.handVerified.ledger.unlisted, gone: report.handVerified.ledger.gone }).toEqual({ unlisted: [], gone: [] });
      } else {
        expect(fs.existsSync(path.join(fixtureDir, "expected", "hand-verified-misses.json"))).toBe(false);
      }
      const expectedReferences = (JSON.parse(fs.readFileSync(path.join(fixtureDir, "expected", "compiler-edges.json"), "utf8")) as { projects: Array<{ references: string[] }> }).projects
        .reduce((count, project) => count + project.references.length, 0);
      if (expectedReferences > 0) {
        expect(report.projects).toBeDefined();
        expect(report.projects!.found.length + report.projects!.missing.length + report.projects!.unplaced.length).toBe(expectedReferences);
      }
    });
  }
});
