# The software’s candidates, 2026-10-08

_Written by a scratchpad script over `.mdmd/index.json` as generated at `663fe804`, for [the sweep](../dead-code-sweep.md). This repository’s own files only: the sample programs under `tests/integration/programs` and every `fixtures` folder are inputs, not code of this workspace. A file or symbol is listed when the graph records no reference to it from another file, or only references from test files. The class column is the sweep’s hand judgment; the graph does not know it._

## Files

| File | Archetype | Graph says | Hand says |
| --- | --- | --- | --- |
| `package.json` | implementation | nothing references it | root manifest |
| `packages/cli/package.json` | implementation | nothing references it | package manifest |
| `packages/cli/src/index.ts` | implementation | nothing references it | entry: the CLI package’s `bin` and `main` (dist/index.js, built from it) |
| `packages/engine/src/live-docs/adapters/powershell.emit-ast.ps1` | implementation | nothing references it | tooling input: the PowerShell adapter runs it by a path joined at run time; the engine’s build script names the path |
| `packages/explorer/src/client/index.ts` | implementation | nothing references it | entry: esbuild’s entry point, named by a path string in buildAssets.ts |
| `packages/explorer/src/client/styles.css` | implementation | nothing references it | entry: the template links it; buildAssets.ts copies it by a path string |
| `packages/explorer/src/client/tsconfig.json` | implementation | nothing references it | tooling input: the explorer’s build script type-checks against it |
| `packages/explorer/src/client/views/membraneView/hierarchy.ts` | implementation | only tests reference it | dead: only its own test imports it; the Membrane Map stopped using it at d23a6f90 (2026-09-28) |
| `packages/explorer/src/shared/buildAssets.ts` | implementation | nothing references it | adapter miss: staticBuilder.ts loads it by a dynamic `import()` the TypeScript adapter does not record |
| `packages/generator/package.json` | implementation | nothing references it | package manifest |
| `scripts/doc-tools/enforce-documentation-links.ts` | implementation | only tests reference it | entry: package.json’s `docs:links:enforce` runs it; its test imports it too |
| `scripts/layout-lab/lab.ts` | implementation | nothing references it | entry: a package.json script runs it |
| `scripts/live-docs/board.ts` | implementation | nothing references it | entry: a package.json script runs it |
| `scripts/live-docs/find-orphans.ts` | implementation | nothing references it | dead by duplication: package.json’s `live-docs:orphans` and the CLI’s `orphans` run it, but the generator prunes stale docs itself (pruneStaleLiveDocs) |
| `scripts/live-docs/generate.ts` | implementation | nothing references it | entry: a package.json script runs it |
| `scripts/live-docs/inspect.ts` | implementation | nothing references it | entry: a package.json script runs it |
| `scripts/live-docs/lint.ts` | implementation | nothing references it | entry: a package.json script runs it |
| `scripts/live-docs/run-all.ts` | implementation | nothing references it | entry: package.json’s `livedocs` |
| `scripts/live-docs/visualize-sample.ts` | implementation | nothing references it | entry: a package.json script runs it |
| `scripts/live-docs/visualize-static.ts` | implementation | nothing references it | entry: a package.json script runs it |
| `scripts/oracle/index-fixture.ts` | implementation | nothing references it | entry: a package.json script runs it |
| `scripts/safe-to-commit.mjs` | implementation | nothing references it | entry: package.json’s `safe:commit` and `ci-check` |
| `scripts/slopcop/check-asset-paths.ts` | implementation | nothing references it | entry: a package.json script runs it |
| `scripts/slopcop/check-markdown-links.ts` | implementation | nothing references it | entry: a package.json script runs it |
| `scripts/slopcop/check-symbols.ts` | implementation | nothing references it | entry: a package.json script runs it |
| `scripts/verify.mjs` | implementation | nothing references it | entry: package.json’s `verify` |

Test files nothing references: 134, of which 132 match a test runner’s include glob (vitest’s unit and integration projects, Playwright’s `**/*.spec.ts` under tests/e2e) and two are tooling inputs: `tests/e2e/playwright.config.ts` and `tests/integration/tsconfig.json`.

## Symbols

Public symbols of this workspace’s implementation files with no symbol-level reference from another file (`no inbound`), or references only from test files (`only tests`). `own` counts the name’s whole-word mentions in its own file (1 is the definition alone); `elsewhere` counts other source files mentioning the name. Suffixed names such as `LinkTarget (interface)` are how the docs disambiguate two symbols that normalize alike; their mention counts were taken on the plain name by hand.

| File | Line | Symbol | Kind | Graph says | own | elsewhere |
| --- | ---: | --- | --- | --- | ---: | ---: |
| `package.json` | 1 | `live-documentation` | package | no inbound | 1 | 52 |
| `packages/cli/package.json` | 1 | `@live-documentation/cli` | package | no inbound | 1 | 0 |
| `packages/engine/src/config/liveDocumentationConfig.ts` | 11 | `LiveDocumentationSlugDialect` | type | no inbound | 2 | 0 |
| `packages/engine/src/config/liveDocumentationConfig.ts` | 82 | `LIVE_DOCUMENTATION_DEFAULT_ROOT` | const | no inbound | 2 | 1 |
| `packages/engine/src/config/liveDocumentationConfig.ts` | 84 | `LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER` | const | no inbound | 2 | 0 |
| `packages/engine/src/languages/index.ts` | 22 | `LanguageSyntax` | unknown | no inbound | 9 | 1 |
| `packages/engine/src/languages/index.ts` | 23 | `LanguageSyntaxConfig` | unknown | no inbound | 1 | 1 |
| `packages/engine/src/languages/index.ts` | 24 | `CommentDelimiters` | unknown | no inbound | 1 | 10 |
| `packages/engine/src/languages/index.ts` | 25 | `StringDelimiters` | unknown | no inbound | 1 | 10 |
| `packages/engine/src/languages/index.ts` | 28 | `createSyncStripper` | unknown | no inbound | 1 | 1 |
| `packages/engine/src/languages/index.ts` | 28 | `createLanguageSyntax` | unknown | no inbound | 1 | 10 |
| `packages/engine/src/languages/index.ts` | 28 | `stripCStyleComments` | unknown | no inbound | 1 | 1 |
| `packages/engine/src/languages/index.ts` | 31 | `csharpSyntax` | unknown | only tests | 3 | 2 |
| `packages/engine/src/languages/index.ts` | 34 | `powershellSyntax` | unknown | no inbound | 3 | 1 |
| `packages/engine/src/languages/index.ts` | 36 | `rubySyntax` | unknown | no inbound | 3 | 1 |
| `packages/engine/src/languages/index.ts` | 38 | `typescriptSyntax` | unknown | only tests | 3 | 2 |
| `packages/engine/src/languages/index.ts` | 78 | `getSyntaxById` | function | only tests | 1 | 1 |
| `packages/engine/src/languages/index.ts` | 88 | `getSyntaxByExtension` | function | only tests | 2 | 1 |
| `packages/engine/src/languages/index.ts` | 106 | `getAllSyntaxes` | function | no inbound | 1 | 0 |
| `packages/engine/src/languages/index.ts` | 115 | `isLanguageSupported` | function | only tests | 1 | 1 |
| `packages/engine/src/languages/index.ts` | 124 | `isExtensionSupported` | function | only tests | 1 | 1 |
| `packages/engine/src/languages/index.ts` | 136 | `stripCommentsForPath` | function | no inbound | 1 | 0 |
| `packages/engine/src/languages/index.ts` | 154 | `isFrameworkTypeForPath` | function | no inbound | 1 | 0 |
| `packages/engine/src/live-docs/adapters/csharp.dependencies.ts` | 40 | `TypeResolver` | type | no inbound | 3 | 0 |
| `packages/engine/src/live-docs/adapters/csharp.dependencies.ts` | 81 | `collectConfigKeys` | function | only tests | 3 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.dependencies.ts` | 93 | `collectConfigurationIndexerKeys` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.dependencies.ts` | 106 | `collectTypeNameLiterals` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.dependencies.ts` | 123 | `collectHangfireTargets` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.dependencies.ts` | 152 | `collectTypeIdentifiers` | function | only tests | 3 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.dependencies.ts` | 164 | `locateNearestFile` | function | only tests | 3 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.dependencies.ts` | 183 | `fileExists` | function | only tests | 2 | 3 |
| `packages/engine/src/live-docs/adapters/csharp.dependencies.ts` | 192 | `resolveReflectionTargets` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 24 | `RECOGNIZED_DOC_TAGS` | const | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 134 | `stripDocCommentMarker` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 145 | `extractSingleTagText` | function | only tests | 5 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 163 | `extractParameterTags` | function | only tests | 3 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 186 | `extractExceptionTags` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 215 | `extractExampleTags` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 249 | `extractLinkTags` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 308 | `extractRawDocFragments` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 332 | `detectUnsupportedTags` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 355 | `parseXmlAttributes` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 372 | `normalizeXmlText` | function | only tests | 6 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 441 | `decodeXmlEntities` | function | only tests | 6 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 457 | `normalizeCrefTarget` | function | only tests | 3 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 481 | `renderCrefText` | function | only tests | 3 | 1 |
| `packages/engine/src/live-docs/adapters/csharp.xmldoc.ts` | 496 | `hasStructuredContent` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/json.ts` | 30 | `PACKAGE_KIND` | const | no inbound | 3 | 0 |
| `packages/engine/src/live-docs/adapters/json.ts` | 212 | `collectKeyPaths` | function | no inbound | 3 | 0 |
| `packages/engine/src/live-docs/adapters/powershell.emit-ast.ps1` | 9 | `Resolve-CandidatePath` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/adapters/powershell.emit-ast.ps1` | 43 | `Extract-StringLiterals` | function | no inbound | 4 | 0 |
| `packages/engine/src/live-docs/adapters/powershell.emit-ast.ps1` | 77 | `Normalize-HelpString` | function | no inbound | 4 | 0 |
| `packages/engine/src/live-docs/adapters/powershell.emit-ast.ps1` | 95 | `Convert-CommentHelpInfo` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/adapters/project.ts` | 30 | `PROJECT_KINDS` | const | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/adapters/project.ts` | 37 | `projectKind` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/project.ts` | 47 | `projectName` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 26 | `MutableDocstringState` | interface | no inbound | 8 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 41 | `createEmptyDocstringState` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 166 | `extractDocstringSummary` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 206 | `parseRestFields` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 338 | `detectGoogleSections` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 345 | `detectNumpySections` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 359 | `parseGoogleSections` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 444 | `parseNumpySections` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 516 | `collectIndentedBlock` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 540 | `collectGoogleBlock` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 567 | `collectNumpyBlock` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 595 | `parseGoogleParameters` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 611 | `parseGoogleReturns` | function | no inbound | 3 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 627 | `parseGoogleExceptions` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 645 | `parseNumpyParameters` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 661 | `parseNumpyReturns` | function | no inbound | 3 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 677 | `parseNumpyExceptions` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 692 | `parseIndentedEntries` | function | only tests | 4 | 1 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 751 | `parseNumpyEntries` | function | only tests | 4 | 1 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 808 | `normalizeExample` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 853 | `joinParagraphs` | function | only tests | 13 | 2 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 863 | `detectMinimumIndent` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 884 | `ensureParameter` | function | no inbound | 5 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 900 | `ensureException` | function | no inbound | 4 | 0 |
| `packages/engine/src/live-docs/adapters/python.docstring.ts` | 916 | `capitalize` | function | only tests | 5 | 5 |
| `packages/engine/src/live-docs/adapters/treeSitter.ts` | 14 | `SyntaxTree` | type | no inbound | 1 | 0 |
| `packages/engine/src/live-docs/adapters/treeSitter.ts` | 22 | `grammarParser` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/board.ts` | 65 | `Connection` | interface | no inbound | 5 | 7 |
| `packages/engine/src/live-docs/board.ts` | 75 | `LegendEntry` | interface | no inbound | 5 | 0 |
| `packages/engine/src/live-docs/board.ts` | 81 | `Placement` | interface | no inbound | 3 | 4 |
| `packages/engine/src/live-docs/board.ts` | 97 | `DEFAULT_LEGEND` | const | only tests | 2 | 1 |
| `packages/engine/src/live-docs/boardGraph.ts` | 44 | `Wire` | interface | no inbound | 6 | 4 |
| `packages/engine/src/live-docs/boardGraph.ts` | 71 | `BoardThing` | interface | no inbound | 5 | 0 |
| `packages/engine/src/live-docs/boardGraph.ts` | 211 | `doorsOf` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/core.ts` | 33 | `ResolvedSymbolLocation` | unknown | no inbound | 1 | 4 |
| `packages/engine/src/live-docs/core.ts` | 38 | `ReExportedSymbolInfo` | unknown | no inbound | 1 | 3 |
| `packages/engine/src/live-docs/core.ts` | 39 | `LocationInfo` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 40 | `SymbolDocumentationField` | unknown | no inbound | 1 | 1 |
| `packages/engine/src/live-docs/core.ts` | 47 | `PublicSymbolHeadingInfo` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 57 | `SUPPORTED_SCRIPT_EXTENSIONS` | unknown | no inbound | 1 | 3 |
| `packages/engine/src/live-docs/core.ts` | 58 | `IMPLEMENTATION_CODE_EXTENSIONS` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 59 | `MODULE_RESOLUTION_EXTENSIONS` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 60 | `RESERVED_HEADING_NAMES` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 68 | `formatSourceLink` | unknown | no inbound | 1 | 1 |
| `packages/engine/src/live-docs/core.ts` | 69 | `formatRelativePathFromDoc` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 70 | `createSymbolSlug` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 71 | `toModuleLabel` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 72 | `formatInlineCode` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 73 | `formatDependencyQualifier` | unknown | no inbound | 1 | 1 |
| `packages/engine/src/live-docs/core.ts` | 74 | `resolveExportAssignmentName` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 75 | `hasExportModifier` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 76 | `hasDefaultModifier` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 77 | `getNodeLocation` | unknown | no inbound | 1 | 3 |
| `packages/engine/src/live-docs/core.ts` | 78 | `displayDependencyKey` | unknown | no inbound | 1 | 3 |
| `packages/engine/src/live-docs/core.ts` | 79 | `isBarrelFilePath` | unknown | no inbound | 1 | 1 |
| `packages/engine/src/live-docs/core.ts` | 80 | `compareSymbolLocationsPreferOrigin` | unknown | no inbound | 1 | 1 |
| `packages/engine/src/live-docs/core.ts` | 81 | `commonDirectoryPrefixLength` | unknown | no inbound | 1 | 1 |
| `packages/engine/src/live-docs/core.ts` | 82 | `createProximityAwareComparator` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 108 | `inferScriptKind` | unknown | no inbound | 1 | 4 |
| `packages/engine/src/live-docs/core.ts` | 109 | `collectExportedSymbols` | unknown | only tests | 1 | 6 |
| `packages/engine/src/live-docs/core.ts` | 117 | `collectDependencies` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 118 | `mergeDependencyEntries` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 119 | `resolveDependency` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 120 | `shouldInferDomDependencies` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 121 | `augmentWithReExportedSymbols` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 139 | `extractJsDocDocumentation` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 146 | `detectChangedFiles` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/core.ts` | 147 | `parsePorcelainLine` | unknown | no inbound | 1 | 1 |
| `packages/engine/src/live-docs/core.ts` | 148 | `execFileAsync` | unknown | no inbound | 1 | 2 |
| `packages/engine/src/live-docs/coreTypes.ts` | 233 | `DependencyBasis` | type | no inbound | 2 | 1 |
| `packages/engine/src/live-docs/document.ts` | 57 | `ReferenceRole` | type | no inbound | 3 | 0 |
| `packages/engine/src/live-docs/document.ts` | 121 | `DEFAULT_AUTHORED_BLOCK` | const | only tests | 4 | 1 |
| `packages/engine/src/live-docs/document.ts` | 165 | `renderSymbolBlocks` | function | only tests | 2 | 4 |
| `packages/engine/src/live-docs/graph.ts` | 48 | `EdgeKind` | type | no inbound | 3 | 0 |
| `packages/engine/src/live-docs/graph.ts` | 51 | `EdgeBasis` | type | no inbound | 3 | 0 |
| `packages/engine/src/live-docs/graph.ts` | 194 | `LinkTarget (interface)` | interface | no inbound | 0 | 0 |
| `packages/engine/src/live-docs/graph.ts` | 211 | `linkTarget (function)` | function | only tests | 0 | 0 |
| `packages/engine/src/live-docs/heuristics/routes.ts` | 84 | `collectRouteCalls` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/heuristics/routes.ts` | 165 | `urlText` | function | no inbound | 9 | 0 |
| `packages/engine/src/live-docs/openings.ts` | 79 | `parseRouteSymbol` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/openings.ts` | 89 | `routesMatch` | function | only tests | 2 | 1 |
| `packages/engine/src/live-docs/openings.ts` | 121 | `servedRoutes` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/openings.ts` | 173 | `homeOf` | function | only tests | 3 | 1 |
| `packages/engine/src/live-docs/openings.ts` | 233 | `sqlDeclaredName` | function | no inbound | 3 | 0 |
| `packages/engine/src/live-docs/openings.ts` | 244 | `stripSql` | function | only tests | 3 | 1 |
| `packages/engine/src/live-docs/openings.ts` | 249 | `SqlDeclaration` | interface | no inbound | 3 | 0 |
| `packages/engine/src/live-docs/openings.ts` | 266 | `SqlReference` | interface | no inbound | 3 | 0 |
| `packages/engine/src/live-docs/openings.ts` | 298 | `DeclaredSqlObject` | interface | no inbound | 4 | 0 |
| `packages/engine/src/live-docs/openings.ts` | 307 | `declaredSqlObjects` | function | no inbound | 2 | 0 |
| `packages/engine/src/live-docs/pathfind.ts` | 19 | `FrontierEntry` | interface | no inbound | 3 | 0 |
| `packages/engine/src/live-docs/pathfind.ts` | 153 | `getNeighbors` | function | no inbound | 3 | 0 |
| `packages/engine/src/tooling/githubSlugger.ts` | 15 | `SlugContext` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/bootstrap/index.ts` | 9 | `scoreNode` | unknown | no inbound | 1 | 1 |
| `packages/explorer/src/client/bootstrap/index.ts` | 10 | `buildDegreeMap` | unknown | no inbound | 1 | 1 |
| `packages/explorer/src/client/bootstrap/index.ts` | 11 | `LinkEndpointResolver` | type (type-only) | no inbound | 1 | 3 |
| `packages/explorer/src/client/detailPanel.ts` | 16 | `DetailPanelApi` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/detailPanel.ts` | 28 | `DetailPanelOptions` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/download.ts` | 21 | `DocEntry` | interface | no inbound | 5 | 0 |
| `packages/explorer/src/client/download.ts` | 31 | `DownloadContext` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/graph-helpers.ts` | 94 | `escapeHtml` | const | no inbound | 1 | 11 |
| `packages/explorer/src/client/markdown.ts` | 132 | `RenderMarkdownOptions` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/panels/omnisearch.ts` | 11 | `OmnisearchSelectCallback` | type | no inbound | 2 | 0 |
| `packages/explorer/src/client/panels/omnisearch.ts` | 14 | `OmnisearchConfig` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/panels/sources-view.ts` | 17 | `NavigateToNodeCallback` | type | no inbound | 3 | 0 |
| `packages/explorer/src/client/panels/sources-view.ts` | 26 | `DownloadCallback` | type | no inbound | 2 | 0 |
| `packages/explorer/src/client/panels/sources-view.ts` | 29 | `ViewBundledDocCallback` | type | no inbound | 2 | 0 |
| `packages/explorer/src/client/panels/sources-view.ts` | 32 | `BundledDocsData` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/panels/sources-view.ts` | 38 | `SourcesViewConfig` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/panels/tuning.ts` | 11 | `TuningChangeCallback` | type | no inbound | 2 | 0 |
| `packages/explorer/src/client/panels/tuning.ts` | 14 | `RenderCallback` | type | no inbound | 2 | 0 |
| `packages/explorer/src/client/panels/tuning.ts` | 17 | `TuningPanelConfig` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/pathfind.ts` | 18 | `PathfindState` | interface | no inbound | 5 | 0 |
| `packages/explorer/src/client/pathfind.ts` | 55 | `PathfindCallbacks` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/pathfind.ts` | 262 | `PathfindApi` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/persistence/compressed-url-state.ts` | 40 | `CompressedPayload` | interface | only tests | 7 | 2 |
| `packages/explorer/src/client/persistence/compressed-url-state.ts` | 81 | `DEFAULT_SNAPSHOT` | const | only tests | 10 | 2 |
| `packages/explorer/src/client/persistence/compressed-url-state.ts` | 98 | `snapshotToPayload` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/persistence/compressed-url-state.ts` | 141 | `payloadToSnapshot` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/persistence/history.ts` | 11 | `HistoryEntry` | type | no inbound | 2 | 0 |
| `packages/explorer/src/client/persistence/history.ts` | 14 | `HistoryWrite` | interface | only tests | 2 | 1 |
| `packages/explorer/src/client/persistence/history.ts` | 28 | `entryFor` | function | only tests | 3 | 1 |
| `packages/explorer/src/client/persistence/index.ts` | 8 | `viewNameToInternal` | unknown | no inbound | 1 | 2 |
| `packages/explorer/src/client/persistence/index.ts` | 9 | `viewNameToUrl` | unknown | no inbound | 1 | 1 |
| `packages/explorer/src/client/persistence/index.ts` | 12 | `InitialUrlState` | type (type-only) | no inbound | 1 | 1 |
| `packages/explorer/src/client/persistence/index.ts` | 17 | `PERSISTED_UI_KEY` | unknown | no inbound | 1 | 7 |
| `packages/explorer/src/client/persistence/index.ts` | 18 | `PERSISTED_UI_VERSION` | unknown | no inbound | 1 | 1 |
| `packages/explorer/src/client/persistence/index.ts` | 19 | `PersistedUiV1` | type (type-only) | no inbound | 1 | 1 |
| `packages/explorer/src/client/persistence/index.ts` | 25 | `PersistUiScheduler` | type (type-only) | no inbound | 1 | 1 |
| `packages/explorer/src/client/persistence/index.ts` | 28 | `PERSISTED_NAV_KEY` | unknown | no inbound | 1 | 1 |
| `packages/explorer/src/client/persistence/index.ts` | 29 | `PERSISTED_NAV_VERSION` | unknown | no inbound | 1 | 1 |
| `packages/explorer/src/client/persistence/index.ts` | 30 | `PersistedNavV1` | type (type-only) | no inbound | 1 | 1 |
| `packages/explorer/src/client/persistence/index.ts` | 33 | `PersistNavScheduler` | type (type-only) | no inbound | 1 | 1 |
| `packages/explorer/src/client/tsconfig.json` |  | `extends` | key | no inbound | 1 | 43 |
| `packages/explorer/src/client/tsconfig.json` |  | `compilerOptions` | key | no inbound | 1 | 5 |
| `packages/explorer/src/client/tsconfig.json` |  | `compilerOptions:lib` | key | no inbound | 0 | 0 |
| `packages/explorer/src/client/tsconfig.json` |  | `compilerOptions:composite` | key | no inbound | 0 | 0 |
| `packages/explorer/src/client/tsconfig.json` |  | `compilerOptions:declaration` | key | no inbound | 0 | 0 |
| `packages/explorer/src/client/tsconfig.json` |  | `compilerOptions:declarationMap` | key | no inbound | 0 | 0 |
| `packages/explorer/src/client/tsconfig.json` |  | `compilerOptions:noEmit` | key | no inbound | 0 | 0 |
| `packages/explorer/src/client/tsconfig.json` |  | `compilerOptions:incremental` | key | no inbound | 0 | 0 |
| `packages/explorer/src/client/tsconfig.json` |  | `compilerOptions:module` | key | no inbound | 0 | 0 |
| `packages/explorer/src/client/tsconfig.json` |  | `include` | key | no inbound | 1 | 27 |
| `packages/explorer/src/client/views/circuitView/aggregation.ts` | 125 | `computeDirectoryAggregates` | function | only tests | 1 | 1 |
| `packages/explorer/src/client/views/circuitView/index.ts` | 54 | `CircuitViewOptions` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/circuitView/index.ts` | 65 | `CircuitViewApi` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/circuitView/state.ts` | 30 | `collapseDirectory` | function | only tests | 1 | 1 |
| `packages/explorer/src/client/views/circuitView/state.ts` | 40 | `collapseToDepth` | function | only tests | 1 | 1 |
| `packages/explorer/src/client/views/connection-geometry.ts` | 24 | `Rect` | interface | only tests | 8 | 3 |
| `packages/explorer/src/client/views/connection-geometry.ts` | 75 | `computeStubLength` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/connection-geometry.ts` | 157 | `distance` | function | only tests | 13 | 12 |
| `packages/explorer/src/client/views/connection-geometry.ts` | 192 | `LACE_PITCH` | const | only tests | 2 | 2 |
| `packages/explorer/src/client/views/connection-geometry.ts` | 211 | `SelfLoopStubResult` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/connection-geometry.ts` | 352 | `offsetToPinEdge` | function | only tests | 1 | 1 |
| `packages/explorer/src/client/views/connection-geometry.ts` | 366 | `rectCenter` | function | only tests | 1 | 1 |
| `packages/explorer/src/client/views/connection-geometry.ts` | 376 | `rectSize` | function | only tests | 1 | 1 |
| `packages/explorer/src/client/views/connection-geometry.ts` | 386 | `expandRect` | function | only tests | 1 | 1 |
| `packages/explorer/src/client/views/connection-geometry.ts` | 398 | `boundingBoxFromPoints` | function | only tests | 1 | 1 |
| `packages/explorer/src/client/views/connection-geometry.ts` | 419 | `mergeRects` | function | only tests | 1 | 1 |
| `packages/explorer/src/client/views/connection-geometry.ts` | 433 | `GradientDef` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/connection-geometry.ts` | 455 | `createConnectionGradient` | function | only tests | 1 | 2 |
| `packages/explorer/src/client/views/fileConnections.ts` | 2 | `FileConnection` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/forceGraphView.ts` | 33 | `ForceGraphLink` | interface | no inbound | 7 | 0 |
| `packages/explorer/src/client/views/forceGraphView.ts` | 40 | `ForceGraphNode` | type | no inbound | 13 | 0 |
| `packages/explorer/src/client/views/forceGraphView.ts` | 49 | `ForceGraphData` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/forceGraphView.ts` | 60 | `ForceGraphViewOptions` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/forceGraphView.ts` | 74 | `ForceGraphViewApi` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/layoutUtils.ts` | 39 | `NodeLayoutPlan` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/layoutUtils.ts` | 46 | `FileAreaLayoutPlan` | interface | no inbound | 4 | 0 |
| `packages/explorer/src/client/views/layoutUtils.ts` | 75 | `DirectoryLayoutResult` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/layoutUtils.ts` | 96 | `LayoutConstants (interface)` | interface | no inbound | 0 | 1 |
| `packages/explorer/src/client/views/layoutUtils.ts` | 153 | `layoutConstants (const)` | const | no inbound | 0 | 1 |
| `packages/explorer/src/client/views/layoutUtils.ts` | 582 | `findDominantDirectory` | function | no inbound | 1 | 0 |
| `packages/explorer/src/client/views/localView/branch-motion.ts` | 22 | `PosedBox` | interface | no inbound | 7 | 0 |
| `packages/explorer/src/client/views/localView/branch-motion.ts` | 39 | `PosedItem` | interface | no inbound | 6 | 0 |
| `packages/explorer/src/client/views/localView/branch-order.ts` | 68 | `Bundle` | interface | no inbound | 2 | 1 |
| `packages/explorer/src/client/views/localView/branch-order.ts` | 435 | `walkColumns` | function | only tests | 6 | 1 |
| `packages/explorer/src/client/views/localView/branch-order.ts` | 471 | `repackRows` | function | no inbound | 5 | 0 |
| `packages/explorer/src/client/views/localView/branch-order.ts` | 540 | `countCrossings` | function | no inbound | 4 | 0 |
| `packages/explorer/src/client/views/localView/branch-order.ts` | 559 | `crossingsOf` | function | only tests | 1 | 1 |
| `packages/explorer/src/client/views/localView/branch-placement.ts` | 54 | `Pin` | interface | no inbound | 3 | 19 |
| `packages/explorer/src/client/views/localView/branch-placement.ts` | 88 | `Segment` | interface | only tests | 4 | 3 |
| `packages/explorer/src/client/views/localView/branch-placement.ts` | 95 | `PlacementLane` | interface | only tests | 3 | 1 |
| `packages/explorer/src/client/views/localView/branch-placement.ts` | 106 | `PlacementInput` | interface | only tests | 2 | 1 |
| `packages/explorer/src/client/views/localView/branch-placement.ts` | 140 | `placementCost` | function | only tests | 2 | 12 |
| `packages/explorer/src/client/views/localView/branch-renderer.ts` | 218 | `BAND_BORDER` | unknown | no inbound | 2 | 2 |
| `packages/explorer/src/client/views/localView/branch-restarts.ts` | 22 | `Start` | type | no inbound | 8 | 4 |
| `packages/explorer/src/client/views/localView/branch-restarts.ts` | 47 | `StartOutcome` | interface | no inbound | 4 | 0 |
| `packages/explorer/src/client/views/localView/branch-restarts.ts` | 77 | `previousStart` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/localView/branch-scene.ts` | 45 | `DEFAULT_SCENE_TUNING` | const | only tests | 2 | 2 |
| `packages/explorer/src/client/views/localView/branch-scene.ts` | 51 | `SLOT_LINE` | const | only tests | 3 | 1 |
| `packages/explorer/src/client/views/localView/branch-scene.ts` | 67 | `SceneBoxKind` | type | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/localView/branch-scene.ts` | 100 | `SceneItem` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/localView/branch-scene.ts` | 129 | `SceneMeasurement` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/localView/branch-search.ts` | 29 | `SearchSettings` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/localView/branch-search.ts` | 115 | `orderedRows` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/localView/branches.ts` | 28 | `BranchRanking` | interface | no inbound | 4 | 0 |
| `packages/explorer/src/client/views/localView/branches.ts` | 34 | `RankingOptions` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/localView/branches.ts` | 56 | `BranchOptions` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/localView/branches.ts` | 115 | `closedDirectoryNode` | function | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/localView/branches.ts` | 124 | `directoryIndex` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/localView/branches.ts` | 150 | `placeMembers` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/localView/branches.ts` | 199 | `buildBranches` | function | only tests | 1 | 3 |
| `packages/explorer/src/client/views/localView/branches.ts` | 358 | `commonDirectory` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/localView/branches.ts` | 375 | `membraneDirectory` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/localView/branches.ts` | 419 | `rankBranches` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/localView/card-factory.ts` | 199 | `createSymbolSection` | function | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/localView/card-factory.ts` | 375 | `createTypeReferenceIndicator` | function | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/localView/card-factory.ts` | 426 | `createTypeBadge` | function | no inbound | 5 | 0 |
| `packages/explorer/src/client/views/localView/column-factory.ts` | 247 | `computeDirectionalAlignmentValue` | function | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/localView/connections.ts` | 14 | `ConnectionsContext` | interface | no inbound | 5 | 0 |
| `packages/explorer/src/client/views/localView/directory-state.ts` | 26 | `DirectoryState (type)` | type | no inbound | 0 | 0 |
| `packages/explorer/src/client/views/localView/index.ts` | 27 | `LocalViewApi` | unknown | no inbound | 3 | 2 |
| `packages/explorer/src/client/views/localView/index.ts` | 27 | `LocalViewOptions` | unknown | no inbound | 3 | 4 |
| `packages/explorer/src/client/views/localView/layout-measure.ts` | 16 | `Bounds` | interface | only tests | 9 | 2 |
| `packages/explorer/src/client/views/localView/layout-measure.ts` | 46 | `clamp` | function | only tests | 7 | 8 |
| `packages/explorer/src/client/views/localView/layout-measure.ts` | 53 | `measureElementsBounds` | function | no inbound | 3 | 1 |
| `packages/explorer/src/client/views/localView/layout-measure.ts` | 97 | `measureElementBounds` | function | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/localView/layout-measure.ts` | 282 | `buildAnchorGuideKey` | function | no inbound | 7 | 0 |
| `packages/explorer/src/client/views/localView/layout-renderer.ts` | 160 | `reorderDirectory` | function | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/localView/membrane-outline.ts` | 16 | `OutlineSegment` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/localView/membrane-outline.ts` | 24 | `OutlinePoint` | interface | no inbound | 4 | 0 |
| `packages/explorer/src/client/views/localView/network-simplex.ts` | 27 | `Ranking` | interface | no inbound | 2 | 1 |
| `packages/explorer/src/client/views/localView/pan-zoom.ts` | 17 | `clamp` | function | only tests | 5 | 8 |
| `packages/explorer/src/client/views/localView/pan-zoom.ts` | 24 | `easeOutCubic` | function | only tests | 2 | 2 |
| `packages/explorer/src/client/views/localView/pan-zoom.ts` | 32 | `applyMapTransform` | function | no inbound | 1 | 0 |
| `packages/explorer/src/client/views/localView/pan-zoom.ts` | 62 | `zoomAtPoint` | function | only tests | 2 | 4 |
| `packages/explorer/src/client/views/localView/runtime.ts` | 24 | `AnchorRegistry` | type | no inbound | 7 | 0 |
| `packages/explorer/src/client/views/localView/runtime.ts` | 31 | `buildRegistryKey` | function | no inbound | 4 | 0 |
| `packages/explorer/src/client/views/localView/runtime.ts` | 40 | `buildRegistryKeyWithHop` | function | no inbound | 7 | 0 |
| `packages/explorer/src/client/views/localView/runtime.ts` | 45 | `DragPosition` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/localView/state.ts` | 2 | `HoveredSymbol` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/localView/state.ts` | 28 | `StateSubscriber` | type | no inbound | 4 | 0 |
| `packages/explorer/src/client/views/localView/subgraph-builder.ts` | 17 | `NodeFilter` | type | only tests | 2 | 2 |
| `packages/explorer/src/client/views/localView/subgraph-builder.ts` | 22 | `LinkEndpointResolver` | type | only tests | 3 | 3 |
| `packages/explorer/src/client/views/localView/subgraph-builder.ts` | 27 | `NodeResolver` | type | only tests | 3 | 1 |
| `packages/explorer/src/client/views/localView/symbol-highlight.ts` | 17 | `SymbolHighlightResult` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/localView/types.ts` | 149 | `Bounds` | interface | no inbound | 3 | 2 |
| `packages/explorer/src/client/views/membraneView/animation.ts` | 20 | `PositionSnapshot` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/membraneView/animation.ts` | 28 | `PositionMap` | type | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/membraneView/browse-renderer.ts` | 57 | `BrowseRenderCallbacks` | interface | no inbound | 4 | 0 |
| `packages/explorer/src/client/views/membraneView/browse-renderer.ts` | 71 | `BrowseRenderResult` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/membraneView/focal-overlay.ts` | 24 | `FocalOverlayCallbacks` | interface | no inbound | 4 | 0 |
| `packages/explorer/src/client/views/membraneView/focal-overlay.ts` | 44 | `FocalOverlayResult` | interface | no inbound | 4 | 0 |
| `packages/explorer/src/client/views/membraneView/focal-overlay.ts` | 545 | `hopLabel` | function | only tests | 3 | 1 |
| `packages/explorer/src/client/views/membraneView/focal-overlay.ts` | 592 | `BreadcrumbCallbacks` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/membraneView/focal-overlay.ts` | 787 | `clearHoverDimming` | function | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/membraneView/hierarchy.ts` | 25 | `isBarrelFile` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/membraneView/hierarchy.ts` | 41 | `applyBarrelSemantics` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/membraneView/index.ts` | 55 | `MembraneViewOptions` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/membraneView/index.ts` | 66 | `MembraneViewApi` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/membraneView/pin-active-renderer.ts` | 53 | `PinActiveCallbacks` | interface | no inbound | 4 | 0 |
| `packages/explorer/src/client/views/membraneView/pin-active-renderer.ts` | 62 | `PinActiveRenderResult` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/membraneView/pin-layout.ts` | 37 | `MembraneGroup` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/membraneView/pin-layout.ts` | 109 | `computeLCA` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/membraneView/pin-layout.ts` | 127 | `buildAncestorChain` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/membraneView/routing.ts` | 28 | `TraceKind` | type | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/membraneView/routing.ts` | 91 | `classifyTrace` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/membraneView/routing.ts` | 108 | `computeFrontTrace` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/membraneView/routing.ts` | 136 | `computeBackTrace` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/membraneView/routing.ts` | 192 | `ConnectionToRoute` | interface | only tests | 2 | 1 |
| `packages/explorer/src/client/views/membraneView/routing.ts` | 202 | `routeConnections` | function | only tests | 1 | 1 |
| `packages/explorer/src/client/views/membraneView/types.ts` | 7 | `WeightFunction` | type | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/perspectiveGeometry.ts` | 5 | `transitionEase` | function | no inbound | 5 | 0 |
| `packages/explorer/src/client/views/perspectiveTransition.ts` | 4 | `SceneFile` | interface | no inbound | 4 | 0 |
| `packages/explorer/src/client/views/perspectiveTransition.ts` | 47 | `LocalScene` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/pin-state.ts` | 22 | `PinEntry` | interface | no inbound | 6 | 0 |
| `packages/explorer/src/client/views/pin-state.ts` | 76 | `removePin` | function | only tests | 2 | 2 |
| `packages/explorer/src/client/views/pin-state.ts` | 133 | `setPinsFromPath` | function | only tests | 1 | 1 |
| `packages/explorer/src/client/views/squarify.ts` | 17 | `SquarifyTile` | interface | only tests | 4 | 1 |
| `packages/explorer/src/client/views/symbolAnchors.ts` | 7 | `AnchorDirection` | type | no inbound | 4 | 0 |
| `packages/explorer/src/client/views/symbolAnchors.ts` | 102 | `NormalizedAnchorKey` | type | no inbound | 1 | 0 |
| `packages/explorer/src/client/views/worldMap/controller.ts` | 65 | `Hover` | interface | no inbound | 15 | 7 |
| `packages/explorer/src/client/views/worldMap/controller.ts` | 70 | `WorldMapOptions` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/worldMap/controller.ts` | 1681 | `NORMALS` | unknown | no inbound | 2 | 1 |
| `packages/explorer/src/client/views/worldMap/index.ts` | 14 | `WorldMapViewOptions` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/worldMap/index.ts` | 24 | `WorldMapView` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/worldMap/layout.ts` | 11 | `UNIT` | const | no inbound | 5 | 0 |
| `packages/explorer/src/client/views/worldMap/layout.ts` | 15 | `LIFT` | const | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/worldMap/layout.ts` | 21 | `SHAPE_WORDS` | const | no inbound | 1 | 0 |
| `packages/explorer/src/client/views/worldMap/layout.ts` | 24 | `Solid` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/worldMap/layout.ts` | 33 | `solidFor` | function | only tests | 2 | 1 |
| `packages/explorer/src/client/views/worldMap/layout.ts` | 107 | `PlacementGroup` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/worldMap/model.ts` | 24 | `WorldPiece` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/worldMap/model.ts` | 42 | `WorldRegion` | interface | no inbound | 5 | 0 |
| `packages/explorer/src/client/views/worldMap/model.ts` | 69 | `WorldCrossing` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/client/views/worldMap/model.ts` | 77 | `WorldToken` | interface | no inbound | 4 | 0 |
| `packages/explorer/src/client/views/worldMap/projection.ts` | 30 | `Viewport` | interface | no inbound | 2 | 2 |
| `packages/explorer/src/client/views/worldMap/projection.ts` | 48 | `rotate` | function | no inbound | 4 | 5 |
| `packages/explorer/src/client/views/worldMap/projection.ts` | 57 | `unrotate` | function | no inbound | 2 | 0 |
| `packages/explorer/src/client/views/worldMap/projection.ts` | 152 | `Face` | interface | no inbound | 3 | 0 |
| `packages/explorer/src/shared/buildAssets.ts` | 7 | `ExplorerAssets` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/shared/buildAssets.ts` | 20 | `buildExplorerAssets` | function | no inbound | 1 | 1 |
| `packages/explorer/src/shared/bundledMarkdownScanner.ts` | 16 | `BundledMarkdownTreeNode` | unknown | no inbound | 7 | 2 |
| `packages/explorer/src/shared/bundledMarkdownScanner.ts` | 21 | `BundledMarkdownResult` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/shared/bundledMarkdownScanner.ts` | 38 | `extractMarkdownLinks` | function | no inbound | 2 | 0 |
| `packages/explorer/src/shared/bundledMarkdownScanner.ts` | 83 | `categorizeMarkdownPath` | function | no inbound | 2 | 0 |
| `packages/explorer/src/shared/bundledMarkdownScanner.ts` | 90 | `buildMarkdownTree` | function | no inbound | 2 | 0 |
| `packages/explorer/src/shared/bundledMarkdownScanner.ts` | 150 | `ScanBundledMarkdownOptions` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/shared/staticBuilder.ts` | 32 | `BuildStaticExplorerOptions` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/shared/staticBuilder.ts` | 53 | `BuildStaticExplorerResult` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/shared/staticExplorerData.ts` | 30 | `BundledBoard` | interface | no inbound | 2 | 0 |
| `packages/explorer/src/shared/template.html` |  | `circuit-connections` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `circuit-container` | variable | no inbound | 1 | 2 |
| `packages/explorer/src/shared/template.html` |  | `circuit-viewport` | variable | no inbound | 1 | 3 |
| `packages/explorer/src/shared/template.html` |  | `context-bar` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `controls` | variable | no inbound | 2 | 16 |
| `packages/explorer/src/shared/template.html` |  | `detail-close` | variable | no inbound | 2 | 4 |
| `packages/explorer/src/shared/template.html` |  | `detail-title` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `download-doc-btn` | variable | no inbound | 1 | 0 |
| `packages/explorer/src/shared/template.html` |  | `filter-toggle-assets` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `filter-toggle-related-docs` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `filter-toggle-tests` | variable | no inbound | 1 | 2 |
| `packages/explorer/src/shared/template.html` |  | `graph-svg` | variable | no inbound | 1 | 5 |
| `packages/explorer/src/shared/template.html` |  | `main` | variable | no inbound | 1 | 49 |
| `packages/explorer/src/shared/template.html` |  | `map-connections` | variable | no inbound | 1 | 13 |
| `packages/explorer/src/shared/template.html` |  | `map-container` | variable | no inbound | 1 | 14 |
| `packages/explorer/src/shared/template.html` |  | `map-viewport` | variable | no inbound | 1 | 3 |
| `packages/explorer/src/shared/template.html` |  | `membrane-connections` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `membrane-container` | variable | no inbound | 1 | 6 |
| `packages/explorer/src/shared/template.html` |  | `membrane-viewport` | variable | no inbound | 1 | 3 |
| `packages/explorer/src/shared/template.html` |  | `omnisearch-trigger` | variable | no inbound | 1 | 0 |
| `packages/explorer/src/shared/template.html` |  | `pathfind-from-group` | variable | no inbound | 1 | 0 |
| `packages/explorer/src/shared/template.html` |  | `pathfind-to-group` | variable | no inbound | 1 | 0 |
| `packages/explorer/src/shared/template.html` |  | `sources-container` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-churn-cost-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-column-gap-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-hover-dim-connections-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-hover-dim-symbols-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-lace-curl-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-lace-reach-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-lace-width-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-membrane-evenness-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-order-starts-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-row-levelness-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-search-patience-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-search-starts-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-self-loop-taper-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-stub-factor-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-stub-max-offset-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-stub-min-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `tuning-vertical-offset-value` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `view-circuit` | variable | no inbound | 1 | 1 |
| `packages/explorer/src/shared/template.html` |  | `view-graph` | variable | no inbound | 1 | 3 |
| `packages/explorer/src/shared/template.html` |  | `view-membrane` | variable | no inbound | 1 | 6 |
| `packages/explorer/src/shared/template.html` |  | `view-sources` | variable | no inbound | 1 | 0 |
| `packages/explorer/src/shared/template.html` |  | `view-world` | variable | no inbound | 1 | 5 |
| `packages/explorer/src/shared/template.html` |  | `world-root` | variable | no inbound | 2 | 2 |
| `packages/explorer/src/shared/types.ts` | 139 | `ExplorerGraphStats` | interface | no inbound | 2 | 0 |
| `packages/generator/package.json` | 1 | `@live-documentation/generator` | package | no inbound | 1 | 5 |
| `packages/generator/src/generator.ts` | 61 | `LiveDocGeneratorResult` | interface | no inbound | 2 | 0 |
| `scripts/doc-tools/documentationLinks.ts` | 59 | `DocumentationAnchorSummary` | interface | no inbound | 4 | 0 |
| `scripts/doc-tools/documentationLinks.ts` | 83 | `DocumentationDocumentAnchors` | interface | only tests | 3 | 1 |
| `scripts/doc-tools/documentationLinks.ts` | 91 | `ResolvedDocumentationTarget` | interface | no inbound | 4 | 0 |
| `scripts/doc-tools/documentationLinks.ts` | 109 | `DocumentationTargetMap` | type | no inbound | 4 | 0 |
| `scripts/doc-tools/documentationLinks.ts` | 112 | `ParseDocumentationAnchorsOptions` | interface | no inbound | 2 | 0 |
| `scripts/doc-tools/documentationLinks.ts` | 162 | `RunDocumentationLinkEnforcementOptions` | interface | no inbound | 2 | 0 |
| `scripts/doc-tools/documentationLinks.ts` | 181 | `parseDocumentationAnchors` | function | only tests | 3 | 1 |
| `scripts/doc-tools/documentationLinks.ts` | 249 | `resolveCodeToDocumentationMap` | function | only tests | 2 | 1 |
| `scripts/doc-tools/documentationLinks.ts` | 294 | `formatDocumentationLinkComment` | function | only tests | 1 | 1 |
| `scripts/doc-tools/enforce-documentation-links.ts` | 34 | `EXIT_CODES` | const | only tests | 1 | 1 |
| `scripts/doc-tools/enforce-documentation-links.ts` | 49 | `runCli` | function | only tests | 2 | 3 |
| `scripts/layout-lab/capture.ts` | 31 | `FontMetrics` | interface | no inbound | 2 | 0 |
| `scripts/layout-lab/capture.ts` | 81 | `CardConstants` | interface | no inbound | 3 | 0 |
| `scripts/layout-lab/capture.ts` | 144 | `captureFromPage` | function | only tests | 2 | 1 |
| `scripts/layout-lab/card-model.ts` | 66 | `chipsHeight` | function | only tests | 2 | 1 |
| `scripts/layout-lab/evaluate.ts` | 55 | `Evaluation` | interface | no inbound | 3 | 0 |
| `scripts/layout-lab/evaluate.ts` | 70 | `scopePins` | function | no inbound | 2 | 0 |
| `scripts/layout-lab/evaluate.ts` | 75 | `includeNode` | function | no inbound | 2 | 1 |
| `scripts/layout-lab/measurer.ts` | 19 | `MeasurerOptions` | interface | no inbound | 3 | 0 |
| `scripts/layout-lab/measurer.ts` | 27 | `cardViews` | function | no inbound | 2 | 0 |
| `scripts/layout-lab/restarts.ts` | 33 | `StartRow` | interface | only tests | 21 | 1 |
| `scripts/layout-lab/restarts.ts` | 46 | `DEFAULT_COST_GRID` | const | no inbound | 2 | 0 |
| `scripts/layout-lab/restarts.ts` | 76 | `Adoption` | interface | no inbound | 3 | 0 |
| `scripts/layout-lab/restarts.ts` | 84 | `SearchTrial` | interface | no inbound | 4 | 0 |
| `scripts/layout-lab/restarts.ts` | 121 | `CostTrial` | interface | no inbound | 3 | 0 |
| `scripts/layout-lab/restarts.ts` | 191 | `WideSetting` | interface | no inbound | 6 | 0 |
| `scripts/layout-lab/restarts.ts` | 216 | `summarizeSetting` | function | only tests | 2 | 1 |
| `scripts/layout-lab/routes.ts` | 21 | `SAMPLE_PX` | const | no inbound | 2 | 0 |
| `scripts/layout-lab/routes.ts` | 40 | `CardRect` | interface | no inbound | 3 | 0 |
| `scripts/layout-lab/routes.ts` | 43 | `cardRects` | function | no inbound | 2 | 0 |
| `scripts/layout-lab/routes.ts` | 110 | `tracePath` | function | only tests | 2 | 1 |
| `scripts/layout-lab/routes.ts` | 143 | `lengthOf` | function | only tests | 2 | 1 |
| `scripts/layout-lab/routes.ts` | 150 | `resample` | function | only tests | 2 | 1 |
| `scripts/layout-lab/scopes.ts` | 22 | `DIST` | const | no inbound | 3 | 0 |
| `scripts/layout-lab/signals.ts` | 67 | `insidePolygon` | function | only tests | 2 | 1 |
| `scripts/layout-lab/signals.ts` | 77 | `fragmentsOf` | function | only tests | 2 | 1 |
| `scripts/layout-lab/signals.ts` | 93 | `unevennessOf` | function | only tests | 2 | 1 |
| `scripts/layout-lab/signals.ts` | 109 | `unlevelOf` | function | only tests | 2 | 1 |
| `scripts/layout-lab/sweep.ts` | 43 | `configKey` | const | no inbound | 3 | 0 |
| `scripts/layout-lab/sweep.ts` | 46 | `random` | function | no inbound | 2 | 2 |
| `scripts/layout-lab/sweep.ts` | 104 | `DEFAULT_WEIGHTS` | const | no inbound | 2 | 0 |
| `scripts/layout-lab/verify.ts` | 18 | `Verification` | interface | no inbound | 3 | 0 |
| `scripts/live-docs/board.ts` | 79 | `renderBoardReport` | function | no inbound | 2 | 0 |
| `scripts/live-docs/inspect/emit.ts` | 25 | `NodeDescriptor` | interface | no inbound | 4 | 0 |
| `scripts/live-docs/inspect/emit.ts` | 32 | `HopDescriptor` | interface | no inbound | 2 | 0 |
| `scripts/live-docs/inspect/emit.ts` | 38 | `SymbolDescriptor` | interface | no inbound | 5 | 0 |
| `scripts/live-docs/inspect/emit.ts` | 46 | `SymbolParameterDescriptor` | interface | no inbound | 4 | 0 |
| `scripts/live-docs/inspect/emit.ts` | 63 | `describeNode` | function | no inbound | 17 | 0 |
| `scripts/live-docs/inspect/emit.ts` | 85 | `buildSymbolDescriptors` | function | no inbound | 2 | 0 |
| `scripts/live-docs/inspect/resolve.ts` | 53 | `normalizeInputIdentifier` | function | no inbound | 2 | 0 |
| `scripts/live-docs/inspect/resolve.ts` | 78 | `stripLiveDocDecorations` | function | no inbound | 2 | 0 |
| `scripts/live-docs/inspect/resolve.ts` | 111 | `parseSymbolReference` | function | no inbound | 3 | 0 |
| `scripts/oracle/compare.ts` | 36 | `Report` | interface | no inbound | 8 | 1 |
| `scripts/oracle/compare.ts` | 191 | `compareFixture` | function | only tests | 2 | 1 |
| `scripts/oracle/files.ts` | 22 | `rebasePath` | function | no inbound | 4 | 0 |
| `scripts/oracle/files.ts` | 28 | `rebaseOracleEdges` | function | only tests | 3 | 1 |
| `scripts/oracle/files.ts` | 46 | `rebaseHandVerifiedEdges` | function | only tests | 2 | 1 |
| `scripts/oracle/scip-edges.ts` | 33 | `ScipIndex` | interface | only tests | 3 | 1 |
| `scripts/oracle/scip-edges.ts` | 39 | `ScipDocument` | interface | no inbound | 2 | 0 |
| `scripts/oracle/scip-edges.ts` | 54 | `OracleEdge` | interface | no inbound | 3 | 1 |
| `scripts/oracle/scip-edges.ts` | 61 | `OracleAmbiguity` | interface | no inbound | 3 | 0 |
| `scripts/oracle/scip-edges.ts` | 195 | `edgesFromIndex` | function | only tests | 2 | 1 |
| `scripts/slopcop/assetPaths.ts` | 15 | `AssetAuditOptions` | interface | no inbound | 2 | 0 |
| `scripts/slopcop/config.ts` | 11 | `SeveritySetting` | type | no inbound | 4 | 0 |
| `scripts/slopcop/config.ts` | 17 | `SlopcopConfigSection` | interface | no inbound | 6 | 0 |
| `scripts/slopcop/config.ts` | 49 | `SlopcopConfig` | interface | no inbound | 8 | 0 |
| `scripts/slopcop/config.ts` | 67 | `CONFIG_FILE_NAME` | const | no inbound | 3 | 0 |
| `scripts/slopcop/markdownLinks.ts` | 22 | `MarkdownLinkAuditOptions` | interface | no inbound | 2 | 0 |
| `scripts/slopcop/markdownShared.ts` | 4 | `ReferenceDefinition` | interface | no inbound | 3 | 0 |
| `scripts/slopcop/symbolReferences.ts` | 19 | `SymbolIssueKind` | type | no inbound | 2 | 2 |
| `scripts/slopcop/symbolReferences.ts` | 22 | `SymbolIssueSeverity` | type | no inbound | 4 | 0 |
| `scripts/slopcop/symbolReferences.ts` | 52 | `SymbolAuditOptions` | interface | no inbound | 2 | 0 |
