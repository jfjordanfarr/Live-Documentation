/**
 * Every language reader reads a file's text through the one reading step (`tooling/sourceText.ts`), so that a file
 * saved as UTF-16 or in Windows-1252 gives the facts its UTF-8 twin gives. Before 2026-11-19 each reader opened its
 * file as UTF-8: a UTF-16 file gave no symbols, and Windows-1252 text came out with U+FFFD, with nothing said.
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { analyzeSourceFile } from "./sourceAnalysis";

const folders: string[] = [];
afterAll(() => {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

/** The text in Windows-1252, by the platform's own table. */
function windows1252(text: string): Buffer {
  const decoder = new TextDecoder("windows-1252");
  const table = new Map<string, number>();
  for (let byte = 0; byte < 256; byte += 1) table.set(decoder.decode(Uint8Array.of(byte)), byte);
  return Buffer.from([...text].map((character) => table.get(character) ?? 0x3f));
}

const ENCODINGS: Array<[string, (text: string) => Buffer]> = [
  ["UTF-16 LE with a mark", (text) => Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text.replace(/\n/gu, "\r\n"), "utf16le")])],
  ["UTF-16 BE with a mark", (text) => Buffer.concat([Buffer.from([0xfe, 0xff]), Buffer.from(Buffer.from(text, "utf16le")).swap16()])],
  ["Windows-1252", (text) => windows1252(text.replace(/\n/gu, "\r\n"))]
];

/** One file per language a reader reads, each with a word that is not ASCII in what the reader reports. */
const SOURCES: Array<{ name: string; text: string }> = [
  { name: "orders.py", text: "def list_orders():\n    \"\"\"Lists the café's orders.\"\"\"\n    return []\n\n\nclass Order:\n    pass\n" },
  { name: "orders.ts", text: "/** Lists the café's orders. */\nexport function listOrders(): string[] {\n  return [];\n}\nexport class Order {}\n" },
  { name: "Orders.java", text: "package shop;\n\n/** Lists the café's orders. */\npublic class Orders {\n  public void list() {}\n}\n" },
  { name: "orders.go", text: "package shop\n\n// ListOrders lists the café's orders.\nfunc ListOrders() []string { return nil }\n" },
  { name: "orders.rs", text: "/// Lists the café's orders.\npub fn list_orders() -> Vec<String> { Vec::new() }\n" },
  { name: "orders.rb", text: "# Lists the café's orders.\nclass Orders\n  def list; end\nend\n" },
  { name: "orders.c", text: "/** Lists the café's orders. */\nint list_orders(void) { return 0; }\n" },
  // The readers other builders hold, swapped to the one step at the joining of 2026-11-19.
  { name: "orders.sql", text: "-- Lists the café's orders.\nCREATE TABLE orders (id INT, name NVARCHAR(40));\nCREATE PROCEDURE list_orders AS SELECT * FROM orders;\n" },
  { name: "Orders.cs", text: "namespace Shop;\n\n/// <summary>Lists the café's orders.</summary>\npublic class Orders\n{\n    public void List() {}\n}\n" },
  { name: "Orders.aspx", text: "<%@ Page Language=\"C#\" Inherits=\"Shop.Orders\" %>\n<html><body><asp:Label ID=\"CafeTitle\" runat=\"server\" Text=\"Le café\" /></body></html>\n" },
  { name: "web.config", text: "<?xml version=\"1.0\"?>\n<configuration>\n  <appSettings>\n    <add key=\"CaféName\" value=\"Le café\" />\n  </appSettings>\n</configuration>\n" },
  { name: "Shop.csproj", text: "<Project Sdk=\"Microsoft.NET.Sdk\">\n  <PropertyGroup>\n    <AssemblyName>Café</AssemblyName>\n    <TargetFramework>net8.0</TargetFramework>\n  </PropertyGroup>\n</Project>\n" },
  { name: "orders.ps1", text: "<#\n.SYNOPSIS\nLists the café's orders.\n#>\nfunction Get-Orders {\n  param()\n}\n" }
];

/** What a reader reports of a file: its symbols' names and descriptions, and its dependency lines. */
async function factsOf(folder: string, name: string, bytes: Buffer): Promise<unknown> {
  writeFileSync(path.join(folder, name), bytes);
  const analysis = await analyzeSourceFile(path.join(folder, name), folder);
  return {
    symbols: analysis.symbols.map((symbol) => ({ name: symbol.name, kind: symbol.kind, summary: symbol.documentation?.summary })),
    dependencies: analysis.dependencies.map((dependency) => dependency.specifier)
  };
}

describe("a source file saved as Windows tools save it", () => {
  for (const source of SOURCES) {
    it.each(ENCODINGS)(`gives ${source.name}'s facts in %s as in UTF-8`, async (_label, encode) => {
      const plain = mkdtempSync(path.join(tmpdir(), "encodings-utf8-"));
      const saved = mkdtempSync(path.join(tmpdir(), "encodings-saved-"));
      folders.push(plain, saved);
      const expected = await factsOf(plain, source.name, Buffer.from(source.text, "utf8"));
      // The reader reports something of the file in UTF-8, so that the comparison below is not of two empty readings.
      const reported = expected as { symbols: unknown[]; dependencies: unknown[] };
      expect(reported.symbols.length + reported.dependencies.length).toBeGreaterThan(0);
      expect(await factsOf(saved, source.name, encode(source.text))).toEqual(expected);
    });
  }
});
