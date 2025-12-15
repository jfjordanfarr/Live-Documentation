# scripts/live-docs/lint.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/lint.ts
- Live Doc ID: LD-implementation-scripts-live-docs-lint-ts
- Generated At: 2025-12-15T00:38:07.467Z

## Authored
### Purpose
Checks every staged Live Doc for structural markers, section completeness, evidence waivers, and relative-link hygiene so the workspace fails fast before docs drift from the conventions consumed by the Live Docs graph.

### Notes
Introduced alongside the first Live Docs CLI (Aug 2024) and expanded repeatedly through the MDMD migration. In Nov 2025 we added authored-section warnings to surface pending “Purpose/Notes” placeholders without blocking commits, keeping the guardrail lightweight while nudging documentation quality forward.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:07.467Z","inputHash":"539ec7c5c6db10a5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.LiveDocumentationEvidenceStrictMode`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationevidencestrictmode)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`core.hasMeaningfulAuthoredContent`](../../packages/shared/src/live-docs/core.ts.mdmd.md#symbol-hasmeaningfulauthoredcontent)
<!-- LIVE-DOC:END Dependencies -->
