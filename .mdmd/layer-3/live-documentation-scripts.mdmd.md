# Live Documentation Scripts

## Metadata

- Layer: 3
- Archetype: component
- Live Doc ID: COMP-scriptslivedocs

## Authored

### Purpose

Document the CLI toolbox that maintains Live Documentation quality—generation, linting, inspection, and system materialisation workflows invoked by both developers and CI.

### Notes

- `live-docs:generate`, `live-docs:inspect`, and `live-docs:system` share adapters that respect authored sections, ensuring regeneration never tramples human context while still keeping generated sections deterministic.
- Linting commands (`live-docs:lint`, `live-docs:find-orphans`) gate safe-commit runs by verifying authored fields, evidence sections, and cross-layer relationships before merges land.
- Headless utilities output to `AI-Agent-Workspace/tmp/**` by default so system views stay ephemeral unless explicitly promoted to Stage‑0 docs.
- Scripts double as reference implementations for extension commands—CLI parity guarantees the VS Code flows stay honest.

### Strategy

- Harden diff tooling to emit JSON diagnostics that the extension and CI can consume directly, reducing reliance on textual scrape logic.
- Continue expanding scenario packs (benchmarks, docstring drift) so `live-docs:system` snapshots reflect every high-risk subsystem before we attempt a full workspace migration.

## System References

### Components

- [scripts/live-docs/build-target-manifest.ts](../layer-4/scripts/live-docs/build-target-manifest.ts.mdmd.md)
- [scripts/live-docs/co-activation.ts](../layer-4/scripts/live-docs/co-activation.ts.mdmd.md)
- [scripts/live-docs/find-orphans.ts](../layer-4/scripts/live-docs/find-orphans.ts.mdmd.md)
- [scripts/live-docs/generate.ts](../layer-4/scripts/live-docs/generate.ts.mdmd.md)
- [scripts/live-docs/headless.ts](../layer-4/scripts/live-docs/headless.ts.mdmd.md)
- [scripts/live-docs/inspect.ts](../layer-4/scripts/live-docs/inspect.ts.mdmd.md)
- [scripts/live-docs/lint.ts](../layer-4/scripts/live-docs/lint.ts.mdmd.md)
- [scripts/live-docs/report-precision.ts](../layer-4/scripts/live-docs/report-precision.ts.mdmd.md)
- [scripts/live-docs/run-all.ts](../layer-4/scripts/live-docs/run-all.ts.mdmd.md)
- [scripts/live-docs/system.ts](../layer-4/scripts/live-docs/system.ts.mdmd.md)
- [scripts/live-docs/visualize-static.ts](../layer-4/scripts/live-docs/visualize-static.ts.mdmd.md)
- [scripts/live-docs/lib/liveDocGraph.ts](../layer-4/scripts/live-docs/lib/liveDocGraph.ts.mdmd.md)

## Evidence

- Safe-to-commit pipeline invokes these scripts in sequence; the 2025-11-19 run recorded zero lint regressions after regeneration.
- Integration benchmarks under `tests/integration/live-docs` replay CLI flows to ensure regenerated markdown matches Stage‑0 mirrors.
