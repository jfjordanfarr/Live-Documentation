# packages/shared/src/tooling/githubSluggerRegex.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/githubSluggerRegex.ts
- Generated At: 2026-09-27T23:21:31.656Z

## Authored
### Purpose
Packages the vendored GitHub slug sanitiser regex so our slugger matches exactly what the upstream library emits, keeping Live Doc anchors identical to GitHub and VS Code behaviour for multilingual headings.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-32-vendored-github-slugger]

### Notes
- Pulled in alongside the internal `GitHubSlugger` port during the October 25 documentation-alignment push to eliminate dependency on the ESM-only upstream package.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-32-vendored-github-slugger]
- Verified repeatedly while tuning doc-link anchors for SlopCop on November 7, ensuring unicode headings slug to `comp003--heuristic-suite` and similar real-world cases.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md]

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GITHUB_SLUG_REMOVE_PATTERN` {#symbol-github_slug_remove_pattern}
- Type: const
- Source: [source](../../../../../../packages/shared/src/tooling/githubSluggerRegex.ts#L13)

##### `GITHUB_SLUG_REMOVE_PATTERN` — Summary
Character-removal pattern matching GitHub Slugger's build output.

Applied during heading-to-slug conversion to strip punctuation, control characters,
and Unicode symbols that GitHub's Markdown renderer removes when generating
anchor IDs. Extracted as a standalone constant so both `githubSlugger.ts` and
any future consumers share the exact same pattern without depending on the
`github-slugger` npm package at runtime.

Created 2025-10-25 for the SlopCop symbol auditor.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
