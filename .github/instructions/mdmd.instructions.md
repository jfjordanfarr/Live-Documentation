---
applyTo: "**/*.mdmd.md"
---

# Membrane Design MarkDown (MDMD) Instructions

## Documentation Conventions

Our project follows a four-layer MDMD stack that moves from heavily-authored, public-facing knowledge down to deterministic, machine-generated implementation facts.

- **Layer 1 – Vision / Capabilities**: answers “What promise are we making?” and may double as the source for a public-facing site (e.g., GitHub Pages).
- **Layer 2 – Requirements / Work Items**: answers “What must be true for the promise to hold?” Execution handoff may live in Spec-Kit tasks or external issue trackers.
- **Layer 3 – Architecture / Solution Components (concept)**: answers “How do subsystems collaborate?” and clusters Layer 4 implementations into navigable topologies. Treat `.mdmd/layer-3/**` as curated references and regard `.live-documentation/system/**` outputs as materialized views regenerated on demand—do not commit those unless explicitly promoted.
- **Layer 4 – Implementation / Live Documentation Base (unit)**: answers “What exists today?” and mirrors every tracked source artifact.

This progressive specification strategy—**Membrane Design MarkDown (MDMD)**—treats headings, anchors, and relative links as a lightweight AST that tools and humans can traverse together.

Today, only Layer 4 is treated as *rigorously enforceable*: every tracked implementation/test/asset must have a corresponding Layer 4 Live Documentation file. Higher layers are curated and intentionally less strict.

### Key Notes
- Layer-link closure is **not** a hard requirement. Prefer downward links when useful, but do not block work on “every Layer N doc must be accounted for by Layer N-1”.
- `## Generated` sections are currently reserved for Layer 4 Live Docs (and ephemeral system/materialized views), not for Layer 1 or Layer 2 MDMD docs.
- Canonical section spines for each layer live beside these instructions (see `mdmd.layer{n}.instructions.md`). Follow them, but treat Layer 1/2 spines as conventions rather than enforcement targets.
- All links must be workspace-relative Markdown links.  This keeps the knowledge graph resolvable offline and allows lint to validate adjacency rules.
- Purpose statements remain mandatory for every implementation-facing document; struggling to articulate purpose is a signal the underlying code or doc may be redundant.

### Provenance
- Early ideation for strict downward links + higher-layer generated rollups: `AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md`.
- Relaxation after the `layer4-orphans` experiment: `AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-19.SUMMARIZED.md`.