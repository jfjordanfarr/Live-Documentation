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
- Contents: the owner's prompts only, verbatim and in order, with markers for slash commands and context compactions. The assistant's side is not archived. The source is the session log Claude Code keeps outside the repository. Whether further sessions will be archived, and under what name, is undecided.
