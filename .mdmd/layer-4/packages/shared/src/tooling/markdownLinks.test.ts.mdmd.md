# packages/shared/src/tooling/markdownLinks.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/tooling/markdownLinks.test.ts
- Live Doc ID: LD-test-packages-shared-src-tooling-markdownlinks-test-ts
- Generated At: 2026-02-03T21:55:41.324Z

## Authored
### Purpose
Exercises the markdown link audit against real filesystem fixtures so the SlopCop CLI keeps catching broken local links while respecting the ignore/target rules introduced during the October 25 SlopCop hardening pass.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md §Turn 11]

### Notes
- Verifies the ignore-target patterns added alongside `slopcop.config.json`, ensuring ChatHistory and fixture exemptions never regress.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md §Turn 11]
- Confirms `findBrokenMarkdownLinks` handles workspace-absolute paths, missing definitions, and non-link generics before the CLI surfaced the suite in safe-to-commit runs on November 2.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-02.md §SlopCop: Markdown]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.324Z","inputHash":"48b98380158baee0"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `mkdirSync`, `mkdtempSync`, `rmSync`, `writeFileSync`
- `node:os` - `tmpdir`
- `node:path` - `path`
- [`markdownLinks.findBrokenMarkdownLinks`](./markdownLinks.ts.mdmd.md#symbol-findbrokenmarkdownlinks)
- `vitest` - `afterEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/tooling: [markdownLinks.ts](./markdownLinks.ts.mdmd.md), [markdownShared.ts](./markdownShared.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
