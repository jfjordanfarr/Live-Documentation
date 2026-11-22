import { readFileSync } from "node:fs";
import path from "node:path";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";

import { bytesOfText, CHUNK, comparePaths, createWriter, graphOf, openScan, readScan, resumeFrom, scanOfText, SIGNATURE, textOf, textOfScan, writeScan, type Scan, type StoredFile } from "../src/storedForm";
import { everyFact, random, seededScan } from "./testScans";

async function bytesOf(scan: Scan): Promise<Uint8Array> {
  const written = await writeScan(scan);
  if (!written.ok) throw new Error(written.reason);
  return written.value;
}

/** The frames of a file, by the layout's header: kind, count, raw length, stored length, hash, then the stored bytes. */
function framesOf(bytes: Uint8Array): { kind: number; count: number; raw: Uint8Array }[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out = [];
  for (let at = SIGNATURE.length; at < bytes.length; ) {
    const stored = view.getUint32(at + 9, true);
    out.push({ kind: bytes[at], count: view.getUint32(at + 1, true), raw: new Uint8Array(inflateRawSync(bytes.subarray(at + 45, at + 45 + stored))) });
    at += 45 + stored;
  }
  return out;
}

/** Sets frames down again, each with its own hash and the end naming them: a file whole in shape, whatever it says. */
async function framed(frames: { kind: number; count: number; raw: Uint8Array }[]): Promise<Uint8Array> {
  const parts: Uint8Array[] = [SIGNATURE];
  const hashes: Uint8Array[] = [];
  for (const f of frames) {
    const raw = f.kind === 6 ? new Uint8Array(await crypto.subtle.digest("SHA-256", Buffer.concat(hashes))) : f.raw;
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", raw));
    hashes.push(hash);
    const stored = deflateRawSync(raw);
    const header = Buffer.alloc(13);
    header[0] = f.kind;
    header.writeUInt32LE(f.kind === 6 ? frames.length - 1 : f.count, 1);
    header.writeUInt32LE(raw.length, 5);
    header.writeUInt32LE(stored.length, 9);
    parts.push(header, hash, stored);
  }
  return Buffer.concat(parts);
}

async function refusal(bytes: Uint8Array): Promise<string> {
  const read = await readScan(bytes);
  if (read.ok) throw new Error("read, where a refusal was expected");
  return read.reason;
}

describe("the stored form", () => {
  it("reads back every fact it was given", async () => {
    const scan = everyFact();
    const read = await readScan(await bytesOf(scan));
    expect(read.ok && { head: read.value.head, files: read.value.files }).toEqual(scan);
  });

  it("writes the same bytes as facts arrive one at a time, in the pieces it hands on, as all at once", async () => {
    const scan = seededScan(7, CHUNK * 2 + 17);
    const pieces: Uint8Array[] = [];
    const writer = createWriter(scan.head, { onBytes: (b) => void pieces.push(b) });
    for (const file of scan.files) await writer.add(file);
    const finished = await writer.finish();
    expect(Buffer.concat(pieces)).toEqual(Buffer.from(finished));
    expect(Buffer.from(finished)).toEqual(Buffer.from(await bytesOf(scan)));
  });

  it("turns into text and back without loss, both ways", async () => {
    for (const scan of [everyFact(), seededScan(1, 40), seededScan(2, CHUNK + 1), { ...everyFact(), files: [] }]) {
      const bytes = await bytesOf(scan);
      const text = await textOf(bytes);
      if (!text.ok) throw new Error(text.reason);
      expect(text.value).toBe(textOfScan(scan));
      const again = await bytesOfText(text.value);
      expect(again.ok && Buffer.from(again.value)).toEqual(Buffer.from(bytes));
      const textAgain = again.ok ? await textOf(again.value) : undefined;
      expect(textAgain?.ok && textAgain.value).toBe(text.value);
    }
  });

  it("has one text for one set of facts: a line written any other way is refused", () => {
    const text = textOfScan(everyFact());
    expect(scanOfText(text).ok).toBe(true);
    const variants = [
      text.replace('["src/a.ts","file",', '["src/a.ts", "file",'),
      text.replace('["src/a.ts","file",4,', '["src/a.ts","file",4.0,'),
      text.replace('"name":"main","slug"', '"slug":"main","name":"main","x"'),
      text.replace('"array":true', '"array":false'),
      text.replace("Says hello", "Says \\u0068ello"),
      text.replace('[null,"end",3]\n', '[null,"end",3]'),
      text.replace('[null,"end",3]', '[null,"end",2]'),
      `${text}[null,"end",3]\n`,
      text.replace('"src/b.ts","file"', '"src/a.ts","file"')
    ];
    for (const variant of variants) {
      expect(variant).not.toBe(text);
      expect(scanOfText(variant).ok, variant.slice(0, 0)).toBe(false);
    }
  });

  it("gives the graph the facts describe: an edge lands only on a scanned file", async () => {
    const read = await readScan(await bytesOf(everyFact()));
    const graph = graphOf(read.ok ? read.value : everyFact());
    const a = graph.files["src/a.ts"];
    expect(a.docPath).toBe(".mdmd/layer-4/src/a.ts.mdmd.md");
    expect(a.outbound).toEqual(["src/b.ts"]);
    expect(graph.files["src/b.ts"].inbound).toEqual(["src/a.ts"]);
    expect(a.edges.find((e) => e.label === "Gone")).toEqual({ kind: "extends", label: "Gone", link: "gone.ts.mdmd.md" });
    expect(a.edges.find((e) => e.label === "Widget")).toEqual({ kind: "returns", label: "Widget", link: "b.ts.mdmd.md#widget", to: "src/b.ts", toSymbol: "widget", from: "main" });
    const opened = await openScan(await bytesOf(everyFact()));
    expect(opened.ok && opened.value.inbound(opened.value.indexOf("src/a.ts")).map((i) => opened.value.paths[i])).toEqual(["src/b.ts"]);
  });

  it("goes on from a stopped write to the bytes an unstopped one writes", async () => {
    const scan = seededScan(11, CHUNK * 3 + 5);
    const whole = await bytesOf(scan);
    expect((await resumeFrom(whole.subarray(0, 20))).ok).toBe(false);
    for (const cut of [600, Math.floor(whole.length / 2), whole.length - 200, whole.length - 1]) {
      const found = await resumeFrom(whole.subarray(0, cut));
      if (!found.ok) throw new Error(`cut at ${cut}: ${found.reason}`);
      const kept = found.value;
      expect(kept.paths.length % CHUNK).toBe(0);
      const pieces: Uint8Array[] = [kept.kept];
      const writer = createWriter(scan.head, { resume: kept, onBytes: (b) => void pieces.push(b) });
      for (const file of scan.files.slice(kept.paths.length)) await writer.add(file);
      expect(Buffer.from(await writer.finish())).toEqual(Buffer.from(whole));
      expect(Buffer.concat(pieces)).toEqual(Buffer.from(whole));
    }
    expect((await resumeFrom(whole)).ok).toBe(false);
  });

  it("refuses facts it cannot hold as they are, and goes on with the next file", async () => {
    const writer = createWriter(everyFact().head);
    const file = (codePath: string, more: Partial<StoredFile> = {}): StoredFile => ({ codePath, layer: 4, entries: [], authored: "", symbols: [], dependencies: [], ...more });
    await writer.add(file("b"));
    await expect(writer.add(file("a"))).rejects.toThrow(/path order/u);
    await expect(writer.add(file("/etc/passwd"))).rejects.toThrow(/relative path/u);
    await expect(writer.add(file("C:/Users/x/a.ts"))).rejects.toThrow(/relative path/u);
    await expect(writer.add(file("c/../d"))).rejects.toThrow(/plain relative path/u);
    await expect(writer.add(file("c", { authored: "\ud800" }))).rejects.toThrow(/lone surrogate/u);
    await expect(writer.add(file("c", { dependencies: [{ label: "x", link: "file:///etc/passwd", qualifiers: [] }] }))).rejects.toThrow(/absolute/u);
    await expect(writer.add(file("c", { layer: -1 }))).rejects.toThrow(/whole number/u);
    await writer.add(file("c", { authored: "first met after a refusal" }));
    const read = await readScan(await writer.finish());
    expect(read.ok && read.value.files.map((f) => f.codePath)).toEqual(["b", "c"]);
  });

  it("refuses a file that is whole in shape but not in its one form", async () => {
    const bytes = await bytesOf(seededScan(5, 30));
    const frames = framesOf(bytes);
    expect(await readScan(await framed(frames))).toMatchObject({ ok: true });
    const at = (kind: number): number => frames.findIndex((f) => f.kind === kind);
    const strings = at(2);
    // A string set down twice: the first string again, at the end of the section.
    const first = frames[strings].raw.subarray(0, 1 + frames[strings].raw[0]);
    const twice = frames.map((f, i) => (i === strings ? { ...f, count: f.count + 1, raw: Buffer.concat([f.raw, first]) } : f));
    expect(await refusal(await framed(twice))).toMatch(/set down twice|not met/u);
    // A string never named.
    const unnamed = frames.map((f, i) => (i === strings ? { ...f, count: f.count + 1, raw: Buffer.concat([f.raw, Buffer.from([3, 0x7a, 0x7a, 0x7a])]) } : f));
    expect(await refusal(await framed(unnamed))).toMatch(/not met/u);
    // A number written longer than it needs: the first record's path, 0, as 0x80 0x00.
    const records = at(3);
    const long = frames.map((f, i) => (i === records ? { ...f, raw: Buffer.concat([Buffer.from([0x80, 0x00]), f.raw.subarray(1)]) } : f));
    expect(await refusal(await framed(long))).toMatch(/longer than it needs/u);
    // Wires that are not those the links name.
    const wires = at(5);
    const lying = frames.map((f, i) => (i === wires ? { ...f, raw: Buffer.concat([Buffer.from([1, frames[wires].count - 1]), f.raw.subarray(1)]) } : f));
    expect(await refusal(await framed(lying))).toMatch(/wires|after its last fact|names file/u);
    // A character cut between two strings: `é` is C3 A9, the first string ending in C3 and the next beginning A9.
    // Joined, the two would decode; each alone is not UTF-8. And a byte that is never UTF-8, FF.
    const split = frames.map((f, i) => (i === strings ? { ...f, count: f.count + 2, raw: Buffer.concat([f.raw, Buffer.from([2, 0x61, 0xc3, 1, 0xa9])]) } : f));
    expect(await refusal(await framed(split))).toMatch(/middle of a character/u);
    const never = frames.map((f, i) => (i === strings ? { ...f, count: f.count + 1, raw: Buffer.concat([f.raw, Buffer.from([2, 0x61, 0xff])]) } : f));
    expect(await refusal(await framed(never))).toMatch(/not UTF-8/u);
    // Bytes after the end, and a file cut short.
    expect(await refusal(Buffer.concat([bytes, Buffer.from([0])]))).toMatch(/after the end/u);
    expect(await refusal(bytes.subarray(0, bytes.length - 1))).toMatch(/stops before its end/u);
    // A section whose bytes are not those its hash names.
    const flipped = Buffer.from(bytes);
    flipped[SIGNATURE.length + 20] ^= 1;
    expect(await refusal(flipped)).toMatch(/hash|deflate|name/u);
  });

  it("is one module that imports nothing", () => {
    const source = readFileSync(path.join(__dirname, "../src/storedForm.ts"), "utf8");
    expect(source).not.toMatch(/^\s*import\s/mu);
    expect(source).not.toMatch(/\brequire\(|\bimport\(|\bprocess\.|\bglobalThis\.|\bwindow\.|\bdocument\.|\beval\(|new Function/u);
  });
});

describe("the order of paths", () => {
  const head = everyFact().head;
  const file = (codePath: string): StoredFile => ({ codePath, layer: 4, entries: [], authored: "", symbols: [], dependencies: [] });
  // U+E000 is three bytes of UTF-8 (EE 80 80) and one UTF-16 unit (E000); U+1F600 is four bytes (F0 9F 98 80) and two
  // units (D83D DE00). By bytes U+E000 comes first; by UTF-16 units it comes last.
  const private_ = "dir/\u{E000}.ts";
  const astral = "dir/\u{1F600}.ts";

  it("is the order of the paths' UTF-8 bytes, which is the order of their code points", () => {
    expect(Buffer.compare(Buffer.from(private_), Buffer.from(astral))).toBe(-1);
    expect(comparePaths(private_, astral)).toBe(-1);
    expect(comparePaths(astral, private_)).toBe(1);
    expect(comparePaths(astral, astral)).toBe(0);
  });

  it("agrees with a comparison of UTF-8 bytes on strings drawn from every range", () => {
    const next = random(17);
    const ranges = [[0x20, 0x7f], [0x80, 0x7ff], [0x800, 0xd7ff], [0xe000, 0xffff], [0x10000, 0x10ffff]];
    const draw = (): string =>
      Array.from({ length: 1 + Math.floor(next() * 4) }, () => {
        const [lo, hi] = ranges[Math.floor(next() * ranges.length)];
        return String.fromCodePoint(lo + Math.floor(next() * (hi - lo + 1)));
      }).join("");
    for (let i = 0; i < 20_000; i += 1) {
      const a = draw();
      const b = next() < 0.3 ? a + draw() : draw();
      expect(comparePaths(a, b), `${JSON.stringify(a)} against ${JSON.stringify(b)}`).toBe(Math.sign(Buffer.compare(Buffer.from(a), Buffer.from(b))));
    }
  });

  it("is what the writer, the reader and the text form keep", async () => {
    const written = await writeScan({ head, files: [file(private_), file(astral)] });
    if (!written.ok) throw new Error(written.reason);
    const read = await readScan(written.value);
    expect(read.ok && read.value.files.map((f) => f.codePath)).toEqual([private_, astral]);
    const text = await textOf(written.value);
    expect(text.ok && scanOfText(text.value).ok).toBe(true);
    expect((await writeScan({ head, files: [file(astral), file(private_)] })).ok).toBe(false);
    expect(scanOfText(textOfScan({ head, files: [file(astral), file(private_)] })).ok).toBe(false);
  });
});

describe("the text form's bytes, as the specification states them", () => {
  const head = { location: { root: "", baseLayer: "", extension: ".md" }, scanner: "s", leftOut: [] };
  // Every character class the rule names, and what it is written as, by hand: the expectation is the specification's
  // words, not a JSON library's output.
  const corners: [string, string][] = [
    ['"', '\\"'],
    ["\\", "\\\\"],
    ["\b", "\\b"],
    ["\t", "\\t"],
    ["\n", "\\n"],
    ["\f", "\\f"],
    ["\r", "\\r"],
    ["\u0000", "\\u0000"],
    ["\u0001", "\\u0001"],
    ["\u000b", "\\u000b"],
    ["\u001f", "\\u001f"],
    ["/", "/"],
    ["\u007f", "\u007f"],
    ["\u0080", "\u0080"],
    ["é", "é"],
    [" ", " "],
    [" ", " "],
    ["﻿", "﻿"],
    ["\u{E000}", "\u{E000}"],
    ["\u{1F600}", "\u{1F600}"],
    ["\u{10FFFF}", "\u{10FFFF}"]
  ];
  const scanWith = (authored: string, layer = 4): Scan => ({ head, files: [{ codePath: "a", layer, entries: [], authored, symbols: [], dependencies: [] }] });

  it("writes each character as the rule says", () => {
    for (const [character, written] of corners) {
      const text = textOfScan(scanWith(`x${character}y`));
      expect(text, JSON.stringify(character)).toContain(`["a","authored","x${written}y"]\n`);
      expect(scanOfText(text).ok, JSON.stringify(character)).toBe(true);
    }
  });

  it("writes a number in decimal, from 0 to 2^32 - 1, with no sign, point, exponent or leading zero", () => {
    for (const [layer, written] of [[0, "0"], [7, "7"], [4294967295, "4294967295"]] as const) {
      expect(textOfScan(scanWith("", layer))).toContain(`["a","file",${written},null,null]\n`);
    }
  });

  it("refuses every other way of writing the same text", () => {
    const text = textOfScan(scanWith("x\b/\u007f é\u{1F600}\u001f\"y"));
    const variants = [
      ["\\b", "\\u0008"],
      ["/", "\\/"],
      ["\u007f", "\\u007f"],
      [" ", "\\u2028"],
      ["é", "\\u00e9"],
      ["\u{1F600}", "\\ud83d\\ude00"],
      ["\\u001f", "\\u001F"],
      ['\\"', "\\u0022"],
      ['["a","file",4,', '["a","file",4e0,'],
      ['["a","file",4,', '["a","file",4.0,'],
      ['["a","file",4,', '[ "a","file",4,']
    ];
    expect(scanOfText(text).ok).toBe(true);
    for (const [from, to] of variants) {
      const variant = text.replace(from, to);
      expect(variant, `${from} as ${to}`).not.toBe(text);
      expect(scanOfText(variant).ok, `${from} as ${to}`).toBe(false);
    }
  });

  it("is UTF-8 without a byte-order mark, ending each line with LF", () => {
    const text = textOfScan(scanWith("é"));
    const bytes = new TextEncoder().encode(text);
    expect(scanOfText(bytes).ok).toBe(true);
    expect(scanOfText(new Uint8Array([0xef, 0xbb, 0xbf, ...bytes])).ok).toBe(false);
    expect(scanOfText(new Uint8Array([...bytes.subarray(0, 40), 0xff, ...bytes.subarray(40)])).ok).toBe(false);
    expect(scanOfText(text.replace(/\n/gu, "\r\n")).ok).toBe(false);
  });
});
