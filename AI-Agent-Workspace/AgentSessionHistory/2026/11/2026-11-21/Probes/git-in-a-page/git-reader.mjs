// Probe of November 21, 2026 (not product code): a reader of a repository's `.git` folder in plain JavaScript, using
// only what a browser and Node both have (DecompressionStream, Web Crypto, typed arrays), so that the same file runs
// unchanged in a page and under Node. It reaches the folder through a host of four functions, the engine's port
// (`list`, `read`) with two more a pack needs (`size`, and `slice`, a ranged read of which the port's `head` is the
// first case):
//   list(prefix)            every file path under `prefix`, relative to the host's root, forward slashes
//   read(path)              the file's bytes, or null where there is no file
//   size(path)              the file's length in bytes
//   slice(path, start, end) bytes [start, end) of the file
// It reads: HEAD and refs (loose and packed-refs), loose objects, pack indexes (version 2) and packs with both kinds of
// delta, commits, trees and blobs; and it answers what the history asks of git: the mainline, the tags, the files
// changed between two commits, a commit's full tree, and a blob's bytes. What it refuses is said by `refusals`.

import { inflateSync } from "./inflate.mjs";

const decoder = new TextDecoder();
const encoder = new TextEncoder();
const HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));

export function toHex(bytes, at = 0, length = 20) {
  let out = "";
  for (let i = at; i < at + length; i += 1) out += HEX[bytes[i]];
  return out;
}

function fromHex(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/** Inflates one zlib stream, given exactly. */
export async function inflate(bytes) {
  const stream = new DecompressionStream("deflate");
  const writer = stream.writable.getWriter();
  writer.write(bytes).catch(() => undefined);
  writer.close().catch(() => undefined);
  return new Uint8Array(await new Response(stream.readable).arrayBuffer());
}

/** The id git gives an object of this type and content: SHA-1 over `<type> <size>\0<content>`. */
export async function objectId(type, data) {
  const head = new TextEncoder().encode(`${type} ${data.length}\0`);
  const whole = new Uint8Array(head.length + data.length);
  whole.set(head);
  whole.set(data, head.length);
  return toHex(new Uint8Array(await crypto.subtle.digest("SHA-1", whole)));
}

/** A path joined and normalized, `..` included; null where it would climb above the host's root. */
function join(...parts) {
  const out = [];
  for (const part of parts.join("/").split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (out.length === 0) return null;
      out.pop();
    } else out.push(part);
  }
  return out.join("/");
}

/** A map kept to a budget, the least recently used dropped first. */
class Lru {
  constructor(budget, weigh) {
    this.budget = budget;
    this.weigh = weigh;
    this.used = 0;
    this.map = new Map();
  }
  get(key) {
    const value = this.map.get(key);
    if (value !== undefined) {
      this.map.delete(key);
      this.map.set(key, value);
    }
    return value;
  }
  set(key, value) {
    const weight = this.weigh(value);
    if (weight > this.budget) return;
    if (this.map.has(key)) this.used -= this.weigh(this.map.get(key));
    this.map.delete(key);
    this.map.set(key, value);
    this.used += weight;
    for (const [oldest, old] of this.map) {
      if (this.used <= this.budget) break;
      this.map.delete(oldest);
      this.used -= this.weigh(old);
    }
  }
}

/** A minimal reading of git's configuration file: section.key (and section.sub.key) to the last value given. */
export function parseConfig(text) {
  const values = new Map();
  let section = "";
  for (const raw of text.split(/\r?\n/u)) {
    const line = raw.replace(/^\s+/u, "");
    if (line === "" || line[0] === "#" || line[0] === ";") continue;
    const head = /^\[\s*([^\]\s"]+)(?:\s+"((?:[^"\\]|\\.)*)")?\s*\]/u.exec(line);
    if (head) {
      section = head[2] === undefined ? head[1].toLowerCase() : `${head[1].toLowerCase()}.${head[2]}`;
      continue;
    }
    const entry = /^([A-Za-z][-A-Za-z0-9]*)\s*(?:=\s*(.*))?$/u.exec(line);
    if (entry) values.set(`${section}.${entry[1].toLowerCase()}`, entry[2] === undefined ? "true" : entry[2].replace(/\s+[#;].*$/u, "").replace(/^"(.*)"$/u, "$1").trim());
  }
  return values;
}

const truthy = (value) => value !== undefined && /^(true|yes|on|1)$/iu.test(value);

/** One pack: its index (version 2) held whole, its bytes read through windows. */
class Pack {
  constructor(host, path, index, size, options = {}) {
    this.host = host;
    this.path = path;
    this.size = size;
    const view = new DataView(index.buffer, index.byteOffset, index.byteLength);
    if (view.getUint32(0) !== 0xff744f63 || view.getUint32(4) !== 2) throw new Error(`${path}: only version 2 pack indexes are read`);
    this.index = index;
    this.view = view;
    this.count = view.getUint32(8 + 255 * 4);
    this.names = 8 + 1024;
    this.offsets32 = this.names + 24 * this.count;
    this.offsets64 = this.offsets32 + 4 * this.count;
    this.W = options.windowBytes ?? 64 << 10;
    this.windows = new Lru(options.windowBudget ?? 32 << 20, (w) => w.length);
  }
  /** The pack offset of the object with these 20 bytes of id, or -1. */
  find(id) {
    let lo = id[0] === 0 ? 0 : this.view.getUint32(8 + (id[0] - 1) * 4);
    let hi = this.view.getUint32(8 + id[0] * 4);
    const names = this.index;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      const at = this.names + mid * 20;
      let order = 0;
      for (let i = 0; i < 20 && order === 0; i += 1) order = names[at + i] - id[i];
      if (order === 0) return this.offsetOf(mid);
      if (order < 0) lo = mid + 1;
      else hi = mid;
    }
    return -1;
  }
  offsetOf(position) {
    const small = this.view.getUint32(this.offsets32 + position * 4);
    if ((small & 0x80000000) === 0) return small;
    const at = this.offsets64 + (small & 0x7fffffff) * 8;
    return this.view.getUint32(at) * 2 ** 32 + this.view.getUint32(at + 4);
  }
  /** Where the object at `offset` ends: the next object's offset, or the pack's trailing checksum. */
  endOf(offset) {
    if (this.sorted === undefined) {
      this.sorted = new Float64Array(this.count);
      for (let i = 0; i < this.count; i += 1) this.sorted[i] = this.offsetOf(i);
      this.sorted.sort();
    }
    let lo = 0;
    let hi = this.count;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.sorted[mid] <= offset) lo = mid + 1;
      else hi = mid;
    }
    return lo < this.count ? this.sorted[lo] : this.size - 20;
  }
  /** Bytes [start, end) of the pack, through 4 MB windows so that a page's thousands of small reads are a few large ones. */
  async bytes(start, end) {
    const W = this.W;
    if (end - start > W) return this.host.slice(this.path, start, end);
    const a = Math.floor(start / W);
    const b = Math.floor((end - 1) / W);
    const first = await this.window(a);
    if (a === b) return first.subarray(start - a * W, end - a * W);
    const second = await this.window(b);
    const out = new Uint8Array(end - start);
    out.set(first.subarray(start - a * W));
    out.set(second.subarray(0, end - b * W), first.length - (start - a * W));
    return out;
  }
  window(n) {
    const window = this.windows.get(n);
    if (window !== undefined) return window;
    this.pending ??= new Map();
    let reading = this.pending.get(n);
    if (reading === undefined) {
      const W = this.W;
      reading = this.host.slice(this.path, n * W, Math.min((n + 1) * W, this.size)).then((bytes) => {
        this.windows.set(n, bytes);
        this.pending.delete(n);
        return bytes;
      });
      this.pending.set(n, reading);
    }
    return reading;
  }
}

const TYPES = ["", "commit", "tree", "blob", "tag"];

/** Applies a git delta to its base. */
export function applyDelta(base, delta) {
  let i = 0;
  const size = () => {
    let value = 0;
    let shift = 0;
    let c;
    do {
      c = delta[i++];
      value += (c & 0x7f) * 2 ** shift;
      shift += 7;
    } while (c & 0x80);
    return value;
  };
  if (size() !== base.length) throw new Error("a delta's base is not the size it names");
  const out = new Uint8Array(size());
  let o = 0;
  while (i < delta.length) {
    const op = delta[i++];
    if (op & 0x80) {
      let offset = 0;
      let length = 0;
      if (op & 1) offset += delta[i++];
      if (op & 2) offset += delta[i++] * 0x100;
      if (op & 4) offset += delta[i++] * 0x10000;
      if (op & 8) offset += delta[i++] * 0x1000000;
      if (op & 16) length += delta[i++];
      if (op & 32) length += delta[i++] * 0x100;
      if (op & 64) length += delta[i++] * 0x10000;
      if (length === 0) length = 0x10000;
      out.set(base.subarray(offset, offset + length), o);
      o += length;
    } else if (op) {
      out.set(delta.subarray(i, i + op), o);
      o += op;
      i += op;
    } else throw new Error("a delta holds the reserved instruction 0");
  }
  if (o !== out.length) throw new Error("a delta did not make the size it names");
  return out;
}

/**
 * Opens the repository whose git directory is `gitDir` (relative to the host's root). Where `gitDir` is a file (a
 * linked worktree's or a submodule's `.git`), it is followed if the host can reach where it points; otherwise the
 * error names the place.
 */
export async function openRepository(host, gitDir = ".git", options = {}) {
  const asFile = await host.read(gitDir).catch(() => null);
  if (asFile !== null) {
    const pointed = /^gitdir:\s*(.*?)\s*$/mu.exec(decoder.decode(asFile))?.[1];
    if (!pointed) throw new Error(`${gitDir} is a file that names no git directory`);
    // An absolute path is reached only where the host says where it lies under its root (`options.reach`); a page cannot.
    const absolute = pointed.startsWith("/") || /^[A-Za-z]:/u.test(pointed);
    const target = absolute ? (options.reach?.(pointed) ?? null) : join(gitDir, "..", pointed);
    if (target === null) throw Object.assign(new Error(`${gitDir} points outside the folder, to ${pointed}`), { outside: pointed });
    gitDir = target;
  }
  const commondir = await host.read(join(gitDir, "commondir"));
  const common = commondir === null ? gitDir : join(gitDir, decoder.decode(commondir).trim());
  if (common === null) throw new Error(`${gitDir}'s common directory lies outside the folder`);
  const repository = new Repository(host, gitDir, common, options);
  await repository.load();
  return repository;
}

class Repository {
  constructor(host, gitDir, common, options) {
    this.host = host;
    this.gitDir = gitDir;
    this.common = common;
    this.options = options;
    this.cache = new Lru(options.cacheBytes ?? 64 << 20, (o) => o.data.length + 64);
    this.trees = new Lru(options.treeBytes ?? 16 << 20, (t) => t.bytes);
    this.refusals = [];
    this.notes = [];
    // Inflate by the plain-JavaScript inflate (the default) or a DecompressionStream per object ("stream").
    this.inflate = options.inflate === "stream" ? (bytes) => inflate(bytes) : (bytes, size) => inflateSync(bytes, size);
  }

  async load() {
    const configBytes = await this.host.read(join(this.common, "config"));
    this.config = parseConfig(configBytes === null ? "" : decoder.decode(configBytes));
    const version = Number(this.config.get("core.repositoryformatversion") ?? "0");
    const known = new Set(["noop", "preciousobjects", "partialclone", "worktreeconfig"]);
    for (const [key, value] of this.config) {
      if (!key.startsWith("extensions.")) continue;
      const name = key.slice("extensions.".length);
      if (name === "objectformat" && value.toLowerCase() !== "sha1") this.refusals.push(`objects are named by ${value}, which this reader does not read`);
      else if (name === "refstorage" && value.toLowerCase() !== "files") this.refusals.push(`refs are kept as ${value}, which this reader does not read`);
      else if (name === "partialclone") this.notes.push(`a partial clone of ${value}: objects it was not given are absent`);
      else if (version >= 1 && !known.has(name) && name !== "objectformat" && name !== "refstorage") this.refusals.push(`the repository needs extensions.${name}, which this reader does not know`);
    }
    this.ignoreCase = truthy(this.config.get("core.ignorecase"));
    // Each loose object by id, to the object store that holds it: this repository's, then any its alternates name that
    // the host can reach (an absolute path only through `options.reach`, which a page has not).
    this.loose = new Map();
    const packs = [];
    const stores = [join(this.common, "objects")];
    for (let s = 0; s < stores.length && s < 6; s += 1) {
      const store = stores[s];
      for (const file of await this.host.list(store)) {
        const rest = file.slice(store === "" ? 0 : store.length + 1);
        if (/^[0-9a-f]{2}\/[0-9a-f]{38}$/u.test(rest)) this.loose.has(rest.replace("/", "")) || this.loose.set(rest.replace("/", ""), store);
        else if (/^pack\/pack-[0-9a-f]+\.idx$/u.test(rest)) packs.push(file);
        else if (/\.promisor$/u.test(rest)) this.notes.push(`${rest} is a promisor pack: objects it lacks were never fetched`);
        else if (rest === "info/alternates") {
          for (const line of decoder.decode(await this.host.read(file)).split("\n")) {
            const named = line.trim();
            if (named === "" || named.startsWith("#")) continue;
            const absolute = named.startsWith("/") || /^[A-Za-z]:/u.test(named);
            const other = absolute ? (this.options.reach?.(named) ?? null) : join(store, named);
            if (other === null) this.refusals.push(`objects/info/alternates names ${named}, which this host cannot reach`);
            else stores.push(other);
          }
        }
      }
    }
    this.packs = [];
    for (const index of packs) {
      const pack = index.replace(/\.idx$/u, ".pack");
      this.packs.push(new Pack(this.host, pack, await this.host.read(index), await this.host.size(pack), this.options));
    }
    const shallow = await this.host.read(join(this.common, "shallow"));
    this.shallow = new Set(shallow === null ? [] : decoder.decode(shallow).split("\n").filter(Boolean));
    if (this.refusals.length > 0) throw Object.assign(new Error(`this repository cannot be read: ${this.refusals.join("; ")}`), { refusals: this.refusals });
  }

  /** Every ref by its full name, loose ones over packed ones, and each annotated tag's peeled commit. */
  async refs() {
    const refs = new Map();
    const peeled = new Map();
    const packed = await this.host.read(join(this.common, "packed-refs"));
    let last;
    for (const line of packed === null ? [] : decoder.decode(packed).split("\n")) {
      if (line.startsWith("^")) peeled.set(last, line.slice(1).trim());
      else if (/^[0-9a-f]{40} /u.test(line)) refs.set((last = line.slice(41).trim()), line.slice(0, 40));
    }
    const prefix = join(this.common, "refs");
    for (const file of await this.host.list(prefix)) {
      const text = decoder.decode(await this.host.read(file)).trim();
      const name = this.common === "" ? file : file.slice(this.common.length + 1);
      refs.set(name, text);
      peeled.delete(name);
    }
    return { refs, peeled };
  }

  /** What a ref or HEAD names, followed through symbolic refs to a commit id; `{ branch, id }`. */
  async resolve(name = "HEAD") {
    const { refs } = (this.allRefs ??= await this.refs());
    let text;
    let branch = name;
    for (let hops = 0; hops < 10; hops += 1) {
      if (/^[0-9a-f]{40}$/u.test(name)) return { branch, id: name };
      if (name === "HEAD") {
        const head = await this.host.read(join(this.gitDir, "HEAD"));
        if (head === null) throw new Error("no HEAD");
        text = decoder.decode(head).trim();
      } else text = refs.get(name);
      if (text === undefined) throw new Error(`no ref ${name}`);
      if (text.startsWith("ref: ")) {
        name = text.slice(5).trim();
        branch = name.replace(/^refs\/heads\//u, "");
      } else return { branch, id: text };
    }
    throw new Error("symbolic refs in a cycle");
  }

  /** An object by id: `{ type, data }`. */
  async object(id) {
    const bytes = fromHex(id);
    for (let p = 0; p < this.packs.length; p += 1) {
      const offset = this.packs[p].find(bytes);
      if (offset >= 0) return this.packed(p, offset);
    }
    if (this.loose.has(id)) {
      const raw = await this.inflate(await this.host.read(join(this.loose.get(id), id.slice(0, 2), id.slice(2))));
      const nul = raw.indexOf(0);
      const [type, size] = decoder.decode(raw.subarray(0, nul)).split(" ");
      const data = raw.subarray(nul + 1);
      if (data.length !== Number(size)) throw new Error(`loose object ${id} is not the size it names`);
      return { type, data };
    }
    throw new Error(`object ${id} is in no pack and not loose${this.shallow.size > 0 ? " (a shallow clone)" : ""}`);
  }

  async packed(p, offset) {
    const key = p * 2 ** 40 + offset;
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;
    const pack = this.packs[p];
    const raw = await pack.bytes(offset, pack.endOf(offset));
    let c = raw[0];
    let type = (c >> 4) & 7;
    let size = c & 15;
    let i = 1;
    for (let shift = 4; c & 0x80; shift += 7) {
      c = raw[i++];
      size += (c & 0x7f) * 2 ** shift;
    }
    let base;
    if (type === 6) {
      c = raw[i++];
      let back = c & 0x7f;
      while (c & 0x80) {
        c = raw[i++];
        back = (back + 1) * 128 + (c & 0x7f);
      }
      base = await this.packed(p, offset - back);
    } else if (type === 7) {
      base = await this.object(toHex(raw, i));
      i += 20;
    }
    let data = await this.inflate(raw.subarray(i), size);
    if (data.length !== size) throw new Error(`the object at ${offset} of ${pack.path} is not the size it names`);
    if (base !== undefined) {
      data = applyDelta(base.data, data);
      type = TYPES.indexOf(base.type);
    }
    const object = { type: TYPES[type], data };
    this.cache.set(key, object);
    return object;
  }

  async commit(id) {
    const { type, data } = await this.object(id);
    if (type !== "commit") throw new Error(`${id} is a ${type}, not a commit`);
    const commit = parseCommit(id, data);
    // A shallow clone's boundary commit has no parents to git, whatever it names (its `%P` is empty).
    if (this.shallow.has(id)) commit.parents = [];
    return commit;
  }

  /** A tree's entries in the tree's order: `{ mode, name, id }`. */
  async tree(id) {
    let tree = this.trees.get(id);
    if (tree === undefined) {
      const { type, data } = await this.object(id);
      if (type !== "tree") throw new Error(`${id} is a ${type}, not a tree`);
      tree = { entries: parseTree(data), bytes: data.length * 2 + 64 };
      this.trees.set(id, tree);
    }
    return tree.entries;
  }

  async blob(id) {
    const { type, data } = await this.object(id);
    if (type !== "blob") throw new Error(`${id} is a ${type}, not a blob`);
    return data;
  }

  /** The head's first parents, oldest first, as `git rev-list --first-parent --reverse` lists them. */
  async mainline(head) {
    const out = [];
    for (let id = head; id !== undefined; ) {
      const commit = await this.commit(id);
      out.push(commit);
      id = this.shallow.has(id) ? undefined : commit.parents[0];
    }
    return out.reverse();
  }

  /** Every commit reachable from `heads`, by id. */
  async reachable(heads) {
    const seen = new Set(heads);
    const queue = [...heads];
    while (queue.length > 0) {
      const id = queue.pop();
      if (this.shallow.has(id)) continue;
      for (const parent of (await this.commit(id)).parents) {
        if (!seen.has(parent)) {
          seen.add(parent);
          queue.push(parent);
        }
      }
    }
    return seen;
  }

  /** The commits the tags name, an annotated tag's peeled. */
  async tagged() {
    const { refs, peeled } = (this.allRefs ??= await this.refs());
    const out = new Set();
    for (const [name, id] of refs) {
      if (!name.startsWith("refs/tags/")) continue;
      let target = peeled.get(name) ?? id;
      for (let hops = 0; hops < 10; hops += 1) {
        const { type, data } = await this.object(target);
        if (type !== "tag") break;
        target = decoder.decode(data.subarray(7, 47));
      }
      out.add(target);
    }
    return out;
  }

  /**
   * The files changed between two trees, as `git diff --no-renames --name-status` names them: `[status, path, id, mode]`
   * with A, D, M or T, `id` and `mode` the new side's (the old side's for D). Equal subtrees are passed over unread.
   */
  async changes(fromTree, toTree, prefix = "", out = []) {
    const before = fromTree === null ? [] : await this.tree(fromTree);
    const after = toTree === null ? [] : await this.tree(toTree);
    // Both lists are in the tree's order, so they are walked together; a file and a folder of one name are two entries.
    for (let i = 0, j = 0; i < before.length || j < after.length; ) {
      const a = before[i];
      const b = after[j];
      const order = a === undefined ? 1 : b === undefined ? -1 : treeOrder(a, b);
      if (order === 0) {
        i += 1;
        j += 1;
        if (a.id === b.id && a.mode === b.mode) continue;
      } else if (order < 0) {
        i += 1;
      } else {
        j += 1;
      }
      const x = order <= 0 ? a : undefined;
      const y = order >= 0 ? b : undefined;
      const path = prefix + (x ?? y).name;
      const xTree = x?.mode === "40000";
      const yTree = y?.mode === "40000";
      if (xTree || yTree) await this.changes(xTree ? x.id : null, yTree ? y.id : null, `${path}/`, out);
      else if (x && y) out.push([kind(x.mode) === kind(y.mode) ? "M" : "T", path, y.id, y.mode]);
      else if (x) out.push(["D", path, x.id, x.mode]);
      else out.push(["A", path, y.id, y.mode]);
    }
    return out;
  }

  /** Every entry of a commit's tree by path, as `git ls-tree -r --full-tree` lists them: `[path, id, mode]`. */
  async files(treeId, prefix = "", out = []) {
    for (const entry of await this.tree(treeId)) {
      if (entry.mode === "40000") await this.files(entry.id, `${prefix}${entry.name}/`, out);
      else out.push([prefix + entry.name, entry.id, entry.mode]);
    }
    return out;
  }
}

/** Git's order of tree entries: by the bytes of the name, a folder's name read with a "/" after it. */
function treeOrder(a, b) {
  const x = a.mode === "40000" ? `${a.name}/` : a.name;
  const y = b.mode === "40000" ? `${b.name}/` : b.name;
  if (x === y) return 0;
  // JavaScript compares UTF-16 units, which agrees with UTF-8's bytes everywhere below U+D800.
  if (/[^\u0000-퟿]/u.test(x + y)) {
    const [p, q] = [encoder.encode(x), encoder.encode(y)];
    for (let i = 0; i < Math.min(p.length, q.length); i += 1) if (p[i] !== q[i]) return p[i] - q[i];
    return p.length - q.length;
  }
  return x < y ? -1 : 1;
}

/** Bytes as text: by hand where they are ASCII, as most names are, and by the decoder otherwise. */
function text(data, start, end) {
  let out = "";
  for (let i = start; i < end; i += 1) {
    if (data[i] >= 0x80) return decoder.decode(data.subarray(start, end));
    out += String.fromCharCode(data[i]);
  }
  return out;
}

const kind = (mode) => (mode === "120000" ? "link" : mode === "160000" ? "gitlink" : "file");

export function parseTree(data) {
  const entries = [];
  let i = 0;
  while (i < data.length) {
    const space = data.indexOf(0x20, i);
    const nul = data.indexOf(0, space);
    const mode = decoder.decode(data.subarray(i, space));
    entries.push({ mode: mode === "040000" ? "40000" : mode, name: text(data, space + 1, nul), id: toHex(data, nul + 1) });
    i = nul + 21;
  }
  return entries;
}

/** A commit's tree, parents, author and committer (name, seconds, zone), and message. */
export function parseCommit(id, data) {
  const text = decoder.decode(data);
  const split = text.indexOf("\n\n");
  const header = split < 0 ? text : text.slice(0, split);
  const commit = { id, tree: "", parents: [], author: undefined, committer: undefined, encoding: undefined, message: split < 0 ? "" : text.slice(split + 2) };
  for (const line of header.split("\n")) {
    if (line.startsWith(" ")) continue;
    const space = line.indexOf(" ");
    const key = line.slice(0, space);
    const value = line.slice(space + 1);
    if (key === "tree") commit.tree = value;
    else if (key === "parent") commit.parents.push(value);
    else if (key === "author" || key === "committer") commit[key] = parsePerson(value);
    else if (key === "encoding") commit.encoding = value;
  }
  return commit;
}

function parsePerson(value) {
  const match = /^(.*?) ?<([^>]*)> (\d+) ([+-]\d{4})$/u.exec(value);
  if (!match) return { name: value, email: "", seconds: 0, zone: "+0000" };
  return { name: match[1], email: match[2], seconds: Number(match[3]), zone: match[4] };
}

/** A time as git's `%cI` writes it: the commit's own zone, `2026-11-21T18:33:00+01:00`, and `Z` for a zone of zero. */
export function isoStrict({ seconds, zone }) {
  const sign = zone[0] === "-" ? -1 : 1;
  const minutes = sign * (Number(zone.slice(1, 3)) * 60 + Number(zone.slice(3, 5)));
  const local = new Date((seconds + minutes * 60) * 1000).toISOString().slice(0, 19);
  return minutes === 0 ? `${local}Z` : `${local}${zone.slice(0, 3)}:${zone.slice(3, 5)}`;
}

/** A commit's subject as git's `%s` gives it: the first paragraph, its lines joined by spaces. */
export function subjectOf(message) {
  const lines = [];
  for (const line of message.replace(/^\n+/u, "").split("\n")) {
    if (line.trim() === "") break;
    lines.push(line.trim());
  }
  return lines.join(" ");
}
