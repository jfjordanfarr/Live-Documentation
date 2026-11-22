# `tests/integration/live-docs/type-only-names.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/type-only-names.test.ts`
- Generated At: 2026-11-22T07:13:00.073Z

## Authored
### Purpose
Holds which dependency lines a Live Doc marks "type-only" to the TypeScript compiler's own word on each imported and re-exported name (`ts.isTypeOnlyImportOrExportDeclaration`): a name is type-only by its own `type` or its statement's. A line of one name is type-only when every statement of the file that brings that name from that file brings it as a type. A line of the whole module (a package, or a file brought with no names) is type-only when every binding of every statement naming it is a type. It asks this of a made folder holding every form (a name's own modifier beside a value, a statement's modifier followed by a value of the same file, an alias, packages, re-exports, a module brought only as a type and one brought for its effect too), and of every file of the sample program `typescript/tidepool`.

### Notes
- Written on 2026-11-22 at root's ask, after the seventh milestone's handback found that `import { fileAt, type GraphFile }` wrote `GraphFile` without the mark. The reader read only a statement's modifier, and the composer took the first statement of a file's group for every line of it. Measured first over this repository, the TypeScript samples and the kept corpora ([the record](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-hosts/README.md)): 798 lines of this repository's docs gained the mark, 6 value lines lost one they had been given by the statement before them, and 22 names re-exported by `export type { … }` became types. Both cases failed against the reader of `3cd947724` and pass after.
- "Type-only" here is what is written. A name imported without the modifier that names only an interface or a type alias, which the compiler elides all the same, is not marked: that would be a different fact, measured in the same record and left as a question.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os`
- `node:path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`graphFiles.readLiveDocGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- `typescript` - `ts`
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
