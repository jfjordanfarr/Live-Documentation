// Research of November 21, 2026 (not product code). The press made resumable and self-naming (press/3): the press
// written as facts arrive (d1s-press-stream.mjs), with two changes.
//
// 1. Every section is a frame that says what it is: one byte of kind, its body's length, and for strings and records
//    the first id and the count. A reader can hop from frame to frame without the footer, so a file cut anywhere is
//    readable up to its last whole frame, and a writer can go on from there.
// 2. The footer names the content: the SHA-256 of the SHA-256s of every section's uncompressed bytes, in order. Two
//    scans hold the same facts when their names agree, read from the footers alone.
//
// So that a cut file is always whole up to a chunk of records, the strings first met in a chunk are set down just before
// that chunk; and every chunk carries its own files' paths and outbound wires, so the paths and the adjacency written
// at the end can be rebuilt from the chunks when a scan goes on.
//
//   "LDP3" | frames | u32 offset of the footer frame | "LDP3"
//   frame: u8 kind | u32 body length | varint a | varint b | body
//   kinds: 0 head (location, JSON), 1 strings (a first id, b count), 2 records (a first file, b count),
//          3 paths, 4 adjacency, 5 footer (JSON)
import { Bytes, Cursor, comparePaths, compress, concat, decoder, encoder, inflate, sha256Hex, u32Array, u32Bytes } from "./common.mjs";
import { put, reader, stringList, readStringList } from "./d1-press.mjs";

export const name = "press, resumable and self-naming";
const CHUNK = 256;
const MAGIC = encoder.encode("LDP3");
const HEAD = 0, STRINGS = 1, RECORDS = 2, PATHS = 3, ADJACENCY = 4, FOOTER = 5;

function intern(value, ids, pending) {
  if (typeof value === "string") {
    if (!ids.has(value)) {
      ids.set(value, ids.size);
      pending.push(value);
    }
  } else if (Array.isArray(value)) {
    for (const v of value) intern(v, ids, pending);
  } else if (value && typeof value === "object") {
    for (const k of Object.keys(value)) {
      if (value[k] === undefined) continue;
      intern(k, ids, pending);
      intern(value[k], ids, pending);
    }
  }
}

function frameBytes(kind, body, a = 0, b = 0) {
  const label = new Bytes(16);
  label.varint(a);
  label.varint(b);
  return concat([new Uint8Array([kind]), u32Bytes([body.length]), label.done(), body]);
}

/** Every whole frame of a file or of a cut prefix of one, in order, by hopping their labels. */
export function framesOf(bytes) {
  const out = [];
  let at = MAGIC.length;
  while (at + 5 <= bytes.length) {
    const kind = bytes[at];
    const size = u32Array(bytes, at + 1, 1)[0];
    const c = new Cursor(bytes, at + 5);
    const a = c.varint();
    const b = c.varint();
    const bodyAt = c.at;
    if (bodyAt + size > bytes.length) break;
    out.push({ kind, a, b, at, bodyAt, size, end: bodyAt + size });
    at = bodyAt + size;
    if (kind === FOOTER) break;
  }
  return out;
}

function encodeChunkBody(pathIds, outboundIds, offsets, body) {
  const head = new Bytes(1 << 12);
  for (const id of pathIds) head.varint(id);
  for (const list of outboundIds) {
    head.varint(list.length);
    for (const id of list) head.varint(id);
  }
  return concat([head.done(), u32Bytes(offsets), body]);
}

function decodeChunkHeader(raw, count) {
  const c = new Cursor(raw);
  const pathIds = [];
  for (let i = 0; i < count; i += 1) pathIds.push(c.varint());
  const outboundIds = [];
  for (let i = 0; i < count; i += 1) {
    const n = c.varint();
    const list = [];
    for (let k = 0; k < n; k += 1) list.push(c.varint());
    outboundIds.push(list);
  }
  return { pathIds, outboundIds, offsetsAt: c.at };
}

/**
 * A writer the facts are handed to file by file, in path order. `onFrame(bytes)` is told of every frame as it is set
 * down, so a host can keep it (a file appended to, IndexedDB). `state` is what `resumeFrom` found in a cut file.
 */
export function writer(location, { onFrame, state } = {}) {
  const frames = state ? [...state.frames] : [];
  const sectionHashes = state ? [...state.sectionHashes] : [];
  const ids = state ? state.ids : new Map();
  let pending = [];
  const paths = state ? state.paths : [];
  const outbound = state ? state.outbound : [];
  let stringsWritten = state ? state.stringsWritten : 0;
  let chunkFirst = state ? state.files : 0;
  let body = new Bytes(1 << 18);
  let offsets = [0];
  let chunkPathIds = [];
  let chunkOutbound = [];
  const set = async (kind, raw, a, b, packed = true) => {
    sectionHashes.push(await sha256Hex(raw));
    const bytes = frameBytes(kind, packed ? await compress(raw, "deflate-raw") : raw, a, b);
    frames.push(bytes);
    if (onFrame) await onFrame(bytes);
  };
  const ready = state ? Promise.resolve() : set(HEAD, encoder.encode(JSON.stringify(location)), 0, 0, false);
  const flushChunk = async () => {
    if (offsets.length === 1) return;
    if (pending.length) {
      await set(STRINGS, stringList(pending), stringsWritten, pending.length);
      stringsWritten += pending.length;
      pending = [];
    }
    const count = offsets.length - 1;
    await set(RECORDS, encodeChunkBody(chunkPathIds, chunkOutbound, offsets, body.done()), chunkFirst, count);
    chunkFirst += count;
    body = new Bytes(1 << 18);
    offsets = [0];
    chunkPathIds = [];
    chunkOutbound = [];
  };
  return {
    files: () => chunkFirst + offsets.length - 1,
    async add(path, record, out) {
      await ready;
      if (paths.length && comparePaths(paths[paths.length - 1], path) >= 0) throw new Error(`facts out of path order at ${path}`);
      paths.push(path);
      intern(path, ids, pending);
      intern(record, ids, pending);
      for (const p of out) intern(p, ids, pending);
      const o = out.map((p) => ids.get(p));
      outbound.push(o);
      chunkPathIds.push(ids.get(path));
      chunkOutbound.push(o);
      put(body, record, ids);
      offsets.push(body.len);
      if (offsets.length - 1 === CHUNK) await flushChunk();
    },
    async finish() {
      await ready;
      await flushChunk();
      const fileIndex = new Map(paths.map((p, i) => [ids.get(p), i]));
      const oo = [0];
      const ot = [];
      const inLists = paths.map(() => []);
      outbound.forEach((targets, i) => {
        for (const t of targets) {
          const j = fileIndex.get(t);
          ot.push(j);
          inLists[j].push(i);
        }
        oo.push(ot.length);
      });
      const io = [0];
      const it = [];
      for (const list of inLists) {
        it.push(...list);
        io.push(it.length);
      }
      await set(PATHS, stringList(paths), 0, 0);
      await set(ADJACENCY, concat([u32Bytes([ot.length, it.length]), u32Bytes(oo), u32Bytes(ot), u32Bytes(io), u32Bytes(it)]), 0, 0);
      const name = await sha256Hex(encoder.encode(sectionHashes.join("\n")));
      const before = frames.reduce((n, f) => n + f.length, MAGIC.length);
      const footer = encoder.encode(JSON.stringify({ format: "press/3", location, files: paths.length, strings: stringsWritten, chunk: CHUNK, name }));
      const footerFrame = frameBytes(FOOTER, footer);
      frames.push(footerFrame);
      if (onFrame) await onFrame(footerFrame);
      const tail = concat([u32Bytes([before]), MAGIC]);
      if (onFrame) await onFrame(tail);
      return concat([MAGIC, ...frames, tail]);
    }
  };
}

/**
 * What a cut file holds, and the state a writer needs to go on from its last whole chunk of records: the bytes to keep
 * (the cut file shortened to that chunk's end), how many files they hold, and the last path.
 */
export async function resumeFrom(bytes) {
  const frames = framesOf(bytes);
  let lastRecords = -1;
  frames.forEach((f, i) => { if (f.kind === RECORDS) lastRecords = i; });
  const kept = frames.slice(0, lastRecords + 1).filter((f) => f.kind === HEAD || f.kind === STRINGS || f.kind === RECORDS);
  const head = kept.find((f) => f.kind === HEAD);
  if (!head) return null;
  const location = JSON.parse(decoder.decode(bytes.subarray(head.bodyAt, head.end)));
  const ids = new Map();
  const strings = [];
  const paths = [];
  const outbound = [];
  const sectionHashes = [];
  let stringsWritten = 0;
  let files = 0;
  for (const f of kept) {
    const raw = f.kind === HEAD ? bytes.subarray(f.bodyAt, f.end) : await inflate(bytes.subarray(f.bodyAt, f.end), "deflate-raw");
    sectionHashes.push(await sha256Hex(raw));
    if (f.kind === STRINGS) {
      for (const s of readStringList(raw, f.b)) { ids.set(s, ids.size); strings.push(s); }
      stringsWritten += f.b;
    } else if (f.kind === RECORDS) {
      const { pathIds, outboundIds } = decodeChunkHeader(raw, f.b);
      for (const id of pathIds) paths.push(strings[id]);
      outbound.push(...outboundIds);
      files += f.b;
    }
  }
  const end = kept.length ? kept[kept.length - 1].end : MAGIC.length;
  return {
    location,
    keptBytes: end,
    state: { frames: kept.map((f) => bytes.slice(f.at, f.end)), sectionHashes, ids, paths, outbound, stringsWritten, files },
    files,
    lastPath: paths[paths.length - 1]
  };
}

/** The content's name, from the footer alone. */
export function nameOf(bytes) {
  const at = u32Array(bytes, bytes.length - 8, 1)[0];
  const f = framesOf(concat([MAGIC, bytes.subarray(at)]))[0];
  const footerAt = at + (f.bodyAt - MAGIC.length);
  return JSON.parse(decoder.decode(bytes.subarray(footerAt, footerAt + f.size))).name;
}

export async function encode(graph) {
  const w = writer({ root: graph.root, baseLayer: graph.baseLayer, extension: graph.extension });
  for (const p of Object.keys(graph.files).sort(comparePaths)) {
    const { codePath, docPath, outbound, inbound, ...record } = graph.files[p];
    void codePath; void docPath; void inbound;
    await w.add(p, record, outbound);
  }
  return w.finish();
}

export async function open(bytes) {
  const frames = framesOf(bytes);
  const footer = frames.find((f) => f.kind === FOOTER);
  const header = JSON.parse(decoder.decode(bytes.subarray(footer.bodyAt, footer.end)));
  const place = (f) => ({ at: f.bodyAt, size: f.size, first: f.a, count: f.b });
  const blocks = frames.filter((f) => f.kind === STRINGS).map(place);
  const chunks = frames.filter((f) => f.kind === RECORDS).map(place);
  // Blocks hold different numbers of strings, so a string's block is found by its first id; chunks likewise, and a
  // chunk's body begins with its paths and wires before the offsets the press's reader expects.
  return reader(bytes, header, {
    pathsSection: place(frames.find((f) => f.kind === PATHS)),
    adjacencySection: place(frames.find((f) => f.kind === ADJACENCY)),
    blocks,
    chunks
  }, async (s) => {
    const raw = await inflate(bytes.subarray(s.at, s.at + s.size), "deflate-raw");
    if (s.count !== undefined && chunks.includes(s)) {
      const { offsetsAt } = decodeChunkHeader(raw, s.count);
      return raw.subarray(offsetsAt);
    }
    return raw;
  });
}
