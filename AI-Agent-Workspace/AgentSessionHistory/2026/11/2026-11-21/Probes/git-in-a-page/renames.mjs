// Probe of November 21, 2026 (not product code): git's rename detection as `git diff -M<score> -l0` makes it between
// two trees, ported from git v2.56.1 (tag object 766ce5124ba6), `diffcore-rename.c` (diffcore_rename_extended with no
// copies, no breaks, no directory-rename hints) and `diffcore-delta.c` (the similarity estimate). Plain JavaScript,
// the same file under Node and in a page, beside the reader.
//
// In git's order: (1) exact renames, each destination taking the first unused source with its blob id, one whose name
// ends the same preferred; (2) a destination and a source whose file names are each unique among those left, paired
// if at least as alike as halfway between the minimum and identical; (3) every destination left against every source
// left, the best four kept per destination, sorted (stably) by score and then by a same file name, taken in turn.
// Binary means a NUL in the first 8,000 bytes: neither repository measured sets a `diff` attribute, which git would
// read from the checkout and this port does not. Empty files are renamed like any other (git's `rename_empty`).

const MAX_SCORE = 60000;
const HASHBASE = 107927;
const isRegular = (mode) => mode === "100644" || mode === "100755" || mode === "100664";

const basenameOf = (path) => path.slice(path.lastIndexOf("/") + 1);

/** Whether two paths end in the same file name (git's `basename_same`). */
function basenameSame(a, b) {
  let i = a.length;
  let j = b.length;
  while (i && j) {
    const x = a[--i];
    if (x !== b[--j]) return false;
    if (x === "/") return true;
  }
  return (!i || a[i - 1] === "/") && (!j || b[j - 1] === "/");
}

/** git's `hash_chars`: the content cut at each LF or 64 bytes, each piece hashed, as sorted [hash, bytes] pairs. */
export function spans(data) {
  let isText = true;
  for (let i = 0, end = Math.min(data.length, 8000); i < end; i += 1) {
    if (data[i] === 0) {
      isText = false;
      break;
    }
  }
  const counts = new Map();
  let accum1 = 0;
  let accum2 = 0;
  let n = 0;
  const add = () => {
    const hash = ((accum1 + Math.imul(accum2, 0x61)) >>> 0) % HASHBASE;
    counts.set(hash, (counts.get(hash) ?? 0) + n);
    n = 0;
    accum1 = 0;
    accum2 = 0;
  };
  for (let k = 0; k < data.length; k += 1) {
    const c = data[k];
    if (isText && c === 13 && k + 1 < data.length && data[k + 1] === 10) continue;
    const old1 = accum1;
    accum1 = (((accum1 << 7) ^ (accum2 >>> 25)) + c) >>> 0;
    accum2 = ((accum2 << 7) ^ (old1 >>> 25)) >>> 0;
    n += 1;
    if (n < 64 && c !== 10) continue;
    add();
  }
  if (n > 0) add();
  const hashes = Uint32Array.from(counts.keys()).sort();
  const sizes = new Float64Array(hashes.length);
  hashes.forEach((hash, i) => (sizes[i] = counts.get(hash)));
  return { hashes, sizes };
}

/** git's `diffcore_count_changes`: the bytes of the source that the destination keeps. */
function copied(src, dst) {
  let copiedBytes = 0;
  let d = 0;
  for (let s = 0; s < src.hashes.length; s += 1) {
    while (d < dst.hashes.length && dst.hashes[d] < src.hashes[s]) d += 1;
    let dstCount = 0;
    if (d < dst.hashes.length && dst.hashes[d] === src.hashes[s]) dstCount = dst.sizes[d++];
    copiedBytes += Math.min(src.sizes[s], dstCount);
  }
  return copiedBytes;
}

/** git's `score_compare`: below zero where `a` sorts before `b`; an empty slot sinks. */
function scoreCompare(a, b) {
  if (a.dst < 0) return b.dst >= 0 ? 1 : 0;
  if (b.dst < 0) return -1;
  if (a.score === b.score) return b.name - a.name;
  return b.score - a.score;
}

/**
 * The renames among one step's changes, as `git diff --name-status -M<minimum> -l0` writes them.
 *
 * @param changes - The step's changes in the tree's order, `[status, path, id, mode]`, as the reader's `changes` gives them.
 * @param blob - The bytes of a blob by id.
 * @param options - `minimumScore` in git's units (60000 is identical; `-M50%` is 30000); `size`, a blob's size by id
 *   without its bytes; `pause`, awaited every few hundred estimates, where a page hands the thread back.
 * @returns The records in git's order: `[status, path]`, or `["R" + score, from, to]`.
 */
export async function withRenames(changes, blob, options = {}) {
  const minimumScore = options.minimumScore ?? 30000;
  const pause = options.pause ?? (() => undefined);
  const dst = [];
  const src = [];
  for (const [status, path, id, mode] of changes) {
    if (status === "A") dst.push({ path, id, mode, from: undefined, score: 0, index: dst.length });
    else if (status === "D") src.push({ path, id, mode, used: false });
  }
  const record = (d, s, score) => {
    s.used = true;
    d.from = s;
    d.score = score;
  };
  if (dst.length > 0 && src.length > 0) {
    // (1) Exact renames: sources in their order, at most 100 unused candidates weighed for a destination.
    const byId = new Map();
    for (const s of src) byId.has(s.id) ? byId.get(s.id).push(s) : byId.set(s.id, [s]);
    for (const d of dst) {
      let best;
      let bestScore = -1;
      let left = 100;
      for (const s of byId.get(d.id) ?? []) {
        if ((!isRegular(s.mode) || !isRegular(d.mode)) && s.mode !== d.mode) continue;
        if (s.used) continue;
        const score = 1 + (basenameSame(s.path, d.path) ? 1 : 0);
        if (score > bestScore) {
          best = s;
          bestScore = score;
          if (score === 2) break;
        }
        if (!--left) break;
      }
      if (best !== undefined) record(d, best, MAX_SCORE);
    }
    if (minimumScore < MAX_SCORE) {
      // A file's size first, by `options.size` where the caller can give it without the bytes (git's `check_size_only`),
      // and its pieces only once a pair passes the size test, each made once (git keeps `cnt_data` the same way); the
      // bytes are not kept.
      const sizeOf = async (spec) => (spec.size ??= options.size ? await options.size(spec.id) : (await piecesOf(spec)).size);
      const piecesOf = async (spec) => {
        if (spec.spans === undefined) {
          const bytes = await blob(spec.id);
          spec.size = bytes.length;
          spec.spans = spans(bytes);
        }
        return spec;
      };
      let estimates = 0;
      const estimate = async (s, d, minimum) => {
        if ((estimates += 1) % 256 === 0) await pause();
        if (!isRegular(s.mode) || !isRegular(d.mode)) return 0;
        const [a, b] = [await sizeOf(s), await sizeOf(d)];
        const max = Math.max(a, b);
        if (max * (MAX_SCORE - minimum) < (max - Math.min(a, b)) * MAX_SCORE) return 0;
        const kept = copied((await piecesOf(s)).spans, (await piecesOf(d)).spans);
        return b === 0 ? 0 : Math.trunc((kept * MAX_SCORE) / max);
      };
      // (2) Unique file names on both sides, at the higher bar.
      let left = src.filter((s) => !s.used);
      const minimumByName = minimumScore + Math.trunc(0.5 * (MAX_SCORE - minimumScore));
      const sources = new Map();
      for (const s of left) sources.set(basenameOf(s.path), sources.has(basenameOf(s.path)) ? -1 : s);
      const dests = new Map();
      for (const d of dst) if (d.from === undefined) dests.set(basenameOf(d.path), dests.has(basenameOf(d.path)) ? -1 : d);
      for (const s of left) {
        const name = basenameOf(s.path);
        if (!dests.has(name)) continue;
        const d = dests.get(name);
        if (sources.get(name) === -1 || d === -1 || d.from !== undefined) continue;
        const score = await estimate(s, d, minimumByName);
        if (score >= minimumByName) record(d, s, score);
      }
      // (3) Every destination left against every source left, four kept for each.
      left = left.filter((s) => !s.used);
      const open = dst.filter((d) => d.from === undefined);
      if (open.length > 0 && left.length > 0) {
        const matrix = [];
        for (const d of open) {
          const slots = [{ dst: -1 }, { dst: -1 }, { dst: -1 }, { dst: -1 }];
          for (let j = 0; j < left.length; j += 1) {
            const candidate = { src: j, dst: d.index, score: await estimate(left[j], d, minimumScore), name: basenameSame(left[j].path, d.path) ? 1 : 0 };
            let worst = 0;
            for (let k = 1; k < 4; k += 1) if (scoreCompare(slots[k], slots[worst]) > 0) worst = k;
            if (scoreCompare(slots[worst], candidate) > 0) slots[worst] = candidate;
          }
          matrix.push(...slots);
        }
        matrix.sort(scoreCompare);
        for (const m of matrix) {
          if (m.dst < 0 || m.score < minimumScore) break;
          const d = dst[m.dst];
          if (d.from !== undefined || left[m.src].used) continue;
          record(d, left[m.src], m.score);
        }
      }
    }
  }
  const out = [];
  let a = 0;
  let r = 0;
  for (const [status, path] of changes) {
    if (status === "A") {
      const d = dst[a++];
      if (d.from === undefined) out.push(["A", path]);
      else out.push([`R${String(Math.trunc((d.score * 100) / MAX_SCORE)).padStart(3, "0")}`, d.from.path, path]);
    } else if (status === "D") {
      if (!src[r++].used) out.push(["D", path]);
    } else out.push([status, path]);
  }
  return out;
}
