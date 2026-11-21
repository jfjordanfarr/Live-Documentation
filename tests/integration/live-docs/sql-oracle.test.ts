/**
 * The SQL reader, held to Microsoft's T-SQL parser. For every fixture that
 * carries `expected/sql-scriptdom.json`, written by `npm run oracle:sql --
 * <fixture> --write` at development time, the SQL adapter reads the files the
 * record covers as the generator has it read them, and `sql-compare.ts` sets
 * what it reports beside what ScriptDom said: the objects each script creates,
 * at their lines, and the dependency lines each file's doc should carry.
 * Nothing here runs .NET.
 *
 * The record names every `.sql` file it was parsed from with a digest, and a
 * fixture whose SQL files are new, gone or changed since fails until the
 * record is written again, so that no file of a fixture goes ungraded.
 *
 * Where they disagree the disagreement is listed, in words, and the list must
 * equal the register below exactly: a miss mended, or a new one, fails the
 * test until the register says so.
 */
import { globSync } from "glob";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { sourceDigests, sourcesDiffer } from "../../../scripts/oracle/sources";
import { compareSql, sqlSources, type SqlReport } from "../../../scripts/oracle/sql-compare";
import { readScriptDomRecord } from "../../../scripts/oracle/sql-scriptdom";

const INTEGRATION_ROOT = path.resolve(__dirname, "..");

/**
 * The measured disagreements, fixture by fixture. The first register for
 * `fixtures/sql-server` held nineteen, from a garbled name to a missing
 * function call, and none remained after the reader's mends of 2026-11-19.
 * The strings a script executes, read by the oracle since the same evening,
 * brought five more (a procedure created as a stub and then altered, and
 * what the strings and an ALTER use), and the reader's reading of those
 * strings left none again.
 *
 * `fixtures/sql-schemas`, of 2026-11-21, holds the same table name in two
 * schemas and names it by one part from modules of either, from a module's
 * DDL and executed string, from a trigger and a loose script, by
 * `database..name`, and on a linked server with its schema written and left
 * out, each bound by the order Microsoft documents. Its one
 * register entry is a kind of object the reader gives no symbol, a trigger.
 */
const MEASURED_MISSES: Record<string, string[]> = {
  "fixtures/sql-schemas": ["object missing: archive.OrdersKept.sql:2 trigger OrdersKept"],
  "fixtures/sql-server": [],
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
    it(`agrees with the parser on ${fixture}, but for its measured misses, its record parsed from its SQL files as they stand`, async () => {
      const fixtureDir = path.join(INTEGRATION_ROOT, fixture);
      const record     = readScriptDomRecord(path.join(fixtureDir, "expected", "sql-scriptdom.json"), fixtureDir)!;
      expect(sourcesDiffer(sourceDigests(fixtureDir, sqlSources(fixtureDir)), record.sources), `write the record again: npm run oracle:sql -- tests/integration/${fixture} --write`).toEqual([]);
      const report     = await compareSql(fixtureDir, record);
      expect(disagreements(report)).toEqual(MEASURED_MISSES[fixture]);
    });
  }
});
