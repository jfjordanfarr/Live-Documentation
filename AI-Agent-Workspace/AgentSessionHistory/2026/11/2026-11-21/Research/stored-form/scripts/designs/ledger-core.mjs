// Research of November 21, 2026 (not product code). The ledger's lines: one fact per line, each a JSON array that
// begins with the file's path and a letter for what the line says, in path order and then in a fixed order of letters:
//
//   [path, "F", layer, archetype, generatedAt]                       the file
//   [path, "W", authored]                                            its written words
//   [path, "N", i, entry]                                            an Entry line
//   [path, "S", i, name, slug, kind, flags, source, references, sections]   a public symbol, its docstring with it
//   [path, "D", i, label, link, symbols, qualifiers]                 a dependency line as written
//   [path, "G", i, kind, label, link, to, toSymbol, from, parameter, typeOnly, basis]   an edge, resolved
//   [path, "C", citedBy]   [path, "X", reExports]                    present only when the file has them
//
// Nothing is stored that a line does not show: what depends on a file is every "G" line whose seventh field names it.
// So `grep` finds it, `diff` of two ledgers is the change of the facts, and a person reads it in any editor.
import { comparePaths, encoder, graphFileOf } from "./common.mjs";

const n = (v) => (v === undefined ? null : v);
const u = (v) => (v === null ? undefined : v);

export function linesOf(graph, paths = Object.keys(graph.files).sort(comparePaths)) {
  const out = [];
  for (const p of paths) {
    const f = graph.files[p];
    out.push(JSON.stringify([p, "F", n(f.layer), n(f.archetype), n(f.generatedAt)]));
    if (f.authored !== undefined) out.push(JSON.stringify([p, "W", f.authored]));
    f.entries.forEach((e, i) => out.push(JSON.stringify([p, "N", i, e])));
    f.symbols.forEach((s, i) => out.push(JSON.stringify([p, "S", i, s.name, n(s.slug), s.kind, s.flags, n(s.source), s.references, s.sections])));
    f.dependencies.forEach((d, i) => out.push(JSON.stringify([p, "D", i, d.label, n(d.link), n(d.symbols), d.qualifiers])));
    f.edges.forEach((e, i) => out.push(JSON.stringify([p, "G", i, e.kind, e.label, n(e.link), n(e.to), n(e.toSymbol), n(e.from), n(e.parameter), e.typeOnly ? true : null, n(e.basis)])));
    if (f.citedBy !== undefined) out.push(JSON.stringify([p, "C", f.citedBy]));
    if (f.reExports !== undefined) out.push(JSON.stringify([p, "X", f.reExports]));
  }
  return out;
}

export function ledgerBytes(graph, paths) {
  const lines = linesOf(graph, paths);
  return encoder.encode(lines.length ? `${lines.join("\n")}\n` : "");
}

/** A file's record from its parsed lines, in order. */
export function recordFrom(lines) {
  const r = { entries: [], symbols: [], dependencies: [], edges: [] };
  for (const l of lines) {
    switch (l[1]) {
      case "F": r.layer = u(l[2]); r.archetype = u(l[3]); r.generatedAt = u(l[4]); break;
      case "W": r.authored = l[2]; break;
      case "N": r.entries.push(l[3]); break;
      case "S": r.symbols.push({ name: l[3], slug: u(l[4]), kind: l[5], flags: l[6], source: u(l[7]), references: l[8], sections: l[9] }); break;
      case "D": r.dependencies.push({ label: l[3], link: u(l[4]), symbols: u(l[5]), qualifiers: l[6] }); break;
      case "G": {
        const e = { kind: l[3], label: l[4] };
        if (l[5] !== null) e.link = l[5];
        if (l[6] !== null) e.to = l[6];
        if (l[7] !== null) e.toSymbol = l[7];
        if (l[8] !== null) e.from = l[8];
        if (l[9] !== null) e.parameter = l[9];
        if (l[10] !== null) e.typeOnly = true;
        if (l[11] !== null) e.basis = l[11];
        r.edges.push(e);
        break;
      }
      case "C": r.citedBy = l[2]; break;
      case "X": r.reExports = l[2]; break;
    }
  }
  return r;
}

/**
 * A ledger's text, indexed by where each line starts, so that one file's lines are found by binary search on the
 * path that begins each line, and "what depends on X" by a search for X's quoted path, without parsing the rest.
 */
export class LedgerText {
  constructor(text) {
    this.text = text;
    const starts = [0];
    for (let i = text.indexOf("\n"); i !== -1 && i < text.length - 1; i = text.indexOf("\n", i + 1)) starts.push(i + 1);
    this.starts = text.length ? starts : [];
  }
  line(k) {
    const end = k + 1 < this.starts.length ? this.starts[k + 1] - 1 : this.text.length - (this.text.endsWith("\n") ? 1 : 0);
    return this.text.slice(this.starts[k], end);
  }
  pathOf(k) {
    // The path is the first element: read it as a JSON string without parsing the line.
    const s = this.starts[k];
    let i = s + 2;
    while (this.text[i] !== '"') i += this.text[i] === "\\" ? 2 : 1;
    return JSON.parse(this.text.slice(s + 1, i + 1));
  }
  /** The parsed lines of one file. */
  linesOf(path) {
    let lo = 0;
    let hi = this.starts.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (comparePaths(this.pathOf(mid), path) < 0) lo = mid + 1;
      else hi = mid;
    }
    const out = [];
    for (let k = lo; k < this.starts.length && this.pathOf(k) === path; k += 1) out.push(JSON.parse(this.line(k)));
    return out;
  }
  /** Every line whose text holds the needle, parsed. */
  grep(needle) {
    const out = [];
    let lastLine = -1;
    for (let at = this.text.indexOf(needle); at !== -1; at = this.text.indexOf(needle, at + needle.length)) {
      let lo = 0;
      let hi = this.starts.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (this.starts[mid] <= at) lo = mid;
        else hi = mid - 1;
      }
      if (lo !== lastLine) {
        out.push(JSON.parse(this.line(lo)));
        lastLine = lo;
      }
    }
    return out;
  }
  paths() {
    const out = [];
    for (let k = 0; k < this.starts.length; k += 1) if (this.isFileLine(k)) out.push(this.pathOf(k));
    return out;
  }
  isFileLine(k) {
    const s = this.starts[k];
    let i = s + 2;
    while (this.text[i] !== '"') i += this.text[i] === "\\" ? 2 : 1;
    return this.text.startsWith(',"F",', i + 1);
  }
  /** The whole graph: every line parsed, adjacency derived from the edges. */
  graph(location) {
    const byPath = new Map();
    for (let k = 0; k < this.starts.length; k += 1) {
      const l = JSON.parse(this.line(k));
      (byPath.get(l[0]) ?? byPath.set(l[0], []).get(l[0])).push(l);
    }
    const records = new Map([...byPath].map(([p, lines]) => [p, recordFrom(lines)]));
    const outs = new Map();
    const ins = new Map([...records.keys()].map((p) => [p, new Set()]));
    for (const [p, r] of records) {
      const o = [...new Set(r.edges.map((e) => e.to).filter((t) => t !== undefined && t !== p))].sort(comparePaths);
      outs.set(p, o);
      for (const t of o) ins.get(t)?.add(p);
    }
    const files = {};
    for (const [p, r] of records) files[p] = graphFileOf(location, p, r, outs.get(p), [...ins.get(p)].sort(comparePaths));
    return { ...location, files };
  }
}
