# `packages/engine/src/live-docs/adapters/commentGuard.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/adapters/commentGuard.test.ts`
- Generated At: 2026-11-21T20:49:35.750Z

## Authored
### Purpose
The standing guard against a reader taking what a comment holds for real code. For every reader of the engine, each construct it reads and each comment form of that construct's language, it writes the construct once inside the comment and once live beside it, and asks that only the live one yields its fact; where a comment's marker stands inside a string, an attribute's value or a script's text, it asks that what follows is still read. Built on 2026-11-21 after a commented-out `<ProjectReference>` was found read as real, a fault the project file's reader and its grader shared because both matched a pattern over the raw text ([the record of the batch that built it](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md)).

### Notes
- The table is meant to grow: a reader added to the engine, or a construct added to a reader, gets its rows here, with the comment forms of its language taken from the language's own definition.
- A form can be a comment to one reader and not to another of the same file: the ASP.NET page parser reads a directive inside an HTML comment, which is only literal text to it, so that row expects the fact (`hides: false`).
- A construct a file can hold only once (Ruby's guard that runs a file as the program) is held in `ALONE`: live it yields the fact, commented it yields none.
- Each case writes a small workspace of its own and reads it as the generator does, the symbol index first, so that links resolve as in a scan.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path`
- [`aspnet.withoutMarkupComments`](./aspnet.ts.mdmd.md#symbol-withoutmarkupcomments)
- [`css.withoutCssComments`](./css.ts.mdmd.md#symbol-withoutcsscomments)
- [`html.withoutHtmlComments`](./html.ts.mdmd.md#symbol-withouthtmlcomments)
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`treeSitter.writtenOver`](./treeSitter.ts.mdmd.md#symbol-writtenover)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`discovery.buildWorkspaceIndexes`](../discovery.ts.mdmd.md#symbol-buildworkspaceindexes)
- [`sourceAnalysis.analyzeSourceFile`](../sourceAnalysis.ts.mdmd.md#symbol-analyzesourcefile)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
