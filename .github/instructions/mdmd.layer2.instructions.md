---
applyTo: ".mdmd/layer-2/**/*.mdmd.md"
---

# Layer 2 MDMD Conventions

Layer 2 documents are **unit-layer** records for requirements, roadmaps, work items, and contributor-facing process documentation.

This workspace originally planned for Layer 2 to expose machine-countable checklists and generated rollups, but in practice the only rigorously-enforced invariant is base-layer (Layer 4 / Live Documentation) coverage. Layer 2 is therefore **authored-only** today.

## Document Archetypes

### Requirements & Roadmaps

Standard Layer 2 content: requirements, acceptance criteria, work items.

- Begin with a metadata block (add `External Tracker:` when mirroring to Spec-Kit tasks or GitHub Issues):
  ```markdown
  ## Metadata
  - Layer: 2
  - Requirement IDs: REQ-...
  ```
- This repo commonly uses `Requirement IDs` (see `.mdmd/layer-2/product-roadmap.mdmd.md`).
- Do **not** add a `## Generated` section in Layer 2.
- Recommended section order (flexible; optimize for clarity):
  1. `# <Layer 2 Title>`.
  2. `## Metadata`.
  3. A requirements body (commonly `## Requirements`, with `### REQ-...` subsections where applicable).
  4. Optional `## Acceptance Criteria` sections (either narrative bullets or checklists; both are acceptable).

- Checklists are optional:
  - You may use Markdown checkboxes (`- [ ]` / `- [x]`) when it helps humans track progress.
  - Do not design tooling that *requires* checkboxes in Layer 2; treat them as authoring convenience only.

- Links and hierarchy:
  - Prefer workspace-relative links.
  - Do **not** treat full closure (L1→L2→L3→L4) as a hard requirement.
  - Direct links to Layer 3/4 artefacts are allowed when they improve auditability or reader utility.

- Evidence guidance:
  - Keep evidence as curated bullets (docs, test reports, logs).
  - Avoid embedding raw git history inside narrative sections; link to durable artefacts instead when needed.
- Avoid referencing Git history directly inside authored sections; instead, capture commit evidence under `### Evidence` so tooling can keep the generated summaries clean.

### Contributor Guides

Internal documentation for maintainers and contributors — tooling, workflows, processes that external adopters don't need to know.

- Begin with a metadata block:
  ```markdown
  ## Metadata
  - Layer: 2
  - Audience: Contributors
  ```
- Recommended section order:
  1. `# <Guide Title>` — e.g., "Internal Tooling Reference"
  2. `## Metadata`
  3. Explanatory sections with `###` headings for each tool/workflow
  4. Optional `## Troubleshooting`, `## When to Use`, `## Related Docs`

- These guides are distinct from Layer 1 User Guides:
  - **Layer 1 Guides**: External adopters learning to use Live Documentation
  - **Layer 2 Guides**: Contributors learning to develop Live Documentation