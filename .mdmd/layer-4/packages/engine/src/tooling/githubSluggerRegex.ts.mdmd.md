# packages/engine/src/tooling/githubSluggerRegex.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/tooling/githubSluggerRegex.ts
- Generated At: 2026-09-27T23:21:31.656Z

## Authored
### Purpose
Provides the character-removal pattern for GitHub-compatible heading anchors, shared by documentation link checks and source-symbol slug generation.

### Notes
- Vendored from github-slugger 2.0.0; its upstream source is linked in the provenance account below. Keep the pattern identical to that source: `:-@` is an ASCII range, not three literal characters. Escaping its hyphen removes hyphens from dates and names while incorrectly retaining punctuation such as semicolons and question marks.
- The correction was discovered while restoring dated provenance links; [the September 30 account, turn 5](../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-30.2.SUMMARIZED.md#turn-5) records the verification and its conversation-capture limitation.
- The vendoring originated in the [October 25 summary, turn 32](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-32-vendored-github-slugger-lines-50015160). Historical claims of compatibility are not substitutes for checking upstream behavior; the date, mixed-script and punctuation regressions in `githubSlugger.test.ts` preserve that distinction.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GITHUB_SLUG_REMOVE_PATTERN` {#symbol-github_slug_remove_pattern}
- Type: const
- Source: [source](../../../../../../packages/engine/src/tooling/githubSluggerRegex.ts#L13)

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
