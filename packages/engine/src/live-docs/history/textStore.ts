/**
 * The lens's text store: every distinct text the summaries name, a doc's
 * authored block or a symbol's description, kept once under the hash of its
 * content, `<lens folder>/texts/<first two hex digits>/<hash>`.
 *
 * @remarks
 * A summary names its texts by hash, so that a text unchanged across a
 * thousand changes is written once and the summaries stay small (the probe of
 * 2026-11-18 found every version of every text in two thirds of this
 * repository's history to be 6 MB). Each text is a file of its own, written
 * under a temporary name and renamed into place, so that the summarizing
 * processes of a pool write into one store at once without a lock, a text two
 * of them write is the same bytes either way, and a run stopped halfway never
 * leaves a text the store would trust. A read checks the content against its
 * name, so a text changed on disk is refused rather than shown as that day's
 * words.
 *
 * @module
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import { textHash } from "./summary";

/** The folder under a lens's cache folder that holds its texts. */
export const TEXT_STORE_DIRECTORY = "texts";

/** Where the text of a hash lies in the store. */
export function textPath(store: string, hash: string): string {
  if (!/^[0-9a-f]{64}$/u.test(hash)) {
    throw new Error(`${hash} is not the name of a text`);
  }
  return path.join(store, hash.slice(0, 2), hash);
}

/**
 * Puts the texts in the store, each that it lacks, and returns how many it wrote.
 *
 * @throws When a text is not the text of the hash it is given under.
 */
export async function putTexts(store: string, texts: ReadonlyMap<string, string>): Promise<number> {
  let written = 0;
  const folders = new Set<string>();
  for (const [hash, text] of texts) {
    if (textHash(text) !== hash) {
      throw new Error(`the text given as ${hash} is not the text of that hash`);
    }
    const file = textPath(store, hash);
    try {
      await fs.access(file);
      continue;
    } catch {
      // Absent: written below.
    }
    const folder = path.dirname(file);
    if (!folders.has(folder)) {
      await fs.mkdir(folder, { recursive: true });
      folders.add(folder);
    }
    const temporary = `${file}.${process.pid}.partial`;
    await fs.writeFile(temporary, text, "utf8");
    await fs.rename(temporary, file);
    written += 1;
  }
  return written;
}

/**
 * The text of a hash.
 *
 * @throws When the store lacks it, or holds under its name a text that is not the text of that hash.
 */
export async function readText(store: string, hash: string): Promise<string> {
  const text = await fs.readFile(textPath(store, hash), "utf8");
  if (textHash(text) !== hash) {
    throw new Error(`the text stored as ${hash} is not the text of that hash; the next run of the history removes it and summarizes again every change that names it`);
  }
  return text;
}
