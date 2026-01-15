# tests/integration/vscode/suite/index.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/vscode/suite/index.ts
- Live Doc ID: LD-test-tests-integration-vscode-suite-index-ts
- Generated At: 2026-01-15T02:41:19.192Z

## Authored
### Purpose
Loads the compiled integration suites inside the VS Code harness so Mocha can execute every T0×/US× regression end to end ([harness bootstrap](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-19.md#L1960-L2040)).

### Notes
- Uses the globbed `*.test.js` bundle produced by the dedicated tsconfig so `npm run test:integration` succeeds after the harness build step was added ([harness bootstrap](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-19.md#L1960-L2040)).
- Filters out nested harness fixtures (vscode/, suite/, slopcop/) to keep the Mocha run focused on real scenarios while CLI-specific Vitest suites run separately ([integration replay](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L5200-L5280)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:19.192Z","inputHash":"4aeb7267cad93fd0"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `run` {#symbol-run}
- Type: function
- Source: [source](../../../../../../tests/integration/vscode/suite/index.ts#L5)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `mocha` - `Mocha`
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
