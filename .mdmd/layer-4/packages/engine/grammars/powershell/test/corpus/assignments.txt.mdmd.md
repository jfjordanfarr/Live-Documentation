# `packages/engine/grammars/powershell/test/corpus/assignments.txt`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/grammars/powershell/test/corpus/assignments.txt`
- Generated At: 2026-11-21T02:25:18.468Z

## Authored
### Purpose
Corpus tests, in tree-sitter's format, for the patch's reading of an attribute with arguments before an expression, as `[SuppressMessageAttribute(...)]` stands on the line before an assignment.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- Each test is a title between `===` lines, PowerShell source, a `---` line, and the tree of named nodes the grammar must produce. Run only by [`build.sh`](../../build.sh.mdmd.md), which copies this file beside upstream's corpus and runs `tree-sitter test` before building the wasm; no npm suite or CI job runs it.
- Two tests of [`grammar.patch`](../../grammar.patch.mdmd.md): `[Diagnostics.CodeAnalysis.SuppressMessageAttribute(...)]` on the line before `$ALGoFolderName = '.AL-Go'` reads as an `attributed_expression` holding the variable, where upstream allowed an attribute with arguments only in a param block and lost the statement; and `[CmdletBinding()]` then `[OutputType(...)]` before `param` still belong to the param block, which a first form of the mend, given a fixed precedence, took for an attributed expression.
- Written on 2026-11-19, failing first against the grammar as it stood, when the grammar was graded against PowerShell's own parser over five public PowerShell corpora: this idiom was the first error in 43 files, mostly AL-Go's ([the probe](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md#the-grammars-idioms-mended-added-november-19-2026-night)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
