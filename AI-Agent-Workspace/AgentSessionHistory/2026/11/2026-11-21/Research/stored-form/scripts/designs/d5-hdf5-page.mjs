// Research of November 21, 2026 (not product code). The array file in a page, through h5wasm's browser build, whose
// script carries its WebAssembly inline (3.55 MB of it). The bundler is pointed at h5wasm's dist/esm/hdf5_hl.js under
// the name "h5wasm-esm".
import h5wasm from "h5wasm-esm";
import { encodeWith, openWith } from "./hdf5-core.mjs";

export const name = "hdf5 (h5wasm)";
export const encode = (graph) => encodeWith(h5wasm, graph);
export const open = (bytes) => openWith(h5wasm, bytes);
