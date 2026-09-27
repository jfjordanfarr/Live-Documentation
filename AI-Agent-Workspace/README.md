# AI-Agent-Workspace

The record of building this repository with AI coding agents, and the memory those agents share.

- `Memory/` is **current**: what the owner has said about how to work here and where the project is going, kept as plain markdown so that an agent of any vendor reads the same facts. [owner.md](Memory/owner.md), [direction.md](Memory/direction.md), [ideas.md](Memory/ideas.md). Read them after [AGENTS.md](../AGENTS.md).
- `ChatHistory/` is the chat record. October 2025 to April 2026 are full transcripts of the GitHub Copilot era, day by day, plus per-day summaries, kept unaltered. From September 2026 the archive holds only the owner's prompts, verbatim, from the Claude Code sessions.
- `Notes/` holds planning documents, censuses of user intent and use cases, and design notes from the Copilot era.
- `scripts/` holds helper scripts from the same period.
- `tmp/` is scratch space, not tracked.

Everything from the Copilot era is **historical**. It describes nothing about the current state of the code, and links inside it may point at documents that no longer exist; that is expected, and they are not maintained. Facts about the project today live in [AGENTS.md](../AGENTS.md); the intent lives in [the vision](../.mdmd/layer-1/vision.mdmd.md). The owner keeps the archive until the modernization is complete because it still holds signals of their intent worth mining; when signals conflict, the newer one wins.

The transcripts are excluded from the Explorer bundle by `bundleExclude` in `.live-docs.config.json`. `ChatHistory/`, `Notes/` and `scripts/` are excluded from the SlopCop audits; `Memory/` and this file are audited.
