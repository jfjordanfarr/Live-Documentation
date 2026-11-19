/**
 * The history's third rung: the words of each day, the texts the rows name by
 * id, kept beside the sequence in a store of their own that a reader fetches
 * a part of at a time.
 *
 * @remarks
 * The rows (`rows.ts`) name a file's authored block and each symbol's
 * description by the id of its text, or say that a doc stood whose words
 * today's reader cannot read, or that none stood. The texts themselves would
 * multiply the sequence's size several times over (the probe of 2026-11-18
 * measured 1.5 to 2.7 MB gzipped inline against 0.7 MB stored once), and a
 * page needs them only when a card shows words at a past moment. So each
 * distinct text is written once, in the part of the store for the directory
 * of the file that first names it there, and the parts are ordered by path
 * and then by step, so that the successive versions of one file's words lie
 * side by side and compress against each other. A reader asks for the part
 * of the directory whose words it shows, `<folder>/<index>.json` by the
 * index of the directory in {@link WordsHead.directories}.
 *
 * Nothing here reads a file: the history command reads the texts from the
 * lens's text store and the static builder from the store beside the
 * sequence, and both hand this module what they read.
 *
 * @module
 */

import type { HistorySequence } from "./format";
import { applyRowsChange, type AuthoredWords, type FileRows, type Rows } from "./rows";
import { changeAt, momentAt, rowsChangeAt } from "./sequence";

/** The version of the format of a part of the words store. */
export const WORDS_FORMAT = "live-docs-history-words/1";

/** The folder beside the sequence's file that holds the words store of the history command. */
export const WORDS_DIRECTORY = "history-words";

/** What a sequence says of the words store beside it. */
export interface WordsHead {
  /** The folder of the store, relative to the folder of the sequence's file. */
  folder: string;
  /** The directory of each part, by the part's index: a part `<index>.json` holds the texts of files in that directory, `""` the top level. */
  directories: string[];
  /** How many distinct texts the store holds. */
  texts: number;
}

/** One part of the words store: the texts first named by the files of one directory, in path order and then step order. */
export interface WordsPart {
  format: typeof WORDS_FORMAT;
  directory: string;
  /** Each text's id, as the rows name it. */
  ids: number[];
  /** The texts, in the order of `ids`. */
  texts: string[];
}

/** The directory whose part of the store holds the words of a file: its own folder, `""` at the top level. */
export function wordsDirectory(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash < 0 ? "" : path.slice(0, slash);
}

/** Every text a file's rows name: its authored words' and its symbols' descriptions'. */
export function textsOfFile(file: FileRows): number[] {
  const ids = typeof file.authored === "number" ? [file.authored] : [];
  for (const symbol of file.symbols) {
    if (symbol.text !== undefined) ids.push(symbol.text);
  }
  return ids;
}

/**
 * Where each text a sequence names is first named by the files of each directory: a list per directory of the ids,
 * ordered by the path that names it and then by the step, so that one file's versions lie together.
 */
export function textReferences(sequence: HistorySequence): Map<string, number[]> {
  // Each text's first naming in each directory, as [path, step, order of naming].
  const first = new Map<string, Map<number, [path: string, step: number, order: number]>>();
  let order = 0;
  const name = (path: string, step: number, id: number): void => {
    const directory = wordsDirectory(path);
    let ids = first.get(directory);
    if (!ids) {
      ids = new Map();
      first.set(directory, ids);
    }
    if (!ids.has(id)) ids.set(id, [path, step, order++]);
  };
  let rows = momentAt(sequence, 0).rows;
  for (const [path, file] of rows) {
    for (const id of textsOfFile(file)) name(path, 0, id);
  }
  for (let step = 1; step <= sequence.steps.length; step += 1) {
    const change = changeAt(sequence, step);
    const rowsChange = rowsChangeAt(sequence, step);
    rows = applyRowsChange(rows, change, rowsChange);
    // A file renamed into another directory brings its words into that directory's part.
    for (const [from, to] of change.renamed) {
      const file = wordsDirectory(from) === wordsDirectory(to) ? undefined : rows.get(to);
      if (file) for (const id of textsOfFile(file)) name(to, step, id);
    }
    for (const [path, words] of rowsChange.authored) {
      if (typeof words === "number") name(path, step, words);
    }
    for (const [path, , symbol] of [...rowsChange.symbolsChanged, ...rowsChange.symbolsBorn]) {
      if (symbol.text !== undefined) name(path, step, symbol.text);
    }
  }
  const references = new Map<string, number[]>();
  for (const directory of [...first.keys()].sort(compare)) {
    const ids = first.get(directory)!;
    references.set(
      directory,
      [...ids].sort(([, a], [, b]) => compare(a[0], b[0]) || a[1] - b[1] || a[2] - b[2]).map(([id]) => id)
    );
  }
  return references;
}

/**
 * The words store of a sequence: its head and its parts, each text read by `textOf`.
 *
 * @param folder - The store's folder, relative to the folder of the sequence's file.
 */
export function wordsStore(sequence: HistorySequence, folder: string, textOf: (id: number) => string): { head: WordsHead; parts: WordsPart[] } {
  const references = textReferences(sequence);
  const directories = [...references.keys()];
  const parts = directories.map((directory): WordsPart => {
    const ids = references.get(directory)!;
    return { format: WORDS_FORMAT, directory, ids, texts: ids.map(textOf) };
  });
  const distinct = new Set(parts.flatMap((part) => part.ids));
  return { head: { folder, directories, texts: distinct.size }, parts };
}

/** The file name of a directory's part of the store, under the store's folder; undefined when no file of that directory has words. */
export function wordsPartFile(head: WordsHead, path: string): string | undefined {
  const index = head.directories.indexOf(wordsDirectory(path));
  return index < 0 ? undefined : `${index}.json`;
}

/** A file's words at a moment, by text id: its authored block, and each symbol's description, by the symbol's anchor. */
export interface WordsOfFile {
  codePath: string;
  exists: boolean;
  authored?: AuthoredWords;
  descriptions?: Array<{ slug: string; name: string; text: number }>;
}

/** What a file's words were at a moment, by text id, without the texts, which a part of the store holds. */
export function wordsOfFile(rows: Rows, codePath: string): WordsOfFile {
  const file = rows.get(codePath);
  if (!file) return { codePath, exists: false };
  return {
    codePath,
    exists: true,
    authored: file.authored,
    descriptions: file.symbols.filter((symbol) => symbol.text !== undefined).map((symbol) => ({ slug: symbol.slug, name: symbol.name, text: symbol.text! }))
  };
}

/** The text of an id in a part of the store. */
export function textInPart(part: WordsPart, id: number): string | undefined {
  const index = part.ids.indexOf(id);
  return index < 0 ? undefined : part.texts[index];
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
