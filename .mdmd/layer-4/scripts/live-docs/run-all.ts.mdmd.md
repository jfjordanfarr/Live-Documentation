# scripts/live-docs/run-all.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/run-all.ts
- Live Doc ID: LD-implementation-scripts-live-docs-run-all-ts
- Generated At: 2026-02-03T21:55:41.934Z

## Authored
### Purpose
Orchestrates the Live Documentation pipeline (generate, then lint) so contributors can run the same staged flow locally that `npm run livedocs` executes inside `safe:commit`.

### Notes
Created during the Windows CLI migration (Oct 2025) to replace ad-hoc shell chains. The script consumes its own stage-skip flags and forwards every other argument to `generate.ts`; lint receives only the configuration flags.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.934Z","inputHash":"6c403333d5b5b26c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- `node:url` - `pathToFileURL`
<!-- LIVE-DOC:END Dependencies -->
