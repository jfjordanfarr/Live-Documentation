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

## A PowerShell path without its extension, as Windows answers it

**Why.** PowerShell's own source, read on 2026-11-21 ([the PowerShell findings](../readers-gathering/powershell-findings.md#a-path-without-its-extension-beside-a-ps1-of-the-same-name-windows-and-unix-differ)), says that for a relative path with no extension, `./build` with both `build` and `build.ps1` beside the caller, Windows runs `build.ps1` and Unix the bare file, and that for a rooted path both run the bare file. The reader kept Unix's answer until a Windows machine had run it. The owner ran it on their own Windows machine the same day:

```
(base) PS C:\Users\User> mkdir t; cd t; 'x' > build; 'x' > build.ps1
(base) PS C:\Users\User\t> Get-Command ./build | Format-List Name, CommandType, Source

Name        : build.ps1
CommandType : ExternalScript
Source      : C:\Users\User\t\build.ps1
```

Root's ruling: the reader follows Windows for a relative path, PowerShell's home and where a file with no extension is not a script at all; a rooted path is unchanged.

**The oracle, kept.** The owner's run is kept as [`windows-runs.json`](../../../../../../../tests/integration/fixtures/powershell-wires/expected/windows-runs.json) beside the PowerShell fixture's parser record, with its provenance (their own Windows machine, 2026-11-21; the version of PowerShell was not shown). The fixture gains `Build/`, holding `build` and `build.ps1`, with `Build/Use-Build.ps1` (`. ./build`) and `Build/Use-Build-Rooted.ps1` (`. "$PSScriptRoot/build"`). The parser's record, written again by pwsh 7.7.0 on this Linux (`npm run oracle:index`), says `Build/build` for both, Unix's answer. The tests then ask for Windows' answer by the kept run, and hold the record's other answer in the oracle test's register by its cause, a difference of platform with evidence, the record itself untrimmed. Committed red (`8a05cdeb5`): the Windows case and the register's two new lines in `powershell-oracle.test.ts`, and the grader's own test of the fixture.

**The mend.** `resolveScript` in `powershell.ts`: a path with a folder and no `.ps1` ending is first tried with `.ps1` added; for a relative path that file wins where it stands, and a rooted path, written from `$PSScriptRoot`, takes the file so named first, as before. The unit test that held Unix's answer for a relative `b/build` now holds Windows', with a rooted case beside it that keeps `b/build`.

**The four corpora**, `npm run oracle:powershell -- <corpus> --detail`, with the base's code and with the mend:

| Corpus | Wires: parser's / adapter's / both | Calls: parser's / adapter's / both | Programs: agree / differ | Moved |
| --- | --- | --- | --- | --- |
| dbatools | 7,479 / 7,478 / 7,478 | 6,630 / 6,629 / 6,629 | 1,792 / 1 | no line, with `--detail` |
| AL-Go | 493 / 492 / 492 | 1,042 / 1,041 / 1,041 | 198 / 0 | no line |
| AzureStack-Tools | 13 / 15 / 13 | 29 / 29 / 29 | 37 / 0 | no line |
| tSQLt | 39 / 34 / 34 | 34 / 34 / 34 | 39 / 0 | no line |

Every figure equals the gathering's record, before and after, and every listed disagreement is the same: as the findings counted, none of the four holds a file without an extension beside a `.ps1` of its name, so the change moves nothing there. What it moves is the fixture's relative case, `Build/Use-Build.ps1` now to `Build/build.ps1`, and the unit test's.

## `CREATE TABLE IF NOT EXISTS`, and its kin

**Why.** This repository's own SQLite migration of its first weeks, `data/migrations/001_init.sql`, writes `CREATE TABLE IF NOT EXISTS artifacts (`: the SQL reader, written to T-SQL's and PL/SQL's grammar, read it first as six tables named `IF` and, after the mend that made a reserved word no name, as no table at all, with nothing said. SQLite, MySQL and PostgreSQL all write it.

**The oracle, first.** SQLite itself, at hand with nothing installed: [`sql-sqlite.ts`](../../../../../../../scripts/oracle/sql-sqlite.ts) (`npm run oracle:sqlite -- <folder> [--write] [--detail]`) runs each `.sql` file of a folder alone in an empty database in memory through `node:sqlite` (SQLite 3.54.1 in Node 26) and reads back, from `pragma_table_list`, the tables and views of the `main` schema: a `TEMP` object lands in `temp` and is none; the tables SQLite makes to hold a virtual table (`notes_data` beside FTS5's `notes`) are its own (`shadow`). Indexes and triggers, which the reader gives no symbol, are not graded. A folder keeps the answer as `expected/sqlite-schema.json`, each source named with its digest, and [`sqlite-oracle.test.ts`](../../../../../../../tests/integration/live-docs/sqlite-oracle.test.ts) holds the reader to it without a database. The fixture [`sql-sqlite`](../../../../../../../tests/integration/fixtures/sql-sqlite/README.md) holds the migration itself, as committed on 2025-10-16, and one statement of each spelling of the family. Committed red (`a9c1c0a11`): the reader declared 3 of the 15 objects SQLite made.

For MySQL and PostgreSQL nothing independent of the reader was cheap: no engine of either is on the machine, and their parsers (`libpg_query`, MySQL's own) would be installed from outside. So the grading stops at SQLite, as allowed; what the change does for MySQL's and PostgreSQL's scripts below is measured against nothing but reading.

**What the reader misread, against SQLite** (the fixture's twelve red lines, and what reading the code showed):

| Spelling | Before | Now |
| --- | --- | --- |
| `CREATE TABLE IF NOT EXISTS t`, and on a view (`INDEX`, `TRIGGER` the same, though they make no symbol) | `IF` is no name, so nothing was declared | `IF NOT EXISTS` stands between the kind and the name, and the name is read |
| A name in backticks, `` `audit` ``, ```` `tick``ed` ```` (MySQL's and SQLite's) | a backtick was punctuation, so the name was lost, and with it every table of mojoPortal's MySQL and SQLite schemas | a quoted name, a doubled backtick one backtick, as brackets and double quotes are |
| `CREATE TEMP TABLE`, `CREATE TEMPORARY TABLE` (SQLite, PostgreSQL, MySQL) | `TEMPORARY` was passed over as Oracle's word and the table declared as lasting; `TEMP` read nothing | no object of the script, as T-SQL's `#name` is none: SQLite holds it in `temp`, not `main` |
| Oracle's `PRIVATE TEMPORARY TABLE` | declared, with `GLOBAL`'s word passed over (2026-11-19) | no object, by the same rule: Oracle drops it at the end of its transaction or session and only its session sees it; `GLOBAL TEMPORARY` stays a lasting table |
| `CREATE VIRTUAL TABLE notes USING fts5(body)` | `VIRTUAL` read as the kind, nothing declared, and `USING fts5` read as a table `fts5` | a table, its `USING` module no table |
| `CREATE TRIGGER t AFTER INSERT ON x … BEGIN … END;` then more of the script | the trigger, read as T-SQL's, ran to the batch's end, which a SQLite script never marks, so every table after it was taken for one its body makes | a trigger whose timing comes before its table, as SQLite, MySQL, PostgreSQL and Oracle write it, ends at its `END` (a `CASE … END` passed over, PL/SQL's `END IF` and `END LOOP` closing their own), or at its `;` when it has no block; T-SQL's, `ON` after its name, runs to the batch's end as before |
| `CREATE TABLE t AS SELECT …`, `DROP … IF EXISTS`, `CREATE OR REPLACE` | already read, the first as a table and the others as nothing and as before | unchanged, now held by the fixture |

The grader itself changed once after its red commit: it compared the reader's written names, and a backticked name is written back in brackets (`[tick`ed]`), so it now unquotes the name as the database holds it (`sqlNameParts`). Not built, each said: MySQL's `#` comment, which T-SQL reads as the start of a temporary table's name; MySQL's `/*! … */`, a comment MySQL runs, which `mysqldump` writes around `CREATE` and `DEFINER`; MySQL's `CREATE DEFINER=… PROCEDURE` and `ALGORITHM=… VIEW`; PostgreSQL's `$$`-quoted bodies. No oracle of either dialect is at hand to measure them on.

**After, on the oracles.** The fixture: 15 of 15 objects, no difference. mojoPortal's `mojoPortal.Data.SQLite/legacyscripts`, a real schema of 40 tables in backticks: 0 of 40 declared before, 40 of 40 now. ScriptDom on tSQLt, DNN's `.sql`, DNN's provider scripts and dbatools, and the PL/SQL grammar on utPLSQL (`source/` and `examples/`, fetched as the commit's archive since no clone was at hand): every line of their reports the same before and after: tSQLt 1,525 of 1,535 objects and 969 of 969 dependency lines; DNN's provider scripts 4,052 of 4,056 and 7,064 of 7,065; DNN's `.sql` 51 of 51 and 29 of 29; dbatools 26 of 26 and 199 of 199; utPLSQL 366 / 268 / 98 files and 433 / 270 / 163 / 248 dependency lines, as the gathering's record.

**What it moves where several databases' scripts stand side by side.** mojoPortal keeps one data layer per database (`mojoPortal.Data.MSSQL`, `.MySql`, `.SQLite`, `.pgsql`, and the same for its features), each with scripts that create the same tables under the same names. The SQL reader binds a name as if the workspace were one database, so a name several scripts declare links to all of them. Counting each link to a `.sql` file by whether the script lies in the caller's own database's folder:

| On mojoPortal | Same database | Another database | Outside a data layer |
| --- | ---: | ---: | ---: |
| C# to `.sql`, before | 50 | 247 | 14 |
| C# to `.sql`, now | 133 | 415 | 29 |
| `.sql` to `.sql`, before | 34 | 52 | |
| `.sql` to `.sql`, now | 45 | 127 | |

So the MySQL and SQLite tables now declared bring 83 true links from C# and 11 between scripts, and 168 and 75 more that cross from one database to another, beside the 247 and 52 such that stood before (the SQL Server and PostgreSQL scripts were declared already). The fault is older than this change: which database a script belongs to is the work item's open question beside the linked server's ("a three-part name that points at another database"), and nothing the readers know says it yet. Brought to the root as a fork, below.

On the other corpora: nopCommerce's MySQL migration (`upgradescripts/4.50-4.60/mysql_customer_data_migrate.sql`, in backticks) now names `Country`, `Customer` and `Language`, tables its code creates, kept as names, and `GenericAttribute`, linked to the SQL Server upgrade script of 2.50 that creates `dbo.GenericAttribute`, a link from one database to another of the kind above; nothing else of its 31 scripts or its code moved. DNN's twelve scripts moved not at all; one sentence of its C# that a string holding `from` makes read as SQL, `` … using `Page.RegisterAsyncTask()` or use … ``, gave two names nothing creates and now gives one, `[Page.RegisterAsyncTask()]`. The lists are kept: [mojoPortal's scripts](sql-mojoportal-scripts.diff), [its code](sql-mojoportal-code.diff), [nopCommerce and DNN](sql-nopcommerce-dnn.diff), the counts by database [here](sql-mojoportal-databases.txt), by [`dialect_links.py`](dialect_links.py) over [`facts.ts`](facts.ts)'s readings split by [`split_facts.py`](split_facts.py).

## Forks decided, and forks brought

Decided here:

- **The guard reads the facts a reader yields, not its text.** Each case runs the engine's own dispatch on a small workspace, the symbol index first, so that a reader's resolution is under the guard too; a fact is a link, a link's symbol, a symbol or an entry.
- **A grammar's comments where the engine has the grammar, a step of the language's own where it has none.** C# and Ruby take their comments from tree-sitter; HTML and CSS have steps written to their specifications, the bundled CSS grammar being wrong on strings and `//`.
- **The DOM heuristic reads its calls from the TypeScript tree**, as `routes.ts` does, rather than blanking comments before its pattern: a call written in a string is then no call either.
- **A C# string's escapes are decoded** before the SQL in it is read, though it gains nothing measured and costs one false name on nopCommerce.
- **Oracle's `PRIVATE TEMPORARY` table is no object of the script**, by the rule that makes SQLite's `TEMP` table none; the test of 2026-11-19 that read it as one is changed, with Oracle's documentation for the reason.
- **The page carries Ruby's grammar**, and a check without the browser now fails on a grammar a reader names that the page lacks.

Brought to the root:

- **Sixteen true C# pairs on DNN were drawn only by reading a documentation comment.** They are lost by the guard; what would draw them is binding a call to an inherited member or a member's type. Reading `<see cref>` on purpose is the other way; not recommended, since a documentation reference is not what the code uses.
- **Which database a script belongs to.** mojoPortal shows a name linked to every database's script that declares it; the SQL change adds 83 true and 168 false such links from C#. A candidate, to be measured on a hand-read sample before it is built: bind a name declared in several folders to the one nearest its caller, the project or folder that holds both, as `homeOf` chooses among route servers. Until then the SQL change can be held back from the merge without the guard or the PowerShell change, its commits being apart.
- **A string read as SQL because it holds `from`.** Prose in C# strings gives names nothing creates (nopCommerce's one, DNN's one); the test that a string is SQL is older than this batch.
- **What else reads JavaScript as markup:** the HTML reader takes `src="…"` and `href="…"` wherever they stand in the text, a script's code among them (`img.src = "x.png"`), which is no comment and was left as it is.

## Verification

On the batch's last commit, `965a08059`:

- `npm run lint` and `npm run build`: clean.
- `npm run live-docs:generate`: the regenerated docs are committed with each change; the docs of the new sources and fixture files carry an authored Purpose. In this repository's own graph the readers' changes move no sample folder's file but the new ones: `tests/integration/fixtures/powershell-wires/Build/` (four files; `Use-Build.ps1` to `build.ps1`, `Use-Build-Rooted.ps1` to `build`) and `expected/windows-runs.json`, and `tests/integration/fixtures/sql-sqlite/` (two scripts declaring 6 and 9 tables and views, and its record). Its first names, `customers` and `notes`, were renamed with `shop_` when the first generation linked `sql-schemas/archive.ListOrders.sql` and `sql-schemas/notes.sql` to them, the repository being read as one workspace (the fault of several databases above).
- `npm run safe:commit`, the gate without the browser: unit 3,399, integration 496, every audit clean, after two corrections it found, a missing entry in the hand-read list of entry points (`oracle:sqlite`) and one link one folder too deep. A run under a load of 30 to 35, three other builders at work, failed 33 unit tests by time-outs and by `git` commands that could not lock their files (`discovery.oracle.test.ts`, `forceGraphOctree.test.ts`, `generator.test.ts`, `generatorIdentity.test.ts`); run alone at once they passed, 122 of 122, and the next whole run passed them all. The gate said nothing of the history's cache: the worktree holds none.
- The page check: its tests without the browser are among the integration tests (node-needs, now with the grammar check); its browser cases through the lane after `npm run e2e:bundles` (`page-scan.spec.ts`): 50 of 50, the new `sql-sqlite` fixture among them, `differences.json` and `node-needs.json` unchanged. A first queueing was withdrawn when the page was found to carry no Ruby grammar, which the Ruby reader now asks for; the page now carries it.

## The second round, after an independent review

The batch was accepted and then read by an independent reviewer, who broke it in twelve ways and brought 64 failing cases back as tests (`476a6e1e8`, in `commentGuard.test.ts`, `openings.test.ts`, `sqlite-oracle.test.ts` and `powershell.test.ts`, each naming its source of truth). This round works on the gathered branch with the reviewer's commit merged. It is the second time an independent review has broken "no reader reads what a comment or a string holds" by new means, so, by the guide's rule, what needs a new design was not mended by cases: it is held in one ledger of known differences, and the next piece is to measure the simplest design that does not need the guarantee, each reader working from its language's own parse and a dialect for each SQL script.

**Mended** (each red case now green; every rule newly tested was switched off once and its test seen to fail):

1. **A regression of the batch: `./build.v2`.** Beside `build.v2` and `build.v2.ps1`, the batch's change made it `build.v2.ps1`. PowerShell tries the `.ps1` first only for a name with no extension of its own (`Path.HasExtension` in `ConstructSearchPatternsFromName`), so a name with one is tried as written first, on Windows too; `resolveScript` now does so.
2. **Positions past a character outside the Basic Multilingual Plane.** Every comment step wrote one space for its two UTF-16 units. One shared step, `inSpaces` in `spaces.ts`, writes one space for each unit, and every step goes through it: `writtenOver` (C#, Ruby), HTML's, CSS's, ASP.NET's, and the XML step of the .NET readers, which had the same fault and no case.
3. **`#if false` in C#.** A section an `#if false` or `#elif false` skips is written over before the syntax tree is read, to its `#elif`, `#else` or `#endif`, a nested conditional counted; C# lexes no such section and no configuration compiles it. A condition on a symbol is read in every branch, as before. DNN holds six such sections, as the reviewer counted (`grep` agrees: `DotNetNukeSecurity.cs`, the whole file, `PermissionProvider.cs`, `DataService.cs`, `InternalSearchControllerTests.cs`, `TriCheckedState.cs`, `SitesController.cs`). Only the whole file's facts move: its 11 C# pairs and 2 symbols are gone, every one inside the section. The C# grader on DNN: ours 20,885 to 20,874, both 20,376 unchanged, ours only 509 to 498, so none was a pair the compiler binds.
4. **The text of `<script>`, `<style>`, `<textarea>` and `<title>` is no markup.** The HTML step now writes it over, so the HTML reader, ASP.NET's ids and the DOM heuristic's markup read no `id=`, `href=` or `src=` there; a script's own references stay the DOM heuristic's, read from its tree. A first run showed a `<title />` closed by `/>` swallowing the rest of DNN's `Default.aspx` (23 ids): such a tag now holds no text, as ASP.NET's page parser reads it (a browser reading the same tag in an `.html` file would take the rest for its text, which no page measured writes). What moved, every line read in its file: mojoPortal 9 ids, 8 written in the ckeditor samples' scripts (`// Replace the <textarea id="editor"> …`) and `PageTitle1`, a server control inside `layout.Master`'s `<title>`, which renders text and no element, and 1 link, `api.html`'s `/Test1.html` in a script's code; nopCommerce 12 ids its views' scripts write into templates (`'permission-applied-for-' + row.Id + '`); DNN the links and ids of the code samples its CodeMirror demos hold in `<textarea>`s (13 links, 5 ids); eShopOnWeb nothing ([DNN](round2-dnn.diff), [mojoPortal](round2-mojoportal.diff), [nopCommerce](round2-nopcommerce.diff)).
5. **`--!>` ends an HTML comment** (WHATWG's "comment end bang state"), and **in CSS a backslash outside a string escapes**, so `.a\"b` opens no string.
6. **The C# string escapes, finished.** An interpolated string's `escape_sequence` nodes, dropped before, are decoded; a test holds every form decoded, `\n`, `\x0a`, `\u000a`, `\U0000000a` in regular and interpolated strings, and the verbatim and verbatim interpolated strings that decode no backslash and read `""` as one quote.
7. **Ruby's heredocs.** The same helper as the comments: the grammar's own `heredoc_body` places are written over, so a `require_relative`, a `def`, a mixin or the program's guard in a heredoc is none. A multi-line string that is no heredoc is still read as code, since a `require`'s path is a string and strings as a whole cannot be written over.
8. **Every rule found untested.** `sqlNameParts`' backtick branch, `endOfTag`'s two quote rules (the guard's row for markers in attribute values now holds a `>` before its marker, and a new row holds an apostrophe in an attribute's name), CSS's unquoted `url(` and its string's escape, and C#'s verbatim interpolated flag: each now has a test, and each test was seen to fail with its rule switched off. `writtenOver`'s overlap guard was deleted, since `rangesOf` gives its ranges in order and apart. `triggerBodyEnd` was deleted whole, its `CASE`, `END IF`, `END LOOP`, `DECLARE` and `;` rules with it: no fact depended on where a trigger written with its timing first ends, since in none of SQLite, MySQL, PostgreSQL and Oracle does such a trigger's body create a table, so that trigger now opens no body, and a later trigger no longer cuts short a function's body before it.

**Ledgered, not mended** (`KNOWN_CAUSES` in [`knownDifferences.ts`](../../../../../../../packages/engine/src/live-docs/adapters/knownDifferences.ts), held by its `heldToLedger`; first written as a JSON file beside it, which the gate's check of reachability found read by no import, so the ledger is the module the tests import: a listed case that passes fails, so a mend takes it out of the ledger, and a failing case the ledger does not list fails; each test file asks at its end that none it lists went unrun). Ten causes, 31 cases, each with what is read, what is true and its source, and the places the corpora hold by a plain search ([`ledger_counts.py`](ledger_counts.py), [its counts](ledger-counts.txt); the reviewer's counts are cited where it made them, and the six `#if false` sections and mojoPortal's ckeditor ids were checked here):

| Cause | Cases | Corpora |
| --- | ---: | --- |
| PostgreSQL's schema `public`, taken for T-SQL's reserved word | 1 | the reviewer: mojoPortal's 13 PostgreSQL install scripts declare nothing, 517 objects when quoted; `public.` 100 times in 3 files |
| PostgreSQL's dollar-quoted strings | 1 | 160 times in 8 files |
| A PostgreSQL function's and a MySQL procedure's body read by T-SQL's rule, to the batch's end | 2 | no `DELIMITER`; the functions among the 160 |
| A materialized view | 1 | none |
| MySQL's `#` and `/*! … */` comments | 2 | one `#` line in 1 file; no `/*!` |
| MySQL's backslash-escaped quote | 1 | twice in 1 file |
| SQLite's unnested comments, its `temp` schema, `key`, `file`, `user` as names | 3 | no `CREATE TABLE temp.`; the others not counted |
| A `<noscript>`'s text, raw only when scripting is on | 8 | none |
| The server's own code in a page: Razor's `@{ … }`, Web Forms' `<% … %>`, Razor's `@@` | 10 | at most 444 Razor blocks holding `//` or `/*` in 440 files (a URL's `//` counted too); `@@` 33 times in 8 files; no marker in a block's string |
| PowerShell's expandable here-strings holding `<#` or `#>`, the grammar's fault | 2 | 3 times in 2 files |

The first seven need the SQL reader to know a script's dialect; the eighth and ninth a markup reader that reads a page's code by that code's own parse; the last a patch of the engine's PowerShell grammar with corpus tests.

**The graders, with the batch's figures beside them.** The T-SQL and PL/SQL graders moved by no line: tSQLt 1,525 of 1,535 objects and 969 of 969 dependency lines, DNN's `.sql` 51 of 51 and 29 of 29, DNN's provider scripts 4,052 of 4,056 and 7,064 of 7,065, dbatools 26 of 26 and 199 of 199, utPLSQL 366 / 268 / 98 files and 433 / 270 / 163 / 248 lines. The PowerShell graders moved by no line on dbatools (7,479 / 7,478 / 7,478 wires), AL-Go, AzureStack-Tools and tSQLt. SQLite: the fixture 15 of 15, mojoPortal's schema 40 of 40. The C# grader: mojoPortal unchanged (7,061 / 8,299 / 7,023); DNN as under the third mend. In this repository's own graph only the changed sources' docs and the three new modules' docs moved; no sample program's or fixture's facts changed.

**A stale figure corrected.** The gathering's record gave DNN's provider scripts 6,961 of 6,962 dependency lines; the graders here and the reviewer's both measure 7,064 of 7,065, the 103 lines the mend reading `dbo.X` and a plain `X` as one object added after that table was written. Corrected where it stands, with this note.

**Verified on `9bc2471d0`:** lint and the build clean; the Live Docs regenerated and committed, no sample program's or fixture's doc changed; `npm run safe:commit`, the gate without the browser, unit 3,602, integration 500, every audit clean (it first found the ledger's JSON reached by no import, now a module); the page check's 50 browser cases through the lane after `npm run e2e:bundles`, 50 of 50; every grader of the batch run again, with the figures above.

## The history rebuilt on the gathered state

The one rebuild of the evening, on `gathering` at `869250949` (this worktree fast-forwarded to it; the sources of `packages/`, `scripts/`, `tsconfig.base.json` and the lock equal `gathering`'s), built, and set summary by summary beside the cache the main checkout held.

**What changed in the history's keyed code since that cache was made** (`a11f7d007`'s engine and generator, lens `eec130c1f768a807`), and what each was meant to move:

1. The test rules, by language, with the three reader facts (.NET test projects, Rust's `#[cfg(test)]` modules, tSQLt's test classes): a file's archetype. Among them, a folder named `fixtures` is a sample's only where `sampleRoots` names it.
2. The comment guard and its second round: a link, a name or a program mark that only a comment, a string's undecoded escape, a `#if false` section, a Ruby heredoc or data section, or the text of a `<script>`, `<style>`, `<textarea>` or `<title>` drew, gone, in C#, Ruby, CSS, HTML, ASP.NET markup and the DOM heuristic; a Rust crate's name read by the TOML parser.
3. A relative PowerShell path without an extension read as Windows runs it.
4. The SQL family: `IF NOT EXISTS`, backticks, `TEMP` and virtual tables declared; the trigger's body no longer searched for.
5. Positions after a character outside the Basic Multilingual Plane, which no summary holds.
6. `tooling/leaveOut.ts`, `knownDifferences.ts` and `spaces.ts`: called by no reader's path to a fact (the ledger only by tests), so nothing.

**The old cache.** `/workspaces/Live-Documentation/.mdmd/history/eec130c1f768a807` (1,586 summaries, 388 MB on disk), copied with `cp -r` into this worktree's `.mdmd/history/` with the memory record beside it (`pool.json`) and only read; the main checkout's was not touched.

**The rebuild**, by the product's own command: `TMPDIR=/tmp/claude-1000/rh npm run -s live-docs:history`.

| | |
| --- | --- |
| Started, ended | 21:48:35 and 23:12:06 UTC, 83.5 min of wall clock; "1565 regenerated in 82.0 min at 19 at a time" |
| The pool | 19 at a time, "by 62.73 GB of memory and 20 processors this process may use, at 687.0 MB a process, as measured here"; one change a worker, the default |
| The largest process | 696.6 MB at its peak (`pool.json`: 730,406,912 bytes) |
| Load | 3.6 at the start, about 38 at its highest, other builders at work |
| The check at the head | passed: "the last step's 1294 files, 5678 symbols with their words, and 7825 links are those of the Live Docs committed at 86925094, read afresh" |
| What it wrote | `.mdmd/history/984831ece895c963`, 1,565 summaries, 350.2 MB as the run counts it (382 MB on disk); `history.json`, 1,565 changes from `f7a75fa7` to `86925094`; the words beside it |

**The comparison**, by this morning's [`history-summary-causes.cjs`](../readers-gathering/history-summary-causes.cjs), and every differing entry classed by [`history-classify-tonight.cjs`](history-classify-tonight.cjs), kept beside this record with its output, [`history-classes-tonight.txt`](history-classes-tonight.txt), and a table of every differing path, its class, its count of commits and its first and last ([`history-paths-tonight.tsv`](history-paths-tonight.tsv)). Of the 1,543 commits both caches hold, **1,191 are identical and 352 differ**. 41 are in the old cache alone: commits of the readers' gathering branch's own line, which tonight's line, `gathering`'s first parents, reaches only through a merge's second parent (`021652e03` is one: an ancestor of the head, not on its first-parent line). 22 are in the new alone, tonight's. No list of links between docs differs, no summary's format, no other field. Every differing file entry falls under two of the changes above, and none under a class no change was meant to make:

| Cause | Entries, commits, paths | Read at its commits |
| --- | --- | --- |
| The test rules: a file under a `fixtures` folder that `sampleRoots` does not name is no sample's | 33,404 entries, 323 commits, 298 paths, every one from `implementation` to `test` | 295 paths under `tests/integration/benchmarks/fixtures/` (232 commits), whose configuration named no sample root (`fe377b0db`'s `.live-docs.config.json` holds four keys, none `sampleRoots`); the code before read any path holding a `fixtures` or `__fixtures__` folder, or the word itself (`/\bfixtures\b/`, `archetype.ts` at `a11f7d007`, line 127), as a sample's, and kept it implementation. Now the shared `tests` folder decides, as the test-rules record says. With them two JSON files under `tests/integration/…/__fixtures__/` and `tests/page-scan/fixtures.ts` (75 commits), the one file of this repository that record said would move |
| The SQL family: `CREATE TABLE IF NOT EXISTS` | 198 entries, 198 commits, 1 path | `data/migrations/001_init.sql`: its six tables, `artifacts`, `links`, `change_events`, `diagnostics`, `acknowledgements`, `snapshots`, now declared, each an opening; and the two names its foreign keys kept as written, `artifacts` and `diagnostics`, gone, since `REFERENCES artifacts (id)` now binds to the file's own table |

No C#, Ruby, CSS, HTML, ASP.NET, script, PowerShell or Rust fact differs on this repository's line: none of its files at any commit holds a construct only a comment, a `#if false` section, a heredoc or a text element's text writes, nor a PowerShell path without its extension beside two files, nor a crate whose name a bracket before it hid; positions are in no summary; and the modules of tonight that no reader calls moved nothing. **No finding**: no difference none of tonight's changes was meant to make.

**The two promises of the history's own change, checked again.** A short run with workers kept, `TMPDIR=/tmp/claude-1000/rh npm run -s live-docs:history -- --keep-workers --since 2026-11-21T20:30:00Z` (4 changes, 39.6 s), made the same code's cache under the other way of running workers, lens `ce3509f002d893d2`. Its 4 summaries are the default lens's byte for byte but for the key. Its run listed the default cache as "kept .mdmd/history/984831ece895c963, the same code's cache under the other way of running workers: 350.2 MB". The default command then run with `--remove-superseded` "removed .mdmd/history/eec130c1f768a807, the cache of a lens that is not the current one: 356.3 MB" (this worktree's copy; the main checkout's stands) and "kept .mdmd/history/ce3509f002d893d2, the same code's cache under the other way of running workers: 4.2 MB", rewriting `history.json` for the whole line with nothing regenerated and its check at the head passing. The memory record then held one record for each way: `{"one change a worker":{"lens":"984831ece895c963","peakMemory":730406912,"changes":1565},"workers kept":{"lens":"ce3509f002d893d2","peakMemory":723066880,"changes":4}}`. The twin's cache, made for this check only, was removed by hand after.

**What is handed over.** The new cache is this worktree's `.mdmd/history/984831ece895c963`, not committed, with `history.json`, its words and `pool.json` beside it, for the root to copy into the main checkout.
