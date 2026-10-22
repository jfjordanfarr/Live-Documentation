# packages/engine/grammars/powershell/test/corpus/command_arguments.txt

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/grammars/powershell/test/corpus/command_arguments.txt
- Generated At: 2026-10-22T00:39:37.195Z

## Authored
### Purpose
Corpus tests, in tree-sitter's format, for the patch's changes to how a command's arguments are read: comma lists of bare words, bare words that begin with a variable, a dot-sourced path written with `/`, and a native command's `--name=value`.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- Each test is a title between `===` lines, PowerShell source, a `---` line, and the tree of named nodes the grammar must produce. Run only by [`build.sh`](../../build.sh.mdmd.md), which copies this file beside upstream's corpus (refusing a name that would replace one of upstream's) and runs `tree-sitter test` before building the wasm; no npm suite or CI job runs it, so it is checked when, and only when, the grammar is rebuilt.
- Eight tests, each holding a rule of [`grammar.patch`](../../grammar.patch.mdmd.md): a comma list of bare words read as one `command_argument_list`, after a parameter and as the first argument; a list mixing bare words and expressions; a list continued on the next line after a trailing comma; a bare word that begins with a variable (`$PSScriptRoot\..\lib\Tools.psm1`, `${env:TEMP}/out.txt`) read as one `generic_token`; a dot-sourced path written with `/`; and `git log --pretty=oneline` read as one `command_parameter`, with the next statement intact. Two guard what the patch must leave alone: a list of expressions alone stays an `array_literal_expression`, and a variable followed by a member stays an expression.
- The comma list and the variable-led path are constructs the owner's Windows PowerShell estate uses every day (`Export-ModuleMember -Function A, B`, `Import-Module $PSScriptRoot\x.psm1`); the [PowerShell adapter](../../../../src/live-docs/adapters/powershell.ts.mdmd.md) reads the resulting nodes for what a module publishes and the files it loads. The `--name=value` case came instead from measuring the grammar over the PowerShell files on the development machine, where upstream's reading swallowed everything after it.
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
