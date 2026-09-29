# Chat History Index

## Raw Transcripts
- Location: `AI-Agent-Workspace/ChatHistory/<year>/<month>/<date>.<conversationNumber>.md`
- Example: `AI-Agent-Workspace/ChatHistory/2025/12/2025-12-11.1.md`

## Summarized Transcripts
- Location: `AI-Agent-Workspace/ChatHistory/<year>/<month>/Summarized/<date>.<conversationNumber>.SUMMARIZED.md`
- Example: `AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-11.1.SUMMARIZED.md`

Scripts or prompts that previously referenced the root-level `ChatHistory` directories should be updated to use these dated folders as the archive evolves.

## Claude Code Sessions (September 2026 onward)
- Location: `AI-Agent-Workspace/ChatHistory/<year>/<month>/<date>.<sessionNumber>.md`, named by the day the session started.
- Contents: both sides of the session in order. The owner's prompts are verbatim, with the pictures they pasted in a `<date>.<sessionNumber>.images/` folder beside the transcript, captioned by hand in its README. Claude's messages are verbatim, and the work between them is one line naming the tool calls, subagents and commits. Commands, tool output, reasoning and subagent reports are not kept.
- Source: the session log Claude Code keeps outside the repository and deletes after its retention period. `node AI-Agent-Workspace/scripts/claude-code-transcript.mjs` rebuilds every transcript whose log still exists; run it near the end of each session and commit what it writes. A session keeps its number once written, so a transcript whose log is gone is left as it is.
- The script never reads the log's reasoning blocks. On 2026-09-29 an earlier version read the progress lines the editor shows out of those blocks, and the model's safeguards stopped the session three times (`reasoning_extraction`). Keep it that way, and do not read those blocks by hand either.
