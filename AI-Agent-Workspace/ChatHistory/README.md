# Chat history and provenance

This archive is the system of record for the project's development. The owner reaffirmed on 2026-09-30: “these chats are not for distillation. They are there for provenance. They are a system of record.” Summaries help a reader find the evidence; they do not replace it. Current direction lives in [Memory](../Memory/owner.md) and [the vision](../../.mdmd/layer-1/vision.mdmd.md).

Development follows one chronological story across harnesses. A session keeps the date it started and its sequence number on that date, even when it spans several days. Record the full date range in its title. Allocate the next unused number across harnesses; never renumber an existing session or break its citation paths.

## Source captures

The owner's GitHub Copilot transcripts came from **Right Click → Copy-All** in the chat window. The September Claude Code text files came from the harness's export operation. Existing September Markdown was reconstructed separately by [claude-code-transcript.mjs](../scripts/claude-code-transcript.mjs), with timestamps and image links but without terminal output and some visible activity. The [September inventory](2026/09/README.md) joins these captures by session and records their different coverage.

- Existing transcript: `<year>/<month>/<start-date>.<session>.md`.
- Harness export: `<year>/<month>/<start-date>.<session>.<harness>.export-<capture-date>-<capture-time>.<extension>`.
- Existing images: `<year>/<month>/<start-date>.<session>.images/`.

Preserve source bytes. The September inventory records received filenames and SHA-256 hashes for the renamed exports. A file may contain only a later portion of a session; a filename and an overlapping passage do not establish completeness. If captures disagree about ordering or coverage, record the disagreement rather than silently splice them into an invented authoritative transcript. Keep existing source links stable. Do not delete a capture because it has been summarized.

The Claude converter describes a historical reconstruction method, not a universal export interface. It reads the retained Claude logs outside the repository and may overwrite the corresponding reconstructed Markdown when run. Do not run it as a generic session-closing action or use it for Codex. Never extract private reasoning blocks. A harness's visible error or notice belongs in the record as that notice, without attempting to recover the hidden content behind it.

## Recording as work proceeds

The owner adopted this routine on 2026-09-30, adding: “Keep only the chat history of the *root* agent if any subagents are involved; do not persist subagent history as it has no conversation turns with the User”. The record contains the user's conversation with the root agent. Subagents must not create or append conversation records or summaries of their delegated threads. Do not copy subagent prompts, replies or agent-to-agent messages into the archive. The root agent may record findings it adopts and link resulting artifacts in its own work notes.

Location: `<year>/<month>/<start-date>.<session>.record.md`, using the same session identity as its summary. This is an **agent-maintained record**, not a harness export. Label the author, harness, recording date and actual coverage. Do not invent message timestamps or fill earlier gaps from compaction summaries. Native captures remain separate sources with their own coverage.

1. **At the beginning of each user turn**, append any preceding visible root-agent responses not already recorded, then the newly received user messages. Include questions, commentary, steering and answers to questions in their observed order. Give each user message a stable `Turn N` heading, aligned with the session summary; identify the turn a response belongs to rather than assuming every message answers the latest prompt. Record ordering uncertainty explicitly.
2. **Separate messages from interpretation.** Preserve available message text verbatim in labelled fenced blocks, choosing fences long enough to contain the original text. Put work notes outside those blocks. Keep recorded text and cited headings stable; append dated corrections. Mark unavailable wording as a gap, or label a reconstruction as authored. Do not copy private reasoning or tool transcripts; link relevant evidence from work notes.
3. **During substantial work**, checkpoint consequential findings, decisions, rejected approaches and unfinished work before context is lost. Link relevant files, source turns and verified commits. Distinguish a proposal, an owner decision, reported work and checked results. These notes describe work; they are not additional conversation messages.
4. **Before finishing**, record outcomes and verification, and refresh a short, revisable `Resumption` section: current task, decisions and constraints, completed work, pending questions and next action. Capture the final response when it is available as a delivered message, normally at the next turn. Until then, leave that coverage gap explicit; an outcome note or prepared response is not proof of delivery.
5. **After compaction**, read the resumption section and follow links to the source turns needed for the task. Check current instructions and repository state before acting. Do not reread the whole archive on every turn or treat old work notes as current facts.

The linked summary remains the browsing surface. Cite the record's relevant turns as sources and retain its coverage qualifications. Summarizing it does not replace the preserved exchanges or require duplicating their full text in the summary.

## Durable summaries

The owner chose **linked summaries, with source references** as the Explorer's provenance surface on 2026-09-30. New summaries use this format in every harness. Existing summaries and their anchors remain valid historical artifacts; no bulk rewrite is needed.

Location: `<year>/<month>/Summarized/<start-date>.<session>.SUMMARIZED.md`.

Each summary contains:

1. **Title and record.** Session date range, harness, model labels as recorded, summary author/date, and whether coverage is complete for the available captures or partial. Do not claim the captures themselves are complete without evidence.
2. **Sources.** Relative links to every source capture used, its coverage and any gaps or disagreements. Preserve received export names and hashes in the month inventory. When no transcript is available, say so; a remembered recap is not a source capture.
3. **Context.** The purpose of the session in a short paragraph.
4. **Turn-by-turn record.** Stable headings `Turn 1`, `Turn 2`, and so on. Each owner prompt and steering message has its own entry, with the owner's request, the agent's response/work, and a source heading or line range. Quote decisive wording when useful. Preserve corrections, rejected approaches and failures. Keep commands, model switches and interruptions at their chronological positions when they explain the exchange. Do not invent a response to an unanswered prompt.
5. **Commits and outcomes.** List verified commit hashes, subjects and repository links when a remote is known. Attribute a commit to the relevant turn when the conversation or diff establishes the connection. A date match alone is insufficient. Identify work left uncommitted; if it lands later, record the later commit as a dated follow-up rather than pretending it landed during the original session. Link concrete artifacts and distinguish what the agent reported from what was checked.
6. **Open ends.** Separate owner decisions from agent recommendations, and completed work from intentions.

Once a turn heading is cited, keep its number and anchor stable. Append later captured turns; correct mistakes with a dated note identifying the source. A summary is an authored historical account and can be wrong. Its source references are how a reader checks it.

## Session handoff routine

This preserves the useful work of the former `/devHistory.summarizeDay` prompt (at `ae216cb5:.github/prompts/devHistory.summarizeDay.prompt.md`) across harnesses. It does not depend on a vendor's slash-command UI.

**When to author:** an explicit request at chat end is the normal path. At the start of a new chat, after reading AGENTS.md and Memory, read the five most recent session summaries in full, oldest to newest; read all available if fewer than five. The owner chose five on 2026-09-30 to preserve the former routine. Then identify the immediately preceding session and create or finish its summary if absent or incomplete and source captures are available. Read the resulting handoff, check it against the current repository, and continue the user's task. Respect an explicit user override; do not turn this into an unrequested backfill of every older gap.

If captures are unavailable, state the gap and continue useful work; never manufacture a transcript or claim a still-active session has ended. A summary may be complete for the available captures while those captures remain partial. When a session ends without a summary request, its maintained record supplies the next chat's source material. Compaction within a session uses the current record's resumption notes; it does not allocate a new session or repeat startup. Historical summaries provide context, while current guidance and newer owner decisions govern the work.

1. Identify the session and all its captures in the month inventory. Establish coverage before summarizing. Never silently substitute a research report for the transcript.
2. Read every capture being summarized in full, in bounded chunks. Write progress into the summary after each chunk, leaving an explicit coverage endpoint until finished. Rehydrate from that file after context compaction. Use existing summaries for navigation, not as substitutes for the source being summarized.
3. Write the turn-by-turn record above and check every source reference. Preserve all owner turns, including mid-response steering. Record ordering uncertainty if asynchronous captures disagree.
4. Verify commits with git and the conversation, including the diff when attribution is unclear. Otherwise attribute the claim. Carry newly reaffirmed preferences into Memory with the date. Historical ideas remain dated history or open questions until reaffirmed.
5. Link a summary turn from a Live Doc's authored Purpose or Notes when it explains that file's origin or a consequential design choice. Provenance is optional and specific; it does not replace an explanation for a new maintainer.
6. Verify links and leave an explicit handoff of unfinished work. Continue the user's stated task, or recommend the next concrete step when asked.

## Explorer provenance

This repository's `bundleExclude` configuration excludes raw captures but permits linked `*.SUMMARIZED.md` documents. The Explorer bundles documents linked directly from Live Docs; it does not recursively ship everything those documents reference. Thus a summary can appear as a Related Documentation node without embedding the full chat archive.

Relative source references remain useful in the repository. In a standalone Explorer bundle, a raw capture that was not bundled is not available offline. A summary must identify that source clearly; it must not pretend that its own account is the complete record.

## Codex capture status

On 2026-09-30 the installed VS Code extension (`26.917.62051`) contained a `Copy as Markdown` handler in its bundled application code, but the owner could find no whole-chat export control in the actual extension UI. Code presence does not establish availability. No working export path has been verified for this session. Do not tell the owner that the menu is available, or label a manually reconstructed account as an exported transcript. Preserve a native capture if one becomes available and record its actual coverage. The [agent-maintained session record](2026/09/2026-09-30.2.record.md) begins with later exchanges whose wording remained available; it does not recover the earlier capture gap.
