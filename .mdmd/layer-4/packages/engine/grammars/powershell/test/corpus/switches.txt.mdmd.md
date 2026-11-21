# `packages/engine/grammars/powershell/test/corpus/switches.txt`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/grammars/powershell/test/corpus/switches.txt`
- Generated At: 2026-11-21T02:25:18.477Z

## Authored
### Purpose
Corpus tests, in tree-sitter's format, for the patch's reading of a switch label written in quotes.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- Each test is a title between `===` lines, PowerShell source, a `---` line, and the tree of named nodes the grammar must produce. Run only by [`build.sh`](../../build.sh.mdmd.md), which copies this file beside upstream's corpus and runs `tree-sitter test` before building the wasm; no npm suite or CI job runs it.
- One test of [`grammar.patch`](../../grammar.patch.mdmd.md): `"In Progress" { }` and `'Read-intent only' { }` read as one string label each, where upstream's bare-word token took `"In` for a label and lost the switch; a bare `Done { }` stays a bare word. dbatools labels its switches so, and its `switch -regex` labels too (`"^\[(.+)\]\s*$" {`).
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
