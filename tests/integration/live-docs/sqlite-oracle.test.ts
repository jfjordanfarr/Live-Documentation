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
import * as os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { heldToLedger, listedButNotRun } from "@live-documentation/engine/live-docs/adapters/knownDifferences";

import { sourceDigests, sourcesDiffer } from "../../../scripts/oracle/sources";
import { compareSqlite, runSqlite, sqliteSources, type SqliteRecord } from "../../../scripts/oracle/sql-sqlite";

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

/*
 * A reviewer's cases of 2026-11-21, each red when committed. Each script is run by SQLite itself, here and now
 * (`runSqlite`, the grader's own run through `node:sqlite`, which Node carries), so that SQLite's answer, not a record,
 * is what the reader is held to. SQLite's "Comments": "Comments do not nest", where T-SQL's and PostgreSQL's do. A table
 * named in the `temp` schema is SQLite's temporary table, as `CREATE TEMP TABLE` is (in T-SQL `temp.x` is a lasting
 * table of a schema named `temp`: the same text, two rules). And `key`, `file` and `user` are names SQLite makes tables
 * of, which T-SQL reserves and the reader therefore takes for no name.
 */
describe("the SQL reader against SQLite, on scripts SQLite runs here", () => {
  const scripts: Record<string, string> = {
    "nested.sql": "/* old: SELECT * FROM x /* broken */\nCREATE TABLE kept (id INTEGER);\n-- the end of the old block */\n",
    "temp-schema.sql": "CREATE TABLE temp.scratch (id INTEGER);\nCREATE TABLE main.kept (id INTEGER);\n",
    "reserved.sql": "CREATE TABLE IF NOT EXISTS key (id INTEGER);\nCREATE TABLE IF NOT EXISTS file (id INTEGER);\nCREATE TABLE IF NOT EXISTS user (id INTEGER);\n"
  };
  for (const [file, script] of Object.entries(scripts)) {
    it(`declares what SQLite makes of ${file}`, async () => {
      const folder = fs.mkdtempSync(path.join(os.tmpdir(), "sqlite-live-"));
      try {
        fs.writeFileSync(path.join(folder, file), script, "utf8");
        const record = await runSqlite(folder, [file]);
        expect(record.files[file].refused).toBeUndefined();
        await heldToLedger(`sqlite-oracle.test.ts > ${expect.getState().currentTestName ?? ""}`, () => {
          expect(compareSqlite(folder, record)).toEqual([]);
        });
      } finally {
        fs.rmSync(folder, { recursive: true, force: true });
      }
    });
  }
});

describe("the ledger of known differences", () => {
  // Last in the file, after every case it may list has run.
  it("lists for this file only cases the file runs", () => {
    expect(listedButNotRun("sqlite-oracle.test.ts")).toEqual([]);
  });
});
