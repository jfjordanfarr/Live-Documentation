---
applyTo: ".mdmd/layer-3/**/*.mdmd.md"
---

# Layer 3 MDMD Conventions

Layer 3 documents stored under `.mdmd/layer-3/` are curated, human-authored architecture references for how subsystems collaborate.

Layer 3 is intentionally a **work in progress** in this repo: we have experimented with multiple approaches (including heavily edited derivatives of System materializations), and we expect the “right” format to evolve as our System/CLI materialized views improve.

Layer 3 can be informed by Layer 4 Live Docs and on-demand System materializations, but we do **not** enforce “strict closure” (every Layer 4 doc must be linked from Layer 3, etc.). Treat Layer 3 as a set of readable, maintainable narratives—not a mechanically complete index.

System views generated under `.live-documentation/system/` remain **ephemeral** and should never be committed unless explicitly promoted.

- Start with the repo-standard metadata block:
  ```markdown
  ## Metadata
  - Layer: 3
  - Component IDs: COMP-...
  ```

- Structure is flexible.
  - Existing Layer 3 docs often use sections like `## Components`, `## Responsibilities`, `## Interfaces`, and `## Evidence`. This is acceptable and preferred when it improves readability.
  - Today, Layer 3 should be treated as **authored-only by default**.
  - A future `## Generated` section is permitted only as an explicit, opt-in experiment once we can reliably materialize readable architecture output from the base layer (Layer 4 Live Documentation). If introduced later, it must be clearly labeled as generated, mechanically reproducible, and safe to omit.

- Linking guidance:
  - Prefer linking to Layer 4 Live Docs when referring to implementation details, but linking to raw source is allowed when it improves clarity.
  - Use workspace-relative links.

- System references (optional):
  - If a System CLI output informed the narrative, prefer recording the command invocation (and optionally a timestamp) rather than pasting raw generated content.

- If a `## Generated` section is introduced in the future (opt-in), it must never become a hard requirement for Layer 3 correctness; Layer 3 must remain readable and useful with authored narrative alone.

- Keep identifiers stable to avoid churn in cross-doc references.