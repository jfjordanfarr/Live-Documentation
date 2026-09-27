/**
 * The oracle comparison must account for every expected edge, on every fixture that
 * carries expectations, without a compiler present. It asserts the bookkeeping, not
 * the adapter's score: what the adapter finds is the report's business.
 */
import * as fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { compareFixture } from "../../../scripts/oracle/compare";

const FIXTURE_ROOT = path.resolve(__dirname, "../programs");

const MEASURED_FIXTURES = ["csharp/webforms", "csharp/estate"];

describe("oracle:compare", () => {
  for (const fixture of MEASURED_FIXTURES) {
    it(`accounts for every expected edge of ${fixture}`, async () => {
      const fixtureDir = path.join(FIXTURE_ROOT, fixture);
      const expected   = JSON.parse(fs.readFileSync(path.join(fixtureDir, "expected", "compiler-edges.json"), "utf8")) as { edges: unknown[] };

      const report = await compareFixture(fixtureDir);

      expect(report.compiler.found.length + report.compiler.missing.length).toBe(expected.edges.length);
      for (const edge of report.compiler.extra) {
        expect(report.compiler.found).not.toContainEqual(edge);
      }
      if (report.handVerified) {
        const handVerified = JSON.parse(fs.readFileSync(path.join(fixtureDir, "expected", "hand-verified-edges.json"), "utf8")) as { edges: unknown[] };
        expect(report.handVerified.found.length + report.handVerified.missing.length).toBe(handVerified.edges.length);
      }
    });
  }
});
