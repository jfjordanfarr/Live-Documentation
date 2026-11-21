// Research of November 21, 2026 (not product code): the shape of a scan's facts, before any format is chosen.
//
// Reads one graph written by facts.cjs and prints, as JSON:
//   - counts: files, symbols, documentation sections, dependency lines, edges, entries, citing documents;
//   - where the bytes are: each field's share of the compact JSON, summed over every file;
//   - strings: how many there are, how many are distinct, how long they are, how much paths share their prefixes;
//   - the small vocabularies: kinds, archetypes, edge kinds, section titles;
//   - what each real question reads: the bytes of the fields it touches, against the whole.
//
// Usage: node shape.mjs <graph.json> [<out.json>]
import fs from "node:fs";

const [graphPath, outPath] = process.argv.slice(2);
const graph = JSON.parse(fs.readFileSync(graphPath, "utf8"));
const files = Object.values(graph.files);
const bytes = (value) => (value === undefined ? 0 : Buffer.byteLength(JSON.stringify(value)));

// ---------------------------------------------------------------------------------------------------------------
// Counts
// ---------------------------------------------------------------------------------------------------------------
const counts = { files: files.length, symbols: 0, sections: 0, sectionLines: 0, dependencies: 0, dependenciesLinked: 0, edges: 0, edgesResolved: 0, typeRefEdges: 0, entries: 0, citedBy: 0, reExports: 0, filesWithSymbols: 0, filesWithAuthored: 0, inboundPairs: 0 };
for (const f of files) {
  counts.symbols += f.symbols.length;
  if (f.symbols.length) counts.filesWithSymbols += 1;
  for (const s of f.symbols) {
    counts.sections += s.sections.length;
    for (const sec of s.sections) counts.sectionLines += sec.body.length;
  }
  counts.dependencies += f.dependencies.length;
  counts.dependenciesLinked += f.dependencies.filter((d) => d.link).length;
  counts.edges += f.edges.length;
  counts.edgesResolved += f.edges.filter((e) => e.to).length;
  counts.typeRefEdges += f.edges.filter((e) => e.from !== undefined || ["returns", "parameter", "extends", "implements", "constraint"].includes(e.kind)).length;
  counts.entries += f.entries.length;
  counts.citedBy += (f.citedBy ?? []).length;
  counts.reExports += (f.reExports ?? []).length;
  if (f.authored && !/^### Purpose\n_Pending authored purpose_/u.test(f.authored)) counts.filesWithAuthored += 1;
  counts.inboundPairs += f.inbound.length;
}

// ---------------------------------------------------------------------------------------------------------------
// Where the bytes are
// ---------------------------------------------------------------------------------------------------------------
const whole = bytes(graph);
const share = {};
const add = (key, n) => (share[key] = (share[key] ?? 0) + n);
for (const f of files) {
  add("key (the path as the files map's key)", bytes(f.codePath) + 1);
  add("codePath", bytes(f.codePath));
  add("docPath", bytes(f.docPath));
  add("layer, archetype, generatedAt", bytes(f.layer) + bytes(f.archetype) + bytes(f.generatedAt));
  add("authored (the written words)", bytes(f.authored));
  add("entries", bytes(f.entries));
  add("citedBy", bytes(f.citedBy));
  add("reExports", bytes(f.reExports));
  for (const s of f.symbols) {
    add("symbols: name, slug, kind, flags, source line", bytes(s.name) + bytes(s.slug) + bytes(s.kind) + bytes(s.flags) + bytes(s.source));
    add("symbols: type references (Returns, Parameters, ...)", bytes(s.references));
    add("symbols: documentation sections (docstrings)", bytes(s.sections));
  }
  add("dependencies (the lines as written)", bytes(f.dependencies));
  add("edges (the lines and type references, resolved)", bytes(f.edges));
  add("outbound + inbound (adjacency)", bytes(f.outbound) + bytes(f.inbound));
}
const sumShares = Object.values(share).reduce((a, b) => a + b, 0) - share["codePath"]; // codePath repeats the key
const byteShares = Object.fromEntries(
  Object.entries(share)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => [k, { bytes: v, percentOfWhole: +((100 * v) / whole).toFixed(1) }])
);

// ---------------------------------------------------------------------------------------------------------------
// Strings
// ---------------------------------------------------------------------------------------------------------------
const strings = new Map(); // category -> list
const push = (category, value) => {
  if (typeof value !== "string") return;
  (strings.get(category) ?? strings.set(category, []).get(category)).push(value);
};
for (const f of files) {
  push("path", f.codePath);
  push("docPath", f.docPath);
  push("archetype", f.archetype);
  push("authored", f.authored);
  for (const s of f.symbols) {
    push("symbol name", s.name);
    push("symbol slug", s.slug);
    push("symbol kind", s.kind);
    for (const flag of s.flags) push("symbol flag", flag);
    for (const sec of s.sections) {
      push("section title", sec.title);
      push("section body (joined)", sec.body.join("\n"));
    }
    for (const r of s.references) {
      if (r.role === "Parameters") for (const p of r.parameters) { push("parameter name", p.name); for (const t of p.types) { push("type name", t.name); push("link", t.link); } }
      else for (const t of r.types) { push("type name", t.name); push("link", t.link); }
    }
  }
  for (const d of f.dependencies) { push("dependency label", d.label); push("link", d.link); for (const q of d.qualifiers) push("qualifier", q); }
  for (const e of f.edges) { push("edge kind", e.kind); push("edge to (path)", e.to); push("edge toSymbol", e.toSymbol); }
}
const quantile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
const stringStats = {};
for (const [category, list] of strings) {
  const lengths = list.map((s) => Buffer.byteLength(s)).sort((a, b) => a - b);
  const distinct = new Set(list);
  const distinctBytes = [...distinct].reduce((a, s) => a + Buffer.byteLength(s), 0);
  stringStats[category] = {
    count: list.length,
    distinct: distinct.size,
    totalBytes: lengths.reduce((a, b) => a + b, 0),
    distinctBytes,
    medianBytes: quantile(lengths, 0.5),
    p90Bytes: quantile(lengths, 0.9),
    maxBytes: lengths[lengths.length - 1]
  };
}
// Front coding of the sorted paths: how many bytes each path shares with the one before it.
const paths = files.map((f) => f.codePath).sort();
let shared = 0;
let pathBytes = 0;
for (let i = 0; i < paths.length; i += 1) {
  const a = paths[i - 1] ?? "";
  const b = paths[i];
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n += 1;
  shared += Buffer.byteLength(b.slice(0, n));
  pathBytes += Buffer.byteLength(b);
}
const directories = new Set(paths.map((p) => p.slice(0, Math.max(0, p.lastIndexOf("/")))));
const pathsFrontCoded = { pathBytes, sharedWithPrevious: shared, percentShared: +((100 * shared) / pathBytes).toFixed(1), directories: directories.size };

// All strings of every category together: distinct versus total.
const all = [...strings.values()].flat();
const allDistinct = new Set(all);
const allStrings = {
  count: all.length,
  distinct: allDistinct.size,
  totalBytes: all.reduce((a, s) => a + Buffer.byteLength(s), 0),
  distinctBytes: [...allDistinct].reduce((a, s) => a + Buffer.byteLength(s), 0)
};

// The small vocabularies.
const vocab = (category) => {
  const m = new Map();
  for (const s of strings.get(category) ?? []) m.set(s, (m.get(s) ?? 0) + 1);
  return Object.fromEntries([...m].sort((a, b) => b[1] - a[1]).slice(0, 25));
};
const vocabularies = { archetype: vocab("archetype"), "symbol kind": vocab("symbol kind"), "edge kind": vocab("edge kind"), "section title": vocab("section title"), qualifier: vocab("qualifier") };

// Degree distribution.
const inDeg = files.map((f) => f.inbound.length).sort((a, b) => a - b);
const outDeg = files.map((f) => f.outbound.length).sort((a, b) => a - b);
const symPerFile = files.map((f) => f.symbols.length).sort((a, b) => a - b);
const degrees = {
  inbound: { median: quantile(inDeg, 0.5), p90: quantile(inDeg, 0.9), p99: quantile(inDeg, 0.99), max: inDeg[inDeg.length - 1], zero: inDeg.filter((d) => d === 0).length },
  outbound: { median: quantile(outDeg, 0.5), p90: quantile(outDeg, 0.9), p99: quantile(outDeg, 0.99), max: outDeg[outDeg.length - 1], zero: outDeg.filter((d) => d === 0).length },
  symbolsPerFile: { median: quantile(symPerFile, 0.5), p90: quantile(symPerFile, 0.9), p99: quantile(symPerFile, 0.99), max: symPerFile[symPerFile.length - 1] }
};

// ---------------------------------------------------------------------------------------------------------------
// What each real question reads
// ---------------------------------------------------------------------------------------------------------------
// The subjects: the most depended-on file (a hub), and a file of median inbound degree with at least one edge.
const hub = files.reduce((a, b) => (b.inbound.length > a.inbound.length ? b : a));
const withEdges = files.filter((f) => f.outbound.length > 0).sort((a, b) => a.outbound.length - b.outbound.length);
// "What is reachable from here": the file whose outbound closure is largest among a sample, to make the walk real.
function closure(start) {
  const seen = new Set([start]);
  const stack = [start];
  while (stack.length) for (const to of graph.files[stack.pop()].outbound) if (!seen.has(to)) { seen.add(to); stack.push(to); }
  return seen;
}
let reachStart = withEdges[0]?.codePath;
let reachSize = 0;
for (const f of withEdges.filter((_, i) => i % Math.max(1, Math.floor(withEdges.length / 200)) === 0)) {
  const n = closure(f.codePath).size;
  if (n > reachSize) { reachSize = n; reachStart = f.codePath; }
}
const neighbourhood = (path) => {
  const f = graph.files[path];
  return [...new Set([path, ...f.inbound, ...f.outbound])];
};
const pathsBytes = files.reduce((a, f) => a + bytes(f.codePath) + 1, 0);
const adjacencyBytes = files.reduce((a, f) => a + bytes(f.inbound) + bytes(f.outbound), 0);
const edgeToBytes = files.reduce((a, f) => a + f.edges.reduce((b, e) => b + bytes(e.to), 0), 0);
const recordBytes = (paths) => paths.reduce((a, p) => a + bytes(graph.files[p]), 0);
// A typical file: the median neighbourhood among files wired to anything.
const wired = files.filter((f) => f.inbound.length + f.outbound.length > 0).sort((a, b) => neighbourhood(a.codePath).length - neighbourhood(b.codePath).length || (a.codePath < b.codePath ? -1 : 1));
const typical = wired[Math.floor(wired.length / 2)];
const questions = {
  subjects: { hub: hub.codePath, hubInbound: hub.inbound.length, reachableFrom: reachStart, reachableCount: reachSize, neighbourhoodOfHub: neighbourhood(hub.codePath).length, typical: typical.codePath, neighbourhoodOfTypical: neighbourhood(typical.codePath).length },
  "what depends on this file (inbound)": {
    reads: "the file's inbound list, and the paths it names; without a stored inbound list, every file's edges",
    bytesWithStoredInbound: bytes(hub.inbound) + bytes(hub.codePath),
    bytesWithoutStoredInbound: pathsBytes + edgeToBytes,
    percentOfWholeWithout: +((100 * (pathsBytes + edgeToBytes)) / whole).toFixed(1)
  },
  "what is reachable from here (outbound closure)": {
    reads: "the outbound list of every file the walk reaches, and their paths",
    bytes: [...closure(reachStart)].reduce((a, p) => a + bytes(graph.files[p].outbound) + bytes(p), 0),
    allAdjacencyBytes: adjacencyBytes,
    percentOfWhole: +((100 * [...closure(reachStart)].reduce((a, p) => a + bytes(graph.files[p].outbound) + bytes(p), 0)) / whole).toFixed(2)
  },
  "the Local Map of one file (the file and its neighbours, whole records)": {
    reads: "the full record of the file and of each file it is wired to either way",
    bytes: recordBytes(neighbourhood(hub.codePath)),
    percentOfWhole: +((100 * recordBytes(neighbourhood(hub.codePath))) / whole).toFixed(2),
    medianFileBytes: quantile(files.map((f) => bytes(f)).sort((a, b) => a - b), 0.5)
  },
  "what changed between two commits": { reads: "two scans; per file, whether its facts differ, then the facts of those that do (measured in compare.mjs over two moments)" }
};

const out = { graph: graphPath.split("/").pop(), wholeCompactJsonBytes: whole, counts, byteShares, sumOfSharesBytes: sumShares, strings: stringStats, allStrings, pathsFrontCoded, vocabularies, degrees, questions };
const text = JSON.stringify(out, null, 2);
if (outPath) fs.writeFileSync(outPath, text);
console.log(text);
