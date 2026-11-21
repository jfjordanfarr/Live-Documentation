// Research of November 21, 2026 (not product code). The press written as the facts arrive, one file at a time in path
// order, without holding them: strings take their ids as they are first met (press/1 orders them by frequency, which
// needs every record first), each block of 4,096 new strings and each chunk of 256 records is compressed and set down
// as soon as it fills, and the table of where everything lies is written last, as a footer, with the paths and the
// adjacency. What is held until the end: the table of distinct strings, the paths and the outbound wires as numbers.
//
//   "LDP2" | frames, each deflate-raw, in the order written | footer (JSON) | u32 footer length | "LDP2"
import { Bytes, comparePaths, compress, concat, decoder, encoder, u32Array, u32Bytes } from "./common.mjs";
import { put, reader, stringList } from "./d1-press.mjs";

export const name = "press, written as facts arrive";
const CHUNK = 256;
const BLOCK = 4096;
const MAGIC = encoder.encode("LDP2");

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

/** A writer the facts are handed to file by file, in path order; `finish` returns the file's bytes. */
export function writer(location) {
  const frames = [];
  const footer = { format: "press/2", location, block: BLOCK, chunk: CHUNK, frames: [] };
  const ids = new Map();
  let pending = [];
  const paths = [];
  const outbound = []; // per file, the string ids of the paths it is wired to
  let body = new Bytes(1 << 18);
  let offsets = [0];
  let chunkFirst = 0;
  let stringsWritten = 0;
  const frame = async (kind, raw, extra) => {
    const packed = await compress(raw, "deflate-raw");
    frames.push(packed);
    footer.frames.push({ kind, size: packed.length, ...extra });
  };
  const flushStrings = async (all) => {
    while (pending.length >= BLOCK || (all && pending.length)) {
      const block = pending.slice(0, BLOCK);
      pending = pending.slice(block.length);
      await frame("strings", stringList(block), { first: stringsWritten, count: block.length });
      stringsWritten += block.length;
    }
  };
  const flushChunk = async () => {
    if (offsets.length === 1) return;
    await frame("records", concat([u32Bytes(offsets), body.done()]), { first: chunkFirst, count: offsets.length - 1 });
    chunkFirst += offsets.length - 1;
    body = new Bytes(1 << 18);
    offsets = [0];
  };
  return {
    async add(path, record, out) {
      if (paths.length && comparePaths(paths[paths.length - 1], path) >= 0) throw new Error(`facts out of path order at ${path}`);
      paths.push(path);
      intern(record, ids, pending);
      for (const p of out) intern(p, ids, pending);
      outbound.push(out.map((p) => ids.get(p)));
      put(body, record, ids);
      offsets.push(body.len);
      if (offsets.length - 1 === CHUNK) await flushChunk();
      await flushStrings(false);
    },
    async finish() {
      await flushChunk();
      await flushStrings(true);
      const index = new Map(paths.map((p, i) => [ids.get(p) ?? -1 - i, i]));
      // A path no record named has no string id; it is wired to nothing that names it, so -1 - i never matches a target.
      const oo = [0];
      const ot = [];
      const inLists = paths.map(() => []);
      outbound.forEach((targets, i) => {
        for (const t of targets) {
          const j = index.get(t);
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
      await frame("paths", stringList(paths), {});
      await frame("adjacency", concat([u32Bytes([ot.length, it.length]), u32Bytes(oo), u32Bytes(ot), u32Bytes(io), u32Bytes(it)]), {});
      footer.files = paths.length;
      footer.strings = stringsWritten;
      const footerBytes = encoder.encode(JSON.stringify(footer));
      return concat([MAGIC, ...frames, footerBytes, u32Bytes([footerBytes.length]), MAGIC]);
    }
  };
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
  const footerLength = u32Array(bytes, bytes.length - 8, 1)[0];
  const footer = JSON.parse(decoder.decode(bytes.subarray(bytes.length - 8 - footerLength, bytes.length - 8)));
  let at = MAGIC.length;
  const sections = { blocks: [], chunks: [] };
  for (const f of footer.frames) {
    const place = { at, size: f.size };
    at += f.size;
    if (f.kind === "strings") sections.blocks.push(place);
    else if (f.kind === "records") sections.chunks.push(place);
    else if (f.kind === "paths") sections.pathsSection = place;
    else sections.adjacencySection = place;
  }
  return reader(bytes, footer, sections);
}
