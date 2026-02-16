# packages/shared/src/inference/heuristics/webforms.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/webforms.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-webforms-ts
- Generated At: 2026-02-16T18:46:24.271Z

## Authored
### Purpose
Captures the WebForms-specific fallback logic we added while wiring the csharp-webforms benchmark so hidden-field values, code-behind partials, and Web.config appSettings all resolve to the right artifacts instead of disappearing from the AST recall runs <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L3996-L4052> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L4672-L4690>.

### Notes
- This module now lives in the modular heuristic suite created on Nov 7; new WebForms patterns (master pages, user controls) should extend this builder instead of reintroducing bespoke checks inside the orchestrator <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L760-L840> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L820-L900>.
- Keep the fixture-driven expectations in sync with `tests/integration/benchmarks/fixtures/csharp/webforms/**`; regenerate the oracle after adjusting heuristics to ensure the hidden-field → JS ripple still scores correctly <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L4028-L4052>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:46:24.271Z","inputHash":"7fafb2a451a27776"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createWebFormsHeuristic` {#symbol-createwebformsheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/webforms.ts#L24)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)

##### `createWebFormsHeuristic` — Summary
Creates a heuristic that detects ASP.NET WebForms references:
`appSettings` key lookups, `ConfigurationManager` calls, `.aspx`/`.ascx`
`Inherits` directives, and `runat="server"` `src` attributes.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`artifactLayerUtils.isImplementationLayer`](./artifactLayerUtils.ts.mdmd.md#symbol-isimplementationlayer)
- [`shared.isExternalLink`](./shared.ts.mdmd.md#symbol-isexternallink)
- [`shared.normalizePath`](./shared.ts.mdmd.md#symbol-normalizepath)
<!-- LIVE-DOC:END Dependencies -->
