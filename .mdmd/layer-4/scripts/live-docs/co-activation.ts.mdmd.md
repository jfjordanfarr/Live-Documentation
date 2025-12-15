# scripts/live-docs/co-activation.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/co-activation.ts
- Live Doc ID: LD-implementation-scripts-live-docs-co-activation-ts
- Generated At: 2025-12-15T00:38:07.440Z

## Authored
### Purpose
Produces the co-activation graph that correlates implementation files through shared dependencies and test coverage, giving the diagnostics engine weighted hints about ripple risk.

### Notes
Initially written for the Live Docs “Ripple Intelligence” experiments (mid‑2024). It still consumes legacy Stage‑0 docs until the last consumers migrate, which is why it keeps the Stage‑0 loader alongside the modern target manifest.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:07.440Z","inputHash":"ec5e33e34425e80c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`docLoader.loadStage0Docs`](../../packages/server/src/features/live-docs/stage0/docLoader.ts.mdmd.md#symbol-loadstage0docs)
- [`manifest.loadTargetManifest`](../../packages/server/src/features/live-docs/targets/manifest.ts.mdmd.md#symbol-loadtargetmanifest)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`coActivation.buildCoActivationReport`](../../packages/shared/src/live-docs/analysis/coActivation.ts.mdmd.md#symbol-buildcoactivationreport)
- [`coActivation.serializeCoActivationReport`](../../packages/shared/src/live-docs/analysis/coActivation.ts.mdmd.md#symbol-serializecoactivationreport)
- [`types.Stage0DocLogger`](../../packages/shared/src/live-docs/types.ts.mdmd.md#symbol-stage0doclogger) (type-only)
<!-- LIVE-DOC:END Dependencies -->
