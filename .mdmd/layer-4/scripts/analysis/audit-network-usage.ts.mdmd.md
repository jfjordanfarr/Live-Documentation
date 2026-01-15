# scripts/analysis/audit-network-usage.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/analysis/audit-network-usage.ts
- Live Doc ID: LD-implementation-scripts-analysis-audit-network-usage-ts
- Generated At: 2026-01-15T02:41:18.840Z

## Authored
### Purpose
Static analysis script that scans the codebase for network-related API usage (fetch, http/https, socket, etc.), providing auditable evidence that Live Documentation only makes network requests through the safeFetch wrapper which enforces localhost-only connections.

### Notes
- Created 2025-12-15 (Dev Day 46) as part of the network security hardening initiative
- Integrated into CI pipeline as `npm run audit:network` with blocking exit codes
- Patterns scanned: `fetch()`, `http.request/get`, `createServer`, `net.Socket`, third-party clients (axios, got, node-fetch)
- Verdicts: `safe` (known-safe), `allowed` (browser-only/test code), `review` (needs manual inspection)
- SAFE_PATTERNS allowlist covers safeFetch itself, tests, client-side browser code, and markdown/json data files
- Exit code 1 on unaccounted network usage forces pipeline failure until resolved

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:18.840Z","inputHash":"10c30ebf6feb153b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:fs` - `promises`
- `node:path`
<!-- LIVE-DOC:END Dependencies -->
