# scripts/analysis/tech-debt-detector.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/analysis/tech-debt-detector.ts
- Live Doc ID: LD-implementation-scripts-analysis-tech-debt-detector-ts
- Generated At: 2025-12-18T00:59:19.177Z

## Authored
### Purpose
Standalone CLI script that surfaces technical debt heuristics: files exceeding line-count thresholds (>1000 lines, default) and stale files unchanged for extended periods (>30 days, default). Provides actionable warnings for large files where LLM edit accuracy degrades, and informational notices for potentially orphaned code.

### Notes
- Created 2025-12-17 (Dev Day 48) as a pivot after multi-hop column rendering was reverted due to architectural debt in the 1834-line `index.ts`
- Non-blocking by design: always exits 0 to keep the safe:commit pipeline informational rather than gated
- Integrated into `npm run safe:commit` with `--stale-limit 10` to surface the top 10 stale files
- CLI flags: `--json` for automation, `--skip-stale` to omit the stale report, `--stale-limit N` to cap output
- Large file allowlist constant supports suppressing known-large but acceptable files
- Immediately validated its own value by surfacing `explorer/client/index.ts` as the largest codebase file

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-18T00:59:19.177Z","inputHash":"634bfa01b587b4f5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execSync`
- `node:fs` - `fs`
- `node:path` - `path`
- `node:process` - `process`
<!-- LIVE-DOC:END Dependencies -->
