// Research of November 21, 2026 (not product code). "The database" in Node: node:sqlite, built into Node (its
// serialize and deserialize since 26.1.0), so nothing is installed or compiled.
import { Database } from "node:sqlite";
import { encodeWith, openWith } from "./sqlite-core.mjs";

export const name = "sqlite (node:sqlite)";

function adapter(db) {
  return {
    exec: (sql) => db.exec(sql),
    insert: (sql, rows) => {
      const statement = db.prepare(sql);
      for (const row of rows) statement.run(...row);
    },
    all: (sql, params = []) => {
      const statement = db.prepare(sql);
      statement.setReturnArrays?.(true);
      return statement.all(...params).map((r) => (Array.isArray(r) ? r : Object.values(r)));
    },
    export: () => new Uint8Array(db.serialize()),
    close: () => db.close()
  };
}

export async function encode(graph) {
  return encodeWith(adapter(new Database(":memory:")), graph);
}

export async function open(bytes) {
  const db = new Database(":memory:");
  db.deserialize(bytes);
  return openWith(adapter(db));
}
