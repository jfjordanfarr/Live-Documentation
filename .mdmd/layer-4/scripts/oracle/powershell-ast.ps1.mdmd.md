# scripts/oracle/powershell-ast.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/powershell-ast.ps1
- Entry: program
- Generated At: 2026-10-22T16:47:57.783Z

## Authored
### Purpose
The oracle for the PowerShell adapter: reads the PowerShell files of a fixture's working copy with PowerShell's own parser and prints, as JSON, what it says about each (functions with their help and what the file publishes, the classes, enums and interfaces it defines, the commands that load and export, `using` statements, `#requires`, parse errors, and a `.psd1`'s table with the modules and scripts a manifest names), for `oracle:index` to keep whole and draw edges from.

### Notes
- History: written on 2025-11-20 as `scripts/powershell/emit-ast.ps1`, the PowerShell adapter's parser at generation time, compatible with Windows PowerShell 5.1; moved beside the adapter into the engine on 2026-09-27 so that the adapter shipped its own parser; brought back here and rewritten as the oracle on 2026-10-16, when the adapter moved to the grammar ([the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#powershell-read-by-a-grammar-of-our-own-measured-against-powershells-own-parser-recorded-2026-10-16); [Turn 3 of the October 16 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)). The rewrite binds `Import-Module` and `Export-ModuleMember` with PowerShell's `StaticParameterBinder`, where the emitter took every string after a command's name and joined a list into one string; reads `using module` by its name, which the emitter never recorded; and keeps every field of the help and every function definition, a class's members marked, where the emitter trimmed both.
- Extended the same day, when the adapter took what a reading of PowerShell owes ([Turn 4](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-4)): it records every type definition with its line and column, and a manifest reference's version (a module specification's `RequiredVersion`, else its `ModuleVersion`), so that the comparison measures classes, enums and manifests too. Its published list is a reading of the text: since that evening an `Export-ModuleMember` whose `-Function` is not written out (`-Function $public`), which only a run could read, leaves every function published, as the adapter does, so that a reading shows private functions rather than hiding public ones.
- Paths: a dot-source, module or `using module` path is resolved only when the text alone fixes it, a string or an expandable string whose only variable is `$PSScriptRoot`. A relative dot-source or `Import-Module` path is taken from the file's directory, as if the script ran from where it lies, the adapter's assumption too, since PowerShell resolves it against the caller's location at run time; `using module` and a manifest's entries are taken from the file's directory as PowerShell takes them. A directory names the `.psd1` or `.psm1` of its name inside it. Each name of a path is found as Windows finds it (`Find-Entry`): spelled exactly, or else the only entry whose name differs in case alone. `oracle:index` copies a fixture to a case-sensitive temporary folder, where `pwsh` itself would not find `Lib` for `lib`; the record says what an estate's Windows PowerShell would load.
- Needs PowerShell 7. A `using module` makes the parser load the named module while parsing, which runs its top-level code, so run it over fixtures, not over code you would not run. As a `.ps1` its doc carries `Entry: program`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Find-Entry` {#symbol-find-entry}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L48)

##### `Find-Entry` — Summary
The entry of a directory with the name given, as Windows finds it: the one spelled exactly, or else the only one whose name differs in case alone. $null when there is none, or several that differ in case alone.

#### `Resolve-FixtureFile` {#symbol-resolve-fixturefile}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L68)

##### `Resolve-FixtureFile` — Summary
The fixture-relative path, with forward slashes and spelled as on disk, of the file a path names, or $null when it names no file of the fixture.

#### `Get-StaticPath` {#symbol-get-staticpath}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L111)

##### `Get-StaticPath` — Summary
The text a string argument holds when the text alone fixes it: a constant, or an expandable string whose only variable is $PSScriptRoot, put in place. $null otherwise.

#### `Get-StaticStrings` {#symbol-get-staticstrings}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L132)

##### `Get-StaticStrings` — Summary
The strings an argument holds, flattening an array literal; $null when any part of it is not a string written out.

#### `Get-BoundParameters` {#symbol-get-boundparameters}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L157)

##### `Get-BoundParameters` — Summary
Every parameter PowerShell's static binder bound on a command, with the argument's text and the strings it holds, and what it could not bind.

#### `Get-CommentHelp` {#symbol-get-commenthelp}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L178)

##### `Get-CommentHelp` — Summary
A function's comment-based help as GetHelpContent returns it, each parameter under the key the help gives and the spelling the function declares.

#### `ConvertTo-SortedData` {#symbol-convertto-sorteddata}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L216)

##### `ConvertTo-SortedData` — Summary
A hashtable as JSON reads it: keys sorted, nested tables and arrays followed.

#### `Read-Script` {#symbol-read-script}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L235)

##### `Read-Script` — Summary
What the parser says about a script or a module.

#### `Read-DataFile` {#symbol-read-datafile}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L435)

##### `Read-DataFile` — Summary
What a data file says: its table as Import-PowerShellDataFile reads it, and each module, script or nested module a manifest's table names, with the version a module specification writes (its RequiredVersion, else its ModuleVersion), resolved against its directory.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../layer-3/architectural-decisions.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
