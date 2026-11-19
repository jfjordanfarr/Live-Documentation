/**
 * What every Live Docs command shares at its edge, held to what a person on
 * Windows meets first: a configuration saved by Windows PowerShell 5.1, which
 * writes UTF-8 with a byte-order mark (`Set-Content -Encoding UTF8`) and
 * UTF-16 with `>` and `Out-File`, after the cold run of 2026-11-19 found every
 * command stopping on such a file.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { readConfiguration } from "./cli";

const folders: string[] = [];

afterAll(() => {
  for (const folder of folders.splice(0)) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
});

function workspaceWith(bytes: Uint8Array): string {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "cli-config-"));
  folders.push(folder);
  fs.writeFileSync(path.join(folder, ".live-docs.config.json"), bytes);
  return folder;
}

const TEXT = `{ "root": "docs", "exclude": ["Vendor/**", "Ünïcode/**"] }\r\n`;
const EXPECTED = { root: "docs", exclude: ["Vendor/**", "Ünïcode/**"] };

/** The text in UTF-16, little- or big-endian, after its mark, as Windows PowerShell 5.1's `Out-File` writes it. */
function utf16(text: string, endian: "le" | "be"): Uint8Array {
  const le = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, "utf16le")]);
  return endian === "le" ? le : Buffer.from(le).swap16();
}

describe("readConfiguration", () => {
  it("reads a configuration saved as UTF-8 without a mark", async () => {
    expect(await readConfiguration(workspaceWith(Buffer.from(TEXT, "utf8")), undefined)).toEqual(EXPECTED);
  });

  it("reads a configuration saved as UTF-8 with a byte-order mark", async () => {
    expect(await readConfiguration(workspaceWith(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(TEXT, "utf8")])), undefined)).toEqual(EXPECTED);
  });

  it("reads a configuration saved as UTF-16, little-endian or big-endian, by its mark", async () => {
    expect(await readConfiguration(workspaceWith(utf16(TEXT, "le")), undefined)).toEqual(EXPECTED);
    expect(await readConfiguration(workspaceWith(utf16(TEXT, "be")), undefined)).toEqual(EXPECTED);
  });

  it("reads the file --config names, saved with a mark, the same way", async () => {
    const folder = workspaceWith(Buffer.from("{}", "utf8"));
    const given = path.join(folder, "other.json");
    fs.writeFileSync(given, utf16(TEXT, "le"));
    expect(await readConfiguration(folder, given)).toEqual(EXPECTED);
  });

  it("leaves the defaults when the workspace has none, and names the file it cannot read", async () => {
    const folder = fs.mkdtempSync(path.join(os.tmpdir(), "cli-config-"));
    folders.push(folder);
    expect(await readConfiguration(folder, undefined)).toEqual({});
    fs.writeFileSync(path.join(folder, ".live-docs.config.json"), "{ root: ", "utf8");
    await expect(readConfiguration(folder, undefined)).rejects.toThrow(`cannot read the configuration at ${path.join(folder, ".live-docs.config.json")}`);
  });
});
