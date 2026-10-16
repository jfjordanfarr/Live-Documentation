# packages/engine/src/live-docs/adapters/gomod.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/gomod.ts
- Generated At: 2026-10-16T16:21:40.578Z

## Authored
### Purpose
The adapter for Go module files (`go.mod`, matched by its exact name): the `module` path as the file's one `package` symbol, and the modules it requires as dependencies. A `go.mod` declares no entries; a Go program starts at its `package main`, which the Go adapter marks.

### Notes
- Written on 2026-10-16 for the manifests the `reachable` build of October 15 had left for a later pass ([the October 15–16 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-15.1.SUMMARIZED.md#turn-4)), approved by the owner on 2026-10-16 ([Turn 3 of the October 16 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)). A `go.mod` is a line format, read by `goDirectives` without a library: comments stripped, a block's lines given its verb, quoted paths unquoted.
- Read: `require` in the single-line and block forms, written as `path@version`; a requirement marked `// indirect` is one the module's own code does not import, recorded for a dependency's sake, and is not written. A `replace` that names a folder links the requirement to the `go.mod` there when the workspace holds it, or writes the module's path alone when it does not; one that names another module writes `target@version` in the requirement's place; a replacement with a version applies only to that version. A requirement on a module a workspace `go.mod` publishes links to it, as a `go.work` would.
- Not read: `exclude`, `retract`, `toolchain`, `godebug` and `tool`. The Go adapter reads `module` with its own regular expression to resolve imports inside one module, and does not follow a `replace` to a local module, so an import of the replaced module stays external on the importing file's doc. Measured by `gomod.test.ts` and `tests/integration/live-docs/manifests.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GoDirective` {#symbol-godirective}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/gomod.ts#L31)

##### `GoDirective` — Summary
One directive of a `go.mod`: its verb, its arguments unquoted, and whether its comment marks it indirect.

#### `GoModFile` {#symbol-gomodfile}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/gomod.ts#L38)

##### `GoModFile` — Summary
What a `go.mod` says, as far as the docs need it.

#### `goDirectives` {#symbol-godirectives}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/gomod.ts#L45)
- Returns: [`GoDirective`](#symbol-godirective)[]

##### `goDirectives` — Summary
Reads a `go.mod` into its directives, a block's lines each given the block's verb.

#### `readGoMod` {#symbol-readgomod}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/gomod.ts#L78)
- Returns: [`GoModFile`](#symbol-gomodfile)

##### `readGoMod` — Summary
The module, its direct requirements and its replacements.

#### `goModAdapter` {#symbol-gomodadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/gomod.ts#L101)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `goModAdapter` — Summary
Language adapter for `go.mod`: the module as a symbol and the modules it requires as dependencies.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`manifest.ManifestDependencies`](./manifest.ts.mdmd.md#symbol-manifestdependencies)
- [`manifest.manifestContext`](./manifest.ts.mdmd.md#symbol-manifestcontext-function)
- [`manifest.manifestIn`](./manifest.ts.mdmd.md#symbol-manifestin)
- [`manifest.packageSymbols`](./manifest.ts.mdmd.md#symbol-packagesymbols)
- [`manifest.publishedName`](./manifest.ts.mdmd.md#symbol-publishedname)
- [`coreTypes.SourceAnalysisResult`](../coreTypes.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
<!-- LIVE-DOC:END Dependencies -->
