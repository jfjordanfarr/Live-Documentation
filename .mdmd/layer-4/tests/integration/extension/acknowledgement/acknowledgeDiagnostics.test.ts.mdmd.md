# tests/integration/extension/acknowledgement/acknowledgeDiagnostics.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/extension/acknowledgement/acknowledgeDiagnostics.test.ts
- Live Doc ID: LD-test-tests-integration-extension-acknowledgement-acknowledgediagnostics-test-ts
- Generated At: 2026-01-07T20:20:40.047Z

## Authored
### Purpose
Exercises the diagnostic acknowledgement workflow end-to-end: lead acknowledges a diagnostic → diagnostic clears until next change → acknowledgement persists across sessions in SQLite storage. Critical for validating the extension ↔ language server communication path.

### Notes
- Originally `us3/acknowledgeDiagnostics.test.ts`, relocated during Dev Day 53 (2026-01-07) test restructure
- Uses SQLite database via `better-sqlite3` to verify acknowledgement persistence
- Race condition fix (Dev Day 52): `syncRuntimeSettings()` now awaits `knowledgeFeedController.initialize()` — without this fix, test would timeout at 90s
- Pending test case "Export diagnostics includes acknowledgement metadata" was never implemented (Oct 2025 placeholder)
- Part of the **extension/acknowledgement** test category for VS Code-specific interaction tests

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-07T20:20:40.047Z","inputHash":"a87e552997fb1adf"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `better-sqlite3` - `Database`
- `node:assert` - `assert`
- `node:fs` - `existsSync`, `promises`
- `node:os` - `os`
- `node:path` - `path`
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
