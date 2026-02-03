# packages/shared/src/live-docs/markdown.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/markdown.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-markdown-test-ts
- Generated At: 2026-02-03T21:55:40.579Z

## Authored
### Purpose
Guards the markdown renderer’s marker and provenance handling so authored sections survive regeneration without corrupting tests or lint rules.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-14-pare-duplicate-tests--fix-vitest-failures-lines-2401-2640]

### Notes
- Slimmed to focus on the rendering pipeline after the Stage‑0 rollout refactored redundant assertions; kept as a regression harness for begin/end marker behavior.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-14-pare-duplicate-tests--fix-vitest-failures-lines-2401-2640]
- Continues to validate `.md` output after the Nov 15 migration so lint and generator steps observe the same markers.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-15.SUMMARIZED.md#turn-15-shift-live-docs-to-md-outputs-lines-1401-1820]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.579Z","inputHash":"4c5ce3e91699a119"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `vitest` - `describe`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
