// The scanning page's script: the pure host-driven generator core (`generatorCore.ts`), bundled for a browser with
// ZERO Node stand-ins (Step 9 of `.mdmd/layer-3/engine-and-hosts.mdmd.md`), run over a folder the page is handed
// through its `<input webkitdirectory>`. It loads the folder's files into an in-memory workspace tree at `/ws`, runs
// `runLiveDocs` there with the page's own host (`PAGE_HOST`: file reads, folder listings, inlined WebAssembly grammar
// bytes, and an in-memory `OutputSink`, with no git or ancestor-scan access), and keeps what the scan wrote and what
// it read, for `tests/e2e/page-scan.spec.ts` to read as `window.pageScan`. Test scaffolding, not the product.
import enginePath from "../../packages/engine/src/tooling/enginePath";
import { runLiveDocs } from "../../packages/generator/src/generatorCore";

/** Where the folder is put in the in-memory workspace tree. */
const WORKSPACE = "/ws";

/**
 * What the page leaves out of a folder it is handed, as discovery does (`**\/.git/**`, `**\/node_modules/**`), so as not
 * to hold them in memory. A folder with `.git` is therefore scanned here as one that lies in no repository.
 */
const LEFT_OUT = new Set([".git", "node_modules"]);

const ERRNO = { ENOENT: -2, ENOTDIR: -20, EISDIR: -21 };
const DESCRIPTION = {
  ENOENT: "no such file or directory",
  ENOTDIR: "not a directory",
  EISDIR: "illegal operation on a directory"
};

const byCodeUnit = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const utf8KeepingBom = new TextDecoder("utf-8", { ignoreBOM: true });

function fsFailure(code, syscall, target) {
  return Object.assign(new Error(`${code}: ${DESCRIPTION[code]}, ${syscall} '${target}'`), {
    errno: ERRNO[code],
    code,
    syscall,
    path: String(target)
  });
}

/**
 * In-memory input tree holding the folder a user picked in the browser, answering `PAGE_HOST`'s reads and directory
 * listings with Node-compatible error codes and counting every read so `page-scan.spec.ts` enforces "read once".
 */
function createInputTree() {
  const files = new Map();
  const folders = new Set(["/"]);
  const reads = new Map();

  const absolute = (target) => enginePath.resolve(String(target));

  const addFolders = (at) => {
    for (let folder = enginePath.dirname(at); !folders.has(folder); folder = enginePath.dirname(folder)) {
      folders.add(folder);
    }
  };

  const lookUp = (at) => {
    if (files.has(at)) return "file";
    if (folders.has(at)) return "folder";
    for (let above = enginePath.dirname(at); above !== "/"; above = enginePath.dirname(above)) {
      if (files.has(above)) return "ENOTDIR";
      if (folders.has(above)) break;
    }
    return "ENOENT";
  };

  return {
    put(target, bytes, mtimeMs = 0) {
      const at = absolute(target);
      files.set(at, { bytes, mtimeMs });
      addFolders(at);
    },
    drop(target) {
      const at = absolute(target);
      files.delete(at);
      const prefix = at === "/" ? "/" : `${at}/`;
      for (const file of [...files.keys()]) if (file.startsWith(prefix)) files.delete(file);
      for (const folder of [...folders]) if (folder === at || folder.startsWith(prefix)) folders.delete(folder);
      folders.add("/");
    },
    resetReads() {
      reads.clear();
    },
    files: () => [...files.keys()].sort(byCodeUnit),
    bytes: (target) => files.get(absolute(target))?.bytes,
    read(target) {
      const at = absolute(target);
      reads.set(at, (reads.get(at) ?? 0) + 1);
      const kind = lookUp(at);
      if (kind === "folder") throw fsFailure("EISDIR", "read", target);
      if (kind !== "file") throw fsFailure(kind, "open", target);
      return files.get(at).bytes;
    },
    reads: () => Object.fromEntries([...reads].sort(([a], [b]) => byCodeUnit(a, b))),
    entries(target) {
      const at = absolute(target);
      const kind = lookUp(at);
      if (kind === "file") throw fsFailure("ENOTDIR", "scandir", target);
      if (kind !== "folder") throw fsFailure(kind, "scandir", target);
      const prefix = at === "/" ? "/" : `${at}/`;
      const found = new Map();
      for (const file of files.keys()) {
        if (file.startsWith(prefix) && !file.slice(prefix.length).includes("/")) {
          found.set(file.slice(prefix.length), "file");
        }
      }
      for (const folder of folders) {
        if (folder.startsWith(prefix) && folder !== at && !folder.slice(prefix.length).includes("/")) {
          found.set(folder.slice(prefix.length), "folder");
        }
      }
      const names = [...found.keys()].sort(byCodeUnit);
      return {
        files: names.filter((name) => found.get(name) === "file"),
        folders: names.filter((name) => found.get(name) === "folder")
      };
    }
  };
}

const tree = createInputTree();

/** Inlined tree-sitter runtime and language `.wasm` bytes, inflated once when the page loads. */
const grammarBytes = new Map();

/** The page's `GrammarHost`: supplies the tree-sitter runtime and language grammars directly as bytes. */
const PAGE_GRAMMARS = {
  runtime: async () => {
    const bytes = grammarBytes.get("runtime");
    if (!bytes) throw new Error("the scanning page holds no tree-sitter runtime wasm");
    return bytes;
  },
  grammar: async (name) => {
    const bytes = grammarBytes.get(name);
    if (!bytes) throw new Error(`the scanning page holds no grammar for ${name}: add it to the grammars of tests/page-scan/build-page.mjs`);
    return bytes;
  }
};

/**
 * The page's host of the scan's files and grammars (`FileHost`, `packages/engine/src/tooling/workspaceFiles.ts`):
 * reads, folder listings, and grammar bytes with zero Node stand-ins and no `git` or `scansAbove` port.
 */
const PAGE_HOST = {
  read: async (target) => tree.read(target),
  head: async (target, bytes) => tree.read(target).subarray(0, bytes),
  entries: async (folder) => tree.entries(folder),
  grammars: PAGE_GRAMMARS
};

const log = (line) => {
  document.getElementById("log").textContent += `${line}\n`;
};

/** Inflates each grammar inlined in the page into `grammarBytes` by its `data-grammar` key. */
async function putGrammars() {
  for (const node of document.querySelectorAll('script[type="application/octet-stream"][data-grammar]')) {
    const packed = Uint8Array.from(atob(node.textContent.trim()), (character) => character.charCodeAt(0));
    const stream = new Blob([packed]).stream().pipeThrough(new DecompressionStream("gzip"));
    grammarBytes.set(node.dataset.grammar, new Uint8Array(await new Response(stream).arrayBuffer()));
  }
}

/** Puts the files of a chosen folder into the tree under the workspace, each at its path below the folder. */
async function putFolder(fileList) {
  tree.drop(WORKSPACE);
  const put = [];
  let bytes = 0;
  for (const file of fileList) {
    const relative = file.webkitRelativePath.split("/").slice(1);
    if (relative.some((part) => LEFT_OUT.has(part))) continue;
    const data = new Uint8Array(await file.arrayBuffer());
    bytes += data.byteLength;
    tree.put(`${WORKSPACE}/${relative.join("/")}`, data, file.lastModified);
    put.push(`${WORKSPACE}/${relative.join("/")}`);
  }
  return { put, bytes };
}

/**
 * In-memory `OutputSink` for a page scan: keeps written docs and the derived index in memory, caches any pre-existing
 * doc read from the input tree so it is read at most once per run, and merges pre-existing non-deleted docs with newly
 * written docs when listing.
 */
function createPageOutputSink(inputTree) {
  const written = new Map();
  const deleted = new Set();
  const cached = new Map();

  return {
    written: () => written,

    readText: async (absPath) => {
      const at = enginePath.resolve(String(absPath));
      if (deleted.has(at)) return undefined;
      if (written.has(at)) return written.get(at);
      if (cached.has(at)) return cached.get(at);
      if (inputTree.bytes(at) === undefined) return undefined;
      const text = utf8KeepingBom.decode(inputTree.read(at));
      cached.set(at, text);
      return text;
    },

    writeText: async (absPath, content) => {
      const at = enginePath.resolve(String(absPath));
      deleted.delete(at);
      written.set(at, content);
    },

    removeFile: async (absPath) => {
      const at = enginePath.resolve(String(absPath));
      written.delete(at);
      cached.delete(at);
      deleted.add(at);
    },

    hasDirectory: async (absPath) => {
      const at = enginePath.resolve(String(absPath));
      const prefix = at === "/" ? "/" : `${at}/`;
      for (const file of written.keys()) {
        if (file.startsWith(prefix)) return true;
      }
      try {
        inputTree.entries(at);
        return true;
      } catch (error) {
        if (error?.code === "ENOENT" || error?.code === "ENOTDIR") return false;
        throw error;
      }
    },

    listFiles: async (baseLayerRoot, extension) => {
      const root = enginePath.resolve(String(baseLayerRoot));
      const prefix = root === "/" ? "/" : `${root}/`;
      const found = new Set();
      for (const file of inputTree.files()) {
        if (file.startsWith(prefix) && !deleted.has(file) && file.endsWith(extension)) {
          found.add(file);
        }
      }
      for (const file of written.keys()) {
        if (file.startsWith(prefix) && file.endsWith(extension)) {
          found.add(file);
        }
      }
      return [...found].sort(byCodeUnit);
    }
  };
}

/**
 * Scans the folder: the docs and the index it wrote, workspace-relative, with their text; what it read, how often;
 * the files it could not map; and how long `runLiveDocs` took.
 */
async function scan(fileList, now) {
  const { put, bytes } = await putFolder(fileList);
  const given = new Set(put);
  tree.resetReads();
  const warnings = [];
  const output = createPageOutputSink(tree);
  const started = performance.now();
  const result = await runLiveDocs({
    workspaceRoot: WORKSPACE,
    host: { ...PAGE_HOST, output },
    now: () => new Date(now),
    logger: { info: () => undefined, warn: (message) => warnings.push(message), error: (message) => warnings.push(message) }
  });
  const ms = performance.now() - started;
  const written = Object.fromEntries(
    [...output.written()]
      .filter(([file]) => file.startsWith(`${WORKSPACE}/`) && !given.has(file))
      .sort(([a], [b]) => byCodeUnit(a, b))
      .map(([file, content]) => [file.slice(WORKSPACE.length + 1), content])
  );
  const reads = Object.fromEntries(Object.entries(tree.reads()).map(([file, times]) => [file.startsWith(`${WORKSPACE}/`) ? file.slice(WORKSPACE.length + 1) : file, times]));
  return {
    ms, files: put.length, bytes, processed: result.processed, written,
    failed: result.failed.map((entry) => ({ sourcePath: entry.sourcePath, reason: entry.reason })),
    warnings, reads, calls: {}, callsOnLoading: {}, asked: []
  };
}

const state = { ready: false, result: undefined, error: undefined };
window.pageScan = state;

const ready = putGrammars().then(() => {
  state.ready = true;
}, (error) => {
  state.error = `the grammars could not be inflated: ${error}`;
});

// A folder chosen is scanned at once. The scan's clock, which its `Generated At` lines read, is the page's own unless
// the check names an instant on the input (`data-now`), the one it gives Node too.
document.getElementById("folder").addEventListener("change", async (event) => {
  state.result = undefined;
  state.error = undefined;
  try {
    await ready;
    const now = event.target.dataset.now ?? new Date().toISOString();
    state.result = await scan(event.target.files, now);
    log(`Scanned ${state.result.files} files in ${Math.round(state.result.ms)} ms: ${Object.keys(state.result.written).length} docs and the index written.`);
  } catch (error) {
    state.error = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
    log(state.error);
  }
});
