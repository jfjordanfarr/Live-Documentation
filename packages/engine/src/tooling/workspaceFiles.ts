/**
 * The one way a scan's readers get a file's bytes: through the host that runs the engine, once per file per run,
 * decoded once by the one reading step.
 *
 * @remarks
 * Written 2026-11-22, the third step of the road to one engine for a page and a command line
 * (`.mdmd/layer-3/engine-and-hosts.mdmd.md`, section 6). Until then each file was read three to five times in one
 * scan, each reader opening it from Node's disk for itself: the index pass to learn its symbols, the generator to test
 * whether it is binary and again to say how its text was decoded, its own reader, and the readers whose tables are
 * built from many files (C#'s types, a project's reach, PowerShell's definitions), each with a read of its own.
 *
 * The host answers two questions, so that a disk and a folder picked in a page can each answer them: a file's bytes,
 * and its first bytes, for a file that may be binary and need not be read whole. The engine keeps, for the run, what
 * each whole read decoded to and its first bytes, so that every reader that asks again, and the binary test, is
 * answered from it. A read that fails is not kept: its failure goes to the reader that asked, which reads it as the
 * machine's or the file's (`throwIfMachineFailure`), and the next to ask reads again, as every reader did before, so
 * that a failure of the machine's that passes (too many open files at one moment) costs that reader alone. The
 * generator hands these reads to every reader on the file index it already hands them (`WorkspaceFileIndex`), which is
 * the run's own: what is kept dies with the run.
 *
 * Nothing here reads a disk: the host does.
 *
 * @module
 */
import { decodeSourceText, type SourceTextReading } from "./sourceText";

/** What runs the engine gives it of a file: its bytes, and its first bytes. Paths are absolute, as the readers hold them. */
export interface FileHost {
  /** A file's bytes. A failure is thrown as the host met it, so that it is read as the machine's or the file's. */
  read(absolutePath: string): Promise<Uint8Array>;
  /** A file's first `bytes` bytes, fewer when it is shorter. A host may answer it by reading the whole file. */
  head(absolutePath: string, bytes: number): Promise<Uint8Array>;
}

/** A run's reads: each file read once through the host, decoded once, and kept for the run. */
export interface WorkspaceReads {
  /** A file's text as the one reading step reads it, or why it was not read as text. */
  readingOf(absolutePath: string): Promise<SourceTextReading>;
  /** A file's first `bytes` bytes, from its whole read when it was read whole. */
  headOf(absolutePath: string, bytes: number): Promise<Uint8Array>;
}

/** What one whole read of a file kept: its reading, and its first bytes. */
interface Kept {
  reading: SourceTextReading;
  head: Uint8Array;
}

/**
 * The reads of one run over a host. Of each whole read the first `keptHead` bytes are kept with its reading, so that a
 * head no longer than that is answered without asking the host again; a head asked of a file not read whole is asked
 * of the host, once. Every file read whole is kept for the run. A budget on what is kept was built and measured on
 * 2026-11-22, under Node on the whole of DNN and in a slowed page on its Library, and deleted the same day: no budget
 * moved the time beyond the machine's noise or the peak beyond its spread.
 */
export function workspaceReads(host: FileHost, keptHead: number): WorkspaceReads {
  const whole = new Map<string, Promise<Kept>>();
  const heads = new Map<string, Promise<Uint8Array>>();
  const readWhole = (absolutePath: string): Promise<Kept> => {
    let kept = whole.get(absolutePath);
    if (kept === undefined) {
      // A copy, so that the head kept holds none of the rest of the file's bytes. Not `slice`: on Node's `Buffer`, which
      // the Node host hands, `slice` is a view of the same memory, and the head kept every file's bytes whole for the run
      // (about 250 MB more at the peak on the whole of DNN until this was found, 2026-11-22).
      kept = host.read(absolutePath).then((bytes) => ({ reading: decodeSourceText(bytes), head: new Uint8Array(bytes.subarray(0, keptHead)) }));
      const reading = kept;
      whole.set(absolutePath, reading);
      // A failure is the asker's alone; the next to ask reads again.
      reading.then(undefined, () => {
        if (whole.get(absolutePath) === reading) whole.delete(absolutePath);
      });
    }
    return kept;
  };
  return {
    readingOf: async (absolutePath) => (await readWhole(absolutePath)).reading,
    headOf: async (absolutePath, bytes) => {
      if (whole.has(absolutePath) && bytes <= keptHead) return (await readWhole(absolutePath)).head.subarray(0, bytes);
      const key = `${bytes}\0${absolutePath}`;
      let head = heads.get(key);
      if (head === undefined) {
        head = host.head(absolutePath, bytes);
        heads.set(key, head);
        head.then(undefined, () => {
          heads.delete(key);
        });
      }
      return head;
    }
  };
}
