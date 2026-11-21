// Research of November 21, 2026 (not product code). "The ledger": a scan's facts as sorted lines of text, one fact per
// line (ledger-core.mjs), gzipped. Its first line names the format and where the docs would be.
import { compress, concat, decoder, encoder, inflate, walk } from "./common.mjs";
import { LedgerText, ledgerBytes, recordFrom } from "./ledger-core.mjs";

export const name = "ledger";

export function text(graph) {
  return concat([encoder.encode(`${JSON.stringify(["live-docs-ledger/1", { root: graph.root, baseLayer: graph.baseLayer, extension: graph.extension }])}\n`), ledgerBytes(graph)]);
}

export async function encode(graph) {
  return compress(text(graph), "gzip");
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
