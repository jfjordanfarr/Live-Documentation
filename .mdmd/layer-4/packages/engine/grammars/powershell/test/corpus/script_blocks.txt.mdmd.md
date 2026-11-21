# `packages/engine/grammars/powershell/test/corpus/script_blocks.txt`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/grammars/powershell/test/corpus/script_blocks.txt`
- Generated At: 2026-11-21T02:25:18.474Z

## Authored
### Purpose
Corpus tests, in tree-sitter's format, for the patch's changes to script blocks: one may be empty, and a semicolon may end a named block.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- Each test is a title between `===` lines, PowerShell source, a `---` line, and the tree of named nodes the grammar must produce. Run only by [`build.sh`](../../build.sh.mdmd.md), which copies this file beside upstream's corpus and runs `tree-sitter test` before building the wasm; no npm suite or CI job runs it.
- Two tests of [`grammar.patch`](../../grammar.patch.mdmd.md): `Mock Stop-Function { }` and `{}` as a command's argument read as an empty `script_block_expression`, where upstream required a statement inside and lost the block, often with the Pester block around it; and `begin { };process { };` reads as two named blocks, where upstream allowed nothing between them.
- Written on 2026-11-19, failing first against the grammar as it stood, when the grammar was graded against PowerShell's own parser over five public PowerShell corpora. The named-block case is tSQLt's `Build/CommonFunctionsAndMethods.psm1`; without it, mending the empty block made the grammar lose that whole file and its function `Replace-InFile` ([the probe](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md#the-grammars-idioms-mended-added-november-19-2026-night)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
