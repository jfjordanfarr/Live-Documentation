# scripts/doc-tools/combine-summaries.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/doc-tools/combine-summaries.ts
- Live Doc ID: LD-implementation-scripts-doc-tools-combine-summaries-ts
- Generated At: 2025-11-16T22:34:13.711Z

## Authored
### Purpose
Concatenate monthly `*.SUMMARIZED.md` transcripts into a single review stream so we can rehydrate long-running context (or export it) without hand-stitching files ([monthly compilation run](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L552-L568)).

### Notes
- Introduced 2025-11-16 to speed up autosummarisation audits; the first invocations emitted combined October/November histories into `AI-Agent-Workspace/tmp/combined-history-*.md` for spot-checking ([initial usage](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L553-L582)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-16T22:34:13.711Z","inputHash":"861a0c991b83cbaa"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->
