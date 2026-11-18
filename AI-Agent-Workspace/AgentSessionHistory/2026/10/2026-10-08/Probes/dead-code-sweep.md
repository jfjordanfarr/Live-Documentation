# The dead code sweep, October 8, 2026

_A measurement of this workspace's own code against Live Documentation's own orphan finding, by the root Claude Code agent (Fable 5.1) on 2026-10-08, at the owner's word in [Turn 2 of the October 8 session](../../ChatHistory/2026/10/2026-10-08.1.record.md#turn-2): "I'm actually very curious about doing a dead code/dead file sweep through this workspace and I'm wondering if Live Documentaton can help us detect true orphans. Perhaps the high-intelligence manually curated list can be compared to what our software might come up with." And in Turn 3: "Think about your manual dead code sweep (or general code health sweep) as informing us about what we want our software to be able to detect (if possible/simple to do)." The hand-curated judgments are the oracle; the graph's lists are what it measures, by the rule that nothing grades itself. The lists are in [the appendix](dead-code-sweep/candidates.md). Nothing was deleted by this record; the deletions it proposes wait on the owner._

## Method

Three instruments and a hand, over this repository's own code: `packages/*/src`, `scripts/`, `tests/e2e`, `tests/integration/live-docs` and the root configuration, which is 343 of the graph's 658 files. The sample programs under `tests/integration/programs` and every `fixtures` folder are inputs to the tool, not code of this workspace, and were left aside.

1. **The graph**, `.mdmd/index.json` as the generator wrote it at `663fe804`: a file is a candidate when no other file has a resolved edge to it (`inbound` empty), or when every such file is a test; a public symbol is a candidate when no edge from another file names it (`toSymbol`), or when every such edge comes from a test. The docs carry symbol-level edges for imports and for type references, so this is the finest reading the docs allow.
2. **A linter**, knip 6.40.0, run once from the scratchpad with `npx` and nothing installed: unused files, exports, types and dependencies, by its own model of entry points (package manifests, test runners and the configurations it knows).
3. **A whole-word mention scan** of the 346 source files, for every symbol candidate: how many other files mention the name at all, and whether any mention is an import of that name from the candidate's own module. This is the check that the graph's symbol edges are complete for direct imports.
4. **The hand**: every file candidate read for what references it outside the graph's sight (package scripts, runner configurations, the template, path strings in code), every symbol class read in samples and every dead symbol in full, the barrels parsed for what is imported through them, knip's dependency findings checked against the imports.

## Files

Of the workspace's 343 files, 158 have no inbound edge and 2 more are referenced only by tests. The 134 test files among them are entries of a runner: 132 match an include glob of vitest's unit or integration project or Playwright's `**/*.spec.ts` under `tests/e2e`, and the two that match none are tooling inputs, `tests/e2e/playwright.config.ts` and `tests/integration/tsconfig.json`. The 26 implementation files, judged one by one (the appendix has the table):

| Class | Files | What would let the software know |
| --- | ---: | --- |
| Entries that a package manifest's `scripts` run by path (`tsx ... scripts/live-docs/generate.ts`, `node ./scripts/verify.mjs`, and the engine's build script that copies `powershell.emit-ast.ps1`) | 17 | Read a manifest's script commands for workspace paths; an edge from the manifest to the file, basis `configuration` |
| Entries that a manifest's `bin` or `main` names through the build (`packages/cli`'s `dist/index.js` is `src/index.ts`) | 1 | The `bin`/`main` path mapped through the package's tsconfig `outDir` |
| Entries a bundler or a template names by a path string in code (`client/index.ts` as esbuild's entry; `client/styles.css`, which the template links as `./static/styles.css` and `buildAssets.ts` copies) | 2 | Not inferable from the docs without reading path strings; a declared start file |
| Tooling inputs read by a tool, never imported (three `tsconfig.json`, three package manifests) | 5 | A rule by file kind: manifests and compiler configurations are roots, not orphans |
| An adapter miss: `buildAssets.ts`, which `staticBuilder.ts` loads by `await import("./buildAssets")` | 1 | Record a dynamic `import()` with a string literal as an import edge |
| **Dead**: `membraneView/hierarchy.ts`, used only by its own test since `d23a6f90` (2026-09-28) | 1 | Already visible: a file whose only inbound edges come from tests |
| **Dead by duplication**: `scripts/live-docs/find-orphans.ts`, which finds Live Docs whose source file is gone; the generator prunes those itself (`pruneStaleLiveDocs`), so the npm script `live-docs:orphans` and the CLI's `orphans` command run a check that nothing needs | 1 | Not detectable: it is reachable; only a reading knows it repeats the generator |

So on this repository the graph's "nothing references these" list of implementation files holds one dead file and one redundant one among 26, and the other 24 are the shape of a tool with many commands. Entry inference from manifests and runners would clear 18 of them and the runner globs would clear every test; a declared list of five paths would finish it.

## Symbols

The workspace's implementation files offer 1,230 public symbols. The graph finds 348 with no reference from another file and 130 referenced only by tests. The mention scan then split the 348: 217 whose name appears in no other source file, and 131 whose name appears elsewhere. For the 131, **no case was found of a file importing the name from the candidate's own module**: every direct import in this workspace has its edge in the docs. What the 131 are instead: 60 are re-exports that no file imports through their barrel (the consumers import from the origin, as the docs prefer); 44 are string-keyed names, element ids the client finds by `getElementById`, configuration keys and package names, which no import ever names; one is the dynamic import above; the remaining 26 are name coincidences (a `Placement` in two modules, a `Hover`, a `Wire`, a `rotate`), where the mention is a different symbol of the same name.

The 217 whose name appears nowhere else, read by hand:

| Class | Symbols | Reading |
| --- | ---: | --- |
| **Dead**: defined and used nowhere, not even in their own file | 8 | `getAllSyntaxes`, `stripCommentsForPath` and `isFrameworkTypeForPath` in `packages/engine/src/languages/index.ts`; `SyntaxTree` in `adapters/treeSitter.ts`; `findDominantDirectory` in `views/layoutUtils.ts`; `applyMapTransform` in `localView/pan-zoom.ts`; `NormalizedAnchorKey` in `views/symbolAnchors.ts`; `SHAPE_WORDS` in `worldMap/layout.ts` |
| Exported, used only within their own file | 191 | Parameter and return types of exported functions that callers never name (`SourcesViewConfig`, `TuningPanelConfig`, `ForceGraphViewApi`), helpers exported for no consumer (`python.docstring.ts`'s parsers, `urlText`, `repackRows`). Not dead; the `export` is noise, and the surface the docs describe is wider than what is used |
| String-keyed names: tsconfig keys, template element ids, package names | 14 | Not code references; the docs list them as symbols, but an import never names them |
| Functions inside the PowerShell emitter script | 4 | Internal to a script the adapter runs; the adapter lists every function as public |

And the 130 referenced only by tests, on 43 files: `csharp.xmldoc.ts` 15, `connection-geometry.ts` 11, `python.docstring.ts` 10, `csharp.dependencies.ts` 8, then a long tail. These are helpers exported so that a test can reach them, a legitimate pattern, and the measure of it: on those 43 files the tests know about a tenth of the public surface that the product does not use.

Two instrument notes. The docs disambiguate two symbols that normalize alike by a suffix in the name (`LinkTarget (interface)`, `linkTarget (function)`, `DirectoryState (type)`, `LayoutConstants (interface)`), so a scan by name must strip the suffix; by hand, all four are used in their own file. And knip, with its own entry model, reports 32 unused exports and 19 unused types where the graph's classes hold 8 dead and 191 own-file-only: knip treats most of this workspace as entries (every script, every test) and counts exports from those as used, so it sees the smaller problem; where the two overlap (`describeNode`, `normalizeInputIdentifier`, `DEFAULT_COST_GRID`, `CONFIG_FILE_NAME`) they agree.

## Duplication and dependencies

- `escapeHtml` is defined twelve times in the Explorer client: once exported from `graph-helpers.ts`, which nothing imports, and eleven times as a local function or constant (`markdown.ts`, `pathfind.ts`, `detailPanel.ts`, `omnisearch.ts`, `sources-view.ts`, `circuitView/index.ts`, `circuitView/directoryTile.ts`, three Membrane Map renderers, `worldMap/controller.ts`). The docs cannot see this: eleven of the twelve are private, and a private helper is not a public symbol.
- Four barrels re-export names that no file imports through them: `packages/engine/src/live-docs/core.ts` 34 of 58, `packages/explorer/src/client/persistence/index.ts` 11 of 20, `packages/engine/src/languages/index.ts` 9 of 16, `packages/explorer/src/client/bootstrap/index.ts` 3 of 4. The panel's "116 inbound dependencies" for `core.ts` counts files that import some of its 24 used names; the barrel is more than half unused through itself.
- Dependencies, from knip and checked against the imports: `glob` is listed by `packages/cli` and `packages/explorer` and imported by neither; `minimatch` is listed by `packages/engine` and imported nowhere in it; the root lists `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` while `eslint.config.js` requires `typescript-eslint`, which brings them; the root lists `@vscode/tree-sitter-wasm`, which only the engine loads and lists; `@types/lz-string` is listed by the explorer while `lz-string` ships its own types. Unlisted: `eslint.config.js` requires `@eslint/js`, and five Playwright specs import `lz-string`, which only the explorer's manifest lists. `scip-dotnet` is an external indexer the oracle names on purpose.
- General counts over the same code: 1 `TODO`, 3 `eslint-disable`, 4 `any`, 2 `@ts-ignore`/`@ts-expect-error`; four files over a thousand lines (`worldMap/controller.ts` 1,681; `adapters/csharp.ts` 1,248; `tests/e2e/still-picture.ts` 1,192; `client/index.ts` 1,065).

## Where the software and the hand disagree

The graph records every direct import and every type reference between this workspace's files; the hand found none it missed. Everything it cannot see is a reference that is not an import: a manifest script naming a path, a runner's include glob, a template's link, a path string joined in code, a dynamic import, an element id or configuration key named as a string, and a private helper copied by hand. So the graph's orphan list is the right list of *candidates*, and the judgment turns on knowing what an entry is. The owner's instinct holds: "so much better if we can infer", and most of it can be.

## What the software should detect, by simplicity

1. **From the graph alone, today, in the client or a command**: files nothing references, by archetype; files only tests reference; public symbols nothing references; symbols only tests reference. These four were computed here from `index.json` in a few lines and are the panel's sections since later this day. Two more classes the sweep used needed the source text, not the docs: the split of an unreferenced symbol into one its own file uses and one nothing uses (the docs carry no uses within a file), and the re-exports nobody imports through a barrel (the docs list a barrel's re-exports as symbols of kind `unknown`, which is a symptom, not a mark). _Corrected later on 2026-10-08; the first wording claimed all six came from the index._
2. **A declared dependency no file imports**: a manifest's Live Doc lists its dependencies and every file's doc lists its external dependency lines; comparing the two per package is the graph's version of knip's finding. Needs module names normalized (`glob@^10` against `glob`).
3. **A dynamic `import()` with a string literal as an import edge**: an adapter fix measured on the oracle; scip-typescript records it.
4. **Entry points inferred, as edges with basis `configuration`**: a manifest's `scripts` naming workspace paths; `bin` and `main` mapped through the package's tsconfig; a test runner's include globs from `vitest.config.ts` and `playwright.config.ts`. This is doc-format growth of the kind that landed for openings and manifests in September; it would clear 18 of the 26 implementation files and all 134 tests on this repository.
5. **A declared start file** for what no rule infers: a bundler entry named by a path string, a stylesheet the template links by its built path. On this repository, five paths.

Not detectable from the docs, and said so: a reachable file that repeats what another does; a private helper copied twelve times; a template id nothing selects.

## Correction, later on 2026-10-08

The record above calls `scripts/live-docs/find-orphans.ts` dead by duplication. The origin check the owner asked for before any deletion ([Turn 4](../../ChatHistory/2026/10/2026-10-08.1.record.md#turn-4)) found an intended use the hand had missed: the generator's prune skips a stale doc that has authored content ("Preserving … (authored content detected)"), and [the pipeline doc](../../../.mdmd/layer-3/live-documentation-pipeline.mdmd.md) and [the internal tooling reference](../../../.mdmd/layer-2/internal-tooling.mdmd.md) say to run `live-docs:orphans` after deleting source files for exactly those docs. So the script is reachable and useful, and it stays. The files table in the appendix carries the wrong class; this note corrects it. The lesson for the software is the one the record already draws: a reachable file's usefulness is a reading, not a measurement.

## Outcome, 2026-10-08

Deleted and repaired under the owner's standing grant of that day (dead code is deleted once its origin is checked and no programmatic or intended use is found), in the commit that follows this record's correction:

- `membraneView/hierarchy.ts` and its test, with their Live Docs removed by hand since the generator preserves docs that carry authored content.
- The eight dead symbols; `treeSitter.ts` keeps its `Tree` import, which `parseSource` still returns.
- The four barrels trimmed to what is imported through them: `core.ts` 58 to 24 names, `persistence/index.ts` 20 to 9, `languages/index.ts` 16 to 7, `bootstrap/index.ts` 4 to 1.
- The eleven local `escapeHtml` copies replaced by the one exported from `graph-helpers.ts`; two of them had escaped four characters where it escapes five, which is safe in every HTML context the client writes into.
- Dependencies: `glob` out of the CLI's and the explorer's manifests, `minimatch` out of the engine's, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser` and `@vscode/tree-sitter-wasm` out of the root's, `@types/lz-string` out of the explorer's (`lz-string` ships its typings); `@eslint/js` and `lz-string` listed at the root, which `eslint.config.js` and five Playwright specs require.

Not deleted: `find-orphans.ts`, by the correction above.

And the panel, the same day: rebuilt from a pure module over the graph index with the four classes above as its sections, every file a button into the detail panel, every directory a door into the Local Map, the facts downloadable as JSON, and the stale text gone ([the decisions log](../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-knowledge-sources-panel-says-what-the-graph-says-and-no-more-recorded-2026-10-08), [the pictures](../../Screenshots/2026-10-08/README.md#the-knowledge-sources-panel-rebuilt-from-the-sweep)).

## Proposed deletions and repairs, as first written

_Superseded by the outcome above; kept as the proposal the owner answered._

- Delete `membraneView/hierarchy.ts` and its test.
- Delete the eight dead symbols, with any import that only they used.
- Delete `scripts/live-docs/find-orphans.ts`, the `live-docs:orphans` script and the CLI's `orphans` command, since the generator prunes stale docs itself.
- Trim the four barrels of the 57 re-exports nobody imports through them.
- Replace the eleven local `escapeHtml` copies with the exported one.
- Dependencies: remove `glob` from the CLI and the explorer, `minimatch` from the engine, the two `@typescript-eslint` packages and `@vscode/tree-sitter-wasm` from the root, `@types/lz-string` from the explorer; list `@eslint/js` and `lz-string` at the root, which already requires them.

Left as they are, on purpose: the 191 exports their own file uses (harmless, and many are types inferred at call sites), the 130 test-only exports (the pattern that lets a test reach a helper), and the long files.

## The Knowledge Sources panel, from these findings

What the panel should say about a system, given what the sweep found useful: the bundle's shape (files by archetype and directory, when generated, languages); the files nothing references, by archetype, each a link, with the honest note that entries are not yet told apart; the symbol classes above with their counts and lists, which no other view shows and which the sweep needed first; the most-used files as "N files use K of its M symbols", since a bare count crowned a half-unused barrel; the related documentation; the export. Its stale text goes. The headless twin of the lists is `reachable`, the vision's step 4, which the entry inference above makes possible.
