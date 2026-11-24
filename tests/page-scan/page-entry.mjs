// The scanning page's script: the generator as it stands, bundled with the stand-ins, run over a folder the page is
// handed through its `<input webkitdirectory>`. It puts the folder's files into the stand-in for `node:fs` at `/ws`,
// runs `generateLiveDocs` there with the page's own host of the files' bytes (`PAGE_HOST`), and keeps what the scan
// wrote, what it read and what it asked of the stand-ins, for `tests/e2e/page-scan.spec.ts` to read as
// `window.pageScan`. Test scaffolding, not the product.
import { generateLiveDocs } from "../../packages/generator/src/generator";
import { callCounts, resetCalls } from "./stand-ins/calls.mjs";
import { asked } from "./stand-ins/child_process.mjs";
import { tree } from "./stand-ins/fs.mjs";

/** The calls the engine's modules made of the stand-ins as they loaded, before any scan (`adapters/treeSitter.ts` finding its grammars). */
const callsOnLoading = callCounts();

/** Where the folder is put in the stand-in's tree. */
const WORKSPACE = "/ws";

/**
 * What the page leaves out of a folder it is handed, as discovery does (`**\/.git/**`, `**\/node_modules/**`), so as not
 * to hold them in memory. A folder with `.git` is therefore scanned here as one that lies in no repository.
 */
const LEFT_OUT = new Set([".git", "node_modules"]);

/**
 * The page's host of the scan's files (`FileHost`, `packages/engine/src/tooling/workspaceFiles.ts`): their bytes from the
 * folder the page was handed, read without Node's `fs`, so that the calls of the stand-in for it count only what the
 * engine still asks of Node; each read is counted with the scan's reads. The page holds every file already, so a head
 * is cut from the whole.
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
  }
};

const log = (line) => {
  document.getElementById("log").textContent += `${line}\n`;
};

/** Inflates each grammar inlined in the page and puts it into the tree at the path the engine looks for it. */
async function putGrammars() {
  for (const node of document.querySelectorAll('script[type="application/octet-stream"][data-path]')) {
    const packed = Uint8Array.from(atob(node.textContent.trim()), (character) => character.charCodeAt(0));
    const stream = new Blob([packed]).stream().pipeThrough(new DecompressionStream("gzip"));
    tree.put(node.dataset.path, new Uint8Array(await new Response(stream).arrayBuffer()));
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
 * Scans the folder: the docs and the index it wrote, workspace-relative, with their text; what it read, how often;
 * the calls it made of the stand-ins; the files it could not map; and how long `generateLiveDocs` took.
 */
async function scan(fileList, now) {
  const { put, bytes } = await putFolder(fileList);
  const given = new Set(put);
  resetCalls();
  tree.resetReads();
  asked.length = 0;
  const warnings = [];
  const started = performance.now();
  const result = await generateLiveDocs({
    workspaceRoot: WORKSPACE,
    host: PAGE_HOST,
    now: () => new Date(now),
    logger: { info: () => undefined, warn: (message) => warnings.push(message), error: (message) => warnings.push(message) }
  });
  const ms = performance.now() - started;
  const decoder = new TextDecoder();
  const written = Object.fromEntries(tree.files()
    .filter((file) => file.startsWith(`${WORKSPACE}/`) && !given.has(file))
    .map((file) => [file.slice(WORKSPACE.length + 1), decoder.decode(tree.bytes(file))]));
  const reads = Object.fromEntries(Object.entries(tree.reads()).map(([file, times]) => [file.startsWith(`${WORKSPACE}/`) ? file.slice(WORKSPACE.length + 1) : file, times]));
  return {
    ms, files: put.length, bytes, processed: result.processed, written,
    failed: result.failed.map((entry) => ({ sourcePath: entry.sourcePath, reason: entry.reason })),
    warnings, reads, calls: callCounts(), callsOnLoading, asked: [...asked]
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
