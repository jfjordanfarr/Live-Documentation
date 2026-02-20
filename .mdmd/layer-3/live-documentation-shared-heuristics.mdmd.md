# Live Documentation Shared Heuristics

## Metadata

- Layer: 3
- Archetype: component
- Live Doc ID: COMP-shared-livedocs-heuristics

## Authored

### Purpose

Describe heuristic helpers that infer dependencies when static analysis is insufficient—currently focused on DOM traversal for web assets.

### Notes

- DOM heuristics walk HTML and script tags to attach assets, stylesheets, and inline scripts to their Live Doc mirrors when analyzers lack coverage.
- Heuristics are intentionally opt-in; they decorate deterministic analyzer output while recording provenance so downstream tooling understands the confidence level.
- We log heuristic matches during regeneration to tighten benchmarks and catch regressions when web asset structures change.

### Strategy

- Expand the heuristics library to cover data file references and configuration-driven dependencies (appsettings, JSON manifests).
- Surface low-confidence heuristic matches for manual review before they reach Observed Evidence sections.

## System References

### Components

- [packages/shared/src/live-docs/heuristics/dom.ts](../layer-4/packages/shared/src/live-docs/heuristics/dom.ts.mdmd.md)

## Evidence

- Webforms and SPA fixtures under `tests/integration/fixtures/**` exercise DOM heuristics, proving evidence wiring across HTML/JS assets.
- Benchmark accuracy reports capture precision/recall for heuristics relative to curated expectations.
