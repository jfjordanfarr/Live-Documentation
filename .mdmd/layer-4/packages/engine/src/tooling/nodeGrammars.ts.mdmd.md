# `packages/engine/src/tooling/nodeGrammars.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/nodeGrammars.ts`
- Generated At: 2026-11-24T07:54:04.570Z

## Authored
### Purpose
Implements `GrammarHost` (`workspaceFiles.ts`) for Node by reading `web-tree-sitter.wasm` and compiled language `.wasm` binaries from disk as `Uint8Array` bytes, preferring the engine's own patched builds under `packages/engine/grammars/<name>/` over `@vscode/tree-sitter-wasm`.

### Notes
- Written on 2026-11-24 for Step 7 of [the road to one engine for a page and a command line](../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road), moving `__dirname`, `require.resolve`, and disk reads out of `adapters/treeSitter.ts` so the browser scan path needs no `web-tree-sitter`, `require-resolve`, or `engine-root` stand-ins.
- Reads the engine's own patched build directly via `fs.promises.readFile` and rethrows machine failures (`throwIfMachineFailure`) rather than falling back silently to an unpatched bundled grammar.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `NODE_GRAMMAR_HOST` {#symbol-node_grammar_host}
- Type: const
- Source: [source](../../../../../../packages/engine/src/tooling/nodeGrammars.ts#L41)
- Returns: [`GrammarHost`](./workspaceFiles.ts.mdmd.md#symbol-grammarhost)

##### `NODE_GRAMMAR_HOST` — Summary
The Node disk {@link GrammarHost}: supplies `web-tree-sitter.wasm` and grammar `.wasm` files as bytes.

#### `registerNodeGrammars` {#symbol-registernodegrammars}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/nodeGrammars.ts#L47)

##### `registerNodeGrammars` — Summary
Registers {@link NODE_GRAMMAR_HOST} as the active tree-sitter grammar host for the current Node process.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`treeSitter.setGrammarHost`](../live-docs/adapters/treeSitter.ts.mdmd.md#symbol-setgrammarhost)
- [`sourceText.throwIfMachineFailure`](./sourceText.ts.mdmd.md#symbol-throwifmachinefailure)
- [`workspaceFiles.GrammarHost`](./workspaceFiles.ts.mdmd.md#symbol-grammarhost) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
