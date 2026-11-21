#!/usr/bin/env node
/**
 * Grades what the SQL reader says a script creates against SQLite itself: each `.sql` file of a folder is run alone in
 * an empty database in memory (`node:sqlite`, the SQLite that Node carries), and what the database then holds is set
 * beside the reader's declarations. A table or a view of the main schema is an object the script creates; one of the
 * temporary schema (`CREATE TEMP TABLE`) lives only as long as the connection, as T-SQL's `#name` does, and is none;
 * a virtual table is a table, and the tables SQLite makes to hold it (`docs_data` beside an FTS5 table `docs`) are
 * SQLite's own (`pragma_table_list`'s `shadow`). Indexes and triggers, which the reader gives no symbol, are not
 * graded. A script SQLite refuses is named, and its objects up to the refusal are what it holds.
 *
 * SQLite's spelling is one of three the T-SQL and PL/SQL reader meets in real repositories (MySQL's and PostgreSQL's
 * are the others); this grades SQLite's alone, the one whose engine is at hand without installing anything.
 *
 * A folder that keeps `expected/sqlite-schema.json` is read from it, so that a test runs no database; `--write` keeps
 * the record there, each file it was made from named with its digest (`sources.ts`).
 *
 * Usage:
 *   npm run oracle:sqlite -- <folder> [--detail]
 *   npm run oracle:sqlite -- <fixture> --write
 */
import * as fs from "node:fs";
import path from "node:path";

import { readSql, sqlNameParts } from "@live-documentation/engine/live-docs/openings";

import { listFixtureFiles } from "./fixture";
import { sourceDigests } from "./sources";

/** What SQLite held after one script ran: its lasting tables and views, by name as SQLite keeps it, and why it stopped, if it did. */
export interface SqliteFileRecord {
  objects: Array<{ kind: "table" | "view"; name: string }>;
  refused?: string;
}

/** SQLite's record of a folder: the SQLite that made it, what each script left in its database, and the files it was made from with their digests. */
export interface SqliteRecord {
  tool: string;
  files: Record<string, SqliteFileRecord>;
  sources: Record<string, string>;
}

/** The folder's SQL files, folder-relative, as the fixture walk lists them. */
export function sqliteSources(folder: string): string[] {
  return listFixtureFiles(folder).filter((file) => file.toLowerCase().endsWith(".sql")).sort();
}

/** Runs each script in a database of its own and reads back what it made. */
export async function runSqlite(folder: string, files: readonly string[]): Promise<SqliteRecord> {
  const { DatabaseSync } = await import("node:sqlite");
  const record: SqliteRecord = { tool: "", files: {}, sources: sourceDigests(folder, files) };
  for (const file of files) {
    const database = new DatabaseSync(":memory:");
    try {
      record.tool ||= `SQLite ${(database.prepare("SELECT sqlite_version() AS version").get() as { version: string }).version}, as node:sqlite carries it`;
      let refused: string | undefined;
      try {
        database.exec(fs.readFileSync(path.join(folder, file), "utf8"));
      } catch (error) {
        refused = error instanceof Error ? error.message : String(error);
      }
      const rows = database.prepare("SELECT name, type FROM pragma_table_list WHERE schema = 'main' AND name NOT LIKE 'sqlite\\_%' ESCAPE '\\' ORDER BY name").all() as Array<{ name: string; type: string }>;
      const objects = rows
        .filter((row) => row.type === "table" || row.type === "view" || row.type === "virtual")
        .map((row) => ({ kind: row.type === "view" ? "view" as const : "table" as const, name: row.name }));
      record.files[file] = refused ? { objects, refused } : { objects };
    } finally {
      database.close();
    }
  }
  return record;
}

/** Every way the reader's declarations differ from what SQLite made, in words. */
export function compareSqlite(folder: string, record: SqliteRecord): string[] {
  const found: string[] = [];
  for (const [file, made] of Object.entries(record.files)) {
    const text = fs.readFileSync(path.join(folder, file), "utf8");
    const declared = readSql(text).declarations
      .filter((declaration) => !declaration.inBody && (declaration.kind === "table" || declaration.kind === "view"))
      // The name as the database holds it: a quoted name unquoted, SQLite keeping every object in one schema of a file.
      .map((declaration) => `${declaration.kind} ${(sqlNameParts(declaration.name).at(-1) ?? "").toLowerCase()}`);
    const expected = made.objects.map((object) => `${object.kind} ${object.name.toLowerCase()}`);
    for (const object of expected) if (!declared.includes(object)) found.push(`${file}: SQLite makes ${object}, the reader does not declare it`);
    for (const object of declared) if (!expected.includes(object)) found.push(`${file}: the reader declares ${object}, SQLite makes no such object`);
  }
  return found.sort();
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const folder = args.find((arg) => !arg.startsWith("--"));
  if (!folder) {
    console.log("Usage: npm run oracle:sqlite -- <folder> [--detail] [--write]");
    process.exit(1);
  }
  const root = path.resolve(folder);
  const keptFile = path.join(root, "expected", "sqlite-schema.json");
  const files = sqliteSources(root);
  const record = !args.includes("--write") && fs.existsSync(keptFile) ? (JSON.parse(fs.readFileSync(keptFile, "utf8")) as SqliteRecord) : await runSqlite(root, files);
  if (args.includes("--write")) {
    fs.mkdirSync(path.dirname(keptFile), { recursive: true });
    fs.writeFileSync(keptFile, `${JSON.stringify(record, null, 2)}\n`);
  }
  const made = Object.values(record.files).reduce((sum, file) => sum + file.objects.length, 0);
  const refused = Object.entries(record.files).filter(([, file]) => file.refused);
  const differences = compareSqlite(root, record);
  console.log(`The SQL reader's declarations against ${record.tool}`);
  console.log(`Folder: ${root}`);
  console.log(`Files: ${files.length}, refused by SQLite ${refused.length}; tables and views SQLite makes: ${made}; differences: ${differences.length}`);
  if (args.includes("--detail")) {
    for (const [file, { refused: why }] of refused) console.log(`  refused: ${file}: ${why}`);
    for (const difference of differences) console.log(`  ${difference}`);
  }
}

if (require.main === module) void main();
