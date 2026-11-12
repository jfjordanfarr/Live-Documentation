# AI-Agent-Workspace

The record of building this repository with AI coding agents, and the memory those agents share.

- `Memory/` is **current**: what the owner has said about how to work here and where the project is going, kept as plain markdown so that an agent of any vendor reads the same facts. [owner.md](Memory/owner.md), [direction.md](Memory/direction.md), [ideas.md](Memory/ideas.md), and [narrative.md](Memory/narrative.md), the story of the workspace from its first prompt, kept current as history. [AGENTS.md](../AGENTS.md) says which are read in full at the start of a chat and which are searched.
- `ChatHistory/` is the development system of record: source captures, reconstructed transcripts, and summaries that point back to their evidence and verified commits. [Its README](ChatHistory/README.md) defines the shared convention across harnesses and the session handoff routine.
- `Probes/` holds dated records of design probes: the brief, each builder's findings and a few screenshots. The probe pages themselves are disposable and never committed. The layout lab's run reports belong in the day's probe folder; its page captures are rebuilt on demand and not committed.
- `Screenshots/` holds dated pictures of the built Explorer, taken by the agent after changing it, each named in its folder's README; [the index](Screenshots/README.md) lists the folders.
- `Gallery/` holds one representative picture per subject, view and state, copied with its origin named, and side-by-side sheets that `sheets.sh` rebuilds, so that a comparison across views starts from one folder; [its README](Gallery/README.md) is the comparison set.
- `Research/` holds dated surveys of formats and prior art, gathered for a design step, with a source for every claim. A survey records what existed on its date and decides nothing.
- `Notes/` holds planning documents, censuses of user intent and use cases, and design notes from the Copilot era. Their quotations are not all verbatim; the intent census carries a dated list of corrections.
- `scripts/` holds helper scripts from the same period, and `claude-code-transcript.mjs`, which rebuilds the Claude Code transcripts.
- `tmp/` is scratch space, not tracked.

Everything from the Copilot era is **historical**. It describes nothing about the current state of the code, and links inside it may point at documents that no longer exist; that is expected, and they are not maintained. Current status and intent live in [the vision](../.mdmd/layer-1/vision.mdmd.md), with priorities and decisions in [direction.md](Memory/direction.md). [AGENTS.md](../AGENTS.md) is the working guide. The archive preserves provenance after an investigation or summary is complete; when intent signals conflict, the newer one wins.

Raw transcripts are excluded from the Explorer bundle by `bundleExclude` in `.live-docs.config.json`; linked summaries are included. `ChatHistory/`, `Notes/` and `scripts/` are excluded from the default SlopCop audits; check newly authored archive indexes and summaries explicitly. `Memory/` and this file are audited.

## Local product outputs

This repository's [.live-docs.config.json](../.live-docs.config.json) places the generated mirror in `.mdmd/layer-4/`, one document per tracked source file. The authored layer-1 through layer-3 documents identify themselves as current or historical. Shipped product defaults are `.live-documentation/source/*.md`; product code reads configuration rather than assuming this workspace's layout.

The graph index is derived afresh from the docs at `<root>/index.json` (`.mdmd/index.json` here), ignored and never committed. History generation writes its cache and sequence under `<root>/history/`; the directory ignores itself in any repository. The static Explorer is built under `dist/explorer/`. These outputs are distinct from the preserved source captures and authored evidence above.
