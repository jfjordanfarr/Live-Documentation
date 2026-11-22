# `scripts/oracle/powershell-wires.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/powershell-wires.ts`
- Generated At: 2026-11-22T07:12:58.011Z

## Authored
### Purpose
The PowerShell oracle's rules over the parser's record: which files each file loads, the file each call reaches ("loaded, else unique"), which scripts are libraries rather than programs, and the functions a manifest offers from their origin files. `powershell-edges.ts` draws the record's edges with it, and `powershell-oracle.test.ts` holds the adapter to it.

### Notes
- Written on 2026-11-19 ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)). The rules were chosen by measurement over five corpora read with PowerShell's own parser, and are written here a second time, over the parser's facts, which the adapter reads from its grammar instead. Being the same rules on both sides, they grade the adapter's reading of the facts and never the rules themselves, which only the hand reading of the sampled wires grades.
- On 2026-11-21 ([the account](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/powershell-findings.md)) an independent review found the claim of independence overstated: this file took the names PowerShell answers by itself from the adapter's own list ([`powershell.builtins.ts`](../../../../.mdmd/layer-4/packages/engine/src/live-docs/adapters/powershell.builtins.ts.mdmd.md)), so that list was graded by nothing. It now takes them from pwsh, in a clean session ([`powershell-shipped.ps1`](./powershell-shipped.ps1.mdmd.md)), or for a committed record from the names pwsh gave, kept in `powershell-shipped.json`. What it still shares with the product is the reading of which files are tests (`resolveArchetype`), and the header says what it cannot measure.
- The same rules scored the built adapter on the corpora: on dbatools the adapter drew 7,477 of the 7,479 wires these rules draw from the parser's facts and invented none, the two missed being the grammar's (two files whose public function the grammar swallows). On AL-Go it does not draw five that these rules do, a test's stubs of an outside module's commands written at the test's own level, which are false wires: a known weakness of the rule, which the grammar happens to spare the adapter.
- The same evening ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md#rulings-after-the-build-added-november-19-2026-late-evening)): from a script that is not a test, the reach to the only defining file passes over every test file, by the product's archetype (`isTestFile`, `resolveArchetype` with the default configuration), the root's ruling that nothing in a repository's working code depends on its tests.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ShippedNames` {#symbol-shippednames}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-wires.ts#L38)

##### `ShippedNames` — Summary
The names a clean PowerShell session answers by itself, as `powershell-shipped.ps1` prints them.

#### `askShippedNames` {#symbol-askshippednames}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-wires.ts#L49)
- Returns: [`ShippedNames`](#symbol-shippednames)

##### `askShippedNames` — Summary
The names the pwsh on the path answers by itself, asked of it in a clean session.

#### `recordedShippedNames` {#symbol-recordedshippednames}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-wires.ts#L61)
- Returns: [`ShippedNames`](#symbol-shippednames)

##### `recordedShippedNames` — Summary
The names pwsh answered by itself, kept beside this file (`powershell-shipped.json`, written by
`pwsh -NoProfile -NonInteractive -File scripts/oracle/powershell-shipped.ps1`, PowerShell 7.7.0 on Linux, 2026-11-21),
for readings of a committed record, which run no pwsh. Write it again when the parser's records are.

#### `ParserLoad` {#symbol-parserload}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-wires.ts#L66)

##### `ParserLoad` — Summary
A load of one file by another, by kind: what a manifest names loads with the manifest's module.

#### `isTestFile` {#symbol-istestfile}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-wires.ts#L81)

##### `isTestFile` — Summary
Whether a file is a test, by the archetype the product's naming conventions give it, without a workspace's configuration.

#### `callName` {#symbol-callname}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-wires.ts#L86)

##### `callName` — Summary
A function's name as callers write it: without a scope prefix, case-folded.

#### `isManifest` {#symbol-ismanifest}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-wires.ts#L96)
- Parameters: `facts`: [`PowerShellDataFileFacts`](./powershell-edges.ts.mdmd.md#symbol-powershelldatafilefacts)

##### `isManifest` — Summary
Whether a `.psd1` is a module manifest, by its table as `Import-PowerShellDataFile` read it.

#### `parserLoads` {#symbol-parserloads}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-wires.ts#L101)
- Returns: [`ParserLoad`](#symbol-parserload)[]
- Parameters: `_unnamed_`: [`PowerShellAst`](./powershell-edges.ts.mdmd.md#symbol-powershellast)

##### `parserLoads` — Summary
Every load the parser's record names a file for: dot-sources, module imports, `using module`, `#requires`, loops' listings, scripts run by path, a manifest's entries.

#### `parserCalls` {#symbol-parsercalls}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-wires.ts#L119)
- Parameters: `facts`: [`PowerShellScriptFacts`](./powershell-edges.ts.mdmd.md#symbol-powershellscriptfacts)

##### `parserCalls` — Summary
The names a script's commands call: names written out, not paths, not module-qualified, without a scope prefix, case-folded.

#### `isLibraryByParser` {#symbol-islibrarybyparser}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-wires.ts#L135)
- Parameters: `facts`: [`PowerShellScriptFacts`](./powershell-edges.ts.mdmd.md#symbol-powershellscriptfacts)

##### `isLibraryByParser` — Summary
Whether a script's own level only defines functions, filters, workflows
and classes, and otherwise only sets up its scope: dot-sources, scope-setting
commands and assignments that call nothing. Such a script does nothing when
run; it is there to be dot-sourced.

#### `ParserWorkspace` {#symbol-parserworkspace}
- Type: class
- Source: [source](../../../../scripts/oracle/powershell-wires.ts#L151)

##### `ParserWorkspace` — Summary
The workspace the parser's record describes, with what loading reaches worked out once.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:path` - `path`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`archetype.resolveArchetype`](../../packages/engine/src/live-docs/archetype.ts.mdmd.md#symbol-resolvearchetype)
- [`powershell-edges.PowerShellAst`](./powershell-edges.ts.mdmd.md#symbol-powershellast) (type-only)
- [`powershell-edges.PowerShellDataFileFacts`](./powershell-edges.ts.mdmd.md#symbol-powershelldatafilefacts) (type-only)
- [`powershell-edges.PowerShellScriptFacts`](./powershell-edges.ts.mdmd.md#symbol-powershellscriptfacts) (type-only)
- [`powershell-edges.isDataFileFacts`](./powershell-edges.ts.mdmd.md#symbol-isdatafilefacts)
- [`powershell-shipped.recorded`](./powershell-shipped.json.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
