# Live Documentation Shared Analysis

## Metadata
- Layer: 3
- Archetype: component
- Live Doc ID: COMP-shared-livedocs-analysis

## Authored
### Purpose
Describe shared analytics that operate on Live Documentation data, including co-activation clustering that highlights correlated file edits and evidence hot-spots.

### Notes
- Co-activation pipelines crunch Stage‑0 mirrors and historical telemetry to suggest related artifacts, powering the “what else will this touch?” narrative.
- Analysis helpers emit summaries consumed by the extension status view and future dashboards, giving maintainers a ranked list of docs needing review.
- Because analytics depend on deterministic mirrors, they run after regeneration finishes and persist results to temp locations until explicitly published.

### Statistical Methodology (Updated 2026-01-17)
- **Degree-Corrected Configuration Model**: Replaces naive uniform edge probability with $E[edge(i,j)] = d_i \cdot d_j / 2E$, preventing hub nodes from creating false-positive clusters.
- **Symbol-Level Edge Counting**: Each symbol import counts as a separate edge (MEME-style), so files importing many symbols have proportionally higher connectivity weight.
- **Poisson Tail Test**: Computes significance using Poisson approximation when expected counts are small, with log-space computation for numerical stability.
- **Benjamini-Hochberg Correction**: Controls false discovery rate across multiple hypothesis tests.

See [Co-Activation Clustering](./co-activation-clustering.mdmd.md) for full methodology details.

### Strategy
- Extend clustering to incorporate benchmark deltas and docstring drift signals so adoption dashboards can prioritise root causes.
- Explore streaming variants that update co-activation insights after each regeneration instead of batch refreshes.
- Refine sub-cluster detection for hierarchical architecture discovery.

## System References
### Components
- [packages/shared/src/live-docs/analysis/coActivation.ts](../layer-4/packages/shared/src/live-docs/analysis/coActivation.ts.mdmd.md)

### Related Architecture
- [Co-Activation Clustering](./co-activation-clustering.mdmd.md) — Detailed statistical methodology

## Evidence
- `npm run live-docs:co-activation -- --config .live-docs.config.json` regenerates `data/live-docs/co-activation.json`.
- Dev Day 61 (2026-01-17): Implemented degree-corrected model; positive control (benchmark fixtures) detected at 3.42x enrichment, p < 10⁻¹³.
- `npm run live-docs:system -- --config .live-docs.config.json` output drives manual audits of cluster accuracy; keep snapshots under `AI-Agent-Workspace/tmp/system-cli-output` for reference.
