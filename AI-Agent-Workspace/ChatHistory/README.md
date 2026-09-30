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

This preserves the useful work of the former `/devHistory.summarizeDay` prompt (at `ae216cb5:.github/prompts/devHistory.summarizeDay.prompt.md`) across harnesses. Ask for “summarize the previous session” to invoke it; it does not depend on a vendor's slash-command UI.

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

On 2026-09-30 the installed VS Code extension (`26.917.62051`) contained a `Copy as Markdown` handler in its bundled application code, but the owner could find no whole-chat export control in the actual extension UI. Code presence does not establish availability. No working export path has been verified for this session. Do not tell the owner that the menu is available, or label a manually reconstructed account as an exported transcript. Preserve a native capture if one becomes available and record its actual coverage.
