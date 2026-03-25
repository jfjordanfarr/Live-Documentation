You have been requested to perform the **Dev Day Setup Sequence** — the canonical and standardized opening of each dev day.

The setup sequence consists of multiple steps, executed in order. **Complete all steps before checking back in with the user.** The user's initial prompt will typically provide the raw chat file to summarize, correlating commit(s), and the [Project Development Journey](../../AI-Agent-Workspace/Notes/Project%20Development%20Journey.md) doc — a narrative overview of the workspace's evolution, maintained outside this workspace by a long-context LLM against raw git diffs. Read it for broader story context when summarizing.

---

## Step 1: Summarize the Prior Dev Day Chat

Summarize the attached dev day conversation file into an auditable, turn-by-turn conversation summary in the same style as the other dev day summaries.

**Read the most recent five summaries in full before summarizing the conversation.** This establishes style consistency and provides temporal context.

[Development Chat History Summary Index](../../AI-Agent-Workspace/ChatHistory/README.md)

Extract turn-by-turn conversation summaries, with a preference for direct quotes as practical, **1200 lines at a time**. Emit an update to the summary file after each 1200 lines of conversation history parsed. Do not collapse multiple conversation turns into a single entry; all turns must be represented in the summary. A "conversation turn" is defined as a single prompt-response pair.

Match the structural sections used in the summaries you just read. The summary format has evolved organically over the project's history — the 5-summary reading above is the mechanism that keeps your output consistent with the current convention. Do not invent new sections or omit sections that the recent summaries consistently include.

---

## Step 2: Update Census Files

After the summary is complete, read **both** census files **in full** and identify any **novel** (not already captured) and **salient** (worth preserving — not every user statement is a signal) intent or use-case signals from the summarized session.

- [User Intent Census](../../AI-Agent-Workspace/Notes/user-intent-census.md) — user preferences, methodology signals, corrective statements, product direction signals
- [User Use-Case Census](../../AI-Agent-Workspace/Notes/user-use-case-census.md) — concrete UC-xxx entries for user-facing scenarios

**Novelty requires reading the full census.** Do not add signals that are already captured under prior dev days. When adding entries, update the title's dev day range and add a new section header for the dev day being processed.

Also check for **stale signals** — entries that have been superseded by architectural pivots, component deletions, or design reversals in subsequent sessions.

---

## Step 3: Transition to the Day's Work

After census updates, the user will either **provide a direction** for the day's work or **ask you to propose one**. Both patterns are equally common.

**If the user provides a direction**, proceed with it.

**If the user asks for proposals** (e.g., "what should we work on?", "what are the next reasonable moves?"), draw from these sources to propose options in priority order with brief rationale:

1. **Loose ends** from the summary just produced (deferred items, open questions)
2. **The current workspace state** (run `safe:commit` or at least `npm run build` to verify health)
3. **The feature backlog** ([feature-backlog.mdmd.md](../../.mdmd/layer-2/work-items/feature-backlog.mdmd.md))
4. **Any execution plan files** in `AI-Agent-Workspace/tmp/` that contain stateful checklists from multi-session work

The user will then select or refine the direction.

---

## Resilience Rules (Apply to All Steps)

**Do not check back in until all steps above are completed.** This means that, before the copilot response is completed, **at least one lossy autosummarization process will likely occur**. In order to maintain continuity, **you must rehydrate from the files you have already generated** so that you do not lose progress.

**You must emit edits to the files you are generating for each 1200 lines of conversation history parsed**.
**Failure to do so will cause looping repeat work due to autosummarization behaviors and context limits**.
**If autosummarization occurs during any step, rehydrate with the output files you have generated so far to avoid losing progress**.
