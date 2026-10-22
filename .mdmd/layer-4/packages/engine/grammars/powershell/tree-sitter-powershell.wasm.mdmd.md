# packages/engine/grammars/powershell/tree-sitter-powershell.wasm

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: packages/engine/grammars/powershell/tree-sitter-powershell.wasm
- Generated At: 2026-10-22T00:39:37.237Z

## Authored
### Purpose
The compiled PowerShell grammar the engine reads `.ps1`, `.psm1` and `.psd1` files with: Airbus CERT's `tree-sitter-powershell` with this project's patch, built by `build.sh` and committed so that a user of the engine builds nothing.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- Loaded by [treeSitter.ts](../../src/live-docs/adapters/treeSitter.ts.mdmd.md) through `web-tree-sitter`, for the [PowerShell adapter](../../src/live-docs/adapters/powershell.ts.mdmd.md): for the grammar named `powershell` the loader takes `grammars/powershell/tree-sitter-powershell.wasm` at the engine package's root when it exists, and otherwise the copy `@vscode/tree-sitter-wasm` bundles. The engine's `package.json` lists `grammars` among its published files, so the wasm ships with the package.
- The fallback is silent: were this file missing or renamed, the engine would read PowerShell with the bundled grammar and its holes. What would notice is the PowerShell cases of [`treeSitter.test.ts`](../../src/live-docs/adapters/treeSitter.test.ts.mdmd.md), which parse comma lists, variable-led paths and `using` statements and expect no error, and [`powershell-oracle.test.ts`](../../../../tests/integration/live-docs/powershell-oracle.test.ts.mdmd.md), whose empty register of misses the bundled grammar would fill.
- Never edited or replaced by hand: it is the output of [`build.sh`](./build.sh.mdmd.md) from [`upstream.env`](./upstream.env.mdmd.md) and [`grammar.patch`](./grammar.patch.mdmd.md), and a rebuild with the pinned `tree-sitter-cli` gives the same bytes; its SHA-256 begins `9626b334`, the hash two builds gave on 2026-10-16 (checked 2026-10-22). It is distributed under upstream's MIT licence, the `LICENSE` beside it, which `build.sh` copies from upstream. Its archetype is `asset` because its content is binary, the rule since 2026-10-16.
- Began with the grammar on 2026-10-16 (`dc60acba`), in place of the bundled grammar, which could not read a command's comma list, an unquoted path that begins with a variable, or `using` statements ([the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#powershell-read-by-a-grammar-of-our-own-measured-against-powershells-own-parser-recorded-2026-10-16); [Turn 4 of the October 16 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-4)). Gained a Live Doc on 2026-10-22: a generated file that something reads keeps a doc, which can say what builds it ([Turn 6](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-6) and [Turn 8 of the October 21 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
