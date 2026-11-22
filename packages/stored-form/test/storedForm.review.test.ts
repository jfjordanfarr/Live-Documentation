// The stored form's review of 2026-11-22: each case is one finding, built as the file or the text that shows it, and
// fails today for the reason its name states. A case for a finding against the specification's text, where the module
// is not at fault, states the rule and is skipped with the reason in its name. The review's record, with the probes
// that measured each finding at larger sizes, is
// AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/stored-form-review/README.md.
import { createHash } from "node:crypto";
import { setFlagsFromString } from "node:v8";
import { runInNewContext } from "node:vm";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";

import { bytesOfText, createWriter, graphOf, graphViewOf, inflationBound, MAX_SECTION, openScan, readScan, scanOfText, SIGNATURE, textOf, textOfScan, writeScan, type Scan, type ScanHead, type StoredFile, type StoredSymbol } from "../src/storedForm";
import { everyFact, seededScan } from "./testScans";

const head: ScanHead = { location: { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" }, scanner: "review", leftOut: [] };
const file = (codePath: string, more: Partial<StoredFile> = {}): StoredFile => ({ codePath, layer: 4, entries: [], authored: "", symbols: [], dependencies: [], ...more });
/** The smallest symbol: seven bytes of a record, its name and kind the empty string. */
const emptySymbol: StoredSymbol = { name: "", kind: "", flags: [], references: [], sections: [], documentation: [] };
const symbols = (n: number): StoredSymbol[] => Array.from({ length: n }, () => emptySymbol);

interface Frame {
  kind: number;
  count: number;
  raw: Uint8Array;
}

function framesOf(bytes: Uint8Array): Frame[] {
  const view = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out: Frame[] = [];
  for (let at = SIGNATURE.length; at < bytes.length; ) {
    const stored = view.readUInt32LE(at + 9);
    out.push({ kind: bytes[at], count: view.readUInt32LE(at + 1), raw: new Uint8Array(inflateRawSync(bytes.subarray(at + 45, at + 45 + stored))) });
    at += 45 + stored;
  }
  return out;
}

/** Frames set down with their own hashes and the end naming them; `store` compresses each, raw deflate by default. */
function framed(frames: Frame[], store: (raw: Uint8Array, i: number) => Uint8Array = (raw) => deflateRawSync(raw)): Uint8Array {
  const parts: Uint8Array[] = [SIGNATURE];
  const hashes: Uint8Array[] = [];
  frames.forEach((f, i) => {
    const raw = f.kind === 6 ? createHash("sha256").update(Buffer.concat(hashes)).digest() : f.raw;
    const hash = createHash("sha256").update(raw).digest();
    hashes.push(hash);
    const stored = store(raw, i);
    const header = Buffer.alloc(13);
    header[0] = f.kind;
    header.writeUInt32LE(f.kind === 6 ? frames.length - 1 : f.count, 1);
    header.writeUInt32LE(raw.length, 5);
    header.writeUInt32LE(stored.length, 9);
    parts.push(header, hash, stored);
  });
  return Buffer.concat(parts);
}

/**
 * A scan's file, its first records' stream led by empty stored blocks (five bytes each, inflating to nothing) until
 * the file is a 63rd of what it inflates to: within section 3.5's bound of 64 times the file and a mebibyte. Any raw
 * deflate stream is allowed (section 3.4), and every inflater reads these. The writer is asked for its frames as it
 * sets them down, since its own compression of facts this repetitive would put them past the bound.
 */
async function within(scan: Scan): Promise<Uint8Array> {
  const pieces: Uint8Array[] = [];
  const writer = createWriter(scan.head, { onBytes: (b) => void pieces.push(b) });
  for (const f of scan.files) await writer.add(f);
  await writer.finish().catch(() => undefined);
  const frames = framesOf(Buffer.concat(pieces));
  const raw = frames.reduce((n, f) => n + f.raw.length, 0);
  const plain = framed(frames).length;
  const blocks = Math.max(0, Math.ceil((Math.ceil((raw - 1024 * 1024) / 63) - plain) / 5));
  const padding = Buffer.alloc(5 * blocks);
  for (let b = 0; b < blocks; b += 1) padding.writeUInt16LE(0xffff, 5 * b + 3);
  const first = frames.findIndex((f) => f.kind === 3);
  const bytes = framed(frames, (r, i) => (i === first ? Buffer.concat([padding, deflateRawSync(r)]) : deflateRawSync(r)));
  if (raw > inflationBound(bytes.length)) throw new Error("the made file is past the bound it was made to be within");
  return bytes;
}

async function bytesOf(scan: Scan): Promise<Uint8Array> {
  const written = await writeScan(scan);
  if (!written.ok) throw new Error(written.reason);
  return written.value;
}

async function timed<T>(work: () => Promise<T> | T): Promise<{ value: T; ms: number }> {
  const start = performance.now();
  const value = await work();
  return { value, ms: performance.now() - start };
}

describe("the review: a reader's cost is bounded by the file it is handed", () => {
  it(
    "the text writes a file's path on every line of it, which the bound's count of names counts once: a 588-byte file's text is 22 MB, twenty times the bound, and is not refused",
    async () => {
      const bytes = await bytesOf({ head, files: [file("a".repeat(1024), { symbols: symbols(20_000) })] });
      expect(bytes.length).toBeLessThan(1024);
      const text = await textOf(bytes);
      // Section 3.5 lets a reader refuse the text past 64 times the file and a mebibyte, and the module's `textOf` means
      // to: "a small file naming one long string a million times is refused rather than written". This one is written.
      expect(text.ok ? text.value.length : 0).toBeLessThanOrEqual(inflationBound(bytes.length));
    },
    60_000
  );

  it(
    "the text of one file of 149,000 lines throws a RangeError from a spread call, where a reader returns facts or a refusal and never fails in any other way (section 6)",
    async () => {
      const bytes = await bytesOf({ head, files: [file("a", { symbols: symbols(149_000) })] });
      expect(bytes.length).toBeLessThan(4096);
      const answer = await textOf(bytes).then(
        (r) => (r.ok ? "a text" : `refused: ${r.reason}`),
        (error: unknown) => `threw ${String(error)}`
      );
      expect(answer).not.toMatch(/^threw/u);
    },
    60_000
  );

  it(
    "the graph sorts paths by comparing them from their first character, so paths with a long shared beginning make the graph cost many times the read it is built from",
    async () => {
      // 200 files under one folder whose name is 4,096 letters long, each depending on every file: the facts are a
      // 200 by 200 table, read in linear time; the graph sorts every file's 200 targets by string, each comparison
      // walking the 4,096 letters the paths share.
      const prefix = "p".repeat(4096);
      const paths = Array.from({ length: 200 }, (_, i) => `${prefix}/${String(i).padStart(3, "0")}`);
      const dependencies = paths.map((target) => ({ label: "x", link: "x", target, qualifiers: [] }));
      const bytes = await within({ head, files: paths.map((p) => file(p, { dependencies })) });
      const read = await timed(() => readScan(bytes));
      if (!read.value.ok) throw new Error(read.value.reason);
      const scan = read.value.value;
      const graph = await timed(() => graphOf(scan));
      expect(Object.keys(graph.value.files).length).toBe(200);
      expect(graph.ms, `read in ${read.ms.toFixed(0)} ms, graph in ${graph.ms.toFixed(0)} ms, from a file of ${bytes.length} bytes`).toBeLessThan(5 * read.ms + 250);
    },
    120_000
  );

  it(
    "the whole read inflates every frame at once before it checks anything, so a file the quick open refuses in milliseconds costs the whole read seconds and hundreds of megabytes",
    async () => {
      // 10,000 frames of records, each declaring 256 files in one byte: the paths' count (2,560,000 in one byte) is
      // refused by both readers, the quick open before any record is inflated.
      const frames: Frame[] = [{ kind: 1, count: 0, raw: new Uint8Array([1, 0, 0, 0, 1, 0x73, 0]) }];
      for (let i = 0; i < 10_000; i += 1) frames.push({ kind: 3, count: 256, raw: new Uint8Array([0]) });
      frames.push({ kind: 4, count: 2_560_000, raw: new Uint8Array([0]) }, { kind: 5, count: 2_560_000, raw: new Uint8Array([0]) }, { kind: 6, count: 0, raw: new Uint8Array(32) });
      const bytes = framed(frames);
      const quick = await timed(() => openScan(bytes));
      const whole = await timed(() => readScan(bytes));
      expect(quick.value.ok || whole.value.ok).toBe(false);
      expect(whole.ms, `quick open refused in ${quick.ms.toFixed(0)} ms, the whole read in ${whole.ms.toFixed(0)} ms`).toBeLessThan(10 * quick.ms + 500);
    },
    120_000
  );

  it(
    "a 94 KB file within the inflation bound holds more than 150 MiB once read, past the bound the module's own fuzzer holds a read to (48 MiB and 64 bytes a byte): every fact takes one byte of the file's 64, but a JavaScript object of a hundred",
    async () => {
      setFlagsFromString("--expose-gc");
      const gc = runInNewContext("gc") as () => void;
      const used = (): number => {
        const m = process.memoryUsage();
        return m.heapUsed + m.arrayBuffers + m.external;
      };
      const bytes = await within({ head, files: [file("a", { symbols: symbols(1_000_000) })] });
      gc();
      const before = used();
      const read = await readScan(bytes);
      gc();
      const held = used() - before;
      expect(read.ok && read.value.files[0].symbols.length).toBe(1_000_000);
      expect(held, `a file of ${bytes.length} bytes`).toBeLessThanOrEqual(48 * 1024 * 1024 + 64 * bytes.length);
    },
    120_000
  );
});

describe("the review: one set of facts, one text", () => {
  const text = textOfScan({ head, files: [file("a"), file("b")] });

  it("reads the text these are made from", () => {
    expect(text.endsWith('[null,"end",2]\n')).toBe(true);
    expect(scanOfText(text).ok).toBe(true);
  });

  // Section 8: "Each line is one JSON value written in exactly one way", "no line holds a CR", and among the refused,
  // "a space anywhere outside a string", "`4.0` or `4e0` for `4`", "a letter written as a `\u` escape". Every line but
  // the end is parsed, written again and compared; the end line is only parsed.
  for (const end of ['[null, "end", 2]', '[null,"end",2.0]', '[null,"end",2e0]', '[null,"\\u0065nd",2]', '[null,"end",2]\r', ' [null,"end",2]\t']) {
    it(`refuses the end line written ${JSON.stringify(end)}, which it accepts today`, () => {
      const variant = text.replace('[null,"end",2]', end);
      expect(variant).not.toBe(text);
      expect(scanOfText(variant).ok).toBe(false);
    });
  }
});

describe("the review: the graph", () => {
  // A path is any string section 2.4 allows; `__proto__` is one. `graphOf` keys its files in a plain object, where
  // setting `__proto__` sets the object's prototype instead of a member.
  const scan: Scan = { head, files: [file("__proto__", { dependencies: [{ label: "a", link: "a.ts.mdmd.md", target: "a", qualifiers: [] }] }), file("a")] };

  it("gives the whole graph every file the view gives: a file named __proto__ is in the view and missing from the whole graph", async () => {
    const read = await readScan(await bytesOf(scan));
    if (!read.ok) throw new Error(read.reason);
    const view = graphViewOf(read.value);
    expect(view.file("__proto__")?.codePath).toBe("__proto__");
    expect(Object.keys(graphOf(read.value).files)).toEqual([...view.paths]);
  });

  it("answers nothing for a path no file has: in the whole graph of a scan with a file named __proto__, the path `edges` answers with that file's edges", async () => {
    const read = await readScan(await bytesOf(scan));
    if (!read.ok) throw new Error(read.reason);
    const files = graphOf(read.value).files as Record<string, unknown>;
    expect(files.edges).toBeUndefined();
  });
});

describe("the review: what the specification says against what it accepts", () => {
  it(
    "refuses as text the facts no valid file holds: one string past 64 MiB is a valid text by section 8's list, which omits the section limit, and no valid file by its 'Equivalently'",
    async () => {
      const text = textOfScan({ head, files: [file("a", { authored: "a".repeat(MAX_SECTION) })] });
      const asText = scanOfText(text).ok;
      const asBytes = (await bytesOfText(text)).ok;
      expect(asBytes).toBe(false);
      expect(asText).toBe(asBytes);
    },
    120_000
  );

  it.skip("[text, skipped: the module and the engine make this edge; the mend is section 5's sentence 'The links that make edges, in order: each dependency with a link'] every dependency makes an edge, and one with no link has no link and no `to`", () => {
    const graph = graphOf({ head, files: [file("a", { dependencies: [{ label: "node:fs", qualifiers: [] }] })] });
    expect(graph.files.a.edges).toEqual([{ kind: "import", label: "node:fs" }]);
  });

  it.skip("[text, skipped: section 2.4's rule lists only `/`, `\\`, a drive and `file:`, and the module keeps that rule; the mend is the text's, one way or the other] a link may not name an absolute place: `https://`, `javascript:` and `data:` are refused", async () => {
    for (const link of ["https://example.com/x", "javascript:alert(1)", "data:text/html,x"]) {
      expect((await writeScan({ head, files: [file("a", { dependencies: [{ label: "x", link, qualifiers: [] }] })] })).ok, link).toBe(false);
    }
  });

  it.skip("[text, skipped: section 9 leaves these to the export, and names only some of them] a location and paths whose documents land on the scanned files or outside the folder are refused: an empty location puts `src/a.ts`'s document on `src/a.ts`; an extension `:x` puts it in an alternate data stream of the source on NTFS; `a\\..\\..\\x` climbs out on Windows", async () => {
    const plain: ScanHead = { ...head, location: { root: "", baseLayer: "", extension: "" } };
    expect((await writeScan({ head: plain, files: [file("src/a.ts")] })).ok).toBe(false);
    expect((await writeScan({ head: { ...head, location: { root: "", baseLayer: "", extension: ":x" } }, files: [file("src/a.ts")] })).ok).toBe(false);
    expect((await writeScan({ head, files: [file("a\\..\\..\\x")] })).ok).toBe(false);
  });

  it.skip("[remark, skipped: the specification declines this check (sections 4.3 and 12)] what a person reads and what the graph draws agree: a dependency labelled `./b` whose link opens b's document, and a documentation line naming `Widget` on b, here both land on c in the graph", async () => {
    const b = "src/b.ts";
    const c = "src/c.ts";
    const hostile: Scan = {
      head,
      files: [
        file("src/a.ts", {
          dependencies: [{ label: "./b", link: "b.ts.mdmd.md", target: c, qualifiers: [] }],
          symbols: [{ ...emptySymbol, name: "main", kind: "function", sections: [{ title: "Links", body: ["- [`Widget`](b.ts.mdmd.md#widget)"] }], documentation: [{ name: "Widget", link: "b.ts.mdmd.md#widget", target: c, anchor: "widget" }] }]
        }),
        file(b),
        file(c)
      ]
    };
    const read = await readScan(await bytesOf(hostile));
    if (!read.ok) throw new Error(read.reason);
    const graph = graphOf(read.value);
    expect(graph.files[b].inbound).toEqual(["src/a.ts"]);
    expect(graph.files[b].documentedBy).toEqual(["src/a.ts"]);
  });
});

describe("the review: the fuzzer", () => {
  it(
    "reaches the grammar of a section: of its mutants, those refused by a check on a section's uncompressed bytes are at least a tenth, where today they are one in a hundred",
    async () => {
      const { mutant } = (await import(new URL("./fuzz/mutants.mjs", import.meta.url).href)) as { mutant: (base: Uint8Array, seed: number, bomb: Uint8Array) => { kind: string; bytes: Uint8Array } };
      const bases = [await bytesOf(everyFact()), await bytesOf(seededScan(3, 300))];
      // The refusals a frame's header, its deflate stream, its hash or the frames' order make: everything else is a
      // check on what a section says.
      const frameLevel = /signature|a section of kind|declares|stops before its end|after the end|is not a whole raw deflate stream|inflates past|inflates to \d+ bytes|does not match its hash|the end does not|the first section is not the head|not followed by records|records before the last|a section of \d+ records|the sections after the records|the paths or wires count|a section of no strings|there is no head/u;
      let mutants = 0;
      let grammar = 0;
      for (let seed = 0; seed < 400; seed += 1) {
        // The bombs (every eighth seed from 3) are left out: they are the frame layer's by construction.
        if (seed % 8 === 3) continue;
        const { bytes } = mutant(bases[Math.floor(seed / 8) % 2], seed, new Uint8Array(0));
        const read = await readScan(bytes);
        mutants += 1;
        if (!read.ok && !frameLevel.test(read.reason)) grammar += 1;
      }
      expect(grammar, `${grammar} of ${mutants} mutants refused by a section's grammar`).toBeGreaterThanOrEqual(mutants / 10);
    },
    120_000
  );
});
