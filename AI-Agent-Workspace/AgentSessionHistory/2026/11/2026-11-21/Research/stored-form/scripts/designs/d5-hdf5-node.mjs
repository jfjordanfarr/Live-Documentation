// Research of November 21, 2026 (not product code). The array file in Node, through h5wasm's Node build: WebAssembly,
// nothing compiled. The library is installed in a scratch folder, named by the H5WASM environment variable (the path
// of its dist/node/hdf5_hl.js). Its Node build works on the real file system, not in memory, so the file is written
// into the folder H5DIR names and read back from there.
import { encodeWith, openWith } from "./hdf5-core.mjs";

export const name = "hdf5 (h5wasm)";
const h5wasm = (await import(process.env.H5WASM ?? "h5wasm/node")).default;

const dir = process.env.H5DIR ?? (await import("node:os")).tmpdir();
export const encode = (graph) => encodeWith(h5wasm, graph, dir);
export const open = (bytes) => openWith(h5wasm, bytes, dir);
