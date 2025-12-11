# packages/extension/src/diagnostics/dependencyQuickPick.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/extension/src/diagnostics/dependencyQuickPick.test.ts
- Live Doc ID: LD-test-packages-extension-src-diagnostics-dependencyquickpick-test-ts
- Generated At: 2025-12-11T02:37:59.828Z

## Authored
### Purpose
Locks down the dependency quick pick helpers—`describeEdgePath`, `ParsedEdge`, and the Zod validator—so T039’s UI logic stays deterministic, as captured in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L1400-L1520](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L1400-L1520).

### Notes
- Uses a lightweight `vscode` mock to run under Vitest and participates in the lint/unit/build gate that preceded the quick-pick commit; see [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L1400-L1520](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L1400-L1520).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:37:59.828Z","inputHash":"38ac2aa21b6e659a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dependencyQuickPick.InspectDependenciesResultValidator`](./dependencyQuickPick.ts.mdmd.md#symbol-inspectdependenciesresultvalidator)
- [`dependencyQuickPick.ParsedEdge`](./dependencyQuickPick.ts.mdmd.md#symbol-parsededge)
- [`dependencyQuickPick.describeEdgePath`](./dependencyQuickPick.ts.mdmd.md#symbol-describeedgepath)
- `vitest` - `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/extension/src/diagnostics: [dependencyQuickPick.ts](./dependencyQuickPick.ts.mdmd.md)
- packages/extension/src/shared: [artifactSchemas.ts](../shared/artifactSchemas.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../shared/src/index.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
