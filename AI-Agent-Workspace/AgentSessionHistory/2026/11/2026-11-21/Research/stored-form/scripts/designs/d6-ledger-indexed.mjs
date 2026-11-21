// Research of November 21, 2026 (not product code). "The indexed ledger": the ledger's lines, written as a run of gzip
// pieces, one per 256 files, each carrying in its gzip header (the optional "extra" field, RFC 1952 section 2.3.1,
// which gunzip ignores) the length of its compressed body, the first path it holds and how many files. A reader hops
// from header to header without inflating anything and then inflates only the pieces a question needs. After the
// files' pieces come pieces of "I" lines, `[path, "I", [the files that depend on it]]`, known only at the end, so that
// "what depends on X" is one line a person can grep for and one piece a page inflates.
//
// To `zcat`, `gzip -d` and `grep` the file is one text: the header line, every file's lines in path order, then the
// dependents' lines. A stopped write leaves every finished piece readable, and the scan can go on after the last.
import { comparePaths, compress, concat, decoder, encoder, graphFileOf, inflate, walk } from "./common.mjs";
import { LedgerText, linesOf, recordFrom } from "./ledger-core.mjs";

export const name = "indexed ledger";
const RANGE = 256;
const INBOUND_RANGE = 1024;

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
const le32 = (n) => new Uint8Array([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
const le16 = (n) => new Uint8Array([n & 0xff, (n >>> 8) & 0xff]);

/** One gzip member whose header's extra field holds `info` as JSON, with the body's compressed length added. */
async function member(info, raw) {
  const body = await compress(raw, "deflate-raw");
  const data = encoder.encode(JSON.stringify({ ...info, size: body.length }));
  const sub = concat([encoder.encode("LD"), le16(data.length), data]);
  const header = new Uint8Array([0x1f, 0x8b, 8, 4, 0, 0, 0, 0, 0, 255]);
  return concat([header, le16(sub.length), sub, body, le32(crc32(raw)), le32(raw.length >>> 0)]);
}

export function writer(location) {
  const pieces = [];
  let pending = [];
  let first;
  let count = 0;
  const paths = [];
  const outbound = [];
  const flush = async () => {
    if (!count) return;
    pieces.push(await member({ kind: "lines", first, count }, encoder.encode(`${pending.join("\n")}\n`)));
    pending = [];
    count = 0;
  };
  let started = false;
  return {
    async add(path, record, out) {
      if (!started) {
        pieces.push(await member({ kind: "head", location }, encoder.encode(`${JSON.stringify(["live-docs-ledger/2", location])}\n`)));
        started = true;
      }
      if (paths.length && comparePaths(paths[paths.length - 1], path) >= 0) throw new Error(`facts out of path order at ${path}`);
      if (!count) first = path;
      pending.push(...linesOf({ files: { [path]: record } }, [path]));
      count += 1;
      paths.push(path);
      outbound.push(out);
      if (count === RANGE) await flush();
    },
    /** What has been set down so far: what a file being appended to holds if the writing stops now. */
    emitted: () => concat(pieces),
    async finish() {
      await flush();
      const index = new Map(paths.map((p, i) => [p, i]));
      const dependents = paths.map(() => []);
      outbound.forEach((targets, i) => { for (const t of targets) dependents[index.get(t)].push(paths[i]); });
      const lines = [];
      paths.forEach((p, i) => { if (dependents[i].length) lines.push({ p, line: JSON.stringify([p, "I", dependents[i]]) }); });
      for (let k = 0; k < lines.length; k += INBOUND_RANGE) {
        const slice = lines.slice(k, k + INBOUND_RANGE);
        pieces.push(await member({ kind: "inbound", first: slice[0].p, count: slice.length }, encoder.encode(`${slice.map((x) => x.line).join("\n")}\n`)));
      }
      return concat(pieces);
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

/** The pieces of a file, found by hopping from one gzip header to the next; a cut last piece is left out. */
export function piecesOf(bytes) {
  const out = [];
  let at = 0;
  while (at + 12 <= bytes.length) {
    if (bytes[at] !== 0x1f || bytes[at + 1] !== 0x8b) break;
    const xlen = bytes[at + 10] | (bytes[at + 11] << 8);
    const dataLength = bytes[at + 14] | (bytes[at + 15] << 8);
    const info = JSON.parse(decoder.decode(bytes.subarray(at + 16, at + 16 + dataLength)));
    const bodyAt = at + 12 + xlen;
    const next = bodyAt + info.size + 8;
    if (next > bytes.length) break;
    out.push({ ...info, bodyAt });
    at = next;
  }
  return out;
}

export async function open(bytes) {
  const pieces = piecesOf(bytes);
  const location = pieces.find((p) => p.kind === "head").location;
  const lines = pieces.filter((p) => p.kind === "lines");
  const inbound = pieces.filter((p) => p.kind === "inbound");
  const cache = new Map();
  const text = async (piece) => {
    if (!cache.has(piece)) cache.set(piece, new LedgerText(decoder.decode(await inflate(bytes.subarray(piece.bodyAt, piece.bodyAt + piece.size), "deflate-raw"))));
    return cache.get(piece);
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
  const linesFor = async (path) => (await text(pieceFor(lines, path))).linesOf(path);
  const outboundOf = async (path) => [...new Set((await linesFor(path)).filter((l) => l[1] === "G" && l[6] !== null && l[6] !== path).map((l) => l[6]))].sort(comparePaths);
  const inboundOf = async (path) => {
    if (!inbound.length || comparePaths(path, inbound[0].first) < 0) return [];
    const found = (await text(pieceFor(inbound, path))).linesOf(path);
    return found.length ? found[0][2] : [];
  };
  return {
    pieces,
    paths: async () => {
      const out = [];
      for (const p of lines) out.push(...(await text(p)).paths());
      return out;
    },
    inbound: inboundOf,
    outbound: outboundOf,
    reachable: async (path) => {
      const order = [path];
      const seen = new Set(order);
      for (let i = 0; i < order.length; i += 1) for (const q of await outboundOf(order[i])) if (!seen.has(q)) { seen.add(q); order.push(q); }
      return order;
    },
    records: async (list) => Promise.all(list.map(async (p) => recordFrom(await linesFor(p)))),
    all: async () => {
      const files = {};
      const ins = new Map();
      for (const p of inbound) {
        const t = await text(p);
        for (let k = 0; k < t.starts.length; k += 1) {
          const l = JSON.parse(t.line(k));
          ins.set(l[0], l[2]);
        }
      }
      for (const p of lines) {
        const t = await text(p);
        for (const path of t.paths()) {
          const r = recordFrom(t.linesOf(path));
          const o = [...new Set(r.edges.map((e) => e.to).filter((x) => x !== undefined && x !== path))].sort(comparePaths);
          files[path] = graphFileOf(location, path, r, o, ins.get(path) ?? []);
        }
      }
      return { ...location, files };
    }
  };
}
void walk;
