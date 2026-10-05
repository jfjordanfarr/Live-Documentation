# packages/engine/src/tooling/githubSlugger.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/tooling/githubSlugger.ts
- Generated At: 2026-10-05T17:11:04.605Z

## Authored
### Purpose
Provides a fully vendored GitHub-compatible slugger (function + stateful class) so Live Docs, SlopCop, and CLI tooling share identical heading-anchor logic without relying on the external `github-slugger` ESM package.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-32-vendored-github-slugger]

### Notes
- Exposes both stateless `slug` helpers and duplicate-tracking `GitHubSlugger` instances, enabling utilities like `slug-heading.ts` and the Live Docs generator to reuse the same behaviour.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md]
- November 7 anchor-audit confirmed the maintainCase flag and unicode handling stay aligned with GitHub after targeting mis-slugged `COMP-003 – Heuristic Suite` references.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md]
- `slugText` (2026-10-05) reduces a heading's inline markdown to the text GitHub slugs: links to their words, images to their alt text, code without backticks, emphasis without its delimiters, underscores inside words kept. Both documentation audits slug through it, after the symbol audit rejected a correct link to a decisions-log heading whose `_(Recorded …)_` suffix had entered the raw slug ([the October 5 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-4)).

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

#### `slugText` {#symbol-slugtext}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/githubSlugger.ts#L114)

##### `slugText` — Summary
The text of a heading as GitHub slugs it: the rendered text, not the markdown.

GitHub builds a heading's anchor from its rendered content, so a link's text
stands without its address, an image without its source, inline code without
its backticks, and emphasis without its delimiters. Asterisks and backticks
the slug pattern removes anyway; underscores it keeps, since `snake_case`
belongs in a slug, so an underscore is dropped only where it delimits
emphasis: at the start of a word or at its end. Without this, a heading such
as `### Decision _(Recorded 2026-10-05)_` slugs to a form GitHub never makes.

##### `slugText` — Parameters
- `markdown`: The heading's text as written, after the ATX hashes.

##### `slugText` — Returns
The text to pass to {@link slug}.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`githubSluggerRegex.GITHUB_SLUG_REMOVE_PATTERN`](./githubSluggerRegex.ts.mdmd.md#symbol-github_slug_remove_pattern)
<!-- LIVE-DOC:END Dependencies -->
