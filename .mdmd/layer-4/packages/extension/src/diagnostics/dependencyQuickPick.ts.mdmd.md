# packages/extension/src/diagnostics/dependencyQuickPick.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/diagnostics/dependencyQuickPick.ts
- Live Doc ID: LD-implementation-packages-extension-src-diagnostics-dependencyquickpick-ts
- Generated At: 2026-01-17T18:11:29.202Z

## Authored
### Purpose
Implements the T039 dependency inspection quick pick so the extension can call `INSPECT_DEPENDENCIES_REQUEST`, render ripple paths, and let reviewers inspect callers/callees from VS Code, per [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L1573-L1605](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L1573-L1605).

### Notes
- Refactored on Oct 23 to lean on the shared Zod schemas and to align with the symbol-neighbor work, captured in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-23.md#L2700-L2790](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-23.md#L2700-L2790).
- The same change set validated lint, unit, and integration runs (`npm run lint`, `npm run test:unit`, `npm run test:integration`), ensuring the quick pick stays regression-tested; see [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L1500-L1568](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L1500-L1568).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-17T18:11:29.202Z","inputHash":"580f821d880e943e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `registerDependencyQuickPick` {#symbol-registerdependencyquickpick}
- Type: function
- Source: [source](../../../../../../packages/extension/src/diagnostics/dependencyQuickPick.ts#L20)
- Returns: `vscode.Disposable`
- Parameters: `client`: `LanguageClient`

#### `DependencyQuickPickController` {#symbol-dependencyquickpickcontroller}
- Type: class
- Source: [source](../../../../../../packages/extension/src/diagnostics/dependencyQuickPick.ts#L31)

#### `ParsedEdge` {#symbol-parsededge}
- Type: type
- Source: [source](../../../../../../packages/extension/src/diagnostics/dependencyQuickPick.ts#L157)
- Returns: `z.infer`

#### `describeEdgePath` {#symbol-describeedgepath}
- Type: function
- Source: [source](../../../../../../packages/extension/src/diagnostics/dependencyQuickPick.ts#L159)
- Parameters: `edge`: [`ParsedEdge`](#symbol-parsededge)

#### `InspectDependenciesResultValidator` {#symbol-inspectdependenciesresultvalidator}
- Type: const
- Source: [source](../../../../../../packages/extension/src/diagnostics/dependencyQuickPick.ts#L176)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifactSchemas.KnowledgeArtifactSchema`](../shared/artifactSchemas.ts.mdmd.md#symbol-knowledgeartifactschema)
- [`artifactSchemas.LinkRelationshipKindSchema`](../shared/artifactSchemas.ts.mdmd.md#symbol-linkrelationshipkindschema)
- [`dependencies.INSPECT_DEPENDENCIES_REQUEST`](../../../shared/src/contracts/dependencies.ts.mdmd.md#symbol-inspect_dependencies_request)
- [`dependencies.InspectDependenciesParams`](../../../shared/src/contracts/dependencies.ts.mdmd.md#symbol-inspectdependenciesparams)
- `vscode`
- `vscode-languageclient/node` - `LanguageClient`
- `zod` - `z`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [dependencyQuickPick.test.ts](./dependencyQuickPick.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
