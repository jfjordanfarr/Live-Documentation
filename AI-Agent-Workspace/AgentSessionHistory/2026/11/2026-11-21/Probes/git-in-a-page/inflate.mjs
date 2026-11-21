// Probe of November 21, 2026 (not product code): zlib's inflate (RFC 1950 and 1951) in plain JavaScript, synchronous,
// for the many small objects of a git history, where a DecompressionStream per object costs more in setting up than
// in inflating. `size`, where the caller knows it (a pack's header names it), sizes the output once.

const LENGTH_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
const LENGTH_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
const DIST_BASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
const DIST_EXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
const ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

/** The bits a table looks at at once; a longer code is decoded a bit at a time. */
const LOOK = 10;

/**
 * A canonical Huffman code: counts per length and symbols in code order, for the slow way, and a table of the next
 * LOOK bits as the stream holds them (least significant first) to `symbol | length << 16`, 0 where the code is longer.
 */
function code(lengths) {
  const counts = new Uint16Array(16);
  for (const length of lengths) counts[length] += 1;
  counts[0] = 0;
  const offsets = new Uint16Array(16);
  for (let i = 1; i < 16; i += 1) offsets[i] = offsets[i - 1] + counts[i - 1];
  const symbols = new Uint16Array(lengths.length);
  const table = new Uint32Array(1 << LOOK);
  const next = new Uint16Array(16);
  for (let length = 1, value = 0; length < 16; length += 1) {
    value = (value + counts[length - 1]) << 1;
    next[length] = value;
  }
  lengths.forEach((length, symbol) => {
    if (!length) return;
    symbols[offsets[length]++] = symbol;
    const value = next[length]++;
    if (length > LOOK) return;
    let reversed = 0;
    for (let i = 0; i < length; i += 1) reversed |= ((value >> i) & 1) << (length - 1 - i);
    for (let fill = reversed; fill < 1 << LOOK; fill += 1 << length) table[fill] = symbol | (length << 16);
  });
  return { counts, symbols, table };
}

const FIXED_LITERALS = code(Array.from({ length: 288 }, (_, i) => (i < 144 ? 8 : i < 256 ? 9 : i < 280 ? 7 : 8)));
const FIXED_DISTANCES = code(new Array(30).fill(5));

export function inflateSync(input, size = 0) {
  let at = 2; // the zlib header; its checksum after the data is not checked
  let bits = 0;
  let held = 0;
  let out = new Uint8Array(size || Math.max(64, input.length * 4));
  let o = 0;
  const need = (n) => {
    if (o + n <= out.length) return;
    const bigger = new Uint8Array(Math.max(out.length * 2, o + n));
    bigger.set(out.subarray(0, o));
    out = bigger;
  };
  const take = (n) => {
    while (held < n) {
      if (at >= input.length) throw new Error("the compressed data ends early");
      bits |= input[at++] << held;
      held += 8;
    }
    const value = bits & ((1 << n) - 1);
    bits >>>= n;
    held -= n;
    return value;
  };
  const symbol = ({ counts, symbols, table }) => {
    while (held < LOOK && at < input.length) {
      bits |= input[at++] << held;
      held += 8;
    }
    const entry = table[bits & ((1 << LOOK) - 1)];
    if (entry !== 0 && entry >>> 16 <= held) {
      bits >>>= entry >>> 16;
      held -= entry >>> 16;
      return entry & 0xffff;
    }
    let first = 0;
    let index = 0;
    let value = 0;
    for (let length = 1; length < 16; length += 1) {
      value |= take(1);
      const count = counts[length];
      if (value - first < count) return symbols[index + value - first];
      index += count;
      first = (first + count) << 1;
      value <<= 1;
    }
    throw new Error("an invalid Huffman code");
  };
  for (let last = 0; !last; ) {
    last = take(1);
    const type = take(2);
    if (type === 0) {
      bits = 0;
      held = 0;
      const length = input[at] | (input[at + 1] << 8);
      at += 4;
      need(length);
      out.set(input.subarray(at, at + length), o);
      o += length;
      at += length;
      continue;
    }
    let literals = FIXED_LITERALS;
    let distances = FIXED_DISTANCES;
    if (type === 2) {
      const nLiterals = take(5) + 257;
      const nDistances = take(5) + 1;
      const nCodes = take(4) + 4;
      const codeLengths = new Array(19).fill(0);
      for (let i = 0; i < nCodes; i += 1) codeLengths[ORDER[i]] = take(3);
      const lengthCode = code(codeLengths);
      const lengths = [];
      while (lengths.length < nLiterals + nDistances) {
        const s = symbol(lengthCode);
        if (s < 16) lengths.push(s);
        else if (s === 16) lengths.push(...new Array(3 + take(2)).fill(lengths.at(-1)));
        else if (s === 17) lengths.push(...new Array(3 + take(3)).fill(0));
        else lengths.push(...new Array(11 + take(7)).fill(0));
      }
      literals = code(lengths.slice(0, nLiterals));
      distances = code(lengths.slice(nLiterals));
    } else if (type === 3) throw new Error("an invalid block type");
    for (;;) {
      let s = symbol(literals);
      if (s < 256) {
        need(1);
        out[o++] = s;
      } else if (s === 256) break;
      else {
        s -= 257;
        const length = LENGTH_BASE[s] + take(LENGTH_EXTRA[s]);
        const d = symbol(distances);
        const distance = DIST_BASE[d] + take(DIST_EXTRA[d]);
        need(length);
        for (let i = 0; i < length; i += 1, o += 1) out[o] = out[o - distance];
      }
    }
  }
  return o === out.length ? out : out.subarray(0, o);
}
