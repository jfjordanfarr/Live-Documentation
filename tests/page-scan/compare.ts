/**
 * How the standing check compares what the page wrote with what Node wrote for the same folder, and how it holds the
 * differences found to the committed ledger (`differences.json`). Every file of both is compared whole: a file is the
 * same, or written by one side alone, or differs, and a file that differs is told by its first differing line. The
 * ledger can only shrink truthfully: a difference not in it fails the check, and so does an entry of it that no longer
 * occurs.
 */

/** One way the page's output differs from Node's for one file. */
export interface Difference {
  /** The file, relative to the scanned folder: a doc, or the index. */
  file: string;
  kind: "only in the page" | "only under Node" | "differs";
  /** For `differs`: the first line that differs, counted from 1, as each side wrote it (cut at 300 characters). */
  first?: { line: number; page: string; node: string };
  /** For `differs`: how many lines differ, position by position. */
  lines?: number;
}

/** An entry of the ledger: a difference as found, and what is known of it. */
export interface LedgerEntry extends Difference {
  fixture: string;
  /** What differs, in a sentence. */
  what: string;
  /** Its cause, as far as reading the engine establishes it, and where the cause lies: the engine, or a stand-in. */
  cause: string;
}

const cut = (line: string | undefined): string => (line ?? "(no line)").slice(0, 300);

/** Every difference between the files each side wrote, each keyed by its path relative to the scanned folder. */
export function differencesBetween(page: Record<string, string>, node: Record<string, string>): Difference[] {
  const files = [...new Set([...Object.keys(page), ...Object.keys(node)])].sort();
  const found: Difference[] = [];
  for (const file of files) {
    if (!(file in node)) found.push({ file, kind: "only in the page" });
    else if (!(file in page)) found.push({ file, kind: "only under Node" });
    else if (page[file] !== node[file]) {
      const pageLines = page[file].split("\n");
      const nodeLines = node[file].split("\n");
      let first = -1;
      let lines = 0;
      for (let index = 0; index < Math.max(pageLines.length, nodeLines.length); index += 1) {
        if (pageLines[index] === nodeLines[index]) continue;
        lines += 1;
        if (first === -1) first = index;
      }
      found.push({ file, kind: "differs", first: { line: first + 1, page: cut(pageLines[first]), node: cut(nodeLines[first]) }, lines });
    }
  }
  return found;
}

/**
 * A file the page's scan read more than once, which the engine promises it never does (each file once per run, through
 * the host: `packages/engine/src/tooling/workspaceFiles.ts`); a ledger's entry of one adds why it is known.
 */
export interface MultipleRead {
  /** The file, relative to the scanned folder. */
  file: string;
  times: number;
}

export interface MultipleReadEntry extends MultipleRead {
  fixture: string;
  /** Why the file is read more than once, and which step of the road ends it. */
  why: string;
}

/** The files read more than once, from a count of reads by file, in path order. */
export function readMoreThanOnce(readsByFile: Record<string, number>): MultipleRead[] {
  return Object.entries(readsByFile).filter(([, times]) => times > 1).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([file, times]) => ({ file, times }));
}

/** The files read more than once that the ledger does not list for the fixture, and its entries for it no longer found. */
export function readsHeldToLedger(fixture: string, found: readonly MultipleRead[], ledger: readonly MultipleReadEntry[]): { unlisted: MultipleRead[]; gone: MultipleReadEntry[] } {
  const readKey = (read: MultipleRead): string => JSON.stringify([read.file, read.times]);
  const listed = ledger.filter((entry) => entry.fixture === fixture);
  const listedKeys = new Set(listed.map(readKey));
  const foundKeys = new Set(found.map(readKey));
  return { unlisted: found.filter((read) => !listedKeys.has(readKey(read))), gone: listed.filter((entry) => !foundKeys.has(readKey(entry))) };
}

const key = (difference: Difference): string => JSON.stringify([difference.file, difference.kind, difference.first ?? null, difference.lines ?? null]);

/** The differences found that the ledger does not list for the fixture, and the ledger's entries for it no longer found. */
export function heldToLedger(fixture: string, found: readonly Difference[], ledger: readonly LedgerEntry[]): { unlisted: Difference[]; gone: LedgerEntry[] } {
  const listed = ledger.filter((entry) => entry.fixture === fixture);
  const listedKeys = new Set(listed.map(key));
  const foundKeys = new Set(found.map(key));
  return { unlisted: found.filter((difference) => !listedKeys.has(key(difference))), gone: listed.filter((entry) => !foundKeys.has(key(entry))) };
}
