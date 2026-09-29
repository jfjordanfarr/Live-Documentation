# The second brief of 2026-09-29

_Given to the four explorers of the second run, and by them to every reader they launched. The first run's [brief](brief.md) stands; this one adds what the first run learned and the questions it left for the slices that stopped. It is kept as it was given; it decides nothing._

You are exploring the history of a software repository for its owner. Work in /workspaces/Live-Documentation.

## Why, and what changed since the first brief

Read [the first brief](brief.md) whole: its purpose, its reading list, its rules and the shape of the report still hold. Then read [what the first run established](what-is-known.md) whole. Three slices finished and four stopped at the model's usage limit before writing anything; you are one of the four.

The owner's instruction for this run, 2026-09-29: "Learn what you can first. Then, relaunch with questions pertaining to what remains, informed by what you've learned." So you have questions this time. They are where to start, not a fence: the owner's standing wish is "Explore and find good questions", and a better question than the ones below is a better find than an answer to them.

Do not find again what the first run found. Where your slice bears on a finding or a question in `what-is-known.md`, add the evidence your slice holds and say whether it agrees, and move on.

## Two lessons from the stop

- **Write your report early and grow it.** Create your report file within your first few steps, with the sections of the first brief as headings, and add to it as each reader returns. Four explorers of the first run held everything in their heads and lost all of it when they stopped. A report that is half written when a limit arrives is worth something; one that is not written is worth nothing.
- **Keep at most four readers running at once.** One other explorer shares the pool with you. The first run launched seven explorers at once and three of them could launch no readers at all. Launch a reader when one returns. Hand each reader whole transcripts, what you have learned so far, the two briefs and the rules, and ask for the owner's words verbatim with line numbers.

## Rules, in addition to the first brief's

- You may run `npm run live-docs:inspect` and `npm run live-docs:lint`, which read the docs and the graph. Nothing that builds, generates or writes.
- The three readers' reports under [readers/](readers/) are the first run's; build on them.

## The slices

### What survives today

Report file: `what-survives.md`. The owner said on 2026-09-29 that "much baby remains in files not-yet-decommissioned, still to be separated from the bathwater". This slice answers that claim, file group by file group.

These survivors are already named by the finished reports; take them as known and spend your time elsewhere: the `unpkg.com` script tag, emoji in four client files, the Rosetta manifest's dead paths, the C# sample bent for a regex, stale words in `packages/engine/src/languages/syntax.ts`, the C# adapter's own blocklist, default globs that are this repository's layout, `requireRelativeLinks` and `slugDialect` read by nothing, seven archetype names no doc carries, `.live-documentation/**` in `slopcop.config.json`, requirement IDs in authored docs, the `/open` call in the client, the 206 chat links and the 100 "Dev Day" notes in layer 4, the switched-off arcs in the Membrane Map, and the stale sections of `.mdmd/layer-3/membrane-map.mdmd.md`.

1. **What does nothing a user runs reach today?** On 2026-09-26 an audit found about two fifths of the non-test lines reachable from nothing a user runs; September then deleted a great deal. Take the entry points (the scripts in `package.json`, the Explorer client's entry) and measure what is unreachable now, by file, with `live-docs:inspect` or the graph index at `.mdmd/index.json`. Say how you measured, so the owner can trust it.
2. **For each group of survivors, why was it written, and what in it lives nowhere else?** The groups: the older Explorer views (`circuitView`, `localView`, `forceGraphView.ts`), the client's panels, `detailPanel.ts`, `pathfind.ts` and search; the engine's modules untouched since before 2026-09-26; `scripts/live-docs/find-orphans.ts`, `run-all.ts` and `visualize-sample.ts`; the March Playwright specs; `.mdmd/layer-2/`; the README; the configuration. `git log --diff-filter=A` gives the day, and that day's transcript gives the reason.
3. **What grammar does the Local Map's code implement?** Write it out as a list a person could check against a picture: what a card shows, the order of dimming, what a hover and a pin each do, sizes and spacing that are set in the code, the corset. The owner made the Local Map the teacher of the next work, and this list is what "at least matched in quality" will be measured against. Cite the file and line of each item.
4. **What in `AI-Agent-Workspace/Notes/` is true and lives nowhere else?** The first run found invented quotations in the censuses, so check every quotation you rely on against the transcripts with `grep -F`.
5. **What is in `AI-Agent-Workspace/tmp/`?** It is ignored by git and holds work the owner steered by. An inventory: each file or folder, what it is, when and from which session it came, and whether a tracked file already holds its substance. What to keep is the owner's call; the inventory is what lets them make it.

### December 2025

Report file: `2025-12.md`. Thirty-four transcripts. Two days are read already: [2025-12-16](readers/2025-12-16-turning-point.md) and [2025-12-18.1 and 18.2](readers/2025-12-18-multi-hop.md); start from them and do not read those three files again.

1. **What is the French Corset?** The owner in September: "MAN! Oh man did you not even know about the "French Corset" part of these visualizations?" When was it born, what problem did it solve, what are its rules in the owner's words, and where does it live today, in code and in any doc?
2. **What did the owner correct into the Local Map in December?** Sizes, spacing, colour, pins, dimming, what a card shows, how wires are drawn. Their words, with the day and line, as the other half of the grammar that the "what survives" explorer reads out of the code.
3. **How does the owner read a design?** On 2025-12-05 they said they are borderline aphantasic and read designs through exact diagrams. Which forms of showing a design worked for them in December and which did not, with an example of each they approved.
4. **How did the multi-hop attempt end?** 2025-12-18.3 to 18.5: what landed in commit `a0cc5de2`, what the context-window deaths were, and what the owner concluded about screenshots, context and working with an agent on an interface.
5. **Where did the benchmark's thresholds come from in December, and did the owner know what they were?**

### November 2025

Report file: `2025-11.md`. Twenty-two transcripts. The first half of 2025-11-08 is [read already](readers/2025-11-08-first-half.md).

1. **When and how was the Local Map born, and what did the owner correct into it?** It is the teacher of the next work. The same for the Circuit Board, which September is folding away.
2. **What happened on 2025-11-15?** `owner.md` gives it as the reason for the git rules in `AGENTS.md`. What was lost, how, and what the owner concluded. A reader found `git reset --hard` and a force-push a week earlier at the owner's own request; is today's rule the right size for what happened?
3. **What did the owner ask on 2025-11-21 for "a total of two visualization views", and what became of it?**
4. **What was the system layer for?** Born around 2025-11-19 as clustering by co-activation, retired in September as "a system is a folder". What did the owner want from it that a folder does not give?
5. **What did the owner want the mirror of docs to be?** The move to `.mdmd/layer-4/` on 2025-11-16, and the wish of 2025-11-08 that the mirror serve as a wiki at the day job.

### October 2025

Report file: `2025-10.md`. Fifteen transcripts, the first month. Three of them, 2025-10-24, 10-26 and 10-30, are near half a megabyte each.

1. **What was the project at its founding, and what did the owner want of it that no later month mentions?** It began as link-aware diagnostics in the editor, a way to find drift between docs and code.
2. **Where were the rules first spoken, and with what reasons?** The rules of `AGENTS.md` are, by the first run's reading, what the owner taught later; find which of them October already holds, with the reason given then. The reasons are what today's documents dropped.
3. **Why "membrane"?** The four-layer convention was first called Membrane Design MarkDown (2025-10-19). Does the Membrane Map's name descend from it, and what did the owner mean by a membrane then?
4. **Does the founding idea deserve to come back?** Drift between prose and code, beside the owner's September wish that prose not rot between links (the prose reference report in `ideas.md`).
5. **Who was the tool for in October, and what would success have looked like to the owner then?**
