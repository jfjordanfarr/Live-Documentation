# tests/integration/clean-dist.mjs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/clean-dist.mjs
- Live Doc ID: LD-test-tests-integration-clean-dist-mjs
- Generated At: 2026-02-03T21:55:46.964Z

## Authored
### Purpose
Remove stale VS Code and server bundles before the integration harness runs so suites always load freshly built artifacts.

### Notes
- Deletes `packages/*/dist` folders produced by previous builds, preventing the harness from testing outdated code.
- Called automatically from `npm run test:integration` and the safe-commit pipeline before the VS Code harness boots.
- Keep this script aligned with workspace build outputs—add new paths here whenever packages start emitting compiled artifacts.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:46.964Z","inputHash":"50c03876a1777d94"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
