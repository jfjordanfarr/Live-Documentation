# packages/engine/grammars/powershell/test/corpus/labels.txt

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/grammars/powershell/test/corpus/labels.txt
- Generated At: 2026-11-19T22:46:22.358Z

## Authored
### Purpose
Corpus tests, in tree-sitter's format, for the patch's reading of the loop label that `break` and `continue` name.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- Each test is a title between `===` lines, PowerShell source, a `---` line, and the tree of named nodes the grammar must produce. Run only by [`build.sh`](../../build.sh.mdmd.md), which copies this file beside upstream's corpus and runs `tree-sitter test` before building the wasm; no npm suite or CI job runs it.
- One test of [`grammar.patch`](../../grammar.patch.mdmd.md): `:main foreach (...) { continue main }` and `break outer` read the bare name as a `label`, where upstream allowed only `:main` or an expression after the keyword. PowerShell writes the label bare there, as dbatools' `continue main` does.
- Written on 2026-11-19, failing first against the grammar as it stood, when the grammar was graded against PowerShell's own parser over five public PowerShell corpora ([the probe](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md#more-of-the-grammars-idioms-added-november-19-2026-late-night)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
