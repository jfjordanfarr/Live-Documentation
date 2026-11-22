// Refusals taken from the two readers written blind from the specification on 2026-11-22, in Python and in Go
// (AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/stored-form-second-reader/, their own tests):
// those of their 157 and 161 files that this package's unit cases and fuzzer did not already make. Each case names
// the blind reader's file it follows. The module refused every one of them before they came here; they are kept so
// that it goes on refusing them.
import { deflateRawSync, deflateSync, inflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";

import { createWriter, READ_AHEAD, readScan, scanOfText, SIGNATURE, textOfScan, writeScan, type Scan } from "../src/storedForm";
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
  // Each case says the refusal its own check gives, not only that the file is refused: several files here are caught
  // by two checks, and a case that asked only for a refusal went on passing with its own check taken out (measured
  // on 2026-11-22 by check-removal.mjs in the module's probe). Asking for the words, each case fails when its check
  // is taken out, and so proves that check.
  const cases: [string, (frames: Frame[]) => Frame[] | Promise<Uint8Array>, RegExp][] = [
    ["head-trailing-byte", (f) => change(f, 1, (h) => ({ raw: plus(h.raw, 0) })), /the head has 1 bytes after its last fact/u],
    ["strings-trailing-byte", (f) => change(f, 2, (s) => ({ raw: plus(s.raw, 0) })), /a section of strings has 1 bytes after its last fact/u],
    ["paths-trailing", (f) => change(f, 4, (p) => ({ raw: plus(p.raw, 0) })), /the paths has 1 bytes after its last fact/u],
    ["wires-trailing", (f) => change(f, 5, (w) => ({ raw: plus(w.raw, 0) })), /the wires has 1 bytes after its last fact/u],
    // everyFact's wires are 01 01 01 00 00: the last file has none, and a `first` after its count of none is refused.
    ["wires-n0-with-first", (f) => change(f, 5, () => ({ raw: Buffer.from([1, 1, 1, 0, 0, 2]) })), /the wires has 1 bytes after its last fact/u],
    ["wires-self", (f) => change(f, 5, () => ({ raw: Buffer.from([1, 0, 1, 0, 0]) })), /a wire of file 0 names file 0/u],
    ["head-version-2", (f) => change(f, 1, (h) => ({ raw: Buffer.concat([Buffer.from([2]), h.raw.subarray(1)]) })), /version is 2/u],
    ["head-count-1", (f) => change(f, 1, () => ({ count: 1 })), /the first section is not the head/u],
    ["kind-7", (f) => [...f.slice(0, at(f, 4)), { kind: 7, count: 0, raw: new Uint8Array(0) }, ...f.slice(at(f, 4))], /a section of kind 7/u],
    ["strings-count-0", (f) => [...f.slice(0, at(f, 2)), { kind: 2, count: 0, raw: new Uint8Array(0) }, ...f.slice(at(f, 2))], /a section of no strings/u],
    ["records-file-mark-bit-4", (f) => change(f, 3, (r) => ({ raw: Buffer.concat([r.raw.subarray(0, 2), Buffer.from([r.raw[2] | 0x10]), r.raw.subarray(3)]) })), /sets a mark the layout does not define/u],
    ["paths-not-longest-shared", (f) => change(f, 4, () => ({ raw: paths([[0, "src/a.ts"], [3, "/b.ts"], [4, "c.ts"]]) })), /shared beginning is written shorter/u],
    ["paths-repeat", (f) => change(f, 4, () => ({ raw: paths([[0, "src/a.ts"], [4, "b.ts"], [8, ""]]) })), /the paths are not in order/u],
    ["paths-differ-from-records", (f) => change(f, 4, () => ({ raw: paths([[0, "src/a.ts"], [4, "b.ts"], [4, "d.ts"]]) })), /the paths name "src\/d.ts" where the records hold "src\/c.ts"/u],
    ["root-absolute", (f) => change(f, 1, () => ({ raw: head("/abs", "layer-4", ".mdmd.md") })), /root "\/abs" is not a relative path/u],
    ["root-trailing-slash", (f) => change(f, 1, () => ({ raw: head(".mdmd/", "layer-4", ".mdmd.md") })), /root ".mdmd\/" is not a plain relative path/u],
    ["extension-slash", (f) => change(f, 1, () => ({ raw: head(".mdmd", "layer-4", "/x") })), /extension holds a slash/u],
    ["zlib-wrapped", async (f) => framed(f, (raw, i) => (i === 0 ? deflateSync(raw) : deflateRawSync(raw))), /the head is not a whole raw deflate stream/u],
    ["after-deflate-end", async (f) => framed(f, (raw, i) => (i === 0 ? plus(deflateRawSync(raw), 0) : deflateRawSync(raw))), /the head is not a whole raw deflate stream/u]
  ];
  for (const [name, make, reason] of cases) {
    it(`refuses ${name}`, async () => {
      const made = make(await base());
      const bytes = made instanceof Promise ? await made : await framed(made);
      const read = await readScan(bytes);
      expect(read.ok ? "read" : read.reason, name).toMatch(reason);
    });
  }

  const endHeader = (bytes: Uint8Array): number => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let last = SIGNATURE.length;
    for (let at = SIGNATURE.length; at < bytes.length; at += 45 + view.getUint32(at + 9, true)) last = at;
    return last;
  };

  it("refuses end-count-wrong", async () => {
    const bytes = Buffer.from(await framed(await base()));
    bytes.writeUInt32LE(9, endHeader(bytes) + 1);
    const read = await readScan(bytes);
    expect(read.ok ? "read" : read.reason).toMatch(/the end does not count the sections before it/u);
  });

  it("refuses inflates-fewer: a raw length one more than the stream gives", async () => {
    const bytes = Buffer.from(await framed(await base()));
    bytes.writeUInt32LE(bytes.readUInt32LE(SIGNATURE.length + 5) + 1, SIGNATURE.length + 5);
    const read = await readScan(bytes);
    expect(read.ok ? "read" : read.reason).toMatch(/the head inflates to \d+ bytes, not the \d+ it declares/u);
  });

  const good = textOfScan(everyFact());
  const lines = good.split("\n");
  const find = (prefix: string): number => lines.findIndex((l) => l.startsWith(prefix));
  const without = (i: number): string => [...lines.slice(0, i), ...lines.slice(i + 1)].join("\n");
  const swap = (i: number, j: number): string => lines.map((l, k) => (k === i ? lines[j] : k === j ? lines[i] : l)).join("\n");
  const authored = find('["src/a.ts","authored"');
  const entry = find('["src/a.ts","entry"');
  const symbol = find('["src/a.ts","symbol"');
  const cited = find('["src/a.ts","cited-by"');
  const texts: [string, string, RegExp][] = [
    ["no-authored", without(authored), /is not "src\/a.ts"'s authored words/u],
    ["entry-before-authored", swap(authored, entry), /is not "src\/a.ts"'s authored words/u],
    ["symbol-before-entry", swap(entry + 2, symbol), /is not a file's first line/u],
    ["two-cited-by", [...lines.slice(0, cited + 1), lines[cited], ...lines.slice(cited + 1)].join("\n"), /has two cited-by lines/u],
    ["unknown-line", [...lines.slice(0, cited), '["src/a.ts","comment","x"]', ...lines.slice(cited)].join("\n"), /is not a file's first line/u],
    ["member-twice", good.replace('{"name":"main","slug":"main"', '{"name":"main","name":"main","slug":"main"'), /is not written as the text form writes it/u]
  ];
  it("reads the text these are made from", () => {
    expect(scanOfText(good).ok).toBe(true);
  });
  for (const [name, variant, reason] of texts) {
    it(`refuses the text ${name}`, () => {
      expect(variant).not.toBe(good);
      const read = scanOfText(variant);
      expect(read.ok ? "read" : read.reason, name).toMatch(reason);
    });
  }
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

describe("the read's window ahead", () => {
  it(
    "inflates at most READ_AHEAD past the section it checks: 24 incompressible sections of 2 MiB, the first refused, cost the read a few sections, not 48 MiB",
    async () => {
      const { randomBytes } = await import("node:crypto");
      const { setFlagsFromString } = await import("node:v8");
      const { runInNewContext } = await import("node:vm");
      setFlagsFromString("--expose-gc");
      const gc = runInNewContext("gc") as () => void;
      const sections = 24;
      const files = sections * 256;
      const names = Array.from({ length: files }, (_, i) => `f${String(i).padStart(5, "0")}`);
      // Every path shares "f" and as many digits as it can with the one before it.
      const coded = names.map((name, i) => {
        let shared = 0;
        const before = i === 0 ? "" : names[i - 1];
        while (shared < before.length && before[shared] === name[shared]) shared += 1;
        return [shared, name.slice(shared)] as [number, string];
      });
      const records = Array.from({ length: sections }, () => {
        const raw = new Uint8Array(randomBytes(2 * 1024 * 1024));
        // The first record names string 5 of a scan with no strings: refused at its first byte.
        raw[0] = 5;
        return { kind: 3, count: 256, raw };
      });
      // The strings hold every path, so that the paths are no longer than the strings that hold them.
      const strings = { kind: 2, count: files, raw: Buffer.concat(names.map((n) => text(n))) };
      const bytes = await framed([{ kind: 1, count: 0, raw: head("", "", ".md") }, strings, ...records, { kind: 4, count: files, raw: paths(coded) }, { kind: 5, count: files, raw: new Uint8Array(files) }, { kind: 6, count: 0, raw: new Uint8Array(32) }]);
      const used = (): number => {
        const m = process.memoryUsage();
        return m.arrayBuffers + m.external;
      };
      gc();
      const baseline = used();
      let peak = baseline;
      const sampler = setInterval(() => {
        peak = Math.max(peak, used());
      }, 1);
      const read = await readScan(bytes);
      // What the window started may still be finishing: wait for it, sampling, so that the peak is all of it.
      await new Promise((resolve) => setTimeout(resolve, 300));
      clearInterval(sampler);
      peak = Math.max(peak, used());
      expect(read.ok ? "read" : read.reason).toMatch(/a string numbered 5/u);
      const extra = peak - baseline;
      // The window, the section being read, and room for the inflater's own buffers: far under the 48 MiB the
      // sections hold.
      expect(extra, `${(extra / 1048576).toFixed(1)} MiB held past the file`).toBeLessThan(READ_AHEAD + 8 * 1024 * 1024);
    },
    120_000
  );
});
