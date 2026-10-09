# World Map

## Metadata

- Layer: 3
- Audience: Contributors

_Current as of 2026-10-09. This document is the plan of the World Map's design, agreed with the owner that day ([Turn 12 of the October 8 session](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-08.1.record.md#turn-12)), and it becomes the design as its questions close. A question is closed only when [direction.md](../../AI-Agent-Workspace/Memory/direction.md) records the owner's word on it._

## Authored

### Purpose

What the World Map is for and how it is designed: the outside of everything, where systems are things on a board wired by their doors, and where a person understands the connectivity between systems and their deployment shapes. Its grammar is in [Boards](boards.mdmd.md); its picture is in [the vision](../layer-1/vision.mdmd.md); the probes that settled the picture are under `AI-Agent-Workspace/Probes/2026-09-28/`.

### Destination

A design of the World Map that has survived the scenarios below, on paper and in probes, written here so that the build can begin one chat at a time. The connected whole first, then the zoom inside, as the September 28 probes drew it and as the owner put it on October 9: a distributed system connected together, "until it turns out that you can zoom in and actually see inside them". Every piece named with its seam. Each decision with the scenario that tested it. Each failed idea with why. Done when the estate at work can be drawn so that a non-software colleague gets the answer to each of the seven questions under scenario 1 by pointing.

Accepted by the owner on 2026-10-09: "The design is just about ready to build." and "otherwise, yes, we are agreed on the markdown doc." The one thing they were not sure about is how a person moves between the maps; it is ticket T8 below.

### How this document works

- **The standard.** Every idea is walked, on paper, through the scenarios below before any code, and at each scenario through the seven places it can touch: the doc grammar, the board grammar, the join, the bundle, the Explorer, the CLI, and the tests with their oracles. An idea survives only if some adjustment of those seven holds every scenario without breaking a standing rule. An idea that cannot is written under Failed ideas, with why.
- **The questions are tickets.** Each has a type (talk, probe, or research), what blocks it, the scenarios it must survive, and its resolution. The frontier is the open tickets nothing blocks. A chat takes one, closes it, writes one line under Decisions so far, and adds what the answer made sharp enough to ask.
- **The fog.** What can be seen coming but not yet phrased sharply stays under Not yet specified until a resolution sharpens it. What lies beyond the destination is under Out of scope and does not come back into this plan.
- **Building.** The owner judged the design ready to build on 2026-10-09 and chose a fresh chat for it. The build goes ticket by ticket: each is walked through the scenarios before its code, and the transition between the maps is the one the owner named as unsettled.

### The scenarios

Sources are the chat record; the full index is [the mined scenarios](../../AI-Agent-Workspace/Research/2026-10-09-owner-scenarios-mined.md).

1. **The estate at work.** Portal (WebForms with Web API 2) to Gateway to WCF Hub to WCF PaymentService to SQL Server to Oracle, several repositories in one TFS monorepo, Oracle and the linked server never scannable (2026-09-26). The seven questions a person answers by pointing: where a page's JS value comes from, back to Web.config (2025-11-17; 2025-12-16); where a WCF contract is mapped into the shared PaymentSubmission model, a NuGet package consumed a hop away in the gateway (2025-12-16); which stored-procedure parameter supplies a value (2025-12-16); a deployed web.config that points at a different system than the file (2026-09-27); every place card data is in transit or in memory, for the security team (2026-02-24); how exposed the distributed system is (2026-09-29); a thing that is a folder of PowerShell scripts referencing each other (2025-11-20).
2. **This repository.** Its delivery shape undecided (2026-10-08); its estate as "the repo and the static site address and the workflow to deploy it" (2026-10-02); the tool as a panopticon of itself (2026-09-30); chats as provenance (2026-09-26).
3. **Two directories, no board.** A node pointed at a directory, then another (2026-09-26; 2026-09-27; 2026-10-07); whether one folder's contents talk to another's (2026-03-17); several workspaces combined (2025-12-19).
4. **Nested and sibling projects.** Two C# solutions in sister directories of one TFS monorepo as separate things, inside and outside relative, git subtrees perhaps a third level (2026-09-30); submodules as a tradeoff (2026-10-03); a board as a thing on another board, a stretch (2026-09-27).
5. **An imagined system.** Kubernetes slots with no program guts yet; kinds with a shape and a label; true by fiat (2026-09-27); the World Map for authoring, the inside for interpreting (2026-09-30).
6. **Shared out.** A board handed over detached from its sources, and a readable link to a hosted site that lands on a view or a multi-hop path (2026-09-26; 2026-09-27; 2026-10-03; 2025-12-16); a link whose files no longer exist (2026-03-31); the director's whole-enterprise view, "potentially not plausible" (2026-09-26). Trimming before sharing is out of scope until it is a problem (2026-10-09).
7. **Sent back changed.** A colleague takes the owner's version, changes it and sends it back (2026-09-30). Forces merging.
8. **CI/CD and infrastructure files as a source.** Infrastructure-as-code inference and key-value tags (2026-09-27); the deploy workflow (2026-10-02); an ARM or Bicep resource, with "Internet calls are things I really do want to do without" (2026-09-27); managed-identity permissions down a chain; OpenAPI specs in a folder (2026-09-27); an Aspire app host (2026-10-09).
9. **An SBOM in a thing's folder.** Tendril, hair or cytoskeleton-like projections off a thing (2026-10-09); noticing the file is the first iteration; a vulnerable library known from the file's vulnerability data is the stretch; the stage that matters is wiring systems together (2026-09-27).
10. **The blank file.** One node asking for a directory (2026-10-03); a single HTML file that reproduces itself (2026-09-27); where the generated markdown goes; the colleague's 3K uncommitted files (2026-10-03); a person who wants only the UI (2026-02-24).
11. **No authored content anywhere.** A user base that writes no Purpose or Notes (2026-02-24); the estate sample's bundle today.
12. **Opened on a phone.** Any screen size (2026-09-29); hover has no touch equivalent (2026-03-23).
13. **An agent reads the board.** A hosted site's link, or the HTML attached in M365 Copilot, served by export with no doors (2026-10-03); headless versions of everything (2025-12-19).

### The standing rules

Markdown is canonical and the graph is derived from it. Headless and UI are peers: what a person can do by clicking they can do by a command. A scan is never hidden; a declaration is drawn beside it. Orientation is kept across every move. Nothing reaches the internet, no CDN and no fetch, and tests prove it.

### Decisions so far

One line each; the detail is in direction.md and the decisions log.

- The picture: things on a board, doors, wires door to door, the inside reached by zooming (the board's verdict, 2026-09-28).
- The board text: two nouns, kinds through a legend, layout as positions only (2026-09-28).
- Doors, wires and their bases; manifests as what a thing stands on (2026-09-28).
- Blue offers and green uses, at every scale (2026-09-29).
- The World Map is for connectivity between systems and deployment shapes; the trajectory over time is the Force Graph's (2026-10-08).
- Trimming before sharing waits until it is a problem (2026-10-09).
- This document is the plan and becomes the design; its destination is the paragraph above (2026-10-09).
- SBOMs are read from files that exist on disk, never generated by a bundled tool or enriched over the network: "it is simpler just to be software that knows how to interpret many files that _exist on disk already_. I do prefer no network calls strongly." (2026-10-09).

### Open questions

Each ticket: the question; its type; what blocks it; the scenarios it must survive; its resolution, empty until closed.

**The frontier**

- **T1. What is a thing when two directories are opened and no board exists?** Talk, then a probe. Blocks T8 and T9. Scenarios 3, 4, 11.
- **T2. This repository's board as its delivery shape, drawn with imagined things.** Probe. Scenarios 2, 5. The delivery decision and this picture are one question (2026-10-08).
- **T3. Where declared facts live, and who writes positions.** Talk; the research is done (the 2026-09-28 survey of declared facts). Blocks T6 and T11. Scenarios 5, 6, 10.
- **T4. Which CI/CD and infrastructure files are a source, and what each gives.** Research first (the system-scale survey's section 6 is the start), then talk. Scenario 8.
- **T5. What a closed region shows on its boundary.** Talk; the research is done (the 2026-09-28 survey of groups). Scenario 4.

**Blocked**

- **T6. The traded file and the readable link.** Blocked by T3. Scenarios 6, 10, 12.
- **T7. Merging a board sent back changed.** Blocked by T6. Scenario 7.
- **T8. How a person moves between the Local Map and the World Map.** Talk, then a probe. Blocked by T1. Every scenario. The owner's doubt of 2026-10-09 is whether zooming should be the switch at all, after the Local Map's automatic switch to the Force Graph on zooming out: "it is very very awful UX-wise (it is unexpected -- the text warning it will happen is tiny and the fact we even need text to warn such a thing indicates that the semantics are not there for that to be an appropriate transition yet). It takes several seconds to transition a big local map over to force graph and back ... Never once did I trip the 2D->3D transition on purpose." And: "if we think it might be a little computationally expensive to switch views, perhaps direct zooming in/out isn't the best way to navigate between these different views? We have lots of sidebar links with the detail panel, but I know the detail panel design is already not terribly mobile-friendly. I feel like the transition semantics remain elusive." The vision's "each reached from the other by zooming" is therefore in question, and the Local Map's own switch is a standing defect to fix with this ticket.
- **T9. Nested projects, subtrees, and a board as a thing.** Blocked by T1. Scenario 4.
- **T10. An SBOM file read as a Live Doc in the manifests' family, and what hangs beneath a thing.** Talk; low rank by the owner's "stretch goal"; read from disk only (decided 2026-10-09). Scenario 9.
- **T11. A thing whose docs come from outside the workspace.** Blocked by T3. Scenarios 4, 6.
- **T12. A path across systems, symbol to symbol.** Blocked by T8. Scenario 1.

### Not yet specified

- The vocabulary on trial: thing or piece, region or district, crossing or tunnel.
- What a thing says about itself: a thing's own description, surfaced by the directory-docs waffle of 2026-02.
- What touch means on the board (scenario 12).
- What the board shows when nothing is authored (scenario 11).
- Reading the security surface: doors open to the world (scenario 1).
- Agents beyond the text report (scenario 13).

### Out of scope

- Trimming before sharing (2026-10-09, until it is a problem).
- The trajectory timelapse (the Force Graph, 2026-10-08).
- The Local Map's layout; `reachable`; the Knowledge Sources panel; the retirement of older views; the vision's purpose sentences.
- Vulnerability data fetched from the network, and the precomputed index of open-source software (the offline rule).
- The animated flyover; the hosted showcase service.

### Failed ideas

Ideas the owner withdrew or re-scoped, with why, as the record shows them; new entries join as the scenarios fail them.

- Churn counts from git committed into docs (2025-11-08): two contributors would commit different numbers; allowed for ephemeral views only (2025-11-10 and 11).
- Code generated from docs, and code edited inside the Explorer (2025-10 to 2025-11): to the wishlist (2025-12-12) and de-scoped (2026-02-20).
- LLM features inside the tool (2025-11): removed for "bring your own assistant" (2026-02-17 and 20).
- Agents as the primary consumer (2025-10-16): "not terribly useful for them" (2026-09-26); export only (2026-10-03).
- A hosted service that runs the tool on a public repository (2025-11-15): doubted the same day and parked; built since by others.
- Directory-level authored docs (2026-02-23): "We've waffled on that." (2026-03-17).
- The animated flyover (2026-09-26): "a wild stretch goal".

## System References

### Components

- [packages/engine/src/live-docs/board.ts](../layer-4/packages/engine/src/live-docs/board.ts.mdmd.md)
- [packages/engine/src/live-docs/boardGraph.ts](../layer-4/packages/engine/src/live-docs/boardGraph.ts.mdmd.md)
- [packages/explorer/src/client/views/worldMap/controller.ts](../layer-4/packages/explorer/src/client/views/worldMap/controller.ts.mdmd.md)
- [scripts/live-docs/board.ts](../layer-4/scripts/live-docs/board.ts.mdmd.md)

### Related

- [Boards](boards.mdmd.md)
- [Openings](openings.mdmd.md)
- [Architectural Decisions](architectural-decisions.mdmd.md)
- [The vision](../layer-1/vision.mdmd.md)

## Evidence

- [tests/e2e/world-map.spec.ts](../layer-4/tests/e2e/world-map.spec.ts.mdmd.md)
- [tests/integration/live-docs/board.test.ts](../layer-4/tests/integration/live-docs/board.test.ts.mdmd.md)
