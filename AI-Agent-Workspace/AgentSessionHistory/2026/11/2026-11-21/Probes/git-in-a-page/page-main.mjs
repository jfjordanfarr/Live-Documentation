// Probe of November 21, 2026 (not product code): the page's own part. A folder reaches it three ways (a folder input,
// a dropped folder, the folder picker), each made into the same four-function host; the page says in one line what
// the folder holds of git, and on a press reads the history newest first, showing how far it has come.
import { describe, measure } from "./workload.mjs";

/** A host over a map of paths, relative to the folder given, to something that yields a File. */
function hostOver(entries) {
  const file = async (path) => {
    const entry = entries.get(path);
    return entry === undefined ? null : entry();
  };
  return {
    async list(prefix) {
      const keys = [...entries.keys()];
      return prefix === "" ? keys : keys.filter((path) => path.startsWith(`${prefix}/`));
    },
    async read(path) {
      const found = await file(path);
      return found === null ? null : new Uint8Array(await found.arrayBuffer());
    },
    async size(path) {
      return (await file(path)).size;
    },
    async slice(path, start, end) {
      return new Uint8Array(await (await file(path)).slice(start, end).arrayBuffer());
    }
  };
}

function fromInput(files) {
  const entries = new Map();
  for (const f of files) entries.set(f.webkitRelativePath.split("/").slice(1).join("/"), () => f);
  return entries;
}

async function fromDroppedEntry(root) {
  const entries = new Map();
  const walk = async (directory, prefix) => {
    const reader = directory.createReader();
    for (;;) {
      // Chromium gives at most 100 entries a call; an empty answer ends the folder.
      const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
      if (batch.length === 0) break;
      for (const entry of batch) {
        const path = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
        if (entry.isDirectory) await walk(entry, path);
        else entries.set(path, () => new Promise((resolve, reject) => entry.file(resolve, reject)));
      }
    }
  };
  await walk(root, "");
  return entries;
}

async function fromHandle(root) {
  const entries = new Map();
  const walk = async (directory, prefix) => {
    for await (const [name, handle] of directory.entries()) {
      const path = prefix === "" ? name : `${prefix}/${name}`;
      if (handle.kind === "directory") await walk(handle, path);
      else entries.set(path, () => handle.getFile());
    }
  };
  await walk(root, "");
  return entries;
}

const $ = (id) => document.getElementById(id);
let host;
const memory = () => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null);

async function given(how, entries, startedAt) {
  host = hostOver(entries);
  const listedMs = Math.round(performance.now() - startedAt);
  const described = await describe(host);
  $("verdict").textContent = `${how}: ${described.line}`;
  $("read").disabled = !described.hasGit;
  window.__probe.described = { how, listedMs, ...described };
}

async function run(options = {}) {
  $("read").disabled = true;
  const result = await measure(host, {
    ...options,
    memory,
    progress: ({ stage, done, of, date }) => {
      $("progress").textContent = stage === "commits" ? `${done} commits read, back to ${new Date(date * 1000).toISOString().slice(0, 10)}` : `${done} of ${of} files read (${stage})`;
    }
  });
  $("progress").textContent = `${result.commits} commits, ${result.changedPaths} changed paths, ${result.changedBlobs} files' bytes (${result.blobMegabytes ?? 0} MB) in ${((result.commitsMs + (result.blobsMs ?? 0)) / 1000).toFixed(1)} s; ${result.blobsFailingTheirId} failed their id.`;
  $("read").disabled = false;
  return result;
}

window.__probe = { run, given: (how) => window.__probe.described };

$("folder").addEventListener("change", () => given("folder input", fromInput($("folder").files), performance.now()));
$("pick").addEventListener("click", async () => {
  const startedAt = performance.now();
  try {
    await given("folder picker", await fromHandle(await window.showDirectoryPicker()), startedAt);
  } catch (error) {
    $("verdict").textContent = `folder picker: ${error.name}: ${error.message}`;
  }
});
$("drop").addEventListener("dragover", (event) => event.preventDefault());
$("drop").addEventListener("drop", async (event) => {
  event.preventDefault();
  const startedAt = performance.now();
  const entry = event.dataTransfer.items[0]?.webkitGetAsEntry();
  if (!entry?.isDirectory) {
    $("verdict").textContent = "drop: that was not a folder";
    return;
  }
  await given("dropped folder", await fromDroppedEntry(entry), startedAt);
});
$("read").addEventListener("click", () => run());
$("pick").disabled = typeof window.showDirectoryPicker !== "function";
