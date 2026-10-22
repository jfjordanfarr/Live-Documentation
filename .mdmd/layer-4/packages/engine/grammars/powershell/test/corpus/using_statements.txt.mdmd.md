# packages/engine/grammars/powershell/test/corpus/using_statements.txt

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/grammars/powershell/test/corpus/using_statements.txt
- Generated At: 2026-10-22T00:39:37.224Z

## Authored
### Purpose
Corpus tests, in tree-sitter's format, for the `using` statements the patch adds to the grammar: `using namespace`, `using module` and `using assembly` at the start of a script.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- Each test is a title between `===` lines, PowerShell source, a `---` line, and the tree of named nodes the grammar must produce. Run only by [`build.sh`](../../build.sh.mdmd.md), which copies this file beside upstream's corpus and runs `tree-sitter test` before building the wasm; no npm suite or CI job runs it.
- Five tests of [`grammar.patch`](../../grammar.patch.mdmd.md): the three kinds by bare name or path; `using module` by string and by module specification (`@{ ModuleName = 'Tools' }`); `using` before `[CmdletBinding()]` and `param(...)`, which upstream, lacking the statement, read as a command followed by an expression full of errors; several on one line ended by semicolons, each semicolon belonging to its statement rather than to an empty one; and `Using-Thing -Name x`, a command whose name begins with the keyword, staying a command.
- The [PowerShell adapter](../../../../src/live-docs/adapters/powershell.ts.mdmd.md) reads `using module` from the `using_statement` node, by name, string, module specification or path, as a dependency of the script.
- Began with the grammar on 2026-10-16 (`dc60acba`), written with the patch so that each rule is proved and the two can be offered upstream together ([the decision](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#powershell-read-by-a-grammar-of-our-own-measured-against-powershells-own-parser-recorded-2026-10-16); [Turn 4 of the October 16 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-4)). Gained a Live Doc on 2026-10-22 ([Turn 8 of the October 21 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)): [Turn 5](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-5) had first judged the corpus files outside "within reason", and [Turn 6](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-6) brought them in, since `build.sh` runs them and each proves a change the patch makes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
