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
- state: active
- holds: with a builder since 2026-11-21, on a branch `readers-gathering` cut from the day branch at `a5d29b90f`; first leg handed back at 02:43 UTC with SQL and PowerShell joined (`5c2b41bdd`, `c47de8e36`), the gate green without the browser and the SQL graders equal to their record, and the builder sent on to the .NET merge, a committed command that scores a PowerShell corpus (the scripts that scored five on 2026-11-19 were lost with the old container) and a committed account of every grading; the three sources are SQL on `worktree-agent-a3f00007018f5adbe` at `779a15fc`; PowerShell on `worktree-agent-a29a6d3f4a47f410b` at `29b3bb24`; .NET on `worktree-agent-ac7ef8df4222b2e4b` at `32d03c79`
- evidence:

Each merges with conflicts only in generated docs, its own record, the decisions log and three readers (`powershell.ts`, `csharp.ts`, `aspnet.ts`). Since they were parked the engine has changed under them: every read goes through the one reading step and the rule that a machine's failure is thrown on (the structural test names any catch that swallows one); a syntax tree is taken only through the tree-sitter helper; a reader's notices go to the generator's channel (PowerShell drops two loads its text does not fix, at its lines 1363 and 1375 on that branch); PowerShell's `archetypeOf` reads the file index. Records: [SQL](../AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md), [PowerShell](../AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md), [.NET](../AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md).

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

A stored procedure named from C#; a library's configuration reads against its host's file; a declaration in any branch of `#if`; which Pester a test file is written for. Each comes back as a table of candidate rules against its oracle before a rule is chosen.
