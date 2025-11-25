# packages/server/src/features/live-docs/harness/scenarios.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/harness/scenarios.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-harness-scenarios-ts
- Generated At: 2025-11-24T15:19:58.778Z

## Authored
### Purpose
Defines the curated headless harness scenarios so automated runs can copy fixture workspaces and drive the Live Docs core deterministically, as outlined in the rollout plan on 2025-11-16 ([chat log](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L717-L762)).

### Notes
- The initial Ruby, Python, and C# entries cover the multilingual fixtures we committed to exercising headlessly; the `system` flag toggles System doc materialization for scenarios that need co-activation coverage.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.778Z","inputHash":"69ce656f1565f0d4"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HeadlessHarnessScenario` {#symbol-headlessharnessscenario}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/harness/scenarios.ts#L3)

#### `HEADLESS_HARNESS_SCENARIOS` {#symbol-headless_harness_scenarios}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/harness/scenarios.ts#L18)

#### `listScenarios` {#symbol-listscenarios}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/harness/scenarios.ts#L43)

#### `getScenarioByName` {#symbol-getscenariobyname}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/harness/scenarios.ts#L47)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/config/liveDocumentationConfig` - `LiveDocumentationConfigInput` (type-only)
<!-- LIVE-DOC:END Dependencies -->
