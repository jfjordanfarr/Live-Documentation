# `packages/engine/src/live-docs/adapters/html.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/html.ts`
- Generated At: 2026-11-21T21:13:43.130Z

## Authored
### Purpose
Language adapter that extracts dependency relationships from HTML files by parsing elements that reference external resources (`<link>`, `<script>`, `<img>`, `<source>`, `<video>`, etc.), enabling HTML assets to display connectivity to their CSS, JS, image, font, and media dependencies in the Live Documentation Explorer.

### Notes
- Created 2025-12-09 to close the HTML asset visibility gap identified during 12/9.2 scoping
- Uses `findDocumentRoot()` to resolve server-root-relative paths (e.g., `/styles/site.css`) by walking up the directory tree and checking common static folders (`public/`, `wwwroot/`, `static/`, etc.)
- Handles srcset parsing with multiple URL entries for responsive images
- Skips external URLs (http/https), data URIs, protocol-relative URLs, and anchor-only references
- Strips query strings and fragments from URLs before resolution
- Unresolved URL paths keep their leading slash, so `/` remains a root reference and `/missing` remains distinct from `missing`; query-only references retain their written identity. T3's static-site examples exposed the former empty-specifier failure ([the investigation](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-27/2026-10-27.1.record.md#turn-3)).
- Element IDs are public symbols so a consumer's `getElementById` link can land on the declared element.
- Since 2026-11-21 ([the comment guard](./commentGuard.test.ts.mdmd.md)) no resource or element id inside an HTML comment is read (`withoutHtmlComments`, which the ASP.NET reader and the DOM heuristic share): a comment opens only where a tag may start, never in a quoted attribute value or in the text of `<script>`, `<style>`, `<textarea>` or `<title>`, and ends as HTML ends one.
- Since the evening of 2026-11-21 the step also ends a comment at `--!>`, as HTML does, and writes over the text of `<script>`, `<style>`, `<textarea>` and `<title>`, which HTML reads as text: mojoPortal's ckeditor samples lose 8 ids written in their scripts' comments, nopCommerce's views 12 ids a script's templates write, DNN's CodeMirror demos the links and ids their `<textarea>` samples hold. A `<title />` closed by `/>`, as ASP.NET's parser reads it in DNN's `Default.aspx`, holds no text. A `<noscript>`'s text stays markup, in the ledger of known differences ([the record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md#the-second-round-after-an-independent-review)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `withoutHtmlComments` {#symbol-withouthtmlcomments}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/html.ts#L69)

##### `withoutHtmlComments` — Summary
The markup with what HTML makes no element of written over in spaces ({@link inSpaces}), so that positions keep:
each comment, as HTML parses one, from `<!--` to the first `-->` or `--!>` after it, or at once when it is `<!-->`
or `<!--->`, so that the content a downlevel-revealed conditional comment (`<!--[if !IE]><!--> … <!--<![endif]-->`)
leaves outside every comment is kept, and a comment left open runs to the end; and the text of each `<script>`,
`<style>`, `<textarea>` and `<title>`, which HTML reads as text to that element's end tag, so that an `id=`, `src=`
or `href=` a script's code or comment writes is no element's (mojoPortal's ckeditor samples write `// Replace the
\<textarea id="editor"> …`; a script's own references are the DOM heuristic's, read from its syntax tree). `<!--`
opens a comment only where a tag may start: never inside a tag's quoted attribute value. No browser runs a script,
loads a style sheet or makes an element that a comment holds, so the readers of markup read none (the comment guard
of 2026-11-21, `commentGuard.test.ts`). A `<noscript>`'s text, raw to a browser that runs scripts, is read as markup.

#### `extractElementIds` {#symbol-extractelementids}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/html.ts#L411)

##### `extractElementIds` — Summary
Every element id in a markup file, sorted and unique. Shared with the ASP.NET
markup adapter so that a script's `getElementById` link lands on a symbol the
target doc actually publishes, whatever the markup dialect.

#### `htmlAdapter` {#symbol-htmladapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/html.ts#L432)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `htmlAdapter` — Summary
Language adapter for HTML (`.html`, `.htm`). Extracts resource attributes such as `<script src>`, `<link href>` and `<img src>` as dependencies. Extracts element `id` attributes as public symbols. Neither is read inside an HTML comment ({@link withoutHtmlComments}).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `statSync`
- `node:path` - `path`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`spaces.inSpaces`](./spaces.ts.mdmd.md#symbol-inspaces)
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
