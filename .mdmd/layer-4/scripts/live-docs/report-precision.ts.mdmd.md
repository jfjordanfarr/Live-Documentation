# scripts/live-docs/report-precision.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/report-precision.ts
- Live Doc ID: LD-implementation-scripts-live-docs-report-precision-ts
- Generated At: 2025-11-24T15:19:59.476Z

## Authored
### Purpose
Evaluates generated Live Docs against the analyzer to calculate symbol and dependency precision/recall scores, producing `reports/benchmarks/live-docs/precision.json` so we can detect regressions in the documentation pipeline.

### Notes
First built for the Live Docs accuracy benchmark (Sep 2024) and tightened during the 2025 re-export fixes. The script mirrors the metrics enforced during `npm run safe:commit`, emitting non-zero exit codes when precision drops below 0.9 for symbols or dependency recall slips under 0.8.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:59.476Z","inputHash":"5547ce2ef7eda3a6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/config/liveDocumentationConfig` - `DEFAULT_LIVE_DOCUMENTATION_CONFIG`, `LIVE_DOCUMENTATION_FILE_EXTENSION`, `normalizeLiveDocumentationConfig`
- `@live-documentation/shared/live-docs/parse` - `parseLiveDocMarkdown`
- `glob` - `glob`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`generator.__testUtils`](../../packages/server/src/features/live-docs/generator.ts.mdmd.md#symbol-__testutils)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->
