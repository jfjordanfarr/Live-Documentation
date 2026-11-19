// The probe page's script: the unchanged generator, bundled with the shims, run over a folder the page is given.
// Not product code. It exposes window.__probe for the measuring driver and three ways in for a person: the folder
// picker, a dropped folder and an <input webkitdirectory>.
import { generateLiveDocs } from "@probe/generator";
import { putFile, reset, listFiles, fileBytes, stats } from "./shims/fs.mjs";
import { calls as processCalls } from "./shims/child_process.mjs";

const ROOT = "/ws";
const SKIP = new Set([".git", "node_modules"]);
const log = (line) => { const out = document.getElementById("log"); if (out) out.textContent += line + "\n"; };

async function decodeEmbeddedWasm() {
  const started = performance.now();
  const table = {};
  for (const node of document.querySelectorAll('script[type="application/octet-stream"][data-name]')) {
    const binary = Uint8Array.from(atob(node.textContent.trim()), (c) => c.charCodeAt(0));
    const stream = new Blob([binary]).stream().pipeThrough(new DecompressionStream("gzip"));
    table[node.dataset.name] = new Uint8Array(await new Response(stream).arrayBuffer());
  }
  globalThis.__liveDocsWasm = table;
  return { grammars: Object.keys(table).length, ms: performance.now() - started };
}
const wasmReady = decodeEmbeddedWasm();

async function walkHandle(handle, prefix, out) {
  for await (const [name, child] of handle.entries()) {
    if (SKIP.has(name)) continue;
    if (child.kind === "directory") await walkHandle(child, `${prefix}/${name}`, out);
    else out.push({ path: `${prefix}/${name}`, handle: child });
  }
}

/** Reads every file under a directory handle into the in-memory tree, eagerly, timing the walk and the reads apart. */
async function loadFromHandle(directory) {
  reset();
  const t0 = performance.now();
  const entries = [];
  await walkHandle(directory, ROOT, entries);
  const t1 = performance.now();
  let bytes = 0;
  for (const entry of entries) {
    const file = await entry.handle.getFile();
    const data = new Uint8Array(await file.arrayBuffer());
    bytes += data.byteLength;
    putFile(entry.path, data, file.lastModified);
  }
  const t2 = performance.now();
  return { files: entries.length, bytes, walkMs: t1 - t0, readMs: t2 - t1 };
}

/** The same from File objects carrying webkitRelativePath: an <input webkitdirectory> or a dropped folder. */
async function loadFromFiles(fileList) {
  reset();
  const t0 = performance.now();
  let bytes = 0, files = 0;
  for (const file of fileList) {
    const relative = (file.webkitRelativePath || file.relativePath || file.name).split("/").slice(1).join("/");
    if (relative.split("/").some((part) => SKIP.has(part))) continue;
    const data = new Uint8Array(await file.arrayBuffer());
    bytes += data.byteLength; files += 1;
    putFile(`${ROOT}/${relative}`, data, file.lastModified);
  }
  return { files, bytes, readMs: performance.now() - t0 };
}

async function memory() {
  const heap = performance.memory ? { usedJSHeapSize: performance.memory.usedJSHeapSize, totalJSHeapSize: performance.memory.totalJSHeapSize } : null;
  return { heap };
}

async function generate(config = {}) {
  const wasm = await wasmReady;
  const before = { ...stats };
  const t0 = performance.now();
  const warnings = [];
  const result = await generateLiveDocs({
    workspaceRoot: ROOT,
    config,
    logger: { info: () => {}, warn: (m) => warnings.push(m), error: (m) => warnings.push(m) }
  });
  const ms = performance.now() - t0;
  const docs = listFiles().filter((p) => p.endsWith(".md") && p.includes("/.live-documentation/"));
  return {
    wasm, ms, processed: result.processed, written: result.written, index: result.index,
    docs: docs.length, warnings: warnings.length, processCalls: [...new Set(processCalls)],
    reads: stats.reads - before.reads, statCalls: stats.statCalls - before.statCalls, syncCalls: stats.syncCalls - before.syncCalls,
    writes: stats.writes - before.writes, writeBytes: stats.writeBytes - before.writeBytes,
    memory: await memory()
  };
}

/** Writes the generated docs back into the picked folder through its handle: the browser asks for write permission. */
async function writeBack(directory) {
  const permission = await directory.requestPermission({ mode: "readwrite" });
  if (permission !== "granted") return { permission };
  const t0 = performance.now();
  let written = 0;
  for (const full of listFiles().filter((p) => p.startsWith(`${ROOT}/.live-documentation/`))) {
    const parts = full.slice(ROOT.length + 1).split("/");
    let dir = directory;
    for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part, { create: true });
    const handle = await dir.getFileHandle(parts.at(-1), { create: true });
    const writable = await handle.createWritable();
    await writable.write(fileBytes(full));
    await writable.close();
    written += 1;
  }
  return { permission, written, ms: performance.now() - t0 };
}

/** A fresh blank copy of this page: its own source with the map's data block emptied, as a Blob. */
function blankCopy() {
  const clone = document.documentElement.cloneNode(true);
  clone.querySelector("#log").textContent = "";
  for (const node of clone.querySelectorAll("script[data-map]")) node.textContent = "";
  return new Blob([`<!doctype html>\n${clone.outerHTML}`], { type: "text/html" });
}
function download(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}
async function saveThroughPicker(blob, name) {
  const handle = await window.showSaveFilePicker({ suggestedName: name, types: [{ description: "HTML", accept: { "text/html": [".html"] } }] });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
  return { saved: name };
}

window.__probe = {
  loadFromHandle, loadFromFiles, generate, writeBack, blankCopy, download, saveThroughPicker, memory,
  wasmReady, listFiles, docText: (p) => new TextDecoder().decode(fileBytes(p)),
  features: () => ({
    showDirectoryPicker: typeof window.showDirectoryPicker, showSaveFilePicker: typeof window.showSaveFilePicker,
    storageGetDirectory: typeof navigator.storage?.getDirectory, isSecureContext: window.isSecureContext,
    origin: location.origin, protocol: location.protocol, DecompressionStream: typeof DecompressionStream,
    webkitdirectory: "webkitdirectory" in document.createElement("input")
  })
};

// For a person: three ways to hand the page a folder.
document.getElementById("pick").addEventListener("click", async () => {
  try {
    const directory = await window.showDirectoryPicker({ mode: "read" });
    log(JSON.stringify(await loadFromHandle(directory)));
    log(JSON.stringify(await generate()));
    window.__probe.lastDirectory = directory;
  } catch (error) { log(String(error)); }
});
document.getElementById("folder").addEventListener("change", async (event) => {
  log(JSON.stringify(await loadFromFiles(event.target.files)));
  log(JSON.stringify(await generate()));
});
document.body.addEventListener("dragover", (event) => event.preventDefault());
document.body.addEventListener("drop", async (event) => {
  event.preventDefault();
  const item = [...event.dataTransfer.items][0];
  if (item?.getAsFileSystemHandle) {
    const handle = await item.getAsFileSystemHandle();
    if (handle.kind === "directory") { log(JSON.stringify(await loadFromHandle(handle))); log(JSON.stringify(await generate())); }
  }
});
document.getElementById("blank").addEventListener("click", () => download(blankCopy(), "live-documentation-blank.html"));
wasmReady.then((w) => log(`grammars ready: ${JSON.stringify(w)}`), (e) => log(`grammars failed: ${e}`));
