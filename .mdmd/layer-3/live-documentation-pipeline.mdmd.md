# Live Documentation Pipeline

_Current as of 2026-09-28._

## Purpose

Describe what one run of the generator does, what it reads, what it writes, and what it promises to keep. The generator is `generateLiveDocs` in [generator.ts](../layer-4/packages/generator/src/generator.ts.mdmd.md); the CLI wrapper is [generate.ts](../layer-4/scripts/live-docs/generate.ts.mdmd.md).

## One run

1. **Discover targets.** The configured globs select source files ([discovery.ts](../layer-4/packages/engine/src/live-docs/discovery.ts.mdmd.md)). `--changed` narrows the set to files git reports as modified; `--include` names an explicit subset.
2. **Build the indexes.** A file index (every target path) lets adapters resolve references to other workspace files. A symbol index (every public symbol name across the workspace) lets a doc link a dependency to the doc that defines it.
3. **Analyze each file.** The language adapter for the file returns its public symbols, its dependencies, and any docstrings ([core.ts](../layer-4/packages/engine/src/live-docs/core.ts.mdmd.md)).
4. **Render the generated sections.** `Public Symbols` and `Dependencies` always; `Re-Exported Symbol Anchors` when a file re-exports symbols from elsewhere. Every link is relative to the doc's own directory.
5. **Merge and write.** The existing doc is read through the grammar ([document.ts](../layer-4/packages/engine/src/live-docs/document.ts.mdmd.md)) so that its authored block and its timestamp carry forward; a doc the grammar refuses keeps both and has everything else replaced. The whole doc is then rendered from the model. The doc is written only when its rendered text differs from what is on disk; `--dry-run` reports instead of writing.
6. **Prune.** Docs whose source file no longer exists are deleted, unless they contain authored content. Pruning is skipped under `--changed` and `--include`.
7. **Write the graph index.** Every doc on disk is read back through the grammar and the graph is derived from them ([graph.ts](../layer-4/packages/engine/src/live-docs/graph.ts.mdmd.md)): each doc's parsed model, every link resolved to the file it lands on, and the inbound and outbound adjacency. It is written to `<root>/index.json` (here `.mdmd/index.json`), which is gitignored. A doc the grammar refuses, such as a preserved orphan written by hand, stops this step with its path and line; the docs written in steps 5 and 6 stay written.

## What a run keeps

- The authored `Purpose` and `Notes` of every existing doc, verbatim.
- The `Generated At` timestamp, unless the generated content changed.
- The order and delimiters of generated sections, so two runs over the same source produce byte-identical files.

## What a run does not do

- It does not delete a stale doc that has authored content. It logs "Preserving … (authored content detected)" and leaves the doc in place; run `npm run live-docs:orphans` after deleting source files and remove the orphans by hand.
- It does not read the previous doc's generated regions. Everything generated comes from the source file on this run.
- It does not write anywhere except the configured base layer directory and the graph index beside it.

## Configuration

Root, base layer, extension, archetype globs, and bundle exclusions come from `.live-docs.config.json` through [liveDocumentationConfig.ts](../layer-4/packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md). This workspace uses `.mdmd/layer-4` and the `.mdmd.md` extension; the shipped default is `.live-documentation/source` and `.md`. Product code reads the configuration and never assumes either layout.

## History

Until 2026-09-27 the generator also wrote `Observed Evidence`, `Targets` and `Supporting Fixtures` sections from a generated manifest of which tests import which files. They duplicated the dependency edges and changed without the source changing, so they were retired; see the decisions log.

Until 2026-09-27 this document described the pipeline in the vocabulary of a retired specification process (component and requirement identifiers, a graph projector, diagnostics publishers, Copilot prompt builders). None of those parts exist; what is described above is the code as it runs today.
