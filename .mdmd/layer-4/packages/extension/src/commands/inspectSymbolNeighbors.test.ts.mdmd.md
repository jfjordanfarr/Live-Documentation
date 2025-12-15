# packages/extension/src/commands/inspectSymbolNeighbors.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/extension/src/commands/inspectSymbolNeighbors.test.ts
- Live Doc ID: LD-test-packages-extension-src-commands-inspectsymbolneighbors-test-ts
- Generated At: 2025-12-15T00:38:05.861Z

## Authored
### Purpose
Exercises the symbol neighbor command through the extension test hooks, stubbing VS Code window APIs so the quick pick can be driven deterministically while asserting the parsed neighbor payloads returned by `INSPECT_SYMBOL_NEIGHBORS_REQUEST`; see [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-29-stub-infrastructure--proxy-discovery-lines-4701-5600](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-29-stub-infrastructure--proxy-discovery-lines-4701-5600).

### Notes
- The suite patches `vscode.window.showQuickPick`/`showInformationMessage` via `Reflect.set` and verifies the overrides before exercising the command, eliminating the manual timeout called out at [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-23.md#L5240-L5264](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-23.md#L5240-L5264).
- Command automation now runs inside `npm run verify`, which completed cleanly after commit 558781b landed per [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L2880-L2944](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L2880-L2944).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:05.861Z","inputHash":"c6c3e09f8314c87f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`inspectSymbolNeighbors.ParsedInspectSymbolNeighborsResult`](./inspectSymbolNeighbors.ts.mdmd.md#symbol-parsedinspectsymbolneighborsresult) (type-only)
- [`vscodeMock.SharedVscodeMock`](../testUtils/vscodeMock.ts.mdmd.md#symbol-sharedvscodemock)
- [`vscodeMock.createVscodeMock`](../testUtils/vscodeMock.ts.mdmd.md#symbol-createvscodemock)
- [`index.InspectSymbolNeighborsParams`](../../../shared/src/index.ts.mdmd.md#symbol-inspectsymbolneighborsparams) (type-only)
- `vitest` - `afterAll`, `beforeAll`, `beforeEach`, `describe`, `expect`, `it`, `vi`
- `vscode` - `vscode` (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/extension/src/commands: [inspectSymbolNeighbors.ts](./inspectSymbolNeighbors.ts.mdmd.md)
- packages/extension/src/shared: [artifactSchemas.ts](../shared/artifactSchemas.ts.mdmd.md)
- packages/extension/src/testUtils: [vscodeMock.ts](../testUtils/vscodeMock.ts.mdmd.md)
- packages/extension/src/testing: [testHooks.ts](../testing/testHooks.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../shared/src/index.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
