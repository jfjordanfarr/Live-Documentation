# `scripts/oracle/csharp-compare.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/csharp-compare.ts`
- Entry: command `oracle:csharp` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-22T07:11:38.685Z

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
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L53)

##### `CompilerRecord` — Summary
What the compiler program printed of a folder.

#### `DocumentationReference` {#symbol-documentationreference}
- Type: interface
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L73)

##### `DocumentationReference` — Summary
One `cref` of a documentation comment: the file and line it stands on, the element that carries it (`see`, `seealso`,
`inheritdoc`, `exception`, `permission` …), the reference as written, and the compiler's answer: `resolved` to one
symbol, a reason it could not choose among several candidates (`Ambiguous`, for a method's name with overloads), or
`unresolved`, which without framework references also says of a framework type such as `ArgumentException`.

#### `Declaration` {#symbol-declaration}
- Type: interface
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L86)

##### `Declaration` — Summary
A declaration: the file and the line of the name it declares.

#### `DocumentationPairs (interface)` {#symbol-documentationpairs-interface}
- Type: interface
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L92)

##### `DocumentationPairs (interface)` — Summary
The file pairs documentation references make, set beside the pairs the code binds.

#### `documentationPairs (function)` {#symbol-documentationpairs-function}
- Type: function
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L111)
- Returns: [`DocumentationPairs`](#symbol-documentationpairs-interface)
- Parameters: `record`: [`CompilerRecord`](#symbol-compilerrecord)

##### `documentationPairs (function)` — Summary
The pairs the record's documentation references make: each to every file declaring the symbol (each part of a
partial type; each candidate of an ambiguous one). A namespace is no pair, as among the edges: every file that
opens one declares it.

#### `compiledSources` {#symbol-compiledsources}
- Type: function
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L134)

##### `compiledSources` — Summary
The files a compilation of the folder is made from: its C# files, and its project files, from which its references are read.

#### `compileFolder` {#symbol-compilefolder}
- Type: function
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L153)
- Returns: [`CompilerRecord`](#symbol-compilerrecord)

##### `compileFolder` — Summary
Runs the compiler program over the folder; `dotnet` must be on the path.

#### `DOCUMENTATION_CAUSES` {#symbol-documentation_causes}
- Type: const
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L179)

##### `DOCUMENTATION_CAUSES` — Summary
Why the reader and the compiler part on a documentation reference, declaration by declaration. Each reference the
compiler records is matched with the reader's of the same file, on the same declaration, written alike; the
declarations each names are then set side by side, a reference within its own file as any other.

#### `DocumentationRelation` {#symbol-documentationrelation}
- Type: interface
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L195)

##### `DocumentationRelation` — Summary
The reader's documentation references set beside the compiler's, declaration by declaration.

#### `ReaderReference` {#symbol-readerreference}
- Type: interface
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L206)

##### `ReaderReference` — Summary
One reference as the reader read it: the file, the line of the symbol whose documentation writes it, the name as the Live Doc writes it, and the declarations it links.

#### `writesUndeclaredParameter` {#symbol-writesundeclaredparameter}
- Type: function
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L221)
- Parameters: `declared`: `ReadonlySet`

##### `writesUndeclaredParameter` — Summary
Whether a reference's parameter list writes a type the compilation, having no framework references, cannot bind: a
keyword of the framework's types, or a name no file of the folder declares, its type arguments read the same way.
The oracle's own reading of the syntax, kept apart from the reader's.

#### `compareDocumentation` {#symbol-comparedocumentation}
- Type: function
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L240)
- Returns: [`DocumentationRelation`](#symbol-documentationrelation)
- Parameters: `record`: [`CompilerRecord`](#symbol-compilerrecord); `shown`: `ReadonlySet`

##### `compareDocumentation` — Summary
Sets the reader's documentation references beside the compiler's, reference by reference and declaration by
declaration. A reference is matched by its file, the line of the declaration its comment documents and its name as
the Live Doc writes it (`crefLinkTarget`); alike references on one declaration are taken once, since they
resolve alike. An ambiguous reference names every candidate, and a reader that links them all agrees. A namespace
names no declaration, as the reader links none. `onlyThrough` tells a target whose project the file's reaches only
through another.

#### `CSharpReport` {#symbol-csharpreport}
- Type: interface
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L308)

##### `CSharpReport` — Summary
The comparison of one folder: what was read, how its projects' references were, and the edges side by side.

#### `compareCSharp` {#symbol-comparecsharp}
- Type: function
- Source: [source](../../../../scripts/oracle/csharp-compare.ts#L340)
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
- [`csharp.xmldoc.crefLinkTarget`](../../packages/engine/src/live-docs/adapters/csharp.xmldoc.ts.mdmd.md#symbol-creflinktarget)
- [`powershell-compare.folderFiles`](./powershell-compare.ts.mdmd.md#symbol-folderfiles)
- [`scip-edges.msbuildProjectReferences`](./scip-edges.ts.mdmd.md#symbol-msbuildprojectreferences)
- [`sources.sourceDigests`](./sources.ts.mdmd.md#symbol-sourcedigests)
- [`sources.sourcesDiffer`](./sources.ts.mdmd.md#symbol-sourcesdiffer)
<!-- LIVE-DOC:END Dependencies -->
