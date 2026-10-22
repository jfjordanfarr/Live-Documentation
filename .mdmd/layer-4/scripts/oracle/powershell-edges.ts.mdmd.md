# scripts/oracle/powershell-edges.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/powershell-edges.ts
- Generated At: 2026-10-22T16:47:57.809Z

## Authored
### Purpose
The TypeScript side of the PowerShell oracle: runs [`powershell-ast.ps1`](./powershell-ast.ps1.mdmd.md) through `pwsh` over a working copy, types the record it prints, draws from it the file-to-file edges `expected/compiler-edges.json` holds, and moves the record's locations for [`files.ts`](./files.ts.mdmd.md) to persist.

### Notes
- Written on 2026-10-16 ([Turn 3 of the October 16 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)). An edge's `symbols` hold the text that makes it (`. "$PSScriptRoot/lib/Logging.ps1"`, `RootModule = 'Rollout.Steps.psm1'`) in place of a compiler's symbols, so `oracle:compare`'s `via` line names the construct. A manifest's `RootModule`, `NestedModules`, `RequiredModules` and `ScriptsToProcess` entries that name a file of the fixture are edges, which the adapter finds since it reads manifests (the same day). A file naming itself makes no edge. The record's types gained the type definitions and a reference's version that evening ([Turn 4](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-4)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PowerShellParseError` {#symbol-powershellparseerror}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L24)

##### `PowerShellParseError` — Summary
An error the parser reported, at its line and column; an error reading a data file has neither.

#### `PowerShellParameterHelp` {#symbol-powershellparameterhelp}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L32)

##### `PowerShellParameterHelp` — Summary
A parameter's help, under the key the help gives (upper-cased by PowerShell) and the spelling the function declares.

#### `PowerShellHelp` {#symbol-powershellhelp}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L39)

##### `PowerShellHelp` — Summary
A function's comment-based help, every field as `GetHelpContent` returns it, untrimmed.

#### `PowerShellFunction` {#symbol-powershellfunction}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L58)

##### `PowerShellFunction` — Summary
A `FunctionDefinitionAst`: a function, filter or workflow, or the body of a class's constructor or method (`member`).

#### `PowerShellTypeDefinition` {#symbol-powershelltypedefinition}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L70)

##### `PowerShellTypeDefinition` — Summary
A `TypeDefinitionAst`: a class, an enum or an interface, at the line and column its extent starts.

#### `PowerShellBoundArgument` {#symbol-powershellboundargument}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L78)

##### `PowerShellBoundArgument` — Summary
What the static binder bound to one parameter: the argument's text, and its strings when every part of it is a string written out.

#### `PowerShellCommand` {#symbol-powershellcommand}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L84)

##### `PowerShellCommand` — Summary
A command as PowerShell's static binder reads it.

#### `PowerShellImportModule` {#symbol-powershellimportmodule}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L93)
- Extends: [`PowerShellCommand`](#symbol-powershellcommand)

##### `PowerShellImportModule` — Summary
An `Import-Module`, by whatever name it was called, with each module it names and the file a path among them resolves to.

#### `PowerShellDotSource` {#symbol-powershelldotsource}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L99)

##### `PowerShellDotSource` — Summary
A dot-source: its target when the text is a string, and the file it resolves to.

#### `PowerShellUsingStatement` {#symbol-powershellusingstatement}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L108)

##### `PowerShellUsingStatement` — Summary
A `using` statement of any kind; a `using module` path resolves to a file.

#### `PowerShellRequiredModule` {#symbol-powershellrequiredmodule}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L118)

##### `PowerShellRequiredModule` — Summary
A module a `#requires -Modules` names.

#### `PowerShellScriptFacts` {#symbol-powershellscriptfacts}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L128)

##### `PowerShellScriptFacts` — Summary
What the parser says about a `.ps1` or `.psm1`.

#### `PowerShellManifestReference` {#symbol-powershellmanifestreference}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L142)

##### `PowerShellManifestReference` — Summary
A module or script a manifest's table names: under which key, by what name, at what version when a module specification writes one, and the file it resolves to.

#### `PowerShellDataFileFacts` {#symbol-powershelldatafilefacts}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L150)

##### `PowerShellDataFileFacts` — Summary
What `Import-PowerShellDataFile` says about a `.psd1`: its table, and the modules and scripts a manifest's table names.

#### `PowerShellFileFacts` {#symbol-powershellfilefacts}
- Type: type
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L157)
- Returns: [`PowerShellScriptFacts`](#symbol-powershellscriptfacts), [`PowerShellDataFileFacts`](#symbol-powershelldatafilefacts)

##### `PowerShellFileFacts` — Summary
What the parser says about one file: a script's or module's facts, or a data file's.

#### `PowerShellAst` {#symbol-powershellast}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L160)

##### `PowerShellAst` — Summary
The parser's record of a fixture, file by file, in fixture-relative coordinates.

#### `POWERSHELL_EXTENSIONS` {#symbol-powershell_extensions}
- Type: const
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L166)

##### `POWERSHELL_EXTENSIONS` — Summary
The extensions PowerShell reads: scripts, modules and data files.

#### `isDataFileFacts` {#symbol-isdatafilefacts}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L171)
- Parameters: `facts`: [`PowerShellFileFacts`](#symbol-powershellfilefacts)

##### `isDataFileFacts` — Summary
Whether the facts are a `.psd1`'s, which carry its table rather than a script's commands.

#### `parsePowerShellFixture` {#symbol-parsepowershellfixture}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L176)
- Returns: [`PowerShellAst`](#symbol-powershellast)

##### `parsePowerShellFixture` — Summary
Runs the parser over the named files of a working copy; `pwsh` must be on the path.

#### `edgesFromPowerShellAst` {#symbol-edgesfrompowershellast}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L210)
- Returns: [`OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges)
- Parameters: `ast`: [`PowerShellAst`](#symbol-powershellast); `projects`: [`OracleProject`](./scip-edges.ts.mdmd.md#symbol-oracleproject)[]

##### `edgesFromPowerShellAst` — Summary
The file-to-file edges of the parser's record, each carried by the text
that makes it, in place of the symbols a compiler's index would give. A
file that names itself makes no edge.

#### `rebasePowerShellAst` {#symbol-rebasepowershellast}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-edges.ts#L233)
- Returns: [`PowerShellAst`](#symbol-powershellast)
- Parameters: `ast`: [`PowerShellAst`](#symbol-powershellast)

##### `rebasePowerShellAst` — Summary
Moves every location of the record, the files' keys and every resolved path, from one directory's coordinates to another's.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:path` - `path`
- [`scip-edges.OracleEdge`](./scip-edges.ts.mdmd.md#symbol-oracleedge) (type-only)
- [`scip-edges.OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges) (type-only)
- [`scip-edges.OracleProject`](./scip-edges.ts.mdmd.md#symbol-oracleproject) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../layer-3/architectural-decisions.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
