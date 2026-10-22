# .github/dependabot.yml

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: .github/dependabot.yml
- Generated At: 2026-10-22T00:39:32.683Z

## Authored
### Purpose
Asks GitHub's Dependabot to propose updates, weekly, to the repository's npm dependencies and to the GitHub Actions its workflows use.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._

- npm updates are read from the repository root, with at most five pull requests open at once. Minor and patch updates come grouped, one pull request for development dependencies and one for production, while a major version arrives on its own; every Actions update comes in one grouped pull request. Its pull requests run `ci.yml` and `codeql.yml` through their `pull_request` triggers.
- Its pull requests were merged on GitHub through 2026-01-05, and every merge commit in the history is one of them; on 2026-03-10 the open ones were applied by hand in one commit instead (`fa27e09a`).
- Began on 2025-12-13 with the first CI. The owner asked whether Dependabot would be "spurious or unnecessary" for a repository with no other developers, developed on a single branch, and was willing to defer it; the agent recommended keeping it ([Turns 6 and 9 of the December 13 session](../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-13.1.SUMMARIZED.md#turn-06)). Its first run that day opened fourteen pull requests, each running CI, and the owner warned of the compute minutes that could burn; the groups and the limit of five, down from ten, followed the same day ([Turn 26](../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-13.1.SUMMARIZED.md#turn-26)). It gained a Live Doc on 2026-10-22, when every file began to get one except the kinds the owner settled on leaving out ([Turn 8 of the October 21 session](../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
