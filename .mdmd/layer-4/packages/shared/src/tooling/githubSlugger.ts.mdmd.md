# packages/shared/src/tooling/githubSlugger.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/githubSlugger.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-githubslugger-ts
- Generated At: 2025-12-11T02:38:02.367Z

## Authored
### Purpose
Provides a fully vendored GitHub-compatible slugger (function + stateful class) so Live Docs, SlopCop, and CLI tooling share identical heading-anchor logic without relying on the external `github-slugger` ESM package.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-32-vendored-github-slugger]

### Notes
- Exposes both stateless `slug` helpers and duplicate-tracking `GitHubSlugger` instances, enabling utilities like `slug-heading.ts` and the Live Docs generator to reuse the same behaviour.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md]
- November 7 anchor-audit confirmed the maintainCase flag and unicode handling stay aligned with GitHub after targeting mis-slugged `COMP-003 – Heuristic Suite` references.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.367Z","inputHash":"0ff9c720d242862e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SlugContext` {#symbol-slugcontext}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/githubSlugger.ts#L11)

#### `GitHubSlugger` {#symbol-githubslugger}
- Type: class
- Source: [source](../../../../../../packages/shared/src/tooling/githubSlugger.ts#L17)

#### `slug` {#symbol-slug}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/githubSlugger.ts#L54)

#### `createSlugger` {#symbol-createslugger}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/githubSlugger.ts#L63)
- Returns: [`GitHubSlugger`](#symbol-githubslugger)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`githubSluggerRegex.GITHUB_SLUG_REMOVE_PATTERN`](./githubSluggerRegex.ts.mdmd.md#symbol-github_slug_remove_pattern)
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
