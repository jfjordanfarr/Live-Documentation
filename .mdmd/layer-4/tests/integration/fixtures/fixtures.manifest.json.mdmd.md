# tests/integration/fixtures/fixtures.manifest.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/fixtures/fixtures.manifest.json
- Live Doc ID: LD-asset-tests-integration-fixtures-fixtures-manifest-json
- Generated At: 2026-01-15T17:00:39.617Z

## Authored
### Purpose
Authoritative manifest describing every benchmark fixture consumed by integration and verification runs.

### Notes
- Lists fixture identifiers, repository provenance, include/exclude globs, and expected analyzer modes; CLI tooling expands this manifest before benchmarks execute.
- Safe-commit and `npm run verify -- --report` read this file to determine which fixtures to clone and validate, so edits here directly change benchmark coverage.
- Update manifest entries together with Layer‑3 benchmark documentation and regenerate Stage‑0 Live Docs to capture new languages or repository revisions.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T17:00:39.617Z","inputHash":"eaa6124859553915"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`slopcop.config`](./slopcop-assets/workspace/slopcop.config.json.mdmd.md)
- [`slopcop.config`](./slopcop-symbols/workspace/slopcop.config.json.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
