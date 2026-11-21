# `scripts/oracle/powershell-ast.ps1`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/powershell-ast.ps1`
- Entry: program
- Generated At: 2026-11-21T07:29:12.332Z

## Authored
### Purpose
The oracle for the PowerShell adapter: reads the PowerShell files of a fixture's working copy with PowerShell's own parser and prints, as JSON, what it says about each (functions with their help and what the file publishes, the classes, enums and interfaces it defines, the commands that load and export, `using` statements, `#requires`, parse errors, and a `.psd1`'s table with the modules and scripts a manifest names), for `oracle:index` to keep whole and draw edges from.

### Notes
- History: written on 2025-11-20 as `scripts/powershell/emit-ast.ps1`, the PowerShell adapter's parser at generation time, compatible with Windows PowerShell 5.1; moved beside the adapter into the engine on 2026-09-27 so that the adapter shipped its own parser; brought back here and rewritten as the oracle on 2026-10-16, when the adapter moved to the grammar ([the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#powershell-read-by-a-grammar-of-our-own-measured-against-powershells-own-parser-recorded-2026-10-16); [Turn 3 of the October 16 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3)). The rewrite binds `Import-Module` and `Export-ModuleMember` with PowerShell's `StaticParameterBinder`, where the emitter took every string after a command's name and joined a list into one string; reads `using module` by its name, which the emitter never recorded; and keeps every field of the help and every function definition, a class's members marked, where the emitter trimmed both.
- Extended the same day, when the adapter took what a reading of PowerShell owes ([Turn 4](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-4)): it records every type definition with its line and column, and a manifest reference's version (a module specification's `RequiredVersion`, else its `ModuleVersion`), so that the comparison measures classes, enums and manifests too. Its published list is a reading of the text: since that evening an `Export-ModuleMember` whose `-Function` is not written out (`-Function $public`), which only a run could read, leaves every function published, as the adapter does, so that a reading shows private functions rather than hiding public ones.
- Paths: a dot-source, module or `using module` path is resolved only when the text alone fixes it, a string or an expandable string whose only variable is `$PSScriptRoot`. A relative dot-source or `Import-Module` path is taken from the file's directory, as if the script ran from where it lies, the adapter's assumption too, since PowerShell resolves it against the caller's location at run time; `using module` and a manifest's entries are taken from the file's directory as PowerShell takes them. A directory names the `.psd1` or `.psm1` of its name inside it. Each name of a path is found as Windows finds it (`Find-Entry`): spelled exactly, or else the only entry whose name differs in case alone. `oracle:index` copies a fixture to a case-sensitive temporary folder, where `pwsh` itself would not find `Lib` for `lib`; the record says what an estate's Windows PowerShell would load.
- Extended on 2026-11-19 for connections between scripts ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)). It records every command by the name it is called by, its operator, the function and the script blocks it stands in; whether each function stands at the file's own level, and its `[Alias()]` names; `Set-Alias` and `New-Alias`; and the statements at the file's own level, each by kind and whether it calls anything. It reads paths further, by the same rules the adapter keeps: `Join-Path` bound by PowerShell's static binder, a variable assigned once by `=` at the file's own level (`Get-FileVariables`, which enumerates its table so that a variable named `keys` cannot stand for its keys), and a `foreach` or `ForEach-Object` that dot-sources each item of a `Get-ChildItem`, whose files PowerShell's own `Get-ChildItem` lists over the working copy; and records a script run by its path. Those loads are under `loads`; a dot-source's or import's resolution now uses the same reading. Run over dbatools, AL-Go, AzureStack-Tools and tSQLt the same day; two faults found there were mended before the record was trusted: the variable named `keys`, and a `return` inside a loop whose output an assignment was collecting, which emitted the values gathered so far with it.
- Needs PowerShell 7. A `using module` makes the parser load the named module while parsing, which runs its top-level code, so run it over fixtures, not over code you would not run. As a `.ps1` its doc carries `Entry: program`.
- The evening of 2026-11-19, on the root's rulings ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md#rulings-after-the-build-added-november-19-2026-late-evening)): a variable assigned exactly once is read wherever the function or script block holding its assignment holds the use, after it in the text (`Test-AssignedFor`); `Split-Path` of the script's own path is its folder and of another fixed path its parent; a loop over names written out records, under `loads`, what each name loads, the loop's item standing for it (`Get-LiteralItems`, `Get-FixedLoads`, `Add-ItemLoads`).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Find-Entry` {#symbol-find-entry}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L49)

##### `Find-Entry` — Summary
The entry of a directory with the name given, as Windows finds it: the one spelled exactly, or else the only one whose name differs in case alone. $null when there is none, or several that differ in case alone.

#### `Resolve-FixtureFile` {#symbol-resolve-fixturefile}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L69)

##### `Resolve-FixtureFile` — Summary
The fixture-relative path, with forward slashes and spelled as on disk, of the file a path names, or $null when it names no file of the fixture.

#### `Get-StaticPath` {#symbol-get-staticpath}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L124)

##### `Get-StaticPath` — Summary
The text a string argument holds when the text alone fixes it: a constant, or an expandable string whose only variable is $PSScriptRoot, put in place. $null otherwise.

#### `Get-FileVariables` {#symbol-get-filevariables}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L145)

##### `Get-FileVariables` — Summary
The variables a file assigns exactly once and by a plain `=`, by their unqualified names without regard to case, each with its assignment; which uses it fixes is Test-AssignedFor's to say.

#### `Test-AssignedFor` {#symbol-test-assignedfor}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L175)

##### `Test-AssignedFor` — Summary
Whether a variable's one assignment fixes it where a node stands: before it in the text, in the function or script block that holds the node or one enclosing it.

#### `Test-PesterRunBlockBetween` {#symbol-test-pesterrunblockbetween}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L196)

##### `Test-PesterRunBlockBetween` — Summary
Whether an It or BeforeAll block stands between a use and the scope its variable was assigned in ($null for the file's own level). Such a variable reaches the use under Pester 3.4.0 and 4.10.1 but not under 5.9.1, so it is not read there.

#### `Get-BlockCommandName` {#symbol-get-blockcommandname}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L210)

##### `Get-BlockCommandName` — Summary
The command a script block is written as an argument of (`BeforeAll { ... }` for its block), by its name in lower case; $null when it is no command's.

#### `Test-PesterSetupReaches` {#symbol-test-pestersetupreaches}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L224)

##### `Test-PesterSetupReaches` — Summary
Pester's setup: whether a variable assigned in a BeforeAll or BeforeEach block reaches a use inside an It block of the Describe or Context that holds that block, as it does under Pester 3.4.0, 4.10.1 and 5.9.1 alike. A Describe's or Context's own body reaches no It under Pester 5, so it is not read so.

#### `Get-PathValue` {#symbol-get-pathvalue}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L257)

##### `Get-PathValue` — Summary
The path an expression writes when the text alone fixes it, with the file's directory in place of $PSScriptRoot: a string, a bare word or a variable whose variables are $PSScriptRoot or ones the file assigns once at its own level, or a Join-Path of such. $null otherwise.

#### `Get-ListedFiles` {#symbol-get-listedfiles}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L366)

##### `Get-ListedFiles` — Summary
The files a Get-ChildItem command lists, fixture-relative and sorted, when the text fixes its folder and every narrowing: listed by PowerShell's own Get-ChildItem over the working copy, keeping the scripts and modules a loop can dot-source. $null when the text does not fix it.

#### `Get-Listings` {#symbol-get-listings}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L411)

##### `Get-Listings` — Summary
The Get-ChildItem commands a loop's collection is: one written in place, a variable the file assigns once from one, or several of these joined by `+`, a comma or `@()`. $null when any part is something else.

#### `Test-ItemTarget` {#symbol-test-itemtarget}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L446)

##### `Test-ItemTarget` — Summary
Whether a dot-source's target is a loop's item, `$item` or its FullName.

#### `Test-DotSourcesItem` {#symbol-test-dotsourcesitem}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L460)

##### `Test-DotSourcesItem` — Summary
Whether a node holds a dot-source of a loop's item.

#### `Get-LiteralItems` {#symbol-get-literalitems}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L474)

##### `Get-LiteralItems` — Summary
The names a loop's collection writes out: a string, a list of strings, an @() of such, or a variable assigned one where its assignment fixes it. $null when any part is something else.

#### `Get-FixedLoads` {#symbol-get-fixedloads}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L506)

##### `Get-FixedLoads` — Summary
The loads a command makes whose paths the text fixes, with the loop items in place: a dot-source, an Import-Module of a path, or a script run by its path.

#### `Test-SetsItem` {#symbol-test-setsitem}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L547)

##### `Test-SetsItem` — Summary
Whether a loop's body sets its item under any of the names it stands by: an assignment by any operator, ++ or --, or a loop nested in it over the same name. Its loads then hold what the body set, which only a run can say (pwsh 7.7.0, 2026-11-21: `$m = "$m.Extra"` looked for ModE.Extra; `$PSItem = ...` changed what `$_` held), so the loop is not read.

#### `Add-ItemLoads` {#symbol-add-itemloads}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L572)

##### `Add-ItemLoads` — Summary
Records the loads of a loop over names the text writes out, read once for each name with the loop's item standing for it.

#### `Add-ListingLoads` {#symbol-add-listingloads}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L601)

##### `Add-ListingLoads` — Summary
Records a loop's dot-sources of the files its listings name, when the text fixes every listing.

#### `Get-StaticStrings` {#symbol-get-staticstrings}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L627)

##### `Get-StaticStrings` — Summary
The strings an argument holds, flattening an array literal; $null when any part of it is not a string written out.

#### `Get-BoundParameters` {#symbol-get-boundparameters}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L652)

##### `Get-BoundParameters` — Summary
Every parameter PowerShell's static binder bound on a command, with the argument's text and the strings it holds, and what it could not bind.

#### `Get-CommentHelp` {#symbol-get-commenthelp}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L673)

##### `Get-CommentHelp` — Summary
A function's comment-based help as GetHelpContent returns it, each parameter under the key the help gives and the spelling the function declares.

#### `ConvertTo-SortedData` {#symbol-convertto-sorteddata}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L711)

##### `ConvertTo-SortedData` — Summary
A hashtable as JSON reads it: keys sorted, nested tables and arrays followed.

#### `Resolve-CommandAlias` {#symbol-resolve-commandalias}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L730)

##### `Resolve-CommandAlias` — Summary
The command a name stands for in this PowerShell, an alias followed to its command; the name itself when it is not an alias. Each name is looked up once.

#### `Test-FileScope` {#symbol-test-filescope}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L744)

##### `Test-FileScope` — Summary
Whether what a node defines is seen by whoever loads its file: it stands inside no function and no script block written as a value, which run in scopes of their own.

#### `Get-EnclosingFunction` {#symbol-get-enclosingfunction}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L759)

##### `Get-EnclosingFunction` — Summary
The name of the function a node stands in, the nearest one, or $null at the file's own level. A class's members are not functions.

#### `Get-EnclosingBlocks` {#symbol-get-enclosingblocks}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L774)

##### `Get-EnclosingBlocks` — Summary
The commands whose script-block arguments a node stands in, nearest first: `Invoke-Command`, `ForEach-Object`, a test's `It`.

#### `Get-FunctionAliases` {#symbol-get-functionaliases}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L791)

##### `Get-FunctionAliases` — Summary
The aliases a function's `[Alias()]` attribute gives it, as written.

#### `Get-StatementFact` {#symbol-get-statementfact}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L813)

##### `Get-StatementFact` — Summary
What a statement at a file's own level is: a definition, a load, a command, an assignment, or another statement by its kind; whether it calls anything; and the first line of its text.

#### `Test-OutsideDefinitions` {#symbol-test-outsidedefinitions}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L854)

##### `Test-OutsideDefinitions` — Summary
Whether a node lies outside every function and class defined within a statement, so that it runs when the statement does.

#### `Read-Script` {#symbol-read-script}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L869)

##### `Read-Script` — Summary
What the parser says about a script or a module.

#### `Read-DataFile` {#symbol-read-datafile}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-ast.ps1#L1159)

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
