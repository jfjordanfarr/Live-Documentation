// Research of November 21, 2026 (not product code). What runs inside a measuring page: one design, its stored bytes
// carried in the page as base64 in a block the browser does not run, and three things the driver asks of it.
import { canonical, comparePaths, docPathOf, sha256Hex } from "../designs/common.mjs";

const hex = (bytes) => sha256Hex(bytes);

export function bench(design) {
  const scriptStartedMs = performance.now();
  let lastGraph;
  let lastBytes;
  window.__bench = {
    scriptStartedMs,
    /** Opens the carried bytes cold and answers the real questions, each timed from the page's own clock. */
    async read({ hub, reachableFrom, typical }) {
      const t = {};
      const t0 = performance.now();
      const text = document.getElementById("data").textContent;
      const bytes = typeof Uint8Array.fromBase64 === "function" ? Uint8Array.fromBase64(text.trim()) : Uint8Array.from(atob(text.trim()), (c) => c.charCodeAt(0));
      t.base64Ms = performance.now() - t0;
      t.carriedBytes = bytes.length;
      let s = performance.now();
      const reader = await design.open(bytes);
      t.openMs = performance.now() - s;
      s = performance.now();
      t.inboundOfHub = (await reader.inbound(hub)).length;
      t.inboundMs = performance.now() - s;
      t.firstAnswerMs = performance.now() - t0;
      s = performance.now();
      t.reachable = (await reader.reachable(reachableFrom)).length;
      t.reachableMs = performance.now() - s;
      s = performance.now();
      const near = [...new Set([typical, ...(await reader.inbound(typical)), ...(await reader.outbound(typical))])];
      t.typicalNeighbourhood = (await reader.records(near)).length;
      t.typicalNeighbourhoodMs = performance.now() - s;
      s = performance.now();
      const hubNear = [...new Set([hub, ...(await reader.inbound(hub)), ...(await reader.outbound(hub))])];
      t.hubNeighbourhood = (await reader.records(hubNear)).length;
      t.hubNeighbourhoodMs = performance.now() - s;
      s = performance.now();
      lastGraph = await reader.all();
      t.allMs = performance.now() - s;
      t.files = Object.keys(lastGraph.files).length;
      t.totalMs = performance.now() - t0;
      t.heapMb = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null;
      return t;
    },
    /** Writes the design from a file of one line per file, handed over one file at a time ("stream") or all first ("gather"). */
    async write(mode) {
      const file = document.getElementById("facts").files[0];
      const t0 = performance.now();
      const lines = file.stream().pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      let location;
      let w;
      const graph = { files: {} };
      let n = 0;
      let longestGapMs = 0;
      let lastYield = performance.now();
      const handle = async (line) => {
        if (!line) return;
        if (!location) {
          const head = JSON.parse(line);
          location = { root: head.root, baseLayer: head.baseLayer, extension: head.extension };
          Object.assign(graph, location);
          if (mode === "stream") w = await design.writer(location);
          return;
        }
        const [path, record, outbound] = JSON.parse(line);
        n += 1;
        if (mode === "stream") await w.add(path, record, outbound);
        else graph.files[path] = { codePath: path, docPath: docPathOf(location, path), ...record, outbound, inbound: [] };
      };
      for (;;) {
        const { done, value } = await lines.read();
        if (done) break;
        buffer += value;
        let start = 0;
        for (let i = buffer.indexOf("\n"); i !== -1; i = buffer.indexOf("\n", start)) {
          await handle(buffer.slice(start, i));
          start = i + 1;
        }
        buffer = buffer.slice(start);
        const now = performance.now();
        longestGapMs = Math.max(longestGapMs, now - lastYield);
        lastYield = now;
      }
      await handle(buffer);
      if (mode === "gather") {
        const paths = Object.keys(graph.files).sort(comparePaths);
        for (const p of paths) for (const q of graph.files[p].outbound) graph.files[q].inbound.push(p);
      }
      const bytes = mode === "stream" ? await w.finish() : await design.encode(graph);
      const ms = performance.now() - t0;
      lastBytes = bytes;
      return { files: n, writeMs: ms, bytes: bytes.length, sha256: await hex(bytes), heapMb: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null };
    },
    /** After a write: the hash of the facts the written bytes hold, read back, as one canonical JSON text. */
    async contentHash() {
      const reader = await design.open(lastBytes);
      return hex(new TextEncoder().encode(canonical(await reader.all())));
    },
    /** Two small questions about the browser itself, asked once. */
    async platform() {
      const out = { fromBase64: typeof Uint8Array.fromBase64 === "function", userAgent: navigator.userAgent };
      const gz = async (text) => new Uint8Array(await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());
      const two = new Uint8Array([...(await gz("hello\n")), ...(await gz("world\n"))]);
      try {
        out.twoGzipMembers = await new Response(new Blob([two]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
      } catch (error) {
        out.twoGzipMembers = `refused: ${String(error).slice(0, 120)}`;
      }
      out.indexedDB = await new Promise((resolve) => {
        try {
          const request = indexedDB.open("stored-form-probe");
          request.onsuccess = () => resolve("opens");
          request.onerror = () => resolve(`error: ${request.error}`);
        } catch (error) {
          resolve(`throws: ${String(error).slice(0, 120)}`);
        }
      });
      // The same input through Chromium's own deflate, to hold against Node's.
      const sample = new TextEncoder().encode(JSON.stringify({ a: "the same input through two compressors", n: [1, 2, 3] }).repeat(2000));
      out.deflateRawOfSample = await hex(new Uint8Array(await new Response(new Blob([sample]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer()));
      out.gzipOfSample = await hex(new Uint8Array(await new Response(new Blob([sample]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer()));
      return out;
    }
  };
  void lastGraph;
}
