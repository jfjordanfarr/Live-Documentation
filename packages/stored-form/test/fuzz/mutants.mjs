// The stored form's fuzzer: mutants of valid files, each made from a seed alone, so that a failure names its seed and
// is made again from it. Plain JavaScript that imports nothing, so that the worker loads it as it stands.

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
