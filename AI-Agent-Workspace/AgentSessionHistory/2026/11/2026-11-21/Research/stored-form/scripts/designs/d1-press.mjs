// Research of November 21, 2026 (not product code). "The press": a binary layout of our own, read with nothing but
// what a browser already has (DecompressionStream, DataView, TextDecoder).
//
//   "LDP1" | u32 header length | header (JSON: where every section lies) | sections, each deflate-raw on its own
//
// Sections:
//   paths       every file's path, sorted, each as a varint length and its UTF-8 bytes;
//   adjacency   outbound and inbound as compressed sparse rows over file indices (u32 little-endian): zero parse;
//   strings     every other string once, most frequent first, in blocks of 4,096, so a record reads only the blocks
//               its own strings fall in;
//   records     each file's record (symbols, dependencies, edges, words ...) in a tagged varint encoding whose
//               strings are ids, in chunks of 256 files, each chunk with an offset per file.
// A question inflates only the sections it reads: "what depends on this" and "what is reachable" the paths and the
// adjacency; a file's neighbourhood the chunks and string blocks of those files. The bytes are fixed by the facts:
// every order is the path order or the strings' frequency, ties broken by first appearance.
import { Bytes, Cursor, comparePaths, compress, concat, decoder, encoder, findPath, graphFileOf, inflate, recordOf, u32Array, u32Bytes, walk } from "./common.mjs";

export const name = "press";
const CHUNK = 256;
const BLOCK = 4096;
const MAGIC = encoder.encode("LDP1");

// Tags in the low three bits of each varint; the payload above them.
const NULLISH = 0, BOOL = 1, UINT = 2, NEGINT = 3, STRING = 4, ARRAY = 5, OBJECT = 6, FLOAT = 7;

function countStrings(value, counts, order) {
  if (typeof value === "string") {
    if (!counts.has(value)) order.push(value);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  } else if (Array.isArray(value)) {
    for (const v of value) countStrings(v, counts, order);
  } else if (value && typeof value === "object") {
    for (const k of Object.keys(value)) {
      if (value[k] === undefined) continue;
      countStrings(k, counts, order);
      countStrings(value[k], counts, order);
    }
  }
}

function put(out, value, ids) {
  if (value === null || value === undefined) out.varint(NULLISH);
  else if (typeof value === "boolean") out.varint((value ? 1 : 0) * 8 + BOOL);
  else if (typeof value === "number") {
    if (Number.isInteger(value) && value >= 0) out.varint(value * 8 + UINT);
    else if (Number.isInteger(value)) out.varint(-value * 8 + NEGINT);
    else {
      out.varint(FLOAT);
      const b = new Uint8Array(8);
      new DataView(b.buffer).setFloat64(0, value, true);
      out.bytes(b);
    }
  } else if (typeof value === "string") out.varint(ids.get(value) * 8 + STRING);
  else if (Array.isArray(value)) {
    out.varint(value.length * 8 + ARRAY);
    for (const v of value) put(out, v, ids);
  } else {
    const keys = Object.keys(value).filter((k) => value[k] !== undefined);
    out.varint(keys.length * 8 + OBJECT);
    for (const k of keys) {
      out.varint(ids.get(k));
      put(out, value[k], ids);
    }
  }
}

/** Walks one encoded value, collecting the ids of the strings it names. */
function scan(cursor, needed) {
  const v = cursor.varint();
  const tag = v % 8;
  const payload = Math.floor(v / 8);
  if (tag === STRING) needed.add(payload);
  else if (tag === FLOAT) cursor.at += 8;
  else if (tag === ARRAY) for (let i = 0; i < payload; i += 1) scan(cursor, needed);
  else if (tag === OBJECT) for (let i = 0; i < payload; i += 1) { needed.add(cursor.varint()); scan(cursor, needed); }
}

function take(cursor, str) {
  const v = cursor.varint();
  const tag = v % 8;
  const payload = Math.floor(v / 8);
  switch (tag) {
    case NULLISH: return null;
    case BOOL: return payload === 1;
    case UINT: return payload;
    case NEGINT: return -payload;
    case STRING: return str(payload);
    case FLOAT: { const x = new DataView(cursor.b.buffer, cursor.b.byteOffset + cursor.at, 8).getFloat64(0, true); cursor.at += 8; return x; }
    case ARRAY: { const a = new Array(payload); for (let i = 0; i < payload; i += 1) a[i] = take(cursor, str); return a; }
    default: { const o = {}; for (let i = 0; i < payload; i += 1) { const k = str(cursor.varint()); o[k] = take(cursor, str); } return o; }
  }
}

function stringList(list) {
  const out = new Bytes(1 << 16);
  for (const s of list) {
    const b = encoder.encode(s);
    out.varint(b.length);
    out.bytes(b);
  }
  return out.done();
}

function readStringList(bytes, count) {
  const c = new Cursor(bytes);
  const out = new Array(count);
  for (let i = 0; i < count; i += 1) {
    const n = c.varint();
    out[i] = decoder.decode(bytes.subarray(c.at, c.at + n));
    c.at += n;
  }
  return out;
}

export async function encode(graph) {
  const paths = Object.keys(graph.files).sort(comparePaths);
  const records = paths.map((p) => recordOf(graph.files[p]));
  const counts = new Map();
  const order = [];
  for (const r of records) countStrings(r, counts, order);
  const firstSeen = new Map(order.map((s, i) => [s, i]));
  const strings = [...order].sort((a, b) => counts.get(b) - counts.get(a) || firstSeen.get(a) - firstSeen.get(b));
  const ids = new Map(strings.map((s, i) => [s, i]));

  const sections = [];
  const header = { format: "press/1", location: { root: graph.root, baseLayer: graph.baseLayer, extension: graph.extension }, files: paths.length, strings: strings.length, block: BLOCK, chunk: CHUNK, sections: {} };
  const add = async (key, raw) => {
    const packed = await compress(raw, "deflate-raw");
    sections.push(packed);
    return { size: packed.length, raw: raw.length };
  };
  header.sections.paths = await add("paths", stringList(paths));
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
  header.sections.adjacency = await add("adjacency", concat([u32Bytes([ot.length, it.length]), u32Bytes(oo), u32Bytes(ot), u32Bytes(io), u32Bytes(it)]));
  header.sections.stringBlocks = [];
  for (let first = 0; first < strings.length; first += BLOCK) header.sections.stringBlocks.push(await add("strings", stringList(strings.slice(first, first + BLOCK))));
  header.sections.chunks = [];
  for (let first = 0; first < paths.length; first += CHUNK) {
    const body = new Bytes(1 << 18);
    const offsets = [0];
    for (const r of records.slice(first, first + CHUNK)) {
      put(body, r, ids);
      offsets.push(body.len);
    }
    header.sections.chunks.push(await add("records", concat([u32Bytes(offsets), body.done()])));
  }
  const headerBytes = encoder.encode(JSON.stringify(header));
  return concat([MAGIC, u32Bytes([headerBytes.length]), headerBytes, ...sections]);
}

export async function open(bytes) {
  const headerLength = u32Array(bytes, 4, 1)[0];
  const header = JSON.parse(decoder.decode(bytes.subarray(8, 8 + headerLength)));
  // Where each section begins, in the order encode wrote them.
  let at = 8 + headerLength;
  const place = (s) => { const p = { ...s, at }; at += s.size; return p; };
  const pathsSection = place(header.sections.paths);
  const adjacencySection = place(header.sections.adjacency);
  const blocks = header.sections.stringBlocks.map(place);
  const chunks = header.sections.chunks.map(place);
  const raw = (s) => inflate(bytes.subarray(s.at, s.at + s.size), "deflate-raw");

  let paths;
  let adjacency;
  const blockCache = new Map();
  const chunkCache = new Map();
  const getPaths = async () => (paths ??= readStringList(await raw(pathsSection), header.files));
  const getAdjacency = async () => {
    if (adjacency) return adjacency;
    const b = await raw(adjacencySection);
    const [outCount, inCount] = u32Array(b, 0, 2);
    const n = header.files + 1;
    let p = 8;
    const oo = u32Array(b, p, n); p += n * 4;
    const ot = u32Array(b, p, outCount); p += outCount * 4;
    const io = u32Array(b, p, n); p += n * 4;
    const it = u32Array(b, p, inCount);
    return (adjacency = { oo, ot, io, it });
  };
  const loadBlock = async (k) => {
    if (!blockCache.has(k)) blockCache.set(k, readStringList(await raw(blocks[k]), Math.min(header.block, header.strings - k * header.block)));
    return blockCache.get(k);
  };
  const str = (id) => blockCache.get(Math.floor(id / header.block))[id % header.block];
  const loadChunk = async (k) => {
    if (!chunkCache.has(k)) {
      const b = await raw(chunks[k]);
      const count = Math.min(header.chunk, header.files - k * header.chunk);
      chunkCache.set(k, { offsets: u32Array(b, 0, count + 1), body: b.subarray((count + 1) * 4) });
    }
    return chunkCache.get(k);
  };
  const recordsAt = async (indices) => {
    const located = [];
    for (const i of indices) {
      const chunk = await loadChunk(Math.floor(i / header.chunk));
      located.push({ chunk, j: i % header.chunk });
    }
    const needed = new Set();
    for (const { chunk, j } of located) scan(new Cursor(chunk.body, chunk.offsets[j]), needed);
    const wanted = new Set([...needed].map((id) => Math.floor(id / header.block)));
    for (const k of wanted) await loadBlock(k);
    return located.map(({ chunk, j }) => take(new Cursor(chunk.body, chunk.offsets[j]), str));
  };
  const slice = (offsets, targets, i) => targets.subarray(offsets[i], offsets[i + 1]);
  const indexOf = async (path) => findPath(await getPaths(), path);

  return {
    paths: getPaths,
    inbound: async (path) => {
      const [ps, a] = [await getPaths(), await getAdjacency()];
      return [...slice(a.io, a.it, await indexOf(path))].map((i) => ps[i]);
    },
    outbound: async (path) => {
      const [ps, a] = [await getPaths(), await getAdjacency()];
      return [...slice(a.oo, a.ot, await indexOf(path))].map((i) => ps[i]);
    },
    reachable: async (path) => {
      const [ps, a] = [await getPaths(), await getAdjacency()];
      return walk(await indexOf(path), (i) => slice(a.oo, a.ot, i)).map((i) => ps[i]);
    },
    records: async (list) => {
      const ps = await getPaths();
      return recordsAt(list.map((p) => findPath(ps, p)));
    },
    all: async () => {
      const [ps, a] = [await getPaths(), await getAdjacency()];
      const records = await recordsAt(ps.map((_, i) => i));
      const files = {};
      ps.forEach((p, i) => {
        files[p] = graphFileOf(header.location, p, records[i], [...slice(a.oo, a.ot, i)].map((k) => ps[k]), [...slice(a.io, a.it, i)].map((k) => ps[k]));
      });
      return { ...header.location, files };
    }
  };
}
