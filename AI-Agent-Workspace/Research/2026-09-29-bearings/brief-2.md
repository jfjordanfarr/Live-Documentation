# The second brief of 2026-09-29

_Given to the four explorers of the second run, and by them to every reader they launched. The first run's [brief](brief.md) stands; this one adds what the first run learned, what the stopped explorers left behind, and the questions left for their slices. It is kept as it was given; it decides nothing._

You are exploring the history of a software repository for its owner. Work in /workspaces/Live-Documentation.

## Why, and what changed since the first brief

Read [the first brief](brief.md) whole: its purpose, its reading list, its rules and the shape of the report still hold. Then read [what the first run established](what-is-known.md) whole. Three slices finished and four stopped at the model's usage limit before writing anything; you are one of the four.

The owner's instruction for this run, 2026-09-29: "Learn what you can first. Then, relaunch with questions pertaining to what remains, informed by what you've learned." So you have questions this time. They are where to start, not a fence: the owner's standing wish is "Explore and find good questions", and a better question than the ones below is a better find than an answer to them.

Do not find again what the first run found. Where your slice bears on a finding or a question in `what-is-known.md`, add the evidence your slice holds and say whether it agrees, and move on.

## Two lessons from the stop

- **Write your report early and grow it.** Create your report file within your first few steps, with the sections of the first brief as headings, and add to it as you learn. Four explorers of the first run held everything in their heads and lost all of it when they stopped. A report that is half written when a limit arrives is worth something; one that is not written is worth nothing.
- **Share the pool.** Four explorers run at once. The October and "what survives" explorers may keep at most three readers running at a time, launching another when one returns; the November and December explorers work alone, because their slices are mostly read already. The first run launched seven explorers at once and three of them could launch no readers at all. Hand each reader whole transcripts, what you have learned so far, both briefs and the rules, and ask for the owner's words verbatim with line numbers.

## What the stopped explorers left

They left more than a report would have shown. Under [readers/](readers/) are three readers' reports, the working notes of the November and December explorers, which cover nearly every day of their months with line numbers, and what the "what survives" explorer had measured. The notes are unverified: check every quotation you use against its transcript with `grep -F` before it goes in a report, and treat a line the notes mark CHECK, VERIFY or GET FULL as open.

## Rules, in addition to the first brief's

- You may run `npm run live-docs:inspect` and `npm run live-docs:lint`, which read the docs and the graph. Nothing that builds, generates or writes.
- The first brief's note on speakers was incomplete: the owner's turns begin `jfjordanfarr: ` up to 2025-12-10 and `User: ` from 2025-12-11 through the rest of the Copilot era; the agent's begin `GitHub Copilot: `. A line in an owner's turn that begins with `>` is the owner quoting the agent back.

## The slices

### What survives today

Report file: `what-survives.md`. The owner said on 2026-09-29 that "much baby remains in files not-yet-decommissioned, still to be separated from the bathwater". This slice answers that claim, file group by file group.

Start from [what your predecessor measured](readers/what-survives-measurement.md): every tracked file against the last commit before the owner's return, with its status, its lines and the commit that added it. The full table is `/tmp/claude-1000/-workspaces-Live-Documentation/938ec442-01ad-44ad-bd62-ac7e87a8139d/scratchpad/survey2.tsv`; its columns are described in that file.

These survivors are already named by the finished reports; take them as known and spend your time elsewhere: the `unpkg.com` script tag, emoji in four client files, the Rosetta manifest's dead paths, the C# sample bent for a regex, stale words in `packages/engine/src/languages/syntax.ts`, the C# adapter's own blocklist, default globs that are this repository's layout, `requireRelativeLinks` and `slugDialect` read by nothing, seven archetype names no doc carries, `.live-documentation/**` in `slopcop.config.json`, requirement IDs in authored docs, the `/open` call in the client, the 206 chat links and the 100 "Dev Day" notes in layer 4, the switched-off arcs in the Membrane Map, and the stale sections of `.mdmd/layer-3/membrane-map.mdmd.md`.

1. **What does nothing a user runs reach today?** On 2026-09-26 an audit found about two fifths of the non-test lines reachable from nothing a user runs; September then deleted a great deal. Take the entry points (the scripts in `package.json`, the Explorer client's entry) and measure what is unreachable now, by file, with `live-docs:inspect` or the graph index at `.mdmd/index.json`. Say how you measured, so the owner can trust it.
2. **For each group of survivors, why was it written, and what in it lives nowhere else?** The groups: the older Explorer views (`circuitView`, `localView`, `forceGraphView.ts`), the client's panels, `detailPanel.ts`, `pathfind.ts` and search; the hand-written adapters and the docstring bridges; `packages/engine/src/languages/`; `scripts/live-docs/find-orphans.ts`, `run-all.ts` and `visualize-sample.ts`; the November fixture workspaces under `tests/integration/fixtures/`; the March Playwright specs; `.mdmd/layer-2/`; the README; the configuration. `git log --diff-filter=A` gives the day, and that day's transcript gives the reason; the November and December notes already give many of them.
3. **What grammar does the Local Map's code implement?** Write it out as a list a person could check against a picture: what a card shows, the order of dimming, what a hover and a pin each do, the sizes, spacings and curve settings fixed in the code, the corset, the gradient, the Internals row. Cite the file and line of each item. The December explorer writes the owner's half of the same list, the rule as they set it and the day; the owner made the Local Map the teacher of the next work, and the two halves together are what "at least matched in quality" will be measured against.
4. **What in `AI-Agent-Workspace/Notes/` is true and lives nowhere else?** The first run found invented quotations in the censuses, so check every quotation you rely on against the transcripts.
5. **What is in `AI-Agent-Workspace/tmp/`?** It is ignored by git and holds work the owner steered by. An inventory: each file or folder, what it is, when and from which session it came, and whether a tracked file already holds its substance. What to keep is the owner's call; the inventory is what lets them make it.

### December 2025

Report file: `2025-12.md`. Work alone. [Your predecessor's notes](readers/2025-12-working-notes.md) cover every December day, and two readers' reports cover [2025-12-16](readers/2025-12-16-turning-point.md) and [2025-12-18.1 and 18.2](readers/2025-12-18-multi-hop.md). Your work is to verify, to close what the notes left open, and to write the report; open a transcript where the notes leave a question, not to read it again.

1. **The Local Map's rules as the owner set them.** A list, in order of the day, each rule in the owner's words with its line: inputs left and outputs right (2025-12-03), the gradient from blue to green, pins above wires above cards, the curve settings tuned by hand, fading the unrelated and by how much, what a click pins and what frees it, the Internals row, the corset. Say for each whether the owner confirmed it after seeing it built. The "what survives" explorer writes the code's half of the same list.
2. **How does the owner read a design?** `owner.md` says through exact ASCII diagrams, and dates it to 2025-12-05. The notes find that on that day the owner asked for sliders and checkboxes to tune by hand, and on 2025-12-06 praised a layout "laying that out in text". What does the record support?
3. **Three views or two?** On 2025-12-03 the owner called the Circuit Board, the Local Map and the force graph "complementary and all necessary. All distinct"; on 2025-11-21 they had asked for "a total of two"; September is folding them. What is the through-line?
4. **Was 2025-12-11 the first trimming of ground truth?** The notes find recall rising from 85.4% to 98.8% when the C# expectation went from 295 edges to 255. What did the owner know, and what did they say?
5. **What of September was already in December?** On 2025-12-19 the owner named watching a workspace commit by commit and combining several workspaces into one understanding; on 2025-12-08 a configuration archetype for `Web.config`; on 2025-12-14 the day job's PCI-DSS bar and a proof of no network access. Find the rest, and say which of them September's documents credit.

### November 2025

Report file: `2025-11.md`. Work alone. [Your predecessor's notes](readers/2025-11-working-notes.md) cover every November day and the Antigravity sessions, and reconstruct 2025-11-15; [a reader's report](readers/2025-11-08-first-half.md) covers the first half of 2025-11-08. Your work is to verify, to close what the notes left open, and to write the report.

1. **The law of direction was reversed once.** The notes find the owner on 2025-11-24 putting what depends on the focused file to its left and what it depends on to its right, and on 2025-12-03 "Uh, yes. Switch these." Confirm both, and say what the reversal rested on. It is the one law the Explorer keeps at every scale inside a system.
2. **Does today's git rule name the cause of 2025-11-15?** The notes find that the owner approved the command after asking about it, that the context had just been compacted, that a day's work sat uncommitted behind a failing gate, and that the owner's own wording of the rule was conditional where `AGENTS.md` is absolute. Confirm, and set the owner's diagnosis beside today's rule.
3. **The owner's first statement of how an agent should work.** A block the owner wrote on 2025-11-15, near line 1195, with ownership of every file, no workarounds, doing it "the right way", autonomy explained by the price of a prompt, reproducibility and falsifiability. Verbatim, and which of its values `AGENTS.md` no longer carries.
4. **The layers in the owner's words.** On 2025-11-10 the gradient from most authored at the top to most generated at the base; on 2025-11-11 system docs as "materialized views" and "a house of cards". `direction.md`'s trail of the convention has neither. Verbatim, with what they would change in it.
5. **The birth of the Local Map and the Circuit Board.** From the Antigravity sessions of 2025-11-19 and 11-20 to 2025-11-24: the owner's words that became rules, and the ones that did not survive.
6. **Who the tool was for.** On 2025-11-17: "Tell me why **you**, Github Copilot, **would** use such a tool... You are the primary consumer of this tool." September says humans are the audience. What happened between?

### October 2025

Report file: `2025-10.md`. Nothing survives of the first run's October; this is a full exploration, with up to three readers at a time. Fifteen transcripts, the first month; three of them, 2025-10-24, 10-26 and 10-30, are near half a megabyte each.

1. **What was the project at its founding, and what did the owner want of it that no later month mentions?** It began as link-aware diagnostics in the editor, a way to find drift between docs and code.
2. **Where were the rules first spoken, and with what reasons?** The November and December notes already trace several of `AGENTS.md`'s rules to their days; find which of them October holds first, with the reason given then. The reasons are what today's documents dropped.
3. **Why "membrane"?** The four-layer convention was first called Membrane Design MarkDown (2025-10-19). Does the Membrane Map's name descend from it, and what did the owner mean by a membrane then?
4. **Does the founding idea deserve to come back?** Drift between prose and code, beside the owner's September wish that prose not rot between links (the prose reference report in `ideas.md`). On 2025-10-25 the owner wondered whether requiring every heading to be linked would force docs to shrink.
5. **Who was the tool for in October, and what would success have looked like to the owner then?**
