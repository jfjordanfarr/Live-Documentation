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

/** A folder's immediate entries, by name, sorted: its files (links to files included), its real subfolders, and any links to folders. */
export interface FolderEntries {
  files: readonly string[];
  folders: readonly string[];
  /** Subfolder names that are symbolic links to directories: not entered by a bare `**` walk, entered only when a pattern walks through them. */
  linkedFolders?: readonly string[];
}

/** What lies at a path: a file, or a folder. */
export type PathKind = "file" | "folder";

/** A folder's entries by name: its files, and its folders. */
export interface FolderChildren {
  files: ReadonlySet<string>;
  folders: ReadonlySet<string>;
}

/**
 * Process-level disk fallback registered by Node entry points (`registerNodeDiskFallback` in `nodeHost.ts`) for
 * standalone reader calls that omit a run's `WorkspaceFileIndex` / `WorkspaceReads` (such as adapter unit tests and
 * standalone CLI/oracle tools). Browser scans never register a disk fallback and never bundle `nodeHost.ts`
 * (Step 9 of `.mdmd/layer-3/engine-and-hosts.mdmd.md`).
 */
export interface DiskFallback {
  readFileBytes(absolutePath: string): Promise<Uint8Array>;
  kindOnDisk(absolutePath: string): PathKind | undefined;
  childrenOnDisk(absoluteFolder: string): FolderChildren | undefined;
  listFilesOnDisk(
    workspaceRoot: string,
    extension: string,
    ignoredFolders: ReadonlySet<string>,
    caseInsensitive?: boolean
  ): Promise<string[]>;
}

// Store the active fallback on a shared globalThis symbol slot (matching GrammarHost in adapters/treeSitter.ts) so
// fresh module instances under Vitest `vi.resetModules()` inherit the process registration cleanly.
const DISK_FALLBACK_SLOT = Symbol.for("@live-documentation/engine/diskFallback");
type DiskFallbackCarrier = typeof globalThis & { [DISK_FALLBACK_SLOT]?: DiskFallback };

/** Registers (or clears) the standalone disk fallback used when a reader is called without a run's `FileHost`/`fileIndex`. */
export function setDiskFallback(fallback: DiskFallback | undefined): void {
  (globalThis as DiskFallbackCarrier)[DISK_FALLBACK_SLOT] = fallback;
}

/** Returns the currently registered {@link DiskFallback}, if any. */
export function getDiskFallback(): DiskFallback | undefined {
  return (globalThis as DiskFallbackCarrier)[DISK_FALLBACK_SLOT];
}

/** Returns the active {@link DiskFallback} or throws a clear diagnostic telling the caller to pass the run's `fileIndex`/`reads` or register Node's fallback. */
export function requireDiskFallback(caller: string): DiskFallback {
  const fallback = getDiskFallback();
  if (!fallback) {
    throw new Error(
      `${caller} was called without a run's fileIndex/reads and no DiskFallback is registered: pass the run's fileIndex/reads or call registerNodeDiskFallback() under Node.`
    );
  }
  return fallback;
}

/** Provides the tree-sitter WebAssembly runtime and compiled language grammars as raw bytes. */
export interface GrammarHost {
  /** Bytes of the `web-tree-sitter.wasm` runtime. */
  runtime(): Promise<Uint8Array>;
  /** Bytes of `tree-sitter-<name>.wasm` for the named grammar. */
  grammar(name: string): Promise<Uint8Array>;
}

/** What git says of a list of paths: which it ignores, which it cannot judge, and which lie in no repository. */
export interface GitIgnoreAnswer {
  /** The paths git ignores: each, or a folder above it, is in the listing of the repository that holds it. */
  ignored: Set<string>;
  /**
   * The paths git cannot judge: each passes through a link that git does not ignore to a folder that is not a
   * repository's top (a plain folder, or one in the middle of a repository), and a path beyond a link is no path of the
   * repository around to git; or lies in a folder holding a `.git` whose git could not be asked, or of which git said
   * nothing.
   */
  unjudged: Set<string>;
  /**
   * The paths that lie in no repository, in a workspace that lies in none: git has no word on them, and none was
   * wanted, so the caller's rule for no git judges them with nothing to warn of.
   */
  outside: Set<string>;
}

/** Git's word on what it ignores in a workspace, from one listing. */
export interface GitIgnores {
  /** The folders git ignores whole, workspace-relative with forward slashes; `""` when it ignores the workspace itself. */
  readonly folders: ReadonlySet<string>;
  /** What git says of each of the paths (workspace-relative, forward slashes; `.` or `""` for the workspace itself). */
  answer(relativePaths: readonly string[]): GitIgnoreAnswer;
}

/** Why git gave no listing of what it ignores in a folder that lies in a repository. */
export interface GitUnanswered {
  /** Git's own first line of complaint, or that git could not be started, or its answer passed the buffer. */
  readonly reason: string;
}

/** Optional version-control port supplied by hosts that can run git (such as Node); omitted in browser pages. */
export interface GitHost {
  ignores(workspaceRoot: string, unanswered?: (why: GitUnanswered) => void): GitIgnores | null;
  ignored(workspaceRoot: string, relativePaths: readonly string[]): Set<string> | null;
  ignoresCase(workspaceRoot: string): boolean;
  liesInNoRepository(folder: string): boolean;
  changedFiles(workspaceRoot: string): Promise<Set<string>>;
}

/**
 * Host port for reading, listing, writing, and pruning generated Live Docs and the derived graph index
 * (Step 6 of `.mdmd/layer-3/engine-and-hosts.mdmd.md`). Under Node, backed by disk (`NODE_OUTPUT_SINK`);
 * in a browser page, backed by an in-memory map without touching any `node:fs` stand-in.
 */
export interface OutputSink {
  /** Read an existing generated document as UTF-8 text, or `undefined` when absent (`ENOENT`). Throws machine failures and path-limit errors. */
  readText(absolutePath: string): Promise<string | undefined>;
  /** Write UTF-8 text to `absolutePath`, creating parent directories as needed. */
  writeText(absolutePath: string, content: string): Promise<void>;
  /** Remove `absolutePath` if present (ignoring absence), and when `stopDir` is supplied, tidy empty parent directories strictly beneath `stopDir`. */
  removeFile(absolutePath: string, stopDir?: string): Promise<void>;
  /** Whether a generated-doc directory exists; throws machine failures (`throwIfMachineFailure`), returns `false` on absence. */
  hasDirectory(absolutePath: string): Promise<boolean>;
  /** Sorted absolute paths of existing generated files ending with `extension` under `baseLayerRoot`. Throws on unreadable folders. */
  listFiles(baseLayerRoot: string, extension: string): Promise<string[]>;
}

/**
 * Checks ancestor folders above `workspaceRoot` for outer scans. Returns the outer scan folders when the host can
 * inspect ancestors (Node), or `undefined` when the host cannot see above the workspace (a browser page).
 */
export type ScansAboveFn = (
  workspaceRoot: string,
  config: { root: string; baseLayer: string; extension: string }
) => Promise<string[] | undefined>;

/**
 * What runs the engine gives it of a workspace: a file's bytes, its first bytes, a folder's entries, and optional
 * ports for grammars, git, ancestor scans, and generated-doc output. Paths are absolute, as the readers hold them.
 */
export interface FileHost {
  /** A file's bytes. A failure is thrown as the host met it, so that it is read as the machine's or the file's. */
  read(absolutePath: string): Promise<Uint8Array>;
  /** A file's first `bytes` bytes, fewer when it is shorter. A host may answer it by reading the whole file. */
  head(absolutePath: string, bytes: number): Promise<Uint8Array>;
  /** A folder's immediate files and subfolders, sorted by name. A failure is thrown as the host met it. */
  entries(absoluteFolder: string): Promise<FolderEntries>;
  /** Optional provider of tree-sitter runtime and grammar bytes. */
  grammars?: GrammarHost;
  /** Optional git port; absent in browser hosts that cannot spawn git. */
  git?: GitHost;
  /** Optional check for outer scans above `workspaceRoot`; absent or returning `undefined` in browser hosts. */
  scansAbove?: ScansAboveFn;
  /** Optional output sink for generated Live Docs and the derived graph index. */
  output?: OutputSink;
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
export function workspaceReads(host: Pick<FileHost, "read" | "head">, keptHead: number): WorkspaceReads {
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
