# Live Documentation Pipeline

_Current as of 2026-10-19._

## Purpose

Describe what one run of the generator does, what it reads, what it writes, and what it promises to keep. The generator is `generateLiveDocs` in [generator.ts](../layer-4/packages/generator/src/generator.ts.mdmd.md); the CLI wrapper is [generate.ts](../layer-4/scripts/live-docs/generate.ts.mdmd.md).

## One run

1. **Discover targets.** The configured globs select source files ([discovery.ts](../layer-4/packages/engine/src/live-docs/discovery.ts.mdmd.md)); the shipped default is every file an adapter can read, anywhere in the workspace, hidden folders included, so that a cold run over any repository is honest about what it holds (since 2026-10-16; before, the defaults were this repository's own layout). Four product rules then remove what no project wants documented, `.git`, `node_modules`, the docs root and lock files; the workspace's `.gitignore` removes what it ignores, except a file git tracks; and the configuration's `exclude` removes what the person names. `--changed` and `--include` restrict which sources are rendered, while the workspace-wide indexes still use the full discovered set.
2. **Build the indexes.** A file index (every target path) lets adapters resolve references to other workspace files and limits the DOM heuristic's nearby markup search to pages that will receive docs. A symbol index (every public symbol name across the workspace) lets a doc link a dependency to the doc that defines it. An entry index (every file a manifest's scripts, binaries or main module name, mapped from a built path to its source through the tsconfig beside the manifest) lets the entry's own doc say what starts it; the symbol and entry indexes come from one pass ([discovery.ts](../layer-4/packages/engine/src/live-docs/discovery.ts.mdmd.md)).
3. **Analyze each selected file.** Its language adapter returns public symbols, dependencies, docstrings and whether the file holds the language's program entry point ([core.ts](../layer-4/packages/engine/src/live-docs/core.ts.mdmd.md)). A full run selects every discovered source; `--changed` selects Git-modified sources and `--include` selects its explicit subset.
4. **Render the generated parts.** The `Entry` lines of the Metadata block, one per reason something outside the code starts the file: `program`, `command`, `module`, `opening`, `tooling` (a manifest, a compiler's or runner's configuration, or, since 2026-10-16, an editor's or a dev container's by its place), `declared` ([compose.ts](../layer-4/packages/engine/src/live-docs/compose.ts.mdmd.md); the vocabulary is in [the decisions log](architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)). Then the sections: `Public Symbols` and `Dependencies` always; `Re-Exported Symbol Anchors` when a file re-exports symbols from elsewhere. Every link is relative to the doc's own directory.
5. **Merge and write.** The existing doc is read through the grammar ([document.ts](../layer-4/packages/engine/src/live-docs/document.ts.mdmd.md)) so that its authored block and its timestamp carry forward; a doc the grammar refuses keeps both and has everything else replaced. The whole doc is then rendered from the model. The doc is written only when its rendered text differs from what is on disk; `--dry-run` reports instead of writing, and `--check` reports and fails when it would create, update or delete a doc.
6. **Prune.** Docs whose source file no longer exists are deleted, unless they contain authored content. `--changed` checks only stale docs at changed source paths, including a rename's old path; `--include` skips pruning.
7. **Write the graph index.** Every doc on disk is read back through the grammar and the graph is derived from them ([graph.ts](../layer-4/packages/engine/src/live-docs/graph.ts.mdmd.md)): each doc's parsed model, every link resolved to the file it lands on, and the inbound and outbound adjacency. It is written to `<root>/index.json` (here `.mdmd/index.json`), which is gitignored. A doc the grammar refuses, such as a preserved orphan written by hand, stops this step with its path and line; the docs written in steps 5 and 6 stay written.

`--changed` is a file-subset command over Git's dirty paths; it does not re-render an unchanged consumer when another file's interface changes. After such a change, run full generation to refresh the whole mirror. The current invalidation and per-file cache design remain open.

### Accepted optimization direction, not yet implemented

The owner accepted in [October 19 Turn 19](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-19) making ordinary full generation reuse proven unchanged work while keeping its complete-result contract. Output scope and computation scope are different: a cache can save analysis without withholding affected docs from the result. File-local facts and resolution against the current workspace are distinct responsibilities; the cache must account for legitimate contextual inputs, configuration and analyzer identity, and fall back to analysis when reuse cannot be established. A clean CI checkout has no dirty paths, so Git status alone cannot identify the work since a previous build.

This is an accepted direction, not a shipped cache or a changed command contract. A symbol-only reuse prototype still parsed each source twice and showed no useful saving; it was removed after [measurement](../../AI-Agent-Workspace/Probes/2026-10-19/generation-cost/README.md#follow-up-a-symbol-only-reuse-candidate-did-not-pay-for-itself). Keep the existing literal `--changed` behavior honest until a correct replacement has been tested against full generation and measured. Its earlier timing savings came from a shortcut with incomplete invalidation; they do not predict a correct cache's savings. No additional incremental mode is selected. Producer-side reuse is compatible with a complete standalone HTML export; recipients do not need its cache or earlier exports.

### Verification order

The `livedocs` command runs generation to completion before lint. In the local `safe:commit` chain this comes before the tests, so they read the updated mirror. `ci-check` selects `--check` explicitly: it compares source with the committed docs without writing them or `<root>/index.json`, fails if a doc would change, and then verifies that exact checkout. `--skip-git-status` controls only the final status report; it never selects the check mode. This gate order was repaired after the [October 19 audit](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-16) reproduced lint passing before the first doc had been written.

## What a run keeps

- The authored `Purpose` and `Notes` of every existing doc, verbatim.
- The `Generated At` timestamp, unless the generated content changed.
- The order and delimiters of generated sections, so two runs over the same source produce byte-identical files.

## What a run does not do

- It does not delete a stale doc that has authored content. It logs "Preserving … (authored content detected)" and leaves the doc in place; run `npm run live-docs:orphans` after deleting source files and remove the orphans by hand.
- It does not read the previous doc's generated regions. Everything generated comes from the source file on this run.
- It does not write anywhere except the configured base layer directory and the graph index beside it.

## Configuration

Root, base layer, extension, archetype globs, sample roots, declared entry points (`entryPoints`, paths or globs for what no rule infers: a bundler's entry named by a path string in code, a stylesheet a template links), discovery exclusions (`exclude`, paths or globs discovery skips: a folder that documents itself, a vendored tree the `.gitignore` does not cover), and bundle exclusions come from `.live-docs.config.json` through [liveDocumentationConfig.ts](../layer-4/packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md). This workspace uses `.mdmd/layer-4` and the `.mdmd.md` extension; the shipped default is `.live-documentation/source` and `.md`. Product code reads the configuration and never assumes either layout. The CLI reads the file `--config` names, else the workspace's own `.live-docs.config.json`, else the defaults; until 2026-10-17 `--workspace` without `--config` read neither and wrote the default root, as the history probe of 2026-10-16 found.

## A repository's history

`npm run live-docs:history` ([history.ts](../layer-4/scripts/live-docs/history.ts.mdmd.md), run by [computeHistory.ts](../layer-4/packages/generator/src/history/computeHistory.ts.mdmd.md)) regenerates the repository's past under one lens, this generator and one configuration, the workspace's as it stands or the file `--config` names, so that a change of the tool never looks like a change of the code. The mainline is the head's first parents, sampled every commit by default (`--every`, `--since`, `--step day|week|tag`). Each sampled commit the cache lacks is checked out into a scratch worktree under the system's temporary folder, its committed mirror removed, and generated there by a process of its own, a few at a time (`--jobs`); the shape of the derived graph (each file's archetype, symbol count and entry mark, each file-to-file edge with its count) is kept in `<root>/history/<lens>/<commit>.json`, the full index too with `--keep-index`. The sequence of those shapes, the first in full and then one delta per commit with git's renames, the directories renamed whole and the files whose content alone changed, is written to `<root>/history/history.json`, every step replayed as it is written. Nothing of it is committed: `.mdmd/history/` is gitignored here, and the folder ignores itself in any repository. A second run regenerates only what the cache lacks. `inspect --at` and `--between` answer from the sequence, and the static builder carries it beside the bundle as the exporter asks (`--history none|all|since <date>|last <n>`). The format and the design are in [Change over Time](change-over-time.mdmd.md).

## History

Until 2026-09-27 the generator also wrote `Observed Evidence`, `Targets` and `Supporting Fixtures` sections from a generated manifest of which tests import which files. They duplicated the dependency edges and changed without the source changing, so they were retired; see the decisions log.

Until 2026-09-27 this document described the pipeline in the vocabulary of a retired specification process (component and requirement identifiers, a graph projector, diagnostics publishers, Copilot prompt builders). None of those parts exist; what is described above is the code as it runs today.
