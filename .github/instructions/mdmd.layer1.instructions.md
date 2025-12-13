---
applyTo: ".mdmd/layer-1/**/*.mdmd.md"
---

# Layer 1 MDMD Conventions

Layer 1 documents are **concept-layer** artefacts that should read like polished release notes or public roadmap statements.

This workspace originally experimented with strict, fully-closed MDMD link hierarchies and higher-layer `## Generated` rollups, but practice proved too messy to enforce rigorously at Layers 1–3. The durable guarantee that remains is base-layer (Layer 4 / Live Documentation) coverage.

Layer 1 is therefore **authored-only** today.

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