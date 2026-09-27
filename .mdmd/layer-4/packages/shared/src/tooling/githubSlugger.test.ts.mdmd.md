# packages/shared/src/tooling/githubSlugger.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/tooling/githubSlugger.test.ts
- Generated At: 2026-09-27T23:21:31.634Z

## Authored
### Purpose
Locks in the vendored slugger’s behaviour against GitHub’s casing, unicode, and duplicate rules so Live Doc anchors and CLI outputs stay deterministic across the workspace.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-32-vendored-github-slugger]

### Notes
- Covers stateless `slug`, stateful `GitHubSlugger`, and `slugWithContext` so regressions surface before doc tooling diverges from GitHub.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md]
- Reinforced during the November 7 anchor audit that reproduced real headings like “COMP-003 – Heuristic Suite,” ensuring unicode deduping remains correct.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md]

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`GitHubSlugger`](./githubSlugger.ts.mdmd.md#symbol-githubslugger)
- [`githubSlugger.createSlugger`](./githubSlugger.ts.mdmd.md#symbol-createslugger)
- [`githubSlugger.slug`](./githubSlugger.ts.mdmd.md#symbol-slug)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
