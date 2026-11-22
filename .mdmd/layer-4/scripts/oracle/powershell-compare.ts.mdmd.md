# `scripts/oracle/powershell-compare.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/powershell-compare.ts`
- Entry: command `oracle:powershell` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-22T07:12:57.955Z

## Authored
### Purpose
Grades the PowerShell reader on a whole folder against PowerShell's own parser: `npm run oracle:powershell -- <folder>` runs [`powershell-ast.ps1`](./powershell-ast.ps1.mdmd.md) over every `.ps1`, `.psm1` and `.psd1` file of the folder in batches, applies the rules of [`powershell-wires.ts`](./powershell-wires.ts.mdmd.md) to the parser's facts ("loaded, else unique", the loads the text fixes, libraries told from programs), reads the same files with the PowerShell adapter, every file of the folder its index, and sets the two side by side: wires (file pairs, by a load or a call), calls (a file, a function and the file that defines it) and programs. `--detail` lists every disagreement, `--json` prints data. With `--verdicts <samples.md> --corpus <name>` it also holds the rule and the adapter to the hand reading of 2026-11-19, the only measure of the rule itself ([`powershell-verdicts.ts`](./powershell-verdicts.ts.mdmd.md)). It needs `pwsh`.

### Notes
- Written on 2026-11-21 in the joining of the three readers onto `main` ([the work item](../../../../AI-Agent-Workspace/Work/readers-on-main.md); [the account of the grading](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/README.md)). The PowerShell reader's scores on dbatools, AL-Go, AzureStack-Tools and tSQLt ([the probe of 2026-11-19](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md)) were made by scripts that stayed in a builder's scratch folder and were lost with the container on 2026-11-20, so no one could run them again; this is that measurement committed beside its siblings `sql-compare.ts` and `plsql-compare.ts`, in their shape.
- What it reads of a folder is every file but the version control's folder and a folder of Live Docs, as those corpora were counted (dbatools' 1,797 PowerShell files counted its `bin/`). A test file is told from working code by the default configuration's conventions on both sides, since a corpus has no configuration of its own.
- It scores the adapter against the measured rules, not against a run of PowerShell: which file a call reaches at run time is not the parser's to say. The fixtures' agreement with the parser, file by file and against a register of measured misses, is held by `tests/integration/live-docs/powershell-oracle.test.ts`; this command is for a folder too large to keep a record of.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `folderFiles` {#symbol-folderfiles}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-compare.ts#L65)

##### `folderFiles` — Summary
Every file of a folder, folder-relative with `/`, but those of the folders left out.

#### `parserReading` {#symbol-parserreading}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-compare.ts#L100)
- Returns: [`Reading`](../../tests/e2e/scenarios/reading.ts.mdmd.md#symbol-reading)
- Parameters: `ast`: [`PowerShellAst`](./powershell-edges.ts.mdmd.md#symbol-powershellast); `shipped`: [`ShippedNames`](./powershell-wires.ts.mdmd.md#symbol-shippednames)

##### `parserReading` — Summary
What the parser's facts make of the folder under the rules of `powershell-wires.ts`, with the names pwsh answers by itself.

#### `adapterReading` {#symbol-adapterreading}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-compare.ts#L116)
- Returns: [`Reading`](../../tests/e2e/scenarios/reading.ts.mdmd.md#symbol-reading)

##### `adapterReading` — Summary
What the adapter's analyses of the folder's files make of it, read as the parser's are.

#### `PowerShellReport` {#symbol-powershellreport}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-compare.ts#L146)

##### `PowerShellReport` — Summary
The comparison of one folder: what was read, and each measure set side by side.

#### `VerdictsOption` {#symbol-verdictsoption}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-compare.ts#L161)

##### `VerdictsOption` — Summary
The hand reading to hold the readings to: its rows, and the name the table gives the folder's corpus.

#### `comparePowerShell` {#symbol-comparepowershell}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-compare.ts#L171)
- Parameters: `ast`: [`PowerShellAst`](./powershell-edges.ts.mdmd.md#symbol-powershellast); `names`: [`ShippedNames`](./powershell-wires.ts.mdmd.md#symbol-shippednames); `verdicts`: [`VerdictsOption`](#symbol-verdictsoption)

##### `comparePowerShell` — Summary
Reads the folder both ways and sets the readings side by side. The names pwsh answers by itself are asked of the pwsh
that parses the folder; a record given in its place, which runs no pwsh, is read with the names kept beside the rules.
Given the hand reading, its rows of the folder's corpus are scored against both readings' calls.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path` - `path`
- `node:process` - `process`
- [`powershell.powershellAdapter`](../../packages/engine/src/live-docs/adapters/powershell.ts.mdmd.md#symbol-powershelladapter)
- [`core.SourceAnalysisResult`](../../packages/engine/src/live-docs/core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`powershell-edges.PowerShellAst`](./powershell-edges.ts.mdmd.md#symbol-powershellast) (type-only)
- [`powershell-edges.isDataFileFacts`](./powershell-edges.ts.mdmd.md#symbol-isdatafilefacts)
- [`powershell-edges.parsePowerShellFixture`](./powershell-edges.ts.mdmd.md#symbol-parsepowershellfixture)
- [`powershell-verdicts.HandVerdict`](./powershell-verdicts.ts.mdmd.md#symbol-handverdict) (type-only)
- [`powershell-verdicts.VerdictScore`](./powershell-verdicts.ts.mdmd.md#symbol-verdictscore) (type-only)
- [`powershell-verdicts.readVerdicts`](./powershell-verdicts.ts.mdmd.md#symbol-readverdicts)
- [`powershell-verdicts.scoreVerdicts`](./powershell-verdicts.ts.mdmd.md#symbol-scoreverdicts)
- [`powershell-wires.ParserWorkspace`](./powershell-wires.ts.mdmd.md#symbol-parserworkspace)
- [`powershell-wires.ShippedNames`](./powershell-wires.ts.mdmd.md#symbol-shippednames) (type-only)
- [`powershell-wires.askShippedNames`](./powershell-wires.ts.mdmd.md#symbol-askshippednames)
- [`powershell-wires.isLibraryByParser`](./powershell-wires.ts.mdmd.md#symbol-islibrarybyparser)
- [`powershell-wires.parserLoads`](./powershell-wires.ts.mdmd.md#symbol-parserloads)
- [`powershell-wires.recordedShippedNames`](./powershell-wires.ts.mdmd.md#symbol-recordedshippednames)
<!-- LIVE-DOC:END Dependencies -->
