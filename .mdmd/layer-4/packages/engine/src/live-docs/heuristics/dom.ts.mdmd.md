# `packages/engine/src/live-docs/heuristics/dom.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/heuristics/dom.ts`
- Generated At: 2026-11-24T10:31:38.596Z

## Authored
### Purpose
Infers markup dependencies for scripts that query the DOM by element id, connecting those scripts to the nearby pages that declare the ids.

### Notes
- Focuses on `.aspx`, `.cshtml`, `.razor`, and related markup since those show up across the WebForms, Razor, and Blazor fixtures; expanding the directory allowlist keeps the search bounded while still catching host pages.
- The heuristic complements `aspNetMarkupAdapter` by flowing the opposite direction (script → markup); the [inspect integration tests](../../../../../../../tests/integration/live-docs/inspect-cli.test.ts) assert those end-to-end paths.
- In generator runs, `fileIndex` limits nearby markup candidates to files discovery selected before their content is read. An ignored or configured-excluded page cannot produce a link to a Live Doc that will not exist. Standalone analysis without an index keeps the nearby disk search.
- Since 2026-11-21 ([the comment guard](../adapters/commentGuard.test.ts.mdmd.md)) the calls are read from the script's syntax tree, as `routes.ts` reads its calls, and the markup's ids from its text with its comments written over (`markupWithoutComments` in `aspnet.ts`): until then both were patterns over the raw text, and a call or an element in a comment was read. On DNN one link is gone, `vbscript.js` to `index.html`, whose call is in the file's usage comment.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `inferDomDependencies` {#symbol-inferdomdependencies}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/heuristics/dom.ts#L47)
- Parameters: `params`: `DomDependencyParams`

##### `inferDomDependencies` — Summary
Scans a code file for `document.getElementById` / `querySelector('#...')`
calls and attempts to locate nearby markup files (`.html`, `.cshtml`, etc.)
that define those DOM IDs, returning dependency entries. With a workspace
file index, only selected markup can become a dependency; without one,
standalone analysis keeps the nearby-file search. The calls are read from
the script's syntax tree and the ids from the markup with its comments
written over, so that neither is read inside a comment (the comment guard
of 2026-11-21, `commentGuard.test.ts`; until then both were patterns over
the raw text).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`aspnet.markupWithoutComments`](../adapters/aspnet.ts.mdmd.md#symbol-markupwithoutcomments)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`enginePath.path`](../../tooling/enginePath.ts.mdmd.md)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`sourceText.SourceReads`](../../tooling/sourceText.ts.mdmd.md#symbol-sourcereads) (type-only)
- [`sourceText.readSourceText`](../../tooling/sourceText.ts.mdmd.md#symbol-readsourcetext)
- [`sourceText.throwIfMachineFailure`](../../tooling/sourceText.ts.mdmd.md#symbol-throwifmachinefailure)
- [`workspaceProbes.ListedFiles`](../../tooling/workspaceProbes.ts.mdmd.md#symbol-listedfiles) (type-only)
- [`workspaceProbes.folderChildren`](../../tooling/workspaceProbes.ts.mdmd.md#symbol-folderchildren)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->
