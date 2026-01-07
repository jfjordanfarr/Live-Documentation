# tests/integration/core/ripple/transformRipple.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/core/ripple/transformRipple.test.ts
- Live Doc ID: LD-test-tests-integration-core-ripple-transformripple-test-ts
- Generated At: 2026-01-07T20:20:40.045Z

## Authored
### Purpose
Verifies that changes to template files ripple through transform pipelines to their generated outputs. Tests the multi-hop diagnostic propagation from source template → transform script → output config.

### Notes
- Originally `us5/transformRipple.test.ts`, relocated during Dev Day 53 (2026-01-07) test restructure
- Uses `simple-workspace` fixture with `templates/config.template.yaml` → `scripts/applyTemplate.ts` → `config/web.config` chain
- Validates that diagnostic metadata includes `depth` and `path` for ripple traceability
- Part of the **core/ripple** test category for foundational graph traversal validation

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-07T20:20:40.045Z","inputHash":"fa78508d3271f196"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:assert` - `assert`
- `vscode` - `vscode`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
