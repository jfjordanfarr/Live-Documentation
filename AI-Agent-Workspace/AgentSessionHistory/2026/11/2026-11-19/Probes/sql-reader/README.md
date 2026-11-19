# The SQL reader, graded by Microsoft's T-SQL parser

Current as of November 19, 2026. A builder wrote this for the root while mending the SQL reader after [the cold run](../cold-run/README.md), on a branch of eight commits from `2114bff6` and one for this record, accepted by the root for the December landing. A second leg the same evening added two commits and is recorded under [The second leg](#the-second-leg-executed-strings-openquery-and-plsql), at the end. The reader is code the history's cache is keyed on, and the root gathers it with other work for one landing. No subagent was used.

## In short

- **The crash is gone.** A bracketed name is read as the name itself, apostrophes, dots and all. Generation over the whole of tSQLt, nothing excluded, wrote all 465 docs after the first mend.
- **But the last mend exposes another crash on tSQLt, which is not the reader's.** Now that the reader sees `FROM tSQLt.[@tSQLt:SkipTest](…)`, five tSQLt files link to `Source/tSQLt.(at)tSQLt_SkipTest.sfn.sql`. A link to a file whose name holds a `)` is the cold run's crash 2, in `document.ts`'s link pattern, which another builder owns. Generation stops there until that mend lands. With the five `(at)` files excluded, tSQLt generates all 461 docs. **The last commit must not land before the format's mend for `)` in a link target.**
- **Every line is right.** 1,497 of 1,497 symbols on tSQLt stand at their CREATE's line, against 618 of 1,154 found that morning.
- **The dependencies agree with the parser.** On tSQLt, 943 of 943 dependency lines are right, none missing, none invented, against 855 right, 88 missing, 279 invented. On three bodies of SQL the reader was never mended against (DNN's provider scripts, DNN's `.sql`, dbatools' `.sql`), 6,860 of 6,861 are right and none invented, against 6,325 right and 1,400 invented.
- **Two decisions are the owner's to confirm**, each its own commit so that it can be dropped: the database engine's own catalog (`sys.*`, `INFORMATION_SCHEMA.*`) is no longer kept as names, which revises the owner's rule of October 9, "no builtins"; and a table a procedure's body creates is no longer a symbol of the script.

## The oracle and how to run it

`npm run oracle:sql -- <folder>` reads every `.sql` file of a folder with ScriptDom (`Microsoft.SqlServer.TransactSql.ScriptDom` 170.191.0, the parser SQL Server's own tools use), reads the same files with the SQL adapter as the generator does (a pass for the symbols, then one with the index they make), and prints the figures: objects created and found, lines right, dependency lines right, missing and invented, broken down by how each object is used, and the strings the scripts execute.

- `--detail` lists every disagreement.
- `--json` prints data.
- `--sample <n> --seed <s>` reports a seeded draw of files.
- `--only <prefix>` narrows the files.
- `--write` keeps the parser's record as the folder's `expected/sql-scriptdom.json`. A folder that keeps one is read from it, so .NET is not needed.

The pieces:

- **`scripts/oracle/sql-scriptdom.cs`** is the emitter, a .NET file-based program (`dotnet run`, the package pinned in its `#:package` line, fetched from NuGet on the first run). It records, per file:
  - the parser's errors;
  - every CREATE, with its line and whether the script or a module's body runs it;
  - every place a statement names a schema object, and how;
  - what the statement decides a name stands for: a CTE, an alias, a temporary table;
  - every string executed.

  Nothing is trimmed: a name held anywhere the program does not know is listed as `other`, with its parent and property.
- **`scripts/oracle/sql-compare.ts`** is the comparison. Its header states once what it grades as a use and what it sets aside as no object of the folder, for both sides alike:
  - **graded:** execute, select, insert, update, delete, merge, truncate, alter table, call, table-valued function, foreign key;
  - **set aside:** CTEs, a statement's own table sources, temporary objects, the `sys` and `INFORMATION_SCHEMA` schemas, the `xml` type's five methods.

  It matches names by a rule written there, not imported from the product. Files the parser refuses are listed and not graded.
- **`tests/integration/live-docs/sql-oracle.test.ts`** holds the adapter to two kept records, against a register of measured misses: the estate's SQL Server scripts and a new fixture, `tests/integration/fixtures/sql-server/`, written in the shapes the cold run found on tSQLt. The register for that fixture held 19 misses at the first commit and holds none now. The estate's has been empty throughout.

The tSQLt, DNN and dbatools figures come from scratch copies of the cold run's checkouts. Nothing of those projects is committed.

## Before and after on tSQLt

tSQLt at `4a921d0d`: 281 `.sql` files, 268 of which the parser reads. The 13 it refuses are SQLCMD scripts, templates and experiments. ScriptDom counts 1,506 objects the scripts themselves create and 943 dependency lines their docs should carry.

| After commit | Objects found | Objects invented | At the CREATE's line | Dependency lines right | Missing | Invented |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `2114bff6` (start) | 1,154 | 624 | 618 of 1,154 | 855 | 88 | 279 |
| `b26cb98f` the crash | 1,497 | 376 | 830 of 1,497 | 897 | 46 | 268 |
| `27e53ad7` the lines | 1,497 | 376 | 1,497 of 1,497 | 897 | 46 | 268 |
| `fdf9533e` tokens; names that are no objects | 1,497 | 374 | 1,497 | 897 | 46 | 213 |
| `44c8dcfe` the engine's own catalog | 1,497 | 374 | 1,497 | 897 | 46 | 6 |
| `c47bd69f` tables made in a procedure's body | 1,497 | 0 | 1,497 | 899 | 44 | 1 |
| `e46f6253` the missing references | 1,497 | 0 | 1,497 | 943 | 0 | 0 |

The commit that added the oracle, `637a4752`, comes first and changes no product code. The nine objects never found are a trigger (`tSQLt.Private_Seize_Stop`) and eight types (`CREATE TYPE`), kinds the reader has no symbol for. Of the invented objects, 348 at the start and all 374 later were tables that test procedures create in their bodies.

### On SQL the reader was not mended against

These corpora were graded after the mends were written, to see whether the mends generalise. They found four more faults, mended in the last commit: comma lists of tables, tables in parentheses, a table variable's alias, and a carriage return alone ending a line.

| Corpus | Files graded | Objects found | At the CREATE's line | Dependency lines right | Missing | Invented |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| DNN provider scripts, start | 299 | 4,039 of 4,043 | 2,970 | 6,127 of 6,656 | 529 | 364 |
| DNN provider scripts, end | 299 | 4,039 of 4,043 | 4,039 | 6,655 of 6,656 | 1 | 0 |
| DNN `.sql`, start | 12 | 38 of 38 | 0 | 29 of 30 | 1 | 9 |
| DNN `.sql`, end | 12 | 38 of 38 | 38 | 30 of 30 | 0 | 0 |
| dbatools `.sql`, start | 24 | 15 of 15 | 3 | 169 of 175 | 6 | 1,027 |
| dbatools `.sql`, end | 24 | 15 of 15 | 15 | 175 of 175 | 0 | 0 |

DNN's provider scripts are `.SqlDataProvider` files. The reader does not read them; they were graded as copies with `{databaseOwner}` filled as `dbo.` and `{objectQualifier}` as nothing. The four objects missing there are table types. The one line missing is `sp_changeobjectowner 'Files', 'dbo'`, a procedure called without `EXEC` as the first statement of its batch.

### The twenty-file sample, seed 1119

The cold run's own draw was not kept, so this is a draw of its own: a Fisher–Yates shuffle of the 268 graded files, sorted, by mulberry32 from seed 1119 (`--sample 20 --seed 1119`). Every disagreement in it is listed by `--detail`.

The twenty files:

- `Build/SQL/EnableExternalAccess.sql`
- `Experiments/LIKE4000.sql`
- `Experiments/SQLCmdTest.1.2.sql`
- `Tests/RemoveObjectTests.class.sql`
- `Tests.EXTERNAL_ACCESS_KEY_EXISTS/Private_InitTests_EAKE.class.sql`
- and fifteen from `Source/`:
  - `tSQLt.AssertEmptyTable.ssp.sql`
  - `tSQLt.AssertEqualsString.ssp.sql`
  - `tSQLt.AssertLike.ssp.sql`
  - `tSQLt.Fail.ssp.sql`
  - `tSQLt.PrepareServer.ssp.sql`
  - `tSQLt.Private_CreateFakeFunction.ssp.sql`
  - `tSQLt.Private_GenerateCreateProcedureSpyStatement.ssp.sql`
  - `tSQLt.Private_GetFormattedErrorInfo.sfn.sql`
  - `tSQLt.Private_ListTestAnnotations.sfn.sql`
  - `tSQLt.Private_SysTypes.svw.sql`
  - `tSQLt.Private_TableToTextColumnListSeparatorLine.sfn.sql`
  - `tSQLt.Private_TableToTextColumntoStringList.sfn.sql`
  - `tSQLt.SpyProcedure.ssp.sql`
  - `tSQLt.Uninstall.ssp.sql`
  - `tSQLt.schema.sql`

| | Objects found | Invented | Lines right | Dependency lines right | Missing | Invented |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Start | 19 of 26 | 4 | 16 of 19 | 29 of 38 | 9 | 13 |
| End | 26 of 26 | 0 | 26 of 26 | 38 of 38 | 0 | 0 |

Read as Live Docs, two examples:

- `tSQLt.Private_DisallowOverwritingNonTestSchema`, which the cold run found listing nothing, now depends on `tSQLt.Private_IsTestClass` in `tSQLt.class.sql`.
- `Run_Methods_Tests.class.sql`, one of the five files that stopped generation, has its 89 test procedures named as written, such as `Run_Methods_Tests.[test that tSQLt.Run executes single test when called with test case name]`.

## The commits

Each could be dropped from the end. The two in the middle that are the owner's to confirm stand alone.

1. **`637a4752` Grade the SQL reader by Microsoft's T-SQL parser.** Adds the emitter, the comparison, `npm run oracle:sql`, the fixture, the two kept records, the integration test with its register, a unit test of the comparison, and a row in [internal tooling](../../../../../../../.mdmd/layer-2/internal-tooling.mdmd.md#oracle).
2. **`b26cb98f` Read a bracketed or double-quoted SQL name as the name itself.** The comment and string blanking passes over a quoted name whole, with `]]` and `""` as escapes, and a string or comment left open runs to the end of the text. A written name is split only at the dots outside its quotes. It is written back bare, unless a part holds a dot, a bracket, a double quote or a space at either end; then that part is bracketed.
3. **`27e53ad7` Count a SQL declaration's line past comments and strings that span lines.** The blanking keeps line breaks.
4. **`fdf9533e` Read SQL from tokens, so that a name a statement defines is no object.** The reader moves to tokens. These are no longer read as objects:
   - a CTE;
   - an `UPDATE`'s or `DELETE`'s alias;
   - a cursor read by `FETCH … FROM`;
   - `CREATE TYPE x FROM INT`;
   - `CREATE USER x FROM LOGIN`;
   - a foreign key's `ON UPDATE CASCADE`;
   - a word T-SQL reserves (`EXECUTE AS`, `UPDATE STATISTICS`, `FROM OPENQUERY(…)`);
   - the text inside a bracketed name.
5. **`44c8dcfe` Keep no SQL name of the database engine's own catalog.** `sys.*`, `INFORMATION_SCHEMA.*`, and a one-part `OPENJSON`, `STRING_SPLIT` or `GENERATE_SERIES` in a `FROM`. **For the owner:** this revises [October 9](../../../../10/2026-10-09/2026-10-09.1.record.md#turn-10), "no builtins". The reason given then was that system schemas differ by database. These two are the catalog in SQL Server and in Oracle (`SYS`), and `INFORMATION_SCHEMA` in MySQL and PostgreSQL too; no user object can live in SQL Server's. On tSQLt they were 207 of the 213 names left kept wrongly.
6. **`c47bd69f` Publish no table a SQL procedure's body creates as the script's own.** A procedure, function or trigger must be the only statement of its T-SQL batch, so its body runs to the batch's end. A table created there is made when the module runs. It is no longer a symbol, though it still counts as the file's own. **For the owner:** ScriptDom places such a table in the body, and on tSQLt these were 374 test fixtures that linked test files to each other. The price for an estate: a procedure that creates a permanent table at run time, where no script defines that table, now leaves other scripts' uses of it as names kept rather than links to the procedure.
7. **`e46f6253` Read the SQL references the reader missed.** Now read:
   - calls by a name of two or more parts, which is how T-SQL calls a schema's function;
   - `EXEC @rc = name`;
   - `APPLY`;
   - a `MERGE`'s `USING`;
   - `REFERENCES`;
   - `INSERT`, `DELETE` and `MERGE` without their optional `INTO` or `FROM`;
   - comma lists of tables;
   - tables in parentheses.

   Now set aside:
   - methods of the `xml` type on a column;
   - an event session's events and targets;
   - a Service Broker service;
   - a table variable's alias;
   - PL/SQL's `EXECUTE IMMEDIATE`.

   A carriage return alone ends a line. The adapter reads a script once instead of twice, and a name is matched only against declared objects with the same last part. That took the adapter's second pass over DNN's 299 provider scripts from 19 s to 3 s.

8. **`04ca9ad0` Name the SQL oracle's two entry points in this repository's hand-read list.** `sql-compare.ts` is run by `npm run oracle:sql` and `sql-scriptdom.cs` is a program, as `powershell-ast.ps1` is. The generator wrote both `Entry` lines rightly; the full gate's integration stage found the hand-read expectation had not been told. It belongs with the first commit, which cannot be amended.

This probe record, filled in commit by commit, is completed in a commit of its own after them, with dated notes in the two test files' docs.

## Tests that were red before their mend and are green after

| Commit | Test | Red before because |
| --- | --- | --- |
| crash | `tests/integration/live-docs/sql-generation.test.ts`, generation over the cold run's three-line repro and a tSQLt-shaped class | failed with the cold run's own message, `smallest.sql.md: line 7: unexpected evidence on the opening entry` |
| crash | `openings.test.ts` "never lets an apostrophe in a bracketed name open a string" | the name came out as `a'b]` run across lines |
| crash | `openings.test.ts` "reads a name quoted in brackets or double quotes as the name itself" | names garbled, `]]` and `""` not unescaped |
| lines | `openings.test.ts` "puts a declaration at its own line, whatever comment, string or name spans lines before it" | line 2 for line 4 |
| tokens | `openings.test.ts` "reads nothing inside a comment, a nested comment or a string" | a nested comment's tail was read as code |
| tokens | `openings.test.ts` "reads no name a statement or its batch defines, nor a word T-SQL reserves, as an object" | CTEs, aliases, `FROM LOGIN`, `UPDATE CASCADE`, `EXECUTE if` from a bracketed name and the rest were read |
| catalog | `openings.test.ts` "reads no object of the database engine's own" | `sys.objects`, `STRING_SPLIT` and the rest were kept |
| bodies | `openings.test.ts` "tells a table a procedure's body creates when it runs from one the script creates"; `sql.test.ts` "publishes what the script creates, not a table a procedure's body creates" | the body's table was a symbol |
| missing | `openings.test.ts` "reads what a script calls and applies, executes into a variable, references by a foreign key, and writes without INTO or FROM" | calls, `APPLY`, `USING`, `REFERENCES`, `EXEC @rc =`, comma lists, parenthesised joins were not read |
| missing | `openings.test.ts` "ends a line at a carriage return alone" | one line early |
| missing | lines added to the "reads no name a statement … defines" test: `UPDATE Jobs … FROM @Jobs Jobs`, `EXECUTE IMMEDIATE` | red against the previous commit's reader, checked by swapping it back in |

`tests/integration/live-docs/sql-oracle.test.ts` changed its register in every commit. Its size went 19, 15, 11, 8, 7, 6, 0.

## Changed docs of this repository

`npm run live-docs:generate` changes only these docs between `2114bff6` and the end:

- **`openings.ts`**: its generated symbols moved; `stripSql` and `sqlDeclaredName` are gone, and `sqlNameParts`, `sqlWrittenName` and `readSql` are new. Its authored Notes say what the reader now reads and sets aside, and the history of the three mends.
- **`adapters/sql.ts`**: authored Purpose and Notes only. They record what is read, the two decisions for the owner, and that the adapter is now measured.
- **`openings.test.ts`**: its dependencies, since `stripSql` is no longer imported; and a dated note on the day's tests.
- **`adapters/sql.test.ts`**: a dated note on its new case.
- **`tests/integration/live-docs/expected/repository-entries.json`**: its links to the two new entries.
- **`internal-tooling`**: a row for `oracle:sql`.
- **New docs**, each with authored Purpose and Notes citing this probe:
  - the four oracle files;
  - the two integration tests;
  - the six fixture scripts and the fixture's record;
  - the estate's record.

No doc of the estate's SQL or C#, of any other C# sample, or of anything else changed. The estate's SQL Server scripts agreed with ScriptDom from the start. The Oracle script `CENTRAL.ACCOUNT.sql` still gives table `CENTRAL.ACCOUNT` at line 2.

**The C# adapter reads SQL held in its strings through the same reader**, so every mend applies there too. No C# doc changed in this repository, in the estate, or in the cold run's shop, generated before and after. DNN's C# was not regenerated.

## Executed strings (dynamic SQL), measured and not built

ScriptDom reads a string the script executes when the string is written out. A string computed from variables cannot be read.

**tSQLt**: 1,127 executed strings in 101 files.

- How they are executed:
  - 995 by `EXEC('…')`: 883 written out, 112 computed;
  - 89 by `sp_executesql`: 24 written out, 65 computed;
  - 43 by `EXEC @variable`.
- Of the 907 written out, 570 create an object. Most are test fixtures, but some are tSQLt's own objects created conditionally. So the reader gives `tSQLt.AssertStringIn`, `tSQLt.AssertStringTable` and the view `tSQLt.Private_HostPlatform` no symbol, and their callers keep their names.
- 200 strings in 26 files name an object; 146 of those name an object a script of tSQLt creates.

Examples:

- `Source/tSQLt.AssertStringIn.ssp.sql:7`: `EXEC('CREATE PROCEDURE tSQLt.AssertStringIn … ')` executes `tSQLt.TableToText` and `tSQLt.Fail`.
- `Source/tSQLt.Private_Init.ssp.sql:13`: `sp_executesql` of `SELECT @r = … FROM tSQLt.Info() AS I`.
- `Tests/AnnotationHostPlatformTests.class.sql:13`: `EXEC('INSERT INTO tSQLt.Private_HostPlatform(host_platform) VALUES (''SomePlatform'');')`.
- `Source/tSQLt.Private_HostPlatform.svw.sql:5`: `EXEC('CREATE OR ALTER VIEW tSQLt.Private_HostPlatform AS SELECT host_platform FROM sys.dm_os_host_info;')`.

**DNN's provider scripts**: 111 executed strings in 43 files, 31 written out and 80 computed.

- 13 create an object. Seven are the *stub, then ALTER* idiom of an idempotent deployment script: `EXEC('CREATE PROCEDURE dbo.[JsonWebTokens_GetById] AS BEGIN SELECT 1 END')`, then `ALTER PROCEDURE dbo.JsonWebTokens_GetById …` with the real body.
- 18 name an object, 11 of them one the scripts create. Most are table rebuilds: `EXEC('INSERT INTO dbo.Tmp_Roles (…) SELECT … FROM dbo.Roles')`.
- Across DNN's provider scripts, 26 `ALTER` statements alter an object no script creates at top level. The reader gives those objects no symbol.

**DNN's `.sql` files**: 28 executed strings, 13 written out, all 13 creating an object. For example, `InstallCommon.sql:143`: `EXEC('CREATE PROCEDURE [dbo].aspnet_RegisterSchemaVersion AS RAISERROR(…)')`.

The design question for the owner, with its parts:

1. Should a literal string a script executes be read as SQL? Read that way, it would yield creates and uses as the parser does. The cost: such a fact is in a string, so its basis is not source.
2. Should an `ALTER PROCEDURE` of an object no script creates make a symbol? That is the stub-then-ALTER idiom, and a migration script's habit.
3. The owner's estate names its Oracle tables inside `OPENQUERY(ORACLE_CENTRAL, '…')` strings, the "OraQueries" of September 27. That is the same question for the wire that matters most. Neither corpus here uses it.

## UTF-16

SSMS can save a script as UTF-16. The adapter reads files as UTF-8, so it gets text with a NUL between every character. It finds no word it knows: the doc has no symbols and no dependencies, and nothing is said. ScriptDom, reading by the byte-order mark, sees the procedures and the link the reader misses. The decoding belongs to the other builder; the adapter itself gives no signal.

## What the reader does with PL/SQL today

Tried on ordinary package, procedure, function, view, sequence, trigger and synonym definitions (scratch files, not committed).

- **Read right:**
  - a standalone `CREATE [OR REPLACE] PROCEDURE | FUNCTION | VIEW | TABLE` becomes a symbol at its line, and `/` alone on a line ends a batch;
  - `FROM`, `JOIN`, `INSERT`, `UPDATE`, `DELETE`, `MERGE`, `REFERENCES`, and a cursor's `SELECT`;
  - `SYS.` names are set aside as the engine's;
  - the estate's `CENTRAL.ACCOUNT.sql` is unchanged.
- **Not symbols:**
  - `CREATE OR REPLACE PACKAGE` and `PACKAGE BODY`, nor the procedures and functions inside a package;
  - triggers, sequences, synonyms and types.
- **Calls:**
  - a call through a package (`audit_pkg.log_event(…)`, `central.account_pkg.post_payment(…)`) is read as a call, and kept as a name, since package members are not symbols;
  - a call by one part (`log_line(…)`, a standalone procedure called without its schema) is not read, by T-SQL's rule that a one-part call is the engine's.
- **`EXECUTE IMMEDIATE '…'`** is not read. It made a dependency named `IMMEDIATE` until the last commit.
- **Breaks the rest of the file:**
  - a SQL*Plus `PROMPT` (or `REM`) line holding an apostrophe, such as `PROMPT Creating the day's close`: the apostrophe opens a string, and every declaration after it was lost in the trial;
  - Oracle's q-quoted strings, `q'[it's]'`, do the same.
- **Mismatches with Oracle's rules:**
  - block comments are read nested, as T-SQL nests them; Oracle does not, so `/* a /* b */` would swallow text up to the next `*/`;
  - T-SQL's reserved words are applied, so an Oracle name such as `FILE`, `KEY` or `PLAN` written bare would not be read as a name.

## Forks decided by the builder

- **The SQL reading is shared with C#.** The brief said to stop if a mend changed another language's reading. The C# adapter hands its strings' SQL to this same reader, so a mend to SQL reading is a mend to that too. It went ahead, measured C# docs in three places, and found none changed. The root may see it otherwise.
- **How a name is written.** A symbol's or a kept name's parts are joined by dots, bare unless a part holds a dot, a bracket, a double quote or a space at either end; that part is bracketed with `]]` for `]`. So the form is `tests.test it doesn't fail` and `tests.[test fn.sums]`. A name holding a line break is handed over as is, for the format to carry.
- **What counts as a call.** A name of two or more parts followed by a parenthesis, unless a word before it makes it the thing named (`ON`, `INTO`, `FUNCTION`, `INDEX`, `EVENT`, `TARGET` and the like).
- **CTE scope.** A CTE is read across its batch, where T-SQL scopes it to one statement. The parser has found no case where that matters, on any of the four corpora.
- **The two decisions for the owner** above, each a commit of its own.
- **The comparison's grading rules**, stated once in `sql-compare.ts`. The uses a map should draw are graded. Drops, grants, `ALTER PROCEDURE`, type uses, sequences, synonym targets, triggers' and indexes' tables, and `SELECT … INTO` are counted and not graded, with how many name an object of the folder. The xml type's methods are set aside unconditionally, since the parser cannot tell `r.Lines.value(` from a function `value`.

## Verification

`npm run safe:commit`, without the browser, under a private temporary folder, at `04ca9ad0` plus this record:

- Live Docs generated and linted: 1,105 files validated, none changed by the run.
- Lint and build passed, and so did the tests' type-check.
- Unit tests: 2,249 in 197 files.
- Integration tests: 158 in 23 files, among them the C# oracle on the estate, the PowerShell oracle, the estate's seven scans, Rosetta parity, this repository's entries and the new SQL oracle and generation tests.
- Documentation link enforcement and the three SlopCop audits passed.

The first run of the gate failed twice, and both are dealt with:

- **The hand-read list of this repository's entry points** had not been told of the oracle's two files. That is mended in `04ca9ad0`.
- **`history/sequence.test.ts`** timed out once at its five-second deadline, at a load average near 29 on 20 threads. It passed alone and in the second full run; it touches nothing of SQL.

## Unfinished

- **The format's crash 2 must land first**, as above. The reader now links tSQLt files to files whose names hold parentheses.
- **No symbol for some kinds of object.** `CREATE TYPE`, `CREATE TRIGGER`, `CREATE SYNONYM` and `CREATE SEQUENCE` have no symbol kind. That is 9 objects on tSQLt and 4 on DNN. Synonyms appear only inside test bodies in these corpora, so nothing was built. An estate may well reach its Oracle tables through synonyms, and a new kind touches the board's door kinds and the Explorer.
- **Uses counted but not read.** On DNN's provider scripts, uses of objects the scripts create:

  | How | Uses |
  | --- | ---: |
  | drop | 3,398 |
  | index's table | 241 |
  | other | 311 |
  | `ALTER` | 43 |
  | grant | 13 |
  | type | 5 |

  Whether a drop or an index's table should draw a wire is a question for the map, not the reader.
- **A procedure called without `EXEC`** as the first statement of a batch. This is one line on DNN. Reading it needs a list of the statement words T-SQL does not reserve (`THROW`; and SQL*Plus's `PROMPT`), so it was not built.
- **`.SqlDataProvider` is not read.** Its `{databaseOwner}{objectQualifier}` placeholders would need filling. Graded copies show the reader would be right on them.
- **Speed.** Reading DNN's provider scripts (299 files, 6.6 MB) takes about 2.8 s a pass now. The original reader took 6.4 s to read them twice, one 0.8 MB file alone 4 s. On tSQLt a pass takes about 0.5 s, about twice the original's.

## The second leg: executed strings, OPENQUERY, and PL/SQL

The root accepted the nine commits above and ruled on what they left open:
- **The shared C# reading:** right.
- **Tables made in a body:** accepted.
- **The engine's own catalog:** put to the owner, kept as a commit of its own; nothing below depends on it.
- **The `)` link:** mended on the names' branch, which lands first.

The owner then said three things:
- their SQL Server scripts do query Oracle through `OPENQUERY` ("YES!");
- every SQL file of theirs ends in `.sql`, and their database repositories are systems of record;
- they do not know whether the Oracle side uses packages.

Two more commits:

- **`df05e35b` Have the SQL oracle read the strings a script executes.** The emitter now records `OPENQUERY` with its linked server (and `EXEC (…) AT` one). For every executed string it records whether it runs in the script or in a module's body, the line its text starts on, and the strings it executes in turn. What it reads inside carries lines of the file.

  The comparison reads every string written out in full that the parser reads, and states the rules once in its header. An object the script creates and later alters stands at its last `ALTER`. An `ALTER` of a procedure, function, view or trigger is graded as a use.

  A new fixture script, `Procedures/Billing.usp_Settle.sql`, holds:
  - a stub created by `EXEC('CREATE …')`, then an `ALTER` with the body;
  - strings written out and one computed;
  - an `OPENQUERY` to `ORACLE_CENTRAL`;
  - an `ALTER VIEW` of a view nothing creates.

  Its register held the five misses of the reader at that commit.
- **`411dc559` Read the SQL a script executes from a string written out in full.** The reader reads `EXEC ('…' + '…')`, `sp_executesql N'…'`, `OPENQUERY(server, '…')` and `EXEC (…) AT server` when every part is a literal, nested strings too.
  - What a string creates is the script's symbol when it runs in the script.
  - What a string creates inside a module's body is made when the module runs.
  - What a string creates on a linked server is that server's.
  - What a string uses is the script's use, written `server..schema.name` when the string runs on a linked server.
  - A string with any computed part is not read.

  An `ALTER` is a use: kept by name when nothing creates the object, a link when another script does.

  **The stub, then `ALTER` idiom gives one symbol, at the last `ALTER`.** That is where the body a person reads stands; the stub's `CREATE … AS SELECT 1` is a placeholder. The `CREATE`'s line would point a reader at the placeholder.

  A written name's database and schema are now taken by their places, so `server...name` folds to `name`. Two unit tests were red against the previous reader and are green, and the fixture's register is empty again.

### ScriptDom's figures, with the strings read

| Corpus | Objects found | Lines right | Dependency lines right | Missing | Invented |
| --- | ---: | ---: | ---: | ---: | ---: |
| tSQLt, before | 1,497 of 1,535 | 1,495 of 1,497 | 937 of 969 | 32 | 6 |
| tSQLt, after | 1,525 of 1,535 | 1,525 of 1,525 | 969 of 969 | 0 | 0 |
| DNN provider scripts, before | 4,039 of 4,056 | 4,034 of 4,039 | 6,655 of 6,962 | 307 | 0 |
| DNN provider scripts, after | 4,052 of 4,056 | 4,052 of 4,052 | 6,961 of 6,962 | 1 | 0 |
| DNN `.sql`, before | 38 of 51 | 38 of 38 | 20 of 29 | 9 | 10 |
| DNN `.sql`, after | 51 of 51 | 51 of 51 | 29 of 29 | 0 | 0 |
| estate's SQL Server scripts | 2 of 2 | 2 of 2 | 2 of 2 | 0 | 0 |

- **What is left.** The ten objects left on tSQLt and the four on DNN are types and a trigger: kinds with no symbol, the question put to the root with the PL/SQL kinds below. The one line left on DNN is the implicit `EXEC` (`sp_changeobjectowner 'Files', 'dbo'`), which the work on strings did not make exact.
- **The strings counted and not read.** On tSQLt, 112 `EXEC (…)` and 65 `sp_executesql` have a computed part, and 44 `EXEC @variable` run a procedure named in a variable. One string written out is not T-SQL the parser reads. On DNN's provider scripts, 69 and 11 are computed.
- **What the earlier lines mean.** On DNN's `.sql` files, ten names kept before, such as `dbo.aspnet_RegisterSchemaVersion`, are now links: the stub `EXEC('CREATE PROCEDURE …')` in `InstallCommon.sql` creates them. On tSQLt, six such names became links or went: `tSQLt.AssertStringIn` and `tSQLt.Private_SysIndexes`, among others, are created by strings.

### Fifty of the new wires, read

Item 1 added 347 dependency lines over the three corpora: 32 on tSQLt, 9 on DNN's `.sql`, 306 on DNN's provider scripts; 322 of them are links to a file. It removed 16 lines, each a name kept that is now a link.

Fifty were drawn by a seeded shuffle (mulberry32, seed 1119) of the sorted list, and each was read against ScriptDom's record. Five were also checked by eye in the source:
- `02.02.02.sql`'s `ALTER PROCEDURE dbo.AddTab` at line 3304;
- `03.00.12.sql`'s `ALTER procedure dbo.GetHostSettings` at line 393;
- `ExpectExceptionTests.class.sql:274`, `EXEC('CREATE PROC MyTestClass.TestExpectingException AS EXEC tSQLt.ExpectNoException; …')` inside a test procedure;
- `InfoTests.class.sql:44`, `EXEC('INSERT INTO tSQLt.Private_HostPlatform …')`;
- `Source/tSQLt.AssertStringIn.ssp.sql`, whose string's body executes `tSQLt.TableToText` and `tSQLt.Fail`.

Of the fifty:
- **41 are `ALTER` uses in DNN's upgrade scripts.** Of these, 39 link an upgrade script to the scripts that create the procedure it alters, and 2 keep the name of a procedure nothing creates (`dbo.aspnet_Membership_UpdateUserInfo`, `dbo.aspnet_Membership_CreateUser`).
- **8 are uses inside strings on tSQLt**: `EXEC` of `tSQLt.Fail`, `tSQLt.ExpectNoException`, `tSQLt.TableToText` and `tSQLt_testutil.tSQLtTestUtil_UnsafeAssemblyAndExternalAccessRevoke`, and `INSERT` into the view `tSQLt.Private_HostPlatform`, itself created by a string.
- **1 is a `DELETE`** in a DNN `sp_executesql`.

All fifty are right by the rules above. One thing they show is a consequence of the matching rule, not of the reader. DNN's upgrade scripts drop and re-create the same procedure in many versions (`dbo.AddTab` in at least 02.02.02, 05.00.01, 05.03.00 and 06.02.02). A script that alters or uses it links to every version that creates it, as every other use already did, under the presumption that several declaring files are all kept. On a system of record whose scripts are one file per object, as the owner describes theirs, this does not arise. On a folder of versioned upgrade scripts it draws a dense web; the map should perhaps say so.

### OPENQUERY to Oracle: the owner's wire

**What the estate sample holds.**
- `Database/SqlServer/dbo.usp_PostPayment.sql` reads `ORACLE_CENTRAL..CENTRAL.ACCOUNT`, a four-part name through the linked server; it uses no `OPENQUERY`.
- `Database/Oracle/CENTRAL.ACCOUNT.sql` creates the table.
- The board declares a thing `sqlserver` from `Database/SqlServer` and a thing `oracle` from `Database/Oracle` that serves `CENTRAL.ACCOUNT`.
- Nothing anywhere ties the name `ORACLE_CENTRAL` to `oracle`.

**Before and after item 1, on the estate's own shape.** A copy of the estate was given one more procedure, `dbo.usp_GetBalance`, reading `FROM OPENQUERY(ORACLE_CENTRAL, 'SELECT ACCOUNT_NO, BALANCE FROM CENTRAL.ACCOUNT') AS a`.
- **Before**, its doc had no dependencies: `OPENQUERY` is a word T-SQL reserves, and the query was a string.
- **After**, its doc links to `CENTRAL.ACCOUNT` in `Database/Oracle/CENTRAL.ACCOUNT.sql`, basis contract, exactly as `dbo.usp_PostPayment`'s four-part name does. The name it keeps when the two databases are scanned apart is `ORACLE_CENTRAL..CENTRAL.ACCOUNT`, the same written form as the four-part name's. The estate graph joins that name to the `oracle` thing's door through the same rule the seven-scan estate test already proves for `usp_PostPayment`.

**Why the wire forms today.** The join matches the schema and the table, `CENTRAL.ACCOUNT`, and ignores the linked server's name. The estate has one `CENTRAL.ACCOUNT`, so the wire is right.

**What is still missing.** Nothing in the code says which database the linked server `ORACLE_CENTRAL` reaches. That is defined on the SQL Server instance (`sp_addlinkedserver`, `sp_addlinkedsrvlogin`) and usually not in source control. Three things follow:
1. Two databases on the board that both hold `CENTRAL.ACCOUNT` (a second Oracle database, or a test copy) both receive the wire. The reader cannot choose, and should not guess.
2. A name the query leaves unqualified (`SELECT … FROM ACCOUNT`) is resolved on Oracle by the linked login's default schema, which is in the linked server's definition, not the script. Today it matches an `ACCOUNT` in any schema.
3. If the instance's linked servers are scripted in the repository, the reader could read `@server = N'ORACLE_CENTRAL', @datasrc = N'CENTRAL_PROD'` as a fact. Tying a data source such as `CENTRAL_PROD` to a folder would still be the person's.

**The declaration a person would make**, then, is one line per linked server: *the linked server `ORACLE_CENTRAL`, as the `sqlserver` thing sees it, is the thing `oracle`* (and, where it matters, its default schema, `CENTRAL`). The vision already names this as its third tier of edges: "Declared. A person draws the edge: a linked-server query". The board is where it would live, beside the things it ties.

Neither of these lines exists in the board's format today:
- on the `sqlserver` thing: `- Linked server: ORACLE_CENTRAL → oracle`;
- or on the `oracle` thing: `- Reached as: ORACLE_CENTRAL`.

With such a line, the estate join could match a `server..schema.name` name only against the doors of the thing the server stands for, and say "declared" in its evidence. Without it, the join stays a match by schema and table, right when the name is unique on the board. Growing the board's format is the root's to decide. Nothing was built for it.

### Verification of the second leg

`npm run safe:commit` without the browser, at `e9fe1ca5`, at a load average near 31 on 20 threads:
- Live Docs: 1,106 validated, none changed by the run.
- Lint, build and the tests' type-check passed.
- Unit: 2,249 of 2,251 passed. The two that failed timed out at five seconds: `history/sequence.test.ts` and the Explorer's `forceGraphOctree.test.ts`, neither touching SQL. No Explorer file changed on this branch. Each passed when run alone.
- The stages after the unit tests were then run one by one, all passing: integration (158 tests in 23 files), the documentation link enforcement, and the three SlopCop audits.

### PL/SQL against a parser that is not ours: not started in this leg

Item 1 and item 2 took the time. Nothing was built and nothing was measured for PL/SQL. What was found, for the next round:
- **A parser.** Java 21 and Maven are on this machine already. The ANTLR project's PL/SQL grammar (`PlSqlLexer.g4`, `PlSqlParser.g4` and their Java base classes, from the grammars-v4 repository) can be generated by the ANTLR tool jar fetched into scratch and compiled with `javac`, with nothing installed machine-wide. It parses packages, package bodies and SQL*Plus-free PL/SQL. It does not resolve names, and SQL*Plus commands (`PROMPT`, `REM`, `/`) are not PL/SQL, so its own reading of a script holding them has to be split first, as SQL*Plus would split it.
- **A codebase.** utPLSQL, the Oracle counterpart of tSQLt: public, Apache 2.0, packages calling packages, specs and bodies in separate files, and SQL*Plus install scripts.
- **The measurement still owed** is the one briefed: objects, lines, dependency lines, missing and invented. Then the mends that break reading, each red first: the q-quote, and `PROMPT` and `REM` lines. Then the measurement of packages as symbols, with what a new symbol kind touches. Those were named in the first leg: the board's door kinds, `SQL_OBJECT_KINDS` and `OPENING_KINDS` in `openings.ts`, the Explorer's drawing of doors, and the estate graph's join. The same list holds for TYPE, TRIGGER, SYNONYM and SEQUENCE in T-SQL.

## The third leg: PL/SQL graded by the ANTLR project's grammar

The root accepted the second leg and ruled on the linked server: it goes to the owner with the two forms above, and nothing is built for it. This leg did the PL/SQL work, measurement first. One commit:

- **`32578989` Read past Oracle's q-quoted strings and SQL*Plus PROMPT and REM lines.**

### The parser that is not ours, and what it cannot judge

The ANTLR project's PL/SQL grammar (`sql/plsql` in grammars-v4, its `master` of November 19) was generated with the ANTLR 4.13.2 tool and compiled with the machine's Java 21. The tool jar and the grammar were fetched into scratch; nothing is installed. A small Java emitter in scratch walks the tree and prints, per file:
- the parse errors;
- every top-level `CREATE` (package, package body, procedure, function, view, table, trigger, type, type body, synonym, sequence) and its line;
- the procedures and functions a package spec or body holds;
- every table or view read or written (`FROM`, `INSERT`, `UPDATE`, `DELETE`, `MERGE`, a foreign key's `REFERENCES`);
- every routine a call statement runs, and every function called with arguments.

Neither the emitter nor the generated parser is committed. The emitter is about 150 lines; it and a fetch-and-build script can be added under `scripts/oracle/` when the root wants a kept PL/SQL record.

**What it cannot judge.**
- **Name resolution, above all.** It cannot tell a package's member from a schema's function, a collection's element `arr(i)` from a call, or a package's own procedure called by one part from a standalone procedure. The grading therefore grades calls only by two or more parts, and counts the rest. It resolves a name by the same presumption as the T-SQL comparison, written in the grading script: a two-part call `a.b(…)` uses package or type `a` when one exists, else object `a.b`.
- **Some of Oracle's syntax.** It refused 98 of utPLSQL's 366 files, which are listed and not graded. All 17 synonyms fail on `create noneditionable synonym`. Type attributes with `integer default`, `(self as …)` in type bodies, and several core package bodies are also refused.
- **SQL*Plus.** It does not read it. Both readers were given the same text with every SQL*Plus line blanked, its line kept: `PROMPT`, `REM`, `SET`, `SPOOL`, `DEFINE`, `@script`, `EXEC` and the like, 693 lines in all. `EXEC` lines were blanked too, so their calls are in neither side.

### The codebase

utPLSQL, `develop` of November 19, Apache 2.0, the Oracle counterpart of tSQLt. It has 366 PL/SQL files: `.pks` and `.pkb` (package specs and bodies), `.tps` and `.tpb` (type specs and bodies), `.syn`, `.trg` and `.sql`. Each was given `.sql` added to its name for the reader, since the reader reads only `.sql` and every SQL file of the owner's ends in `.sql`.

### Today's reader, graded

On the 268 files the grammar parses:

| Kind | Objects the grammar finds | Found by the reader | At the right line |
| --- | ---: | ---: | ---: |
| package (spec) | 40 | 0 | |
| type (spec) | 113 | 0 | |
| table | 15 | 11 | 11 |
| sequence | 4 | 0 | |
| procedure (standalone) | 1 | 1 | 1 |
| function (standalone) | 1 | 1 | 1 |

- **Bodies and members.** The grammar also finds 26 package bodies and 55 type bodies, and 976 procedures and functions declared in the 40 package specs.
- **Objects invented by the reader:** none.
- **The four tables not found** were not looked into in this leg; why the reader misses them is unknown.

| Dependency lines | Before the mend | After |
| --- | ---: | ---: |
| expected | 433 | 433 |
| right | 266 | 270 |
| missing | 167 | 163 |
| invented | 243 | 248 |

Most of what is missing and invented is one thing seen from both sides: a call into a package. ScriptDom-style grading expects a link to the package's spec file. Today the reader keeps the call as a name, such as `= ut.run` or `= ut_utils.to_string`, so each such line counts once as missing (the link) and once as invented (the name).

Counted and not graded:
- 973 calls by one part and 88 call statements by one part, the cases the grammar cannot tell from local procedures and collection elements;
- 18 `DROP TABLE` and 15 other places a table is named.

### The mends, red first

- **The q-quoted string**, `q'[it's]'` (18 utPLSQL files hold one). Its apostrophe opened a string that ran to the next apostrophe, so what followed was misread.
- **A `PROMPT` or `REM` line holding an apostrophe.** None is in utPLSQL; the owner-shaped trial of the first leg had one.

Both are now read: a q-quoted string is one string token, and a `PROMPT`, `PRO`, `REM` or `REMARK` line is skipped where a statement could begin. A column named `Remark` on its own line inside a query stays a name, and the test holds that too.

After the mend, 4 more of utPLSQL's dependency lines are right. Five more package calls the q-quotes had hidden now show as kept names. tSQLt's 969 of 969 are unchanged.

On the raw text, with the SQL*Plus lines left in, the reader's figures are the same except for 12 more invented lines. Those are the calls on `EXEC` lines, which the split blanked for both sides; the reader reads them as calls.

Nothing else the grammar showed makes the reader lose what follows.

### Kinds of symbol: the whole cost, for one ruling

**How many each corpus holds, and how many dependency lines kept by name today would become links if the kind were a symbol.**

| Corpus | Kind | Objects | Kept names that would resolve |
| --- | --- | ---: | ---: |
| utPLSQL (268 parsed files) | package | 40 specs, 26 bodies, 976 members | 212 (221 on the raw text) |
| utPLSQL | type | 113 specs, 55 bodies | 1 |
| utPLSQL | sequence | 4 | 0 (`NEXTVAL` is not read as a use) |
| utPLSQL | synonym | 17 files, all refused by the grammar | not measured |
| utPLSQL | trigger | 1 file, refused | not measured |
| tSQLt | type | 9 (one created by a string) | 0: a type's uses (`@p tSQLt.AssertStringTable READONLY`) are not read |
| tSQLt | trigger | 1 | 0 |
| tSQLt | synonym | 3, all inside test procedures' bodies | 0 |
| DNN provider scripts | type | 4 | 0, as for tSQLt |

**Packages are the one kind that changes the picture.** On a codebase built of packages, 212 of the 433 dependency lines the grammar expects are a call into a package, and today each is kept as a name with no wire.

**Types, triggers, synonyms and sequences change little until their uses are read too.** That is a reading step of its own: a parameter's or column's type, a trigger's table, `NEXTVAL` of a sequence, and a synonym's target.

The owner does not know whether their Oracle side uses packages. On utPLSQL nearly every routine lives in one: 2 standalone routines against 976 in packages.

**Everything a new kind of symbol touches**, read from the code:
- **`openings.ts`.** `SQL_OBJECT_KINDS` makes a kind a database object: matched by name, a door on the board and an opening. `OPENING_KINDS` makes a file serving one an entry. `sqlKind` names the kind, and `SQL_DECLARED_KINDS` reads the `CREATE`. A package would also need its members, and the matching of `pkg.member(…)` to the package, with the package body's file tied to its spec's.
- **`board.ts` and `boardGraph.ts`.** `DOOR_KINDS`, the kinds a person may promise on a thing, and the doors a thing serves.
- **`estateGraph.ts`.** The join of names across scans by `SQL_OBJECT_KINDS` and `sqlNameMatches`.
- **The Explorer.** Its drawing of doors by kind, and any icon or word it gives a kind.
- **The CLI's `inspect`.** It prints kinds.
- **This repository's own docs.** The estate's doors and the fixtures' docs change where a kind appears.
- **The oracle comparison's `ADAPTER_KIND`.**

### The four reads of a file

**What was seen in the SQL reader.** The generator analyses each file twice: once for the symbol index, once with it. Until the first leg, the SQL adapter tokenized the text twice in each pass, once for declarations and once for references: four readings of a file, which `readSql` brought to two.

**For the builder adding one reading step.** The C# adapter's `analyze` reads its file twice in one pass too: the parsed facts, and then `fs.readFile` again for the text. A reading step shared by both of the generator's passes, keyed by path and content, would make it one read and one parse per file. That was seen in the code, not measured.

### Verification of the third leg

`npm run safe:commit` without the browser, at `32578989`, passed whole, at load averages of 29 at its start and 17 at its end on 20 threads:
- Live Docs: 1,106 validated, none changed by the run.
- Lint, build and the tests' type-check passed.
- Unit: 2,252 tests in 197 files. Integration: 158 tests in 23 files.
- The documentation link enforcement and the three SlopCop audits passed.
