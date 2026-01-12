---
applyTo: ".mdmd/layer-1/**/*.mdmd.md"
---

# Layer 1 MDMD Conventions

Layer 1 documents are **concept-layer** artefacts intended for the widest possible audience—external adopters, prospective users, and non-technical stakeholders. They should read like polished release notes, public roadmap statements, or user-facing tutorials.

This workspace originally experimented with strict, fully-closed MDMD link hierarchies and higher-layer `## Generated` rollups, but practice proved too messy to enforce rigorously at Layers 1–3. The durable guarantee that remains is base-layer (Layer 4 / Live Documentation) coverage.

Layer 1 is therefore **authored-only** today.

## Document Archetypes

Layer 1 supports multiple document types that share a public-facing purpose:

### Vision Documents (`.mdmd/layer-1/*.mdmd.md`)

These define capabilities, outcomes, and strategic direction.

- Start every file with a metadata block:
  ```markdown
  ## Metadata
  - Layer: 1
  - Capability IDs: CAP-...
  ```
  - This repo prefers `Capability IDs` (see `.mdmd/layer-1/link-aware-diagnostics-vision.mdmd.md`).
  - Do **not** add a `## Generated` section in Layer 1.

- Recommended section order (flexible; optimize for clarity):
  1. `# <Vision Title>`.
  2. `## Metadata`.
  3. A capability-focused body (commonly `## Capabilities` with `### CAP-...` subsections).
  4. Optional outcome sections such as `## Desired Outcomes`, `## Success Signals`, `## Evidence`, `## Target Personas`, `## Guiding Principles`, `## Scope and Non Goals`, `## Evolution Path`, `## Adoption Path`, `## Open Questions`.

- Links and hierarchy:
  - Prefer linking to Layer 2 summaries when possible, but do **not** treat full closure (L1→L2→L3→L4) as a hard requirement.
  - Direct links to Layer 3/4 artefacts are allowed when they improve auditability or reader utility.

- Provenance (why these rules changed):
  - Early strict-downward + higher-layer-generated ideation: `AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md`.
  - Relaxation after the `layer4-orphans` experiment: `AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-19.SUMMARIZED.md`.

### User Guides (`.mdmd/layer-1/guides/*.mdmd.md`)

These answer "How do I...?" questions for external adopters. Task-oriented tutorials that help users accomplish specific goals.

- Start every guide with a metadata block:
  ```markdown
  ## Metadata
  - Layer: 1
  - Guide Type: getting-started | task-tutorial | reference
  ```

- Recommended section order:
  1. `# <Guide Title>` — Action-oriented name ("Getting Started", "Tracing Impact", etc.)
  2. `## Metadata`
  3. Brief introductory prose explaining what the guide covers
  4. Step-by-step sections with `###` headings
  5. Optional: `## Troubleshooting`, `## Related Guides`, `## CLI Reference`

- Keep examples concrete and copy-pasteable (PowerShell for Windows, note shell equivalents where appropriate)
- Link to Layer 3 architecture docs when users need deeper understanding
- Link to Layer 4 Live Docs when users need implementation details

### Future Archetypes

Layer 1 may evolve to include other public-facing document types (changelogs, migration guides, FAQ compilations). When adding new archetypes, document the convention here rather than creating ad-hoc structures.