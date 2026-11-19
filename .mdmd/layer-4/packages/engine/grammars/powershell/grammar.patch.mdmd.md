# packages/engine/grammars/powershell/grammar.patch

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/grammars/powershell/grammar.patch
- Generated At: 2026-10-22T00:39:37.183Z

## Authored
### Purpose
This project's changes to Airbus CERT's `tree-sitter-powershell`, so that it reads what PowerShell scripts commonly write and the upstream grammar cannot; `build.sh` applies it to the pinned commit before building the wasm the engine loads.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- A unified diff against upstream commit `e7bd348c` (pinned in [`upstream.env`](./upstream.env.mdmd.md)), applied by [`build.sh`](./build.sh.mdmd.md) with `git apply`, so it must apply cleanly to that commit: moving the pin means re-cutting it.
- Ten rules, all in `grammar.js`: a `command_argument_list` for a comma list in argument mode whose elements may be bare words (`Export-ModuleMember -Function A, B`), a list of expressions alone staying an `array_literal_expression`; a `generic_token` that may begin with a variable followed at once by path characters (`$PSScriptRoot\x.psm1`); `/` in a dot-sourced path; a `using_statement` (`using namespace`, `using module` by name, path, string or module specification, `using assembly`) before the param block, with `using-` among the command names that begin with a keyword so that `Using-Thing` stays a command; a program that may be empty, only comments or only a `param()`; a native command's `--name=value` as one `command_parameter`; and an expandable string's text outranking a block comment, so that `"<#PSScriptInfo"` opens none; a script block that may be empty (`Mock Stop-Function { }`); an `attributed_expression`, an attribute with arguments before an expression even on the line before it (`[SuppressMessageAttribute('Rule', '')]` then `$x = 1`), declared in conflict with a param block's attributes so that both readings are tried; and named blocks a semicolon may end (`process { };`). It also adds the four new keywords to upstream's `queries/highlights.scm`, which the engine never loads, since it loads only the wasm.
- Each rule is proved by the corpus tests under `test/corpus/` ([command arguments](./test/corpus/command_arguments.txt.mdmd.md), [scripts](./test/corpus/scripts.txt.mdmd.md), [using statements](./test/corpus/using_statements.txt.mdmd.md), [assignments](./test/corpus/assignments.txt.mdmd.md), [script blocks](./test/corpus/script_blocks.txt.mdmd.md); 21 in all), which `build.sh` runs beside upstream's 147; a change here without a test beside it is unproven. The PowerShell adapter reads the `using_statement`, `command_argument_list` and `attributed_expression` nodes by name ([powershell.ts](../../src/live-docs/adapters/powershell.ts.mdmd.md)), so renaming a node here breaks its reading.
- Measured on 2026-10-16 over the 56 PowerShell files on the development machine outside the repository (39,128 lines): files with no parse error rose from 33 to 43 and innermost errors fell from 140 to 44, with parse time unchanged. The last two rules came from that measurement: constructs after which upstream's error recovery swallowed the rest of the file.
- Measured again on 2026-11-19 against PowerShell's own parser over five public corpora (dbatools, AL-Go, AzureStack-Tools, tSQLt and a small shop's scripts; 2,073 `.ps1` and `.psm1` files): the last three rules bring the files with any error node from 207 to 113, none newly in error, and leave the functions PowerShell sees that the grammar does not at the same 10. Without the named-block rule, the empty-block rule made upstream's recovery lose a whole tSQLt module; with the attribute in the assignment's target rather than in an expression, it lost five AzureStack functions ([the probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md#the-grammars-idioms-mended-added-november-19-2026-night)).
- Written to be offered upstream with its corpus tests; once a release carries them, this folder is deleted and the engine loads the bundled grammar again, or the pin moves to that release and the patch empties. Offering it was left open at the end of that session ([its summary's open ends](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/Summarized/2026-10-16.1.SUMMARIZED.md#open-ends)).
- Began with the grammar on 2026-10-16 (`dc60acba`), when the owner asked for a grammar that reads what an estate's scripts write rather than an adapter landed on the bundled grammar's holes ([Turn 4 of the October 16 session](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-4); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#powershell-read-by-a-grammar-of-our-own-measured-against-powershells-own-parser-recorded-2026-10-16), which describes each rule in prose). Gained a Live Doc on 2026-10-22 ([Turn 8 of the October 21 session](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-21/2026-10-21.1.record.md#turn-8)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
