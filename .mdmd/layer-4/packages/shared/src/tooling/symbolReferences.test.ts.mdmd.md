# packages/shared/src/tooling/symbolReferences.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/tooling/symbolReferences.test.ts
- Generated At: 2026-09-27T23:21:31.738Z

## Authored
### Purpose
Guards the slug-anomaly detector with fixture-style Vitest coverage so duplicate headings and missing anchors stay observable outside the SlopCop CLI ([unit harness creation](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-25.md#L3960-L4040)).

### Notes
- The first scenario mirrors the CLI fixture run, asserting we raise one duplicate-heading warning and two missing-anchor errors for the handcrafted docs before repairs ([fixture validation](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-25.md#L6048-L6073)).
- The second scenario flips rule severities and ignore patterns to match the configuration knobs we introduced for the opt-in symbol audit rollout ([severity planning](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-25.md#L4627-L4944)).

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
