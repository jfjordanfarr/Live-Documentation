# The Live Documentation Engine

_Current as of 2026-09-28._

## Purpose

`packages/engine` is what the vision calls the engine: configuration, the language adapters, the analysis of a source file, the grammar of a Live Doc, the composition of a doc from an analysis, and the graph derived from the docs. This page covers the modules under `packages/engine/src/live-docs` that every consumer of Live Docs shares; the adapters have [their own page](polyglot-adapters.mdmd.md).

## What is here

- [document.ts](../layer-4/packages/engine/src/live-docs/document.ts.mdmd.md) is the grammar: the model of a Live Doc, `renderLiveDoc`, which writes one, and `parseLiveDoc`, which reads one back and refuses anything the grammar does not describe. Rendering what was parsed gives back the same text for every doc the generator writes, and the round-trip suite checks that on every committed doc.
- [compose.ts](../layer-4/packages/engine/src/live-docs/compose.ts.mdmd.md) turns a file's analysis into the model: unique headings and anchors, links from type references and dependencies to the docs that declare them, and the documentation sections.
- [graph.ts](../layer-4/packages/engine/src/live-docs/graph.ts.mdmd.md) is the derived graph index: every parsed doc plus what only the whole corpus can say, which file each link lands on and which files point at each doc. It touches no file system, so the Explorer client reads a graph the same way the CLI does. [graphFiles.ts](../layer-4/packages/engine/src/live-docs/graphFiles.ts.mdmd.md) reads the docs from disk into a graph and writes a graph to `<root>/index.json`.
- [openings.ts](../layer-4/packages/engine/src/live-docs/openings.ts.mdmd.md) is what a file serves across a process boundary and how a call finds the file that serves it: routes, addresses, database objects, and the home of a file. An edge found this way carries its basis, `contract` or `configuration`, as a qualifier on the dependency line and as `basis` on the graph edge. The design is in [Openings](openings.mdmd.md).
- [core.ts](../layer-4/packages/engine/src/live-docs/core.ts.mdmd.md) is the entry point to the analysis engine: discovery, the symbol index, the TypeScript extractor, dependency resolution and the language adapters.

## Who reads docs

The generator reads a doc through `parseLiveDoc` to carry its authored block and timestamp forward, and writes the graph index after every run. Everything else reads the graph: `live-docs:lint` derives it from the docs it has just validated, `inspect` and `oracle:compare` read it from the docs, and the static builder puts it in the Explorer bundle, where the client projects it into the shape its views render and renders a doc back to markdown from it. Nothing reads a doc by pattern-matching its text.

## History

Until 2026-09-27 a parser (`parse.ts`) recovered a fraction of what two renderers (`markdown.ts`, `rendering.ts`) wrote, and each consumer pattern-matched the rest for itself. The decisions log records the grammar under "The Live Doc Grammar".
