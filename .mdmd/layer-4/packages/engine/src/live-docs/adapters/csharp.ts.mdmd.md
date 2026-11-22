# `packages/engine/src/live-docs/adapters/csharp.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/csharp.ts`
- Generated At: 2026-11-22T07:28:48.634Z

## Authored
### Purpose
Harvests public symbols, XML doc comments, and dependency edges from C# sources, fulfilling the Nov 12 language-adapter initiative and the C# rollout that wired fixtures and polyglot tests into the Live Docs pipeline <../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/11/2025-11-12/2025-11-12.md#L330-L372> <../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/11/2025-11-12/2025-11-12.md#L626-L715>.

### Notes
- Backed by the `polyglot-fixtures` integration harness and manual inspection scripts created during the C# deployment, so changes here should re-run those checks <../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/11/2025-11-12/2025-11-12.md#L554-L715>.
- Extends Hangfire heuristics to capture scheduled and recurring jobs, mirroring the LD-402 queue-worker fixture coverage.
- The program's entry point is reported on the analysis result since 2026-10-15 ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)), from which the doc carries `- Entry: program`: a static `Main` of any accessibility and return type, with its line, or top-level statements (`global_statement` under the compilation unit), which take precedence over a `Main` as the compiler gives it; a type merely named `Main`, as the rosetta sample's `static class Main { Run }`, is none.
- Since 2026-11-19 ([the .NET probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md#fourth-leg-type-names-within-the-projects-reach)) a type name resolves within what the file's project can see (`dotnetProjects.ts`), in C#'s own lookup order, by the number of type arguments a use writes, with a project's `global using` directives applied to all its files, and a partial type's halves link through `this.member` as through a bare name; measured against the compiler's own edges on DNN and mojoPortal.
- Since the joining of 2026-11-21 ([the work item](../../../../../../../AI-Agent-Workspace/Work/readers-on-main.md)) why a type name has no link is handed to the run as a notice ("type names several projects in reach declare, left unlinked", "type names declared only outside the project's reach, left unlinked"), its subject the name as written, since the run names the file; until then the reader worked the reasons out and kept them.
- Since the same day a simple name inside a type is looked up in that type's members and then in the types it inherits members from, up the chain as far as the project's reach shows it, before any namespace or `using`, as C# does: an independent review found `Options` inside `class Derived : Base` linked to a `using`'s namesake instead of `Base.Options` (the `names` sample, `tests/integration/programs/csharp/names`). A base is the name the base list writes, resolved where the declaration stands; a class inherits from its base class and not from the interfaces it implements, an interface from its base interfaces, as the compiler showed on the test's cases. Measured by `oracle:csharp`: on DNN one edge the compiler binds and the reader lacked is drawn (`GrayscaleQuantizer.cs` to `Quantizer.cs`) and none is lost; on mojoPortal nothing moves.
- Since the same day a `using` alias is read from its syntax, its target's identifiers with the type arguments each writes, so `using H = Lib.Helper;` names the type with no type parameters and `using HT = Lib.Helper<int>;` the one with one, as the compiler binds them; the alias had been read as text, its arity unknown, so `H` linked `Helper.cs` and `HelperOfT.cs` both (the review's case, in the `names` sample). No edge moves on DNN or mojoPortal. Still open: a type nested in a generic type has the same qualified name as one nested in its non-generic namesake (`Lib.Helper.Part`), so `H.Part` is taken for an ambiguity and links nothing where the compiler binds `Helper.cs`.
- Since the same day a SQL name in a C# string binds by T-SQL's order of search, the SQL reader's `bindSqlName` in `openings.ts`: a name in a string is no module's, so a one-part name binds as a loose script's does, to `dbo`'s object and to none in another schema, and a two-part name to its own schema's. Until then a one-part name linked its namesake in every schema. Generated before and after, nothing moves on the estate sample (its two names are two-part) or on DNN (3 edges from C# to SQL files, none one-part names with a namesake in another schema).
- Known and not mended (2026-11-21): a member hides a type of its name where an expression is read, and the reader does not tell where an expression is read from where a type is, for a type's own members or its inherited ones. So `Gadget * 2` inside `MemberOverUsing : Base`, `Base`'s property, is taken for the class a `using` brings in (the `names` sample's `MemberOverUsing.cs`, listed in both oracle tests as a known miss). On mojoPortal it is 3 edges, three pages drawn to `Controls/SkinSetting.ascx.designer.cs` by a control field `SkinSetting` their own designer half declares; the 2 namesake edges on DNN are of other causes, a member name in an anonymous object's initializer (`BrowserTypes = …`) read as a type, and an interface two projects declare.
- Since 2026-11-21 ([the comment guard](./commentGuard.test.ts.mdmd.md), [its record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md)) the facts of a file carry where its comments lie, found by the grammar, and the patterns of `csharp.dependencies.ts` run over the text with them written over in spaces. A string's text is what the program holds: a regular string's escapes are the characters they stand for, so `"-- note\nSELECT …"` holds a line break that ends SQL's line comment; a verbatim string's doubled quote is one quote. No string in DNN's, mojoPortal's or the Core repositories' C# holds SQL so; one string of nopCommerce's prose, `… delete \"browscap.crawlersonly.xml\" …`, is now read as SQL naming `browscap.crawlersonly.xml`, since a string that holds `from` is read as SQL.
- Since the evening of 2026-11-21 a section an `#if false` or `#elif false` skips is written over before the syntax tree is read, a nested conditional counted, since C# lexes none: on DNN, six such sections, one the whole of `DotNetNuke.Web/Common/DotNetNukeSecurity.cs`, whose 11 C# pairs and 2 symbols are gone, none a pair the compiler binds. A condition on a symbol is read in every branch, as before. An interpolated string's escapes, nodes of their own in the grammar, are decoded too, and a test holds each form decoded ([the record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md#the-second-round-after-an-independent-review)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TYPE_NAME_REASONS` {#symbol-type_name_reasons}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.ts#L1268)

##### `TYPE_NAME_REASONS` — Summary
Why a type name has no link although the workspace declares it.

#### `resolveWorkspaceTypes` {#symbol-resolveworkspacetypes}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.ts#L1910)
- Parameters: `fileIndex`: [`WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex)

##### `resolveWorkspaceTypes` — Summary
The workspace files that declare a qualified type name, for adapters of other file kinds.

#### `csharpAdapter` {#symbol-csharpadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.ts#L1921)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `csharpAdapter` — Summary
Language adapter for C# (`.cs`): tree-sitter symbols and compiler-style name resolution across the workspace.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:path` - `path`
- [`csharp.dependencies.ConfigReference`](./csharp.dependencies.ts.mdmd.md#symbol-configreference) (type-only)
- [`csharp.dependencies.ResolvedTypeTarget`](./csharp.dependencies.ts.mdmd.md#symbol-resolvedtypetarget) (type-only)
- [`csharp.dependencies.extractDynamicDependencies`](./csharp.dependencies.ts.mdmd.md#symbol-extractdynamicdependencies)
- [`csharp.xmldoc.buildDocumentationFromLines`](./csharp.xmldoc.ts.mdmd.md#symbol-builddocumentationfromlines)
- [`csharp.xmldoc.crefName`](./csharp.xmldoc.ts.mdmd.md#symbol-crefname-function)
- [`dotnetProjects.ProjectReach`](./dotnetProjects.ts.mdmd.md#symbol-projectreach-interface) (type-only)
- [`dotnetProjects.projectReach`](./dotnetProjects.ts.mdmd.md#symbol-projectreach-function)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`spaces.inSpaces`](./spaces.ts.mdmd.md#symbol-inspaces)
- [`treeSitter.SyntaxNode`](./treeSitter.ts.mdmd.md#symbol-syntaxnode) (type-only)
- [`treeSitter.rangesOf`](./treeSitter.ts.mdmd.md#symbol-rangesof)
- [`treeSitter.readTree`](./treeSitter.ts.mdmd.md#symbol-readtree)
- [`treeSitter.writtenOver`](./treeSitter.ts.mdmd.md#symbol-writtenover)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.SymbolDocumentationTarget`](../core.ts.mdmd.md#symbol-symboldocumentationtarget) (type-only)
- [`core.TypeReference`](../core.ts.mdmd.md#symbol-typereference) (type-only)
- [`coreTypes.ProgramEntry`](../coreTypes.ts.mdmd.md#symbol-programentry) (type-only)
- [`coreTypes.SourceNotice`](../coreTypes.ts.mdmd.md#symbol-sourcenotice) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](../coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`openings.ROUTE_KIND`](../openings.ts.mdmd.md#symbol-route_kind)
- [`openings.SqlObjectName`](../openings.ts.mdmd.md#symbol-sqlobjectname-interface) (type-only)
- [`openings.bindSqlName`](../openings.ts.mdmd.md#symbol-bindsqlname)
- [`openings.chooseServers`](../openings.ts.mdmd.md#symbol-chooseservers)
- [`openings.matchRoute`](../openings.ts.mdmd.md#symbol-matchroute)
- [`openings.matchSqlObject`](../openings.ts.mdmd.md#symbol-matchsqlobject)
- [`openings.routeSegments`](../openings.ts.mdmd.md#symbol-routesegments)
- [`openings.routeSymbolName`](../openings.ts.mdmd.md#symbol-routesymbolname)
- [`openings.sqlObjectName`](../openings.ts.mdmd.md#symbol-sqlobjectname-function)
- [`openings.sqlReferences`](../openings.ts.mdmd.md#symbol-sqlreferences)
- [`compareText`](../../tooling/compareText.ts.mdmd.md#symbol-comparetext)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`sourceText.SourceReads`](../../tooling/sourceText.ts.mdmd.md#symbol-sourcereads) (type-only)
- [`sourceText.readSourceText`](../../tooling/sourceText.ts.mdmd.md#symbol-readsourcetext)
- [`sourceText.throwIfMachineFailure`](../../tooling/sourceText.ts.mdmd.md#symbol-throwifmachinefailure)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/openings.mdmd.md`](../../../../../../layer-3/openings.mdmd.md)
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
