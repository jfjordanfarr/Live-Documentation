# packages/extension/src/testing/testHooks.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/testing/testHooks.ts
- Live Doc ID: LD-implementation-packages-extension-src-testing-testhooks-ts
- Generated At: 2026-02-03T21:55:35.516Z

## Authored
### Purpose
Provides swappable VS Code window APIs so command tests can inject deterministic quick-pick and message handlers, an isolation hook created while unlocking automation in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-07-docs-first-test-hook-infrastructure-lines-1181-1460](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-07-docs-first-test-hook-infrastructure-lines-1181-1460).

### Notes
`resolveWindowApis` feeds both the Inspect Symbol Neighbors and Analyze/Export command suites—see [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-27.md#L4988-L5034](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-27.md#L4988-L5034)—so keep the stub surface aligned with whichever VS Code prompts the commands exercise (quick picks, information/error messaging, diagnostics actions).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:35.516Z","inputHash":"781bf8a07fb3f648"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `resolveWindowApis` {#symbol-resolvewindowapis}
- Type: function
- Source: [source](../../../../../../packages/extension/src/testing/testHooks.ts#L21)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `vscode`
<!-- LIVE-DOC:END Dependencies -->
