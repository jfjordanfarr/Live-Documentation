# packages/engine/src/tooling/githubSlugger.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/tooling/githubSlugger.ts
- Generated At: 2026-09-27T23:21:31.646Z

## Authored
### Purpose
Provides a fully vendored GitHub-compatible slugger (function + stateful class) so Live Docs, SlopCop, and CLI tooling share identical heading-anchor logic without relying on the external `github-slugger` ESM package.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-32-vendored-github-slugger]

### Notes
- Exposes both stateless `slug` helpers and duplicate-tracking `GitHubSlugger` instances, enabling utilities like `slug-heading.ts` and the Live Docs generator to reuse the same behaviour.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md]
- November 7 anchor-audit confirmed the maintainCase flag and unicode handling stay aligned with GitHub after targeting mis-slugged `COMP-003 – Heuristic Suite` references.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md]

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SlugContext` {#symbol-slugcontext}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/githubSlugger.ts#L15)

##### `SlugContext` — Summary
Extended slug result that includes the de-duplicated slug string,
the base slug before collision resolution, and the collision index.

#### `GitHubSlugger` {#symbol-githubslugger}
- Type: class
- Source: [source](../../../../../../packages/engine/src/tooling/githubSlugger.ts#L30)

##### `GitHubSlugger` — Summary
Stateful GitHub-compatible heading slug generator.

Maintains an internal occurrence map so duplicate headings receive
disambiguating `-N` suffixes, matching GitHub's rendering behaviour.

#### `slug` {#symbol-slug}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/githubSlugger.ts#L86)

##### `slug` — Summary
Stateless slug generation (no duplicate tracking).

##### `slug` — Parameters
- `maintainCase`: If `true`, preserves original casing.
- `value`: Raw heading text.

##### `slug` — Returns
GitHub-compatible slug string.

#### `createSlugger` {#symbol-createslugger}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/githubSlugger.ts#L96)
- Returns: [`GitHubSlugger`](#symbol-githubslugger)

##### `createSlugger` — Summary
Creates a fresh {@link GitHubSlugger} instance.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`githubSluggerRegex.GITHUB_SLUG_REMOVE_PATTERN`](./githubSluggerRegex.ts.mdmd.md#symbol-github_slug_remove_pattern)
<!-- LIVE-DOC:END Dependencies -->
