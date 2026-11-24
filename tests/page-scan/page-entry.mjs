// The scanning page's script: the pure host-driven generator core (`generatorCore.ts`), bundled with the remaining
// stand-ins, run over a folder the page is handed through its `<input webkitdirectory>`. It loads the folder's files
// into the in-memory workspace tree at `/ws`, runs `runLiveDocs` there with the page's own host (`PAGE_HOST`: file
// reads, folder listings, inlined WebAssembly grammar bytes, and an in-memory `OutputSink`, with no git or
// ancestor-scan access), and keeps what the scan wrote, what it read and what it asked of the stand-ins, for
// `tests/e2e/page-scan.spec.ts` to read as `window.pageScan`. Test scaffolding, not the product.
import { runLiveDocs } from "../../packages/generator/src/generatorCore";
import { callCounts, resetCalls } from "./stand-ins/calls.mjs";
import { tree } from "./stand-ins/fs.mjs";
import { rules } from "./stand-ins/path.mjs";

/** The calls the engine's modules made of the stand-ins as they loaded, before any scan. */
const callsOnLoading = callCounts();

/** Where the folder is put in the stand-in's tree. */
const WORKSPACE = "/ws";

/**
 * What the page leaves out of a folder it is handed, as discovery does (`**\/.git/**`, `**\/node_modules/**`), so as not
 * to hold them in memory. A folder with `.git` is therefore scanned here as one that lies in no repository.
 */
const LEFT_OUT = new Set([".git", "node_modules"]);

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
 * reads, folder listings, and grammar bytes without Node's `fs`, `child_process`, or `require.resolve`, and with no
 * `git` or `scansAbove` port. Each read is counted with the scan's reads.
 */
const PAGE_HOST = {
  read: async (path) => tree.read(path),
  head: async (path, bytes) => tree.read(path).subarray(0, bytes),
  entries: async (folder) => {
    const files = [];
    const folders = [];
    for (const entry of tree.entries(folder)) {
      if (entry.isFile()) files.push(entry.name);
      else if (entry.isDirectory()) folders.push(entry.name);
    }
    return { files, folders };
  },
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

const byCodeUnit = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const utf8KeepingBom = new TextDecoder("utf-8", { ignoreBOM: true });

/**
 * In-memory `OutputSink` for a page scan: keeps written docs and the derived index in memory without touching
 * `fs.mjs`'s input tree, caches any pre-existing doc read from `tree` so it is read at most once per run, and merges
 * pre-existing non-deleted docs with newly written docs when listing.
 */
function createPageOutputSink(inputTree) {
  const written = new Map();
  const deleted = new Set();
  const cached = new Map();

  return {
    written: () => written,

    readText: async (absPath) => {
      const at = rules.resolve(String(absPath));
      if (deleted.has(at)) return undefined;
      if (written.has(at)) return written.get(at);
      if (cached.has(at)) return cached.get(at);
      if (inputTree.bytes(at) === undefined) return undefined;
      const text = utf8KeepingBom.decode(inputTree.read(at));
      cached.set(at, text);
      return text;
    },

    writeText: async (absPath, content) => {
      const at = rules.resolve(String(absPath));
      deleted.delete(at);
      written.set(at, content);
    },

    removeFile: async (absPath) => {
      const at = rules.resolve(String(absPath));
      written.delete(at);
      cached.delete(at);
      deleted.add(at);
    },

    hasDirectory: async (absPath) => {
      const at = rules.resolve(String(absPath));
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
      const root = rules.resolve(String(baseLayerRoot));
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
 * the calls it made of the stand-ins; the files it could not map; and how long `runLiveDocs` took.
 */
async function scan(fileList, now) {
  const { put, bytes } = await putFolder(fileList);
  const given = new Set(put);
  resetCalls();
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
    warnings, reads, calls: callCounts(), callsOnLoading, asked: []
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
