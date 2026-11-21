// Research of November 21, 2026 (not product code). Do the two SQLite engines, node:sqlite in Node and sql.js in a page,
// write the same bytes for the same facts by the same statements? sql.js is run here in Node, which is the same
// WebAssembly the page runs. Prints the lengths, how many bytes differ, and where.
//
//   node sqlite-hosts.mjs <graph.json> <sql.js folder>
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { encodeWith } from "./designs/sqlite-core.mjs";
import { encode as encodeNode } from "./designs/d2-sqlite-node.mjs";

const [graphPath, sqlJsDir] = process.argv.slice(2);
const graph = JSON.parse(fs.readFileSync(graphPath, "utf8"));
const initSqlJs = createRequire(import.meta.url)(path.join(sqlJsDir, "dist", "sql-wasm.js"));
const SQL = await initSqlJs();
const db = new SQL.Database();
const fromSqlJs = await encodeWith(
  {
    exec: (sql) => db.exec(sql),
    insert: (sql, rows) => { const s = db.prepare(sql); for (const r of rows) s.run(r); s.free(); },
    all: () => [],
    export: () => db.export(),
    close: () => db.close()
  },
  graph
);
const fromNode = await encodeNode(graph);
const differing = [];
for (let i = 0; i < Math.min(fromNode.length, fromSqlJs.length); i += 1) if (fromNode[i] !== fromSqlJs[i]) differing.push(i);
console.log(JSON.stringify({ nodeSqliteBytes: fromNode.length, sqlJsBytes: fromSqlJs.length, bytesDiffering: differing.length, offsets: differing.slice(0, 12), sqliteVersionAtOffset96: { node: new DataView(fromNode.buffer, fromNode.byteOffset).getUint32(96), sqlJs: new DataView(fromSqlJs.buffer, fromSqlJs.byteOffset).getUint32(96) } }));
