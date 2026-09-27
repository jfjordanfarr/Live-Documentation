# Live Documentation Shared Core

_Current as of 2026-09-27._

## Purpose

The modules under `packages/shared/src/live-docs` that every consumer of Live Docs shares: the grammar of a doc, the composition of a doc from a source file's analysis, and the analysis engine itself.

## What is here

- [document.ts](../layer-4/packages/shared/src/live-docs/document.ts.mdmd.md) is the grammar: the model of a Live Doc, `renderLiveDoc`, which writes one, and `parseLiveDoc`, which reads one back and refuses anything the grammar does not describe. Rendering what was parsed gives back the same text for every doc the generator writes, and the round-trip suite checks that on every committed doc.
- [compose.ts](../layer-4/packages/shared/src/live-docs/compose.ts.mdmd.md) turns a file's analysis into the model: unique headings and anchors, links from type references and dependencies to the docs that declare them, and the documentation sections.
- [core.ts](../layer-4/packages/shared/src/live-docs/core.ts.mdmd.md) is the entry point to the analysis engine: discovery, the symbol index, the TypeScript extractor, dependency resolution and the language adapters.
- [schema.ts](../layer-4/packages/shared/src/live-docs/schema.ts.mdmd.md) holds the provenance types written into the generated comment.

## Who reads docs

The generator, to carry a doc's authored block and timestamp forward; `live-docs:lint`; the graph behind the Explorer and `inspect`; and `oracle:compare`. All of them read a doc through `parseLiveDoc`. The Explorer client still splits a doc into its three top-level sections for display, the one reader outside the grammar, and it goes when the Explorer reads the derived index.

## History

Until 2026-09-27 a parser (`parse.ts`) recovered a fraction of what two renderers (`markdown.ts`, `rendering.ts`) wrote, and each consumer pattern-matched the rest for itself. The decisions log records the grammar under "The Live Doc Grammar".
