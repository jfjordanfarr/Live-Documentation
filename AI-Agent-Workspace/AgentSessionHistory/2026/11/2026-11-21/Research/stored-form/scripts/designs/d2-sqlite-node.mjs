// Research of November 21, 2026 (not product code). "The database" in Node: node:sqlite, built into Node (its
// serialize and deserialize since 26.1.0), so nothing is installed or compiled.
import fs from "node:fs";
import { Database } from "node:sqlite";
import { encodeWith, openWith, writerWith } from "./sqlite-core.mjs";

export const name = "sqlite (node:sqlite)";

function adapter(db, onDisk = false) {
  return {
    exec: (sql) => db.exec(sql),
    insert: (sql, rows) => {
      const statement = db.prepare(sql);
      for (const row of rows) statement.run(...row);
    },
    prepare: (sql) => {
      const statement = db.prepare(sql);
      return (row) => statement.run(...row);
    },
    all: (sql, params = []) => {
      const statement = db.prepare(sql);
      statement.setReturnArrays?.(true);
      return statement.all(...params).map((r) => (Array.isArray(r) ? r : Object.values(r)));
    },
    export: () => (onDisk ? null : new Uint8Array(db.serialize())),
    close: () => db.close()
  };
}

export async function encode(graph) {
  return encodeWith(adapter(new Database(":memory:")), graph);
}

/** Written as the facts arrive: into a file on disk when a path is given (finish then returns nothing), else in memory. */
export function writer(location, path) {
  if (path) fs.rmSync(path, { force: true });
  return writerWith(adapter(path ? new Database(path) : new Database(":memory:"), Boolean(path)), location);
}

export async function open(bytes) {
  const db = new Database(":memory:");
  db.deserialize(bytes);
  return openWith(adapter(db));
}
