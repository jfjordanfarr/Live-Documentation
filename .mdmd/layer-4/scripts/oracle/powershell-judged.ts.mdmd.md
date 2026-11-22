# `scripts/oracle/powershell-judged.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/powershell-judged.ts`
- Generated At: 2026-11-22T07:12:57.988Z

## Authored
### Purpose
Keeps the hand reading of 2026-11-19, 222 PowerShell wires two judges read in four public repositories, where a test can read it: it writes the extract of those repositories that `powershell-judged.test.ts` replays (each file a wire's answer rests on, with only its paths, the functions it defines, the judged calls and its loads, each at its line), and writes a corpus's skeleton from that extract for the PowerShell reader to read.

### Notes
- Run by hand, once, over the repositories as they were judged, with PowerShell's parser; the owner allowed the extract to be kept in this repository on 2026-11-22, "paths, function names, calls; no code" ([the record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/powershell-extract/README.md)).
- A load is written again as the plainest load of the same kind of the same file, so a skeleton tests the reader's rule, not its reading of `Join-Path` and loops; the reader's one miss on the corpora's own text that this hides is named in the record.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExtractFunction` {#symbol-extractfunction}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-judged.ts#L41)

##### `ExtractFunction` — Summary
A function a file defines, by the name it is written by there and the line it starts on.

#### `ExtractCall` {#symbol-extractcall}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-judged.ts#L47)

##### `ExtractCall` — Summary
A command a file calls, as written, at its line; `&` or `.` when the call is written with one.

#### `ExtractLoad` {#symbol-extractload}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-judged.ts#L54)

##### `ExtractLoad` — Summary
A load of another file of the extract, by kind, at the line it stands on; `using module` and `#requires` are imports.

#### `ExtractFile` {#symbol-extractfile}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-judged.ts#L61)

##### `ExtractFile` — Summary
What the extract keeps of one file.

#### `ExtractCorpus (interface)` {#symbol-extractcorpus-interface}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-judged.ts#L73)

##### `ExtractCorpus (interface)` — Summary
One corpus: the repository it was read from, its licence, and the files kept.

#### `JudgedWire` {#symbol-judgedwire}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-judged.ts#L86)
- Extends: [`HandVerdict`](./powershell-verdicts.ts.mdmd.md#symbol-handverdict)

##### `JudgedWire` — Summary
A judged wire: the row of the table, the definition's line, and why the judges said false or arguable.

#### `JudgedExtract` {#symbol-judgedextract}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-judged.ts#L92)

##### `JudgedExtract` — Summary
The extract as it is committed.

#### `CORPORA` {#symbol-corpora}
- Type: const
- Source: [source](../../../../scripts/oracle/powershell-judged.ts#L101)

##### `CORPORA` — Summary
The corpora the table names, with where each was read from and its licence's notice.

#### `extractCorpus (function)` {#symbol-extractcorpus-function}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-judged.ts#L145)
- Parameters: `ast`: [`PowerShellAst`](./powershell-edges.ts.mdmd.md#symbol-powershellast); `rows`: [`HandVerdict`](./powershell-verdicts.ts.mdmd.md#symbol-handverdict)[]

##### `extractCorpus (function)` — Summary
The files of one corpus a judged wire's answer rests on, and what each keeps.

#### `skeletonText` {#symbol-skeletontext}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-judged.ts#L238)
- Parameters: `entry`: [`ExtractFile`](#symbol-extractfile)

##### `skeletonText` — Summary
The text of one skeleton file: each item on its line, items that share a line joined by `;`.

#### `writeSkeleton` {#symbol-writeskeleton}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-judged.ts#L264)
- Parameters: `corpus`: [`ExtractCorpus`](#symbol-extractcorpus-interface)

##### `writeSkeleton` — Summary
Writes a corpus's skeleton into a folder, one file for each kept, and returns their paths.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path` - `path`
- `node:process` - `process`
- [`powershell-compare.folderFiles`](./powershell-compare.ts.mdmd.md#symbol-folderfiles)
- [`powershell-edges.PowerShellAst`](./powershell-edges.ts.mdmd.md#symbol-powershellast) (type-only)
- [`powershell-edges.PowerShellDataFileFacts`](./powershell-edges.ts.mdmd.md#symbol-powershelldatafilefacts) (type-only)
- [`powershell-edges.PowerShellScriptFacts`](./powershell-edges.ts.mdmd.md#symbol-powershellscriptfacts) (type-only)
- [`powershell-edges.isDataFileFacts`](./powershell-edges.ts.mdmd.md#symbol-isdatafilefacts)
- [`powershell-edges.parsePowerShellFixture`](./powershell-edges.ts.mdmd.md#symbol-parsepowershellfixture)
- [`powershell-verdicts.HandVerdict`](./powershell-verdicts.ts.mdmd.md#symbol-handverdict) (type-only)
- [`powershell-verdicts.readVerdicts`](./powershell-verdicts.ts.mdmd.md#symbol-readverdicts)
- [`powershell-wires.ParserWorkspace`](./powershell-wires.ts.mdmd.md#symbol-parserworkspace)
- [`powershell-wires.callName`](./powershell-wires.ts.mdmd.md#symbol-callname)
- [`powershell-wires.isManifest`](./powershell-wires.ts.mdmd.md#symbol-ismanifest)
- [`powershell-wires.parserLoads`](./powershell-wires.ts.mdmd.md#symbol-parserloads)
- [`powershell-wires.recordedShippedNames`](./powershell-wires.ts.mdmd.md#symbol-recordedshippednames)
<!-- LIVE-DOC:END Dependencies -->
