// Stands beside `web-tree-sitter` in the scanning page: the real runtime, whose `.wasm` files are loaded from bytes the
// page holds, since a page has no file system to load a path from. The engine names a grammar by its path
// (`grammarFile`, `adapters/treeSitter.ts`); the page puts each grammar into the stand-in for `node:fs` at the path the
// engine names, so that the engine's own choice between its build of a grammar and the bundled one is made as under
// Node, and here the bytes are taken from that path. `locateFile` keeps emscripten from building a URL from
// `import.meta.url`, which a classic script has not; the runtime's own bytes come as `wasmBinary`, so nothing is
// fetched. The build points the name `real-web-tree-sitter` at the package itself.
import * as real from "real-web-tree-sitter";

import { counted } from "./calls.mjs";
import { ENGINE_ROOT } from "./engine-root.mjs";
import { tree } from "./fs.mjs";

/** Where the page puts the runtime's own `.wasm`, among the grammars. */
const RUNTIME_WASM = `${ENGINE_ROOT}/node_modules/web-tree-sitter/web-tree-sitter.wasm`;

const init = real.Parser.init.bind(real.Parser);
real.Parser.init = counted("web-tree-sitter.Parser.init", (options) => init({ ...options, locateFile: (name) => name, wasmBinary: tree.bytes(RUNTIME_WASM) }));

const load = real.Language.load.bind(real.Language);
real.Language.load = counted("web-tree-sitter.Language.load", (input) => {
  if (typeof input !== "string") return load(input);
  const bytes = tree.bytes(input);
  if (!bytes) throw new Error(`the scanning page holds no grammar at ${input}: add it to the grammars of tests/page-scan/build-page.mjs`);
  return load(bytes);
});

export * from "real-web-tree-sitter";
