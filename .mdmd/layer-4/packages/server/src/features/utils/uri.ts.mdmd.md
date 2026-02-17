# packages/server/src/features/utils/uri.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/utils/uri.ts
- Live Doc ID: LD-implementation-packages-server-src-features-utils-uri-ts
- Generated At: 2026-02-17T21:50:59.127Z

## Authored
### Purpose

Provides a server-scoped re-export of `normalizeFileUri` so every feature imports canonical URI logic through the features namespace, keeping watcher, diagnostics, and knowledge ingestion modules aligned on the same normalization contract.

### Notes

- Introduced during the URI canonicalization sweep captured in [2025-10-19 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-19.SUMMARIZED.md) after duplicate nodes surfaced in the graph store.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:50:59.127Z","inputHash":"19fe9d6277ddcee3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `normalizeFileUri` {#symbol-normalizefileuri}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/utils/uri.ts#L3)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`normalizeFileUri`](../../../../shared/src/uri/normalizeFileUri.ts.mdmd.md#symbol-normalizefileuri)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [pathReferenceDetector.test.ts](../watchers/pathReferenceDetector.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
