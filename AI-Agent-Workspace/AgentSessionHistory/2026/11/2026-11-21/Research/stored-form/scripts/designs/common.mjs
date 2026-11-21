// Research of November 21, 2026 (not product code). What every design shares, written only against the web
// platform's own interfaces (CompressionStream, TextEncoder, DataView, crypto.subtle), so that one module runs
// unchanged in Node and in a page.

export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

/** Compresses bytes with the platform's own CompressionStream: "gzip", "deflate" or "deflate-raw". */
export async function compress(bytes, format = "deflate-raw") {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Inflates bytes with the platform's own DecompressionStream. */
export async function inflate(bytes, format = "deflate-raw") {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function sha256Hex(bytes) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return [...digest].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** The doc path a file's record implies: the convention the facts were written under, so no design stores it. */
export function docPathOf(location, codePath) {
  const join = (...parts) => parts.map((p) => p.replace(/\\/g, "/").replace(/^\.\/|\/+$/g, "")).filter((p) => p && p !== ".").join("/");
  return `${join(location.root, location.baseLayer)}/${codePath}${location.extension}`;
}

/** A file's record without the parts every design derives or keys by: its path, its doc path and its adjacency. */
export function recordOf(file) {
  const { codePath, docPath, outbound, inbound, ...rest } = file;
  return rest;
}

/** Rebuilds a graph file from its path, its record and its adjacency, in the key order the engine writes. */
export function graphFileOf(location, codePath, record, outbound, inbound) {
  const file = { codePath, docPath: docPathOf(location, codePath) };
  for (const key of ["layer", "archetype", "entries", "generatedAt", "authored", "symbols", "dependencies", "citedBy", "reExports", "edges"]) {
    if (record[key] !== undefined) file[key] = record[key];
  }
  file.outbound = outbound;
  file.inbound = inbound;
  return file;
}

/** The path order the engine sorts files in. */
export function comparePaths(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Index of a path in a sorted list of paths, or -1. */
export function findPath(paths, path) {
  let lo = 0;
  let hi = paths.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const c = comparePaths(paths[mid], path);
    if (c === 0) return mid;
    if (c < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

/** Adjacency as compressed sparse rows over file indices: offsets[n + 1] and targets. */
export function adjacencyOf(graph, paths) {
  const index = new Map(paths.map((p, i) => [p, i]));
  const build = (key) => {
    const offsets = new Uint32Array(paths.length + 1);
    const targets = [];
    paths.forEach((p, i) => {
      for (const q of graph.files[p][key]) targets.push(index.get(q));
      offsets[i + 1] = targets.length;
    });
    return { offsets, targets: Uint32Array.from(targets) };
  };
  return { out: build("outbound"), in: build("inbound") };
}

/** Breadth-first walk over outbound adjacency; returns the set of file indices reached, the start included. */
export function walk(start, neighbours) {
  const order = [start];
  const marks = new Set([start]);
  for (let i = 0; i < order.length; i += 1) {
    for (const next of neighbours(order[i])) {
      if (!marks.has(next)) {
        marks.add(next);
        order.push(next);
      }
    }
  }
  return order;
}

/** A JSON text with every object's keys sorted and undefined members dropped: two graphs are the same facts when these agree. */
export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map((v) => (v === undefined ? "null" : canonical(v))).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .filter((k) => value[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

// ---------------------------------------------------------------------------------------------------------------
// Varints and a growable byte buffer
// ---------------------------------------------------------------------------------------------------------------
export class Bytes {
  constructor(size = 1 << 16) {
    this.buf = new Uint8Array(size);
    this.len = 0;
  }
  ensure(n) {
    if (this.len + n <= this.buf.length) return;
    let size = this.buf.length * 2;
    while (size < this.len + n) size *= 2;
    const next = new Uint8Array(size);
    next.set(this.buf.subarray(0, this.len));
    this.buf = next;
  }
  byte(b) {
    this.ensure(1);
    this.buf[this.len++] = b;
  }
  varint(n) {
    this.ensure(10);
    while (n >= 0x80) {
      this.buf[this.len++] = (n & 0x7f) | 0x80;
      n = Math.floor(n / 128);
    }
    this.buf[this.len++] = n;
  }
  bytes(b) {
    this.ensure(b.length);
    this.buf.set(b, this.len);
    this.len += b.length;
  }
  u32(n) {
    this.ensure(4);
    this.buf[this.len++] = n & 0xff;
    this.buf[this.len++] = (n >>> 8) & 0xff;
    this.buf[this.len++] = (n >>> 16) & 0xff;
    this.buf[this.len++] = (n >>> 24) & 0xff;
  }
  done() {
    return this.buf.slice(0, this.len);
  }
}

export class Cursor {
  constructor(bytes, at = 0) {
    this.b = bytes;
    this.at = at;
  }
  varint() {
    let n = 0;
    let shift = 1;
    for (;;) {
      const b = this.b[this.at++];
      n += (b & 0x7f) * shift;
      if (b < 0x80) return n;
      shift *= 128;
    }
  }
}

/** Concatenates byte arrays. */
export function concat(parts) {
  const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

export function u32Bytes(array) {
  const out = new Uint8Array(array.length * 4);
  new DataView(out.buffer).setUint32(0, 0, true);
  const view = new DataView(out.buffer);
  for (let i = 0; i < array.length; i += 1) view.setUint32(i * 4, array[i], true);
  return out;
}

export function u32Array(bytes, at, count) {
  const view = new DataView(bytes.buffer, bytes.byteOffset + at, count * 4);
  const out = new Uint32Array(count);
  for (let i = 0; i < count; i += 1) out[i] = view.getUint32(i * 4, true);
  return out;
}
