# packages/shared/src/tooling/githubSluggerRegex.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/githubSluggerRegex.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-githubsluggerregex-ts
- Generated At: 2026-02-03T21:55:41.306Z

## Authored
### Purpose
Packages the vendored GitHub slug sanitiser regex so our slugger matches exactly what the upstream library emits, keeping Live Doc anchors identical to GitHub and VS Code behaviour for multilingual headings.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-32-vendored-github-slugger]

### Notes
- Pulled in alongside the internal `GitHubSlugger` port during the October 25 documentation-alignment push to eliminate dependency on the ESM-only upstream package.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-32-vendored-github-slugger]
- Verified repeatedly while tuning doc-link anchors for SlopCop on November 7, ensuring unicode headings slug to `comp003--heuristic-suite` and similar real-world cases.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.306Z","inputHash":"6b1b88bfbeda43d5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GITHUB_SLUG_REMOVE_PATTERN` {#symbol-github_slug_remove_pattern}
- Type: const
- Source: [source](../../../../../../packages/shared/src/tooling/githubSluggerRegex.ts#L3)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [documentationLinks.test.ts](./documentationLinks.test.ts.mdmd.md)
- [githubSlugger.test.ts](./githubSlugger.test.ts.mdmd.md)
- [symbolReferences.test.ts](./symbolReferences.test.ts.mdmd.md)
- [enforce-documentation-links.test.ts](../../../../scripts/doc-tools/enforce-documentation-links.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
