# packages/engine/src/live-docs/adapters/powershell.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/powershell.ts
- Generated At: 2026-10-22T16:47:52.091Z

## Authored
### Purpose
The PowerShell adapter: parses `.ps1`, `.psm1` and `.psd1` with the engine's own build of the tree-sitter PowerShell grammar and reports what a reading of PowerShell owes. Of a script or module: the functions it publishes with their comment-based help, the classes and enums it defines, and the files and modules it loads (dot-sources, `Import-Module`, `using module`, `#requires -Modules`); every `.ps1` is the program's entry. Of a module manifest: the module it publishes, the modules and scripts it names, and its root module as the `module` entry it declares. A `.psd1` that is a data file is read for nothing.

### Notes
- Rewritten over tree-sitter on 2026-10-16 ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#powershell-read-by-a-grammar-of-our-own-measured-against-powershells-own-parser-recorded-2026-10-16); [Turn 3 of the October 16 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)). From its beginning on 2025-11-20 (`c5678a94`) the adapter had run PowerShell's own parser through `pwsh` at generation time, from an emitter that moved beside it into the engine on 2026-09-27 (`b0a811c3`); that emitter, rewritten, is now the oracle, [`powershell-ast.ps1`](../../../../../../../.mdmd/layer-4/scripts/oracle/powershell-ast.ps1.mdmd.md), and generating docs needs no PowerShell. The bundled grammar could not read three constructs an estate's scripts use daily; shown the choice between landing with those holes and building a grammar first, the owner asked for the durable shape, "What is the right final shape? Build that, and then commit it." ([Turn 4](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-4)). The same day the grammar became the engine's own build ([`grammars/powershell`](../../../../../../../packages/engine/grammars/powershell/build.sh)) and the adapter took manifests, classes and enums, and resolution as Windows resolves.
- Symbols: every `function`, `filter` and `workflow`, nested ones included, under the name as written (`script:Get-LogPrefix` keeps its scope), at the line and column of the keyword, of kind `function`; every class and enum, of kinds `class` and `enum` as the C# adapter names them, at theirs; all in document order. A class's constructors and methods are not functions. A file that calls `Export-ModuleMember` publishes the functions its `-Function` patterns (or first argument) match, by PowerShell's wildcards and without regard to case. An `Export-ModuleMember` the grammar could not read in full, or one with a pattern not written out (`-Function $public`, a sub-expression), which only a run of the module could read, narrows nothing, so a misreading shows private functions rather than hiding public ones; the oracle's published list follows the same rule (settled on the evening of 2026-10-16 from that principle, which until then covered only a list the grammar misread). Classes and enums are not narrowed: a script reaches them through `using module`, which `Export-ModuleMember` does not govern.
- Help is found where PowerShell finds it: the comment block before the keyword with at most one blank line between, then each comment block opening the body, then the block before the closing brace. A block is help when every line outside a section is blank and every keyword is one PowerShell knows (`.SYNOPSIS text` on one line, or `.NET` at a line's start, makes it not help); `.SYNOPSIS`, `.DESCRIPTION` and each `.PARAMETER` become the summary, remarks and parameters, a parameter under the spelling the function declares; the other sections are read past. The rules were checked against PowerShell 7.5.4's parser on some fifty probe functions on 2026-10-16, with no disagreement; `powershell.test.ts` keeps the cases.
- `Import-Module` and `Export-ModuleMember` are bound by the cmdlets' signatures as PowerShell 7.5 declares them, so a switch takes no argument, `-ErrorAction Stop` names no module, and an abbreviated parameter is matched; `ipmo` and the `Microsoft.PowerShell.Core\` qualifier are recognised. A comma list of bare words (`-Function A, B`, over several lines too) is one argument of several strings. `using module` is read from the grammar's `using_statement` by name, string, module specification or path; `#requires -Modules`, a comment to the grammar, is read from the comment wherever it stands, by name, string or a hashtable's `ModuleName`.
- A path is resolved when the text alone fixes it: a string or a bare word written out (`$PSScriptRoot\..\lib\x.psm1` unquoted is one word), `$PSScriptRoot` or `${PSScriptRoot}` standing for the file's directory, a relative path taken from that directory, as if the script ran from where it lies (PowerShell resolves a relative dot-source or `Import-Module` path against the caller's location at run time, which no reading of the text knows). A module path may name a `.psm1`, a `.psd1` or a directory holding the module of its name. Each path is looked up in the workspace's file index, the generator's, as Windows finds a file: spelled exactly, or else the only file whose path differs in case alone, so `. .\Lib\Logging.ps1` finds `lib/logging.ps1` and a path that names two files differing in case alone stays unresolved. One case-folded map of an index is built per run. Without an index nothing resolves; a rooted path (a drive, a share, a leading separator) is outside what the workspace can say. A resolved path is the dependency's specifier; anything else keeps its text.
- Manifests: a `.psd1` whose table has a `RootModule` (or `ModuleToProcess`, its older name), a `ModuleVersion` or a `FunctionsToExport` is one. Its table is read through the grammar by a small reader of the data language, strings with their escapes, lists, `@()`, tables keyed without regard to case and numbers, anything else left unread. The module, named by the file's stem, is its one `package` symbol; each entry of its root module, `NestedModules`, `ScriptsToProcess` and `RequiredModules` that names a file from the manifest's folder (or a directory holding the module of its name) is a linked dependency, the oracle's rule too, and any other is external, `name@version` when a module specification writes a `RequiredVersion` (else a `ModuleVersion`); linked files come first in path order, then the externals sorted, as the other manifests write them. The root module is declared a `module` entry, so its doc says which manifest makes it one; the manifest itself is a `tooling` entry by the package it publishes, since its name cannot tell it from a data file.
- A file is decoded by its byte order mark, UTF-16 in either order, else UTF-8, as PowerShell reads it: measuring the grammar over the modules installed with `pwsh` on 2026-10-16 found two large ones in UTF-16, which a UTF-8 reading turns to noise. A file without a mark is read as UTF-8, where Windows PowerShell 5.1 would read the machine's code page; only the text of non-ASCII characters differs.
- Not followed: a module named rather than pathed, which a machine's module path finds, so a `RequiredModules` name stays external even when the workspace holds a module of that name; `Import-Module Name.psm1`, an extension without a separator, read as a name as the oracle reads it, where PowerShell takes it for a path from the current location; a path built from any other variable or an expression; a manifest's `FunctionsToExport`, which would narrow its root module's functions; a script run with `&`.
- Measured by [`powershell-oracle.test.ts`](../../../../../../../.mdmd/layer-4/tests/integration/live-docs/powershell-oracle.test.ts.mdmd.md) against the parser's records `expected/powershell-ast.json` of `tests/integration/programs/powershell/rollout` and `tests/integration/fixtures/powershell-compendium`, whose register of misses is empty; `oracle:compare` finds 8 of 8 and 3 of 3 of the parser's edges with nothing extra. With the bundled grammar in place of the built one the register would list five misses on the rollout program and two on the compendium. The `pwsh` adapter it replaced found 7 of the rollout program's 12 published functions and 3 of its 8 dependencies. Guarded by [`powershell.test.ts`](./powershell.test.ts.mdmd.md) and, for the grammar, [`treeSitter.test.ts`](./treeSitter.test.ts.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `analyzePowerShellSource` {#symbol-analyzepowershellsource}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/powershell.ts#L915)

##### `analyzePowerShellSource` — Summary
Analyzes one PowerShell file from its text, without the generator: a
script's or module's published functions, classes and enums, its
dependencies and whether it is a program, or a module manifest's module,
what it names and the root module it declares. Paths are resolved against
`fileIndex`, the workspace's files; without one, nothing resolves.

#### `powershellAdapter` {#symbol-powershelladapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/powershell.ts#L930)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `powershellAdapter` — Summary
Language adapter for PowerShell (`.ps1`, `.psm1`, `.psd1`): published functions with their comment-based help, classes and enums, dot-source, module and `#requires` dependencies, and module manifests; a `.ps1` script is the program's entry, a module or manifest is not.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`index.powershellSyntax`](../../languages/index.ts.mdmd.md#symbol-powershellsyntax)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`manifest.packageSymbols`](./manifest.ts.mdmd.md#symbol-packagesymbols)
- [`treeSitter.SyntaxNode`](./treeSitter.ts.mdmd.md#symbol-syntaxnode)
- [`treeSitter.parseSource`](./treeSitter.ts.mdmd.md#symbol-parsesource)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.SymbolDocumentationParameter`](../core.ts.mdmd.md#symbol-symboldocumentationparameter) (type-only)
- [`coreTypes.DeclaredEntry`](../coreTypes.ts.mdmd.md#symbol-declaredentry) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
