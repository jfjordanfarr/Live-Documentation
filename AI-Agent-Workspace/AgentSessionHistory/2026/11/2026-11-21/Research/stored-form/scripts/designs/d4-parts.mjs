// Research of November 21, 2026 (not product code). "The store of parts": a scan's facts cut by directory, each part
// the ledger lines of one directory's files, named by the SHA-256 of those lines, compressed on its own. A scan is a
// manifest (its paths, its parts' names and its adjacency); many scans and many moments of one repository keep one
// pool of parts, so a part that did not change between two commits is held once and two manifests that name the same
// part say, without reading it, that those files did not change.
//
//   "LDK1" | u32 header length | header (JSON) | adjacency (deflate-raw, u32 CSR) | parts (deflate-raw each)
//
// The header names every moment it holds: one for a scan's file, several for a history or an estate.
import { Cursor, Bytes, comparePaths, compress, concat, decoder, encoder, findPath, graphFileOf, inflate, sha256Hex, u32Array, u32Bytes, walk } from "./common.mjs";
import { LedgerText, ledgerBytes, recordFrom } from "./ledger-core.mjs";

export const name = "parts";
const MAGIC = encoder.encode("LDK1");

const directoryOf = (p) => p.slice(0, Math.max(0, p.lastIndexOf("/")));

/** Cuts one graph into parts and its manifest; parts are returned by hash with their raw bytes. */
export async function cut(graph) {
  const paths = Object.keys(graph.files).sort(comparePaths);
  // One part per directory. A directory's files need not lie together in path order ("a/b.ts" < "a/b/c.ts" <
  // "a/c.ts"), so they are gathered by name, and parts are listed in the order of their directories.
  const byDir = new Map();
  for (const p of paths) {
    const d = directoryOf(p);
    (byDir.get(d) ?? byDir.set(d, []).get(d)).push(p);
  }
  const groups = [...byDir.keys()].sort(comparePaths).map((dir) => ({ dir, paths: byDir.get(dir) }));
  const parts = new Map();
  const manifestParts = [];
  for (const g of groups) {
    const raw = ledgerBytes(graph, g.paths);
    const hash = await sha256Hex(raw);
    parts.set(hash, raw);
    manifestParts.push({ dir: g.dir, hash, count: g.paths.length });
  }
  const index = new Map(paths.map((p, i) => [p, i]));
  const csr = (key) => {
    const offsets = [0];
    const targets = [];
    for (const p of paths) {
      for (const q of graph.files[p][key]) targets.push(index.get(q));
      offsets.push(targets.length);
    }
    return [offsets, targets];
  };
  const [oo, ot] = csr("outbound");
  const [io, it] = csr("inbound");
  const adjacency = concat([u32Bytes([ot.length, it.length]), u32Bytes(oo), u32Bytes(ot), u32Bytes(io), u32Bytes(it)]);
  return { manifest: { location: { root: graph.root, baseLayer: graph.baseLayer, extension: graph.extension }, paths, parts: manifestParts }, adjacency, parts };
}

/** Writes one or more moments into one file, every distinct part once. */
export async function pack(moments) {
  const pool = new Map();
  const header = { format: "parts/1", moments: [], parts: [] };
  const sections = [];
  for (const m of moments) {
    const packed = await compress(m.adjacency, "deflate-raw");
    sections.push(packed);
    header.moments.push({ ...m.manifest, adjacency: { size: packed.length } });
    for (const [hash, raw] of m.parts) if (!pool.has(hash)) pool.set(hash, raw);
  }
  // Parts in the order of their hashes: the same set of parts is the same bytes whatever moment brought it.
  for (const hash of [...pool.keys()].sort()) {
    const packed = await compress(pool.get(hash), "deflate-raw");
    sections.push(packed);
    header.parts.push({ hash, size: packed.length });
  }
  const headerBytes = encoder.encode(JSON.stringify(header));
  return concat([MAGIC, u32Bytes([headerBytes.length]), headerBytes, ...sections]);
}

export async function encode(graph) {
  return pack([await cut(graph)]);
}

/** Opens a file of parts; `moment` picks which of its moments the reader answers for. */
export async function open(bytes, _path, moment = 0) {
  const headerLength = u32Array(bytes, 4, 1)[0];
  const header = JSON.parse(decoder.decode(bytes.subarray(8, 8 + headerLength)));
  let at = 8 + headerLength;
  const adjacencyAt = header.moments.map((m) => { const p = { at, size: m.adjacency.size }; at += m.adjacency.size; return p; });
  const partAt = new Map(header.parts.map((p) => { const q = { at, size: p.size }; at += p.size; return [p.hash, q]; }));
  const partCache = new Map();
  const part = async (hash) => {
    if (!partCache.has(hash)) {
      const { at: a, size } = partAt.get(hash);
      partCache.set(hash, new LedgerText(decoder.decode(await inflate(bytes.subarray(a, a + size), "deflate-raw"))));
    }
    return partCache.get(hash);
  };
  const m = header.moments[moment];
  const paths = m.paths;
  // Which part holds each file: the part of its directory.
  const partOfDir = new Map(m.parts.map((p, j) => [p.dir, j]));
  const partOfFile = Uint32Array.from(paths, (p) => partOfDir.get(directoryOf(p)));
  let adjacency;
  const getAdjacency = async () => {
    if (adjacency) return adjacency;
    const { at: a, size } = adjacencyAt[moment];
    const b = await inflate(bytes.subarray(a, a + size), "deflate-raw");
    const [outCount, inCount] = u32Array(b, 0, 2);
    const n = paths.length + 1;
    let p = 8;
    const oo = u32Array(b, p, n); p += n * 4;
    const ot = u32Array(b, p, outCount); p += outCount * 4;
    const io = u32Array(b, p, n); p += n * 4;
    const it = u32Array(b, p, inCount);
    return (adjacency = { oo, ot, io, it });
  };
  const slice = (offsets, targets, i) => targets.subarray(offsets[i], offsets[i + 1]);
  const recordOfPath = async (p) => recordFrom((await part(m.parts[partOfFile[findPath(paths, p)]].hash)).linesOf(p));
  void Cursor; void Bytes;
  return {
    header,
    manifest: m,
    part,
    paths: async () => paths,
    inbound: async (path) => { const a = await getAdjacency(); return [...slice(a.io, a.it, findPath(paths, path))].map((i) => paths[i]); },
    outbound: async (path) => { const a = await getAdjacency(); return [...slice(a.oo, a.ot, findPath(paths, path))].map((i) => paths[i]); },
    reachable: async (path) => { const a = await getAdjacency(); return walk(findPath(paths, path), (i) => slice(a.oo, a.ot, i)).map((i) => paths[i]); },
    records: async (list) => Promise.all(list.map(recordOfPath)),
    all: async () => {
      const a = await getAdjacency();
      const files = {};
      for (let i = 0; i < paths.length; i += 1) {
        const p = paths[i];
        files[p] = graphFileOf(m.location, p, await recordOfPath(p), [...slice(a.oo, a.ot, i)].map((x) => paths[x]), [...slice(a.io, a.it, i)].map((x) => paths[x]));
      }
      return { ...m.location, files };
    }
  };
}
