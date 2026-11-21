---
kind: issue
state: active
milestone: december-showing
order: 10
opened: 2026-11-20
---
# Their kinds of code read truthfully: the readers on `main`

**For the owner.** The tool run cold on public code shaped like yours "would not have worked in front of the owner's colleagues": PowerShell scripts with no connections, a SQL reader that crashed and invented objects, user controls that never reached their code-behind ([the cold run](../AgentSessionHistory/2026/11/2026-11-19/Probes/cold-run/README.md)). The mends exist, each graded against Microsoft's own parser, and none is on `main`.

**Done when.** `main` holds the three readers; each language's grader runs by one command and agrees as its record says; the history is rebuilt once and every difference from the old summaries is one a reader was meant to make.

**Rests on.** Three public codebases resembling yours, which is too narrow a base by your own word of 2026-11-21 ([their words](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)). Asked a third time which shapes your code has most of, you declined on purpose: "if I allow this to be too specified, I will allow for early victory celebration well before we've achieved what we've set out to do. It is not in my best interest to make only my use case look pristine"; breadth across "a wide variety of codebase shapes and languages and connectivities" is what "forced, really" a "more parsimonious and simple design". So it is not asked again, and what the readers mend next is ranked by [breadth across real repositories](proven-on-real-repositories.md), each measured against its language's own parser or compiler.

**Waiting on the owner.** Nothing blocks it. (Whether your Oracle side uses packages stays unknown; they are not built on a guess.)

## Tasks

### Join the three branches onto today's engine
- state: review
- holds: the branch `readers-gathering` in its builder's worktree, tip `a14ed4cd9`: the three readers joined, the review's nine findings and three found since mended by three builders and merged there, the day branch merged at `29dc3f644`; the independent reviewer's second pass handed back at 07:12 UTC on 2026-11-21 (seven of nine gone, new faults found, below); its findings are with the readers' builder and the PowerShell builder since 07:15 UTC; then one rebuild of the history and its comparison, then the merge into the day branch
- evidence: the gate without the browser green on the tip (2,989 unit and 465 integration tests); the account of every grading, on the branch at `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/README.md`, with each corpus's commit and folders named; an independent review handed back at about 03:46 UTC on 2026-11-21 that found the merges sound and the engine's promises kept, and nine faults in how names are resolved and in two graders' claims, set down below

Each merges with conflicts only in generated docs, its own record, the decisions log and three readers (`powershell.ts`, `csharp.ts`, `aspnet.ts`). Since they were parked the engine has changed under them: every read goes through the one reading step and the rule that a machine's failure is thrown on (the structural test names any catch that swallows one); a syntax tree is taken only through the tree-sitter helper; a reader's notices go to the generator's channel (PowerShell drops two loads its text does not fix, at its lines 1363 and 1375 on that branch); PowerShell's `archetypeOf` reads the file index. Records: [SQL](../AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md), [PowerShell](../AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md), [.NET](../AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md).

### What the independent review found, to be mended before the landing
- state: review
- holds: the nine mended on `readers-gathering` at `a14ed4cd9`, each with a failing test first and its answer from the language's own tool; the second pass found seven gone, the ninth not, and more (at this section's end), which two builders are mending
- evidence:

Each shown by running the generator on a few lines, unless marked read. Four were on `main` before the branch (the first, the third in part, the eighth in part, the ninth).

1. C#: a nested type inherited from a base class binds to a namesake reached by `using`; the compiler binds it to the base's.
2. C#: an alias to a non-generic type links the generic of the same name as well.
3. A project reference inside an XML comment is read as real, and widens what C# names can reach.
4. PowerShell: the functions PowerShell ships without a module (`Pause`, `help`, `prompt`) and its aliases are not in the list of shipped names, so a call to one wires to a workspace function of that name.
5. The PowerShell grader takes its list of shipped names from the reader's own module and repeats the reader's rule, so it can fail on how a file was parsed and never on the rule.
6. PowerShell: `Import-Module $m`, with `$m` assigned once to a module's name, gets a notice and loses the name.
7. What makes a file a test changed for every language where only PowerShell's evidence called for it: `test-utils.tsx` and its like stopped being tests.
8. SQL: a one-part name links to a table of that name in every schema, where T-SQL binds one; and `Db..Name` is classed differently from `Db.dbo.Name`. The SQL grader borrows the product's matching for the first, so it cannot fail on it.
9. ASP.NET, read: a `<script src>` resolves `~/` from the workspace's root where the directives resolve it from the project, and one that resolves nowhere is dropped unsaid.

Root's rulings went to the builder with each case: the reviewer's input committed first as a failing test with its answer from the language's own tool, then the mend, then the real corpora's numbers before and after; a second pass by the same reviewer; then one rebuild of the history.

Found since, by the join's builder:

10. PowerShell: a command qualified by its module (`Microsoft.PowerShell.Utility\New-Object`) is taken for a script's path, and noticed as a load no file holds. Seen in the reader's own notices on dbatools.
11. The committed C# oracle reads a project's references by the same kind of pattern the reader does, so on the third finding it agrees with the fault. Ruled: MSBuild's evaluation is its source.
12. scip-dotnet's symbols do not carry a generic type's arity, so it cannot grade the second finding. Ruled: the compiler's own binding, through the November 19 probe's program, is committed as the C# grader with a command of its own; where scip-dotnet cannot tell two types apart its expectation says ambiguous and counts neither way.

The round's end on `readers-gathering`, `a14ed4cd9`, reviewed by root: the ninth finding (a `<script src>` read by the directives' own rule: `~/` from the web application that holds the file, a path from the site's root left unlinked and said, a `?` or `#` suffix taken off, a remote or computed address skipped; counted first on DNN and mojoPortal, where no `src` holds a constant path inside a server expression, so none is read; DNN gains 5 true lines, mojoPortal 9 and 7 said unlinked, nothing lost); the SQL and PowerShell branches merged; the C# reader's SQL strings bound by T-SQL's order (nothing moves on the estate or DNN); the day branch merged. The page check there: 49 browser cases, every one without a difference, its ledger empty, and nothing new needed of Node. The gate without the browser: 3,164 unit and 491 integration tests.

Mended since on `readers-gathering` at `cabc1551d`, reviewed by root: the first and second findings, and the C# graders. A name is now looked for in each enclosing type and then in the types it inherits members from, up the chain, before any namespace or `using` (a base's own name read in its own file, with what its project sees); a `using` alias carries the type arguments its target writes, so `using H = Lib.Helper;` names the type with none. The C# compiler's own binding is a committed grader with a command of its own, `npm run oracle:csharp -- <folder>`, its project references from MSBuild (from the XML's elements where MSBuild cannot evaluate, said by project), its report counting apart the reader's extra edges that are namesakes, those resting on a reference under a condition, and the rest. Its record is kept for all five C# sample programs and a test holds the reader to it with nothing excused. On DNN the reader draws 20,971 C# file pairs to the compiler's 24,837, 20,392 in both; on mojoPortal 7,061 to 8,299, 7,023 in both: as recorded on 2026-11-19, with one true edge gained by the first finding and none lost. Left: the ninth finding, then the merges.

Mended since the split on the PowerShell builder's branch (`worktree-agent-ae657f091b28fdf6d`, tip `eddb8116b`), reviewed by root: findings four to seven and the tenth, each with pwsh's own answer kept as its test's truth. The functions PowerShell defines without a module and its aliases are shipped names, the union of pwsh 7 (from a committed script) and Windows PowerShell 5.1 (from Microsoft's documentation, each name with its page and line); pwsh corrected root's ruling on aliases: an alias call is a call to the command the alias names, so `select` never reaches a function named `select` and `gci` reaches a loaded `Get-ChildItem`. The grader takes the shipped names from the pwsh it runs and says what it cannot measure (the rule itself, which files are tests, names only 5.1 has). `Import-Module $m` with `$m` fixed keeps its name. A command qualified by a shipped module is PowerShell's own, and otherwise a script's path only where the workspace holds one. What makes a file a test is as on `main` for every file but PowerShell's. The four corpora score figure for figure as before, and dbatools' two false notices are gone. Its second round (tip `b266bf2ba`, its gate green on a quiet machine): a script run or dot-sourced by a path without its extension is the path's `.ps1`, as pwsh finds it, and never for a bare name (pwsh corrected the builder's first version before it was committed); a loop over module names the text writes out keeps each name; and the hand reading of 222 wires made on 2026-11-19 is a mode of the grader (`--verdicts`), by which the rule draws none of the 81 wires a person judged false and misses 6 of the 137 judged true, each by a name defined in two files or a path the text does not fix. **For the owner when next asked:** making that reading a standing test needs a small extract of facts from four public repositories committed (per PowerShell file: its path, the functions it defines, the commands it calls, what it loads; no code; MIT and Apache 2.0, each notice kept beside it), which would be the first data derived from other people's code in this repository.

Mended since the split on the SQL builder's branch (`worktree-agent-abde3d56d5d8a22dd`, tip `01af6b3a1`), reviewed by root: the eighth finding. A one-part name binds to its module's schema, then `dbo`, and to nothing where neither holds it; `database..name` reads as `database.dbo.name` does; a schema-less trigger takes its table's schema; a one-part name in DDL inside a module binds as a loose script's does. Microsoft's documentation, quoted with its pages in the grader's head, corrected root's ruling twice: inside a module the caller's default schema is never searched, and `database..name` never takes the module's schema. The grader now states T-SQL's order itself and can fail on it; on tSQLt, DNN's scripts, the provider scripts and dbatools no line changed. Then measured and built (`d14ee5043`): a written `dbo.X` and an object created as plain `X` are one object, since a user's default schema is `dbo`; it adds 103 lines, every one in DNN's oldest upgrade scripts, where procedures were created without a schema and later scripts alter and call them with `dbo.`; ten of ten sampled are true, and nothing is removed on any corpus.

Mended since the split, on `readers-gathering` at `3625bbfb6`, reviewed by root: the third finding (one shared step writes every XML comment over in spaces before any pattern runs, in project files, the XML form of a solution and the .NET configuration files; on DNN and mojoPortal no edge gained or lost, and 20 settings no longer read out of comments), and the C# oracle taking a project's references from MSBuild (no committed fixture's expectation moved). Root asked that no test start `dotnet`: a kept record stands in for the tool, as it does for `pwsh`.

Already mended on the branch before the split (`cdbf98aa9`): the PowerShell reader no longer needs `node:crypto`; a run with `--remove-superseded` keeps the same code's cache under the other way of running workers. Ruled twice: the record of a summarizing process's memory is one per way of running workers, carried across changes of the code by the rule it had, since a first run after every upgrade sized by the default is what an 8 GB machine cannot afford.

**The second pass, handed back at 07:12 UTC on 2026-11-21, on `a14ed4cd9`.** Seven of the nine are gone, each run again with neighbouring cases against the compiler, ScriptDom or pwsh. The fifth is gone as far as this machine can show: the PowerShell grader takes its shipped names from pwsh itself, which here is PowerShell 7 on Linux, so Windows PowerShell 5.1's half is graded by nothing. The ninth is not gone. Found new or still standing, each shown by running unless marked, and sent to the builders at 07:15 UTC:

- ASP.NET Core: `~/` in a view's `<script src>` is the web root (`wwwroot`); the directives' rule reads it as the project folder, so every Core `_Layout.cshtml` shows its scripts unlinked. To be measured on two real Core repositories before it is a rule.
- Script tags inside comments (`<%-- --%>`, `<!-- -->`) are read as scripts. Older than the branch.
- PowerShell: a loop over written-out names keeps them when its body reassigns the loop's variable.
- PowerShell: a script run by a path without its extension, beside a `.ps1` of the same name, is read as Linux finds it. What Windows does is unmeasured: the reviewer believes it runs the `.ps1`, root's memory of PowerShell's source says the literal file. To be read from PowerShell's own source; if the platforms differ, the fork comes back to root and the owner.
- C#: a member a type inherits does not hide a type of the same name where an expression is read (2 on DNN, 3 on mojoPortal). Older than the branch.
- The C# grader cannot fail for a file added to a fixture: it grades only the files its kept record lists, and nothing ties that record to the sources.
- The PowerShell oracle test stays green with the alias rule switched off, its fixture holding no call by an alias.
- SQL: a linked server's object with its schema left out (`Srv...Orders`) is bound to a local `dbo` object; the grader expects the name kept, since the remote login's default schema is in no file. Older than the branch.

Shown able to fail, by the reviewer switching one rule off at a time and seeing unit and oracle tests turn red: the base-type lookup, the alias's arity, the XML comments, the SQL binding. The graders' figures on mojoPortal, DNN, dbatools and AL-Go were run again and equal the record's. Not reached by either pass: PL/SQL and utPLSQL, `csharp.dependencies.ts`, the history's changes in `computeHistory.ts`, `scip-edges.ts` and `compare.ts` in detail, the PowerShell verdicts mode, a run on Windows.

### The comparison against the oracles, as a test that can fail
- state: active
- holds: built and merged on `readers-gathering` (a ledger of the hand-verified misses, a ledger by cause for the compiler's edges, both failing on a miss they do not list and on a listed one that is found); the second pass of the review found one hole, a C# file added to a fixture is graded by nothing until its kept record is written again, which the readers' builder is closing
- evidence:

[`oracle.test.ts`](../../tests/integration/live-docs/oracle.test.ts) says of itself that it "asserts the bookkeeping, not the adapter's score": it checks that found plus missing equals what was expected, so no reader's regression on a sample program can fail the gate. Root found by hand on 2026-11-21 that three of the estate's twenty hand-verified edges are missing on the day branch (`Hub/PaymentHub.cs` to `Hub/App.config`; `Default.aspx.designer.cs` to `Default.aspx`; `PostPaymentRow.cs` to `dbo.usp_PostPayment.sql`) with nothing saying so. Asked for: a table of every sample program's found, missing and extra; then, for hand-verified edges, a committed ledger of the known misses, each with its cause, failing on a miss it does not list and on a listed one that is found, as [the page check's ledger](../../tests/page-scan/differences.json) does. For the compiler's edges the form waits on the table's sizes.

The table came back on 2026-11-21: across 26 measured sample programs, 50 compiler edges missing (39 of them in C and C++), 4 extra, 3 hand-verified missing (the three above, each now in the estate's ledger with a cause found by reading why), 2 project references "missing" that are the comparison's own fault (it names a Rust crate's project file as a `.csproj`). The builder's form for the compiler's edges, ruled yes: a ledger by cause, one sentence for each cause with the edges it explains, failing on an edge no cause lists and on a listed one that is found; about seven causes for 54 edges, each to be confirmed by reading its reader.

Built on the SQL builder's branch (`9614ae646`), reviewed by root: [one ledger at the sample programs' root](../../tests/integration/programs/), since a cause crosses programs; each cause says what the reader does and what the compiler does, and its kind. Reading the readers overturned two of the builder's own first guesses. The causes, with root's rulings on their kinds:

| Cause | Kind | Edges |
| --- | --- | ---: |
| C and C++: a call, and a header's prototype, to the `.c` that defines the function | gap (root's ruling: with only the `#include` drawn, nothing reaches an implementation file from its callers, so "what is reachable" and "is this dead code" answer wrongly for C) | 33 missing |
| C and C++: a name declared in a header reached only through another header | gap | 6 missing |
| A method called on a value whose type the code does not write (Go, Python, Rust) | gap; closing it takes type inference | 3 missing |
| Go: every file to the one file the indexer makes its package's | grain: the indexer's own bookkeeping, naming nothing that file declares | 7 missing |
| Python: `from ..util import money` to the package's `__init__.py` | grain: the reader's edge is true, the import runs that file | 1 extra |
| Rust: the crate root as a file | grain | 2 extra, 1 missing |

An edge a person asserted in a program's hand-verified list is no longer counted an extra against the compiler (the estate's HTTP call). The three gaps are not mended in this landing: each is ranked with the work on breadth and measured against its language's indexer on real repositories first. Left for after the branches merge: one field in the oracle (each project's root file), so that Cargo's references between targets are graded as file edges.

### The generator reads each file once and hands its text to its reader
- state: open
- holds: not begun
- evidence:

Ruled on 2026-11-19 as the right final form; it changes every adapter's first line, so it goes with this landing and its one rebuild. Since 2026-11-21 it is one face of a larger task, [the engine reading a folder through one interface](tool-arrives-on-windows.md#the-engine-reads-a-folder-through-one-interface), which a page needs too; the join's builder found that the hard part is the tables readers build across files (C#'s types, PowerShell's definitions, a project's reach), which read other files than the one in hand, and suggested the file index carry a `textOf(path)` beside the `archetypeOf` it now carries. Not begun, and not to be built as two things.

### An independent review with the graders as its oracles, then one rebuild
- state: active
- holds: two passes done on 2026-11-21 (the first at about 03:46 UTC, the second at 07:12 UTC, [their findings above](#what-the-independent-review-found-to-be-mended-before-the-landing)); the second pass's mends under way; the rebuild after them
- evidence:

The reviewer is given the code and the graders (ScriptDom for T-SQL, PowerShell's own parser, the compiler's edges for C#, the ANTLR grammar for PL/SQL) and none of root's conclusions. The rebuild takes about 71 minutes; the comparison is read, not counted, since summaries of commits that hold SQL, PowerShell or .NET samples are meant to differ.

### What is owed with the next change of the keyed code
- state: open
- holds: listed in [the fast rebuild's record](../AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md)
- evidence:

Stale comments and run lines of the default mode; `--remove-superseded` removing the other mode's cache; the pool's record taking the last mode's lens; `glob` declared in the generator's manifest.

### One oracle for C#: the compiler, with scip-dotnet retired
- state: open
- holds: not begun; after the landing
- evidence:

Run side by side on the five C# sample programs on 2026-11-21, scip-dotnet and the compiler's own binding agree on every pair of four, and on the fifth scip-dotnet cannot say what the compiler can (its symbols carry no arity, so `Helper` and `Helper<T>` are one name to it). What scip-dotnet's record still gives the comparison is the list of documents indexed and the projects, which the compiler's program can give. Ruled by root: one oracle for a language, the language's own compiler; the handling of scip-dotnet's ambiguous symbols and of its namespace-only type names then goes for C#.

### What makes a file a test, in each language
- state: open
- holds: not begun
- evidence:

One pattern serves every language but PowerShell: a path that holds the word `test` or `tests`, or a file's name in one of a few shapes. Nobody has measured it. Known wrong on real code: tSQLt's `Source/tSQLt.Tests.view.sql`, the framework's own view, is read as a test; whether `src/test-utils.tsx` is a test is a guess either way. PowerShell's rule was measured (Pester's own name, folders alone) and is confined to PowerShell's files since 2026-11-21. The oracle each language already has: its test runner's own rule for finding tests (Jest's and Vitest's patterns, pytest's, Go's `_test.go`, Pester's `.Tests.ps1`, an attribute in .NET). To be measured against those on real repositories before any rule changes.

### A query through a linked server reaches the Oracle piece
- state: open
- holds: not begun
- evidence:

The owner's own wire (`OPENQUERY`). The declaration of what a linked server's name stands for goes on the SQL Server piece, by their word of 2026-11-20. Two small changes in the board's join are known to be needed ([the several-folders run](../AgentSessionHistory/2026/11/2026-11-19/Probes/many-scans/README.md)).

Beside it since 2026-11-21: a three-part name that points at another database (`SisterDb.dbo.Orders`) is drawn as a same-database edge to this folder's `dbo.Orders`, the database's name ignored. Whether that line is true depends on which database a script belongs to, which nothing the readers know says yet (a `USE` statement, a project's name, a declaration). The same knowledge the linked server's declaration needs.

### Measured before anything is built
- state: open
- holds: not begun
- evidence:

A stored procedure named from C#; a library's configuration reads against its host's file; a declaration in any branch of `#if`; which Pester a test file is written for. Since 2026-11-21, a project reference under a condition: three of mojoPortal's projects reference their data projects once per database (`Condition="'$(Configuration)'=='Debug - MySql'"` and its like, eight in `mojoPortal.Business.csproj`); MSBuild's default configuration takes one, and the reader, as on `main`, takes all, which reaches every provider's namesakes. Candidates: the default configuration, every condition with the condition kept as a fact, a configuration the person names. Until it is measured the reader is unchanged and both C# graders count such references as a class of their own. Also since 2026-11-21: DNN keeps its procedures in 299 `.SqlDataProvider` files, which no reader reads as SQL (whether a person may name a reader for an extension of their own, and what its tokens such as `{databaseOwner}` then need); and ASP.NET Core resolves `~/` and a static script's path from the web root (`wwwroot`), which the directives' rule does not know, so the two Core sample folders show unlinked scripts and neither corpus holds a Core case to measure a rule on (since 07:15 UTC the readers' builder is measuring it on two public Core repositories, the reviewer's second pass having shown every Core layout hit by it). Each comes back as a table of candidate rules against its oracle before a rule is chosen.
