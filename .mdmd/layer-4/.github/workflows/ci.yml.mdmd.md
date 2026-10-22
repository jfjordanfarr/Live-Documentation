# .github/workflows/ci.yml

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: .github/workflows/ci.yml
- Generated At: 2026-10-22T00:39:32.690Z

## Authored
### Purpose
The check GitHub Actions runs on every pull request and every push to `main`: a clean install, then `npm run ci-check`, the repository's pre-commit chain in its CI form.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- `ci-check` is `scripts/safe-to-commit.mjs --skip-git-status --check-live-docs`. It checks that the committed Live Docs match the source without rewriting them and lints them, then runs `verify` (ESLint, the build, the tests' type-check, the unit and integration suites, documentation link enforcement) and the three SlopCop audits. Playwright is left out on purpose: the owner runs the full suite locally with `npm run safe:commit -- --e2e`, and keeps the chain without it "so that we can do the full safe commit headlessly in the github pipeline" ([Turn 8 of the September 30 session](../../../../AI-Agent-Workspace/ChatHistory/2026/09/2026-09-30.2.record.md#turn-8)).
- The checkout takes the whole history (`fetch-depth: 0`) because the history tests read this repository's own renames of September 2026. A newer push to the same branch or pull request cancels the run in progress. The `pull_request` trigger was kept for Dependabot's pull requests, so that an update is checked before it is merged ([Turn 11 of the December 13 session](../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-13.1.SUMMARIZED.md#turn-11)). The [repository's board](../../../layer-3/board.mdmd.md) declares this wiring by hand, `ci-workflow` to `scripts` over `npm run ci-check`, as an imagined thing until workflow files are read as a source.
- Began on 2025-12-13 as the repository's first CI, when the owner asked for a pipeline that "Carries out the checks in `npm run safe:commit` to the best of our ability" ([Turn 6 of the December 13 session](../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-13.1.SUMMARIZED.md#turn-06)). It ran the VS Code integration tests under a virtual display until that harness retired on 2026-09-27. On 2026-10-19 it lost a Rollup install that a fresh Linux install proved obsolete, and a CLI packing check that exercised no executable, the owner keeping CLI delivery separate ([Turns 16 and 17 of the October 19 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-19.1.SUMMARIZED.md#turn-16)). It gained a Live Doc on 2026-10-22, when every file began to get one except the kinds the owner settled on leaving out ([Turn 8 of the October 21 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
