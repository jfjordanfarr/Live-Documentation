# Three changes to the readers, batched: comments, a PowerShell path, `IF NOT EXISTS`

Historical evidence, a record of 2026-11-21, written by a builder for the root on the branch it was given, from `a11f7d007`. Three changes to the readers go together because any change to a source of the engine or the generator re-keys the history's cache; the history is not rebuilt here. The work item they serve is [the readers on `main`](../../../../../../Work/readers-on-main.md); the way each grader runs is in [the readers' gathering](../readers-gathering/README.md).

Every corpus named here is the clone another builder made in the session's scratch folder (`readers-builder-2/corpora`, `readers-builder-2/core`), at the commits [the gathering's record](../readers-gathering/README.md) names; nothing was written into them. They were read by [`facts.ts`](facts.ts), kept here: discovery by the default configuration, the symbol index from every file, then every file of the readers concerned read as the generator reads it, its links, their symbols and its own symbols written out as lines; [`facts_diff.py`](facts_diff.py) sets two such readings side by side. The code before each change was the base commit's, unpacked from `git archive` into the scratch folder and run with its own `tsconfig.base.json`.

## A standing guard against reading what a comment holds

**Why.** A commented-out `<ProjectReference>` was read as real on 2026-11-21. The readers that walk a syntax tree never look inside a comment; the project-file reader matched one pattern over the raw text, and its grader matched the same kind of pattern, so the two agreed. Two mends followed that day (XML's comments in `dotnetXml.ts`, markup's in `aspnet.ts`), and nothing held the class shut.

### Where the engine finds a construct by a pattern over text

| Reader | How it finds its constructs | Constructs | The language's comment forms |
| --- | --- | --- | --- |
| TypeScript and JavaScript (`sourceAnalysis.ts`, `dependencies.ts`, `heuristics/routes.ts`) | the TypeScript compiler's syntax tree | imports, exports, `require`, route calls | `//`, `/* */`, `/** */` |
| The DOM heuristic (`heuristics/dom.ts`) | **a pattern over the script's raw text, and one over each nearby markup file's raw text** | `document.getElementById`, `document.querySelector("#…")`; `id="…"` in the markup | the script's `//`, `/* */`; the markup's `<!-- -->`, `<%-- --%>`, `@* *@` |
| C, Java, Go, Python, Rust, C# names, PowerShell | tree-sitter | includes, imports, modules, type names, loads, calls | `//`, `/* */` (nested in Rust), `///`; `#`; `#`, `<# #>` |
| C#'s dependencies no compiler sees (`csharp.dependencies.ts`) | **patterns over the file's raw text** | `AppSettings["…"]`, an `IConfiguration` key, `Type.GetType("…")`, a dotted type name in a string, Hangfire's `Enqueue<T>` and kin | `//`, `/* */`, `///` |
| SQL inside a C# string (`csharp.ts`, then `openings.ts`) | the tree for the string, the SQL reader's own lexing for its text | the objects a query names | SQL's `--` and `/* */` inside the string; **the string's escapes were not read** |
| SQL (`openings.ts`) | its own lexing | objects created, named, executed | `--`, `/* */` nested, SQL*Plus `REM`; strings `'…'`, `[…]`, `"…"`, Oracle's `q'[…]'` |
| Ruby (`ruby.ts`) | **patterns over lines** | `require`, `require_relative`, mixins, classes and methods, the program's guard | `#`, `=begin` … `=end`, the data after `__END__` |
| CSS (`css.ts`) | **patterns over the raw text** | `@import`, `url()` | `/* */` |
| HTML (`html.ts`) | **patterns over the raw text** | `src`, `href`, `srcset`, `poster` …; element ids | `<!-- -->` |
| ASP.NET markup (`aspnet.ts`) | patterns, after a comment step (2026-11-21) | directives; `<script src>`; **element ids, read from the raw text** | `<%-- --%>`, `@* *@`, `<!-- -->` |
| JSON with comments (`json.ts`) | its own lexing, then `JSON.parse` | files named in values; a manifest's script commands | `//`, `/* */`; the shell's `#` inside a script |
| TOML manifests (`manifest.ts`, `cargo.ts`, `pyproject.ts`) | the TOML parser | dependencies, entries | `#` |
| A Rust crate's name (`rust.ts`) | **a pattern over `Cargo.toml`'s text** | `[package]`'s `name` | `#` |
| `go.mod` (`gomod.ts`), `pom.xml` (`pom.ts`) | their own lexing | requirements, dependencies | `//`; `<!-- -->` |
| .NET project files, `.slnx`, `.config` (`project.ts`, `solution.ts`, `dotnetConfig.ts`, `dotnetProjects.ts`) | patterns, after `withoutXmlComments` | references, projects, settings | `<!-- -->` |
| `.sln` (`solution.ts`) | a pattern anchored at a line's start | projects | `#` lines |

Not readers of someone's code, so not under the guard: the board's and the Live Docs' own formats (`board.ts`, `document.ts`), the path rules (`archetype.ts`, another builder's), and `languages/*.ts`'s `stripComments`, which no reader calls.

### The guard

[`commentGuard.test.ts`](../../../../../../../packages/engine/src/live-docs/adapters/commentGuard.test.ts), a table: for each reader, each construct and each comment form of its language, the construct written inside the comment yields no fact while the same construct written live beside it yields its own, so that no case passes by reading nothing; and where a comment's marker stands inside a string, an attribute's value or a script's text, what follows is still read. Each case is a small workspace of its own, read as the generator reads it, the symbol index first. A construct a file holds once (Ruby's guard) is read alone, live and commented. One form is no comment to its reader and the case says so: the ASP.NET page parser reads a directive inside an HTML comment, which is literal text to it (only `<%-- --%>` is removed before parsing, Microsoft's "Server-Side Comment Syntax"), so a `Register` directive inside `<!-- -->` stays read.

Committed red before any mend, `9cd7247e9`: **44 of 182 cases failed**; with the Ruby guard's cases added after, two more were red on the code before the mends (a guard in a trailing comment, a guard after `__END__`; run on the base's `ruby.ts`), 187 cases in all. Every green case of the tree readers, the SQL lexer, JSON, TOML, `go.mod`, `pom.xml` and the .NET XML readers was green from the start.

### The findings, the mends, and what moved on real code

One shared step per comment syntax, positions and line breaks kept:

- **A grammar's own comments** (`rangesOf` and `writtenOver` in `treeSitter.ts`): the places of the nodes the grammar calls `comment` (and, for Ruby, `uninterpreted`, the data after `__END__`), written over in spaces. C# and Ruby use it. The bundled CSS grammar was tried and refused: it reads `/*` inside a string as a comment and `//` as one.
- **HTML's comments** (`withoutHtmlComments` in `html.ts`): a comment opens only where a tag may start, never in a quoted attribute value nor in the text of `<script>`, `<style>`, `<textarea>`, `<title>`; it ends at the first `-->`, or at once for `<!-->` and `<!--->`. The ASP.NET step takes the server's comment out first, then this.
- **CSS's comments** (`withoutCssComments` in `css.ts`): `/*` to `*/`, none inside a string or an unquoted `url(…)`.

| Finding (red cases) | Mend | DNN | mojoPortal | nopCommerce | eShopOnWeb |
| --- | --- | --- | --- | --- | --- |
| C#: a configuration key, a type for reflection, a type named in a string, a Hangfire job, each inside `//`, `/* */` or `///` (20) | the patterns run over the text with the tree's comments written over | 86 C# file pairs fewer (below) | 4 keys of a `.config` gone and with them one link, every one behind `//` (`ContentManager.aspx.cs`'s `EditContentImage` …) | 3 pairs gone, each a `<see cref>` | none |
| C#: SQL's `--` in a regular string ended by the escape `\n` (1) | a string's text is what the program holds: escapes decoded, a verbatim string's `""` one quote | none | none | **one name gained**, `browscap.crawlersonly.xml`, from prose (below) | none |
| The DOM heuristic: a call inside a script's comment (3); an id inside the markup's comment (1) | calls read from the syntax tree, as `routes.ts` reads its calls; the markup's ids from its text with its comments written over | 1 line gone: `vbscript.js` to `index.html`, the call in the file's usage comment | none | none | none |
| Ruby: `require` inside `=begin … =end` and after `__END__`, a mixin inside `=begin`, a method after `__END__` (4); the program's guard in a trailing comment and after `__END__` (2) | the Ruby grammar's comments and data written over | no Ruby | no Ruby | no Ruby | no Ruby |
| CSS: `@import` and `url()` inside `/* */` (3) | `withoutCssComments` | 3 lines gone (`default.css`'s `/* @import "01/correct4dnn7.css";*/` …) | 58 lines gone (38 icons of `adminmenu/style.css` inside one comment, jQuery UI's header comment …) | 6 gone (jQuery UI's header comment) | none |
| HTML: `<script src>`, `<link href>`, an id inside `<!-- -->` (3) | `withoutHtmlComments` | none | 10 ids gone (`custom-fontawesome-sprite.html`'s commented `<title id>`) | none | none |
| ASP.NET: an id inside `<%-- --%>`, `@* *@` or `<!-- -->` (4); `<!--` inside an attribute value or a script's text hid every script after it (4) | ids read from the markup with its comments written over; the HTML step reads HTML's rule | none | 57 ids gone, each inside a comment (17 of `mojoRating.ascx` in one `<%-- --%>`) | none | none |
| A Rust crate's name past a comment holding `[` (1) | the name read by the TOML parser | no Rust | no Rust | no Rust | no Rust |

Every line gone was read in its file and found inside a comment; the lists are kept: [DNN](comments-dnn.diff), [mojoPortal](comments-mojoportal.diff), [nopCommerce](comments-nopcommerce.diff). eShopOnWeb moved not at all.

**C# against the compiler.** The C# grader (`npm run oracle:csharp`, its kept records in the corpora), run with the base's code and with the mended:

| | DNN before | DNN after | mojoPortal |
| --- | --- | --- | --- |
| Ours / the compiler's / both | 20,971 / 24,837 / 20,392 | 20,885 / 24,837 / 20,376 | 7,061 / 8,299 / 7,023, unchanged |
| Ours only: a namesake / other | 2 / 577 | 1 / 508 | 3 / 35, unchanged |

On DNN 70 pairs the compiler does not bind are gone, one of them the namesake `CryptographyProvider.cs` to `ICryptographyProvider.cs`. **Sixteen pairs the compiler binds are no longer drawn** ([the grader's difference](comments-csharp-grader-dnn.diff)): every one was drawn before only because a documentation comment named the type (`<see cref="log4net.Util.PatternConverter.Option"/>`, `<inheritdoc cref="IScriptResource.Async"/>`), while the compiler binds the pair through code the reader does not read, an inherited member (`Option`, declared in `PatternConverter.cs`) or a member's type (`MessageBoxView`, the return of a call). They were true by accident. What would draw them is the reader binding members, which the compiler's 4,445 pairs the reader misses already stand for; reading `cref` on purpose is the other way, which this builder does not recommend, since a documentation reference is not what the code uses.

**One false name gained on nopCommerce.** `BrowscapXmlParser.cs` writes a sentence into an XML comment: `"… from the official browscap site … delete \"browscap.crawlersonly.xml\", and restart …"`. A C# string that holds `from` is read as SQL; with its escapes decoded the sentence holds `delete "browscap.crawlersonly.xml"`, a quoted name, which the SQL reader takes for a table named by `DELETE`, kept as a name nothing in the scan creates. Before the decoding the backslashes hid it by accident. The cause is the test that reads a string as SQL (any `from`, `join`, `update` …), older than this change; no string of the five corpora holds SQL whose line comment an escape ends, so the decoding gains nothing measured and costs this one name. Kept, since the string's text is what the program holds; the test for SQL in a string is the open question.

Not put under the guard: C's `#if 0` and C#'s `#if false`, code the preprocessor drops, which are not comments ("a declaration in any branch of `#if`" is among the work item's questions to measure); MySQL's `#` comment, which T-SQL reads as a temporary table's name, a question of dialect (the third change below); the route calls between scripts and servers, read from syntax trees on both sides.

Remaining from the batch at this point: the PowerShell path without its extension, and `CREATE TABLE IF NOT EXISTS` and its kin.
