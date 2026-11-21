// Research of November 21, 2026 (not product code). The indexed ledger (d6-ledger-indexed.mjs, the same bytes) with a
// reader as careful as the press's, so that the form is measured at its best and not at its simplest reader's:
//   - each piece's paths are indexed once, the first time the piece is inflated: where each file's lines begin and end,
//     read from the line's first JSON string without parsing the rest;
//   - only the lines a question asks for are parsed;
//   - no piece's text is kept after it is read; a question that needs many files gathers them by piece and inflates each
//     piece once;
//   - loading the whole map keeps every string once, as the press does by construction (a string decoded once and the
//     same string object used wherever it is named).
import { comparePaths, decoder, graphFileOf, inflate } from "./common.mjs";
import { piecesOf } from "./d6-ledger-indexed.mjs";
import { recordFrom } from "./ledger-core.mjs";
export { encode, writer } from "./d6-ledger-indexed.mjs";

export const name = "indexed ledger, careful reader";

/** The first JSON string of a line, which is its path, read without parsing the rest. */
function pathAt(text, start) {
  let i = start + 2;
  let escaped = false;
  while (text.charCodeAt(i) !== 34) {
    if (text.charCodeAt(i) === 92) { escaped = true; i += 2; } else i += 1;
  }
  return escaped ? JSON.parse(text.slice(start + 1, i + 1)) : text.slice(start + 2, i);
}

/** Where each path's lines lie in a piece's text: paths in order, and their [start, end) offsets. */
function indexPiece(text) {
  const paths = [];
  const starts = [];
  const ends = [];
  let at = 0;
  while (at < text.length) {
    const end = text.indexOf("\n", at);
    const lineEnd = end === -1 ? text.length : end;
    const p = pathAt(text, at);
    if (paths.length && paths[paths.length - 1] === p) ends[ends.length - 1] = lineEnd;
    else { paths.push(p); starts.push(at); ends.push(lineEnd); }
    at = lineEnd + 1;
  }
  return { paths, starts, ends };
}

function interner() {
  const seen = new Map();
  const deep = (v) => {
    if (typeof v === "string") {
      const s = seen.get(v);
      if (s !== undefined) return s;
      seen.set(v, v);
      return v;
    }
    if (Array.isArray(v)) { for (let i = 0; i < v.length; i += 1) v[i] = deep(v[i]); return v; }
    if (v && typeof v === "object") { for (const k of Object.keys(v)) v[k] = deep(v[k]); return v; }
    return v;
  };
  return deep;
}

export async function open(bytes) {
  const pieces = piecesOf(bytes);
  const location = pieces.find((p) => p.kind === "head").location;
  const lines = pieces.filter((p) => p.kind === "lines");
  const inbound = pieces.filter((p) => p.kind === "inbound");
  const indexes = new Map();
  const textOf = async (piece) => {
    const text = decoder.decode(await inflate(bytes.subarray(piece.bodyAt, piece.bodyAt + piece.size), "deflate-raw"));
    if (!indexes.has(piece)) indexes.set(piece, indexPiece(text));
    return text;
  };
  const pieceFor = (list, path) => {
    let lo = 0;
    let hi = list.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (comparePaths(list[mid].first, path) <= 0) lo = mid;
      else hi = mid - 1;
    }
    return list[lo];
  };
  const find = (index, path) => {
    let lo = 0;
    let hi = index.paths.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const c = comparePaths(index.paths[mid], path);
      if (c === 0) return mid;
      if (c < 0) lo = mid + 1;
      else hi = mid - 1;
    }
    return -1;
  };
  const linesIn = (text, index, k) => text.slice(index.starts[k], index.ends[k]).split("\n");
  /** The parsed lines of each path asked for, each piece inflated once; `keep` picks the lines worth parsing. */
  const gather = async (list, pieceList, keep = () => true) => {
    const byPiece = new Map();
    for (const p of list) {
      const piece = pieceFor(pieceList, p);
      (byPiece.get(piece) ?? byPiece.set(piece, []).get(piece)).push(p);
    }
    const out = new Map();
    for (const [piece, paths] of byPiece) {
      const text = await textOf(piece);
      const index = indexes.get(piece);
      for (const p of paths) {
        const k = find(index, p);
        out.set(p, k === -1 ? [] : linesIn(text, index, k).filter(keep).map((l) => JSON.parse(l)));
      }
    }
    return out;
  };
  const isEdge = (line) => line.charCodeAt(line.indexOf('",') + 3) === 71; // the letter after the path is "G"
  const outboundOf = (path, parsed) => [...new Set(parsed.filter((l) => l[1] === "G" && l[6] !== null && l[6] !== path).map((l) => l[6]))].sort(comparePaths);
  // The wires out of every file of a piece, read once from its edge lines when any of its files is first asked about,
  // and kept: an index like the paths', not the text, so a walk inflates each piece at most once.
  const wires = new Map();
  const wiresOf = async (paths) => {
    const missing = [...new Set(paths.filter((p) => !wires.has(p)).map((p) => pieceFor(lines, p)))];
    for (const piece of missing) {
      const text = await textOf(piece);
      const index = indexes.get(piece);
      for (let k = 0; k < index.paths.length; k += 1) {
        const p = index.paths[k];
        wires.set(p, outboundOf(p, linesIn(text, index, k).filter(isEdge).map((l) => JSON.parse(l))));
      }
    }
    return paths.map((p) => wires.get(p) ?? []);
  };
  return {
    paths: async () => {
      const out = [];
      for (const p of lines) { if (!indexes.has(p)) await textOf(p); out.push(...indexes.get(p).paths); }
      return out;
    },
    inbound: async (path) => {
      if (!inbound.length || comparePaths(path, inbound[0].first) < 0) return [];
      const found = (await gather([path], inbound)).get(path);
      return found.length ? found[0][2] : [];
    },
    outbound: async (path) => (await wiresOf([path]))[0],
    reachable: async (path) => {
      const seen = new Set([path]);
      const order = [path];
      let frontier = [path];
      while (frontier.length) {
        const outs = await wiresOf(frontier);
        const next = [];
        frontier.forEach((p, i) => { for (const q of outs[i]) if (!seen.has(q)) { seen.add(q); order.push(q); next.push(q); } });
        frontier = next;
      }
      return order;
    },
    records: async (list) => {
      const parsed = await gather(list, lines);
      return list.map((p) => recordFrom(parsed.get(p)));
    },
    all: async () => {
      const intern = interner();
      const ins = new Map();
      for (const piece of inbound) {
        const text = await textOf(piece);
        for (const l of text.split("\n")) if (l) { const v = intern(JSON.parse(l)); ins.set(v[0], v[2]); }
      }
      const files = {};
      for (const piece of lines) {
        const text = await textOf(piece);
        const index = indexes.get(piece);
        for (let k = 0; k < index.paths.length; k += 1) {
          const path = index.paths[k];
          const r = recordFrom(linesIn(text, index, k).map((l) => intern(JSON.parse(l))));
          const o = [...new Set(r.edges.map((e) => e.to).filter((x) => x !== undefined && x !== path))].sort(comparePaths);
          files[path] = graphFileOf(location, path, r, o, ins.get(path) ?? []);
        }
      }
      return { ...location, files };
    }
  };
}
