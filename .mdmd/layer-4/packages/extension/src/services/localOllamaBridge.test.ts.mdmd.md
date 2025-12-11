# packages/extension/src/services/localOllamaBridge.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/extension/src/services/localOllamaBridge.test.ts
- Live Doc ID: LD-test-packages-extension-src-services-localollamabridge-test-ts
- Generated At: 2025-12-11T02:37:59.903Z

## Authored
### Purpose
Exercises the local Ollama bridge happy paths, config overrides, and mock fallbacks added during the Oct 29 rollout so safe-to-commit can verify the BYOK pipeline after the hoist fix in Turn 10 of [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-29.SUMMARIZED.md#turn-10-safe-to-commit-fails-on-new-ollama-test-lines-1201-1345](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-29.SUMMARIZED.md#turn-10-safe-to-commit-fails-on-new-ollama-test-lines-1201-1345).

### Notes
- Confirms workspace settings, env overrides, and deterministic mock responses behave as designed, matching the refactor summary in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1920-L1950](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L1920-L1950).
- Gained a 30 second `beforeAll` timeout on Nov 16 to mask the initial dynamic import cost and stop flaky safe-commit runs, per [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L3140-L3175](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L3140-L3175).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:37:59.903Z","inputHash":"9a57b7d2f703c151"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `vitest` - `MockInstance`, `afterEach`, `beforeAll`, `beforeEach`, `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/extension/src/services: [localOllamaBridge.ts](./localOllamaBridge.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../shared/src/index.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
