# tests/integration/fixtures/simple-workspace/scripts/applyTemplate.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/simple-workspace/scripts/applyTemplate.ts
- Live Doc ID: LD-implementation-tests-integration-fixtures-simple-workspace-scripts-applytemplate-ts
- Generated At: 2025-12-06T22:49:55.226Z

## Authored
### Purpose
Renders the simple-workspace configuration template into concrete config files during integration tests so US1 harness runs can toggle telemetry/onboarding flags without mutating tracked fixtures <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L1508-L1532>.

### Notes
- The ripple diagnostics confirmed that edits to `templates/config.template.yaml` correctly flow through this script into `config/web.config`, keeping the fixture’s dependency graph observable for path detectors <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-23.md#L3724-L3744>.
- Continue invoking this helper via `npm run fixtures:verify` (Oct 29 run) whenever environment knobs change, ensuring rendered files stay synchronized with the template <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L5288-L5320>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:55.226Z","inputHash":"19492e4a5ca3c1fe"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `applyTemplate` {#symbol-applytemplate}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/simple-workspace/scripts/applyTemplate.ts#L4)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`, `writeFileSync`
- `node:path` - `resolve`
<!-- LIVE-DOC:END Dependencies -->
