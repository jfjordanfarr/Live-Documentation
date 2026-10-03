# AI-Agent-Workspace

The record of building this repository with AI coding agents, and the memory those agents share.

- `Memory/` is **current**: what the owner has said about how to work here and where the project is going, kept as plain markdown so that an agent of any vendor reads the same facts. [owner.md](Memory/owner.md), [direction.md](Memory/direction.md), [ideas.md](Memory/ideas.md). Read them after [AGENTS.md](../AGENTS.md).
- `ChatHistory/` is the development system of record: source captures, reconstructed transcripts, and summaries that point back to their evidence and verified commits. [Its README](ChatHistory/README.md) defines the shared convention across harnesses and the session handoff routine.
- `Probes/` holds dated records of design probes: the brief, each builder's findings and a few screenshots. The probe pages themselves are disposable and never committed.
- `Screenshots/` holds dated pictures of the built Explorer, taken by the agent after changing it, each named in its folder's README; [the index](Screenshots/README.md) lists the folders.
- `Gallery/` holds one representative picture per subject, view and state, copied with its origin named, and side-by-side sheets that `sheets.sh` rebuilds, so that a comparison across views starts from one folder; [its README](Gallery/README.md) is the comparison set.
- `Research/` holds dated surveys of formats and prior art, gathered for a design step, with a source for every claim. A survey records what existed on its date and decides nothing.
- `Notes/` holds planning documents, censuses of user intent and use cases, and design notes from the Copilot era.
- `scripts/` holds helper scripts from the same period, and `claude-code-transcript.mjs`, which rebuilds the Claude Code transcripts.
- `tmp/` is scratch space, not tracked.

Everything from the Copilot era is **historical**. It describes nothing about the current state of the code, and links inside it may point at documents that no longer exist; that is expected, and they are not maintained. Facts about the project today live in [AGENTS.md](../AGENTS.md); the intent lives in [the vision](../.mdmd/layer-1/vision.mdmd.md). The archive also preserves provenance after an investigation or summary is complete; when intent signals conflict, the newer one wins.

Raw transcripts are excluded from the Explorer bundle by `bundleExclude` in `.live-docs.config.json`; linked summaries are included. `ChatHistory/`, `Notes/` and `scripts/` are excluded from the default SlopCop audits; check newly authored archive indexes and summaries explicitly. `Memory/` and this file are audited.
