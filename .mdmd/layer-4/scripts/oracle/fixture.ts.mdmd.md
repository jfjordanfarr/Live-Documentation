# scripts/oracle/fixture.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/fixture.ts
- Live Doc ID: LD-implementation-scripts-oracle-fixture-ts
- Generated At: 2026-09-27T19:49:12.626Z

## Authored
### Purpose
Copies a sample program to a temporary directory and lists its files, leaving out build outputs and the program's own `expected/` directory, so that neither `oracle:index` nor `oracle:compare` reads or writes a fixture in place.

### Notes
- The skip list names what compilers and indexers leave behind (`bin`, `obj`, `target`, `node_modules`, `__pycache__`); git ignores the same directories, so a fixture never carries them.
- `listFixtureFiles` is what `oracle:index` uses to choose an indexer, so a project file inside a build output can never be chosen.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T19:49:12.626Z","inputHash":"b77a2364e0aedeaa"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `copyFixture` {#symbol-copyfixture}
- Type: function
- Source: [source](../../../../scripts/oracle/fixture.ts#L13)

##### `copyFixture` — Summary
Copies the fixture, minus build outputs and its own `expected/` directory, to a fresh temporary directory.

#### `listFixtureFiles` {#symbol-listfixturefiles}
- Type: function
- Source: [source](../../../../scripts/oracle/fixture.ts#L23)

##### `listFixtureFiles` — Summary
Every file of the fixture as a POSIX path relative to its root, minus build outputs and `expected/`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os` - `os`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->
