// Research of November 21, 2026 (not product code). "The ledger": a scan's facts as sorted lines of text, one fact per
// line (ledger-core.mjs), gzipped. Its first line names the format and where the docs would be.
import { compress, concat, decoder, encoder, inflate, walk } from "./common.mjs";
import { LedgerText, ledgerBytes, linesOf, recordFrom } from "./ledger-core.mjs";

export const name = "ledger";

export function text(graph) {
  return concat([encoder.encode(`${JSON.stringify(["live-docs-ledger/1", { root: graph.root, baseLayer: graph.baseLayer, extension: graph.extension }])}\n`), ledgerBytes(graph)]);
}

export async function encode(graph) {
  return compress(text(graph), "gzip");
}

/**
 * Written as the facts arrive, in path order: each file's lines go straight into one gzip stream and nothing of the
 * file is kept. The ledger stores no adjacency, so nothing is left to do at the end but close the stream. The same
 * facts give the same bytes as `encode`, since the stream is the same text.
 */
export function writer(location) {
  const stream = new CompressionStream("gzip");
  const input = stream.writable.getWriter();
  const chunks = [];
  const reading = (async () => {
    const r = stream.readable.getReader();
    for (;;) {
      const { done, value } = await r.read();
      if (done) return;
      chunks.push(value);
    }
  })();
  let last;
  input.write(encoder.encode(`${JSON.stringify(["live-docs-ledger/1", location])}\n`));
  return {
    async add(path, record) {
      if (last !== undefined && last >= path) throw new Error(`facts out of path order at ${path}`);
      last = path;
      const lines = linesOf({ files: { [path]: record } }, [path]);
      await input.write(encoder.encode(`${lines.join("\n")}\n`));
    },
    /** What has come out of the stream so far: what a file being appended to holds if the writing stops now. */
    emitted: () => concat(chunks),
    async finish() {
      await input.close();
      await reading;
      return concat(chunks);
    }
  };
}

export async function open(bytes) {
  const whole = decoder.decode(await inflate(bytes, "gzip"));
  const firstBreak = whole.indexOf("\n");
  const [, location] = JSON.parse(whole.slice(0, firstBreak));
  const ledger = new LedgerText(whole.slice(firstBreak + 1));
  const outboundOf = (path) => [...new Set(ledger.linesOf(path).filter((l) => l[1] === "G" && l[6] !== null && l[6] !== path).map((l) => l[6]))].sort();
  return {
    paths: async () => ledger.paths(),
    // A grep: every line that holds the quoted path, kept when it is an edge whose target is that path.
    inbound: async (path) => [...new Set(ledger.grep(JSON.stringify(path)).filter((l) => l[1] === "G" && l[6] === path && l[0] !== path).map((l) => l[0]))].sort(),
    outbound: async (path) => outboundOf(path),
    reachable: async (path) => walk(path, outboundOf),
    records: async (list) => list.map((p) => recordFrom(ledger.linesOf(p))),
    all: async () => ledger.graph(location)
  };
}
