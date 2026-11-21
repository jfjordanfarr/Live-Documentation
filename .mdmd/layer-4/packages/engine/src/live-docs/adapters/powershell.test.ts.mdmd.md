# `packages/engine/src/live-docs/adapters/powershell.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/adapters/powershell.test.ts`
- Generated At: 2026-11-21T02:25:18.948Z

## Authored
### Purpose
The PowerShell adapter's unit tests, over the compendium fixture and files written into a temporary workspace whose files are its index, with no PowerShell installed: the compendium's functions, help, dependencies and program marks; a file read by its byte order mark; functions, filters, workflows, nested functions, classes and enums at their keywords, a class's members and text inside strings not taken for functions; where help is found and when a block is not help; `Export-ModuleMember`'s narrowing, by comma lists too, and none when a pattern is not written out or the command is misread; `Import-Module`'s binding; resolution through `$PSScriptRoot` written either way, relative paths, bare words that begin with a variable and module directories, without regard to case; `using` statements; `#requires`; module manifests, their module, what they name, the root module they declare and the functions they offer, against data files; each clause of the rule that wires a call to the file defining the function ("loaded, else unique"); each kind of load the text fixes (`Join-Path`, a variable assigned once, a loop over `Get-ChildItem`, a script run by its path); and which scripts are libraries rather than programs.

### Notes
- Rewritten on 2026-10-16 when the adapter moved to the grammar ([Turn 3 of the October 16 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3)); the tests of the `pwsh` adapter skipped without a runtime, and what they asserted is kept here. Extended the same day with the engine's own grammar ([Turn 4](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-4)): comma lists, classes and enums, manifests, resolution as Windows resolves and the byte order mark. Their expectations were checked against PowerShell 7.5.4's parser on the same snippets through the oracle. Two expectations are a reading's choice rather than PowerShell's answer, and say so: an `Export-ModuleMember` the grammar cannot read in full narrows nothing, shown with an assembly-qualified type name, a construct the grammar still reads with an error; and one whose pattern is not written out narrows nothing, which the oracle's published list does too.
- The calls, loads, libraries and manifest offers were added on 2026-11-19 with the rule ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)). Thirteen of the eighteen new tests failed against the adapter before it (`8d31ff04`). Of the five that passed there, three guard against drawing too much (a caller's own name, two definitions loaded, two in the workspace and none loaded) and failed against a mutation that wires every call to the first file defining its name; the other two hold programs as programs: scripts that run something, call something on an assignment's left, hold text the grammar cannot read, or define nothing, and the library rule's two measured misses, pinned, a helper that imports inside an `if` and an include that only assigns a variable. Two compendium expectations gained the functions their scripts call there.
- Since the joining of 2026-11-21 ([the work item](../../../../../../../AI-Agent-Workspace/Work/readers-on-main.md)): the loads the reader draws nothing for are said as notices, a dot-source or import whose path the text does not fix by its line and command, and a built path no file of the workspace holds by the path, while a load a loop reads and a script block run in the caller's scope say nothing, red with the loop's mark of what it read taken out; and the archetype the index carries (`archetypeOf`) decides whether a definition is a test's, red with the reader asking the default configuration alone. The case of a definition inside text the grammar cannot read takes its tree through `readTree`, the one way to a tree.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path` - `path`
- [`powershell.analyzePowerShellSource`](./powershell.ts.mdmd.md#symbol-analyzepowershellsource)
- [`powershell.powershellAdapter`](./powershell.ts.mdmd.md#symbol-powershelladapter)
- [`treeSitter.SyntaxNode`](./treeSitter.ts.mdmd.md#symbol-syntaxnode)
- [`treeSitter.readTree`](./treeSitter.ts.mdmd.md#symbol-readtree)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
