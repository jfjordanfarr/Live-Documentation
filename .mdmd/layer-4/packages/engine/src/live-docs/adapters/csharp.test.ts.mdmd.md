# packages/engine/src/live-docs/adapters/csharp.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/csharp.test.ts
- Generated At: 2026-09-27T23:21:30.377Z

## Authored
### Purpose
Keeps the C# adapter's claims since its rewrite on tree-sitter: the symbols it publishes (types, non-private members, interface members, nested types, records and delegates, with XML documentation, qualified names and the types in signatures without framework types); name resolution by scope (the enclosing namespace over a `using`, aliases, attribute names, a partial class to its peer file, namespaces outside the workspace listed except `System`); the dependencies no compiler sees (configuration keys through constants of this file and another, a WCF client to the endpoint it names, reflection targets in strings); and the openings (routes served from a prefix and attributes, a client linked away from home to the controller serving each call with an unserved one kept as an external, a data context linked to its connection string and to the procedure and table it names through constants).

### Notes
- Written on 2026-09-27 with the rewrite ([Turn 3](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-3)), when the adapter went from 0 to 37 of the estate's 37 compiler edges, and grown on 2026-09-28 with the opening cases ([Turn 34](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-34)). Every file is written to a temporary folder and analysed over it, so the resolution runs over real files and a real workspace table; the route and SQL cases use a hand-built symbol index with the estate's paths.
- How the resolution works is told in `csharp.ts`'s own doc; these cases are the contract it keeps, and `oracle:compare` over the estate is the measure outside it.

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
- [`csharp.csharpAdapter`](./csharp.ts.mdmd.md#symbol-csharpadapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
