// Probe of 2026-11-22 (not product code): the samples a second reader of the stored form is held against, each made by
// the module itself, with the module's own answer for each (README.md beside this file).
//
//   npx tsx --tsconfig ./tsconfig.base.json <this folder>/samples.ts corpus <index.json> <out-base>
//     a real scan from a graph index (by the stored-form probe's scanOfGraph): <out-base>.fpk and <out-base>.txt
//   ... samples.ts made <out-dir>
//     the package's made scans, a scan on both sides of the order's hard case, and one of every written character
//   ... samples.ts refusals <out-dir> <base.fpk>... [--seeds 400]
//     the fuzzer's mutants of the bases, every kind from many seeds; the unit cases' files whole in shape and not in
//     form; a few more of this probe's own; and the unit cases' texts written another way
//   ... samples.ts answers <dir>...
//     what the module does with every .fpk (its text, or that it refuses and why) and every .txt (the content's name
//     of the bytes it describes, or that it refuses): <dir>/answers.json
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { constants, deflateRawSync, inflateRawSync } from "node:zlib";

import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import { bytesOfText, docPathOf, graphOf, readScan, SIGNATURE, textOf, textOfScan, writeScan, type Scan, type StoredDocumentation, type StoredFile } from "../../../../../../../packages/stored-form/src/storedForm";
import { mutant } from "../../../../../../../packages/stored-form/test/fuzz/mutants.mjs";
import { everyFact, seededScan } from "../../../../../../../packages/stored-form/test/testScans";
import { scanOfGraph } from "../stored-form-module/scan-of-graph";

const [mode, ...args] = process.argv.slice(2);
const option = (name: string, fallback: string): string => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));

async function bytesOf(scan: Scan): Promise<Uint8Array> {
  const written = await writeScan(scan);
  if (!written.ok) throw new Error(written.reason);
  return written.value;
}

async function both(scan: Scan, base: string): Promise<void> {
  const bytes = await bytesOf(scan);
  writeFileSync(`${base}.fpk`, bytes);
  const text = await textOf(bytes);
  if (!text.ok) throw new Error(`${base}: ${text.reason}`);
  writeFileSync(`${base}.txt`, text.value);
  console.log(`${path.basename(base)}: ${bytes.length} bytes stored, ${Buffer.byteLength(text.value)} bytes of text, ${scan.files.length} files`);
}

// --- Frames, as the unit cases take them apart and set them down again --------------------------------------------

type Frame = { kind: number; count: number; raw: Uint8Array };

function framesOf(bytes: Uint8Array): Frame[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out: Frame[] = [];
  for (let at = SIGNATURE.length; at < bytes.length; ) {
    const stored = view.getUint32(at + 9, true);
    out.push({ kind: bytes[at], count: view.getUint32(at + 1, true), raw: new Uint8Array(inflateRawSync(bytes.subarray(at + 45, at + 45 + stored))) });
    at += 45 + stored;
  }
  return out;
}

/** Sets frames down again, each with its own hash and the end naming them; `endCount` overrides the end's count. */
function framed(frames: Frame[], endCount?: number): Uint8Array {
  const parts: Uint8Array[] = [SIGNATURE];
  const hashes: Uint8Array[] = [];
  for (const f of frames) {
    const raw = f.kind === 6 ? createHash("sha256").update(Buffer.concat(hashes)).digest() : f.raw;
    const hash = createHash("sha256").update(raw).digest();
    hashes.push(hash);
    const stored = deflateRawSync(raw);
    const header = Buffer.alloc(13);
    header[0] = f.kind;
    header.writeUInt32LE(f.kind === 6 ? endCount ?? frames.length - 1 : f.count, 1);
    header.writeUInt32LE(raw.length, 5);
    header.writeUInt32LE(stored.length, 9);
    parts.push(header, hash, stored);
  }
  return Buffer.concat(parts);
}

const varint = (n: number): number[] => { const out = []; do { let b = n & 0x7f; n = Math.floor(n / 128); if (n) b |= 0x80; out.push(b); } while (n); return out; };
function readVarint(bytes: Uint8Array, at: number): [number, number] { let n = 0; let shift = 0; for (;;) { const b = bytes[at++]; n += (b & 0x7f) * 2 ** shift; shift += 7; if (!(b & 0x80)) return [n, at]; } }

/** The paths section's paths, decoded. */
function pathsOf(raw: Uint8Array, count: number): Uint8Array[] {
  const out: Uint8Array[] = []; let at = 0; let previous = new Uint8Array(0);
  for (let i = 0; i < count; i += 1) {
    let shared; let rest; [shared, at] = readVarint(raw, at); [rest, at] = readVarint(raw, at);
    const p = new Uint8Array([...previous.subarray(0, shared), ...raw.subarray(at, at + rest)]); at += rest;
    out.push(p); previous = p;
  }
  return out;
}

// --- The made scans ---------------------------------------------------------------------------------------------------

const plain = (codePath: string, more: Partial<StoredFile> = {}): StoredFile => ({ codePath, layer: 4, entries: [], authored: "", symbols: [], dependencies: [], ...more });
const smallHead = { location: { root: "", baseLayer: "", extension: ".md" }, scanner: "s", leftOut: [] };

function madeScans(): [string, Scan][] {
  // The unit cases' own: every fact, the empty scan, and the seeded ones they write (seededScan(3, 300) is the fuzzer's).
  const scans: [string, Scan][] = [
    ["made-every-fact", everyFact()],
    ["made-empty", { ...everyFact(), files: [] }],
    ["made-seeded-1-40", seededScan(1, 40)],
    ["made-seeded-2-257", seededScan(2, 257)],
    ["made-seeded-3-300", seededScan(3, 300)],
    ["made-seeded-5-30", seededScan(5, 30)],
    ["made-seeded-7-529", seededScan(7, 529)],
    ["made-seeded-11-773", seededScan(11, 773)]
  ];
  // The order's hard case, on both sides of it: U+E000 and U+FFFD are one UTF-16 unit and three bytes of UTF-8, and
  // U+1F600 and U+10000 two units and four bytes. By bytes the first two come first; by UTF-16 units they come last.
  // Each links to the others, so that the wires and the graph's order meet the case too.
  const order = ["dir/z.ts", "dir/\u{E000}.ts", "dir/\u{FFFD}.ts", "dir/\u{10000}.ts", "dir/\u{1F600}.ts"];
  scans.push(["made-order-hard-case", { head: smallHead, files: order.map((p, i) => plain(p, { dependencies: order.filter((q) => q !== p).map((q) => ({ label: q, link: `${q.slice(4)}.md`, target: q, qualifiers: [] })), authored: `file ${i}` })) }]);
  // Every character the text form's rule names, each in a string of its own.
  const characters = ['"', "\\", "\b", "\t", "\n", "\f", "\r", "\u0000", "\u0001", "\u000b", "\u001f", "/", "\u007f", "\u0080", "\u009f", "é", " ", " ", "﻿", "\u{E000}", "\u{FFFF}", "\u{1F600}", "\u{10FFFF}"];
  scans.push(["made-characters", { head: { ...smallHead, scanner: "﻿a scanner" }, files: [plain("a", { authored: characters.map((c) => `x${c}y`).join("|"), symbols: characters.map((c, i) => ({ name: `n${c}`, kind: `k${i}`, flags: [c], references: [], sections: [{ title: c, body: [c, `${c}${c}`] }], documentation: [] })) })] }]);
  // Every word of every enumeration, which the package's scans do not all reach (no Constraints, no opening, no
  // declared), and an extension that is empty but for a backslash and U+0000, which the specification allows.
  const linked = (q: string) => ({ name: `T${q}`, link: `${q}.md#x`, target: q, anchor: "x" });
  scans.push(["made-every-enumeration", {
    // The second reading: section 4.1 now refuses `\` and U+0000 in the extension, so this one is empty, which it allows.
    head: { location: { root: "", baseLayer: "b", extension: "" }, scanner: "s", leftOut: [] },
    files: [
      plain("p", {
        entries: (["program", "command", "module", "opening", "tooling", "declared"] as const).map((reason) => ({ reason })),
        symbols: [{ name: "f", slug: "f", kind: "function", flags: [], references: [{ role: "Returns", types: [linked("q")] }, { role: "Extends", types: [linked("q")] }, { role: "Implements", types: [linked("q")] }, { role: "Constraints", types: [linked("q")] }, { role: "Parameters", parameters: [{ name: "a", types: [linked("q")] }, { name: "b", types: [] }] }], sections: [], documentation: [] }],
        dependencies: [{ label: "q", link: "q.md", target: "q", qualifiers: ["contract", "re-export", "configuration", "type-only"] }, { label: "self", link: "p.md", target: "p", qualifiers: [] }]
      }),
      plain("q", { reExports: [{ name: "f", slug: "f", from: { label: "p", link: "p.md" }, flags: ["type-only"] }] })
    ]
  }]);
  // Numbers at their edges.
  scans.push(["made-numbers", { head: { ...smallHead, leftOut: [{ reason: "r", count: 4294967295, detail: "" }, { reason: "", count: 0, detail: "d" }] }, files: [plain("a", { layer: 0 }), plain("b", { layer: 4294967295, symbols: [{ name: "x", kind: "k", flags: [], source: { path: "../b", line: 4294967295 }, references: [], sections: [], documentation: [] }] })] }]);
  // The second reading's own, aimed at the amended sections. Documentation references of every shape: a name alone;
  // with an element; a link with no target; to its own file, with and without an anchor; to another scanned file, with
  // and without element and anchor; to a file outside the scan; from a symbol with no slug. And a file with no wires.
  const doc = (name: string, more: Partial<StoredDocumentation> = {}): StoredDocumentation => ({ name, ...more });
  const documented = (name: string, slug: string | undefined, documentation: StoredDocumentation[]) => ({ name, ...(slug ? { slug } : {}), kind: "function", flags: [], references: [], sections: [{ title: "Links", body: documentation.map((d) => `- ${d.name}`) }], documentation });
  scans.push(["made-doc-references", {
    head: { location: { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" }, scanner: "s", leftOut: [] },
    files: [
      plain("lib/a.cs", { symbols: [
        documented("A", "a", [doc("Plain"), doc("Thrown", { element: "exception" }), doc("Loose", { link: "x.md" }), doc("Self", { link: "#a", target: "lib/a.cs", anchor: "a" }), doc("SelfFile", { link: "a.cs.md", target: "lib/a.cs" })]),
        documented("B", undefined, [doc("ToB", { link: "b.cs.md#b", target: "lib/b.cs", anchor: "b" }), doc("ToBWhole", { element: "seealso", link: "b.cs.md", target: "lib/b.cs" }), doc("Outside", { element: "exception", link: "../../ext/z.cs.md#z", target: "ext/z.cs", anchor: "z" })])
      ] }),
      plain("lib/b.cs", { symbols: [documented("Bee", "b", [doc("BackToA", { element: "inheritdoc", link: "a.cs.md#a", target: "lib/a.cs", anchor: "a" }), doc("ToC", { link: "c.cs.md", target: "lib/c.cs" })])], dependencies: [{ label: "lib/a.cs", link: "a.cs.md", target: "lib/a.cs", qualifiers: [] }] }),
      plain("lib/c.cs", { symbols: [documented("Sea", "sea", [])] }),
      plain("lib/d.cs", { dependencies: [{ label: "outside", link: "../../ext/z.cs.md", target: "ext/z.cs", qualifiers: [] }, { label: "System" }].map((d) => ({ qualifiers: [], ...d })) })
    ]
  }]);
  scans.push(["made-no-wires", { head: smallHead, files: [plain("a"), plain("b", { dependencies: [{ label: "x", qualifiers: [] }] })] }]);
  return scans;
}

// --- The files a reader must refuse -------------------------------------------------------------------------------

/** The unit cases' files, whole in shape but not in their one form (storedForm.test.ts, "refuses a file that is whole in shape ..."). */
async function unitRefusals(): Promise<[string, Uint8Array][]> {
  const bytes = await bytesOf(seededScan(5, 30));
  const frames = framesOf(bytes);
  const at = (kind: number): number => frames.findIndex((f) => f.kind === kind);
  const strings = at(2); const records = at(3); const wires = at(5);
  const first = frames[strings].raw.subarray(0, 1 + frames[strings].raw[0]);
  const flipped = Buffer.from(bytes); flipped[SIGNATURE.length + 20] ^= 1;
  return [
    ["unit-string-twice", framed(frames.map((f, i) => (i === strings ? { ...f, count: f.count + 1, raw: Buffer.concat([f.raw, first]) } : f)))],
    ["unit-string-never-named", framed(frames.map((f, i) => (i === strings ? { ...f, count: f.count + 1, raw: Buffer.concat([f.raw, Buffer.from([3, 0x7a, 0x7a, 0x7a])]) } : f)))],
    ["unit-number-longer-than-needed", framed(frames.map((f, i) => (i === records ? { ...f, raw: Buffer.concat([Buffer.from([0x80, 0x00]), f.raw.subarray(1)]) } : f)))],
    ["unit-wires-not-the-links", framed(frames.map((f, i) => (i === wires ? { ...f, raw: Buffer.concat([Buffer.from([1, frames[wires].count - 1]), f.raw.subarray(1)]) } : f)))],
    ["unit-character-split-between-strings", framed(frames.map((f, i) => (i === strings ? { ...f, count: f.count + 2, raw: Buffer.concat([f.raw, Buffer.from([2, 0x61, 0xc3, 1, 0xa9])]) } : f)))],
    ["unit-byte-never-utf8", framed(frames.map((f, i) => (i === strings ? { ...f, count: f.count + 1, raw: Buffer.concat([f.raw, Buffer.from([2, 0x61, 0xff])]) } : f)))],
    ["unit-byte-after-the-end", Buffer.concat([bytes, Buffer.from([0])])],
    ["unit-cut-by-one-byte", bytes.subarray(0, bytes.length - 1)],
    ["unit-flipped-byte", flipped]
  ];
}

/** This probe's own: one change each, aimed at a rule of the specification the unit cases do not reach. */
async function probeRefusals(): Promise<[string, Uint8Array][]> {
  const out: [string, Uint8Array][] = [];
  const frames = framesOf(await bytesOf(everyFact()));
  const at = (kind: number): number => frames.findIndex((f) => f.kind === kind);
  const swap = (i: number, f: Partial<Frame>): Frame[] => frames.map((g, k) => (k === i ? { ...g, ...f } : g));
  const head = at(1); const strings = at(2); const records = at(3); const paths = at(4); const end = at(6);
  out.push(["probe-as-written", framed(frames)]); // set down again by this probe's deflate: accepted, the same facts
  out.push(["probe-head-version-2", framed(swap(head, { raw: Buffer.concat([Buffer.from([2]), frames[head].raw.subarray(1)]) }))]);
  out.push(["probe-head-count-1", framed(swap(head, { count: 1 }))]);
  out.push(["probe-unknown-kind-7", framed([...frames.slice(0, end), { kind: 7, count: 0, raw: new Uint8Array(0) }, ...frames.slice(end)])]);
  out.push(["probe-empty-strings-frame", framed([...frames.slice(0, strings), { kind: 2, count: 0, raw: new Uint8Array(0) }, ...frames.slice(strings)])]);
  out.push(["probe-end-count-wrong", framed(frames, frames.length)]);
  out.push(["probe-records-count-wrong", framed(swap(records, { count: frames[records].count + 1 }))]);
  out.push(["probe-paths-count-wrong", framed(swap(paths, { count: frames[paths].count + 1 }))]);
  // The first record's file mark, its third byte (path sid 0, layer 4, mark), with a bit no field has.
  const r = Buffer.from(frames[records].raw); r[2] |= 0x40;
  out.push(["probe-file-mark-undefined-bit", framed(swap(records, { raw: r }))]);
  // A path's front coding that does not share the longest beginning: src/b.ts after src/a.ts written as 3 bytes
  // shared and "/b.ts", where the longest is 4 and "b.ts".
  const decoded = pathsOf(frames[paths].raw, frames[paths].count);
  const longest = (a: Uint8Array, b: Uint8Array): number => { let n = 0; while (n < a.length && n < b.length && a[n] === b[n]) n += 1; return n; };
  const coded = decoded.flatMap((p, i) => { const s = i === 0 ? 0 : longest(decoded[i - 1], p) - (i === 1 ? 1 : 0); return [...varint(s), ...varint(p.length - s), ...p.subarray(s)]; });
  out.push(["probe-paths-shared-not-longest", framed(swap(paths, { raw: Buffer.from(coded) }))]);
  // A head whose root is absolute: "/x" where ".mdmd" was (the head's second field).
  const h = frames[head].raw; const rootLength = h[1];
  out.push(["probe-head-root-absolute", framed(swap(head, { raw: Buffer.concat([Buffer.from([1, 2, 0x2f, 0x78]), h.subarray(2 + rootLength)]) }))]);
  // Facts the module would write, but a file too small for them: the sections inflate past 64 times the file and a
  // mebibyte, though each section is within what raw deflate can give. And one the same shape, within the bound.
  for (const [name, size] of [["probe-past-the-file-bound", 3 * 1024 * 1024], ["probe-within-the-file-bound", 900 * 1024]] as const) {
    // The writer refuses to finish the first, so the facts are written with a short string, which is then made long.
    const big = framesOf(await bytesOf({ head: smallHead, files: [plain("a", { authored: "b".repeat(1000) })] })).map((f) => {
      if (f.kind !== 2) return f;
      const texts: Uint8Array[] = []; let at = 0;
      for (let i = 0; i < f.count; i += 1) { let n; [n, at] = readVarint(f.raw, at); texts.push(f.raw.subarray(at, at + n)); at += n; }
      return { ...f, raw: Buffer.concat(texts.map((t) => (t.length === 1000 ? Buffer.from([...varint(size), ...Buffer.alloc(size, 0x62)]) : Buffer.from([...varint(t.length), ...t])))) };
    });
    // Set down at the best level, to keep the file as small as deflate makes it.
    const parts: Uint8Array[] = [SIGNATURE]; const hashes: Uint8Array[] = [];
    for (const f of big) {
      const raw = f.kind === 6 ? createHash("sha256").update(Buffer.concat(hashes)).digest() : f.raw;
      const hash = createHash("sha256").update(raw).digest(); hashes.push(hash);
      const stored = deflateRawSync(raw, { level: constants.Z_BEST_COMPRESSION });
      const header = Buffer.alloc(13); header[0] = f.kind; header.writeUInt32LE(f.kind === 6 ? big.length - 1 : f.count, 1); header.writeUInt32LE(raw.length, 5); header.writeUInt32LE(stored.length, 9);
      parts.push(header, hash, stored);
    }
    out.push([name, Buffer.concat(parts)]);
  }
  // A valid scan whose text names one long string many times: small stored, its text far past the file's bound.
  const long = "k".repeat(32 * 1024);
  out.push(["probe-text-past-the-file-bound", await bytesOf({ head: smallHead, files: [plain("a", { symbols: Array.from({ length: 2000 }, (_, i) => ({ name: `s${i}`, kind: long, flags: [], references: [], sections: [], documentation: [] })) })] })]);
  return out;
}

/** The unit cases' texts written another way, each refused (storedForm.test.ts). */
function textRefusals(): [string, string | Uint8Array][] {
  const text = textOfScan(everyFact());
  const out: [string, string | Uint8Array][] = [
    ["text-space-after-comma", text.replace('["src/a.ts","file",', '["src/a.ts", "file",')],
    ["text-4.0", text.replace('["src/a.ts","file",4,', '["src/a.ts","file",4.0,')],
    ["text-members-reordered-and-unknown", text.replace('"name":"main","slug"', '"slug":"main","name":"main","x"')],
    ["text-false-for-absent", text.replace('"array":true', '"array":false')],
    ["text-escaped-letter", text.replace("Says hello", "Says \\u0068ello")],
    ["text-no-final-line-break", text.replace('[null,"end",3]\n', '[null,"end",3]')],
    ["text-wrong-count", text.replace('[null,"end",3]', '[null,"end",2]')],
    ["text-line-after-end", `${text}[null,"end",3]\n`],
    ["text-path-repeated", text.replace('"src/b.ts","file"', '"src/a.ts","file"')]
  ];
  const small = (authored: string): Scan => ({ head: smallHead, files: [plain("a", { authored })] });
  const t2 = textOfScan(small("x\b/\u007f é\u{1F600}\u001f\"y"));
  for (const [from, to, name] of [["\\b", "\\u0008", "u0008"], ["/", "\\/", "escaped-slash"], ["\u007f", "\\u007f", "u007f"], [" ", "\\u2028", "u2028"], ["é", "\\u00e9", "u00e9"], ["\u{1F600}", "\\ud83d\\ude00", "surrogate-pair"], ["\\u001f", "\\u001F", "uppercase-hex"], ['\\"', "\\u0022", "u0022"], ['["a","file",4,', '["a","file",4e0,', "4e0"], ['["a","file",4,', '["a","file",4.0,', "4.0-b"], ['["a","file",4,', '[ "a","file",4,', "leading-space"]]) {
    out.push([`text-${name}`, t2.replace(from, to)]);
  }
  const e = new TextEncoder().encode(textOfScan(small("é")));
  out.push(["text-byte-order-mark", new Uint8Array([0xef, 0xbb, 0xbf, ...e])]);
  out.push(["text-byte-ff", new Uint8Array([...e.subarray(0, 40), 0xff, ...e.subarray(40)])]);
  out.push(["text-crlf", textOfScan(small("é")).replace(/\n/gu, "\r\n")]);
  return out;
}

const sha = (b: Uint8Array | string): string => createHash("sha256").update(b).digest("hex");

/** The second reading's own, aimed at the amended sections: the extension's characters, the text's order and members. */
async function secondRefusals(): Promise<[string, string | Uint8Array][]> {
  const out: [string, string | Uint8Array][] = [];
  const frames = framesOf(await bytesOf(everyFact()));
  const head = frames.findIndex((f) => f.kind === 1);
  const text = (t: string): Uint8Array => Buffer.from([...varint(Buffer.byteLength(t)), ...Buffer.from(t)]);
  const headWith = (extension: string): Uint8Array => { const h = frames[head].raw; let at = 1; const take = (): void => { const [n, next] = readVarint(h, at); at = next + n; }; take(); take(); const before = h.subarray(0, at); take(); return Buffer.concat([before, text(extension), h.subarray(at)]); };
  for (const [name, extension] of [["second-extension-backslash", "\\"], ["second-extension-backslash-inside", ".md\\x"], ["second-extension-nul", ".md\u0000"], ["second-extension-slash", "/md"], ["second-extension-empty", ""]] as const) {
    out.push([`${name}.fpk`, framed(frames.map((f, i) => (i === head ? { ...f, raw: headWith(extension) } : f)))]);
  }
  const t = textOfScan(everyFact());
  const lines = t.split("\n").slice(0, -1);
  const find = (kind: string, p = "src/a.ts"): number => lines.findIndex((l) => l.startsWith(`[${JSON.stringify(p)},${JSON.stringify(kind)}`));
  const moved = (from: number, to: number): string => { const l = [...lines]; const [x] = l.splice(from, 1); l.splice(to, 0, x); return `${l.join("\n")}\n`; };
  const doubled = (at: number): string => { const l = [...lines]; l.splice(at, 0, lines[at]); return `${l.join("\n")}\n`; };
  out.push(["second-text-authored-before-file.txt", moved(find("authored"), find("file"))]);
  out.push(["second-text-dependency-before-symbol.txt", moved(find("dependency"), find("symbol"))]);
  out.push(["second-text-entry-after-symbol.txt", moved(find("entry"), find("symbol"))]);
  out.push(["second-text-scanner-before-location.txt", moved(2, 1)]);
  out.push(["second-text-file-twice.txt", doubled(find("file"))]);
  out.push(["second-text-authored-twice.txt", doubled(find("authored"))]);
  out.push(["second-text-cited-by-twice.txt", doubled(find("cited-by"))]);
  out.push(["second-text-symbol-twice.txt", doubled(find("symbol"))]);
  out.push(["second-text-location-twice.txt", doubled(1)]);
  out.push(["second-text-no-documentation-member.txt", t.replace(',"documentation":[]', "")]);
  out.push(["second-text-doc-target-without-link.txt", t.replace('{"name":"Widget","link":"b.ts.mdmd.md#widget","target":"src/b.ts","anchor":"widget"}', '{"name":"Widget","target":"src/b.ts","anchor":"widget"}')]);
  out.push(["second-text-doc-members-reordered.txt", t.replace('{"name":"Gone","element":"exception"', '{"element":"exception","name":"Gone"')]);
  out.push(["second-text-doc-element-null.txt", t.replace('{"name":"Unlinked"}', '{"name":"Unlinked","element":null}')]);
  const back = { ...everyFact(), head: { ...everyFact().head, location: { ...everyFact().head.location, extension: "\\" } } };
  out.push(["second-text-extension-backslash.txt", textOfScan(back)]);
  // A valid text past the export's bound (section 3.5): the facts of probe-text-past-the-file-bound, whose text textOf refuses.
  const long = "k".repeat(32 * 1024);
  out.push(["second-text-past-the-export-bound.txt", textOfScan({ head: smallHead, files: [plain("a", { symbols: Array.from({ length: 2000 }, (_, i) => ({ name: `s${i}`, kind: long, flags: [], references: [], sections: [], documentation: [] })) })] })]);
  for (const [name, body] of out) if (typeof body === "string" && body === t) throw new Error(`${name} is unchanged`);
  return out;
}

/** The graph as the second reading's instruction asks it printed, with every object's members sorted, as one string. */
function graphAnswer(scan: Scan): string {
  const g = graphOf(scan);
  const files = Object.values(g.files).map((f) => ({ path: f.codePath, document: docPathOf(scan.head.location, f.codePath), edges: f.edges, outbound: f.outbound, inbound: f.inbound, documentation: f.documentation, documentedBy: f.documentedBy }));
  return canonical({ files });
}
function canonical(v: unknown): string {
  return JSON.stringify(v, (_k, x: unknown) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x as Record<string, unknown>).filter(([, y]) => y !== undefined).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) : x));
}

void (async () => {
  if (mode === "corpus") {
    const [indexPath, base] = positional;
    const graph = JSON.parse(readFileSync(indexPath, "utf8")) as LiveDocGraph;
    await both(scanOfGraph(graph, "live-documentation 0.0.0"), base);
  } else if (mode === "made") {
    const [dir] = positional; mkdirSync(dir, { recursive: true });
    for (const [name, scan] of madeScans()) await both(scan, path.join(dir, name));
  } else if (mode === "refusals") {
    const [dir, ...bases] = positional; mkdirSync(dir, { recursive: true });
    const seeds = Number(option("--seeds", "400"));
    const bomb = new Uint8Array(deflateRawSync(Buffer.alloc(256 * 1024 * 1024), { level: constants.Z_BEST_SPEED }));
    const baseBytes = bases.map((b) => new Uint8Array(readFileSync(b)));
    const kinds: Record<string, number> = {};
    for (let seed = 0; seed < seeds; seed += 1) {
      const b = Math.floor(seed / 8) % baseBytes.length;
      const { kind, bytes } = mutant(baseBytes[b], seed, bomb);
      kinds[kind] = (kinds[kind] ?? 0) + 1;
      writeFileSync(path.join(dir, `mutant-${String(seed).padStart(4, "0")}-${path.basename(bases[b], ".fpk")}-${kind.replace(/ /g, "-")}.fpk`), bytes);
    }
    for (const [name, bytes] of [...(await unitRefusals()), ...(await probeRefusals())]) writeFileSync(path.join(dir, `${name}.fpk`), bytes);
    for (const [name, text] of textRefusals()) writeFileSync(path.join(dir, `${name}.txt`), text);
    console.log(JSON.stringify(kinds));
  } else if (mode === "second") {
    const [dir] = positional; mkdirSync(dir, { recursive: true });
    for (const [name, body] of await secondRefusals()) writeFileSync(path.join(dir, name), body);
  } else if (mode === "answers") {
    for (const dir of positional) {
      const answers: Record<string, unknown> = {};
      for (const f of readdirSync(dir).sort()) {
        const bytes = new Uint8Array(readFileSync(path.join(dir, f)));
        if (f.endsWith(".fpk")) {
          const read = await readScan(bytes);
          const text = read.ok ? await textOf(bytes) : read;
          // The second reading: the graph of every file the module reads, and for a file whose text the module refuses
          // past the export's bound, the text its textOfScan writes, which section 3.5 now lets a reader write too.
          const graph = read.ok ? sha(graphAnswer(read.value)) : undefined;
          const written = read.ok && !text.ok ? textOfScan(read.value) : undefined;
          answers[f] = text.ok ? { reads: true, textSha256: sha(text.value), textBytes: Buffer.byteLength(text.value), name: read.ok ? read.value.name : undefined, graphSha256: graph, fileSha256: sha(bytes) } : { reads: false, readOk: read.ok, reason: text.reason, ...(written !== undefined ? { graphSha256: graph, textSha256: sha(written), textBytes: Buffer.byteLength(written) } : {}), fileSha256: sha(bytes) };
        } else if (f.endsWith(".txt")) {
          const again = await bytesOfText(bytes);
          const read = again.ok ? await readScan(again.value) : again;
          answers[f] = read.ok ? { reads: true, name: read.value.name, fileSha256: sha(bytes) } : { reads: false, reason: read.reason, fileSha256: sha(bytes) };
        }
      }
      writeFileSync(path.join(dir, "answers.json"), JSON.stringify(answers, null, 1));
      const values = Object.values(answers) as { reads: boolean }[];
      console.log(`${dir}: ${values.length} files, ${values.filter((v) => v.reads).length} read, ${values.filter((v) => !v.reads).length} refused`);
    }
  } else throw new Error("usage: samples.ts corpus <index.json> <out-base> | made <dir> | refusals <dir> <base.fpk>... | answers <dir>...");
})().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
