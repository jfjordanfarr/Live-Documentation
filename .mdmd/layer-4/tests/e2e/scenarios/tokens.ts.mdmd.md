# `tests/e2e/scenarios/tokens.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/scenarios/tokens.ts`
- Generated At: 2026-11-19T21:10:23.995Z

## Authored
### Purpose
Replacement tokens: a scenario says `{processor}`, and the harness resolves it against the map in front of it, with the Rosetta manifest as the token table.

### Notes
The owner's replacement tokens in [the owner's proposal](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-8), made of the Rosetta manifest's part patterns, read without regard to case. A part's subject is the file of the part that most files of other parts use, read from the map's references, so that in C it is the header `main.c` includes ([the root's rulings on the scenario builder's first handback](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-scenario-builders-first-handback)). A token the table cannot give raises an error that the spec reports as not applicable, never a guess. The manifest gained `core_types.*` for Python's types on 2026-11-18, when this resolver first read it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PRODUCTION_PARTS` {#symbol-production_parts}
- Type: const
- Source: [source](../../../../../tests/e2e/scenarios/tokens.ts#L19)

##### `PRODUCTION_PARTS` — Summary
The parts of the manifest's canonical program that tokens name; the tests are a part too, matched first.

#### `Part` {#symbol-part}
- Type: type
- Source: [source](../../../../../tests/e2e/scenarios/tokens.ts#L20)

#### `RosettaManifest` {#symbol-rosettamanifest}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/tokens.ts#L22)

#### `TokenTable (interface)` {#symbol-tokentable-interface}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/tokens.ts#L28)

##### `TokenTable (interface)` — Summary
A variant's token table, resolved against one map.

#### `TokenError` {#symbol-tokenerror}
- Type: class
- Source: [source](../../../../../tests/e2e/scenarios/tokens.ts#L42)

#### `matchesPattern` {#symbol-matchespattern}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/tokens.ts#L55)

##### `matchesPattern` — Summary
Whether a variant-relative path matches one of the manifest's patterns: `name.*` matches the file's own name;
`Dir/*` matches a file directly inside a directory of that name. Case is ignored, since the manifest writes one
spelling (`main.*`) for files that differ by language (`Main.java`, `Main.cs`).

#### `MapReference` {#symbol-mapreference}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/tokens.ts#L72)

##### `MapReference` — Summary
One reference of the map, file to file: the consumer uses the provider.

#### `tokenTable (function)` {#symbol-tokentable-function}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/tokens.ts#L108)
- Returns: [`TokenTable`](#symbol-tokentable-interface)
- Parameters: `manifest`: [`RosettaManifest`](#symbol-rosettamanifest)

##### `tokenTable (function)` — Summary
Resolves a variant's parts against a map's file ids and, when given, its references, from which each part's subject is
chosen. `root` is the prefix that turns a variant-relative path into the map's id: "" for a sample built from the
program folder, `tests/integration/programs/<language>/rosetta/` on the repository's own map, which holds the
programs as samples.

#### `resolveText` {#symbol-resolvetext}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/tokens.ts#L155)
- Parameters: `table`: [`TokenTable`](#symbol-tokentable-interface)

##### `resolveText` — Summary
A string with every `{token}` replaced; a token that stands for several files is refused here.

#### `resolveList` {#symbol-resolvelist}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/tokens.ts#L164)
- Parameters: `table`: [`TokenTable`](#symbol-tokentable-interface)

##### `resolveList` — Summary
A list of tokens or literals, each `{part*}` spread into its files.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
