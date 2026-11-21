// Research of November 21, 2026 (not product code). "The array file": the owner's HDF5, holding the press's own
// sections as named datasets, each chunked and deflated by HDF5's own filter, so that HDF5 rather than our layout
// provides the container, the table of contents and the partial reads. The adjacency is kept as four arrays of
// unsigned 32-bit numbers, which any HDF5 tool shows as the graph's wires:
//
//   /header                      the press's header, as JSON text
//   /paths                       every path, as the press writes them (bytes)
//   /adjacency/out_offsets, out_targets, in_offsets, in_targets     uint32
//   /strings/<k>, /records/<k>   the press's string blocks and record chunks (bytes)
//
// Strings are held as bytes because h5wasm refuses to compress variable-length strings.
import { concat, u32Array, u32Bytes } from "./common.mjs";
import { encode as encodePress, reader } from "./d1-press.mjs";

const CHUNK_BYTES = 1 << 16;

function put(file, name, data, dtype) {
  const options = { name, data, shape: [data.length], dtype };
  if (data.length > 0) Object.assign(options, { chunks: [Math.min(data.length, dtype === "<I" ? CHUNK_BYTES / 4 : CHUNK_BYTES)], compression: 6 });
  file.create_dataset(options);
}

export async function encodeWith(h5wasm, graph, dir = "") {
  const { FS } = await h5wasm.ready;
  const { header, sections } = await encodePress(graph, { raw: true });
  const name = `${dir}/facts-${Math.random().toString(36).slice(2)}.h5`;
  const file = new h5wasm.File(name, "w");
  file.create_dataset({ name: "header", data: JSON.stringify(header) });
  put(file, "paths", sections[0], "<B");
  const adjacency = sections[1];
  const [outCount, inCount] = u32Array(adjacency, 0, 2);
  const n = header.files + 1;
  let at = 8;
  file.create_group("adjacency");
  const take = (count) => { const a = u32Array(adjacency, at, count); at += count * 4; return a; };
  put(file, "adjacency/out_offsets", take(n), "<I");
  put(file, "adjacency/out_targets", take(outCount), "<I");
  put(file, "adjacency/in_offsets", take(n), "<I");
  put(file, "adjacency/in_targets", take(inCount), "<I");
  const blocks = header.sections.stringBlocks.length;
  file.create_group("strings");
  for (let k = 0; k < blocks; k += 1) put(file, `strings/${k}`, sections[2 + k], "<B");
  file.create_group("records");
  header.sections.chunks.forEach((_, k) => put(file, `records/${k}`, sections[2 + blocks + k], "<B"));
  file.close();
  const bytes = FS.readFile(name);
  FS.unlink(name);
  return bytes;
}

export async function openWith(h5wasm, bytes, dir = "") {
  const { FS } = await h5wasm.ready;
  const name = `${dir}/read-${Math.random().toString(36).slice(2)}.h5`;
  FS.writeFile(name, bytes);
  const file = new h5wasm.File(name, "r");
  const header = JSON.parse(file.get("header").value);
  const value = (path) => file.get(path).value;
  const load = async (section) => {
    if (section === "adjacency") {
      const [oo, ot, io, it] = ["out_offsets", "out_targets", "in_offsets", "in_targets"].map((k) => (file.get(`adjacency/${k}`).shape[0] === 0 ? new Uint32Array(0) : new Uint32Array(value(`adjacency/${k}`))));
      return concat([u32Bytes([ot.length, it.length]), u32Bytes(oo), u32Bytes(ot), u32Bytes(io), u32Bytes(it)]);
    }
    return file.get(section).shape[0] === 0 ? new Uint8Array(0) : new Uint8Array(value(section));
  };
  return reader(null, header, {
    pathsSection: "paths",
    adjacencySection: "adjacency",
    blocks: header.sections.stringBlocks.map((_, k) => `strings/${k}`),
    chunks: header.sections.chunks.map((_, k) => `records/${k}`)
  }, load);
}
