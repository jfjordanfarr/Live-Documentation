/**
 * The one reading step for a source file's text, held to real bytes as Windows tools save them, and to PowerShell 7's
 * `Get-Content` with the encoding Windows itself would read each with, where PowerShell is installed.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { decodeSourceText, readSourceText } from "./sourceText";

const TEXT = "-- Lists the café's orders, “quoted”, for €5.\r\nCREATE PROCEDURE dbo.usp_ListOrders AS SELECT 1;\r\n";
const ASCII = "public class Customer { }\r\n";

const utf8 = (text: string): Buffer => Buffer.from(text, "utf8");
const utf16le = (text: string): Buffer => Buffer.from(text, "utf16le");
const utf16be = (text: string): Buffer => Buffer.from(utf16le(text)).swap16();
const mark = (prefix: number[], body: Buffer): Buffer => Buffer.concat([Buffer.from(prefix), body]);
/** The text in Windows-1252, by the platform's own table, built from the decoder so that no byte is typed by hand. */
function windows1252(text: string): Buffer {
  const decoder = new TextDecoder("windows-1252");
  const table = new Map<string, number>();
  for (let byte = 0; byte < 256; byte += 1) table.set(decoder.decode(Uint8Array.of(byte)), byte);
  return Buffer.from([...text].map((character) => {
    const byte = table.get(character);
    if (byte === undefined) throw new Error(`${character} is not in Windows-1252`);
    return byte;
  }));
}

/** Each case: its bytes, how the step must read them, and the encoding PowerShell is told, as Windows would read the file. */
const CASES: Array<{ name: string; bytes: Buffer; encoding: string; text?: string; powershell?: string }> = [
  { name: "UTF-8 without a mark", bytes: utf8(TEXT), encoding: "utf-8", text: TEXT, powershell: "utf8NoBOM" },
  { name: "UTF-8 with a mark", bytes: mark([0xef, 0xbb, 0xbf], utf8(TEXT)), encoding: "utf-8-with-mark", text: TEXT, powershell: "utf8" },
  { name: "UTF-16 little-endian with a mark (SSMS, Visual Studio, Out-File)", bytes: mark([0xff, 0xfe], utf16le(TEXT)), encoding: "utf-16le", text: TEXT, powershell: "Unicode" },
  { name: "UTF-16 big-endian with a mark", bytes: mark([0xfe, 0xff], utf16be(TEXT)), encoding: "utf-16be", text: TEXT, powershell: "BigEndianUnicode" },
  { name: "UTF-16 little-endian without a mark, every character below U+0100", bytes: utf16le(ASCII), encoding: "utf-16le-without-mark", text: ASCII, powershell: "Unicode" },
  { name: "UTF-16 big-endian without a mark, every character below U+0100", bytes: utf16be(ASCII), encoding: "utf-16be-without-mark", text: ASCII, powershell: "BigEndianUnicode" },
  { name: "Windows-1252 (Windows PowerShell 5.1's and Notepad's ANSI)", bytes: windows1252(TEXT), encoding: "windows-1252", text: TEXT, powershell: "1252" },
  { name: "UTF-16 without a mark holding a character above U+00FF, not guessed", bytes: utf16le(TEXT), encoding: "unread" },
  { name: "A binary file", bytes: Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00]), encoding: "unread" },
  { name: "Neither UTF-8 nor Windows-1252 text: a control character that text does not hold", bytes: Buffer.from([0x63, 0x61, 0x66, 0xe9, 0x02, 0x0d, 0x0a]), encoding: "unread" }
];

const folders: string[] = [];
afterAll(() => {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

describe("decodeSourceText", () => {
  it.each(CASES)("reads $name by its rule", ({ bytes, encoding, text }) => {
    const reading = decodeSourceText(bytes);
    expect(reading.encoding).toBe(encoding);
    if (text !== undefined) {
      expect(reading.encoding !== "unread" && reading.text).toBe(text);
    } else {
      expect(reading.encoding === "unread" && reading.reason.length).toBeGreaterThan(0);
    }
  });

  it("reads an empty file as empty UTF-8 text", () => {
    expect(decodeSourceText(new Uint8Array())).toEqual({ encoding: "utf-8", text: "" });
  });
});

describe("readSourceText", () => {
  it("gives a reader the text, and nothing for bytes that are not text, without stopping", async () => {
    const folder = mkdtempSync(path.join(tmpdir(), "source-text-"));
    folders.push(folder);
    writeFileSync(path.join(folder, "a.sql"), mark([0xff, 0xfe], utf16le(TEXT)));
    writeFileSync(path.join(folder, "b.bin"), Buffer.from([0x00, 0x01, 0x02]));
    expect(await readSourceText(path.join(folder, "a.sql"))).toBe(TEXT);
    expect(await readSourceText(path.join(folder, "b.bin"))).toBe("");
  });
});

/** PowerShell 7, when installed: the oracle for what Windows itself reads each file as. */
const powershell = spawnSync("pwsh", ["-NoProfile", "-Command", "exit 0"]).status === 0;

describe.skipIf(!powershell)("against PowerShell 7's Get-Content", () => {
  it.each(CASES.filter((entry) => entry.powershell !== undefined))("reads $name as Get-Content -Encoding $powershell does", ({ bytes, powershell: encoding }) => {
    const folder = mkdtempSync(path.join(tmpdir(), "source-text-pwsh-"));
    folders.push(folder);
    const file = path.join(folder, "file.txt");
    writeFileSync(file, bytes);
    const command = `$t = Get-Content -LiteralPath '${file}' -Raw -Encoding ${encoding}; ConvertTo-Json -Compress -InputObject ([int[]][char[]]$t)`;
    const result = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", "-Command", command], { encoding: "utf8" });
    expect(result.status, result.stderr).toBe(0);
    const units = JSON.parse(result.stdout) as number[];
    const reading = decodeSourceText(bytes);
    expect(reading.encoding).not.toBe("unread");
    const text = reading.encoding === "unread" ? "" : reading.text;
    expect(Array.from({ length: text.length }, (_, index) => text.charCodeAt(index))).toEqual(units);
  }, 30_000);
});
