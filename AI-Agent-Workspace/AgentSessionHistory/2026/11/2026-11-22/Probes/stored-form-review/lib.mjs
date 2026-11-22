// Probe of 2026-11-22 (not product code), the stored form's review: helpers for the probes beside it. Frames set
// down again with their own hashes, and deflate streams led by empty stored blocks so that a file sits within the
// inflation bound (a 63rd of what it inflates to).
import { createHash } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";

export const SIGNATURE = Buffer.from([0x89, 0x46, 0x50, 0x4b, 0x0d, 0x0a, 0x1a, 0x0a]);
const sha = (b) => createHash("sha256").update(b).digest();

export function framesOf(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out = [];
  for (let at = 8; at < bytes.length; ) {
    const stored = view.getUint32(at + 9, true);
    out.push({ kind: bytes[at], count: view.getUint32(at + 1, true), raw: new Uint8Array(inflateRawSync(bytes.subarray(at + 45, at + 45 + stored))) });
    at += 45 + stored;
  }
  return out;
}

/** Empty non-final stored blocks: five bytes each, inflating to nothing. */
export const emptyBlocks = (n) => Buffer.alloc(5 * n).map((_, i) => (i % 5 === 3 || i % 5 === 4 ? 0xff : 0));

/** Frames set down with hashes and the end naming them; `store(raw, i)` compresses each. */
export function framed(frames, store = (raw) => deflateRawSync(raw)) {
  const parts = [SIGNATURE];
  const hashes = [];
  frames.forEach((f, i) => {
    const raw = f.kind === 6 ? sha(Buffer.concat(hashes)) : f.raw;
    const hash = sha(raw);
    hashes.push(hash);
    const stored = store(raw, i, f);
    const header = Buffer.alloc(13);
    header[0] = f.kind;
    header.writeUInt32LE(f.kind === 6 ? frames.length - 1 : f.count, 1);
    header.writeUInt32LE(raw.length, 5);
    header.writeUInt32LE(stored.length, 9);
    parts.push(header, hash, stored);
  });
  return Buffer.concat(parts);
}

/** Pads every frame's stream with empty blocks so that the file is at least `share` of what it inflates to. */
export function paddedTo(frames, ratio = 63) {
  const raw = frames.reduce((n, f) => n + (f.kind === 6 ? 32 : f.raw.length), 0);
  const plain = framed(frames);
  const want = Math.max(0, Math.ceil((raw - 1024 * 1024) / ratio) - plain.length);
  const blocks = Math.ceil(want / 5);
  return framed(frames, (r, i, f) => (f.kind === 3 && i === frames.findIndex((g) => g.kind === 3) ? Buffer.concat([emptyBlocks(blocks), deflateRawSync(r)]) : deflateRawSync(r)));
}

export const mib = (n) => (n / 1048576).toFixed(1) + " MiB";
