// The stored form's fuzzer: mutants of valid files, each made from a seed alone, so that a failure names its seed and
// is made again from it. Plain JavaScript, loaded by the worker as it stands; it takes Node's zlib and hashes for its
// second stage, as test support may.
//
// Two stages. The first changes the stored bytes, so a hash or the inflater refuses nearly every mutant before any
// section's grammar is read. The second, on every odd seed but a bomb's, changes one section's uncompressed bytes and
// sets the file down again with every hash and the end right, so that the mutant reaches the section's grammar: the
// independent review's raw-section fuzzer of 2026-11-22 (Probes/stored-form-review/raw-fuzz.mjs), taken in.
import { createHash } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";

/** A small deterministic generator of numbers from a seed (mulberry32). */
export function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SIGNATURE_LENGTH = 8;
const FRAME_HEADER = 45;

/** Where each frame's header begins, hopping as the layout says; stops at anything that does not fit. */
function frameStarts(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const starts = [];
  for (let at = SIGNATURE_LENGTH; at + FRAME_HEADER <= bytes.length; ) {
    starts.push(at);
    at += FRAME_HEADER + view.getUint32(at + 9, true);
  }
  return starts;
}

const LIES = [0, 1, 2, 255, 256, 257, 65535, 1 << 24, 0x7fffffff, 0xfffffff0, 0xffffffff];

/**
 * One mutant of `base`, by the seed: a few bits flipped, a cut, a length or count that lies, bytes put in or taken out,
 * a frame doubled or two swapped, or a section that inflates past what it claims (`bomb`, a raw deflate stream of
 * hundreds of megabytes of zeros, made once by the caller).
 */
export function mutant(base, seed, bomb) {
  if (seed % 2 === 1 && seed % 8 !== 3) return belowTheHash(base, seed);
  const next = random(seed);
  const int = (n) => Math.floor(next() * n);
  const bytes = new Uint8Array(base);
  const starts = frameStarts(bytes);
  const kind = seed % 8;
  switch (kind) {
    case 0: {
      const flips = 1 + int(8);
      for (let i = 0; i < flips; i += 1) bytes[int(bytes.length)] ^= 1 << int(8);
      return { kind: "flipped bits", bytes };
    }
    case 1:
      return { kind: "cut", bytes: bytes.slice(0, int(bytes.length)) };
    case 2: {
      // A frame's count, raw length or stored length that lies.
      const at = starts[int(starts.length)];
      const field = [1, 5, 9][int(3)];
      new DataView(bytes.buffer).setUint32(at + field, LIES[int(LIES.length)], true);
      return { kind: `lying ${["count", "raw length", "stored length"][[1, 5, 9].indexOf(field)]}`, bytes };
    }
    case 3: {
      // A section whose body inflates to hundreds of megabytes, its header claiming what the original claimed.
      const i = int(starts.length);
      const at = starts[i];
      const view = new DataView(bytes.buffer);
      const end = at + FRAME_HEADER + view.getUint32(at + 9, true);
      const out = new Uint8Array(end - (end - at - FRAME_HEADER) + bomb.length + (bytes.length - end));
      out.set(bytes.subarray(0, at + FRAME_HEADER), 0);
      out.set(bomb, at + FRAME_HEADER);
      out.set(bytes.subarray(end), at + FRAME_HEADER + bomb.length);
      new DataView(out.buffer).setUint32(at + 9, bomb.length, true);
      if (next() < 0.5) new DataView(out.buffer).setUint32(at + 5, 0xfffffff0, true);
      return { kind: "bomb", bytes: out };
    }
    case 4: {
      const at = int(bytes.length);
      const extra = new Uint8Array(1 + int(64)).map(() => int(256));
      return { kind: "bytes put in", bytes: new Uint8Array([...bytes.subarray(0, at), ...extra, ...bytes.subarray(at)]) };
    }
    case 5: {
      const at = int(bytes.length);
      return { kind: "bytes taken out", bytes: new Uint8Array([...bytes.subarray(0, at), ...bytes.subarray(at + 1 + int(64))]) };
    }
    case 6: {
      // A frame doubled, or two frames swapped.
      const pieces = starts.map((s, i) => bytes.subarray(s, starts[i + 1] ?? bytes.length));
      const i = int(pieces.length);
      const j = int(pieces.length);
      if (next() < 0.5) pieces.splice(i, 0, pieces[i]);
      else [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
      const out = [bytes.subarray(0, SIGNATURE_LENGTH), ...pieces];
      return { kind: "frames rearranged", bytes: new Uint8Array(out.flatMap((p) => [...p])) };
    }
    default: {
      // Random bytes after the signature, of the original's length.
      const out = bytes.slice();
      for (let i = SIGNATURE_LENGTH; i < out.length; i += 1) out[i] = int(256);
      return { kind: "noise", bytes: out };
    }
  }
}

const sha = (b) => new Uint8Array(createHash("sha256").update(b).digest());

/** A file's frames, each with its section inflated. */
function framesOf(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out = [];
  for (let at = SIGNATURE_LENGTH; at < bytes.length; ) {
    const stored = view.getUint32(at + 9, true);
    out.push({ kind: bytes[at], count: view.getUint32(at + 1, true), raw: new Uint8Array(inflateRawSync(bytes.subarray(at + FRAME_HEADER, at + FRAME_HEADER + stored))) });
    at += FRAME_HEADER + stored;
  }
  return out;
}

/** Frames set down again, each with its own hash, and the end naming them. */
function framed(signature, frames) {
  const parts = [signature];
  const hashes = [];
  for (const f of frames) {
    const joined = new Uint8Array(hashes.length * 32);
    hashes.forEach((h, i) => joined.set(h, i * 32));
    const raw = f.kind === 6 ? sha(joined) : f.raw;
    const hash = sha(raw);
    hashes.push(hash);
    const stored = new Uint8Array(deflateRawSync(raw));
    const header = new Uint8Array(13);
    const view = new DataView(header.buffer);
    header[0] = f.kind;
    view.setUint32(1, f.kind === 6 ? frames.length - 1 : f.count, true);
    view.setUint32(5, raw.length, true);
    view.setUint32(9, stored.length, true);
    parts.push(header, hash, stored);
  }
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

const INTERESTING = [0, 1, 2, 0x7f, 0x80, 0x81, 0xbf, 0xc0, 0xc3, 0xe0, 0xed, 0xef, 0xf0, 0xf4, 0xf5, 0xff, 0x2f, 0x5c, 0x3a, 0x2e];
const splice = (raw, at, take, put = []) => new Uint8Array([...raw.subarray(0, at), ...put, ...raw.subarray(at + take)]);

/** The second stage: one section's uncompressed bytes changed in one of nine ways, then set down with every hash right. */
function belowTheHash(base, seed) {
  const next = random(seed);
  const int = (n) => Math.floor(next() * n);
  const bytes = new Uint8Array(base);
  const frames = framesOf(bytes);
  const choices = frames.map((_, i) => i).filter((i) => frames[i].kind !== 6 && frames[i].raw.length > 0);
  const f = frames[choices[int(choices.length)]];
  const at = int(f.raw.length);
  const ways = [
    ["a bit flipped below the hash", () => void (f.raw[at] ^= 1 << int(8))],
    ["a byte set below the hash", () => void (f.raw[at] = INTERESTING[int(INTERESTING.length)])],
    ["a byte put in below the hash", () => void (f.raw = splice(f.raw, at, 0, [INTERESTING[int(INTERESTING.length)]]))],
    ["a byte taken out below the hash", () => void (f.raw = splice(f.raw, at, 1))],
    // A one-byte number written in two: b as (b | 0x80) 0x00, which no shortest form writes.
    ["a number written longer below the hash", () => void (f.raw[at] < 0x80 ? (f.raw = splice(f.raw, at, 1, [f.raw[at] | 0x80, 0])) : (f.raw[at] ^= 1))],
    ["a count one off below the hash", () => void (f.count = Math.max(0, f.count + (next() < 0.5 ? -1 : 1)))],
    ["two bytes swapped below the hash", () => {
      const j = int(f.raw.length);
      [f.raw[at], f.raw[j]] = [f.raw[j], f.raw[at]];
    }],
    ["a byte one off below the hash", () => void (f.raw[at] = (f.raw[at] + (next() < 0.5 ? 1 : 255)) & 0xff)],
    ["a section cut below the hash", () => void (f.raw = f.raw.subarray(0, at))]
  ];
  const [kind, change] = ways[int(ways.length)];
  change();
  return { kind, bytes: framed(bytes.subarray(0, SIGNATURE_LENGTH), frames) };
}
