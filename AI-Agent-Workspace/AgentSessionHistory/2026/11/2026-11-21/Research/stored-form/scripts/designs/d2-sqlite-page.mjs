// Research of November 21, 2026 (not product code). "The database" in a page: sql.js, whose one script carries its
// WebAssembly inline (688 KB of it), so the page fetches nothing; it runs under 'wasm-unsafe-eval'. The SQL is the
// Node design's (sqlite-core.mjs). In a page the database lives in the WebAssembly memory, whole: there is no file to
// read in place. It is carried gzipped, since an SQLite file is mostly the slack of its pages.
//
// The bundler is pointed at sql.js's `sql-wasm-inline.js` under the name "sql.js-inline".
import initSqlJs from "sql.js-inline";
import { compress, inflate } from "./common.mjs";
import { encodeWith, openWith, writerWith } from "./sqlite-core.mjs";

export const name = "sqlite (sql.js)";
let SQL;
const ready = async () => (SQL ??= await initSqlJs());

function adapter(db) {
  return {
    exec: (sql) => db.exec(sql),
    insert: (sql, rows) => {
      const statement = db.prepare(sql);
      for (const row of rows) statement.run(row);
      statement.free();
    },
    prepare: (sql) => {
      const statement = db.prepare(sql);
      return (row) => statement.run(row);
    },
    all: (sql, params = []) => {
      const statement = db.prepare(sql);
      statement.bind(params);
      const rows = [];
      while (statement.step()) rows.push(statement.get());
      statement.free();
      return rows;
    },
    export: () => db.export(),
    close: () => db.close()
  };
}

/** The stored file: the database's bytes gzipped. */
export async function encode(graph) {
  await ready();
  return compress(await encodeWith(adapter(new SQL.Database()), graph), "gzip");
}

export async function writer(location) {
  await ready();
  const w = writerWith(adapter(new SQL.Database()), location);
  return { add: w.add, finish: async () => compress(await w.finish(), "gzip") };
}

export async function open(bytes) {
  await ready();
  return openWith(adapter(new SQL.Database(await inflate(bytes, "gzip"))));
}
