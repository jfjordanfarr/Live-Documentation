# Change over Time

## Metadata

- Layer: 3
- Audience: Contributors

_Current as of 2026-10-17. This document is the plan of the Explorer's rendering of change over time, the owner's pick of 2026-10-16 ([Turn 2 of the October 16 session](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-2)), written in the form of [the World Map's plan](world-map.mdmd.md) after [the probe of the same day](../../AI-Agent-Workspace/Probes/2026-10-16/change-over-time/README.md) and [its survey](../../AI-Agent-Workspace/Research/2026-10-16-change-over-time.md), and it becomes the design as its questions close. A question is closed only when [direction.md](../../AI-Agent-Workspace/Memory/direction.md) records the owner's word on it._

## Authored

### Purpose

What the rendering of change over time is for and how it is designed: a scanned repository's history, read from its own `.git`, regenerated under one lens and played in the 3D Local Map's declared-structure layout, so that a person watches the shape of a system grow, shrink and recombine commit by commit, as the owner put it, "the 3D galaxy of the workspace growing and shrinking and recombining over time". Its first subject is this repository, which the owner wants to see "through its own lens": "Live Documentation, as it gets better and better, will be capable of producing a more and more accurate timeline reconstruction of its past." The picture it steps is [the structure layout of 2026-10-14](architectural-decisions.mdmd.md#the-3d-local-map-has-two-layouts-analyzed-connections-and-declared-structure-recorded-2026-10-14); the probe that showed the shape holds is under `AI-Agent-Workspace/Probes/2026-10-16/change-over-time/`.

### Destination

A design that has survived the scenarios below, on paper and in the probe, written here so that the build can begin one gated commit at a time. Done when this repository's own history, from its first commit on 2025-10-16 to today, plays in the served Explorer's structure layout with the unchanged spheres holding still, the three package renames of September 2026 reading as a hub's name changing in place, a scrubber along the bottom that a person drags, steps by key and plays, a panel saying what each step changed, a link that shares a moment, and the same facts answered by the CLI in text and JSON; and when a stranger's repository, cloned and never documented before, gets the same from one command. The owner's three expectations of 2026-10-16 are the measures: "improving continuity in 3D, speed of re-renders, limitations on what a browser application can do in terms of memory", the last on an 8 GB machine.

### How this document works

- **The standard.** Every idea is walked, on paper, through the scenarios below before any code, and at each scenario through the seven places it can touch: the sequence's format, the history command, the cache, the bundle, the Explorer, the CLI, and the tests with their oracles. An idea survives only if some adjustment of those seven holds every scenario without breaking a standing rule. An idea that cannot is written under Failed ideas, with why.
- **The questions are tickets.** Each has a type (talk, probe, lab or build), what blocks it, the scenarios it must survive, and its resolution. The frontier is the open tickets nothing blocks. A chat takes one, closes it, writes one line under Decisions so far, and adds what the answer made sharp enough to ask.
- **The fog.** What can be seen coming but not yet phrased sharply stays under Not yet specified until a resolution sharpens it. What lies beyond the destination is under Out of scope and does not come back into this plan.
- **Building.** The owner chose the order on 2026-10-16: the probe first with the scenarios on paper, "then the design doc in layer 3 as the World Map's is, and the build in gated commits" ("Sounds good"). The probe is done; this is the design doc; the build goes ticket by ticket, each walked through the scenarios before its code, each landing after the full gate with pictures and a recording for the owner's eye.

### The scenarios

The fourteen the probe walked on paper ([the probe record](../../AI-Agent-Workspace/Probes/2026-10-16/change-over-time/README.md#the-scenarios-walked-on-paper)), with what the probe checked and what this plan carries. Sources are the chat record; the owner's own words are in [direction.md](../../AI-Agent-Workspace/Memory/direction.md#next).

1. **September 26 to 28 here.** Sixty-one commits in three days: the rebuild, three package renames (7, 198 and 200 paths by git's inference), the sample move (195 paths), hundreds of files dying in place, a run of births at one hub. Checked by the probe: under the gentle setting the renames read as a hub's name changing in place; under today's update path the picture is rebuilt at every rename.
2. **One file's life.** A file born under one package, renamed into another, growing symbols, its wires coming and going, pinned across the whole history. Checked: the pinned sphere holds its place through its move, its wires change, its hub is re-keyed too.
3. **A directory renamed whole.** Derived from git's per-file renames by a rule (nothing left under the old path; every surviving file at the same relative place under the new one), written into the delta so that the CLI can say "renamed whole" as the picture shows it. Checked against the three September renames read by hand; two merges into an existing directory found that cannot be re-keyed and are deaths.
4. **A repository with ten thousand commits.** Deltas of a few kilobytes against a 439 KB snapshot; keyframes every few hundred steps so that a seek is a keyframe plus at most that many deltas; one process per commit in a pool sized to the machine; a cache keyed by commit and lens so that a second run computes only the new commits. Carried by this plan; the probe measured this repository's numbers.
5. **A repository without a committed mirror.** The ordinary case under one lens: every commit is checked out and regenerated with today's rules and the lens's configuration; a repository with no configuration gets the defaults, suffix-anywhere since 2026-10-15. Checked: the probe applied today's configuration to every one of this repository's commits.
6. **The 8 GB machine.** The page holds one snapshot's objects and the sequence as deltas (this repository's whole history 273 KB; the renderer's heap 18 MB at the end of 121 steps); the generator's pool is two processes under 8 GB. Measured by the probe on the dev box; the 8 GB machine is still to be looked at.
7. **The single file.** A `file://` page cannot fetch its siblings, so the traded file of the World Map plan's T6 inlines the sequence or says what it left out. Carried; the single file is not built.
8. **A shallow clone.** The oldest commit is a graft; its "first step" would show every file born at once. The sequence says where its knowledge begins, the scrubber's left edge is marked truncated, and the first snapshot is drawn as the beginning of what is known. Carried.
9. **A link to a moment.** The address gains the commit; opening it seeks and draws that snapshot; a pin that does not exist at that commit is said so in the tray, never dropped silently. Carried; the probe's page put the step in its address.
10. **The pinned-salient step** (the owner's). With a pin set, the steps whose delta touches a pinned file, a file under a pinned directory, or an edge of one are marked, and the step key moves salient to salient. Checked: 7 of the 90 steps the pinned file existed in were salient by the graph, where git saw its content change in 10; "salient" is a definition to choose (C3).
11. **Where the computation happens, and when the timeline appears** (the owner's). The Explorer is a static page and cannot read a repository's history; the generator computes, the bundle carries, the Explorer finds and says so when nothing has been computed. Carried; the fact is set against the owner's image in C7.
12. **The wiggle** (the owner's). Today's full reheat moves every unchanged sphere a mean of 75 units a step; the gentle setting with hubs held, 3.7, in 50 ticks; pure placement never relaxes. Measured by the probe over 121 steps; the levers and the hubs' release are C5.
13. **The lens, named.** A sequence says which generator and configuration made it; the cache is keyed by both; a new lens recomputes. Carried as a rule.
14. **Time and sequence.** History is a graph; the first-parent mainline is the sequence and a merge is one step whose delta is the whole merge. This repository's history is linear; merges are carried.

Two more, from the destination:

15. **A stranger's repository, cold.** TH04 or any clone: one command computes the history under the shipped defaults, in minutes or hours as the repository's size and age dictate, resumable; the served bundle then plays it. Nothing of this repository's layout may be assumed, as the cold run of 2026-10-15 taught.
16. **The estate at work, one system of it.** A TFS monorepo's history lives on a server and is out of scope; but one git-backed system of the estate, cloned, plays like any other. The World Map's board of several things over time is not this feature.

### The standing rules

Markdown is canonical and the graph is derived from it; the sequence is derived from the graphs of each commit and from git, carried as data beside the bundle, never as a line in a Live Doc and never committed, by the owner's rule of 2025-11-10 that nothing from local git history enters the committed docs, since two clones' histories differ, and their allowance of 2025-11-11 for views nothing permanent depends on. One lens: every commit is regenerated by one generator under one configuration, so a change of the tool never looks like a change of the code. Headless and UI are peers: what the scrubber shows, the CLI answers in text and JSON. Nothing reaches the internet; git is read through the `git` executable on the local clone, never a remote, never with credentials. Orientation is kept across every step: the thing under the eye stays put while the picture changes around it, and a death is shown as a death rather than invented into a slide. A scan is never hidden: what the generator read at a commit is what the step shows. Size is exposed surface at every scale, as the structure layout says; a sphere breathes with its symbols and a hub with its members'. The oracle for births, deaths and renames is git itself, and nothing grades itself.

### Decisions so far

One line each; the owner's words are in direction.md's entries of 2026-10-16.

- The place is the 3D Local Map, the trajectory "just a 3D version of" Gource, and not the World Map, which is for connectivity between systems and deployment shapes (2026-10-08).
- The feature is the next big thing, in the declared-structure layout "going snapshot by snapshot to show us the history of this repo" (2026-10-16).
- A design conversation starts with what this workspace has already said; Gource is the reference for git history visualization (2026-10-16).
- One lens: one generator over every snapshot, never the committed mirror of the day, "The point is that Live Documentation, as it gets better and better, will be capable of producing a more and more accurate timeline reconstruction of its past" (2026-10-16).
- A step is a commit, cheap as a delta, with the owner's question whether what is pinned could define a more useful step (C3) (2026-10-16).
- Renames by git's inference: "Trust what git says"; a file below the similarity threshold is a death and a birth, shown as such (2026-10-16).
- The structure layout's hubs are the skeleton: a file is born at its hub, dies in place, slides on a rename; hub volumes breathe; no re-layout per step; "we will have to toy around with how to keep things from wiggling around too much too quickly" (2026-10-16).
- The running simulation is fed, never restarted: a born file placed at its hub before the update, a step a small reheat (2026-10-16).
- The headless twin and git as the oracle, "No big opinion from me on this" (2026-10-16).
- The order: the probe first with the scenarios on paper, then this document, then the build in gated commits (2026-10-16).
- Standing as recommended on 2026-10-16 and not mentioned by the owner: the sequence lives as a base and deltas beside the bundle and inline in the single file, never in the Live Docs and never in localStorage; the address carries the commit; out of scope for now are TFS, the 2D Local Map, the World Map's two-snapshot board and the flyover.
- Work is shown through hyperlinks that work; a probe's disposable page is exempt (2026-10-16).
- From the probe (2026-10-16), three things it settles for this design: the renderer must reach the simulation, since the library offers no gentle reheat; held hubs are too still and need a release between steps; a hub's identity must be its path across time, and a merge into an existing directory is a death the picture must show as such.

### The shape, as this plan reads it

Written so that the tickets below have one picture to argue with; each part is decided only where Decisions so far says so.

**The sequence.** One file, `history.json`, derived by the history command and read by the Explorer and the CLI. Its head names the lens (the generator's version, and its commit when it runs from a checkout of this repository; the configuration it applied), the repository (its root, the branch and head the sequence follows, whether the clone is shallow and where its knowledge begins), and the paths, interned once. Its body is the first snapshot in full and then one step per commit: the commit, its date and subject (its author under C8), the files born (with archetype and symbol count), dead, renamed (from git's inference) and resized (symbol count changed), the directory renames derived by the rule of scenario 3, the directed file-to-file edges added, removed and changed in count, the files git saw change in content without a change of shape (for C3), and, every two hundred and fifty-six steps, a keyframe that repeats the snapshot whole so that a seek never replays from the start. Edges are directed and counted, file to file, without their symbols or kinds: the sequence is the shape of the graph over time, and the docs at each commit remain the truth of everything else. This repository's 121 sampled steps were 273 KB as JSON and 58 KB gzipped; ten thousand steps at the median delta would be about 6.5 MB before keyframes.

**The cache and the command.** `npm run live-docs:history` reads the mainline with `git rev-list --first-parent --reverse`, and for every commit not yet in the cache under the current lens checks it out into a detached worktree, generates the docs there with the lens's configuration into a temporary docs root, reads the derived index, writes a compact summary of the commit into `<root>/history/<lens>/<commit>.json` (files with archetype, symbol count and whether they are an entry; directed edges with counts) and removes the worktree, with a pool of processes sized to the machine (three on the dev box, two under 8 GB) so that no one process holds more than one index. It then diffs consecutive summaries, asks git for the renames between them, derives the directory renames and writes `history.json` beside them. The cache lives where `index.json` lives, under the docs root and gitignored, and a second run computes only the commits the cache lacks; `--keep-index` keeps each commit's full `index.json` gzipped for a reader who wants `inspect` at full fidelity. This repository's 122 sampled commits took 27 minutes of generator time, ten of wall clock at three at a time; the whole mainline would take under an hour at that rate on the dev box.

**The bundle and the Explorer.** The static builder carries `history.json` beside `explorer-data.json` when the cache holds one for the bundle's lens, and the client fetches it when the history control is opened, so that a page without history is no slower. In the 3D Local Map the control opens a scrubber along the bottom: one tick per step, the pinned-salient steps marked, the date and the commit's subject spoken as the value, the slider grammar on the keys (arrows, Home, End, Page Up and Down), play and pause at a rate of steps per second. Beside the picture a step panel says what the step changed, the subject, the hash, the date, and the files and edges that came and went, each file a link that pins it where it still exists today and says "gone since" where it does not. A step materializes the snapshot and feeds the simulation gently: renamed files and hubs keep their objects under new ids, a born file is placed at its hub plus the containment spring's rest length in a seeded direction, the hubs that stood before the step are held through it and released when the engine stops, and the forces see a fraction of alpha so that the engine settles in about fifty ticks; the probe's B setting, built from the library's public API since it offers no gentle reheat. The address carries the commit; a link to a moment opens on it. Leaving 3D for 2D or for another view returns the picture to today, since the 2D map and the World Map draw today's docs.

**The CLI.** `inspect --at <commit>` answers the file-level questions the sequence can answer at that commit (whether a file exists, what it is wired to, what a path reaches), `inspect --between <a> <b>` lists what was born, died, was renamed and what edges came and went, in text and JSON, and `live-docs:history --json` prints the sequence's head and its steps; the same facts the scrubber and the step panel show, from the same file.

**The tests and the oracles.** An integration test builds a small git repository from a script of commits (files added, a directory renamed whole, a file renamed below and above the threshold, a file deleted, a symbol added), runs the history command over it and holds the sequence to what `git diff --name-status -M` says about every step and to the regenerated index at every commit, as the probe's builder verified all 122 of its snapshots; this repository's September renames, read by hand on 2026-10-16, are committed as an expectation the sequence is compared against; a Playwright spec steps the served bundle and reads the rendered spheres and lines through Three's development-tool event, as `force-graph-observation.ts` already does, holding a renamed file to its object and a born file to its hub's neighbourhood, and the layout lab gains the probe's instrument, settle in ticks, displacement of the unchanged and heap per step, as a report and never as a threshold.

### Open questions

Each ticket: the question; its type; what blocks it; the scenarios it must survive; its resolution, empty until closed. The recommendations are the agent's, for the owner to answer by exception.

**The frontier**

- **C1. The sequence's format and the history command.** Build, from the shape above; the probe's sequence builder and its verification are the prototype. Scenarios 1 to 6, 8, 13, 14, 15. Open inside it: whether the summary carries each file's entry mark so that `inspect --at` can walk from the entries of that commit (recommended: yes, one boolean per file); whether the first step of a sequence that begins at a repository's first commit draws every file born at once or opens on the first snapshot without motion (recommended: the latter, with the births of step one visible in the panel).
- **C2. The gentle update and the renderer's reach into the simulation.** Build, in `forceGraphLayout.ts` and `forceGraphView.ts`; the probe's B setting is the prototype. Scenarios 1, 2, 12. The library's `graphData` reheats to full alpha on every call and exposes no alpha target, so the gentle reheat is a wrapper that scales the link and charge forces by a fraction of alpha with `d3AlphaMin` set so the engine stops in about fifty ticks, and the library's centring force is dropped while hubs are held. A fork for the owner's eye: whether every membership change (a pin, a filter, a directory opened, the layout switched) takes the gentle update too, so that a type toggle no longer stirs the whole picture, or only a history step does. Recommended: every membership change, one update path, the hundred-tick warm-up kept for the first picture alone; the probe's numbers (75 units to 3.7) say what the eye will see, and the pictures decide.
- **C3. The salient step** (the owner's question). Talk, then build with C4. Scenarios 2, 10. The graph's changes to a pinned file (born, dead, renamed, resized, an edge of it added or removed) are what the map can show; git's content-only changes to it are the file's own business, three of the ten in the probe. Recommended: both marked, the graph's as the ticks the step key moves between, git's as fainter ticks beneath them, so that the whole life of a pinned file is on the scrubber and the map never claims a change it cannot show; for a pinned directory, any file under it; with nothing pinned, every step is a tick.
- **C4. The scrubber, the step panel and the address.** Build, after C1 and C2. Scenarios 9, 10, 14. The control's place is a question for the consolidation pass the owner expects, so it goes beside the Connections and Structure buttons for now, as those went beside 3D. Open inside it: the play rate's default and whether quiet stretches are skipped in play (recommended: one step per second, every step played, since every step is one delta and a quiet stretch has no steps); how a step is laid on the scrubber, evenly by index or by time with gaps (recommended: evenly by index, so that every step is one key press and one pixel band, with a ruler of months beneath it so that the six-month gap of 2026 reads as a gap, and a by-time layout as a later lever if the owner's eye wants it); what the panel shows for a file that no longer exists today (recommended: its name, its archetype and its symbol count at the step, and "gone since <commit>", since the docs of that day are not in the bundle).
- **C5. The wiggle's levers and the hubs' release.** Lab, then the owner's eye. Scenario 12. The probe's finding that held hubs never re-balance: a tree that never moves reads as growth only while it is small. Recommended: hubs held through a step and released at the engine's stop into a second gentle relaxation of the hubs alone, measured as the probe measured (settle, displacement of the unchanged), with the alpha fraction, the hold and the release as advanced levers under Tuning beside the force graph's, so that the owner can "toy around with how to keep things from wiggling around too much too quickly" by hand.
- **C6. Hub identity across time.** Build with C1. Scenarios 1, 3. Today a collapsed chain of hubs is named by the whole chain and identified by its deepest member, so a directory that gains or loses its only child changes a hub's id, a death and a birth for a hub that did not move. Recommended: a hub's identity is its directory path at every step and the chain is only its name; a hub that appears because a chain uncollapsed starts at its former partner's position, not at a centroid, so that nothing erupts; a merge of a directory into one that already exists is a death, shown as such.
- **C7. Where the computation runs, and when the timeline appears** (the owner's question). Talk. Scenarios 11, 15. The fact: the static Explorer cannot read `.git`, so the generator computes, the bundle carries, and the Explorer shows the control when the bundle holds a sequence and otherwise one line in Knowledge Sources naming the command to copy, as the entry points' field already offers its configuration line. The owner's image of history machinery that "gets to work" once a view is created needs a host that can run a process: the editor panel the decisions log expects to return ([Explorer Panel in the Editor](architectural-decisions.mdmd.md#explorer-panel-in-the-editor-recorded-2026-09-27)), which does not exist today, or a person at the command line. The fork that is live now is this repository's own site: the Pages workflow builds the bundle on every push with no cache, so the history is either computed in that workflow with the cache kept between runs (the first run about an hour, each later run the new commits only), or computed locally and committed as a file (against the rule that nothing derived from local history is committed), or left to local builds while the hosted site plays no history. Recommended: the first, the cache keyed by the lens and restored by the workflow, so that the hosted panopticon shows its own history and the rule holds.
- **C8. Authors.** Talk. Scenarios 15, 16. Git records an author on every commit and Gource draws them as avatars; a bundle travels, and the owner's estate at work has colleagues' names in its history. Recommended: the sequence carries the author's name as git records it and the step panel shows it, with `--no-authors` on the history command to leave it out of a bundle that will be shared; no avatars, no activity drawn by person.
- **C9. The headless twin and the oracles.** Build with C1. Scenarios 2, 3, 15. `inspect --at` and `--between` as above; the scripted-repository integration test; the September renames as a committed expectation; the probe's replay-and-compare as a test over the fixture. Open inside it: whether `inspect --at` without `--keep-index` says plainly that it answers from the shape alone (recommended: yes, in its first line).
- **C10. The instrument.** Build after C2, small. Scenario 12. The probe's driver, measuring settle in ticks, the displacement of unchanged spheres and the heap per step, kept beside the layout lab as `layout:lab history`, printing a report and never asserting a threshold; the owner agreed on 2026-10-16 to performance statistics "so long as it doesn't pile on a bunch of new tech debt".

**Blocked**

- **C11. Keyframes, ten thousand commits and the single file's window.** Blocked by C1 and by the World Map plan's T6, the traded file. Scenarios 4, 7. The keyframe cadence is set in C1; what the single file inlines when a history outgrows a size the build sets (the whole sequence, or the latest window with a line saying the rest needs the served bundle) waits for the file to exist.
- **C12. A step in the connections layout.** Blocked by C2 and C4. Scenario 12. The hubs are the skeleton the owner chose; in the connections layout every edge change moves everything. The scrubber is built for 3D as a whole, since both layouts share the renderer and the sequence, measured in the structure layout first, and the connections layout's motion is for the owner's eye before anything is promised of it.

### Not yet specified

- The name on the control: timeline, history or trajectory; the owner's words are "the rendering of change over time", "scrub through time on a timeline" and "the trajectory of a system" (2026-10-08 and 16). Loose until it has earned itself.
- Whether a branch or tag other than the current head can be the sequence's mainline; the first build follows the head's first parents.
- The 8 GB machine and a machine with a GPU: the probe's motion was filmed on a software renderer on a paused clock, so the frame rate on the owner's machines is still to be seen.
- What the Knowledge Sources panel says of a bundle's history: its lens, its range of commits, its count of steps, and the command to copy when there is none.
- Pins and the tray at a past step: "not yet born" and "gone" as the tray's words; whether a pin made at a past step on a file that still exists today is an ordinary pin (recommended: yes).
- The estate graph over time, several scans in one sequence: the World Map's question, not this one, held here until a scenario asks.
- The sequence of a repository whose configuration changes its docs root or its excludes along the way: the lens's configuration is applied to every commit, so the question is only which configuration the lens takes (recommended: the one at the head, named in the lens).
- Whether a step's panel links the commit to a hosting forge: no network and no assumption of one; the hash is text a person can copy.

### Out of scope

- TFS, whose history lives on a server and not in the folder; remote git traversal; credentials of any kind (2025-11-08; 2026-10-16).
- The 2D Local Map at a past commit, which would need the docs of that day; the World Map's two-snapshot board; the animated flyover of a system in action (2026-10-16).
- Avatars, contributor animation and anything drawn by person (C8 decides only whether a name is carried).
- A user study; vulnerability or churn numbers written into docs (2025-11-10).
- The estate of several things over time, until a scenario asks (the fog above).

### Failed ideas

Ideas the record shows withdrawn or failed, with why; new entries join as the scenarios fail them.

- Churn and other git-derived numbers committed into the docs (2025-11-08): two clones' histories differ, so the docs would not be reproducible; retired 2025-11-10, local history allowed for ephemeral views 2025-11-11.
- Reading the committed mirror as the sequence: the mirror at a commit carries the generator of that day, so a sequence read from it mixes the tool's growth with the code's; and under today's grammar the mirror parses only from 2026-09-27 on (2026-10-16).
- Dropping renames as Gource and Repo Visualizer do: a renamed directory empties and refills, and 198 files fly across the picture; git's inference finds this repository's renames whole (2026-10-16).
- Seeking by replaying from the start (Repo Visualizer) or by rebuilding from a log offset (Gource): a sequence of deltas with keyframes seeks either way without replay (2026-10-16).
- Full snapshots as JSON: about 250 MB for this repository's history, the shape to avoid on an 8 GB machine; deltas with interned ids are a few megabytes (2026-10-16).
- localStorage as the sequence's home: 5 MiB and synchronous (2026-10-16).
- Restarting the simulation at every step, today's update path: unchanged spheres move a mean of 75 units and the picture is rebuilt at every rename (the probe, 2026-10-16).
- Holding hubs forever: the tree never re-balances and growth reads only while the picture is small (the probe, 2026-10-16).
- Parsing `.git` by hand: a `.git` is a file in a worktree or a submodule and a pack is deltas; the `git` executable knows every shape and is on every machine that has a history to show (2026-10-16).

## System References

### Components

The modules the build touches, as they stand today; the history command and the sequence's reader do not exist yet and are named only in prose above.

- [packages/explorer/src/client/views/forceGraphView.ts](../layer-4/packages/explorer/src/client/views/forceGraphView.ts.mdmd.md)
- [packages/explorer/src/client/views/forceGraphLayout.ts](../layer-4/packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md)
- [packages/explorer/src/client/views/forceGraphData.ts](../layer-4/packages/explorer/src/client/views/forceGraphData.ts.mdmd.md)
- [packages/explorer/src/client/persistence/compressed-url-state.ts](../layer-4/packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md)
- [packages/explorer/src/shared/staticBuilder.ts](../layer-4/packages/explorer/src/shared/staticBuilder.ts.mdmd.md)
- [packages/explorer/src/shared/staticExplorerData.ts](../layer-4/packages/explorer/src/shared/staticExplorerData.ts.mdmd.md)
- [packages/engine/src/live-docs/graph.ts](../layer-4/packages/engine/src/live-docs/graph.ts.mdmd.md)
- [packages/engine/src/live-docs/gitUtils.ts](../layer-4/packages/engine/src/live-docs/gitUtils.ts.mdmd.md)
- [packages/engine/src/live-docs/pathfind.ts](../layer-4/packages/engine/src/live-docs/pathfind.ts.mdmd.md)
- [scripts/live-docs/inspect.ts](../layer-4/scripts/live-docs/inspect.ts.mdmd.md)
- [scripts/layout-lab/spatial.ts](../layer-4/scripts/layout-lab/spatial.ts.mdmd.md)

### Related

- [Live Documentation Explorer](live-documentation-explorer.mdmd.md)
- [World Map](world-map.mdmd.md)
- [Architectural Decisions](architectural-decisions.mdmd.md)
- [The vision](../layer-1/vision.mdmd.md)
- [The survey of 2026-10-16](../../AI-Agent-Workspace/Research/2026-10-16-change-over-time.md)
- [The probe of 2026-10-16](../../AI-Agent-Workspace/Probes/2026-10-16/change-over-time/README.md)

## Evidence

- [The probe record](../../AI-Agent-Workspace/Probes/2026-10-16/change-over-time/README.md): 122 of this repository's commits regenerated under one lens, three continuity settings measured over 121 steps, fourteen pictures and a recording.
- [tests/e2e/force-graph-observation.ts](../layer-4/tests/e2e/force-graph-observation.ts.mdmd.md): the instrument that reads the rendered spheres and lines, which the history spec will use.
- The tests named under C1, C9 and C10 do not exist yet; they are listed here as the evidence the build owes.
