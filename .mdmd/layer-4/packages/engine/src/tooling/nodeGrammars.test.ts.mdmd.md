# `packages/engine/src/tooling/nodeGrammars.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/tooling/nodeGrammars.test.ts`
- Generated At: 2026-11-24T07:54:04.567Z

## Authored
### Purpose
Verifies `NODE_GRAMMAR_HOST` and `GrammarHost` registration: valid WebAssembly bytes for the runtime and bundled grammars, preference for the engine's own patched PowerShell build on disk, custom in-memory `GrammarHost` parsing with cache preservation, and clear failure when no host is configured.

### Notes
- Written on 2026-11-24 alongside `nodeGrammars.ts` for Step 7 of [the road to one engine for a page and a command line](../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`treeSitter.GrammarHost`](../live-docs/adapters/treeSitter.ts.mdmd.md#symbol-grammarhost) (type-only)
- [`treeSitter.getGrammarHost`](../live-docs/adapters/treeSitter.ts.mdmd.md#symbol-getgrammarhost)
- [`treeSitter.readTree`](../live-docs/adapters/treeSitter.ts.mdmd.md#symbol-readtree)
- [`treeSitter.setGrammarHost`](../live-docs/adapters/treeSitter.ts.mdmd.md#symbol-setgrammarhost)
- [`nodeGrammars.NODE_GRAMMAR_HOST`](./nodeGrammars.ts.mdmd.md#symbol-node_grammar_host)
- [`nodeGrammars.registerNodeGrammars`](./nodeGrammars.ts.mdmd.md#symbol-registernodegrammars)
- `vitest` - `afterEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
