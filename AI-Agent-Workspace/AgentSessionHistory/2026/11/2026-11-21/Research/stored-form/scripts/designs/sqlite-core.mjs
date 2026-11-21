// Research of November 21, 2026 (not product code). "The database": a scan's facts as an SQLite file, the relations a
// person would query kept as tables (files, symbols, dependencies, edges) and the small nested parts of a record
// (a symbol's type references and documentation, a file's entries) as JSON text in a column.
//
// The SQL is the same in Node and in a page; only the engine differs, handed in as an adapter:
//   exec(sql), insert(sql, rows), all(sql, params) -> arrays of rows as arrays, export() -> bytes, close().
import { graphFileOf, walk } from "./common.mjs";

const SCHEMA = `
CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT) WITHOUT ROWID;
CREATE TABLE files(id INTEGER PRIMARY KEY, path TEXT NOT NULL UNIQUE, layer INTEGER, archetype TEXT, generated_at TEXT,
  authored TEXT, entries TEXT, cited_by TEXT, re_exports TEXT);
CREATE TABLE symbols(file INTEGER NOT NULL, ord INTEGER NOT NULL, name TEXT, slug TEXT, kind TEXT, flags TEXT,
  source_path TEXT, source_line INTEGER, refs TEXT, sections TEXT, PRIMARY KEY(file, ord)) WITHOUT ROWID;
CREATE TABLE dependencies(file INTEGER NOT NULL, ord INTEGER NOT NULL, label TEXT, link TEXT, symbols TEXT, qualifiers TEXT,
  PRIMARY KEY(file, ord)) WITHOUT ROWID;
CREATE TABLE edges(file INTEGER NOT NULL, ord INTEGER NOT NULL, kind TEXT, label TEXT, link TEXT, to_file INTEGER,
  to_symbol TEXT, from_symbol TEXT, parameter TEXT, type_only INTEGER, basis TEXT, PRIMARY KEY(file, ord)) WITHOUT ROWID;
CREATE INDEX edges_to ON edges(to_file, file);
`;

const j = (v) => (v === undefined ? null : JSON.stringify(v));
const u = (v) => (v === null ? undefined : v);

export async function encodeWith(engine, graph) {
  engine.exec("PRAGMA page_size = 4096; PRAGMA journal_mode = OFF; PRAGMA synchronous = OFF;");
  engine.exec(SCHEMA);
  const paths = Object.keys(graph.files);
  const id = new Map(paths.map((p, i) => [p, i]));
  engine.exec("BEGIN");
  engine.insert("INSERT INTO meta VALUES (?, ?)", [["location", JSON.stringify({ root: graph.root, baseLayer: graph.baseLayer, extension: graph.extension })]]);
  engine.insert(
    "INSERT INTO files VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    paths.map((p, i) => {
      const f = graph.files[p];
      return [i, p, f.layer ?? null, f.archetype ?? null, f.generatedAt ?? null, f.authored ?? null, j(f.entries), j(f.citedBy), j(f.reExports)];
    })
  );
  const symbols = [];
  const deps = [];
  const edges = [];
  paths.forEach((p, i) => {
    const f = graph.files[p];
    f.symbols.forEach((s, k) => symbols.push([i, k, s.name, s.slug ?? null, s.kind, j(s.flags), s.source?.path ?? null, s.source?.line ?? null, j(s.references), j(s.sections)]));
    f.dependencies.forEach((d, k) => deps.push([i, k, d.label, d.link ?? null, j(d.symbols), j(d.qualifiers)]));
    f.edges.forEach((e, k) => edges.push([i, k, e.kind, e.label, e.link ?? null, e.to === undefined ? null : id.get(e.to), e.toSymbol ?? null, e.from ?? null, e.parameter ?? null, e.typeOnly ? 1 : null, e.basis ?? null]));
  });
  engine.insert("INSERT INTO symbols VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", symbols);
  engine.insert("INSERT INTO dependencies VALUES (?, ?, ?, ?, ?, ?)", deps);
  engine.insert("INSERT INTO edges VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", edges);
  engine.exec("COMMIT");
  engine.exec("VACUUM");
  const bytes = engine.export();
  engine.close();
  return bytes;
}

export async function openWith(engine) {
  const paths = engine.all("SELECT path FROM files ORDER BY id").map((r) => r[0]);
  const idOf = new Map(paths.map((p, i) => [p, i]));
  const location = JSON.parse(engine.all("SELECT value FROM meta WHERE key = 'location'")[0][0]);
  const inboundIds = (i) => engine.all("SELECT DISTINCT file FROM edges WHERE to_file = ? AND file <> ? ORDER BY file", [i, i]).map((r) => r[0]);
  const outboundIds = (i) => engine.all("SELECT DISTINCT to_file FROM edges WHERE file = ? AND to_file IS NOT NULL AND to_file <> ? ORDER BY to_file", [i, i]).map((r) => r[0]);
  const fileRow = (r) => ({ layer: u(r[2]), archetype: u(r[3]), generatedAt: u(r[4]), authored: u(r[5]), entries: JSON.parse(r[6]), citedBy: r[7] === null ? undefined : JSON.parse(r[7]), reExports: r[8] === null ? undefined : JSON.parse(r[8]) });
  const symbolRow = (r) => ({ name: r[2], slug: u(r[3]), kind: r[4], flags: JSON.parse(r[5]), source: r[6] === null ? undefined : { path: r[6], line: r[7] }, references: JSON.parse(r[8]), sections: JSON.parse(r[9]) });
  const depRow = (r) => ({ label: r[2], link: u(r[3]), symbols: r[4] === null ? undefined : JSON.parse(r[4]), qualifiers: JSON.parse(r[5]) });
  const edgeRow = (r) => {
    const e = { kind: r[2], label: r[3] };
    if (r[4] !== null) e.link = r[4];
    if (r[5] !== null) e.to = paths[r[5]];
    if (r[6] !== null) e.toSymbol = r[6];
    if (r[7] !== null) e.from = r[7];
    if (r[8] !== null) e.parameter = r[8];
    if (r[9] !== null) e.typeOnly = true;
    if (r[10] !== null) e.basis = r[10];
    return e;
  };
  const assemble = (ids, where, params) => {
    const records = new Map(ids.map((i) => [i, null]));
    for (const r of engine.all(`SELECT * FROM files WHERE ${where} ORDER BY id`, params)) records.set(r[0], { ...fileRow(r), symbols: [], dependencies: [], edges: [] });
    for (const r of engine.all(`SELECT * FROM symbols WHERE ${where.replaceAll("id", "file")} ORDER BY file, ord`, params)) records.get(r[0]).symbols.push(symbolRow(r));
    for (const r of engine.all(`SELECT * FROM dependencies WHERE ${where.replaceAll("id", "file")} ORDER BY file, ord`, params)) records.get(r[0]).dependencies.push(depRow(r));
    for (const r of engine.all(`SELECT * FROM edges WHERE ${where.replaceAll("id", "file")} ORDER BY file, ord`, params)) records.get(r[0]).edges.push(edgeRow(r));
    return records;
  };
  return {
    paths: async () => paths,
    inbound: async (path) => inboundIds(idOf.get(path)).map((i) => paths[i]),
    outbound: async (path) => outboundIds(idOf.get(path)).map((i) => paths[i]),
    reachable: async (path) =>
      engine
        .all("WITH RECURSIVE r(id) AS (SELECT ? UNION SELECT e.to_file FROM edges e JOIN r ON e.file = r.id WHERE e.to_file IS NOT NULL) SELECT id FROM r", [idOf.get(path)])
        .map((row) => paths[row[0]]),
    records: async (list) => {
      const ids = list.map((p) => idOf.get(p));
      const records = assemble(ids, `id IN (${ids.map(() => "?").join(",")})`, ids);
      return ids.map((i) => records.get(i));
    },
    all: async () => {
      const ids = paths.map((_, i) => i);
      const records = assemble(ids, "1 = 1", []);
      const outs = new Map(ids.map((i) => [i, []]));
      const ins = new Map(ids.map((i) => [i, []]));
      for (const [from, to] of engine.all("SELECT DISTINCT file, to_file FROM edges WHERE to_file IS NOT NULL AND to_file <> file ORDER BY file, to_file")) {
        outs.get(from).push(paths[to]);
        ins.get(to).push(paths[from]);
      }
      const files = {};
      paths.forEach((p, i) => (files[p] = graphFileOf(location, p, records.get(i), outs.get(i), ins.get(i).sort())));
      return { ...location, files };
    },
    walkCheck: (path) => walk(idOf.get(path), (i) => outboundIds(i)).length
  };
}
