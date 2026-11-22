// Refusals taken from the two readers written blind from the specification on 2026-11-22, in Python and in Go
// (AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/stored-form-second-reader/, their own tests):
// those of their 157 and 161 files that this package's unit cases and fuzzer did not already make. Each case names
// the blind reader's file it follows. The module refused every one of them before they came here; they are kept so
// that it goes on refusing them.
import { deflateRawSync, deflateSync, inflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";

import { createWriter, readScan, scanOfText, SIGNATURE, textOfScan, writeScan, type Scan } from "../src/storedForm";
import { everyFact } from "./testScans";

interface Frame {
  kind: number;
  count: number;
  raw: Uint8Array;
}

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

/** Frames set down with their own hashes and the end naming them; `store` compresses each, raw deflate by default. */
async function framed(frames: Frame[], store: (raw: Uint8Array, i: number) => Uint8Array = (raw) => deflateRawSync(raw)): Promise<Uint8Array> {
  const parts: Uint8Array[] = [SIGNATURE];
  const hashes: Uint8Array[] = [];
  for (const [i, f] of frames.entries()) {
    const raw = f.kind === 6 ? new Uint8Array(await crypto.subtle.digest("SHA-256", Buffer.concat(hashes))) : f.raw;
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", raw));
    hashes.push(hash);
    const stored = store(raw, i);
    const header = Buffer.alloc(13);
    header[0] = f.kind;
    header.writeUInt32LE(f.kind === 6 ? frames.length - 1 : f.count, 1);
    header.writeUInt32LE(raw.length, 5);
    header.writeUInt32LE(stored.length, 9);
    parts.push(header, hash, stored);
  }
  return Buffer.concat(parts);
}

/** A text of the given length then its bytes, as the head writes one. */
const text = (s: string): Uint8Array => {
  const b = Buffer.from(s);
  return Buffer.concat([Buffer.from([b.length]), b]);
};
const head = (root: string, baseLayer: string, extension: string, version = 1): Uint8Array => Buffer.concat([Buffer.from([version]), text(root), text(baseLayer), text(extension), text("s"), Buffer.from([0])]);
const paths = (entries: [number, string][]): Uint8Array => Buffer.concat(entries.map(([shared, rest]) => Buffer.concat([Buffer.from([shared]), text(rest)])));

async function base(): Promise<Frame[]> {
  const written = await writeScan(everyFact());
  if (!written.ok) throw new Error(written.reason);
  return framesOf(written.value);
}

const at = (frames: Frame[], kind: number): number => frames.findIndex((f) => f.kind === kind);
const change = (frames: Frame[], kind: number, raw: (f: Frame) => Partial<Frame>): Frame[] => frames.map((f, i) => (i === at(frames, kind) ? { ...f, ...raw(f) } : f));
const plus = (raw: Uint8Array, ...bytes: number[]): Uint8Array => Buffer.concat([raw, Buffer.from(bytes)]);

describe("refusals the blind readers made", () => {
  const cases: [string, (frames: Frame[]) => Frame[] | Promise<Uint8Array>][] = [
    ["head-trailing-byte", (f) => change(f, 1, (h) => ({ raw: plus(h.raw, 0) }))],
    ["strings-trailing-byte", (f) => change(f, 2, (s) => ({ raw: plus(s.raw, 0) }))],
    ["paths-trailing", (f) => change(f, 4, (p) => ({ raw: plus(p.raw, 0) }))],
    ["wires-trailing", (f) => change(f, 5, (w) => ({ raw: plus(w.raw, 0) }))],
    // everyFact's wires are 01 01 01 00 00: the last file has none, and a `first` after its count of none is refused.
    ["wires-n0-with-first", (f) => change(f, 5, () => ({ raw: Buffer.from([1, 1, 1, 0, 0, 2]) }))],
    ["wires-self", (f) => change(f, 5, () => ({ raw: Buffer.from([1, 0, 1, 0, 0]) }))],
    ["head-version-2", (f) => change(f, 1, (h) => ({ raw: Buffer.concat([Buffer.from([2]), h.raw.subarray(1)]) }))],
    ["head-count-1", (f) => change(f, 1, () => ({ count: 1 }))],
    ["kind-7", (f) => [...f.slice(0, at(f, 4)), { kind: 7, count: 0, raw: new Uint8Array(0) }, ...f.slice(at(f, 4))]],
    ["strings-count-0", (f) => [...f.slice(0, at(f, 2)), { kind: 2, count: 0, raw: new Uint8Array(0) }, ...f.slice(at(f, 2))]],
    ["records-file-mark-bit-4", (f) => change(f, 3, (r) => ({ raw: Buffer.concat([r.raw.subarray(0, 2), Buffer.from([r.raw[2] | 0x10]), r.raw.subarray(3)]) }))],
    ["paths-not-longest-shared", (f) => change(f, 4, () => ({ raw: paths([[0, "src/a.ts"], [3, "/b.ts"], [4, "c.ts"]]) }))],
    ["paths-repeat", (f) => change(f, 4, () => ({ raw: paths([[0, "src/a.ts"], [4, "b.ts"], [8, ""]]) }))],
    ["root-absolute", (f) => change(f, 1, () => ({ raw: head("/abs", "layer-4", ".mdmd.md") }))],
    ["root-trailing-slash", (f) => change(f, 1, () => ({ raw: head(".mdmd/", "layer-4", ".mdmd.md") }))],
    ["extension-slash", (f) => change(f, 1, () => ({ raw: head(".mdmd", "layer-4", "/x") }))],
    ["zlib-wrapped", async (f) => framed(f, (raw, i) => (i === 0 ? deflateSync(raw) : deflateRawSync(raw)))],
    ["after-deflate-end", async (f) => framed(f, (raw, i) => (i === 0 ? plus(deflateRawSync(raw), 0) : deflateRawSync(raw)))]
  ];
  for (const [name, make] of cases) {
    it(`refuses ${name}`, async () => {
      const made = make(await base());
      const bytes = made instanceof Promise ? await made : await framed(made);
      const read = await readScan(bytes);
      expect(read.ok, name).toBe(false);
    });
  }

  it("refuses a file whose end's header counts the frames wrongly, and one whose raw length is more than it inflates to", async () => {
    const good = await framed(await base());
    const view = new DataView(good.buffer, good.byteOffset, good.byteLength);
    // The end is the last frame: its header begins 45 + its stored length before the file's end.
    let last = SIGNATURE.length;
    for (let at = SIGNATURE.length; at < good.length; at += 45 + view.getUint32(at + 9, true)) last = at;
    const wrongCount = Buffer.from(good);
    wrongCount.writeUInt32LE(9, last + 1);
    expect((await readScan(wrongCount)).ok).toBe(false);
    const fewer = Buffer.from(good);
    fewer.writeUInt32LE(fewer.readUInt32LE(SIGNATURE.length + 5) + 1, SIGNATURE.length + 5);
    expect((await readScan(fewer)).ok).toBe(false);
  });

  it("refuses texts whose lines are out of their order, doubled, missing or of no kind", () => {
    const good = textOfScan(everyFact());
    expect(scanOfText(good).ok).toBe(true);
    const lines = good.split("\n");
    const find = (prefix: string): number => lines.findIndex((l) => l.startsWith(prefix));
    const without = (i: number): string => [...lines.slice(0, i), ...lines.slice(i + 1)].join("\n");
    const swap = (i: number, j: number): string => lines.map((l, k) => (k === i ? lines[j] : k === j ? lines[i] : l)).join("\n");
    const authored = find('["src/a.ts","authored"');
    const entry = find('["src/a.ts","entry"');
    const symbol = find('["src/a.ts","symbol"');
    const cited = find('["src/a.ts","cited-by"');
    const variants: [string, string][] = [
      ["no-authored", without(authored)],
      ["entry-before-authored", swap(authored, entry)],
      ["symbol-before-entry", swap(entry + 2, symbol)],
      ["two-cited-by", [...lines.slice(0, cited + 1), lines[cited], ...lines.slice(cited + 1)].join("\n")],
      ["unknown-line", [...lines.slice(0, cited), '["src/a.ts","comment","x"]', ...lines.slice(cited)].join("\n")],
      ["member-twice", good.replace('{"name":"main","slug":"main"', '{"name":"main","name":"main","slug":"main"')]
    ];
    for (const [name, variant] of variants) {
      expect(variant, name).not.toBe(good);
      expect(scanOfText(variant).ok, name).toBe(false);
    }
  });
});

describe("the extension", () => {
  const scan = (extension: string): Scan => ({ ...everyFact(), head: { ...everyFact().head, location: { ...everyFact().head.location, extension } } });

  it("holds no slash, backslash or NUL: a writer refuses them, and so does a reader", async () => {
    for (const extension of ["/x", "\\x", ".md\u0000"]) {
      expect(() => createWriter(scan(extension).head), JSON.stringify(extension)).toThrow(/extension/u);
      const frames = await base();
      expect((await readScan(await framed(change(frames, 1, () => ({ raw: head(".mdmd", "layer-4", extension) }))))).ok, JSON.stringify(extension)).toBe(false);
    }
    expect((await writeScan(scan(""))).ok).toBe(true);
    expect((await writeScan(scan(".mdmd.md"))).ok).toBe(true);
  });
});
