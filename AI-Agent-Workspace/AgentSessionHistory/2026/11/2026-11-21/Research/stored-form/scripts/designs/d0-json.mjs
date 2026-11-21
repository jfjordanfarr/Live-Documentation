// Research of November 21, 2026 (not product code). The baseline to beat: the graph as one compact JSON text,
// gzipped by the platform's own CompressionStream. Everything is read to answer anything.
import { comparePaths, compress, decoder, encoder, inflate, recordOf, walk } from "./common.mjs";

export const name = "json-gzip";

export async function encode(graph) {
  return compress(encoder.encode(JSON.stringify(graph)), "gzip");
}

export async function open(bytes) {
  const graph = JSON.parse(decoder.decode(await inflate(bytes, "gzip")));
  const paths = Object.keys(graph.files).sort(comparePaths);
  return {
    paths: async () => paths,
    inbound: async (path) => graph.files[path].inbound,
    outbound: async (path) => graph.files[path].outbound,
    reachable: async (path) => walk(path, (p) => graph.files[p].outbound),
    records: async (list) => list.map((p) => recordOf(graph.files[p])),
    all: async () => graph
  };
}
