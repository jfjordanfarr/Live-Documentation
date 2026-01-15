# tests/integration/vscode/runTests.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/vscode/runTests.ts
- Live Doc ID: LD-test-tests-integration-vscode-runtests-ts
- Generated At: 2026-01-15T02:41:19.190Z

## Authored
### Purpose
Launches the full VS Code integration harness against a temporary copy of `simple-workspace`, rebuilding the extension/server bundles and ensuring Electron/Node native modules stay ABI-compatible before running the suite ([TypeScript runner conversion](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-19.SUMMARIZED.md#turn-04-integration-harness-fails-to-launch-lines-500-602) · [deterministic rebuild mandate](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-08-hardening-native-rebuild-workflow-lines-4301-4850)).

### Notes
- Cloned the workspace into a temp directory starting 2025-10-21 so integration runs stop mutating tracked fixtures, verified with green `npm run test:integration` output ([temp workspace guard](../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md#turn-19-fix-integration-test-fixture-pollution-lines-4101-4585-continued)).
- On 2025-11-14 we re-enabled the local Ollama bridge by wiring `LINK_AWARE_OLLAMA_MODEL` defaults through this script, yielding real Qwen traces during end-to-end runs ([Ollama reintegration](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-14.SUMMARIZED.md#turn-14-restore-ollama-bridge-for-integration-tests-lines-3301-3600)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:19.190Z","inputHash":"0b82b3f0e8005c45"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@vscode/test-electron` - `downloadAndUnzipVSCode`, `runTests`
- `child_process` - `spawnSync`
- `fs`
- `os`
- `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
