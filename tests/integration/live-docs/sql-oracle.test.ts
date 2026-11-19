/**
 * The SQL reader, held to Microsoft's T-SQL parser. For every fixture that
 * carries `expected/sql-scriptdom.json`, written by `npm run oracle:sql --
 * <fixture> --write` at development time, the SQL adapter reads the files the
 * record covers as the generator has it read them, and `sql-compare.ts` sets
 * what it reports beside what ScriptDom said: the objects each script creates,
 * at their lines, and the dependency lines each file's doc should carry.
 * Nothing here runs .NET.
 *
 * Where they disagree the disagreement is listed, in words, and the list must
 * equal the register below exactly: a miss mended, or a new one, fails the
 * test until the register says so.
 */
import { globSync } from "glob";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { compareSql, type SqlReport } from "../../../scripts/oracle/sql-compare";
import { readScriptDomRecord } from "../../../scripts/oracle/sql-scriptdom";

const INTEGRATION_ROOT = path.resolve(__dirname, "..");

/** The measured disagreements, fixture by fixture. */
const MEASURED_MISSES: Record<string, string[]> = {
  "fixtures/sql-server": [
    "object missing: Tests/BillingTests.class.sql:6 procedure BillingTests.test it doesn't count a settled invoice",
    "object missing: Tests/BillingTests.class.sql:21 procedure BillingTests.[test fn_Balance.sums the open ones]",
    "object invented: Tests/BillingTests.class.sql:6 procedure \"BillingTests.\"",
    "line: Procedures/Billing.usp_Statement.sql Billing.usp_Statement at 8, the adapter says 2",
    "line: Schema/Billing.Customer.sql Billing.Customer at 5, the adapter says 2",
    "line: Schema/Billing.fn_Balance.sql Billing.fn_Balance at 3, the adapter says 2",
    "line: Schema/Billing.fn_Balance.sql Billing.fn_OpenInvoices at 11, the adapter says 10",
    "dependency missing: Procedures/Billing.usp_Archive.sql -> Schema/Billing.Invoice.sql :: billing.invoice (delete)",
    "dependency missing: Procedures/Billing.usp_Statement.sql -> Procedures/Billing.usp_Archive.sql :: billing.usp_archive (execute)",
    "dependency missing: Procedures/Billing.usp_Statement.sql -> Schema/Billing.fn_Balance.sql :: billing.fn_balance (call)",
    "dependency missing: Procedures/Billing.usp_Statement.sql -> Schema/Billing.fn_Balance.sql :: billing.fn_openinvoices (table-function)",
    "dependency missing: Schema/Billing.Invoice.sql -> Schema/Billing.Customer.sql :: billing.customer (foreign-key)",
    "dependency missing: Tests/BillingTests.class.sql = tsqlt.faketable (execute)",
    "dependency missing: Tests/BillingTests.class.sql -> Schema/Billing.fn_Balance.sql :: billing.fn_balance (call)",
    "dependency missing: Tests/BillingTests.class.sql = tsqlt.assertequalstable (execute)",
    "dependency invented: Procedures/Billing.usp_Statement.sql = c",
    "dependency invented: Procedures/Billing.usp_Statement.sql = recent",
    "dependency invented: Procedures/Billing.usp_Statement.sql = sys.objects",
    "dependency invented: Schema/Billing.fn_Balance.sql = open_invoices"
  ],
  "programs/csharp/estate": []
};

/** Every fixture that keeps a ScriptDom record. */
function measuredFixtures(): string[] {
  return globSync(["programs/**/expected/sql-scriptdom.json", "fixtures/**/expected/sql-scriptdom.json"], { cwd: INTEGRATION_ROOT, nodir: true })
    .map((file) => path.posix.dirname(path.posix.dirname(file.replace(/\\/gu, "/"))))
    .sort();
}

/** The report's disagreements, in words. */
function disagreements(report: SqlReport): string[] {
  return [
    ...report.files.parseErrors.map((error) => `unparsed: ${error.file}:${error.line} ${error.message}`),
    ...report.objects.missing.map((object) => `object missing: ${object.file}:${object.line} ${object.kind} ${object.name}`),
    ...report.objects.invented.map((object) => `object invented: ${object.file}:${object.line} ${object.kind} ${JSON.stringify(object.name)}`),
    ...report.objects.wrongLines.map((object) => `line: ${object.file} ${object.name} at ${object.line}, the adapter says ${object.adapterLine}`),
    ...report.references.missing.map((entry) => `dependency missing: ${entry.file} ${entry.line} (${entry.hows.join(", ")})`),
    ...report.references.invented.map((entry) => `dependency invented: ${entry.file} ${entry.line}`)
  ];
}

describe("the SQL reader against ScriptDom", () => {
  it("finds the fixtures that carry the parser's record", () => {
    expect(measuredFixtures()).toEqual(Object.keys(MEASURED_MISSES).sort());
  });

  for (const fixture of measuredFixtures()) {
    it(`agrees with the parser on ${fixture}, but for its measured misses`, async () => {
      const fixtureDir = path.join(INTEGRATION_ROOT, fixture);
      const record     = readScriptDomRecord(path.join(fixtureDir, "expected", "sql-scriptdom.json"), fixtureDir)!;
      const report     = await compareSql(fixtureDir, record);
      expect(disagreements(report)).toEqual(MEASURED_MISSES[fixture]);
    });
  }
});
