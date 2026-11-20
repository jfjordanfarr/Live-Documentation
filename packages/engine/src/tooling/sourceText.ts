/**
 * The one reading step for a source file's text: every language reader takes
 * a file's characters from here, so that a file is read by one rule, whatever
 * the tool that saved it, and a run can say which rule read it.
 *
 * @remarks
 * Written 2026-11-19, after a cold run on Windows-shaped code found SQL and C#
 * saved as UTF-16 (as SQL Server Management Studio and Visual Studio save
 * them) giving no symbols and no warning, and Windows-1252 text garbled
 * silently, each reader having opened its own file as UTF-8. The rule, in
 * order:
 *
 * 1. A byte-order mark decides: UTF-8, UTF-16 little-endian or big-endian.
 *    The mark is not part of the text.
 * 2. UTF-16 without a mark is recognised only where it is certain: an even
 *    number of bytes, every character in it between U+0001 and U+00FF, so
 *    that one byte of every pair is zero and the other is not. No text in a
 *    one-byte encoding holds a zero byte in every other place. A file with a
 *    character above U+00FF and no mark is not guessed at: the guess would
 *    weigh the frequency of zero bytes, and a wrong guess reads a file as
 *    nonsense.
 * 3. Bytes that are valid UTF-8 and hold no zero byte are UTF-8.
 * 4. Bytes that are not valid UTF-8 and hold no zero byte and no control
 *    character but tab, line feed, vertical tab, form feed, carriage return
 *    and the end-of-file mark (0x1A) are Windows-1252, what Windows
 *    PowerShell 5.1 and the older Windows editors write by default.
 * 5. Anything else is not text this step knows: not read, and named.
 *
 * The decoders are the platform's own (`TextDecoder`); a test holds the
 * results to PowerShell 7's `Get-Content` with the encoding Windows itself
 * would use.
 *
 * @module
 */
import { promises as fs } from "node:fs";

import { failedCall, machineFailure } from "../live-docs/processMark";

/** How a file's bytes became text, or why they did not. */
export type SourceTextReading =
  | { encoding: "utf-8" | "utf-8-with-mark" | "utf-16le" | "utf-16be" | "utf-16le-without-mark" | "utf-16be-without-mark" | "windows-1252"; text: string }
  | { encoding: "unread"; reason: string };

/** Control characters a text in a one-byte encoding may hold: tab, line feed, vertical tab, form feed, carriage return, and 0x1A, the end-of-file mark some Windows editors still write. */
const TEXT_CONTROLS = new Set([0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x1a]);

/** A file's bytes read by the rule of this module. */
export function decodeSourceText(bytes: Uint8Array): SourceTextReading {
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return { encoding: "utf-8-with-mark", text: new TextDecoder("utf-8").decode(bytes) };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return { encoding: "utf-16le", text: new TextDecoder("utf-16le").decode(bytes) };
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return { encoding: "utf-16be", text: new TextDecoder("utf-16be").decode(bytes) };
  }
  const unmarked = unmarkedUtf16(bytes);
  if (unmarked !== undefined) {
    return { encoding: unmarked === "utf-16le" ? "utf-16le-without-mark" : "utf-16be-without-mark", text: new TextDecoder(unmarked).decode(bytes) };
  }
  if (bytes.includes(0)) {
    return { encoding: "unread", reason: "it holds zero bytes, as no text in UTF-8 or Windows-1252 does, and is not UTF-16 that can be told without a byte-order mark" };
  }
  try {
    return { encoding: "utf-8", text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    // Not UTF-8: Windows-1252 when it holds no control character that text does not.
  }
  const control = bytes.find((byte) => byte < 0x20 && !TEXT_CONTROLS.has(byte));
  if (control !== undefined) {
    return { encoding: "unread", reason: `it is not UTF-8 and holds the control character 0x${control.toString(16).padStart(2, "0")}, as no Windows-1252 text does` };
  }
  return { encoding: "windows-1252", text: new TextDecoder("windows-1252").decode(bytes) };
}

/**
 * The byte order of UTF-16 without a mark, where it is certain: an even, non-zero number of bytes in which every
 * pair is one zero byte and one byte that is not zero, the zero always on the same side. The binary sniff
 * (`isBinaryContent`) asks the same of a file's head, so that what this step reads as text is never called binary.
 */
export function unmarkedUtf16(bytes: Uint8Array): "utf-16le" | "utf-16be" | undefined {
  if (bytes.length === 0 || bytes.length % 2 !== 0) {
    return undefined;
  }
  let little = true;
  let big = true;
  for (let index = 0; index < bytes.length && (little || big); index += 2) {
    const first = bytes[index];
    const second = bytes[index + 1];
    little &&= first !== 0 && second === 0;
    big &&= first === 0 && second !== 0;
  }
  return little ? "utf-16le" : big ? "utf-16be" : undefined;
}

/**
 * A source file's text, for a language reader: read by {@link decodeSourceText}, and empty when the bytes are not
 * text this step knows, so that such a file is read as holding nothing and the run goes on; the generator names it.
 */
export async function readSourceText(absolutePath: string): Promise<string> {
  const reading = decodeSourceText(await fs.readFile(absolutePath));
  return reading.encoding === "unread" ? "" : reading.text;
}

/**
 * For a catch around a read or a probe of a file that reads a failure as "not read" or "not there": throws on a failure
 * of the machine's (`machineFailure`: too many open files, a full disk, a file another process holds), so that it
 * reaches the generator's catch, which names it, and the history writes no summary made with it; returns for any
 * other, absence (`ENOENT`) among them, which is the file's answer. Since 2026-11-20; before, every such catch
 * swallowed the machine's failures too, and a file read in one went into a summary as empty.
 */
export function throwIfMachineFailure(error: unknown): void {
  if (machineFailure(error) && failedCall(error) !== "ENOENT") throw error;
}
