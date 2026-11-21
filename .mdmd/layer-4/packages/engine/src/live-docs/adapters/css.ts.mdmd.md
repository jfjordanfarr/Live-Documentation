# `packages/engine/src/live-docs/adapters/css.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/css.ts`
- Generated At: 2026-11-21T18:54:36.815Z

## Authored
### Purpose
Language adapter that extracts dependency relationships from CSS files by parsing `@import` rules, `url()` references, and `@font-face src` declarations, enabling CSS assets to display connectivity to their font, image, and nested stylesheet dependencies in the Live Documentation Explorer.

### Notes
- Created 2025-12-09 alongside the HTML adapter to provide full web asset graph coverage
- Uses `findDocumentRoot()` to resolve server-root-relative paths (same algorithm as HTML adapter)
- Handles both quoted and bare (unquoted) `url()` syntax
- Deduplicates repeated references to the same resource across different quote styles
- Strips query strings and fragments from URLs (e.g., cache-busting `?v=123` suffixes)
- Returns empty symbols array since CSS files have no TypeScript-style exports
- Since 2026-11-21 ([the comment guard](./commentGuard.test.ts.mdmd.md)) no `@import` or `url()` inside a comment is read (`withoutCssComments`): until then a commented-out rule was read as real, as in mojoPortal's `Web/Data/style/adminmenu/style.css`, whose 38 icons are in a comment, and jQuery UI's header comment, whose theme roller address holds six `url(…)`. The bundled CSS grammar was not used: it reads `/*` inside a string as a comment and `//` as one, which CSS does not.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `withoutCssComments` {#symbol-withoutcsscomments}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/css.ts#L52)

##### `withoutCssComments` — Summary
The style sheet with every comment written over in spaces, its line breaks kept, so that positions keep: a comment
is `/*` to the first `*\/` after it (CSS Syntax, "Consume comments"), and none starts inside a string, which runs to
its closing quote past any escaped character or to the line's end, nor inside an unquoted `url(…)`, which runs to its
`)`. `//` is no comment in CSS. A comment left open runs to the end. The guard of 2026-11-21
(`commentGuard.test.ts`): until then a commented-out `@import` or `url()` was read as real.

#### `cssAdapter` {#symbol-cssadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/css.ts#L334)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `cssAdapter` — Summary
Language adapter for CSS (`.css`). Extracts `@import` and `url()` dependencies, none inside a comment ({@link withoutCssComments}).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `statSync`
- `node:path` - `path`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`compareText`](../../tooling/compareText.ts.mdmd.md#symbol-comparetext)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`sourceText.readSourceText`](../../tooling/sourceText.ts.mdmd.md#symbol-readsourcetext)
- [`sourceText.throwIfMachineFailure`](../../tooling/sourceText.ts.mdmd.md#symbol-throwifmachinefailure)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
