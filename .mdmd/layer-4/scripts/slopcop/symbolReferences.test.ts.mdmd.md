# scripts/slopcop/symbolReferences.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/slopcop/symbolReferences.test.ts
- Generated At: 2026-09-28T01:00:43.755Z

## Authored
### Purpose
Guards the slug-anomaly detector with fixture-style Vitest coverage so duplicate headings and missing anchors stay observable outside the SlopCop CLI ([unit harness creation](../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/2025-10-25/2025-10-25.md#L3960-L4040)).

### Notes
- The first scenario mirrors the CLI fixture run, asserting we raise one duplicate-heading warning and two missing-anchor errors for the handcrafted docs before repairs ([fixture validation](../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/2025-10-25/2025-10-25.md#L6048-L6073)).
- The second scenario flips rule severities and ignore patterns to match the configuration knobs we introduced for the opt-in symbol audit rollout ([severity planning](../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/2025-10-25/2025-10-25.md#L4627-L4944)).
- A case of 2026-11-18 holds the audit to anchors into a markdown file it was not given: a real heading there passes, a heading that is only text inside a fence is missing, and that file's own duplicate heading and dead link are not reported; a source file's line anchor and a file that is not there are left to the other checks, and a citation of lines in that file holds while the file has that many lines ([the notes](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-anchor-audit-made-to-read-the-archive)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`symbolReferences.findSymbolReferenceAnomalies`](./symbolReferences.ts.mdmd.md#symbol-findsymbolreferenceanomalies)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
