/**
 * A scan's facts in one stored form: a binary layout, a text form of one fact a line, and the graph both describe.
 *
 * @remarks
 * A proposal of 2026-11-22. The specification is `.mdmd/layer-3/stored-form.mdmd.md`; where this code and that text
 * disagree, the text is meant and the code is wrong. The layout's name, its extension and its leading bytes are
 * provisional ({@link SIGNATURE}).
 *
 * This module imports nothing and uses only what Node and a browser both offer: `DecompressionStream`,
 * `CompressionStream`, `crypto.subtle`, `TextEncoder` and `TextDecoder`. Nothing in it reads a file, a clock, the
 * network or the environment, and no string it holds is ever interpreted: a name is carried, never run, parsed as
 * markup or used as a path.
 *
 * - {@link createWriter} takes a scan's files one at a time, in path order, and sets each section down as it fills.
 *   {@link resumeFrom} finds what a stopped write left whole, and a writer given it goes on to the same bytes.
 * - {@link openScan} answers the wiring questions after reading only the paths and the wires; {@link readScan} reads
 *   and checks everything. For any bytes at all both return facts or a refusal that says why.
 * - {@link textOf} and {@link scanOfText} turn the binary into the text form and back, without loss.
 * - {@link graphOf} gives the graph the facts describe: every file's edges and its wires both ways.
 *
 * @module
 */

// ============================================================================
// The model
// ============================================================================

/** Where a scan's documents are, relative to the scanned folder, and what they are named. */
export interface Location {
  root: string;
  baseLayer: string;
  extension: string;
}

/** One kind of thing the scan left out: why, how many, and a detail such as the patterns that left them out. */
export interface LeftOut {
  reason: string;
  count: number;
  detail: string;
}

/** What a scan says of itself: where its documents are, what made it, and what it left out. */
export interface ScanHead {
  location: Location;
  /** The tool that made the scan, as that tool names itself, for example `live-documentation 0.0.0`. */
  scanner: string;
  leftOut: LeftOut[];
}

/** Why something outside the code starts a file. */
export type EntryReason = "program" | "command" | "module" | "opening" | "tooling" | "declared";

/** One reason a file is an entry, with its evidence. */
export interface StoredEntry {
  reason: EntryReason;
  symbol?: { name: string; link?: string };
  command?: string;
  declarer?: { label: string; link: string };
}

/**
 * One type named on a symbol. A type with a link carries what the link names: the scanned path (`target`) and the
 * symbol's anchor on it (`anchor`), as the scanner read the link. Whether that path was scanned is the graph's to say.
 */
export interface StoredType {
  name: string;
  link?: string;
  target?: string;
  anchor?: string;
  array?: true;
  promise?: true;
}

/** The roles of a reference line that list types directly. */
export type ReferenceRole = "Returns" | "Extends" | "Implements" | "Constraints";

/** A line of type references on a symbol. */
export type StoredReference =
  | { role: ReferenceRole; types: StoredType[] }
  | { role: "Parameters"; parameters: { name: string; types: StoredType[] }[] };

/** A public symbol, its references and its documentation sections. */
export interface StoredSymbol {
  name: string;
  slug?: string;
  kind: string;
  flags: string[];
  source?: { path: string; line: number };
  references: StoredReference[];
  sections: { title: string; body: string[] }[];
  /**
   * The references the symbol's documentation makes, as the scanner read them from its documentation's lines: the
   * name as the author wrote it, the element that carries it where that is not a `see` (`exception`, `inheritdoc`),
   * and, where the scanner resolved it, the link and what the link names. Empty when it makes none.
   */
  documentation: StoredDocumentation[];
}

/** One reference a symbol's documentation makes, as the scanner read it. */
export interface StoredDocumentation {
  name: string;
  element?: string;
  link?: string;
  target?: string;
  anchor?: string;
}

/** One dependency line: a label, and for a workspace file the link and what it names. */
export interface StoredDependency {
  label: string;
  link?: string;
  target?: string;
  anchor?: string;
  symbols?: string[];
  qualifiers: string[];
}

/** One re-exported symbol. */
export interface StoredReExport {
  name: string;
  slug?: string;
  from?: { label: string; link: string };
  flags: string[];
}

/** One scanned file's facts. */
export interface StoredFile {
  /** The path of the file in the scanned folder, with forward slashes. */
  codePath: string;
  layer: number;
  archetype?: string;
  entries: StoredEntry[];
  generatedAt?: string;
  /** The words a person wrote about the file, verbatim. */
  authored: string;
  symbols: StoredSymbol[];
  dependencies: StoredDependency[];
  citedBy?: { label: string; link: string }[];
  reExports?: StoredReExport[];
}

/** A whole scan: its head and its files in path order. */
export interface Scan {
  head: ScanHead;
  files: StoredFile[];
}

/** The answer of a reader: facts, or a refusal that says why. */
export type Result<T> = { ok: true; value: T } | { ok: false; reason: string };

// ============================================================================
// Limits and the layout's constants
// ============================================================================

/**
 * The file's first eight bytes. Provisional: a door that closes at a first release, the owner's to settle. Shaped as
 * PNG's is, so that a transfer that changes line endings or drops the high bit is caught at the first byte.
 */
export const SIGNATURE = new Uint8Array([0x89, 0x46, 0x50, 0x4b, 0x0d, 0x0a, 0x1a, 0x0a]);

/** The layout's version, written in the head; a reader refuses any other. */
export const LAYOUT_VERSION = 1;

/** Files per section of records. */
export const CHUNK = 256;

/** The most bytes one section may inflate to. A writer refuses facts that would need more. */
export const MAX_SECTION = 64 * 1024 * 1024;

/** The most a raw deflate stream can grow, per stored byte, with slack for the smallest streams. */
const MAX_RATIO = 1032;
const RATIO_SLACK = 1024;

/**
 * The most bytes a whole file's sections may inflate to, by the file's size: 64 times it, and a mebibyte. Every fact a
 * reader builds takes at least one of those bytes, so this bounds what reading costs by the file's size. Real scans
 * inflate about four times (the measurements beside the specification).
 */
export function inflationBound(fileBytes: number): number {
  return 64 * fileBytes + 1024 * 1024;
}

const HEAD = 1;
const STRINGS = 2;
const RECORDS = 3;
const PATHS = 4;
const WIRES = 5;
const END = 6;
const FRAME_HEADER = 1 + 4 + 4 + 4 + 32;
const MAX_U32 = 0xffffffff;

const ENTRY_REASONS: readonly EntryReason[] = ["program", "command", "module", "opening", "tooling", "declared"];
const ROLES = ["Returns", "Extends", "Implements", "Constraints", "Parameters"] as const;

// ============================================================================
// Refusals
// ============================================================================

/** Why bytes or text were refused, or facts could not be stored. Thrown inside; returned as a {@link Result}. */
export class Refusal extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "Refusal";
  }
}

function refuse(reason: string): never {
  throw new Refusal(reason);
}

async function settle<T>(work: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, value: await work() };
  } catch (error) {
    if (error instanceof Refusal) return { ok: false, reason: error.message };
    throw error;
  }
}

// ============================================================================
// Bytes
// ============================================================================

const encoder = new TextEncoder();
const strictDecoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

class Out {
  private buf = new Uint8Array(1 << 12);
  length = 0;

  private room(n: number): void {
    if (this.length + n <= this.buf.length) return;
    let size = this.buf.length * 2;
    while (size < this.length + n) size *= 2;
    const next = new Uint8Array(size);
    next.set(this.buf.subarray(0, this.length));
    this.buf = next;
  }

  byte(b: number): void {
    this.room(1);
    this.buf[this.length++] = b;
  }

  varint(n: number): void {
    if (!Number.isInteger(n) || n < 0 || n > MAX_U32) refuse(`a number the layout cannot hold: ${n}`);
    this.room(5);
    while (n >= 0x80) {
      this.buf[this.length++] = (n & 0x7f) | 0x80;
      n = Math.floor(n / 128);
    }
    this.buf[this.length++] = n;
  }

  u32(n: number): void {
    this.room(4);
    new DataView(this.buf.buffer).setUint32(this.length, n, true);
    this.length += 4;
  }

  bytes(b: Uint8Array): void {
    this.room(b.length);
    this.buf.set(b, this.length);
    this.length += b.length;
  }

  text(s: string): void {
    const b = encoder.encode(s);
    this.varint(b.length);
    this.bytes(b);
  }

  done(): Uint8Array {
    return this.buf.slice(0, this.length);
  }
}

class In {
  at = 0;
  private readonly b: Uint8Array;
  private readonly what: string;

  constructor(b: Uint8Array, what: string) {
    this.b = b;
    this.what = what;
  }

  get left(): number {
    return this.b.length - this.at;
  }

  byte(): number {
    if (this.at >= this.b.length) refuse(`${this.what} ends early`);
    return this.b[this.at++];
  }

  /** A varint of at most five bytes, at most 2^32 - 1, in its shortest form. */
  varint(): number {
    let n = 0;
    let scale = 1;
    for (let i = 0; i < 5; i += 1) {
      const b = this.byte();
      n += (b & 0x7f) * scale;
      if (b < 0x80) {
        if (b === 0 && i > 0) refuse(`${this.what} holds a number written longer than it needs`);
        if (n > MAX_U32) refuse(`${this.what} holds a number past 2^32 - 1`);
        return n;
      }
      scale *= 128;
    }
    return refuse(`${this.what} holds a number longer than five bytes`);
  }

  /** A count of things each at least `each` bytes long, checked against what is left before anything is allocated. */
  count(each = 1): number {
    const n = this.varint();
    if (n * each > this.left) refuse(`${this.what} claims ${n} items in ${this.left} bytes`);
    return n;
  }

  slice(n: number): Uint8Array {
    if (n > this.left) refuse(`${this.what} claims ${n} bytes where ${this.left} are left`);
    const out = this.b.subarray(this.at, this.at + n);
    this.at += n;
    return out;
  }

  text(): string {
    return decodeText(this.slice(this.varint()), this.what);
  }

  end(): void {
    if (this.left !== 0) refuse(`${this.what} has ${this.left} bytes after its last fact`);
  }
}

function decodeText(bytes: Uint8Array, what: string): string {
  try {
    return strictDecoder.decode(bytes);
  } catch {
    return refuse(`${what} holds text that is not UTF-8`);
  }
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

function u32At(bytes: Uint8Array, at: number): number {
  return new DataView(bytes.buffer, bytes.byteOffset + at, 4).getUint32(0, true);
}

function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
}

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes as Uint8Array<ArrayBuffer>));
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function drain(readable: ReadableStream<Uint8Array>, limit: number, what: string): Promise<Uint8Array> {
  const reader = readable.getReader();
  const parts: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > limit) {
      await reader.cancel().catch(() => undefined);
      refuse(`${what} inflates past the ${limit} bytes it declares`);
    }
    parts.push(value);
  }
  return concat(parts);
}

async function deflate(raw: Uint8Array): Promise<Uint8Array> {
  const stream = new CompressionStream("deflate-raw");
  const writer = stream.writable.getWriter();
  const written = writer.write(raw as Uint8Array<ArrayBuffer>).then(() => writer.close());
  const out = await drain(stream.readable, Number.MAX_SAFE_INTEGER, "a section");
  await written;
  return out;
}

/** Inflates a raw deflate stream that must give exactly `rawLength` bytes, stopping the moment it would give more. */
async function inflateExact(stored: Uint8Array, rawLength: number, what: string): Promise<Uint8Array> {
  const stream = new DecompressionStream("deflate-raw");
  const writer = stream.writable.getWriter();
  const written = writer.write(stored as Uint8Array<ArrayBuffer>).then(() => writer.close());
  written.catch(() => undefined);
  let out: Uint8Array;
  try {
    out = await drain(stream.readable, rawLength, what);
  } catch (error) {
    await writer.abort().catch(() => undefined);
    if (error instanceof Refusal) throw error;
    return refuse(`${what} is not a whole raw deflate stream`);
  }
  try {
    await written;
  } catch {
    return refuse(`${what} is not a whole raw deflate stream`);
  }
  if (out.length !== rawLength) refuse(`${what} inflates to ${out.length} bytes, not the ${rawLength} it declares`);
  return out;
}

// ============================================================================
// Strings and paths: the checks every string and path meets
// ============================================================================

function checkText(s: unknown, what: string): string {
  if (typeof s !== "string") refuse(`${what} is not text`);
  if (!s.isWellFormed()) refuse(`${what} holds a lone surrogate, which UTF-8 cannot carry`);
  return s;
}

/** True when a string names a place outside the scanned folder: an absolute path, a drive, a share or a file URL. */
function isAbsolute(s: string): boolean {
  const c0 = s.charCodeAt(0);
  if (c0 === 0x2f || c0 === 0x5c) return true;
  if (s.charCodeAt(1) === 0x3a && ((c0 >= 0x41 && c0 <= 0x5a) || (c0 >= 0x61 && c0 <= 0x7a))) return true;
  // `x | 0x20` folds only the ASCII capital to its small letter for these letters, and leaves `:` as it is.
  return s.length >= 5 && (c0 | 0x20) === 0x66 && (s.charCodeAt(1) | 0x20) === 0x69 && (s.charCodeAt(2) | 0x20) === 0x6c && (s.charCodeAt(3) | 0x20) === 0x65 && s.charCodeAt(4) === 0x3a;
}

function checkPath(s: unknown, what: string): string {
  const path = checkText(s, what);
  if (path === "" || isAbsolute(path)) refuse(`${what} ${JSON.stringify(path)} is not a relative path`);
  // One pass: each segment, from just after a slash to the next, must be neither empty, `.` nor `..`.
  let start = 0;
  for (let i = 0; i <= path.length; i += 1) {
    const c = i < path.length ? path.charCodeAt(i) : 0x2f;
    if (c === 0) refuse(`${what} ${JSON.stringify(path)} is not a relative path`);
    if (c !== 0x2f) continue;
    const n = i - start;
    if (n === 0 || (n === 1 && path.charCodeAt(start) === 0x2e) || (n === 2 && path.charCodeAt(start) === 0x2e && path.charCodeAt(start + 1) === 0x2e)) {
      refuse(`${what} ${JSON.stringify(path)} is not a plain relative path`);
    }
    start = i + 1;
  }
  return path;
}

function checkLink(s: unknown, what: string): string {
  const link = checkText(s, what);
  if (isAbsolute(link)) refuse(`${what} ${JSON.stringify(link)} names an absolute place`);
  return link;
}

/** A location's folder: empty, or a plain relative path. */
function checkFolder(s: unknown, what: string): string {
  const folder = checkText(s, what);
  return folder === "" ? folder : checkPath(folder, what);
}

function checkCount(n: unknown, what: string): number {
  if (typeof n !== "number" || !Number.isInteger(n) || n < 0 || n > MAX_U32) refuse(`${what} is not a whole number from 0 to 2^32 - 1`);
  return n;
}

/**
 * The order paths are kept in: by their UTF-8 bytes, which is the order of their code points, and the order a reader in
 * any language gets by comparing bytes (as git orders a tree). Computed on UTF-16 units without encoding: at the first
 * unit that differs, a surrogate (a code point above U+FFFF) sorts after every other unit, which it does not by value
 * alone against U+E000 to U+FFFF. Strings are well formed, so a surrogate here is always half of a pair.
 */
export function comparePaths(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    const x = a.charCodeAt(i);
    const y = b.charCodeAt(i);
    if (x === y) continue;
    const xs = x >= 0xd800 && x <= 0xdfff;
    const ys = y >= 0xd800 && y <= 0xdfff;
    if (xs !== ys) return xs ? 1 : -1;
    return x < y ? -1 : 1;
  }
  return a.length === b.length ? 0 : a.length < b.length ? -1 : 1;
}

// ============================================================================
// The record: one file's facts in the layout, and the walk both directions share
// ============================================================================

/**
 * The one walk over a file's facts, in the layout's order. Writing and reading share it, so that the order strings are
 * first met in, which numbers them, is the same in both by construction.
 */
interface Codec {
  str(value: string | undefined, what: string): string;
  /** A string that must be a path (section 2.4 of the specification). */
  path(value: string | undefined, what: string): string;
  /** A string that must be a link. */
  link(value: string | undefined, what: string): string;
  num(value: number | undefined, what: string): number;
  bits(value: number | undefined, defined: number, what: string): number;
  list<T>(items: T[] | undefined, what: string, each: (item: T | undefined) => T): T[];
}

function walkFile(c: Codec, f: StoredFile | undefined): StoredFile {
  const codePath = c.path(f?.codePath, "a path");
  // A refusal says what it found and where; the file's path is put before it here, once, rather than built into every
  // field's words as the walk goes, which cost the whole read more than its decoding did.
  try {
    return walkFacts(c, f, codePath);
  } catch (error) {
    if (error instanceof Refusal) throw new Refusal(`the facts of ${JSON.stringify(codePath)}: ${error.message}`);
    throw error;
  }
}

function walkFacts(c: Codec, f: StoredFile | undefined, codePath: string): StoredFile {
  const layer = c.num(f?.layer, `its layer`);
  const presence = c.bits(f && (+(f.archetype !== undefined) | (+(f.generatedAt !== undefined) << 1) | (+(f.citedBy !== undefined) << 2) | (+(f.reExports !== undefined) << 3)), 0b1111, `its marks`);
  const file: StoredFile = { codePath, layer, entries: [], authored: "", symbols: [], dependencies: [] };
  if (presence & 1) file.archetype = c.str(f?.archetype, `its archetype`);
  file.entries = c.list(f?.entries, `its entries`, (e) => walkEntry(c, e));
  if (presence & 2) file.generatedAt = c.str(f?.generatedAt, `when it was generated`);
  file.authored = c.str(f?.authored, `its authored words`);
  file.symbols = c.list(f?.symbols, `its symbols`, (s) => walkSymbol(c, s));
  file.dependencies = c.list(f?.dependencies, `its dependencies`, (d) => walkDependency(c, d));
  if (presence & 4) {
    file.citedBy = c.list(f?.citedBy, `what cites it`, (x) => ({ label: c.str(x?.label, `a citing label`), link: c.link(x?.link, `a citing link`) }));
  }
  if (presence & 8) file.reExports = c.list(f?.reExports, `its re-exports`, (r) => walkReExport(c, r));
  return file;
}

function walkEntry(c: Codec, e: StoredEntry | undefined): StoredEntry {
  const reasonIndex = c.num(e && ENTRY_REASONS.indexOf(e.reason), `an entry's reason`);
  if (reasonIndex < 0 || reasonIndex >= ENTRY_REASONS.length) refuse(`an entry's reason is not one the layout names`);
  const bits = c.bits(e && (+(e.symbol !== undefined) | (+(e.symbol?.link !== undefined) << 1) | (+(e.command !== undefined) << 2) | (+(e.declarer !== undefined) << 3)), 0b1111, `an entry`);
  if ((bits & 2) && !(bits & 1)) refuse(`an entry's symbol link without its symbol`);
  const entry: StoredEntry = { reason: ENTRY_REASONS[reasonIndex] };
  if (bits & 1) {
    entry.symbol = { name: c.str(e?.symbol?.name, `an entry's symbol`) };
    if (bits & 2) entry.symbol.link = c.link(e?.symbol?.link, `an entry's link`);
  }
  if (bits & 4) entry.command = c.str(e?.command, `an entry's command`);
  if (bits & 8) entry.declarer = { label: c.str(e?.declarer?.label, `an entry's declarer`), link: c.link(e?.declarer?.link, `an entry's declarer link`) };
  return entry;
}

/** A link, and what it names: present together in this order, `target` only with a link and `anchor` only with a target. */
function walkLinked(c: Codec, bits: number, v: { link?: string; target?: string; anchor?: string } | undefined, into: { link?: string; target?: string; anchor?: string }): void {
  if ((bits & 2) && !(bits & 1)) refuse(`a target without a link`);
  if ((bits & 4) && !(bits & 2)) refuse(`an anchor without a target`);
  if (bits & 1) into.link = c.link(v?.link, `a link`);
  if (bits & 2) into.target = c.path(v?.target, `a target`);
  if (bits & 4) into.anchor = c.str(v?.anchor, `an anchor`);
}

function linkedBits(v: { link?: string; target?: string; anchor?: string }): number {
  return +(v.link !== undefined) | (+(v.target !== undefined) << 1) | (+(v.anchor !== undefined) << 2);
}

function walkType(c: Codec, t: StoredType | undefined): StoredType {
  const type: StoredType = { name: c.str(t?.name, `a type`) };
  const bits = c.bits(t && (linkedBits(t) | (+(t.array === true) << 3) | (+(t.promise === true) << 4)), 0b11111, `a type`);
  walkLinked(c, bits, t, type);
  if (bits & 8) type.array = true;
  if (bits & 16) type.promise = true;
  return type;
}

function walkSymbol(c: Codec, s: StoredSymbol | undefined): StoredSymbol {
  const name = c.str(s?.name, `a symbol's name`);
  const bits = c.bits(s && (+(s.slug !== undefined) | (+(s.source !== undefined) << 1)), 0b11, `a symbol`);
  const symbol: StoredSymbol = { name, kind: "", flags: [], references: [], sections: [], documentation: [] };
  if (bits & 1) symbol.slug = c.str(s?.slug, `a symbol's slug`);
  symbol.kind = c.str(s?.kind, `a symbol's kind`);
  symbol.flags = c.list(s?.flags, `a symbol's flags`, (x) => c.str(x, `a flag`));
  if (bits & 2) symbol.source = { path: c.link(s?.source?.path, `a source`), line: c.num(s?.source?.line, `a source line`) };
  symbol.references = c.list(s?.references, `a symbol's references`, (r) => {
    const role = c.num(r && ROLES.indexOf(r.role), `a reference's role`);
    if (role < 0 || role >= ROLES.length) refuse(`a reference's role is not one the layout names`);
    if (role === 4) {
      const parameters = c.list((r as { parameters?: { name: string; types: StoredType[] }[] } | undefined)?.parameters, `parameters`, (p) => ({
        name: c.str(p?.name, `a parameter`),
        types: c.list(p?.types, `a parameter's types`, (t) => walkType(c, t))
      }));
      return { role: "Parameters", parameters };
    }
    return { role: ROLES[role] as ReferenceRole, types: c.list((r as { types?: StoredType[] } | undefined)?.types, `types`, (t) => walkType(c, t)) };
  });
  symbol.sections = c.list(s?.sections, `a symbol's sections`, (x) => ({
    title: c.str(x?.title, `a section's title`),
    body: c.list(x?.body, `a section's lines`, (line) => c.str(line, `a section's line`))
  }));
  symbol.documentation = c.list(s?.documentation, `a symbol's documentation`, (d) => {
    const reference = { name: c.str(d?.name, `a documentation reference`) } as StoredDocumentation;
    const bits = c.bits(d && (linkedBits(d) | (+(d.element !== undefined) << 3)), 0b1111, `a documentation reference`);
    if (bits & 8) reference.element = c.str(d?.element, `a documentation reference's element`);
    walkLinked(c, bits, d, reference);
    return reference;
  });
  return symbol;
}

function walkDependency(c: Codec, d: StoredDependency | undefined): StoredDependency {
  const dependency: StoredDependency = { label: c.str(d?.label, `a dependency`), qualifiers: [] };
  const bits = c.bits(d && (linkedBits(d) | (+(d.symbols !== undefined) << 3)), 0b1111, `a dependency`);
  walkLinked(c, bits, d, dependency);
  if (bits & 8) dependency.symbols = c.list(d?.symbols, `a dependency's symbols`, (x) => c.str(x, `a dependency's symbol`));
  dependency.qualifiers = c.list(d?.qualifiers, `a dependency's qualifiers`, (x) => c.str(x, `a qualifier`));
  return dependency;
}

function walkReExport(c: Codec, r: StoredReExport | undefined): StoredReExport {
  // Built in the key order the docs' reader gives, so that a graph made from it prints as today's index does.
  const reExport = { name: c.str(r?.name, `a re-export`) } as StoredReExport;
  const bits = c.bits(r && (+(r.slug !== undefined) | (+(r.from !== undefined) << 1)), 0b11, `a re-export`);
  if (bits & 1) reExport.slug = c.str(r?.slug, `a re-export's slug`);
  if (bits & 2) reExport.from = { label: c.str(r?.from?.label, `a re-export's origin`), link: c.link(r?.from?.link, `a re-export's link`) };
  reExport.flags = c.list(r?.flags, `a re-export's flags`, (x) => c.str(x, `a flag`));
  return reExport;
}

/** Writes through the walk: every string interned as it is first met, in the walk's order. */
class Encoding implements Codec {
  readonly out = new Out();
  private readonly ids: Map<string, number>;
  private readonly fresh: string[];

  constructor(ids: Map<string, number>, fresh: string[]) {
    this.ids = ids;
    this.fresh = fresh;
  }

  str(value: string | undefined, what: string): string {
    const s = checkText(value, what);
    let id = this.ids.get(s);
    if (id === undefined) {
      id = this.ids.size;
      this.ids.set(s, id);
      this.fresh.push(s);
    }
    this.out.varint(id);
    return s;
  }

  path(value: string | undefined, what: string): string {
    return checkPath(this.str(value, what), what);
  }

  link(value: string | undefined, what: string): string {
    return checkLink(this.str(value, what), what);
  }

  num(value: number | undefined, what: string): number {
    const n = checkCount(value, what);
    this.out.varint(n);
    return n;
  }

  bits(value: number | undefined, _defined: number, what: string): number {
    const n = checkCount(value, what);
    this.out.varint(n);
    return n;
  }

  list<T>(items: T[] | undefined, what: string, each: (item: T | undefined) => T): T[] {
    if (!Array.isArray(items)) refuse(`${what} is not a list`);
    this.out.varint(items.length);
    return items.map((item) => each(item));
  }
}

/** The length of a well-formed string's UTF-8, counted from its UTF-16 units without encoding it. */
function utf8Length(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i += 1) {
    const u = s.charCodeAt(i);
    // A surrogate is half of a pair, whose code point takes four bytes: two for each half.
    n += u < 0x80 ? 1 : u < 0x800 || (u >= 0xd800 && u <= 0xdfff) ? 2 : 3;
  }
  return n;
}

/** Counts, through the walk, the UTF-8 bytes of every string as often as it is named. */
class Measuring implements Codec {
  total = 0;

  str(value: string | undefined): string {
    this.total += utf8Length(value ?? "");
    return value ?? "";
  }

  path(value: string | undefined): string {
    return this.str(value);
  }

  link(value: string | undefined): string {
    return this.str(value);
  }

  num(value: number | undefined): number {
    return value ?? 0;
  }

  bits(value: number | undefined): number {
    return value ?? 0;
  }

  list<T>(items: T[] | undefined, _what: string, each: (item: T | undefined) => T): T[] {
    return (items ?? []).map((item) => each(item));
  }
}

/**
 * Reads through the walk. A string's number must be one already met, or the next one: so the strings are numbered in
 * the order first met, and every string set down before a section of records is met in it.
 */
class Decoding implements Codec {
  met: number;
  private readonly input: In;
  private readonly strings: string[];
  private readonly checked: number[];

  /** `checked` marks, by a string's number, that it was found a path (1) or a link (2): each is checked once a scan. */
  constructor(input: In, strings: string[], met: number, checked: number[]) {
    this.input = input;
    this.strings = strings;
    this.met = met;
    this.checked = checked;
  }

  private id(): number {
    const id = this.input.varint();
    if (id > this.met || id >= this.strings.length) refuse(`a string numbered ${id} where the next new one is ${this.met}`);
    if (id === this.met) this.met += 1;
    return id;
  }

  str(): string {
    return this.strings[this.id()];
  }

  path(_value: string | undefined, what: string): string {
    const id = this.id();
    if (!((this.checked[id] ?? 0) & 1)) {
      checkPath(this.strings[id], what);
      this.checked[id] = (this.checked[id] ?? 0) | 1;
    }
    return this.strings[id];
  }

  link(_value: string | undefined, what: string): string {
    const id = this.id();
    if (!((this.checked[id] ?? 0) & 2)) {
      checkLink(this.strings[id], what);
      this.checked[id] = (this.checked[id] ?? 0) | 2;
    }
    return this.strings[id];
  }

  num(): number {
    return this.input.varint();
  }

  bits(_value: number | undefined, defined: number, what: string): number {
    const n = this.input.varint();
    if ((n & ~defined) !== 0) refuse(`${what} sets a mark the layout does not define`);
    return n;
  }

  list<T>(_items: T[] | undefined, _what: string, each: (item: T | undefined) => T): T[] {
    const n = this.input.count();
    const out: T[] = [];
    for (let i = 0; i < n; i += 1) out.push(each(undefined));
    return out;
  }
}

/** The links of a file that make edges, in the order the graph lists its edges: its dependencies, then its symbols' types. */
function linkedTargets(file: StoredFile): (string | undefined)[] {
  const out: (string | undefined)[] = [];
  for (const d of file.dependencies) if (d.link !== undefined) out.push(d.target);
  for (const s of file.symbols) {
    for (const r of s.references) {
      if (r.role === "Parameters") {
        for (const p of r.parameters) for (const t of p.types) if (t.link !== undefined) out.push(t.target);
      } else {
        for (const t of r.types) if (t.link !== undefined) out.push(t.target);
      }
    }
  }
  return out;
}

/** The scanned files a file's links name, other than itself, in path order: its outbound wires. */
function outboundOf(file: StoredFile, index: Map<string, number>): number[] {
  const self = index.get(file.codePath);
  const set = new Set<number>();
  for (const target of linkedTargets(file)) {
    const j = target === undefined ? undefined : index.get(target);
    if (j !== undefined && j !== self) set.add(j);
  }
  return [...set].sort((a, b) => a - b);
}

// ============================================================================
// Sections
// ============================================================================

/**
 * The extension ends every document path, so it holds nothing a path could not: no `/` or `\`, which would put the
 * document in another folder on one system or another, and no NUL, which no file system's names hold.
 */
function checkExtension(extension: string): void {
  for (let i = 0; i < extension.length; i += 1) {
    const c = extension.charCodeAt(i);
    if (c === 0x2f || c === 0x5c || c === 0) refuse("the location's extension holds a slash, a backslash or a NUL");
  }
}

function headBytes(head: ScanHead): Uint8Array {
  const out = new Out();
  out.byte(LAYOUT_VERSION);
  out.text(checkFolder(head.location?.root, "the location's root"));
  out.text(checkFolder(head.location?.baseLayer, "the location's base layer"));
  const extension = checkText(head.location?.extension, "the location's extension");
  checkExtension(extension);
  out.text(extension);
  out.text(checkText(head.scanner, "the scanner"));
  if (!Array.isArray(head.leftOut)) refuse("what was left out is not a list");
  out.varint(head.leftOut.length);
  for (const l of head.leftOut) {
    out.text(checkText(l?.reason, "a reason something was left out"));
    out.varint(checkCount(l?.count, "how many were left out"));
    out.text(checkText(l?.detail, "the detail of what was left out"));
  }
  return out.done();
}

function readHead(raw: Uint8Array): ScanHead {
  const input = new In(raw, "the head");
  const version = input.byte();
  if (version !== LAYOUT_VERSION) refuse(`the layout's version is ${version}; this reader reads ${LAYOUT_VERSION}`);
  const root = checkFolder(input.text(), "the location's root");
  const baseLayer = checkFolder(input.text(), "the location's base layer");
  const extension = checkText(input.text(), "the location's extension");
  checkExtension(extension);
  const scanner = checkText(input.text(), "the scanner");
  const leftOut: LeftOut[] = [];
  const n = input.count(3);
  for (let i = 0; i < n; i += 1) {
    leftOut.push({ reason: checkText(input.text(), "a reason"), count: input.varint(), detail: checkText(input.text(), "a detail") });
  }
  input.end();
  return { location: { root, baseLayer, extension }, scanner, leftOut };
}

function stringsBytes(strings: string[]): Uint8Array {
  const out = new Out();
  for (const s of strings) out.text(s);
  return out.done();
}

function pathsBytes(paths: string[]): Uint8Array {
  const out = new Out();
  let previous: Uint8Array = new Uint8Array(0);
  for (const p of paths) {
    const b = encoder.encode(p);
    let shared = 0;
    while (shared < previous.length && shared < b.length && previous[shared] === b[shared]) shared += 1;
    out.varint(shared);
    out.varint(b.length - shared);
    out.bytes(b.subarray(shared));
    previous = b;
  }
  return out.done();
}

/**
 * The paths, front-coded. Every path is also a string of the file, so together they are no longer than the strings
 * (`budget`, the strings' declared bytes): a beginning shared over and over cannot make them grow past the file.
 */
function readPaths(raw: Uint8Array, count: number, budget: number): string[] {
  const input = new In(raw, "the paths");
  if (count * 2 > raw.length) refuse(`the paths claim ${count} paths in ${raw.length} bytes`);
  const paths: string[] = [];
  let buffer = new Uint8Array(256);
  let previous = 0;
  let spent = 0;
  for (let i = 0; i < count; i += 1) {
    const shared = input.varint();
    const rest = input.slice(input.varint());
    spent += shared + rest.length;
    if (spent > budget) refuse("the paths are longer than the strings that hold them");
    if (shared > previous) refuse("a path shares more with the one before it than that one holds");
    if (shared < previous && rest.length > 0 && buffer[shared] === rest[0]) refuse("a path's shared beginning is written shorter than it is");
    const length = shared + rest.length;
    if (length > buffer.length) {
      const grown = new Uint8Array(Math.max(length, buffer.length * 2));
      grown.set(buffer.subarray(0, shared));
      buffer = grown;
    }
    buffer.set(rest, shared);
    const p = checkPath(decodeText(buffer.subarray(0, length), "the paths"), "a path");
    if (paths.length > 0 && comparePaths(paths[paths.length - 1], p) >= 0) refuse(`the paths are not in order at ${JSON.stringify(p)}`);
    paths.push(p);
    previous = length;
  }
  input.end();
  return paths;
}

function wiresBytes(outbound: number[][]): Uint8Array {
  const out = new Out();
  for (const list of outbound) {
    out.varint(list.length);
    list.forEach((j, k) => out.varint(k === 0 ? j : j - list[k - 1] - 1));
  }
  return out.done();
}

function readWires(raw: Uint8Array, count: number): number[][] {
  const input = new In(raw, "the wires");
  if (count > raw.length) refuse(`the wires claim ${count} files in ${raw.length} bytes`);
  const outbound: number[][] = [];
  for (let i = 0; i < count; i += 1) {
    const n = input.count();
    const list: number[] = [];
    for (let k = 0; k < n; k += 1) {
      const j = k === 0 ? input.varint() : list[k - 1] + 1 + input.varint();
      if (j >= count || j === i) refuse(`a wire of file ${i} names file ${j}`);
      list.push(j);
    }
    outbound.push(list);
  }
  input.end();
  return outbound;
}

// ============================================================================
// Frames
// ============================================================================

interface Frame {
  kind: number;
  count: number;
  rawLength: number;
  storedAt: number;
  storedLength: number;
  hash: Uint8Array;
  end: number;
}

async function frameOf(kind: number, count: number, raw: Uint8Array): Promise<{ bytes: Uint8Array; hash: Uint8Array }> {
  if (raw.length > MAX_SECTION) refuse(`a section of ${raw.length} bytes is past the layout's ${MAX_SECTION}`);
  const stored = await deflate(raw);
  const hash = await sha256(raw);
  const header = new Out();
  header.byte(kind);
  header.u32(count);
  header.u32(raw.length);
  header.u32(stored.length);
  header.bytes(hash);
  return { bytes: concat([header.done(), stored]), hash };
}

/**
 * Hops the frames' headers from the signature on, checking each declared length against the bytes there are before
 * reading on. Stops at the end frame, or where the bytes run out; `cut` says the last frame ran past the end.
 */
function hop(bytes: Uint8Array): { frames: Frame[]; cut: boolean } {
  if (bytes.length < SIGNATURE.length || !equalBytes(bytes.subarray(0, SIGNATURE.length), SIGNATURE)) refuse("these bytes do not begin with the layout's signature");
  const frames: Frame[] = [];
  let at = SIGNATURE.length;
  let raw = 0;
  while (at < bytes.length) {
    if (at + FRAME_HEADER > bytes.length) return { frames, cut: true };
    const kind = bytes[at];
    if (kind < HEAD || kind > END) refuse(`a section of kind ${kind} at byte ${at}, which the layout does not define`);
    const count = u32At(bytes, at + 1);
    const rawLength = u32At(bytes, at + 5);
    const storedLength = u32At(bytes, at + 9);
    const storedAt = at + FRAME_HEADER;
    if (rawLength > MAX_SECTION) refuse(`a section at byte ${at} declares ${rawLength} bytes, past the layout's ${MAX_SECTION}`);
    if (rawLength > storedLength * MAX_RATIO + RATIO_SLACK) refuse(`a section at byte ${at} declares ${rawLength} bytes from ${storedLength}, more than deflate can give`);
    if (storedAt + storedLength > bytes.length) return { frames, cut: true };
    raw += rawLength;
    if (raw > inflationBound(bytes.length)) refuse(`the sections declare ${raw} bytes in all from a file of ${bytes.length}, past ${inflationBound(bytes.length)}`);
    const frame = { kind, count, rawLength, storedAt, storedLength, hash: bytes.subarray(at + 13, at + 45), end: storedAt + storedLength };
    frames.push(frame);
    at = frame.end;
    if (kind === END) {
      if (at !== bytes.length) refuse(`${bytes.length - at} bytes after the end`);
      break;
    }
  }
  return { frames, cut: false };
}

async function rawOf(bytes: Uint8Array, f: Frame, what: string): Promise<Uint8Array> {
  const raw = await inflateExact(bytes.subarray(f.storedAt, f.end), f.rawLength, what);
  if (!equalBytes(await sha256(raw), f.hash)) refuse(`${what} does not match its hash`);
  return raw;
}

const KIND_NAMES = ["", "the head", "strings", "records", "the paths", "the wires", "the end"];

/** Checks the frames' order: head, then strings only just before records, then the paths, the wires and the end. */
function checkOrder(frames: Frame[], complete: boolean): void {
  if (frames.length === 0) {
    if (complete) refuse("there is no head");
    return;
  }
  if (frames[0].kind !== HEAD || frames[0].count !== 0) refuse("the first section is not the head");
  let i = 1;
  let files = 0;
  let last = CHUNK;
  while (i < frames.length && (frames[i].kind === STRINGS || frames[i].kind === RECORDS)) {
    const f = frames[i];
    if (f.kind === STRINGS) {
      if (f.count === 0) refuse("a section of no strings");
      if (frames[i + 1] !== undefined && frames[i + 1].kind !== RECORDS) refuse("strings not followed by records");
    } else {
      if (last !== CHUNK) refuse(`a section of ${last} records before the last`);
      if (f.count === 0 || f.count > CHUNK) refuse(`a section of ${f.count} records`);
      last = f.count;
      files += f.count;
    }
    i += 1;
  }
  if (!complete) {
    if (i < frames.length && frames[i].kind !== PATHS && frames[i].kind !== WIRES) refuse(`${KIND_NAMES[frames[i].kind]} where records or the paths belong`);
    return;
  }
  const rest = frames.slice(i).map((f) => f.kind);
  if (rest.length !== 3 || rest[0] !== PATHS || rest[1] !== WIRES || rest[2] !== END) refuse("the sections after the records are not the paths, the wires and the end");
  if (frames[i].count !== files || frames[i + 1].count !== files) refuse(`the paths or wires count other than the ${files} files recorded`);
  if (frames[i + 2].count !== frames.length - 1 || frames[i + 2].rawLength !== 32) refuse("the end does not count the sections before it");
}

async function nameOfFrames(frames: Frame[]): Promise<Uint8Array> {
  return sha256(concat(frames.map((f) => f.hash)));
}

// ============================================================================
// The writer
// ============================================================================

/** What a writer needs to go on from a stopped write: found by {@link resumeFrom}. */
export interface ResumeState {
  head: ScanHead;
  /** The bytes kept: the signature and every frame up to the last whole section of records. */
  kept: Uint8Array;
  frames: Uint8Array[];
  hashes: Uint8Array[];
  strings: string[];
  paths: string[];
  targets: (string | undefined)[][];
}

/** A writer of one scan, handed its files one at a time in path order. */
export interface Writer {
  /** Takes one file's facts. Refuses a file out of path order, or facts the layout cannot hold as they are. */
  add(file: StoredFile): Promise<void>;
  /** Sets down the last records, the paths, the wires and the end; returns the whole file. */
  finish(): Promise<Uint8Array>;
  /** How many files it holds. */
  files(): number;
}

/**
 * A writer of one scan. `onBytes` is handed every piece of the file as it is set down, the signature first, so that
 * a host can keep it as it goes (a file appended to, a store in the page); the pieces in order are the file. Given
 * `resume`, it goes on from what a stopped write left, and hands on only what it adds.
 */
export function createWriter(head: ScanHead, options: { onBytes?: (bytes: Uint8Array) => void | Promise<void>; resume?: ResumeState } = {}): Writer {
  const resume = options.resume;
  const theHead = resume ? resume.head : head;
  const frames: Uint8Array[] = resume ? [...resume.frames] : [];
  const hashes: Uint8Array[] = resume ? [...resume.hashes] : [];
  const ids = new Map<string, number>();
  (resume?.strings ?? []).forEach((s, i) => ids.set(s, i));
  const paths: string[] = resume ? [...resume.paths] : [];
  const targets: (string | undefined)[][] = resume ? [...resume.targets] : [];
  let chunk: Uint8Array[] = [];
  let fresh: string[] = [];
  let finished = false;
  const headRaw = headBytes(theHead);
  const emit = async (bytes: Uint8Array): Promise<void> => {
    if (options.onBytes) await options.onBytes(bytes);
  };
  const set = async (kind: number, count: number, raw: Uint8Array): Promise<void> => {
    const frame = await frameOf(kind, count, raw);
    frames.push(frame.bytes);
    hashes.push(frame.hash);
    await emit(frame.bytes);
  };
  // The signature and the head are set down first; a host's failure to keep them fails every call after.
  const ready: Promise<void> = resume ? Promise.resolve() : emit(SIGNATURE.slice()).then(() => set(HEAD, 0, headRaw));
  ready.catch(() => undefined);
  let queue: Promise<void> = Promise.resolve();
  const flush = async (): Promise<void> => {
    if (chunk.length === 0) return;
    if (fresh.length > 0) await set(STRINGS, fresh.length, stringsBytes(fresh));
    await set(RECORDS, chunk.length, concat(chunk));
    chunk = [];
    fresh = [];
  };
  // One call at a time, in the order made. A refused file leaves the writer as it was, so a host may leave it out and
  // go on; any other failure is the host's or the machine's and is passed up as it is.
  const serially = (work: () => Promise<void>): Promise<void> => {
    const run = queue.then(async () => {
      await ready;
      if (finished) refuse("the writer has finished");
      await work();
    });
    queue = run.catch(() => undefined);
    return run;
  };
  return {
    files: () => paths.length,
    add: (file) =>
      serially(async () => {
        const path = checkPath(file?.codePath, "a path");
        if (paths.length > 0 && comparePaths(paths[paths.length - 1], path) >= 0) refuse(`facts out of path order at ${JSON.stringify(path)}, after ${JSON.stringify(paths[paths.length - 1])}`);
        const before = ids.size;
        const encoding = new Encoding(ids, fresh);
        let stored: StoredFile;
        try {
          stored = walkFile(encoding, file);
        } catch (error) {
          // Strings first met in a file refused are forgotten, so that the next file numbers them as if it were first.
          for (const s of fresh.splice(fresh.length - (ids.size - before))) ids.delete(s);
          throw error;
        }
        paths.push(path);
        targets.push(linkedTargets(stored));
        chunk.push(encoding.out.done());
        if (chunk.length === CHUNK) await flush();
      }),
    finish: async () => {
      await serially(async () => {
        await flush();
        const index = new Map(paths.map((p, i) => [p, i]));
        const outbound = targets.map((list, i) => {
          const set = new Set<number>();
          for (const t of list) {
            const j = t === undefined ? undefined : index.get(t);
            if (j !== undefined && j !== i) set.add(j);
          }
          return [...set].sort((a, b) => a - b);
        });
        await set(PATHS, paths.length, pathsBytes(paths));
        await set(WIRES, paths.length, wiresBytes(outbound));
        await set(END, frames.length, await sha256(concat(hashes)));
        finished = true;
      });
      const bytes = concat([SIGNATURE, ...frames]);
      const raw = hop(bytes).frames.reduce((n, f) => n + f.rawLength, 0);
      if (raw > inflationBound(bytes.length)) refuse(`these facts inflate to ${raw} bytes from ${bytes.length}, past what a reader accepts`);
      return bytes;
    }
  };
}

/** Writes a whole scan at once: the same bytes as its files handed to {@link createWriter} one by one. */
export async function writeScan(scan: Scan): Promise<Result<Uint8Array>> {
  return settle(async () => {
    const writer = createWriter(scan.head);
    for (const file of scan.files) await writer.add(file);
    return writer.finish();
  });
}

/**
 * What a stopped write left whole: every frame up to the last full section of records, the strings, paths and targets
 * it holds, and so where a writer goes on. A file already finished is refused, as is anything not a prefix of one.
 */
export async function resumeFrom(bytes: Uint8Array): Promise<Result<ResumeState & { lastPath?: string }>> {
  return settle(async () => {
    const { frames } = hop(bytes);
    if (frames.some((f) => f.kind === END)) refuse("the write finished; there is nothing to go on from");
    checkOrder(frames, false);
    if (frames.length === 0) refuse("not even the head was set down");
    let last = 0;
    frames.forEach((f, i) => {
      if (f.kind === RECORDS && f.count === CHUNK) last = i;
    });
    const kept = frames.slice(0, last + 1);
    const head = readHead(await rawOf(bytes, kept[0], "the head"));
    const strings: string[] = [];
    const seen = new Set<string>();
    const paths: string[] = [];
    const targets: (string | undefined)[][] = [];
    const checked: number[] = [];
    let met = 0;
    for (const f of kept.slice(1)) {
      const raw = await rawOf(bytes, f, KIND_NAMES[f.kind]);
      if (f.kind === STRINGS) {
        loadStrings(raw, f.count, strings, seen);
      } else {
        const files = decodeChunk(raw, f.count, strings, met, paths.length ? paths[paths.length - 1] : undefined, checked);
        met = files.met;
        for (const file of files.files) {
          paths.push(file.codePath);
          targets.push(linkedTargets(file));
        }
      }
    }
    const end = kept[kept.length - 1].end;
    return { head, kept: bytes.slice(0, end), frames: kept.map((f) => bytes.slice(f.storedAt - FRAME_HEADER, f.end)), hashes: kept.map((f) => f.hash.slice()), strings, paths, targets, lastPath: paths[paths.length - 1] };
  });
}

// ============================================================================
// The readers
// ============================================================================

/**
 * A section of strings, decoded at once: their bytes joined and decoded strictly in one call, which costs far less
 * than a call for each. Joined, a sequence cut at one string's end could be finished by the next string's beginning;
 * so a string that begins with a continuation byte (0x80 to 0xBF) is refused, and then no sequence can cross from one
 * string into the next, and the whole decoding strictly means each string does. Each string is then cut from the
 * whole by its length in UTF-16 units, counted from its bytes: one for each byte below 0x80 or lead byte below 0xF0,
 * two for a lead byte of four (a pair), none for a continuation byte.
 */
function loadStrings(raw: Uint8Array, count: number, strings: string[], seen: Set<string>): void {
  const input = new In(raw, "a section of strings");
  if (count > raw.length) refuse(`a section of strings claims ${count} strings in ${raw.length} bytes`);
  const at = new Uint32Array(count);
  const length = new Uint32Array(count);
  let total = 0;
  for (let i = 0; i < count; i += 1) {
    length[i] = input.varint();
    at[i] = input.at;
    input.slice(length[i]);
    if (length[i] > 0 && (raw[at[i]] & 0xc0) === 0x80) refuse("a string begins in the middle of a character");
    total += length[i];
  }
  input.end();
  const joined = new Uint8Array(total);
  let to = 0;
  for (let i = 0; i < count; i += 1) {
    joined.set(raw.subarray(at[i], at[i] + length[i]), to);
    to += length[i];
  }
  const whole = decodeText(joined, "a section of strings");
  let unit = 0;
  let byte = 0;
  for (let i = 0; i < count; i += 1) {
    const first = unit;
    for (const stop = byte + length[i]; byte < stop; byte += 1) {
      const b = joined[byte];
      unit += b < 0x80 || (b >= 0xc0 && b < 0xf0) ? 1 : b >= 0xf0 ? 2 : 0;
    }
    const s = whole.slice(first, unit);
    if (seen.has(s)) refuse(`the string ${JSON.stringify(s.slice(0, 80))} is set down twice`);
    seen.add(s);
    strings.push(s);
  }
}

function decodeChunk(raw: Uint8Array, count: number, strings: string[], met: number, previous: string | undefined, checked: number[]): { files: StoredFile[]; met: number } {
  const input = new In(raw, "a section of records");
  if (count > raw.length) refuse(`a section of records claims ${count} files in ${raw.length} bytes`);
  const decoding = new Decoding(input, strings, met, checked);
  const files: StoredFile[] = [];
  for (let i = 0; i < count; i += 1) {
    const file = walkFile(decoding, undefined);
    if (previous !== undefined && comparePaths(previous, file.codePath) >= 0) refuse(`the files are not in path order at ${JSON.stringify(file.codePath)}`);
    previous = file.codePath;
    files.push(file);
  }
  input.end();
  if (decoding.met !== strings.length) refuse(`${strings.length - decoding.met} strings set down before a section of records are not met in it`);
  return { files, met: decoding.met };
}

/** A scan opened for questions: the paths and the wires read, each file's facts read when asked for. */
export interface OpenedScan {
  head: ScanHead;
  /** The content's name: a hash of every section's uncompressed bytes, the same however the sections were compressed. */
  name: string;
  paths: readonly string[];
  /** The index of a path, or -1. */
  indexOf(path: string): number;
  /** The files a file's links name, by index, in path order. */
  outbound(index: number): readonly number[];
  /** The files whose links name a file, by index, in path order. */
  inbound(index: number): readonly number[];
  /** One file's facts: the section that holds it read and checked, and every section of strings before it. */
  file(index: number): Promise<Result<StoredFile>>;
}

/**
 * Opens a finished scan by reading its head, its paths and its wires, each checked against its hash, and every
 * section's header. What it has not read it has not checked: {@link readScan} reads and checks the whole.
 */
export async function openScan(bytes: Uint8Array): Promise<Result<OpenedScan>> {
  return settle(async () => opening(bytes, false));
}

/**
 * The reading both readers share. With `all`, every section is inflated and hashed at once, which the platform does on
 * its own threads, rather than each when it is first needed: the whole read's way.
 */
async function opening(bytes: Uint8Array, all: boolean): Promise<OpenedScan & { chunks: number; readChunk(k: number): Promise<StoredFile[]> }> {
  {
    const { frames, cut } = hop(bytes);
    if (cut || frames[frames.length - 1]?.kind !== END) refuse("the file stops before its end: a stopped write, which `resumeFrom` can go on from");
    checkOrder(frames, true);
    const early = new Map<Frame, Promise<Uint8Array>>();
    if (all) {
      for (const f of frames) {
        const pending = rawOf(bytes, f, KIND_NAMES[f.kind]);
        // Marked as seen, so that a refusal found in one while another is read is not taken for an unhandled one.
        pending.catch(() => undefined);
        early.set(f, pending);
      }
    }
    const rawOf_ = (f: Frame, what: string): Promise<Uint8Array> => early.get(f) ?? rawOf(bytes, f, what);
    const endRaw = await rawOf_(frames[frames.length - 1], "the end");
    const name = await nameOfFrames(frames.slice(0, -1));
    if (!equalBytes(endRaw, name)) refuse("the end does not name the sections before it");
    const head = readHead(await rawOf_(frames[0], "the head"));
    const count = frames[frames.length - 3].count;
    const stringBytes = frames.reduce((n, f) => n + (f.kind === STRINGS ? f.rawLength : 0), 0);
    const paths = readPaths(await rawOf_(frames[frames.length - 3], "the paths"), count, stringBytes);
    const outbound = readWires(await rawOf_(frames[frames.length - 2], "the wires"), count);
    const inboundLists: number[][] = paths.map(() => []);
    outbound.forEach((list, i) => list.forEach((j) => inboundLists[j].push(i)));
    const index = new Map(paths.map((p, i) => [p, i]));
    const chunkFrames = frames.filter((f) => f.kind === RECORDS);
    const strings: string[] = [];
    const seen = new Set<string>();
    const checked: number[] = [];
    let stringsRead = 0;
    let met = 0;
    const chunks = new Map<number, StoredFile[]>();
    let chunksRead = 0;
    const readChunk = async (k: number): Promise<StoredFile[]> => {
      // Every earlier section is read in order too, so that the strings' first-met numbering is checked as written.
      while (chunksRead <= k) {
        const target = chunkFrames[chunksRead];
        for (; stringsRead < frames.length && frames[stringsRead].storedAt <= target.storedAt; stringsRead += 1) {
          const f = frames[stringsRead];
          if (f.kind === STRINGS) {
            loadStrings(await rawOf_(f, "a section of strings"), f.count, strings, seen);
            early.delete(f);
          }
        }
        const first = chunksRead * CHUNK;
        const decoded = decodeChunk(await rawOf_(target, "a section of records"), target.count, strings, met, first > 0 ? paths[first - 1] : undefined, checked);
        early.delete(target);
        met = decoded.met;
        decoded.files.forEach((file, i) => {
          if (file.codePath !== paths[first + i]) refuse(`the paths name ${JSON.stringify(paths[first + i])} where the records hold ${JSON.stringify(file.codePath)}`);
          const wires = outboundOf(file, index);
          if (!equalLists(wires, outbound[first + i])) refuse(`the wires of ${JSON.stringify(file.codePath)} are not those its links name`);
        });
        chunks.set(chunksRead, decoded.files);
        chunksRead += 1;
      }
      return chunks.get(k)!;
    };
    return {
      chunks: chunkFrames.length,
      readChunk,
      head,
      name: hex(name),
      paths,
      indexOf: (path) => index.get(path) ?? -1,
      outbound: (i) => outbound[i] ?? [],
      inbound: (i) => inboundLists[i] ?? [],
      file: (i) =>
        settle(async () => {
          if (!Number.isInteger(i) || i < 0 || i >= paths.length) refuse(`there is no file ${i}`);
          return (await readChunk(Math.floor(i / CHUNK)))[i % CHUNK];
        })
    };
  }
}

function equalLists(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

/** Reads and checks a whole scan: every section against its hash, every fact, and every derived section against what it derives from. */
export async function readScan(bytes: Uint8Array): Promise<Result<Scan & { name: string }>> {
  return settle(async () => {
    const scan = await opening(bytes, true);
    const files: StoredFile[] = [];
    for (let k = 0; k < scan.chunks; k += 1) files.push(...(await scan.readChunk(k)));
    return { head: scan.head, files, name: scan.name };
  });
}

// ============================================================================
// The text form
// ============================================================================

/** The text form's first line names the layout: provisional, as {@link SIGNATURE} is. */
export const TEXT_FORMAT = "fact-pack";

function line(values: unknown[]): string {
  return JSON.stringify(values);
}

/** A type in the text form: its keys in the layout's order. */
function typeText(t: StoredType): unknown {
  return { name: t.name, link: t.link, target: t.target, anchor: t.anchor, array: t.array, promise: t.promise };
}

function fileLines(f: StoredFile): string[] {
  const p = f.codePath;
  const out = [line([p, "file", f.layer, f.archetype ?? null, f.generatedAt ?? null]), line([p, "authored", f.authored])];
  for (const e of f.entries) out.push(line([p, "entry", { reason: e.reason, symbol: e.symbol && { name: e.symbol.name, link: e.symbol.link }, command: e.command, declarer: e.declarer && { label: e.declarer.label, link: e.declarer.link } }]));
  for (const s of f.symbols) {
    out.push(
      line([
        p,
        "symbol",
        {
          name: s.name,
          slug: s.slug,
          kind: s.kind,
          flags: s.flags,
          source: s.source && { path: s.source.path, line: s.source.line },
          references: s.references.map((r) => (r.role === "Parameters" ? { role: r.role, parameters: r.parameters.map((x) => ({ name: x.name, types: x.types.map(typeText) })) } : { role: r.role, types: r.types.map(typeText) })),
          sections: s.sections.map((x) => ({ title: x.title, body: x.body })),
          documentation: s.documentation.map((d) => ({ name: d.name, element: d.element, link: d.link, target: d.target, anchor: d.anchor }))
        }
      ])
    );
  }
  for (const d of f.dependencies) out.push(line([p, "dependency", { label: d.label, link: d.link, target: d.target, anchor: d.anchor, symbols: d.symbols, qualifiers: d.qualifiers }]));
  if (f.citedBy) out.push(line([p, "cited-by", f.citedBy.map((c) => ({ label: c.label, link: c.link }))]));
  if (f.reExports) out.push(line([p, "re-exports", f.reExports.map((r) => ({ name: r.name, slug: r.slug, from: r.from && { label: r.from.label, link: r.from.link }, flags: r.flags }))]));
  return out;
}

/** The text form of a scan: one fact a line, each line a JSON array, the head first and the end last. */
export function textOfScan(scan: Scan): string {
  const { location, scanner, leftOut } = scan.head;
  const lines = [line([null, "format", TEXT_FORMAT, LAYOUT_VERSION]), line([null, "location", location.root, location.baseLayer, location.extension]), line([null, "scanner", scanner])];
  for (const l of leftOut) lines.push(line([null, "left-out", l.reason, l.count, l.detail]));
  for (const f of scan.files) lines.push(...fileLines(f));
  lines.push(line([null, "end", scan.files.length]));
  return `${lines.join("\n")}\n`;
}

/** The text form of a stored scan's bytes: read and checked whole first. */
export async function textOf(bytes: Uint8Array): Promise<Result<string>> {
  return settle(async () => {
    const scan = await readScan(bytes);
    if (!scan.ok) refuse(scan.reason);
    // A string is held once and named many times; written out, each naming is a copy. The copies are counted first,
    // so that a small file naming one long string a million times is refused rather than written.
    const measuring = new Measuring();
    for (const file of scan.value.files) walkFile(measuring, file);
    if (measuring.total > inflationBound(bytes.length)) refuse(`the text would hold ${measuring.total} bytes of names from a file of ${bytes.length} bytes, past ${inflationBound(bytes.length)}`);
    return textOfScan(scan.value);
  });
}

/**
 * Reads the text form back into a scan. Each line must be exactly the line {@link textOfScan} writes for what it
 * says, so that one set of facts has one text, as it has one layout. Given bytes, they must be UTF-8 without a
 * byte-order mark, decoded strictly; given a string, it is taken as those bytes decoded.
 */
export function scanOfText(text: string | Uint8Array): Result<Scan> {
  try {
    return { ok: true, value: parseText(typeof text === "string" ? text : decodeText(text, "the text")) };
  } catch (error) {
    if (error instanceof Refusal) return { ok: false, reason: error.message };
    throw error;
  }
}

function parseText(text: string): Scan {
  if (typeof text !== "string" || !text.endsWith("\n")) refuse("the text does not end with a line break");
  const lines = text.slice(0, -1).split("\n");
  let n = 0;
  const next = (): unknown[] => {
    if (n >= lines.length) refuse("the text stops before its end line");
    const raw = lines[n++];
    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch {
      return refuse(`line ${n} is not JSON`);
    }
    if (!Array.isArray(value)) refuse(`line ${n} is not a JSON array`);
    return value;
  };
  const expectSame = (raw: string, written: string): void => {
    if (raw !== written) refuse(`line ${n} is not written as the text form writes it: ${JSON.stringify(raw.slice(0, 120))}`);
  };
  const format = next();
  expectSame(lines[0], line([null, "format", TEXT_FORMAT, LAYOUT_VERSION]));
  void format;
  const location = next();
  if (location[0] !== null || location[1] !== "location" || location.length !== 5) refuse("the second line is not the location");
  const scanner = next();
  if (scanner[0] !== null || scanner[1] !== "scanner" || scanner.length !== 3) refuse("the third line is not the scanner");
  const head: ScanHead = { location: { root: location[2] as string, baseLayer: location[3] as string, extension: location[4] as string }, scanner: scanner[2] as string, leftOut: [] };
  let row = next();
  while (row[0] === null && row[1] === "left-out") {
    if (row.length !== 5) refuse(`line ${n} is not a left-out line`);
    head.leftOut.push({ reason: row[2] as string, count: row[3] as number, detail: row[4] as string });
    row = next();
  }
  headBytes(head);
  expectSame(lines.slice(0, n - 1).join("\n"), textOfScan({ head, files: [] }).split("\n").slice(0, n - 1).join("\n"));
  const files: StoredFile[] = [];
  while (!(row[0] === null && row[1] === "end")) {
    const start = n - 1;
    const path = row[0];
    if (typeof path !== "string" || row[1] !== "file" || row.length !== 5) refuse(`line ${n} is not a file's first line`);
    const file: StoredFile = { codePath: path, layer: row[2] as number, entries: [], authored: "", symbols: [], dependencies: [] };
    if (row[3] !== null) file.archetype = row[3] as string;
    if (row[4] !== null) file.generatedAt = row[4] as string;
    row = next();
    if (row[0] !== path || row[1] !== "authored" || row.length !== 3) refuse(`line ${n} is not ${JSON.stringify(path)}'s authored words`);
    file.authored = row[2] as string;
    row = next();
    const take = (kind: string): unknown[] => {
      const items: unknown[] = [];
      while (row[0] === path && row[1] === kind) {
        if (row.length !== 3) refuse(`line ${n} is not one ${kind}`);
        items.push(row[2]);
        row = next();
      }
      return items;
    };
    file.entries = take("entry").map((e) => fromJson(e) as StoredEntry);
    file.symbols = take("symbol").map((s) => fromJson(s) as StoredSymbol);
    file.dependencies = take("dependency").map((d) => fromJson(d) as StoredDependency);
    const cited = take("cited-by");
    if (cited.length > 1) refuse(`${JSON.stringify(path)} has two cited-by lines`);
    if (cited.length === 1) file.citedBy = fromJson(cited[0]) as StoredFile["citedBy"];
    const reExports = take("re-exports");
    if (reExports.length > 1) refuse(`${JSON.stringify(path)} has two re-exports lines`);
    if (reExports.length === 1) file.reExports = fromJson(reExports[0]) as StoredFile["reExports"];
    // The file's facts must be what the layout can hold, and its lines exactly those the text form writes for them.
    const held = walkFile(new Encoding(new Map(), []), file);
    expectSame(lines.slice(start, n - 1).join("\n"), fileLines(held).join("\n"));
    if (files.length > 0 && comparePaths(files[files.length - 1].codePath, path) >= 0) refuse(`the files are not in path order at ${JSON.stringify(path)}`);
    files.push(held);
  }
  if (row.length !== 3 || row[2] !== files.length) refuse(`the end line does not count the ${files.length} files`);
  if (n !== lines.length) refuse("lines after the end line");
  return { head, files };
}

/** A parsed JSON value with its members' absence kept: `null` never stands for a fact, so it is refused. */
function fromJson(value: unknown): unknown {
  if (value === null) refuse("a null where a fact belongs");
  return value;
}

/** Reads the text form and writes its layout: the bytes {@link textOf} came from, when it came from bytes. */
export async function bytesOfText(text: string | Uint8Array): Promise<Result<Uint8Array>> {
  const scan = scanOfText(text);
  return scan.ok ? writeScan(scan.value) : scan;
}

// ============================================================================
// The graph
// ============================================================================

/** How an edge arose. */
export type EdgeKind = "import" | "re-export" | "returns" | "parameter" | "extends" | "implements" | "constraint";

/** One reference a file makes, with the scanned file it lands on, if any. */
export interface GraphEdge {
  kind: EdgeKind;
  label: string;
  link?: string;
  to?: string;
  toSymbol?: string;
  from?: string;
  parameter?: string;
  typeOnly?: boolean;
  basis?: "contract" | "configuration";
}

/** One file of the graph: its facts without what its links name, and its edges and wires. */
export interface GraphFile {
  codePath: string;
  docPath: string;
  layer: number;
  archetype?: string;
  entries: StoredEntry[];
  generatedAt?: string;
  authored: string;
  symbols: unknown[];
  dependencies: unknown[];
  citedBy?: { label: string; link: string }[];
  reExports?: StoredReExport[];
  edges: GraphEdge[];
  outbound: string[];
  inbound: string[];
  /** The declarations this file's documentation names on scanned files; present only when there is one. */
  documentation?: DocumentationEdge[];
  /** The files, other than this one, whose documentation names a declaration of this one, in path order; present only when there is one. */
  documentedBy?: string[];
}

/**
 * One reference a symbol's documentation makes to a scanned file: the author's word that the two are related, which
 * is not a use, so that nothing that follows the edges or the wires follows it.
 */
export interface DocumentationEdge {
  label: string;
  link: string;
  to: string;
  element?: string;
  toSymbol?: string;
  from?: string;
}

/** The graph of a scan: its location and every file keyed by path, in path order. */
export interface Graph extends Location {
  files: Record<string, GraphFile>;
}

const REFERENCE_KIND = { Returns: "returns", Extends: "extends", Implements: "implements", Constraints: "constraint" } as const;

/** Where a file's document is: the location's root, its base layer, and the path with the extension. */
export function docPathOf(location: Location, codePath: string): string {
  return [location.root, location.baseLayer, `${codePath}${location.extension}`].filter((s) => s !== "").join("/");
}

function plainType(t: StoredType): Record<string, unknown> {
  const out: Record<string, unknown> = { name: t.name };
  if (t.link !== undefined) out.link = t.link;
  if (t.array) out.array = true;
  if (t.promise) out.promise = true;
  return out;
}

/**
 * The graph the facts describe. A link lands on a file when what it names was scanned: the edge then carries that
 * path and the anchor; a file's outbound wires are the scanned files its links land on, other than itself, and its
 * inbound wires the files whose links land on it.
 */
export function graphOf(scan: Scan): Graph {
  const scanned = new Set(scan.files.map((f) => f.codePath));
  const landing = (v: { link?: string; target?: string; anchor?: string }): Pick<GraphEdge, "link" | "to" | "toSymbol"> => {
    const out: Pick<GraphEdge, "link" | "to" | "toSymbol"> = { link: v.link };
    if (v.target !== undefined && scanned.has(v.target)) {
      out.to = v.target;
      if (v.anchor !== undefined) out.toSymbol = v.anchor;
    }
    return out;
  };
  const files: Record<string, GraphFile> = {};
  for (const f of scan.files) {
    const edges: GraphEdge[] = [];
    for (const d of f.dependencies) {
      const edge: GraphEdge = { kind: d.qualifiers.includes("re-export") ? "re-export" : "import", label: d.label, ...(d.link !== undefined ? landing(d) : {}) };
      if (d.qualifiers.includes("type-only")) edge.typeOnly = true;
      const basis = d.qualifiers.find((q): q is "contract" | "configuration" => q === "contract" || q === "configuration");
      if (basis) edge.basis = basis;
      edges.push(edge);
    }
    for (const s of f.symbols) {
      const push = (t: StoredType, kind: EdgeKind, parameter?: string): void => {
        if (t.link === undefined) return;
        const edge: GraphEdge = { kind, label: t.name, ...landing(t) };
        if (s.slug !== undefined) edge.from = s.slug;
        if (parameter !== undefined) edge.parameter = parameter;
        edges.push(edge);
      };
      for (const r of s.references) {
        if (r.role === "Parameters") {
          for (const p of r.parameters) for (const t of p.types) push(t, "parameter", p.name);
        } else {
          for (const t of r.types) push(t, REFERENCE_KIND[r.role]);
        }
      }
    }
    const outbound = [...new Set(edges.map((e) => e.to).filter((to): to is string => to !== undefined && to !== f.codePath))].sort(comparePaths);
    files[f.codePath] = {
      codePath: f.codePath,
      docPath: docPathOf(scan.head.location, f.codePath),
      layer: f.layer,
      archetype: f.archetype,
      entries: f.entries,
      generatedAt: f.generatedAt,
      authored: f.authored,
      symbols: f.symbols.map((s) => ({
        name: s.name,
        slug: s.slug,
        kind: s.kind,
        flags: s.flags,
        references: s.references.map((r) => (r.role === "Parameters" ? { role: r.role, parameters: r.parameters.map((p) => ({ name: p.name, types: p.types.map(plainType) })) } : { role: r.role, types: r.types.map(plainType) })),
        sections: s.sections,
        source: s.source
      })),
      dependencies: f.dependencies.map((d) => (d.link !== undefined ? { label: d.label, link: d.link, qualifiers: d.qualifiers, ...(d.symbols ? { symbols: d.symbols } : {}) } : { label: d.label, qualifiers: d.qualifiers, ...(d.symbols ? { symbols: d.symbols } : {}) })),
      citedBy: f.citedBy,
      reExports: f.reExports,
      edges,
      outbound,
      inbound: []
    };
    // The documentation's references that land on a scanned file: a relation of its own, never an edge or a wire.
    const documentation: DocumentationEdge[] = [];
    for (const s of f.symbols) {
      for (const d of s.documentation) {
        if (d.link === undefined || d.target === undefined || !scanned.has(d.target)) continue;
        const reference: DocumentationEdge = { label: d.name, link: d.link, to: d.target };
        if (d.element !== undefined) reference.element = d.element;
        if (d.anchor !== undefined) reference.toSymbol = d.anchor;
        if (s.slug !== undefined) reference.from = s.slug;
        documentation.push(reference);
      }
    }
    if (documentation.length > 0) files[f.codePath].documentation = documentation;
  }
  for (const f of Object.values(files)) for (const to of f.outbound) files[to].inbound.push(f.codePath);
  for (const f of Object.values(files)) {
    const named = [...new Set((f.documentation ?? []).map((d) => d.to).filter((to) => to !== f.codePath))].sort(comparePaths);
    for (const to of named) (files[to].documentedBy ??= []).push(f.codePath);
  }
  const { root, baseLayer, extension } = scan.head.location;
  return { root, baseLayer, extension, files };
}
