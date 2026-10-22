# .github/workflows/npm-audit.yml

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: .github/workflows/npm-audit.yml
- Generated At: 2026-10-22T00:39:32.705Z

## Authored
### Purpose
A weekly check of the installed dependencies against npm's security advisories: it warns on moderate findings, fails on high or critical ones, and keeps the full report with the run.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- It runs on its schedule (Monday at 04:00 UTC) or by hand, never on a push or pull request: it reports on the dependencies as they stand, not on a change. After `npm ci`, a first `npm audit --audit-level=moderate --json` writes `npm-audit.json` and can only raise a warning; a second, `npm audit --audit-level=high`, decides the run. The report is uploaded as the `npm-audit` artifact before the failing step, so a failed run keeps it. Both passes read only npm's exit code, so an audit that fails for another reason, such as an unreachable registry, reports as findings.
- Began on 2025-12-13 with the first CI, at the owner's request. The non-blocking warning is their word: "Let's ensure that we emit a non-blocking warning on discovery of moderate vulnerabilities." ([Turn 10 of the December 13 session](../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-13.1.SUMMARIZED.md#turn-10)). Since then only the versions of the actions it uses have changed. It gained a Live Doc on 2026-10-22, when every file began to get one except the kinds the owner settled on leaving out ([Turn 8 of the October 21 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
