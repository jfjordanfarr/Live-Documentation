# The hand reading of 222 PowerShell wires, kept as a test

Historical evidence, written on November 22, 2026 by a builder for the root, on `day/2026-11-22` from `b3fe1749a`. Nothing under `packages/` changed.

**What this is.** On November 19 two judges read 222 PowerShell wires by hand in four public repositories and agreed on every one ([the probe](../../../2026-11-19/Probes/powershell-wires/README.md), [the rows](../../../2026-11-19/Probes/powershell-wires/samples.md)). That reading is the only independent truth held for the reader's rule, "loaded, else unique", on real code. Until today it lived in a probe's record, and a run against it needed the four repositories fetched by hand ([`--verdicts`](../../../2026-11-21/Probes/readers-gathering/powershell-findings.md#4-the-hand-reading-as-a-command)). The owner allowed a small extract of the repositories to be committed as test data today: "paths, function names, calls; no code", answered "Yep! Go ahead!". It is now a test that runs in the gate.

**The count.** Of the 222 wires, the reader of today draws **211** as the judges read them. The other 11:
- 6 true wires it does not draw.
- 4 arguable wires, pinned to what it draws today: 2 drawn, 2 not.
- 1 row that cannot be scored, the cold run's shop, which was never committed.

No false wire of the 81 is drawn.

## What was built

| File | What it is |
| --- | --- |
| `tests/integration/fixtures/powershell-judged/extract.json` | The extract: 210 files of the four corpora, and all 222 rows with both verdicts. 135,182 bytes. |
| `tests/integration/fixtures/powershell-judged/licences/*.txt` | Each repository's licence notice as the repository carries it. Four files, about 12.7 KB. |
| `scripts/oracle/powershell-judged.ts` | Writes the extract from the corpora with PowerShell's parser, and writes a corpus's skeleton from the extract. |
| `tests/integration/live-docs/powershell-judged.test.ts` | The test, beside the other oracle tests. |

**The corpora**, each at the commit the hand reading was judged on. All four clones were checked at those commits, and tSQLt's was checked to be unmodified.

| Corpus | Address | Commit | Licence, and where its notice is kept | Files kept |
| --- | --- | --- | --- | ---: |
| dbatools | https://github.com/dataplat/dbatools | `067b215bf843ec3573a79226ac9d2b871d1440cb` | MIT, Copyright (c) 2018 Chrissy LeMaire: `license`, as `licences/dbatools.txt` | 138 |
| AL-Go | https://github.com/microsoft/AL-Go | `403f36ab563291207687c513c8dedd93f683f8ce` | MIT, Copyright (c) Microsoft Corporation: `LICENSE`, as `licences/al-go.txt` | 59 |
| AzureStack-Tools | https://github.com/Azure/AzureStack-Tools | `0e4a9f32c4677e2ee3b687032e0472b890a772b6` | MIT, Copyright (c) 2016 Microsoft: `LICENSE.txt`, as `licences/azurestack-tools.txt` | 6 |
| tSQLt | https://github.com/tSQLt-org/tSQLt | `4a921d0dacfb1d66b3db124c58158c80e5e910e6` | Apache 2.0: `Build/License.txt`, in full, as `licences/tsqlt.txt` | 7 |

**How each licence is kept.**
- **MIT.** The licence asks that its copyright notice and permission notice go with "all copies or substantial portions". Paths and function names are hardly a substantial portion, but each notice is kept whole beside the extract anyway.
- **Apache 2.0.** Section 4 asks three things of a redistribution of a Work or a Derivative:
  - **a copy of the licence:** kept in full;
  - **notices on files that were changed:** the extract's head says it was changed from the repositories' files, by keeping only paths, names and lines;
  - **the notices the source carries:** tSQLt has no `NOTICE` file.
- **AzureStack-Tools' third-party notices.** Its `ThirdPartyNotices.txt` and `third-party-license.txt` cover other authors' files, such as PowerShell formatting files. None of the six files kept is among them.
- **The extract's head** names each repository, its address, commit, licence and notice file, and the owner's permission with its date. The test checks each of these, and checks each notice file by its copyright line.

The licence files arrived with CRLF endings. The repository's `.gitattributes` stores them with LF; their words are unchanged.

## The form chosen: a skeleton the real reader reads, built from a committed extract

The root offered two forms, a recorded table replayed against the rule's pure function or a skeleton the real reader reads, and leaned to the second. I built the second, with one change of where it lives. The extract is committed as one JSON file. The test writes each corpus's skeleton from it into a temporary folder and runs `powershellAdapter.analyze` over each calling file, with the skeleton's files as its index, as the generator would have it read them. A true wire must be drawn and a false one not.

**What the skeleton holds.** Each file holds three kinds of line, each at its own line number:
- the functions it defines whose names a judged wire calls, written `function Name { }` at the file's own level or `& { function Name { } }` where the original is local to a function or a script block;
- its judged calls, as written, with `&` or `.` where the original has one;
- its loads of other kept files, as the plainest load of the same kind: `. "$PSScriptRoot/…"`, `Import-Module "$PSScriptRoot/…"` or `& "$PSScriptRoot/…"`. A `using module` or `#requires` is an import, and a manifest is a table of its file entries with an empty `ModuleVersion` to mark it one.

A test checks that every line of every skeleton is one of these forms, so no corpus code can creep in.

**What each form would have proved.**
- **A recorded table against the rule's pure function** would grade the rule alone. But the reader has no such function to call: `calledFiles` takes the reader's own workspace and facts and is not exported. Feeding it would mean rebuilding the reader's types in the test, and the test would then grade that rebuild, not the reader.
- **The skeleton read by the real reader** grades more of the reader: its grammar's reading of each definition, and whether a definition is at the file's own level or local; its call names, aliases and the case of names; its loads by `$PSScriptRoot`; its modules (a `.psm1`, a manifest's root, what a module dot-sources); its reach through imports; its test archetype by path; and its list of names PowerShell ships.
- **What neither proves** is the reader's reading of how the corpora's own text writes its loads: `Join-Path`, a variable, a loop over `Get-ChildItem`, a `BeforeAll`'s variable. Those are written again plainly, because writing them as the corpora do would mean keeping their code.

**Why the skeleton is not committed as files.** Committed as `.ps1` files under `tests/integration/fixtures/`, its 210 files would join this repository's own scan, and the repository is one PowerShell workspace. Every name the skeleton defines would then count against the uniqueness of the fixtures' names, and their loads would join the repository's graph. The estate and the other samples under `tests/integration/programs/` are folders of real code for the Explorer to show; the skeleton is test data, not a program anyone should see. So the extract is one JSON file and its licences are four text files.
- `npm run live-docs:generate` created seven docs (the extract, the four notices, the script and the test) and changed no other doc: 1,297 unchanged, 0 updated.
- The extract's doc links to the four notices, because each corpus names its notice file.
- Nothing names the extract `expected/powershell-ast.json`, so `powershell-oracle.test.ts` does not take it for a parser record.

## How the files were chosen, and checked against the whole corpora

For each corpus the extract keeps:
- every calling file, and every file a row claims;
- every file that defines a judged name at its own level, so that "unique" means what it meant in the whole corpus;
- the module roots whose modules hold a calling file, with the files that put it there;
- every file on a load path from a calling file, or from such a root, to a defining file, so that "loaded" means what it meant too.

Of each file it keeps only the definitions of judged names (at any level, since a caller's own local copy makes a call its own), the judged calls, and the loads between kept files.

That this loses nothing was measured, not assumed. Each row was read four ways ([`crosscheck.tsv`](crosscheck.tsv), by [`crosscheck.ts`](crosscheck.ts)):

| Reading | Agrees with the reader on the skeleton |
| --- | --- |
| the rule written over the parser's facts (`ParserWorkspace`), on each whole corpus | 221 of 221 |
| the same rule, on the parser's record of the skeleton | 221 of 221 |
| the reader, on each whole corpus's own text | 220 of 221 |

The one row where they part is #60, below. The parser records came from `powershell-ast.ps1` run over each corpus: 198, 42, 39 and 1,797 PowerShell files, the counts of November 19.

## Each difference, with its cause

**The six true wires the reader does not draw.** In each, the name is defined in two files, and the caller's text loads neither. So the rule draws nothing: it never chooses between two copies the text does not load. On November 19 this was measured as "what R does not see" ([the probe](../../../2026-11-19/Probes/powershell-wires/README.md#the-false-wires-and-their-cause)). The judges are right in each case, and the reader is working as designed. These are not faults of the reader, mends of it, or errors of the judges. They are where the rule stops.

| Row | Call | Copies of the name | Why the text does not decide |
| --- | --- | --- | --- |
| #50 | `Actions/Github-Helper.psm1:677` `OutputWarning` | `Actions/.Modules/DebugLogHelper.psm1`, `Actions/Troubleshooting/Troubleshooting.ps1` | The module loads neither. `AL-Go-Helper.ps1` imports it and `DebugLogHelper.psm1` side by side. |
| #53, #55 | `Actions/ProcessALCodeAnalysisLogs/ProcessALCodeAnalysisLogs.ps1:14` `OutputError`, `:132` `OutputWarning` | the same two | The script loads nothing that defines them. How the action is run decides. |
| #71 | `Actions/Troubleshooting/Troubleshoot.Secrets.ps1:50` `OutputWarning` | the same two | It loads neither. `Troubleshooting.ps1`, which defines its own copy at line 14, dot-sources it at line 48. |
| #105, #107 | `.github/runners/tests/fleet-controller.Tests.ps1:1043` `Get-FleetState`, `:143` `Get-RunnerDemand` | `.github/runners/controller/Modules/FleetCore/FleetCore.psm1`, `.github/runners/reconcile-runner-fleet.ps1` | The test imports `FleetCore` through `$script:ControllerRoot`, a path the text does not fix. |

**What pwsh settled.** I asked pwsh 7.7.0 on this Linux about the shapes behind #50 and #71, with files of my own written in those shapes. They are kept in [`pwsh-probe/`](pwsh-probe/); each function prints which file it is in.
- **#71's shape.** `Troubleshooting.ps1` dot-sources the helper, which imports the logging module. It then defines its own `OutputWarning` and dot-sources `Troubleshoot.Secrets.ps1`, which calls `OutputWarning`. Run with `pwsh -File`, it printed "OutputWarning of Actions/Troubleshooting/Troubleshooting.ps1": the caller reaches the copy of the script that dot-sources it, as the judges said.
- **#50's shape.** `Action.ps1` dot-sources the helper, which imports `Github-Helper.psm1` and `DebugLogHelper.psm1`. `Action.ps1` then calls `Github-Helper`'s function, which calls `OutputWarning`. It printed "OutputWarning of Actions/.Modules/DebugLogHelper.psm1", as the judges said.
- **A third run found a reason #50 is close.** `Troubleshooting-Module.ps1` does what `Troubleshooting.ps1` does: it dot-sources the helper and defines its own copy. It then calls the same module function, which printed that script's own copy. So a module's call reaches a function the running script defines.
  - #50's true verdict therefore rests on the judges' other claim: the function holding line 677, `GetLatestRelease`, never runs under `Troubleshooting.ps1`.
  - By the parser's record, nothing in `Troubleshooting.ps1`, `Troubleshoot.Secrets.ps1` or `AL-Go-TestRepoHelper.ps1` calls `GetLatestRelease` by name. A call through some other function was not traced.
  - The verdict stands. It is the nearest of the 222 to arguable.

All six rows have one thing in common. What the judges used is who loads the calling file: who dot-sources it, or who imports it alongside the other module. The rule reads only what the calling file itself loads. This is a fork for the root, below.

**The four arguable wires.** The judges said arguable, so the test pins what the reader draws today rather than scoring it.
- **#11 and #13 are drawn.** `Actions/AL-Go-TestRepoHelper.ps1` calls `OutputError` and `OutputWarning`. It dot-sources `AL-Go-Helper.ps1` (`. (Join-Path …)`), which imports `DebugLogHelper.psm1`. So the reader reaches that copy by what the file loads.
- **#12 and #14 are not drawn.** These are the wires to `Troubleshooting.ps1`'s copies, which the helper does not load.
- **What changed since November 19.** That day's rule R drew none of the four: the `Join-Path` load was not yet read, so the helper loaded neither copy. The November 21 grader already counted these two as drawn. So this is the reader improving on the rule as judged, on a row the judges left open. The judges named the competing run (`Troubleshooting.ps1` dot-sources the helper after defining its own copies), so the drawn wire is right for `WorkflowInitialize.ps1`'s run and not for `Troubleshooting.ps1`'s.

**The unscorable row.** #215 is the cold run's shop: 22 files made by hand in a scratch folder on November 19 and never committed. It is kept in the extract's rows and named in the test as never scorable.

**The reader's one miss on the corpora's own text, which the skeleton cannot show.** #60, AL-Go `Actions/ReviewAgent/scripts/CommentPublishing.ps1:470` calling `Test-GlobMatch` in `FindingPlacement.ps1`, is true.
- The reader draws it on the skeleton.
- It does not draw it on AL-Go's own text: `Invoke-CopilotPRReview.psm1` loads both files in a loop over a written-out list at line 696, and the grammar still reads that file with an error. This is the known miss of November 19 and 21.
- It is the reader's fault, the grammar's. It is not the rule's.
- The skeleton writes the loop's three dot-sources plainly, so the test cannot see it. It is named here and in the test's header, not in the register.

## Seen red before green

- **Two verdicts flipped in the extract** (#2 to true, #4 to false). The row check failed against `samples.md`. The drawing check failed with "#2 true, not drawn" and "#4 false, drawn" beyond the register.
- **One load dropped**: `PortalUserDataUtilities.psm1` importing `AzureStack.Identity.Common.psm1`. The drawing check failed with "#95 true, not drawn" and "#98 true, not drawn". With the load gone, three copies of each name are left and none is loaded. This shows that the rule's "loaded" step bears weight in the test.
- **Restored, green.** The reader's unique-definition step was not switched off: that would have meant editing `packages/engine`, which another builder holds.

## Checks

| Check | Result |
| --- | --- |
| `npm run lint` | passed |
| `npm run build` | passed |
| `npx tsc --noEmit -p tests/tsconfig.json` | passed |
| `npx vitest run --project integration` | 39 files, 504 tests, all passed, the repository's own entries among them |
| `npx vitest run scripts/oracle` and the reader's own tests | 10 files, 114 tests, all passed |
| the three SlopCop audits | no broken link, asset reference or symbol |
| `npm run -s docs:links:enforce` | all documentation links satisfied |
| `npm run live-docs:generate` | the seven new docs; every other doc unchanged |

## Forks

**Decided here:**
- The skeleton form, written at test time from a committed extract. Reasons above.
- Loads written plainly, not as the corpora write them. Keeping their text would keep their code.
- Arguable rows pinned, not scored.
- The shop's row kept and named, not dropped.
- The extract's maker committed under `scripts/oracle/` with its usage, so the extract can be written again from the corpora.

**For the root:**
1. **Reading who loads a file.** In all six differences, the hand used who loads the caller: who dot-sources a script, and which modules a module's importer imports beside it. A rule that, where the caller's own loading reaches no copy, looked at its loaders would draw #71. It might draw #50, depending on the order the importer loads in. It would not draw #53 and #55, whose script is loaded by no file of the repository, or #105 and #107. pwsh above shows the mechanism, and also shows it is order- and run-dependent: a module's call reaches the running script's own copy. Whether to measure such a rule is the root's choice. Nothing was built.
2. **#50's verdict.** It rests on `GetLatestRelease` never running under `Troubleshooting.ps1`. Should it be read again as arguable? I left the judges' verdict as it is.
