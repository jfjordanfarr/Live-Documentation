# `scripts/oracle/compare.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/compare.ts`
- Entry: command `oracle:compare` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-21T05:42:31.655Z

## Authored
### Purpose
The `oracle:compare` command: runs the shipped generator over a copy of a sample program and lists where the dependency edges of its graph disagree with the program's compiler-derived and hand-verified expectations.

### Notes
- Prints a list, never a score, and exits 0 either way. The integration suite `oracle.test.ts` asserts that every expected edge is accounted for and, since 2026-11-21, that every hand-verified edge the readers miss is listed in the program's ledger, `expected/hand-verified-misses.json`, with its cause, and no listed edge is drawn again: `heldToLedger` says which of either there are, and the report prints each missed edge's cause ([the account](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)).
- Since 2026-11-21 the compiler's missing and extra edges are held to `tests/integration/programs/compiler-differences.json`, a ledger by cause found at the root of the sample programs (`<root>/<language>/<program>`): the report names each edge's cause and kind, the ones no cause lists, and the listed ones no longer found, an edge being told by its side as well as its ends; `heldToLedger` serves both ledgers ([the account](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)).
- A project reference is graded between the manifests standing in the two projects' folders: the project file named for the project, or else the folder's one manifest (Cargo's, npm's, Maven's, Gradle's, Go's, Python's). A reference between projects with no manifest of their own in the fixture is listed apart, by the projects' names, and graded neither found nor missing: Cargo's targets are such, a binary's and a test's folder being their crate root's. Until 2026-11-21 every project was named `<directory>/<name>.csproj`, right for .NET alone, and `rust/stockroom` reported two missing references between `.csproj` files that do not exist ([the account](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)).
- Reads the adapter's edges from the graph derived from the generated docs (since 2026-09-28). Only dependency-line edges count, not type references, so the measurement is the one recorded in the decisions log.
- Edges the adapter finds between files the compiler never indexed (markup, configuration, scripts) are reported separately as beyond the compiler's view, not as errors.
- A fixture is generated under the product's default configuration as it stands. `fixtureGlobs()`, which rebuilt the default globs from their suffixes and so always equalled them, went on 2026-10-22 with the every-file default ([Turn 8 of the October 21 session](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-21/2026-10-21.1.record.md#turn-8)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HandVerifiedMiss` {#symbol-handverifiedmiss}
- Type: interface
- Source: [source](../../../../scripts/oracle/compare.ts#L42)

##### `HandVerifiedMiss` — Summary
A hand-verified edge the readers do not draw, as a program's ledger lists it: its ends and its cause, in a sentence a maintainer can act on.

#### `readHandVerifiedMisses` {#symbol-readhandverifiedmisses}
- Type: function
- Source: [source](../../../../scripts/oracle/compare.ts#L49)
- Returns: [`HandVerifiedMiss`](#symbol-handverifiedmiss)[]

##### `readHandVerifiedMisses` — Summary
Reads a program's ledger of hand-verified misses, its paths relative to the ledger, into fixture-relative ones; empty when it keeps none.

#### `heldToLedger` {#symbol-heldtoledger}
- Type: function
- Source: [source](../../../../scripts/oracle/compare.ts#L60)
- Constraints: `LedgerEdge`

##### `heldToLedger` — Summary
Holds the differences found to a ledger of them: those it does not list, and its entries no longer found, because a
reader now draws the edge, or no longer draws it, or nobody asserts it any more. Either is a failure, so that the
ledger can only shrink truthfully. An edge is told by its ends and, for the compiler's, by its side.

#### `CompilerDifference` {#symbol-compilerdifference}
- Type: interface
- Source: [source](../../../../scripts/oracle/compare.ts#L74)
- Extends: `LedgerEdge`

##### `CompilerDifference` — Summary
An edge the compiler records and the readers do not draw, or the reverse, in one sample program.

#### `CompilerCause` {#symbol-compilercause}
- Type: interface
- Source: [source](../../../../scripts/oracle/compare.ts#L84)

##### `CompilerCause` — Summary
A cause of differences with the compiler, as the sample programs' ledger (`compiler-differences.json`) states it:
what the reader does and what the compiler does, in a sentence; whether it is a gap the readers mean to close, a
difference of grain they may keep, or an edge beyond what the compiler sees; and the differences it explains.

#### `COMPILER_LEDGER` {#symbol-compiler_ledger}
- Type: const
- Source: [source](../../../../scripts/oracle/compare.ts#L91)

##### `COMPILER_LEDGER` — Summary
The ledger of differences with the compiler, kept once for every sample program at the root they share.

#### `readCompilerCauses` {#symbol-readcompilercauses}
- Type: function
- Source: [source](../../../../scripts/oracle/compare.ts#L94)
- Returns: [`CompilerCause`](#symbol-compilercause)[]

##### `readCompilerCauses` — Summary
Reads the ledger of causes; empty when there is none.

#### `Report` {#symbol-report}
- Type: interface
- Source: [source](../../../../scripts/oracle/compare.ts#L105)

##### `Report` — Summary
What the comparison found, bucket by bucket.

#### `compareFixture` {#symbol-comparefixture}
- Type: function
- Source: [source](../../../../scripts/oracle/compare.ts#L321)

##### `compareFixture` — Summary
Runs the generator over a copy of the fixture and reports its disagreements with the oracle files.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path` - `path`
- `node:process` - `process`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`graphFiles.readLiveDocGraph`](../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`generator.generateLiveDocs`](../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`files.HandVerifiedEdge`](./files.ts.mdmd.md#symbol-handverifiededge)
- [`files.HandVerifiedEdges`](./files.ts.mdmd.md#symbol-handverifiededges)
- [`files.readHandVerifiedEdges`](./files.ts.mdmd.md#symbol-readhandverifiededges)
- [`files.readOracleEdges`](./files.ts.mdmd.md#symbol-readoracleedges)
- [`files.rebasePath`](./files.ts.mdmd.md#symbol-rebasepath)
- [`fixture.copyFixture`](./fixture.ts.mdmd.md#symbol-copyfixture)
- [`scip-edges.OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/openings.mdmd.md`](../../../layer-3/openings.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
