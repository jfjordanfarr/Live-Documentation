// Research of November 21, 2026 (not product code). "The database" read in place from disk by node:sqlite: the
// question reads only the pages it needs, and the bytes handed to open are ignored. Written as d2-sqlite-node.
import { Database } from "node:sqlite";
import { openWith } from "./sqlite-core.mjs";
export { encode } from "./d2-sqlite-node.mjs";

export const name = "sqlite read in place (node:sqlite)";
export const readsInPlace = true;

export async function open(_bytes, path) {
  const db = new Database(path, { readOnly: true });
  return openWith({
    all: (sql, params = []) => {
      const statement = db.prepare(sql);
      statement.setReturnArrays?.(true);
      return statement.all(...params).map((r) => (Array.isArray(r) ? r : Object.values(r)));
    }
  });
}
