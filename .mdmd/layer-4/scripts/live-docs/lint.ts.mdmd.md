# scripts/live-docs/lint.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/lint.ts
- Live Doc ID: LD-implementation-scripts-live-docs-lint-ts
- Generated At: 2025-11-24T15:19:59.466Z

## Authored
### Purpose
Checks every staged Live Doc for structural markers, section completeness, evidence waivers, and relative-link hygiene so the workspace fails fast before docs drift from the conventions consumed by the Live Docs graph.

### Notes
Introduced alongside the first Live Docs CLI (Aug 2024) and expanded repeatedly through the MDMD migration. In Nov 2025 we added authored-section warnings to surface pending “Purpose/Notes” placeholders without blocking commits, keeping the guardrail lightweight while nudging documentation quality forward.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:59.466Z","inputHash":"3231aab0e73f33aa"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/config/liveDocumentationConfig` - `DEFAULT_LIVE_DOCUMENTATION_CONFIG`, `LIVE_DOCUMENTATION_FILE_EXTENSION`, `LiveDocumentationEvidenceStrictMode`, `normalizeLiveDocumentationConfig`
- `@live-documentation/shared/live-docs/core` - `hasMeaningfulAuthoredContent`
- `glob` - `glob`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
<!-- LIVE-DOC:END Dependencies -->
