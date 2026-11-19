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

import { invocationFolder, readConfiguration } from "./cli";

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

/**
 * `npm run` starts a script in this checkout's folder wherever the person
 * stands, and says where they stood in `INIT_CWD`; the cold run of 2026-11-19
 * found every `--help` calling that checkout "the current directory".
 */
describe("invocationFolder", () => {
  const checkout = path.resolve("/tools/Live-Documentation");
  const script = path.join(checkout, "scripts", "live-docs", "generate.ts");
  const stoodIn = path.resolve("/work/MyRepo");
  const ranByNpm = { INIT_CWD: stoodIn, npm_lifecycle_script: "tsx --tsconfig ./tsconfig.base.json scripts/live-docs/generate.ts" };

  it("is where the person stood when npm ran this very script", () => {
    expect(invocationFolder(ranByNpm, checkout, script)).toBe(stoodIn);
  });

  it("is the working directory of a process npm did not start, though it inherits npm's variables", () => {
    // Another script npm ran, as a test runner or the pipeline, starting this one as a process of its own in a folder of its choosing.
    const elsewhere = path.resolve("/tmp/fixture");
    expect(invocationFolder({ ...ranByNpm, npm_lifecycle_script: "vitest run --project integration" }, elsewhere, script)).toBe(elsewhere);
    expect(invocationFolder({ ...ranByNpm, npm_lifecycle_script: "tsx --tsconfig ./tsconfig.base.json scripts/live-docs/run-all.ts" }, elsewhere, script)).toBe(elsewhere);
  });

  it("is the working directory outside npm", () => {
    expect(invocationFolder({}, stoodIn, script)).toBe(stoodIn);
    expect(invocationFolder({ INIT_CWD: checkout }, stoodIn, script)).toBe(stoodIn);
  });
});
