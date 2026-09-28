# Where the project is going, in the owner's words

_Current as of 2026-09-27. [The vision](../../.mdmd/layer-1/vision.mdmd.md) is the agreed statement of intent and the Status section of [AGENTS.md](../../AGENTS.md) says where the code stands. This file records what the owner decided at each fork, with the date, so that nobody re-litigates it and nobody imports older certainty from the chat archive. Add to it when they decide something new._

## The September 2026 reframe

Said on 2026-09-26, the day they returned, unless dated otherwise:

- **Humans are the audience.** Agents got good enough at exploring knock-on effects that the Live Docs corpus is "not terribly useful for them. By now it feels to me more like tooling to actually, as a human, understand one's own programs."
- **Except in this repository** (2026-09-27): "a great visualization should cause you to see your own work propagating through it. Our project should be, and has always been envisioned to be, a capable panopticon of itself." So an agent working here dogfoods: run `live-docs:inspect` before and after a risky edit, and look at its own changes in the Explorer.
- **The picture they want.** "I want to see the wires cross. I want to see things which talk to each other cluster together more closely." The force-directed graph "has been by far the most useful visualization, but its utility tends to cap out once we want to get down to the symbol level of detail." Farther out: a canvas where a whole piece of software is a shape, a cube, whose guts are visible inside, with data flowing in, through and out to the next shape, and each system's dependencies drawn "as like dangling vines off the cube's underside, or a cruft of barnacles". They says plainly that they are still waffling on the optimal visualization; the many Explorer views exist because of that.
- **Scale.** Their Breath of the Wild analogy: the game is "logarithms of scale". The closest view is one class "with all of its public symbols displayed, and upstream/downstream consumers flanking it, wires crossing over into them"; the farthest is unknown until tried. "I suggest we lead with understanding a single piece of software and grow from there."
- **Markdown stays canonical.** "I really and truly believe that the _simplest_ correct form of a program is the _most_ correct form of a program." One multipurpose representation, not a document shape and a separate render shape. The derived index is an index over that database and is never committed; they agreed at once: "So would you make the 'index' gitignored by default...? Yep! Hot diggity!" To the strict grammar and round-trip test: "Ohhhh my goodness yes please."
- **Deletion.** "Deletion is a joy. The less code we have, the less code we have to maintain." The list they approved on 2026-09-27 is in the [decisions log](../../.mdmd/layer-3/architectural-decisions.mdmd.md).
- **The design is not specified** (2026-09-27, on seeing Membrane Map open questions written as a backlog): "What I've been describing today would be a different kind of visualization, potentially 3D, which would enable one to intuit things inside and outside a software system just by looking at it... We have summits we have climbed. But they are likey not the highest summit." Shareable URLs and the like are nice-to-haves; the aim is "to maximize many 'nice-to-haves' simultaneously _and elegantly_." Do not write open questions that presume the current design. "Uncertainty here should feel healthy."
- **The use case they keep returning to.** Map a local directory to a node on a canvas, plop down another node pointed at another directory, and show colleagues how the consumer payment portal talks to its API, to the WCF router on-prem over a tunnel, to the WCF service, to the databases. Then export that canvas state "to something just as interactable".
- **A stretch goal they name and defer** (2026-09-27): an animated "flyover" timeline that highlights a system's components in action, shareable. Not in the vision.

## Answers at forks

All on 2026-09-27.

| Fork                                      | Their answer                                                                                                                                                                     |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What counts as an oracle                  | Compiler resolution: "Something done to prove the system we ship is working but not something our shipped system itself does."                                                   |
| What the shipped adapters use             | tree-sitter: "Is tree-sitter the ultimate destination? If so, tree-sitter likely, no?"                                                                                           |
| System layer and co-activation clustering | "Agreed. Delete. Git history has it if we ever need it."                                                                                                                         |
| A 3D probe                                | "Happy to wait until the index exists."                                                                                                                                          |
| Where declared edges live                 | "Seek parsimony and simplicity and elegance, and where that fails, don't hesitate to stop and ask."                                                                              |
| How the editor panel refreshes            | "Re-measure, but I remember it being heavy. Re-render only from changed is good."                                                                                                |
| Git shape                                 | "a single main branch is what we'll use. We will begin splitting into feature branches when there becomes risk of endangering the main branch or end users (i.e. post-release)." |
| Review checkpoints during the engine work | Declined: "I trust your judgment."                                                                                                                                               |
| The chat archive                          | "keep until modernization effort complete", then delete it, because its use as training data wanes and it sends "loud and false signals" into workspace search.                  |
| Package renames                           | `packages/server` became `packages/generator`. `packages/shared` and `packages/scripts` wait for the index step, which decides where things live: "Wise. Thank you. Agreed."     |
| Node version                              | Stay on 22; one jump to 26 after it becomes LTS on 2026-10-28.                                                                                                                   |
| Agent material of any vendor              | Plain markdown that any vendor's agent reads, because they plan repository-event-driven agent workflows and improvement loops (below).                                           |

The improvement loop they have in mind (2026-09-27): generate Live Documentation for a well-known open-source repository, note every place the system failed, raise an issue for each, and have an agent take the issue and raise a pull request. "once the repo is in a more stable state (perhaps a month from now, perhaps further out)."

## Theses they have flagged for later

- **Common sense in, common sense out.** "I am using a common sense engine (LLMs) to solve a common sense problem (software architecture understanding)." They hope that once semantic intent is codified, "the same rough shape must always result from it. (Not just because it is idiomatic or sensible but because it is correct)." They call this self-healing and says the old chats show them reaching for it. "A heady topic for later perhaps."
- **Measuring correctness may be circular.** "My best tools for discovering the shape of a program are the tools I would use to evaluate my success in evaluating the shape of a program. This is totally unsolved in my opinion." (2026-09-26) Compiler resolution is the current answer, and they asked that the vision not sound "unnecessarily reactionary" about self-grading once the cleanup is done.
- **Prose rots between links.** Links are checked; the words between them are not. They loved the problem: "I wonder if we could use Live Documentation or VSCode to try to locate these putative symbol/file references and enforce them in markdown." See [ideas.md](ideas.md).

## How the September 2026 work unfolded

Two Claude Code sessions. The owner's prompts from both are archived verbatim: [2026-09-26.1.md](../ChatHistory/2026/09/2026-09-26.1.md) and [2026-09-27.1.md](../ChatHistory/2026/09/2026-09-27.1.md).

**Session 1**, 2026-09-26 19:20 to 2026-09-27 08:58 UTC, on Opus 5.5 until 22:19 and Fable 5.1 after. An audit of the repository ("what's the baby and what's the bathwater"), the reframe above, and `AGENTS.md` with a new vision, both approved. Commits: `29d58b50` AGENTS.md and the vision; `219391c0` the chat archive kept out of the Explorer bundle; `53ffb839` stale planning documents retired, guides rewritten, the decisions log; `d454d847` LF line endings; `ca655066` the Electron harness replaced by Vitest and the AST benchmark retired; `0de42d28` the inference path, fixture oracles, system layer and self-grading tools retired; `986fe8e2` the extension shell and language server removed. A map of the next work, drawn as a page after a compaction, produced the fork answers above.

**Session 2**, from 2026-09-27 09:00 UTC, on Fable 5.1. Commits: `cad63bdd` `packages/server` renamed to `packages/generator`; `4c965539` the compiler oracle and the `csharp/estate` program; `605ff092` tree-sitter C#; `aec5f74b` sample programs moved to `tests/integration/programs`; `94a661d8` lint covers the tests again; `a84c5af7` the oracle for every language with an indexer; `9af2e61a` Python, `7ad489c2` Java, `4a1e6210` Go and `467d4754` Rust on tree-sitter, each measured against the compiler; `4a4698cd` this folder and the prompt archive; `a2d8cd1a` the test-evidence sections and their manifest retired (a second copy of edges the Dependencies section holds, filled from a file that was never committed); `e766010c` imports of dotted file names resolved; `b0a811c3` the PowerShell adapter ships its own parser script; `3a89aed9` the grammar: one module renders and parses every doc, proven by a round trip over the whole corpus, which also retired twenty-four hand-written docs the inspect suite had been reading; `13f66380` the `Live Doc ID` line and the provenance comment dropped from every doc.

## Next, in the agreed order

1. The derived graph index that every consumer reads: the parsed model of every doc plus what the graph derives from it, written on demand and never committed. The `packages/shared` and `packages/scripts` renames are decided with it. The grammar step is done (2026-09-27); what an edge carries is recorded in the decisions log under "The Live Doc Grammar".
2. Then the 3D probe is allowed, and the vision's steps 3 to 5: one file-scale and one folder-scale view, `reachable`, the canvas.
