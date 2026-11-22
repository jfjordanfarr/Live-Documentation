# `scripts/oracle/csharp-compare.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/csharp-compare.ts`
- Entry: command `oracle:csharp` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-22T01:24:24.087Z

## Authored
### Purpose
Grades the C# reader on a whole folder against the C# compiler's own binding: `npm run oracle:csharp -- <folder>` runs [`csharp-compiler.cs`](./csharp-compiler.cs.mdmd.md) over the folder, each project's references taken from MSBuild's evaluation (`msbuildProjectReferences` in [`scip-edges.ts`](./scip-edges.ts.mdmd.md)), reads the same C# files with the C# adapter, every file of the folder its index, and sets the C# file pairs side by side: the compiler's, the adapter's and both, the adapter's own by cause (a namesake, an edge resting on a reference under a condition the default configuration does not meet, the rest), and the compiler's own. `--detail` lists every disagreement, `--json` prints data, and `--write` keeps the compiler's record as a fixture's `expected/csharp-compiler.json`, which is then read without .NET.

### Notes
- Written on 2026-11-21 in the joining of the readers ([the work item](../../../../AI-Agent-Workspace/Work/readers-on-main.md); [the account of the grading](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/README.md)), so that the C# grader runs by one command as the work item's "done when" asks, in the shape of `oracle:powershell`. The compiler program was the November 19 probe's ([`dotnet-gaps`](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md)), whose table of DNN's and mojoPortal's C# lines against the compiler's is the record its numbers are set beside.
- A project MSBuild cannot evaluate here (on Linux, the old-style web projects whose Visual Studio targets the .NET SDK does not ship, and imports Windows finds by ignoring case) has its references read from its XML's elements by System.Xml, every condition taken as met, and the report names those projects: never a pattern unsaid.
- mojoPortal's projects reference a data project for each database under a condition on the build configuration; the reader reads every condition's reference, MSBuild's default configuration one. Such references are counted as a class of their own, and an edge the adapter draws only through one is counted apart from ordinary extras, so that a namesake among four providers is not taken for a fault of name resolution. Which configuration is right is a question to be measured before anything is built (the work item's list).
- Since the same day the kept record names every file it was compiled from, the C# files and the project files its references come from, with a digest ([`sources.ts`](./sources.ts.mdmd.md)), and a kept record that differs from the folder as it stands is refused, naming the files, until it is written again. An independent review's second pass found that the grader graded only the files its record listed, so a file added to a fixture was graded by no one.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CompilerRecord` {#symbol-compilerrecord}
- Type: interface
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L50)

##### `CompilerRecord` — Summary
What the compiler program printed of a folder.

#### `DocumentationReference` {#symbol-documentationreference}
- Type: interface
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L70)

##### `DocumentationReference` — Summary
One `cref` of a documentation comment: the file and line it stands on, the element that carries it (`see`, `seealso`,
`inheritdoc`, `exception`, `permission` …), the reference as written, and the compiler's answer: `resolved` to one
symbol, a reason it could not choose among several candidates (`Ambiguous`, for a method's name with overloads), or
`unresolved`, which without framework references also says of a framework type such as `ArgumentException`.

#### `DocumentationPairs (interface)` {#symbol-documentationpairs-interface}
- Type: interface
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L80)

##### `DocumentationPairs (interface)` — Summary
The file pairs documentation references make, set beside the pairs the code binds.

#### `documentationPairs (function)` {#symbol-documentationpairs-function}
- Type: function
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L97)
- Returns: [`DocumentationPairs`](#symbol-documentationpairs-interface)
- Parameters: `record`: [`CompilerRecord`](#symbol-compilerrecord)

##### `documentationPairs (function)` — Summary
The pairs the record's documentation references make: each to every file declaring the symbol (each part of a
partial type; each candidate of an ambiguous one). A namespace is no pair, as among the edges: every file that
opens one declares it.

#### `compiledSources` {#symbol-compiledsources}
- Type: function
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L119)

##### `compiledSources` — Summary
The files a compilation of the folder is made from: its C# files, and its project files, from which its references are read.

#### `compileFolder` {#symbol-compilefolder}
- Type: function
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L138)
- Returns: [`CompilerRecord`](#symbol-compilerrecord)

##### `compileFolder` — Summary
Runs the compiler program over the folder; `dotnet` must be on the path.

#### `CSharpReport` {#symbol-csharpreport}
- Type: interface
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L160)

##### `CSharpReport` — Summary
The comparison of one folder: what was read, how its projects' references were, and the edges side by side.

#### `compareCSharp` {#symbol-comparecsharp}
- Type: function
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L189)
- Parameters: `kept`: [`CompilerRecord`](#symbol-compilerrecord)

##### `compareCSharp` — Summary
Reads the folder both ways, or the compiler's kept record of it, and sets the edges side by side.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs`
- `node:path` - `path`
- `node:process` - `process`
- [`csharp.csharpAdapter`](../../packages/engine/src/live-docs/adapters/csharp.ts.mdmd.md#symbol-csharpadapter)
- [`powershell-compare.folderFiles`](./powershell-compare.ts.mdmd.md#symbol-folderfiles)
- [`scip-edges.msbuildProjectReferences`](./scip-edges.ts.mdmd.md#symbol-msbuildprojectreferences)
- [`sources.sourceDigests`](./sources.ts.mdmd.md#symbol-sourcedigests)
- [`sources.sourcesDiffer`](./sources.ts.mdmd.md#symbol-sourcesdiffer)
<!-- LIVE-DOC:END Dependencies -->
