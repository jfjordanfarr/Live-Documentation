---
applyTo: ".mdmd/layer-4/**/*.mdmd.md"
---

# Layer 4 Live Documentation Base Rules

Default storage for generated Layer‑4 Live Docs is `/.mdmd/layer-4/`; adjust configuration only when adopters need a different mirror root.

- Layer 4 files are **Live Documentation mirrors**: every markdown entry represents exactly one source asset (implementation, test, fixture, or asset) and preserves authored context while exposing generated program facts.
- Canonical layout:
  1. `# <Title>` — use the source artifact name (for example, `packages/shared/src/live-docs/markdown.ts`).
  2. `## Metadata` — bullet list containing at minimum `Layer: 4`, `Archetype: implementation|test|asset|stub`, `Code Path: <workspace-relative path>`, `Live Doc ID: LD-…`, and `Generated At: <ISO timestamp>` if emitted by the tool.
  3. `## Authored` — fixed subsection order:
     - `### Purpose` (required) – justify why the asset exists.
     - `### Notes` (optional) – durable insights; omit the heading if there is nothing to add.
  4. `## Generated` — tooling replaces content between paired markers; never hand-edit these regions.
- Generated boundaries **must** use the HTML comment markers already standardised by the generator:
  ```markdown
  <!-- LIVE-DOC:BEGIN Public Symbols -->
  ### Public Symbols
  ...auto-generated content...
  <!-- LIVE-DOC:END Public Symbols -->
  ```
- Required generated sections for every archetype: `### Public Symbols` and `### Dependencies`.  Additional sections (for example, `### Observed Evidence`, `### Targets`, `### Supporting Fixtures`) are controlled by archetype-specific instructions (`mdmd.layer4.*.instructions.md`).  When multiple sections are present, follow the order defined by those files.
- The generator may prepend a provenance marker (`<!-- LIVE-DOC:PROVENANCE … -->`) before the first generated section; keep it intact.
- Optional human-owned appendices must appear **after** the generated block.  Do not mix manual notes inside generated sections.
- **Authored sections must never use `##` (H2) headings**; the `##` level is reserved for the canonical structural sections (`## Metadata`, `## Authored`, `## Generated`).  Use `###` or deeper headings within `## Authored` for any custom subsections.
- Use workspace-relative Markdown links throughout the document so tooling can resolve references offline.
- When a generated section has no data, emit `_No data recorded yet_` (or a similarly explicit placeholder).  Mention any intentional waivers in `### Notes`.
- Keep content ASCII unless the underlying artifact demands Unicode (for example, identifiers).  Trim trailing whitespace inside generated sections to minimise diff churn.

## Archetype Guidance

### Implementation

- Generated sections must appear in this order (when present): `### Public Symbols`, `### Dependencies`, `### Observed Evidence`, then any optional metadata sections (for example, `### Co-Activation Signals`, `### Referenced By`) listed alphabetically after `Observed Evidence`.
- `Observed Evidence` lists every test Live Doc referencing this implementation. If no evidence exists, begin with `_No automated evidence found_` and include an `<!-- evidence-waived: reason -->` comment; document the waiver rationale in the authored `### Notes` section.
- Keep `Public Symbols` focused on exported surface area. Include the signature, optional docstring summary, and a workspace-relative link to the source definition.
- `Dependencies` should group first-order outbound relationships by file path, adding symbol anchors when available to keep graph edges precise.
- If you need temporary human notes (migration TODOs, caveats), place them after the generated block in the authored appendix.

### Test

- Generated section order: `### Public Symbols`, `### Targets`, `### Supporting Fixtures`.
- Do **not** surface `Observed Evidence` in test docs; relationships flow from implementations back to tests via the graph.
- Use `### Targets` to enumerate each implementation doc and symbol exercised by the test. When a test is scaffolded and has no targets, leave `_No targets recorded yet_` and explain the status in `### Notes`.
- `### Notes` should describe the behavioural coverage intention (integration, regression, acceptance, etc.) so future reviewers understand scope.
- Reference fixtures, mock servers, and helper modules under `### Supporting Fixtures` to keep cross-links navigable.

### Asset

- Treat asset docs as curated exceptions. Prefer linking to assets from implementation/test docs; only maintain standalone asset Live Docs when durable metadata (ownership, provenance, update playbook) is required.
- Generated sections follow the base ordering: `### Public Symbols` then `### Dependencies`. Use `_Not applicable_` when there is nothing to report and avoid adding additional generated sections such as "Observed Evidence" or "Consumers".
- Use `### Dependencies` strictly for assets consumed by this artifact (for example, a sprite referencing a stylesheet). Downstream consumers surface automatically from other docs.
- Capture orientation in the authored block: why the asset exists, how it should be updated, maintenance location, and whether variants live elsewhere.
- When the canonical asset lives outside the repo (for example, a CDN), document the reference in `### Notes` and add an inline comment explaining why no local dependency is listed.