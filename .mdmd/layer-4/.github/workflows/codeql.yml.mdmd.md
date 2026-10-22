# .github/workflows/codeql.yml

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: .github/workflows/codeql.yml
- Generated At: 2026-10-22T00:39:32.697Z

## Authored
### Purpose
GitHub's CodeQL security analysis of the repository's JavaScript and TypeScript, run on every push to `main`, every pull request and once a week; its findings go to the repository's code-scanning alerts, not to issues.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- It holds `security-events: write` to upload its findings and only `contents: read` otherwise. Between initialising CodeQL and analysing it runs `npm ci` and `npm run build` (the engine, Explorer and generator), so a broken build fails the scan; the walkthrough at its origin said the build lets CodeQL analyse compiled output, a reason not checked since. Only JavaScript and TypeScript are analysed, so the sample programs in other languages are not scanned. The weekly run is Monday at 03:30 UTC, half an hour before `npm-audit.yml`.
- Began on 2025-12-13 with the first CI, at the owner's request for CodeQL beside Dependabot and `npm audit`; asked which does what, the agent answered that CodeQL reads the project's own code for security faults and Dependabot its dependencies ([Turns 6 and 9 of the December 13 session](../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-13.1.SUMMARIZED.md#turn-06)). Unchanged since, apart from Dependabot's bump of the action versions the same day. It gained a Live Doc on 2026-10-22, when every file began to get one except the kinds the owner settled on leaving out ([Turn 8 of the October 21 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
