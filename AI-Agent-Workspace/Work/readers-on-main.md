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
- holds: the branch `readers-gathering` in its builder's worktree, tip `a0da03f59` when reviewed: SQL, PowerShell and .NET joined by ordinary merges (`5c2b41bdd`, `c47de8e36`, `16004f4ef`), a committed command that scores a PowerShell corpus (`e1ae5641a`), and the history's owed corrections with `glob` declared (`a0da03f59`); the builder is mending the review's findings there, each as a failing test first
- evidence: the gate without the browser green on the tip (2,989 unit and 465 integration tests); the account of every grading, on the branch at `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/README.md`, with each corpus's commit and folders named; an independent review handed back at about 03:46 UTC on 2026-11-21 that found the merges sound and the engine's promises kept, and nine faults in how names are resolved and in two graders' claims, set down below

Each merges with conflicts only in generated docs, its own record, the decisions log and three readers (`powershell.ts`, `csharp.ts`, `aspnet.ts`). Since they were parked the engine has changed under them: every read goes through the one reading step and the rule that a machine's failure is thrown on (the structural test names any catch that swallows one); a syntax tree is taken only through the tree-sitter helper; a reader's notices go to the generator's channel (PowerShell drops two loads its text does not fix, at its lines 1363 and 1375 on that branch); PowerShell's `archetypeOf` reads the file index. Records: [SQL](../AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md), [PowerShell](../AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md), [.NET](../AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md).

### What the independent review found, to be mended before the landing
- state: active
- holds: with three builders since 04:35 UTC on 2026-11-21, split by reader: the join's builder keeps .NET (findings 3, 1, 2, 9) on `readers-gathering`, a second has PowerShell and the archetype (4 to 7, and a tenth found since), a third has SQL (8); each on a branch from `cdbf98aa9`, to be merged into `readers-gathering` after review
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

Mended since the split, on `readers-gathering` at `3625bbfb6`, reviewed by root: the third finding (one shared step writes every XML comment over in spaces before any pattern runs, in project files, the XML form of a solution and the .NET configuration files; on DNN and mojoPortal no edge gained or lost, and 20 settings no longer read out of comments), and the C# oracle taking a project's references from MSBuild (no committed fixture's expectation moved). Root asked that no test start `dotnet`: a kept record stands in for the tool, as it does for `pwsh`.

A stored procedure named from C#; a library's configuration reads against its host's file; a declaration in any branch of `#if`; which Pester a test file is written for. Since 2026-11-21, a project reference under a condition: three of mojoPortal's projects reference their data projects once per database (`Condition="'$(Configuration)'=='Debug - MySql'"` and its like, eight in `mojoPortal.Business.csproj`); MSBuild's default configuration takes one, and the reader, as on `main`, takes all, which reaches every provider's namesakes. Candidates: the default configuration, every condition with the condition kept as a fact, a configuration the person names. Until it is measured the reader is unchanged and both C# graders count such references as a class of their own. the PowerShell reader no longer needs `node:crypto`; a run with `--remove-superseded` keeps the same code's cache under the other way of running workers. Ruled twice: the record of a summarizing process's memory is one per way of running workers, carried across changes of the code by the rule it had, since a first run after every upgrade sized by the default is what an 8 GB machine cannot afford.

### The comparison against the oracles, as a test that can fail
- state: active
- holds: with the SQL findings' builder since 2026-11-21, after its SQL mend
- evidence:

[`oracle.test.ts`](../../tests/integration/live-docs/oracle.test.ts) says of itself that it "asserts the bookkeeping, not the adapter's score": it checks that found plus missing equals what was expected, so no reader's regression on a sample program can fail the gate. Root found by hand on 2026-11-21 that three of the estate's twenty hand-verified edges are missing on the day branch (`Hub/PaymentHub.cs` to `Hub/App.config`; `Default.aspx.designer.cs` to `Default.aspx`; `PostPaymentRow.cs` to `dbo.usp_PostPayment.sql`) with nothing saying so. Asked for: a table of every sample program's found, missing and extra; then, for hand-verified edges, a committed ledger of the known misses, each with its cause, failing on a miss it does not list and on a listed one that is found, as [the page check's ledger](../../tests/page-scan/differences.json) does. For the compiler's edges the form waits on the table's sizes.

### The generator reads each file once and hands its text to its reader
- state: open
- holds: not begun
- evidence:

Ruled on 2026-11-19 as the right final form; it changes every adapter's first line, so it goes with this landing and its one rebuild. Since 2026-11-21 it is one face of a larger task, [the engine reading a folder through one interface](tool-arrives-on-windows.md#the-engine-reads-a-folder-through-one-interface), which a page needs too; the join's builder found that the hard part is the tables readers build across files (C#'s types, PowerShell's definitions, a project's reach), which read other files than the one in hand, and suggested the file index carry a `textOf(path)` beside the `archetypeOf` it now carries. Not begun, and not to be built as two things.

### An independent review with the graders as its oracles, then one rebuild
- state: open
- holds: not begun
- evidence:

The reviewer is given the code and the graders (ScriptDom for T-SQL, PowerShell's own parser, the compiler's edges for C#, the ANTLR grammar for PL/SQL) and none of root's conclusions. The rebuild takes about 71 minutes; the comparison is read, not counted, since summaries of commits that hold SQL, PowerShell or .NET samples are meant to differ.

### What is owed with the next change of the keyed code
- state: open
- holds: listed in [the fast rebuild's record](../AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md)
- evidence:

Stale comments and run lines of the default mode; `--remove-superseded` removing the other mode's cache; the pool's record taking the last mode's lens; `glob` declared in the generator's manifest.

### A query through a linked server reaches the Oracle piece
- state: open
- holds: not begun
- evidence:

The owner's own wire (`OPENQUERY`). The declaration of what a linked server's name stands for goes on the SQL Server piece, by their word of 2026-11-20. Two small changes in the board's join are known to be needed ([the several-folders run](../AgentSessionHistory/2026/11/2026-11-19/Probes/many-scans/README.md)).

### Measured before anything is built
- state: open
- holds: not begun
- evidence:

A stored procedure named from C#; a library's configuration reads against its host's file; a declaration in any branch of `#if`; which Pester a test file is written for. Since 2026-11-21, a project reference under a condition: three of mojoPortal's projects reference their data projects once per database (`Condition="'$(Configuration)'=='Debug - MySql'"` and its like, eight in `mojoPortal.Business.csproj`); MSBuild's default configuration takes one, and the reader, as on `main`, takes all, which reaches every provider's namesakes. Candidates: the default configuration, every condition with the condition kept as a fact, a configuration the person names. Until it is measured the reader is unchanged and both C# graders count such references as a class of their own. Each comes back as a table of candidate rules against its oracle before a rule is chosen.
