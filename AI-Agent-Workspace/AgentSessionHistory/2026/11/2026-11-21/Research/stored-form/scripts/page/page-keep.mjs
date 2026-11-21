// Research of November 21, 2026 (not product code). A page that keeps a scan as it goes and goes on after a closed tab,
// for the resumable press (d1k-press-kept.mjs): every frame the writer sets down is put into IndexedDB at once, and a
// page opened again reads what is there, keeps it up to its last whole chunk, and goes on from the next file. Also: the
// page saving a copy of itself with the facts inside, as one HTML file, through a download of a blob.
import { concat, sha256Hex } from "../designs/common.mjs";

const DB = "stored-form-scan";
const STORE = "frames";
const MAGIC = new TextEncoder().encode("LDP3");

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { autoIncrement: true });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
const done = (tx) => new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); });

async function putFrame(db, bytes) {
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).add(bytes);
  await done(tx);
}
async function allFrames(db) {
  const tx = db.transaction(STORE, "readonly");
  const request = tx.objectStore(STORE).getAll();
  await done(tx);
  return request.result;
}
async function clear(db) {
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).clear();
  await done(tx);
}

/** Reads the picked facts file line by line, handing each file to `each(path, record, outbound, n, total)`. */
async function eachFile(location, each, skip = 0) {
  const file = document.getElementById("facts").files[0];
  const lines = file.stream().pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let head;
  let n = 0;
  const handle = async (line) => {
    if (!line) return;
    if (!head) { head = JSON.parse(line); Object.assign(location, { root: head.root, baseLayer: head.baseLayer, extension: head.extension }); return; }
    n += 1;
    if (n <= skip) return;
    const [path, record, outbound] = JSON.parse(line);
    await each(path, record, outbound, n, head.files);
  };
  for (;;) {
    const { done: end, value } = await lines.read();
    if (end) break;
    buffer += value;
    let start = 0;
    for (let i = buffer.indexOf("\n"); i !== -1; i = buffer.indexOf("\n", start)) {
      await handle(buffer.slice(start, i));
      start = i + 1;
    }
    buffer = buffer.slice(start);
  }
  await handle(buffer);
  return head;
}

export function keepApi(design) {
  let lastBytes;
  return {
    progress: 0,
    /** The scan written as facts arrive, every frame put into IndexedDB as it is set down. */
    async keep() {
      const db = await openDb();
      await clear(db);
      const t0 = performance.now();
      const location = {};
      let w;
      let frames = 0;
      const head = await eachFile(location, async (path, record, outbound, n, total) => {
        w ??= design.writer(location, { onFrame: async (bytes) => { frames += 1; await putFrame(db, bytes); } });
        await w.add(path, record, outbound);
        this.progress = n / total;
      });
      lastBytes = await w.finish();
      return { files: head.files, frames, writeMs: performance.now() - t0, bytes: lastBytes.length, sha256: await sha256Hex(lastBytes) };
    },
    /** Opened again: what IndexedDB holds, kept to its last whole chunk, and the scan gone on with from there. */
    async resume() {
      const t0 = performance.now();
      const db = await openDb();
      const frames = await allFrames(db);
      const cut = concat([MAGIC, ...frames]);
      const found = await design.resumeFrom(cut);
      const r = { framesFound: frames.length, bytesFound: cut.length, filesBack: found ? found.files : 0, lastPath: found?.lastPath, findMs: performance.now() - t0 };
      // Start the store again from what was kept, so that it matches the writer's state.
      await clear(db);
      if (found) for (const f of found.state.frames) await putFrame(db, f);
      const location = found ? found.location : {};
      let w = found ? design.writer(location, { state: found.state, onFrame: (bytes) => putFrame(db, bytes) }) : undefined;
      const head = await eachFile(location, async (path, record, outbound, n, total) => {
        w ??= design.writer(location, { onFrame: (bytes) => putFrame(db, bytes) });
        await w.add(path, record, outbound);
        this.progress = n / total;
      }, found ? found.files : 0);
      lastBytes = await w.finish();
      return { ...r, files: head.files, totalMs: performance.now() - t0, bytes: lastBytes.length, sha256: await sha256Hex(lastBytes) };
    },
    /** What this origin's storage offers, and whether it holds a block of `megabytes` across a browser's closing. */
    async storage(megabytes, phase) {
      const out = { phase };
      try { out.estimate = await navigator.storage.estimate(); } catch (e) { out.estimate = String(e); }
      try { out.persisted = await navigator.storage.persisted(); } catch (e) { out.persisted = String(e); }
      try { await navigator.storage.getDirectory(); out.originPrivateFileSystem = "available"; } catch (e) { out.originPrivateFileSystem = String(e).slice(0, 120); }
      out.showDirectoryPicker = typeof window.showDirectoryPicker;
      out.showSaveFilePicker = typeof window.showSaveFilePicker;
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("stored-form-quota", 1);
        request.onupgradeneeded = () => request.result.createObjectStore("blocks");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      if (phase === "put") {
        const block = new Uint8Array(megabytes * 1048576);
        for (let i = 0; i < block.length; i += 4096) block[i] = i & 255;
        const tx = db.transaction("blocks", "readwrite");
        tx.objectStore("blocks").put(block, "test");
        try { await done(tx); out.put = `${megabytes} MB put`; } catch (e) { out.put = `refused: ${String(e).slice(0, 160)}`; }
      } else {
        const tx = db.transaction("blocks", "readonly");
        const request = tx.objectStore("blocks").get("test");
        await done(tx);
        out.readBack = request.result ? `${Math.round(request.result.byteLength / 1048576)} MB read back` : "nothing there";
      }
      try { out.estimateAfter = await navigator.storage.estimate(); } catch { /* none */ }
      return out;
    },
    /**
     * A copy of this page with the facts inside: the page's own head and script, unchanged so that the policy's hash
     * still admits it, and the facts as base64 in a block the browser does not run; offered as a download of a blob.
     */
    async saveCopy() {
      const t0 = performance.now();
      const script = [...document.scripts].find((s) => !s.type || s.type === "text/javascript").textContent;
      const data = lastBytes.toBase64();
      const html = `<!doctype html><html><head>${document.head.innerHTML}</head><body><script type="application/octet-stream" id="data">${data}</script><script>${script}</script></body></html>`;
      const blob = new Blob([html], { type: "text/html" });
      const buildMs = performance.now() - t0;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "map.html";
      document.body.append(a);
      a.click();
      return { buildMs, copyBytes: blob.size };
    }
  };
}
