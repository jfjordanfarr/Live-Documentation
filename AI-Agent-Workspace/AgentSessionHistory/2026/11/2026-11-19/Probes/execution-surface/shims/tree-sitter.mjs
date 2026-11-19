// Scratch shim for the probe: the real web-tree-sitter, with the runtime and every grammar handed over as bytes the
// page holds, since a page has no file system to load a `.wasm` path from. The build aliases `real-web-tree-sitter`.
import * as real from "real-web-tree-sitter";
const originalInit = real.Parser.init.bind(real.Parser);
// locateFile keeps emscripten from building a URL from import.meta.url, which a classic script does not have; the
// bytes themselves come from wasmBinary, so nothing is fetched.
real.Parser.init = (options) => originalInit({ ...(options ?? {}), locateFile: (name) => name, wasmBinary: globalThis.__liveDocsWasm["web-tree-sitter.wasm"] });
const originalLoad = real.Language.load.bind(real.Language);
real.Language.load = (input) => {
  if (typeof input !== "string") return originalLoad(input);
  const name = input.split("/").pop();
  const bytes = globalThis.__liveDocsWasm[name];
  if (!bytes) throw new Error(`grammar ${name} is not in the page`);
  return originalLoad(bytes);
};
export * from "real-web-tree-sitter";
