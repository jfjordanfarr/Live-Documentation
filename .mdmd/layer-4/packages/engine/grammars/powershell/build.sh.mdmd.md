# packages/engine/grammars/powershell/build.sh

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/grammars/powershell/build.sh
- Generated At: 2026-10-22T00:39:37.171Z

## Authored
### Purpose
Rebuilds `tree-sitter-powershell.wasm`, the PowerShell grammar the engine parses with, from Airbus CERT's `tree-sitter-powershell` at the commit `upstream.env` pins with `grammar.patch` applied, and writes nothing unless upstream's corpus tests and this folder's all pass.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- Run by hand, from any directory, after `npm ci` at the repository root has installed the `tree-sitter-cli` the root `package.json` pins (0.27.1); it also needs git, Node and a C compiler. The CLI fetches its own wasm toolchain (wasi-sdk 34 and binaryen 132) into `~/.cache/tree-sitter` on the first build, so no Emscripten is needed ([the container notes](../../../../../../.devcontainer/README.md#the-engines-powershell-grammar)). No npm script, test suite or CI workflow runs it: every run of the engine and every test uses the committed wasm.
- In order, it sources [`upstream.env`](./upstream.env.mdmd.md); fetches exactly that commit into a temporary folder with `core.autocrlf` off, so that a host set up for Windows line endings cannot change the grammar's text or the corpus's expected trees; applies [`grammar.patch`](./grammar.patch.mdmd.md); copies in this folder's corpus files ([command arguments](./test/corpus/command_arguments.txt.mdmd.md), [scripts](./test/corpus/scripts.txt.mdmd.md), [using statements](./test/corpus/using_statements.txt.mdmd.md)), stopping if one would replace a corpus file of upstream's; runs `tree-sitter generate` and `tree-sitter test`, upstream's 147 trees and these 17, stopping on any failure; then builds [the wasm](./tree-sitter-powershell.wasm.mdmd.md) into this folder and copies upstream's `LICENSE` beside it. Those two files are all it writes here; the temporary folder is removed on exit.
- The same CLI and the same patch give the same bytes: two builds on 2026-10-16 were byte-identical, and the committed wasm still has their SHA-256, beginning `9626b334` (checked 2026-10-22). A rebuild that changes the wasm therefore means the CLI, the pin or the patch changed, and the wasm is committed with that change.
- Began with the grammar folder on 2026-10-16 (`dc60acba`). The bundled grammar could not read a command's comma list, an unquoted path that begins with a variable, or `using` statements, and its error recovery could swallow every statement after one; shown the choice between landing the tree-sitter adapter with those holes recorded and building a grammar first, the owner asked for the durable shape, "What is the right final shape? Build that, and then commit it." ([Turn 4 of the October 16 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-4); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#powershell-read-by-a-grammar-of-our-own-measured-against-powershells-own-parser-recorded-2026-10-16)). The first plan needed Emscripten; `tree-sitter-cli` 0.27.1 compiles with its own toolchain, so pinning the CLI pins the toolchain. Gained a Live Doc on 2026-10-22, when discovery's default became every file outside the owner's list of files never to document, with a stub where no reader exists ([Turn 8 of the October 21 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
