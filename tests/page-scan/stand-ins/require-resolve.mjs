// Stands in for CommonJS's `require.resolve` in the scanning page, which the build puts in its place (esbuild's
// `define` and `inject`): a package's file named by where the repository keeps it, under the root the page puts the
// engine's files at. `adapters/treeSitter.ts` asks it for `@vscode/tree-sitter-wasm/package.json`.
import { counted } from "./calls.mjs";
import { ENGINE_ROOT } from "./engine-root.mjs";

export const requireResolve = counted("require.resolve", (specifier) => `${ENGINE_ROOT}/node_modules/${specifier}`);
