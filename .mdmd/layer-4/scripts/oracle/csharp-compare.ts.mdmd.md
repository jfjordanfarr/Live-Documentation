# `scripts/oracle/csharp-compare.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/csharp-compare.ts`
- Entry: command `oracle:csharp` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-21T05:26:06.823Z

## Authored
### Purpose
Grades the C# reader on a whole folder against the C# compiler's own binding: `npm run oracle:csharp -- <folder>` runs [`csharp-compiler.cs`](./csharp-compiler.cs.mdmd.md) over the folder, each project's references taken from MSBuild's evaluation (`msbuildProjectReferences` in [`scip-edges.ts`](./scip-edges.ts.mdmd.md)), reads the same C# files with the C# adapter, every file of the folder its index, and sets the C# file pairs side by side: the compiler's, the adapter's and both, the adapter's own by cause (a namesake, an edge resting on a reference under a condition the default configuration does not meet, the rest), and the compiler's own. `--detail` lists every disagreement, `--json` prints data, and `--write` keeps the compiler's record as a fixture's `expected/csharp-compiler.json`, which is then read without .NET.

### Notes
- Written on 2026-11-21 in the joining of the readers ([the work item](../../../../AI-Agent-Workspace/Work/readers-on-main.md); [the account of the grading](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/README.md)), so that the C# grader runs by one command as the work item's "done when" asks, in the shape of `oracle:powershell`. The compiler program was the November 19 probe's ([`dotnet-gaps`](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md)), whose table of DNN's and mojoPortal's C# lines against the compiler's is the record its numbers are set beside.
- A project MSBuild cannot evaluate here (on Linux, the old-style web projects whose Visual Studio targets the .NET SDK does not ship, and imports Windows finds by ignoring case) has its references read from its XML's elements by System.Xml, every condition taken as met, and the report names those projects: never a pattern unsaid.
- mojoPortal's projects reference a data project for each database under a condition on the build configuration; the reader reads every condition's reference, MSBuild's default configuration one. Such references are counted as a class of their own, and an edge the adapter draws only through one is counted apart from ordinary extras, so that a namesake among four providers is not taken for a fault of name resolution. Which configuration is right is a question to be measured before anything is built (the work item's list).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CompilerRecord` {#symbol-compilerrecord}
- Type: interface
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L47)

##### `CompilerRecord` — Summary
What the compiler program printed of a folder.

#### `compileFolder` {#symbol-compilefolder}
- Type: function
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L72)
- Returns: [`CompilerRecord`](#symbol-compilerrecord)

##### `compileFolder` — Summary
Runs the compiler program over the folder; `dotnet` must be on the path.

#### `CSharpReport` {#symbol-csharpreport}
- Type: interface
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L94)

##### `CSharpReport` — Summary
The comparison of one folder: what was read, how its projects' references were, and the edges side by side.

#### `compareCSharp` {#symbol-comparecsharp}
- Type: function
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L121)
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
<!-- LIVE-DOC:END Dependencies -->
