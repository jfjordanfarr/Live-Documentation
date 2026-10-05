# packages/engine/src/tooling/githubSlugger.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/tooling/githubSlugger.test.ts
- Generated At: 2026-10-05T17:11:04.591Z

## Authored
### Purpose
Checks the vendored slugger against GitHub-compatible casing, Unicode, punctuation and duplicate-heading behavior so provenance links and generated anchors remain stable.

### Notes
- Covers stateless `slug`, stateful `GitHubSlugger`, and `slugWithContext`. Dates and mixed-script names retain literal hyphens; punctuation from colon through at-sign is removed; `a-b` and `ab` remain distinct headings.
- The punctuation expectations come from github-slugger 2.0.0, rather than copying the local implementation's output. The [September 30 account](../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-30.2.SUMMARIZED.md#turn-5) links the upstream source and records the regression. See the [original vendoring account](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-32-vendored-github-slugger-lines-50015160) for historical context.

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
- [`githubSlugger.slugText`](./githubSlugger.ts.mdmd.md#symbol-slugtext)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
