# The owner

_Current as of 2026-11-12. Any agent working here keeps this file: when the owner says something that changes how to work with them, add it with the date, in their words where you can; when an entry is superseded or no longer needed, delete it. Cut on 2026-11-12 from 136 KB at the owner's request ([Turn 1](../ChatHistory/2026/11/2026-11-12.1.record.md#turn-1)): entries that restated what a current model does unprompted, workarounds for older models and harnesses, and the long provenance of each rule were removed. The full prior text is `git show 2f88a579:AI-Agent-Workspace/Memory/owner.md`; where the rules came from is told in [the narrative](narrative.md#where-the-rules-came-from)._

## Who they are and what the tool must serve

The owner is this repository's only human contributor. They act as product manager and architect and expect the agent to be the lead developer who owns the code. They built the repository between October 2025 and April 2026 with GitHub Copilot, stopped when the models of the day could not see or design a user interface well enough to help with the Explorer, and came back on 2026-09-26 with the Claude 5 models. There is no deadline: "It's okay if it's ready when it's ready."

In their own words (2026-02-23): "a senior fullstack developer, a published life scientist/bioinformatician, a creator of multiple published games, and a creator of multiple interdisciplinary side projects", with expectations of "publication-quality **rigor**". They bring lenses from cell biology, game design and music production, and read the visualization as a living system of contending forces. By their own account they are borderline aphantasic (2025-12-05): they cannot picture a design from a description, which is why they need alternatives built and shown, and part of why the tool exists.

Their day job is public-facing, PCI-DSS-secured applications at a mid-sized multi-state legal enterprise. That C# estate is where they mean to run this tool; the sample under `tests/integration/programs/csharp/estate` is its miniature. The shape (2026-09-27):

> .NET Framework 4.8 WebForms (but using no PostBack nastiness - just using it as the substrate to do some simple data-specific rendering choices on the pages and letting vanilla JS take over for the parts which update; it's using standard .NET WebAPI 2.N controllers), which talks to a .NET WebAPI 2 API gateway, bridging cloud REST into on-prem WCF service calls, issued out to the onprem WCF service hub (for this specific workload + environment combination), which then matches those operations to the proper WCF service. The WCF service will likely call stored procedures in an onprem MS SQL Server, which itself may perform OraQueries into the (yuck) Oracle database at the center of everything. Entity Framework is typical on the WCF services.

What the tool is for:

- "I just want to be able to show non-software people what I do and they can _see it_ the way I understand it. I don't want to keep drawing bespoke diagrams for XYZ questions from the business at work." (2026-09-26)
- "We are trying to build something very very common-sense: we want to be able to look at directories and understand their contents well, especially if those contents have interconnectivity of some kind." (2026-11-01, [Turn 2](../ChatHistory/2026/11/2026-11-01.1.record.md#turn-2))
- "Live Documentation's greatest relative strength is that it exists to **prevent your understanding of complex systems run away on you**. ... In a world of more and ore agent code, _understanding_ is the real bottleneck." Agents are served with plain text and copyable commands, not a protocol. (2026-10-08, [Turn 7](../ChatHistory/2026/10/2026-10-08.1.record.md#turn-7))
- The 2D Local Map is "a place where a person learns by zooming out"; the 3D Local Map "a place where a person learns by zooming in", and it exists to orient a person when the 2D picture gets too complex (2026-10-31, 2026-11-04).

## How they work with an agent

**Rhythm and autonomy**

- One chat per dev day, kept even when a thread is going well (2026-11-07, [Turn 8](../ChatHistory/2026/11/2026-11-06.1.record.md#turn-8)). A close-out they ask for records their last prompt, writes the summary, and makes their screenshots easy to find for the next chat.
- They supply preference; the lead chooses the work. "I am here suffusing the chats with human preference. You tell me what you want to work on." (2026-11-04, [Turn 7](../ChatHistory/2026/11/2026-11-04.1.record.md#turn-7)) A pass the root finds obvious proceeds without asking (2026-11-08). Overnight work is welcome.
- A genuine fork is not guessed: "I am absolutely happy to come back to a short transcript where, 5 minutes later, you hit a fork in the road and simply stopped with a wonderful set of questions" (2026-09-27). A fork whose better branch is only larger is not a fork: "What is the right final shape? Build that, and then commit it." (2026-10-16, [Turn 4](../ChatHistory/2026/10/2026-10-16.1.record.md#turn-4))
- A fork comes to them with how the field has answered it and a recommendation, not a menu (2026-09-28, 2026-10-08). Before building an optimization, say what it costs in complexity; "I'm okay with the right answer being 'don't build it'" (2026-10-16).
- An agent's own open questions are not work until a scenario or a measurement in hand needs them: "this feels a little like busywork to me" (2026-10-16).
- Mature changes must fit the whole: "everything must agree with everything in our software" (2026-10-19, [Turn 20](../ChatHistory/2026/10/2026-10-19.1.record.md#turn-20)).

**Reading their words**

- Their opposing suggestions are "levers to push and pull", not successive decisions (2026-09-30). They elicit answers by questions and expect ideas pressure-tested against a fixed set of scenarios, on paper, before code: "board game rules" (2026-09-30, 2026-10-09).
- Praise or tentative agreement is not a choice among alternatives. Material mined from old chats is dated history or an open question until they re-affirm it: "So much certainty going in. Hmm..." (2026-09-27). What the record does not show is unknown and asked about; it is never written down as "no preference" (2026-10-22). They read the briefs helpers are given.
- Given numbered recommendations, they answer by exception; what they pass over stands (2026-10-16).
- They love pushback with evidence and come around when it proves out: "I **LOVE** being pushed back on like this! Keep it comin'!" (2026-10-05, re-affirmed 2026-11-04).

**Explaining the work**

- "I really do read your responses and I really do want to avoid succumbing to a 'vibe coding' trap of letting the understanding of the system run away from me." (2026-10-06) Name the modules, say how a change fits the whole system, and keep them in step as the work goes, not only at its end (2026-10-09).
- The VS Code interface collapses the work between replies, so a final reply carries the context a decision needs: examples, alternatives, costs, a recommendation (2026-10-19, [Turn 18](../ChatHistory/2026/10/2026-10-19.1.record.md#turn-18)).
- When they say they did not understand, start again from the ground in plain words: "if I, the user, really am reading your responses and don't understand, the onus really does fall back to you." Terse is not clear (2026-10-09, [Turn 12](../ChatHistory/2026/10/2026-10-08.1.record.md#turn-12)). The old low-chatter rule is retired; it was a guard against poor compaction, not a taste (2026-11-03).
- They ask to be taught UI and UX at the decision point: a principle with a concrete application, evidence told from hypothesis, bad ideas rejected by reasoning before building; no lectures and no extra approval gates (2026-11-03, [Turns 11 to 13](../ChatHistory/2026/11/2026-11-03.1.record.md#turn-11)). They have a professional game-development background; relate level of detail, animation and feel to it.
- A design that will be seen is described in the words a person would use at the screen ("major ticks and minor ticks"), before its mechanics (2026-10-17).
- Landed work is shown through hyperlinks that open from the chat and, for a round accepted for commit, through links into the Explorer with the subjects pinned, "such that it is intuitive and obvious" (2026-10-16, 2026-11-06). What they are asked to judge must be what port 8900 shows without a switch; the reply's first line names the subject, zoom and control (2026-11-05).
- An answer about how the code works ends in the shared picture and says what the docs cannot see (2026-10-15).

**Pictures and judgment**

- **Fable's eye is now trusted (2026-11-12, [Turn 1](../ChatHistory/2026/11/2026-11-12.1.record.md#turn-1)).** "the last session that was run with Fable 5.2 on 11/10/2026 showed me that the vision capabilities have not only caught up but finally exceeded Astra." This supersedes their November 8 judgment that Fable was "just not where Astra is at with respect to human-like aesthetic preference". The root is expected to look, judge and say what it sees. In a disagreement about a picture the owner's eye still decides.
- What still holds from November 8 ([Turn 9](../ChatHistory/2026/11/2026-11-07.1.record.md#turn-9)): alternatives offered for their eye must be correct and must actually differ; no sketch whose known faults the viewer is asked to look past. "all models, frontier and otherwise, adore excess text."
- Questions of taste are closed by looking: build a few settings as levers, show them as pictures and motion, and they pick the default (2026-10-17, 2026-10-22: "I want to see it before I assert it"). Their eye for motion outranks inference from stills (2026-11-01).
- Numbers inform and the eye decides (2026-10-07). Measures must be plural and at odds with each other, or one design games them (2026-10-01).
- They show what they mean by marking up a picture; a marked picture is the brief (2026-10-07).
- When they could not find something that exists, the finding is about the door, not about them (2026-11-02).

**Stewardship**

- "all changes are your changes. No one else effectuates change in the code": nothing a check reports is "pre-existing"; fix it or name it as a debt (2026-10-09). The history is linear for that reason.
- Dead code is deleted without asking, after checking both that nothing uses it and that the record intends no use (2026-10-08). Code is a liability and each file answers "why does this exist?"; writing a file's authored documentation from its origin in git and the chats is how the indefensible is found (2026-10-08, [Turn 5](../ChatHistory/2026/10/2026-10-08.1.record.md#turn-5)).
- "Cruft in highly-visited files is very worth clearing." (2026-10-08) Fewer committed artifacts under `AI-Agent-Workspace`: a plan lives in a document that must exist anyway, and pictures are taken when a change needs looking at (2026-10-09).
- A false statement met in a record, inventory or Memory file is corrected on sight with a dated note naming the source (2026-10-15).
- "We keep chat histories for a reason": search the records and Memory before calling an idea or a gap new, and start a design conversation from what the workspace has already said (2026-10-16, 2026-11-06).
- The tool is a panopticon of itself: after changing the Explorer, look at the change in the Explorer; "If you find the explorer unhelpful, it might be worth asking why" (2026-09-29).
- Failed experiments are welcome: "Failed experiements are awesome." (2026-09-30)

**Git**

- One linear `main`; commit when confident in safety and quality (2026-09-27). They push at any moment, so a commit is never amended or rewritten; a correction is the next commit (2026-10-17). Cruft is removed by an ordinary commit, with no history surgery. A rename that reads better is made.
- Never a bulk `git checkout`, `git restore` or `git clean`: a day's work was lost that way on 2025-11-15.

**Verification**

- "Locally, I would sincerely appreciate exercise of the fullest suite possible"; machine time spent proving a commit is welcome (2026-09-30, 2026-10-15). The gate should come back inside the prompt cache's hour, by shrinking it without weakening an assertion (2026-11-05, [Turn 8](../ChatHistory/2026/11/2026-11-05.1.record.md#turn-8)).
- Browser tests run one at a time: "E2E playwright must be serialized." (2026-10-19)
- The machine (WSL2 on a 20-thread i9-10900K) slows 1.5 to 2 times under sustained browser load and recovers at rest. A timing-bound case that fails late in a long run is rerun alone on the cooled machine before it is read as a regression, and the record says which ran where (2026-11-06).
- Use public CI results before asking for a token (2026-10-19).
- Design faults that geometry can name, words on words or words cut off, get a failing test (`tests/e2e/design-audit.ts`), written after the eye has judged (2026-09-29).

**Delegation**

- Roots and builders is the pattern they hoped for: the root keeps its context for the conversation, the forks, the pictures and the review; builders hold the edits and iterations. One builder is the norm, and never for throughput: "Do the correct thing, even if it requires moving slowly." (2026-11-06, 2026-11-08) The rules are in [AGENTS.md](../../AGENTS.md).
- Opus 5.5 at High or XHigh is their workhorse for builders; never Max, which "often over-reasons to the point of timing out and returning no response" (2026-10-16, 2026-11-02). In Codex they ask for GPT-6.1 Sol (2026-10-19). Work whose result is judged by eye goes to a model that sees well.
- A builder may spin up one subagent of its own tier for work that needs little of this workspace: outside research, a playtest as a stranger, a review (2026-11-08, [Turn 5](../ChatHistory/2026/11/2026-11-07.1.record.md#turn-5)).
- The design itself is the work of the agent that holds their words; helpers gather, measure, critique and build bounded pieces (2026-09-28, 2026-10-22).
- Keep the prompt cache warm during work with a timer the root sets before a quiet reply, about once an hour; never an unattended schedule that could outlive the session: "I'm worried about unintended evil genie consequences." (2026-11-08, [Turns 6 and 8](../ChatHistory/2026/11/2026-11-07.1.record.md#turn-6))

**Records and steering documents**

- **The long startup read is the point** (2026-11-12, [Turn 2](../ChatHistory/2026/11/2026-11-12.1.record.md#turn-2)). Told the startup reading had outgrown the context: "You have a full million. Furthermore, taking a bath in project context and _then_ compacting produces a new context window that is _massively_ empowered to succeed. So much of success is just knowing what we have and haven't already discussed." So a new chat reads the Memory documents and the five latest summaries in full (their choice of five, 2026-09-30; the narrative in full, 2026-10-16), and never trims that reading for cost. After a compaction mid-session, or whenever they ask, re-read the run of summaries to restore the trajectory: "I saw the compaction summary and it left a lot out in my opinion." (2026-10-14)
- The chat archive is a system of record, "not for distillation". Only the root's conversation is kept, never subagent threads, and reasoning is never extracted from any agent trace in any harness (2026-09-30, 2026-10-01). A restarted day stays one record (2026-10-13). A missed closing message is expected. The record is the session, "the summaries are like medium-term memory and the narrative is like long-term memory" (2026-10-17).
- The always-loaded file holds only what is "forever-true, always-relevant", right-sized (2025-10-16, 2026-10-03). Steering is matched to the model: "behaviors you already naturally exhibit plausibly don't need reinforcing with extra sentences" (2026-11-12). When a model changes, revisit what these files tell it.
- "Vendor-neutral path. Always." Skills live under `.agents/skills/`, a vendor's location holds a pointer, and nothing is installed: skills are "30 lines of plain text" (2026-10-09, 2026-10-15).
- Names: plain words, never requirement-ID schemes ("inuman/beurocratic"). Names stay loose while a design moves; they offer several with slashes between them until one has earned itself (2026-10-03).

## Product stances recorded here

- **Files on disk, no network.** "I do prefer no network calls strongly"; the tool is "beholden to no corporate overlord" (2025-12-14, 2026-10-09). A feature such as trimming a shared bundle is built when it becomes a problem (2026-10-09).
- **The picture must not lie about the shape.** "I'm not open to having the user open the shape of their software and believe it's all fine and dandy when it's not." A reduction that hides a reference says so and leaves a way back; the person's own subset is pinning (2026-10-01). Layout must not manufacture debt, and architecture should show "from the very shape it produces" (2026-09-30).
- **Require less authorial intent of the user**, and never silently refuse something they configured (2026-11-02).
- **Configuration is welcome**: where several valid ways of looking exclude each other, give levers, and tune defaults by eye (2026-10-01). A concern with no single right answer gets a seam where its answer can change alone (2026-10-17).
- **Which files get a Live Doc**: every file but a short list of exclusions ("Work backwards", 2026-10-21); a doc wherever there is "authorial decisionmaking to convey" (2026-10-15). Assets are a project's content, and an asset is a binary file: "The dividing line is plaintext/near-plain-text versus binary." (2026-10-15, 2026-10-16)
- **Related means linked**, one way or the other, by markdown links only; backticked mentions give "Too many false positives" (2026-10-22).
- **Oracles.** Nothing grades itself; between two candidate rules, "whichever disagrees least" with an independent oracle wins, listed and never scored (2026-10-15). A hand reading of this repository is a valid oracle subject; a guess that is wrong here but reasonable elsewhere stays as the last fallback. A cold run over a stranger's repository is "A phenomenal stress test!"
- **History.** "Trust what git says" for renames. Gource is the reference. A step is a commit, with steps salient to the pinned items worth exploring. Time on the scrubber is linear by default (2026-10-16, 2026-10-22). A playing history should read as "a network of occasionally firing fireflies": sharp local changes against a steady background, "maximize surprise" (2026-11-01, [Turns 3 to 5](../ChatHistory/2026/11/2026-11-01.1.record.md#turn-3)).
- **Simulations.** A hold in a simulation is a workaround; understand the forces and add the missing one (2026-10-17). Structure should emerge from the data, not from centres placed by hand, and a rule the type filters can flip is doubted (2026-10-31).
- **Views.** Switching between 2D and 3D by zooming was "very very awful" and is gone (2026-10-09). A view being replaced stays until its successor at least matches it (2026-09-29). At least two ways to do anything, navigation above all (2026-09-29). Back and Forward between places matter to them (2026-09-30).
- **Dependencies.** A library is worth taking when a hand-written reader would be a scanner by another name (2026-10-16).
- **Delivery.** After long uncertainty ("I am going to need additional information and advice to make that decision concretely", 2026-10-08) they chose the package first on 2026-10-10; the record is in [the World Map plan](../../.mdmd/layer-3/world-map.mdmd.md#decisions-so-far). Constant throughout: "my hopes for maximum security, portability, shareability". Still undecided by their word: the name for a thing's openings (2026-10-01).

## Formatting and visual taste

- **Cut, don't boost.** "A master audio producer will prefer to cut frequencies they don't like rather than boost frequencies they do like." Fade the irrelevant. No emoji.
- **Aesthetic means less work.** "more-aesthetically-pleasing actually means \"less work for the eye and brain to perform while presenting identical information\"" (2026-10-13).
- **Almost no text of ours on screen.** "people _just won't read text_ that you display"; the software should be "as intuitive to use as Microsoft Teams": icons with hover explanations, and text that is the user's own. "an explainer or a tutorial is a big big copout" (2026-10-30, [Turn 3](../ChatHistory/2026/10/2026-10-30.1.record.md#turn-3)). A name is drawn "the very last second": on hover, or when its thing is large enough to be what you are looking at (2026-11-02). Repeated actions are recognizable icons with accessible names (2026-10-01).
- **Hover peeks, a click acts.** A disclosure that rearranges the picture happens on a tap or click; hover-driven expansion was "too difficult and finicky to actually work as a human end user with a computer mouse" (2026-11-05). On the World Map a click pins a popover and a hover peeks (2026-09-28).
- **Every claim is a link**: a panel that says a thing contains or uses N others links to them (2026-09-29).
- **The card.** "Card" carries trading-card meaning: a subject composed as a whole, centred, portrait, understood in one view; neighbours may be clipped (2026-11-04). A card never resizes on zoom (decided 2026-11-05: "I really would prefer that the cards don't _themselves_ resize when we zoom out"), and below reading scale names take the room that hidden descriptions leave. Their instinct, on trial as the slot composition and not yet a verdict against the growing card: the box does not depend on what is read, text holds its size and is cut with an ellipsis, and every symbol gets the same configurable allotment of lines. A header's top row is the name's, or fully used: never a lone control in a corner with the title beneath it (2026-11-07). Straight edges near each other align or stand clear (2026-11-08). The quiet dashed Internals row as built is the bar a heavier form must beat; the row's meaning is the threshold where the map ends and the source begins (2026-11-07, 2026-11-08).
- **Zoom.** The 2D picture should change appearance rarely, "very very FEW breakpoints (2-3)", a hypothesis under trial (2026-11-08). A person must be able to show all, some or none of the descriptions at any zoom and share that choice (2026-11-08).
- **3D.** The translucent skins with their files visible inside, nested, are the look: "cells in these embryos"; no bubble that appears to hold one cell; Skin and one hop are the defaults (2026-11-07). Discovery is the default: hide, reveal by hops from what is pinned, with the whole one act away (2026-10-31). Colour on a single connector means nothing in a dense web; a 3D idea is judged by whether a person can find what they are looking for (2026-10-31). One line per file pair, coupling shown by position, exposed interface by size (2026-10-13). The camera turns as the force graph's does: drag right and the scene rotates left, drag down and the camera rises (2026-09-28).
- **Motion.** Keeping one's bearings is foundational: "Consistency of view -- the ability to keep one's bearings as they click around"; moves are shown gradually, never needlessly slowly (2026-03-26, 2026-09-30). Motion is used sparingly and to carry information; they love gentle flow along wires and things eased into place by their own motion; motion with no cause to read is staged (2026-10-06, 2026-10-18).
- **Direction and colour.** Uses enter on the left and offerings leave on the right. Outside one system, three dimensions and no left-to-right law (2026-09-28).
- **The World Map.** Board-game feel, pieces placed on a bright board with a dark interior inside each system ("inside-versus-outside"), a person free to flip the pairing; light blue for cloud and light orange for on-prem, their own diagrams' convention; districts side by side or stacked (2026-09-28, 2026-09-29).
- **Code.** "I care about how easy it is to understand the code at a glance": what a file offers at the top, the helpers it calls for itself at the bottom, semantically aligned whitespace, no formatter, lint for correctness only, and no line-count rule: split for responsibilities that can be improved independently, never to satisfy a number (2026-09-27, 2026-10-14, 2026-10-22).

## What the Copilot era asked for (2025-10-16 to 2026-04-01)

Mined on 2026-10-01 at the owner's request from their turns in that era's 111 transcripts. What they re-affirmed then is in [AGENTS.md](../../AGENTS.md) and above; the rest is dated history and was removed from this file on 2026-11-12. The list as mined is in `git show 2f88a579:AI-Agent-Workspace/Memory/owner.md`, and the story of each rule in [the narrative](narrative.md#where-the-rules-came-from).
