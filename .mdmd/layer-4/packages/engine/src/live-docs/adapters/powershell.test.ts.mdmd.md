# packages/engine/src/live-docs/adapters/powershell.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/powershell.test.ts
- Generated At: 2026-10-16T16:49:36.571Z

## Authored
### Purpose
The PowerShell adapter's unit tests, over the compendium fixture and files written into a temporary workspace whose files are its index, with no PowerShell installed: the compendium's functions, help, dependencies and program marks; a file read by its byte order mark; functions, filters, workflows, nested functions, classes and enums at their keywords, a class's members and text inside strings not taken for functions; where help is found and when a block is not help; `Export-ModuleMember`'s narrowing, by comma lists too, and none when a pattern is not written out or the command is misread; `Import-Module`'s binding; resolution through `$PSScriptRoot` written either way, relative paths, bare words that begin with a variable and module directories, without regard to case; `using` statements; `#requires`; and module manifests, their module, what they name and the root module they declare, against data files.

### Notes
- Rewritten on 2026-10-16 when the adapter moved to the grammar ([Turn 3 of the October 16 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)); the tests of the `pwsh` adapter skipped without a runtime, and what they asserted is kept here. Extended the same day with the engine's own grammar ([Turn 4](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-4)): comma lists, classes and enums, manifests, resolution as Windows resolves and the byte order mark. Their expectations were checked against PowerShell 7.5.4's parser on the same snippets through the oracle. Two expectations are a reading's choice rather than PowerShell's answer, and say so: an `Export-ModuleMember` the grammar cannot read in full narrows nothing, shown with an assembly-qualified type name, a construct the grammar still reads with an error; and one whose pattern is not written out narrows nothing, which the oracle's published list does too.

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
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
