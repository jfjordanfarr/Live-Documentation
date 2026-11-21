/**
 * The SQL reader, held to SQLite. For every fixture that carries `expected/sqlite-schema.json`, written by `npm run
 * oracle:sqlite -- <fixture> --write` at development time, what the reader says each script creates is set beside
 * the tables and views SQLite held after running it (`sql-sqlite.ts`). Nothing here runs a database: the record
 * stands for it, and names every `.sql` file it was made from with a digest, so that a fixture whose scripts are new,
 * gone or changed since fails until the record is written again.
 *
 * Where they disagree the disagreement is listed, in words, and the list must equal the register below exactly.
 */
import { globSync } from "glob";
import * as fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { sourceDigests, sourcesDiffer } from "../../../scripts/oracle/sources";
import { compareSqlite, sqliteSources, type SqliteRecord } from "../../../scripts/oracle/sql-sqlite";

const INTEGRATION_ROOT = path.resolve(__dirname, "..");

/** The measured disagreements, fixture by fixture. */
const MEASURED_MISSES: Record<string, string[]> = {
  "fixtures/sql-sqlite": []
};

/** Every fixture that keeps a SQLite record, found apart from the register. */
function measuredFixtures(): string[] {
  return globSync(["programs/**/expected/sqlite-schema.json", "fixtures/**/expected/sqlite-schema.json"], { cwd: INTEGRATION_ROOT, dot: true, nodir: true })
    .map((file) => path.posix.dirname(path.posix.dirname(file.replace(/\\/gu, "/"))))
    .sort();
}

describe("the SQL reader against SQLite", () => {
  it("finds the fixtures that carry SQLite's record", () => {
    expect(measuredFixtures()).toEqual(Object.keys(MEASURED_MISSES).sort());
  });

  for (const fixture of measuredFixtures()) {
    it(`declares what SQLite makes of ${fixture}, but for its measured misses, its record made from its files as they stand`, () => {
      const folder = path.join(INTEGRATION_ROOT, fixture);
      const record = JSON.parse(fs.readFileSync(path.join(folder, "expected", "sqlite-schema.json"), "utf8")) as SqliteRecord;
      expect(sourcesDiffer(sourceDigests(folder, sqliteSources(folder)), record.sources), `write the record again: npm run oracle:sqlite -- tests/integration/${fixture} --write`).toEqual([]);
      expect(compareSqlite(folder, record)).toEqual(MEASURED_MISSES[fixture]);
    });
  }
});
