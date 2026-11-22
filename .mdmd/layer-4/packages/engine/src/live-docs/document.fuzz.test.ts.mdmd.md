# `packages/engine/src/live-docs/document.fuzz.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/document.fuzz.test.ts`
- Generated At: 2026-11-22T07:12:52.816Z

## Authored
### Purpose
Holds the Live Doc format to whatever a repository can hand the generator: hostile names, paths and docstring lines go through the real composer (`compose.ts`), the real writer and, as a file on disk would, through UTF-8 to the real reader (`document.ts`). Three things must hold for each: the reader gives back exactly what was written, from the doc as written and from it with CRLF line endings as Git for Windows checks one out, two different names in one doc never read back as one and their anchors differ, and nothing throws. A link besides must lead where it was made to, as the graph resolves it (`resolveDocLink`) and as a browser does, the WHATWG URL parser standing in for a markdown viewer.

### Notes
- Written 2026-11-19 after [the third review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/third-review.md) found names that made generation throw, so that one odd file name or JSON key stopped a whole repository's docs and its history. The reviewer's names come first (`CHOSEN`): a key with a line break or CRLF, a script named `` a`b `` or empty, a folder `` d`x ``, the keys `""` and `"\"\""`, two lone surrogates, and the root's later case, a document named `notes/plan (draft).md`; then pairs chosen to read back as one, and paths a link must still open (parentheses, brackets, a trailing space, `#`, `%`, `?`, angle brackets, non-ASCII).
- Every written doc must also be free of a control character other than a tab, and of the line and paragraph separators, outside a quoted value, which spells them out; run before that rule, it failed first on `a\rb`.
- Since a later commit of that day its paths are what a repository can hold, not only `d`-led folders under `src/`: a segment may begin with any character (a quote, a space, a `#`, a dot) and hold a lone surrogate, whose links are then written, deliberately, as JSON strings; half the docs stand at the workspace root, so a link may begin with neither `./` nor `../`; and the pieces include the entities `&amp;` and `&#x26;` (the review of that day (`AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/names-read-back-review/README.md` on `main`), its fourth finding).
- Since a later commit of that day every written doc is also read by the CommonMark reference implementation (`viewerSees`), as GitHub and an editor read it: every heading and generated link of the model must be found at its place and as itself, nothing outside a docstring may be a heading, link, image or raw HTML the model does not hold, and no block a docstring opens may run past it. A link written as a JSON string, for a path no URL can hold, is no link a viewer follows and is left out. A doc over 200,000 characters, which only the very long names make, is left to our reader alone, since the reference parser takes seconds over it. The pieces include the docstring lines that open blocks (`<!--`, `<script>`, `~~~`, a list item, a quote, an indented line), and the name stands in every place the format puts a docstring's text, its own list items included; before docstrings in a list were contained, it failed on `" éB\n<!--\n   ```"`.
- `everywhere` hands one name to every place a doc carries one: the code path, a symbol, its parameters, types and every docstring section, a program and an opening entry, a command and a module entry with their manifest's folder, an external and two workspace dependencies, two re-exports and a citing document. `together` puts many names in one doc, as symbols, commands and specifiers, each with a near twin (another case, a suffix-like tail, its quoted spelling), so that two read back as one is seen.
- The generator is mulberry32, seeded, so a run is the same every time and a failure names the value: 200 generated names everywhere, 80 docs of twelve, and very long names (the reviewer's 70,000-character key, runs of backticks, line breaks, lone surrogates) in one doc of their own, since a doc with such a name in every place is megabytes. About a second and a half in all, kept there because the unit suite runs beside other suites with five-second deadlines.
- Run against the code before the mend, every case failed: all 47 chosen names, both docs of names together, all 200 generated names and all 80 generated docs, first on `a\nb` (the title) and on `.1 (symbol)` (a folder with a parenthesis in a manifest's link); without the CRLF reading, which that code lacked for every doc, 36 of the 47 and 242 of 300 generated names failed. Taking out the links' encoding fails it again, on the citing document's link.
- Anchors are held apart among a doc's public symbols, and among its re-exports: every name of `together` is re-exported too, beside its twin in another case, and `everywhere` re-exports a name and the name with `!`, which give one anchor by their names. Run before re-exports were anchored apart, it failed first on `a\nb` and `a\nb!`, both `symbol-ab`. Since a later commit of that day a doc's anchors are one namespace, the public symbols' and the re-exports' together, and every name of `together` is both; run before, it failed first on `a\nb` declared and re-exported, both `symbol-ab`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:module` - `createRequire`
- `node:path` - `path`
- [`compose.composeCitedBy`](./compose.ts.mdmd.md#symbol-composecitedby)
- [`compose.composeDependencies`](./compose.ts.mdmd.md#symbol-composedependencies)
- [`compose.composeEntries`](./compose.ts.mdmd.md#symbol-composeentries)
- [`compose.composeReExports`](./compose.ts.mdmd.md#symbol-composereexports)
- [`compose.composeSymbolBlocks`](./compose.ts.mdmd.md#symbol-composesymbolblocks)
- [`compose.computePublicSymbolHeadingInfo`](./compose.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`coreTypes.DeclaredBy`](./coreTypes.ts.mdmd.md#symbol-declaredby) (type-only)
- [`coreTypes.DependencyEntry`](./coreTypes.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`coreTypes.PublicSymbolEntry`](./coreTypes.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`coreTypes.ReExportedSymbolInfo`](./coreTypes.ts.mdmd.md#symbol-reexportedsymbolinfo) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`coreUtils.createSymbolSlug`](./coreUtils.ts.mdmd.md#symbol-createsymbolslug)
- [`document.DEFAULT_AUTHORED_BLOCK`](./document.ts.mdmd.md#symbol-default_authored_block)
- [`document.LiveDoc`](./document.ts.mdmd.md#symbol-livedoc) (type-only)
- [`document.parseLiveDoc`](./document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](./document.ts.mdmd.md#symbol-renderlivedoc)
- [`document.symbolName`](./document.ts.mdmd.md#symbol-symbolname)
- [`graph.resolveDocLink`](./graph.ts.mdmd.md#symbol-resolvedoclink)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
