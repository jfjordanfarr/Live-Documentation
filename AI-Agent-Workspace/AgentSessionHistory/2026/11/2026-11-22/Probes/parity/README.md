# Parity, and the first scored runs of an agent given only the command line

Historical, a probe of 2026-11-22, by a builder for the root. The table it produced is current, at [parity.mdmd.md](../../../../../../../.mdmd/layer-2/parity.mdmd.md).

## Why

The owner, 2026-11-21: the page's primary user is a person, the command line's an agent, "Both need everything we give", and the command line has a third audience, "_CICD pipelines_". Their older words: an agent with the repository open has "no need" of a command line (2026-10-03), so the command line earns its place by what reading files does not give cheaply. Every blind run of November was on the page. This is the first scored run of agents with no page.

## What was run, and when

All on 2026-11-22 between about 01:20 and 02:10 UTC, at `64ab0ed54` and its successor `9397fdd83`, with the worktree's code and the main checkout's installed packages.

- **The table's rows.** Each "yes" row of the table was run on a copy of the estate sample made by `make-cli-folder.mjs --source estate --arm cli`, or on this repository's own docs, through the wrapper below. The runs, in the order the table reads: `inspect --reachable`; `inspect --groups`; `inspect --from Contracts/IPaymentService.cs --reachable --direction inbound` (with and without `--max-depth 1`); `inspect --from Hub/ServiceRouting.cs --json` (its `documents`); `board board.md`; `inspect --from Portal/Pages/Default.aspx --to Database/SqlServer/dbo.Payment.sql` and the same inbound; `inspect --from Hub/PaymentHub.cs#PaymentHub --to Contracts/IPaymentService.cs#IPaymentService`; `inspect --from Hub/PaymentHub.cs --to Hub/ServiceRouting.cs --verbose` (no symbols named); and, on a two-commit git repository made from the estate copy, `inspect --at`, `--between`, `--at --reachable`, `--at --from --to` and `--words`. The gaps were seen as refusals: `--to PaymentService` and `--from PaymentService` answer `Unable to resolve`; `--from dbo.Payment.sql --to Default.aspx` answers "No dependency path found … Closest reachable frontier" and offers no reverse. Most used and the unreferenced symbols are computed in the page only (`packages/explorer/src/client/panels/sources-facts.ts`, `mostUsed`, `symbolsUnreferenced`); no command under `scripts/live-docs/` names either, nor authors. `live-docs:orphans` over the estate copy: `Live documentation layer not found: …/estate-cli/.mdmd/layer-4`, exit 1.
- **The pipeline table.** Two estate copies generated side by side and compared with `diff -r`: 37 files differ, every one only in `Generated At` or `generatedAt` (`diff -r -I` on those leaves none); a third generation over existing docs changes no byte. `generate --check` after a comment was added: 0 (the comment changes no doc), after a method was added: 1, "Live Docs differ from source: … 1 updated"; `--dry-run` 0 in both. `lint` twice over the same docs: the warnings come in another order (the `Portal/Portal.csproj.md` line moves); a line appended after the generated region: exit 1, "line 39: text after the last generated section". `inspect --reachable --json`, `--groups --json`, an inbound reach and `board` twice: the same bytes. An unknown file, an unknown option, a missing board and a board of one bad line: exit 1, each in one line. `history` on the two-commit repository: written, then resumed, then from nothing, the same `history.json` bytes, exit 0. `visualize` twice: no file differs. Every command ran with its input from `/dev/null`; under `strace -f -e trace=connect` none opened an `AF_INET` socket, and each exited 0 again inside `unshare -rn`, a namespace with no network.

## The instrument's command-line arm

Added beside the page's, leaving it as it is (`AI-Agent-Workspace/scripts/playtest/`):

- **`live-docs`**, the wrapper. The tool has no command of its own: each command is an npm script of this checkout. The wrapper is the smallest thing that offers them as one command on a stranger's path. Its own `--help` lists the commands and says each has its own `--help`; nothing else of ours. `orphans` is left off, since it reads only this repository's layout. That the wrapper had to be written is a gap in the table.
- **`make-cli-folder.mjs`** makes a tester's folder: the estate sample without its `expected/` oracle records, or every tracked file of this repository without the agents' guidance and records (`AI-Agent-Workspace/`, `AGENTS.md`, `CLAUDE.md`, `.agents/`, `.claude/`, `.github/copilot-instructions.md`) and without `.mdmd/` but the board its configuration names. For the command-line arm the tool then generates the folder's Live Docs.
- **`cli-playtest.mjs`** runs one tester in a fresh copy of that folder under the system's temporary folder: `claude -p`, the shell as its only tool, no MCP server, no settings, skills or slash commands, no saved session, an environment of only `HOME`, `PATH`, `LANG` and `TERM`, and for the command-line arm the wrapper on `PATH`. It writes `run.json` (outcome, turns, commands, tokens, cost, wall time), `commands.txt`, `transcript.jsonl` (what was said and run and what came back, never reasoning) and `answer.md`.

The keys, [cli-tasks.json](cli-tasks.json), were committed as `9397fdd83` before any run. Five are the page testers' tasks reworded for a folder; three are new, each of the kind the command line should be best at: is a class dead code (keyed by reading the estate's files), what a file reaches and what a change to a file touches (keyed by [import-oracle.mjs](import-oracle.mjs), TypeScript's own module resolution over the tracked files, which agreed with `inspect` file for file on both).

**Decided by the builder, each the root's to reverse:**
- The command-line arm's folder holds its Live Docs already generated, as a repository that uses the tool holds them; the tester is not asked to generate. A cold arm, where it must find `generate` first, is untried.
- Its system prompt says one sentence more than the other arm's: "The command `live-docs` is installed." Without it the two arms would be the same.
- Sonnet 5.5 at its default effort, one tester per task and arm, then a second for the four tasks where the tool was queried or the arms might differ; 24 runs, the milestone's limit.
- The shell can read outside its folder; nothing stops it. No run named the checkout: no command, transcript or answer holds `/workspaces`. One files-only tester wrote a helper script to `/tmp/tools` (`repo-reach-files`).

## The runs

Scored by the key's own rule: right, partly or wrong. Commands are the shell commands a tester ran (a tester often chains several in one); "queried" counts the runs that asked `live-docs` anything but `--help`.

| Task | Files only: answers | Commands (median) | Command line: answers | Commands (median) | Queried |
| --- | --- | --- | --- | --- | --- |
| estate-uses | right, right | 2.5 | right, right | 4 | 2 of 2 |
| estate-directory | right | 2 | right | 2 | 0 of 1 |
| estate-trace | right, right | 2 | right, partly | 4 | 0 of 2 |
| estate-dead | right | 1 | right | 3 | 0 of 1 |
| repo-uses | right | 2 | right | 3 | 0 of 1 |
| repo-directory | right | 3 | right | 4 | 0 of 1 |
| repo-reach | right, right | 4 | right, right | 3 | 2 of 2 |
| repo-touch | partly, partly | 3 | right, right | 4 | 2 of 2 |
| **All** | **10 right, 2 partly** | **2** | **11 right, 1 partly** | **4** | **6 of 12** |

Wall time, median: 11.2 s files only, 13.9 s command line. Tokens read and written, median: 14,986 and 16,110. Cost of all 24: $0.69.

**Actions and routes.** Every command-line tester ran `live-docs --help` first; most then ran `inspect --help`. Half then answered by `grep` and `cat` alone, as the files-only testers did. The six that queried the tool each asked one command, `inspect --from <file> --reachable` with `--direction inbound` where the question was of users, and in each it was the command their answer rests on. On the estate, small enough to read whole in one `cat`, the tool changed nothing but cost two commands of help. On the two questions of transitive reach in the repository, it was the whole answer in three commands: both command-line testers of repo-touch listed all eleven files, where both files-only testers stopped at the direct importers and one step beyond (nine of eleven, then six); for repo-reach the files-only testers reached all sixteen too, one by writing a 25-line Python import walker.

## Stumbles

Counted from what the agents did and got wrong.

- **estate-trace-cli-2, partly.** It ran `live-docs --help; ls`, then `cat README.md board.md | head -80; live-docs inspect --help; live-docs visualize --help`, and answered from the README's diagram, naming neither `Hub/ServiceRouting.cs`, `Gateway/Wcf/HubProxy.cs` nor `PaymentService/Data/PaymentsContext.cs` ("I did not open every file along the way"). The tool printed only its help. **The tool had the fact and the agent did not find the command**: nothing in the help says that a path between two files is how a flow is traced. But had it asked, **the output would have misled**: the shortest path from `Portal/Pages/Default.aspx` to `Database/SqlServer/dbo.Payment.sql` runs through `Gateway/GatewaySettings.cs` and `Gateway/Web.config` to `Hub/App.config`, and from `PaymentService/PaymentService.cs` straight to `Data/Payment.cs`, skipping the hub's code, its routing, the data context and the stored procedure. A shortest dependency path is not the order a call takes, as the root found on 2026-10-27.
- **repo-touch-files and repo-touch-files-2, partly** (the baseline's). Both grepped for importers of `markdown.ts`; the first went one step further by hand and stopped at nine of eleven, the second said "I did not trace indirect dependents". The command line's arm answered both in one query.

No command-line answer was wrong, and none rested on a fact the tool lacked. What the runs did not test: a question the page answers and the command line cannot (a folder's connections, the most used files, the unreferenced symbols), which the table lists and these tasks did not ask; a repository too large to `grep`; a cold folder without docs.

## Commands the harness refused

Two, each run again split or as a script file: a `cd` into the main checkout followed by git, refused as leaving the worktree; and a probe that defined a shell function, refused as too complex to verify.

## Files

- [cli-tasks.json](cli-tasks.json), the keys; [import-oracle.mjs](import-oracle.mjs), the independent key of two of them.
- `runs/<task>-<arm>[-2]/`: each run's `run.json`, `commands.txt`, `transcript.jsonl`, `answer.md` and `stderr.log`.
