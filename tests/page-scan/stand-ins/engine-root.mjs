// Where the scanning page puts the files the engine finds beside its own code, its grammars and the tree-sitter
// runtime, under the repository's own layout: the engine's `__dirname` and `require.resolve` answer under this root,
// as the build defines them, and the scanned folder lies apart from it, at `/ws`. Read by the build and the stand-ins.
export const ENGINE_ROOT = "/live-documentation";
