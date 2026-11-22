# The author's word: the C# compiler's resolution of documentation references, counted, and how the facts could carry it

Historical evidence, a record of 2026-11-22, written by a builder for the root on `day/2026-11-22` from `8bc5736cd`. It serves the work item [a documentation comment's reference is drawn, as the author's word](../../../../../../Work/readers-on-main.md#a-documentation-comments-reference-is-drawn-as-the-authors-word). No reader was changed: this leg is the oracle, the counts and a proposal, the reader's change following once the proposal is ruled on.

**Why.** The comment guard of 2026-11-21 ([its record](../../../2026-11-21/Probes/readers-batch/README.md)) stopped the C# reader reading a type's name inside a comment, and with it C# file pairs that only a documentation comment's reference drew. Root ruled such a reference no use by the code; the owner reversed it ([2026-11-21, Turn 8](../../../2026-11-21/2026-11-21.1.record.md#turn-8)): "If an author made an effort to tell us in their own words that these two things are related, we should honor their word. The C# compiler agrees that they are real as well if I'm reading you correctly. That is strong signal to honor the intent of the author of that code." Root's design, the owner's to reverse: a relation of its own kind, carried by the Live Docs, shown on the map and in the lists, and not followed by reachability, the paths or the dead-code answer.

## The oracle: the compiler resolves every `cref`

[`csharp-compiler.cs`](../../../../../../../scripts/oracle/csharp-compiler.cs), the C# grader's compiler program, now parses documentation comments (`DocumentationMode.Parse`; the code's names are still walked without descending into trivia, so its edges are unchanged) and, for every `cref` attribute of a documentation comment, on whatever element carries it, prints: the file and line, the element, the reference as written, and the semantic model's answer: `resolved` to one symbol, a reason it could not choose among candidates (`Ambiguous`, a method's name with overloads, the compiler's warning CS0419), or `unresolved` (CS1574). Each symbol comes with its kind, its display name and every file declaring it (each part of a partial type). [`csharp-compare.ts`](../../../../../../../scripts/oracle/csharp-compare.ts) turns them into C# file pairs (`documentationPairs`: to every declaring file, never a namespace, never the file itself) and sets them beside the pairs the code binds and the pairs the adapter draws; `npm run oracle:csharp -- <folder>` prints the counts, `--detail` the pairs only the author's word makes.

**Unchanged by the change:** the five samples' and both corpora's edges, declared names and bound names are those of the records before it, compared field by field (DNN 24,837 compiler pairs, mojoPortal 8,299, as on 2026-11-21).

**A limit to keep in view.** The compilation has no framework references, as the grader's always had, so a `cref` to a framework type (`ArgumentException`, `System.Web.Mvc.ViewDataDictionary`) is counted `unresolved` here though the real build resolves it. On DNN 1,191 of the 2,197 unresolved references are written as `System.`, `Microsoft.` or a well-known framework name (a count by pattern, not by the compiler). A `cref` inside a section the program's preprocessor symbols (`DEBUG`, `TRACE`, `NET48`, `NETFRAMEWORK`) leave inactive is not parsed at all; three of DNN's are below.

**The samples.** Kept records written again for the five C# sample programs (`tests/integration/programs/csharp/*/expected/csharp-compiler.json`, each source named by digest as before). None held a reference of each kind, so two were added:

- `names/App/Documented.cs`, which uses nothing in its code and whose documentation names a type (`Base`), a member (`Base.Gadget`, on `see` and on `inheritdoc`), a nested type (`Base.Options`), a generic beside the type of its name (`Lib.Helper{T}` to `HelperOfT.cs`, `Lib.Helper` to `Helper.cs`), each of two overloads declared in two parts of a partial class (`Runner.Run(Runner.Count)` to `Runner.cs`, `Runner.Run(Runner.Text)` to `Runner.Text.cs`, beside them in `names/App/`), the overloads' name alone (`Ambiguous`, both files), a namespace (`App.Other`, no pair), a type on `permission` (`Derived`), a name nothing declares (`Missing`, unresolved) and a type of a project the file's project does not reference (`Lib.Thing` on `exception`, unresolved: `A`'s reference to `B` is commented out, and `App` has none).
- `estate/Hub/PaymentHub.cs` gains `<seealso cref="IPaymentService.Post(PaymentRequest)"/>`: an overload of a type in another project, a pair its code binds as well.

Rosetta's one existing reference, `<exception cref="ArgumentException">`, is unresolved for want of framework references.

[`csharp-oracle.test.ts`](../../../../../../../tests/integration/live-docs/csharp-oracle.test.ts) holds every sample's references, the compiler's answer for each in words, the pairs the code binds as well, the pairs only the author's word makes, and the pairs the adapter draws (today: only those the code makes too), in a register beside the measured misses; [`csharp-compare.test.ts`](../../../../../../../scripts/oracle/csharp-compare.test.ts) holds `documentationPairs` on a stand-in record. Both were seen red with the namespace rule switched off (the integration test only after `Documented.cs`'s permission reference was moved off `App.Other.Gadget`, which had put `Other.cs` among the pairs by another road and so hidden the rule). The scip-dotnet comparison (`oracle.test.ts`) is unmoved by the three new files: they make no code edge across files.

## The counts

Run on copies of the corpora at DNN `9bc6b06f4` and mojoPortal `ecbaf7f40` (the clones of [the readers' gathering](../../../2026-11-21/Probes/readers-gathering/README.md), copied without `.git` into the builder's scratch folder; the clones were only read), with the code of this commit: [DNN](grader-dnn.txt), [mojoPortal](grader-mojoportal.txt).

| | DNN | mojoPortal |
| --- | ---: | ---: |
| `cref`s | 8,453 | 35 |
| by element | `see` 7,428, `exception` 477, `inheritdoc` 405, `seealso` 142, `event` 1 | `see` 31, `exception` 4 |
| resolved to a type / member / namespace | 4,568 / 1,662 / 26 | 6 / 22 / 0 |
| resolved to nothing (framework types among them) | 2,197 | 6 |
| ambiguous | 0 | 1 |
| resolved only within their own file, or to a namespace | 3,107 | 7 |
| **C# file pairs they name** | **1,312** | **4** |
| of which the code binds too (the compiler's edges) | 1,018 | 4 |
| of which only the author's word makes | **294** ([the list](author-only-dnn.txt)) | 0 |
| of the 1,312, drawn by the adapter today | 982 | 4 |

So on DNN a documentation relation adds 294 pairs the code does not make, and on mojoPortal none. The brief's "3 on mojoPortal" is nopCommerce's: the batch record gives mojoPortal's C# pairs as unchanged by the guard and nopCommerce's as 3 fewer, "each a `<see cref>`"; nopCommerce was not run here.

**The 86 pairs the guard removed from DNN**, each classed against the compiler's `cref`s ([`guard_pairs.py`](guard_pairs.py) over [the guard's kept difference](../../../2026-11-21/Probes/readers-batch/comments-dnn.diff); [every pair with its evidence](guard-pairs-dnn.txt)):

| How the comment named the target | The compiler binds the pair through code too | Only the comment |
| --- | ---: | ---: |
| an explicit `cref` the compiler resolves to a declaration in the target | 16 | 66 |
| an explicit `cref` in a section the oracle's preprocessor symbols leave inactive (two of log4net's whole-file `#if NET_2_0 …`, one `#if NET_3_5 …`) | 0 | 3 |
| an explicit `cref` naming the target's type that the compiler resolves to the file itself (`Meta.HttpEquiv`, declared in `Meta.ascx.cs`, while the reader took `Meta`'s designer part) | 0 | 1 |
| a type's name in a comment's prose | 0 | 0 |

Every one of the 86 was an explicit documentation reference; none was a name in prose. Of the 70 the code does not bind, 66 are pairs a documentation relation would draw again, the compiler agreeing; 3 more would be drawn if the reader reads every `#if` branch as it does today, which the oracle cannot judge; the last, to the designer file, would not.

**Projects MSBuild could not evaluate on this Linux** (their references then read from their XML elements, as the grader already says): 34 of DNN's 82 and 4 of mojoPortal's 25, each named in [the list](projects-msbuild-could-not-evaluate.txt); old-style web projects importing a Visual Studio targets file the .NET SDK does not ship.

## How the facts could carry the relation: three alternatives

What every alternative shares: the reader yields, for each `cref` it can resolve, the name as written and the symbol it names (a type, or a member with its type), on the file that writes it; the graph resolves it as it resolves a dependency line, to a file and a symbol's slug. Today a C# Live Doc carries `### Dependencies` (lines read from code) and its symbols' `Extends` and kin; the graph turns both into `GraphEdge`s of an `EdgeKind` (`import`, `re-export`, `returns`, `parameter`, `extends`, `implements`, `constraint`) and derives each file's `outbound` and `inbound` from every edge.

**Found while writing the samples' docs: the Live Docs already carry the references, as text.** The C# documentation reader (`csharp.xmldoc.ts`) already takes every `see` and `seealso` `cref` into a symbol's documentation, and the composer writes them under the symbol as `##### `Documented` — Links`, each as backticked text with no link (`- `Base.Gadget``); an `exception`'s `cref` goes to `— Exceptions`, an `inheritdoc` to `— Additional Documentation` as raw markup, a `permission` to `— Unsupported Doc Tags` ([`Documented.cs`'s doc](../../../../../../../.mdmd/layer-4/tests/integration/programs/csharp/names/App/Documented.cs.mdmd.md)). Ten Live Docs of this repository hold such a list. Two faults of that rendering, seen there and not mended (the reader is not this leg's): the summary writes `Lib.Helper{T}` as `Lib.Helper`, so the generic and the plain type read alike, and a `<seealso cref/>` written inside the summary vanishes from it, leaving "; ".

**A. A kind of edge among the others.** The Live Doc's `### Dependencies` lines gain a qualifier, as `re-export` and the bases `contract` and `configuration` already are (`- [`PagePriority`](./PagePriority.cs.mdmd.md#symbol-pagepriority) (documentation)`); the graph adds `EdgeKind` `"documentation"`. *Costs:* the format grows by one word; the graph by one kind; every consumer that walks `edges`, `outbound` or `inbound` must leave the kind out where it is not a use: reachability, paths, the dead-code answer, the board's lines and, by default, `inspect`'s counts. `outbound` and `inbound` would either exclude it (and a second pair of lists hold it) or every consumer filters. One forgotten filter makes a class named only in a comment reachable, the exact failure the owner's design rules out, and nothing structural stops it. `inspect` prints it among the dependencies with its kind. Cheapest to write; the most places to be wrong.

**B. The symbol's own Links, resolved, and edges apart.** The `— Links` list each symbol already has becomes links: `- [`Base.Gadget`](./Base.cs.mdmd.md#symbol-gadget)` where the reader resolves the `cref`, the backticked text as today where it does not (which also says, honestly, "named, and nothing here declares it"); `exception`, `inheritdoc` and `permission` references join the same list, each with its element. The graph holds the resolved ones as `documentation: GraphEdge[]` beside `edges`, from the symbol that carries the comment, with no part in `outbound` or `inbound`, and `documentedBy` on the target for the reverse. *Costs:* the format grows least of the three (a list that exists gains a link and an element's word), the parser reads one more list into the graph, the graph gains one list and its reverse; the same list serves JSDoc's and Javadoc's `{@link}` when those readers come; reachability, paths and dead code read `edges`, `outbound`, `inbound` and so cannot follow it without being changed to: safe by construction. The map and the lists must ask for it explicitly: the Explorer draws it as its own line (in the file drawing on the side its direction says, in a style that says "named, not used"), `inspect` prints it under its own heading and has a flag to include it in a listing. Two lists of edges is a second shape for consumers that draw lines; it is one fact of a different meaning, not a second implementation of one problem.

**C. A mention on the symbol, no file pair.** The target's symbol carries "documented from" its writers (`- Named in documentation by: [`PageTag`](./PageTag.cs.mdmd.md#symbol-pagetag)`), the writer's doc nothing new; the graph holds it on the symbol, not as an edge. *Costs:* smallest change to the graph; reachability, paths and dead code untouched without effort; the map shows a mark on the symbol, no line between files. But the author's word is then not drawn as a relation between two things, which is what the owner asked to be honoured, and a file's documentation references cannot be listed from the file that wrote them without a reverse index.

**Recommended: B.** It carries the relation as the owner asked (drawn, between the two things, from the file that says it), and it keeps reachability, the paths and the dead-code answer honest by where the fact lives rather than by a filter each consumer must remember; "the map does not lie" is the value that would pay under A. It costs more than A in the format and in each drawing consumer, a cost "as simple as possible, and no simpler" accepts because the distinction is real (a use and a word are different facts). Root decides; the owner may reverse. For any of them, a reference the compiler resolves only within its own file is no pair (3,107 of DNN's), a namespace is none, and an unresolved one is said nowhere unless the format grows to hold it (a question to bring: should a Live Doc say "this documentation names `X`, which nothing here declares"?).

## The same construct in the other languages the engine reads

No code was written for these; each line is an example and how its own tool would be asked, as the oracle for that reader.

| Language | The construct | Example | The tool that resolves it, and how it is asked |
| --- | --- | --- | --- |
| TypeScript, JavaScript (JSDoc) | `{@link}`, `{@linkcode}`, `{@linkplain}`, `@see` | `/** Formats a {@link Report}; @see Report.render */` | The TypeScript compiler, already a dependency: since TypeScript 4.3 a `{@link}` is a `JSDocLink` node whose `name` the checker resolves (`checker.getSymbolAtLocation(link.name)`, then the symbol's declarations' files); the language service's go-to-definition on the name is the same answer. `@see` with a name is a `JSDocSeeTag` resolved the same way. |
| TypeScript (TSDoc) | `{@link}` with a declaration reference | `/** {@link my-package#Report.render} */` | `@microsoft/tsdoc` parses the declaration reference; resolving it is API Extractor's (`api-extractor run` warns `ae-unresolved-link`), or the TypeScript checker for a plain name. |
| Java | `{@link}`, `{@linkplain}`, `@see`, `@throws` | `/** Uses {@link Store#put(String, int)}. @see Report */` | `javac -Xdoclint:reference` warns "reference not found" for an unresolved one; the resolution itself from the compiler's `DocTrees` API (`docTrees.getElement(DocTreePath)` on each `ReferenceTree`), from a small program run by `java` as `csharp-compiler.cs` is run by `dotnet`. The PL/SQL grader's `PlSqlEmitter.java` shows the pattern. |
| Rust | intra-doc links | `/// Returns a [`Report`], see [`Store::put`].` | rustdoc: `cargo rustdoc -- -D rustdoc::broken_intra_doc_links` fails on an unresolved one; the resolution of each from rustdoc's JSON output (`cargo +nightly rustdoc -- -Z unstable-options --output-format json`), where each item's `links` maps the text written to the item's id, and the item's `span` gives its file. |
| Go | doc links (Go 1.19) | `// Put stores a [Record]; see [io.Writer].` | `go/doc` with `go/doc/comment`: a package's `Parser()` resolves `[Name]` and `[pkg.Name]` to the package's own declarations and to imports (`comment.DocLink`'s `ImportPath` and `Name`); gopls answers definition on the same link. A small Go program, run by `go run`, would print each link with its target's file. |
| Python | Sphinx cross-reference roles in a docstring | `"""Builds a :class:`~depot.store.Store`; see :meth:`Store.put`."""` | Sphinx with `nitpicky = True` warns "py:class reference target not found" for each unresolved one; the resolved targets are its inventory (`objects.inv`, read with `sphinx.ext.intersphinx`'s `inspect_main`), each object's name and document. Its autodoc imports the code, which runs it; the static alternative is a name resolver (Jedi, pyright) asked for the definition of the dotted name, which is no longer the documentation tool's own answer. |
| PowerShell | `.LINK` in comment-based help | `<# .SYNOPSIS Posts a payment. .LINK Get-Payment #>` | PowerShell's own parser, already this engine's PowerShell oracle (`powershell-ast.ps1`): `$ast.GetHelpContent().Links` lists each `.LINK` as written, without running the script; a command's name then resolves to the function the folder's files declare (the parser's `FunctionDefinitionAst`s), and a URL to no file. `Get-Help -Full` answers the same `relatedLinks` but loads the module. |

## Forks decided, and forks brought

Decided here:

- **An ambiguous reference counts a pair to each candidate's file.** The author named the method group; the compiler warns and cannot choose, so neither does the oracle.
- **A namespace is no pair**, as among the grader's edges: every file that opens one declares it.
- **A `cref` resolving within its own file is no pair**, as an edge to itself is none.
- **Framework references stay out of the compilation**, so the edges stay comparable with every record since 2026-11-19; the unresolved count says so in its own line.

Brought to the root:

- **Which of the three alternatives** (recommended B).
- **What a Live Doc says of an unresolved documentation reference**, if anything.
- **The three DNN references in inactive `#if` sections**: the reader reads every branch; the oracle reads the configuration it is given. Whether the reader's documentation relation follows the reader's rule or the build's is the same question as "a declaration in any branch of `#if`" in the work item's measurements.

## Verification

- The five samples' records written again by `npm run oracle:csharp -- <sample> --write`; edges, declared names, files and projects compared with the records before the change: equal but for the names sample's new files.
- `csharp-compare.test.ts` (4) and `csharp-oracle.test.ts` and `oracle.test.ts` (38), green, each new assertion seen red once as above; the whole of `scripts/oracle/` unit tests green.
- `npm run lint` and `npm run build` clean; `npm run live-docs:generate` run and its docs committed (three created, nine updated), the new docs with an authored Purpose; the three SlopCop audits (markdown, assets, symbols) and `docs:links:enforce` clean; the whole integration suite, 500 of 500. The full gate (`safe:commit`) and the browser were not run: no product code changed.
