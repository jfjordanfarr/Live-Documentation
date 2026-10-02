# tests/integration/programs/rosetta-manifest.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/rosetta-manifest.json
- Generated At: 2026-10-02T20:20:08.067Z

## Authored
### Purpose
Catalog of the eight Rosetta sample programs: their common roles and relationships, concrete source directories and entry points, and available compiler expectations.

### Notes
- Concrete filesystem paths are relative to this manifest. Canonical node globs and import examples describe the language-independent pattern; they are not literal file references.
- Each variant links its existing compiler observations when its language has an indexer. C and Ruby have no such observations in this collection.
- The cross-language program originated on January 14, 2026; see the [session summary](../../../../../AI-Agent-Workspace/ChatHistory/2026/01/Summarized/2026-01-14.1.SUMMARIZED.md) for its rationale.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `schema` {#symbol-schema}
- Type: key

#### `description` {#symbol-description}
- Type: key

#### `tiers` {#symbol-tiers}
- Type: key

#### `tiers:type-safe` {#symbol-tierstype-safe}
- Type: key

#### `tiers:type-safe:description` {#symbol-tierstype-safedescription}
- Type: key

#### `tiers:type-safe:languages` {#symbol-tierstype-safelanguages}
- Type: key

#### `tiers:dynamic` {#symbol-tiersdynamic}
- Type: key

#### `tiers:dynamic:description` {#symbol-tiersdynamicdescription}
- Type: key

#### `tiers:dynamic:languages` {#symbol-tiersdynamiclanguages}
- Type: key

#### `canonicalProgram` {#symbol-canonicalprogram}
- Type: key

#### `canonicalProgram:description` {#symbol-canonicalprogramdescription}
- Type: key

#### `canonicalProgram:nodes` {#symbol-canonicalprogramnodes}
- Type: key

#### `canonicalProgram:edges` {#symbol-canonicalprogramedges}
- Type: key

#### `canonicalProgram:importPatterns` {#symbol-canonicalprogramimportpatterns}
- Type: key

#### `canonicalProgram:importPatterns:description` {#symbol-canonicalprogramimportpatternsdescription}
- Type: key

#### `canonicalProgram:importPatterns:patterns` {#symbol-canonicalprogramimportpatternspatterns}
- Type: key

#### `variants` {#symbol-variants}
- Type: key

#### `validation` {#symbol-validation}
- Type: key

#### `validation:description` {#symbol-validationdescription}
- Type: key

#### `validation:rules` {#symbol-validationrules}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`main`](./c/rosetta/src/main.c.mdmd.md)
- [`compiler-edges`](./csharp/rosetta/expected/compiler-edges.json.mdmd.md)
- [`Main`](./csharp/rosetta/src/App/Main.cs.mdmd.md)
- [`compiler-edges`](./go/rosetta/expected/compiler-edges.json.mdmd.md)
- [`main`](./go/rosetta/src/main/main.go.mdmd.md)
- [`compiler-edges`](./java/rosetta/expected/compiler-edges.json.mdmd.md)
- [`Main`](./java/rosetta/src/com/rosetta/app/Main.java.mdmd.md)
- [`compiler-edges`](./python/rosetta/expected/compiler-edges.json.mdmd.md)
- [`main`](./python/rosetta/src/main.py.mdmd.md)
- [`main`](./ruby/rosetta/lib/main.rb.mdmd.md)
- [`compiler-edges`](./rust/rosetta/expected/compiler-edges.json.mdmd.md)
- [`main`](./rust/rosetta/src/main.rs.mdmd.md)
- [`compiler-edges`](./typescript/rosetta/expected/compiler-edges.json.mdmd.md)
- [`main`](./typescript/rosetta/src/main.ts.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
