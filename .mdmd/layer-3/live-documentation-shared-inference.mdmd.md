# Live Documentation Shared Inference

## Metadata

- Layer: 3
- Archetype: component
- Live Doc ID: COMP-shared-inference

## Authored

### Purpose

Summarise the inference engines and heuristics that infer links, resolve targets, and calibrate LLM suggestions for Live Documentation.

### Notes

- Link inference orchestrates multi-hop rule evaluation across implementation, documentation, and benchmark artifacts, generating the edges Stage‑0 regeneration consumes.
- Fallback inference guards against analyzer blind spots by folding in pattern-based heuristics and docstring cues when static analysis comes up short.
- Relationship rule and symbol profile evaluators enforce Layer‑2↔Layer‑3↔Layer‑4 chains, emitting actionable diagnostics when coverage drifts.
- LLM extractors sit behind feature flags, producing candidate relationships with calibration metadata so only high-confidence edges feed the graph.

### Strategy

- Promote symbol profile evaluation into enforce mode once we author Layer‑3 coverage for remaining components.
- Iterate on calibration curves using the US5 ingestion fixtures so we can safely widen LLM participation without spamming low-quality links.

## System References

### Components

- [packages/shared/src/inference/linkInference.ts](../layer-4/packages/shared/src/inference/linkInference.ts.mdmd.md)
- [packages/shared/src/inference/fallbackInference.ts](../layer-4/packages/shared/src/inference/fallbackInference.ts.mdmd.md)

## Evidence

- `npm run graph:audit -- --json` exercises rule chains and symbol profiles, producing gap reports consumed by the diagnostics pipeline.
