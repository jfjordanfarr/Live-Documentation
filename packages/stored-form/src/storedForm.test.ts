import { readFileSync } from "node:fs";
import path from "node:path";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";

import { bytesOfText, CHUNK, createWriter, graphOf, openScan, readScan, resumeFrom, scanOfText, SIGNATURE, textOf, textOfScan, writeScan, type Scan, type StoredFile } from "./storedForm";
import { everyFact, seededScan } from "./testScans";

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
    // Bytes after the end, and a file cut short.
    expect(await refusal(Buffer.concat([bytes, Buffer.from([0])]))).toMatch(/after the end/u);
    expect(await refusal(bytes.subarray(0, bytes.length - 1))).toMatch(/stops before its end/u);
    // A section whose bytes are not those its hash names.
    const flipped = Buffer.from(bytes);
    flipped[SIGNATURE.length + 20] ^= 1;
    expect(await refusal(flipped)).toMatch(/hash|deflate|name/u);
  });

  it("is one module that imports nothing", () => {
    const source = readFileSync(path.join(__dirname, "storedForm.ts"), "utf8");
    expect(source).not.toMatch(/^\s*import\s/mu);
    expect(source).not.toMatch(/\brequire\(|\bimport\(|\bprocess\.|\bglobalThis\.|\bwindow\.|\bdocument\.|\beval\(|new Function/u);
  });
});
