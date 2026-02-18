# packages/shared/src/inference/fallbackHeuristicTypes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/fallbackHeuristicTypes.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-fallbackheuristictypes-ts
- Generated At: 2026-02-18T18:15:12.237Z

## Authored
### Purpose

Defines the shared `FallbackHeuristic` contract—match contexts, emitters, and artifact adapters—introduced when we split the monolithic fallback inference into modular language plugins in [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-07.SUMMARIZED.md#turn-10-document-the-refactor-plan-lines-2001-2220](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-07.SUMMARIZED.md#turn-10-document-the-refactor-plan-lines-2001-2220).

### Notes

Serves as the hub each language module implements post-refactor (see [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-07.SUMMARIZED.md#turn-12-rebuild-fallback-orchestrator-lines-2381-2740](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-07.SUMMARIZED.md#turn-12-rebuild-fallback-orchestrator-lines-2381-2740)), keeping new heuristics—like the WebForms signals from [2025-11-06](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-06.SUMMARIZED.md#turn-26-benchmarks-fail-on-new-c-fixtures-lines-4121-4520)—consistent.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T18:15:12.237Z","inputHash":"dc45cc3d42323041"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MatchContext` {#symbol-matchcontext}
- Type: type
- Source: [source](../../../../../../packages/shared/src/inference/fallbackHeuristicTypes.ts#L18)

##### `MatchContext` — Summary
Discriminant for the syntactic context in which a dependency match was
detected.

Each value corresponds to a distinct pattern family in the language-
specific heuristic modules (e.g. `"import"` for `#include`/`import`
statements, `"call"` for function invocations, `"text"` for bare
string mentions).

##### `MatchContext` — Remarks
Created 2025-11-07 as part of the FP-style heuristic interface design.
The user explicitly requested "easily unit-testable functions which
follow common naming conventions across the other languages' pattern-
matching implementation files."

#### `HeuristicArtifact` {#symbol-heuristicartifact}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackHeuristicTypes.ts#L36)

##### `HeuristicArtifact` — Summary
An enriched view of a {@link KnowledgeArtifact} prepared for heuristic
scanning.

Pre-computes path components (`comparablePath`, `stem`, `basename`) and
optionally loads file `content` so that regex-based heuristics can
operate on strings without repeated I/O.

#### `MatchCandidate` {#symbol-matchcandidate}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackHeuristicTypes.ts#L52)

##### `MatchCandidate` — Summary
A proposed dependency relationship emitted by a heuristic during
evaluation.

Carries the target artifact, a confidence score (0–1), a human-readable
rationale string explaining why the match was proposed, and the
{@link MatchContext} indicating what syntactic pattern produced it.

#### `MatchEmitter` {#symbol-matchemitter}
- Type: type
- Source: [source](../../../../../../packages/shared/src/inference/fallbackHeuristicTypes.ts#L67)
- Parameters: `candidate`: [`MatchCandidate`](#symbol-matchcandidate)

##### `MatchEmitter` — Summary
Callback passed to {@link FallbackHeuristic.evaluate} for emitting
match candidates.

Simplified from the original `MatchAccumulator` interface sketch
(2025-11-07 chat) to a plain function type — the coordinator collects
all emitted candidates and converts them into dependency links.

#### `FallbackHeuristic` {#symbol-fallbackheuristic}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackHeuristicTypes.ts#L84)

##### `FallbackHeuristic` — Summary
The core plugin interface for language-specific dependency detection.

Each language module (C, Rust, Java, Ruby, TypeScript, etc.) exports one
or more implementations. The `fallbackInference.ts` coordinator enriches
seeds into {@link HeuristicArtifact}s, calls `initialize()` for batch
pre-computation, then iterates artifacts: for each artifact where
`appliesTo()` returns true, `evaluate()` is invoked with a
{@link MatchEmitter} to collect proposed dependency relationships.

##### `FallbackHeuristic` — Remarks
Designed 2025-11-07 at the user's request for an interface-based,
FP-leaning architecture: "adding a new glob and language syntax
detection pattern code file [should be] incredibly straightforward."
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.KnowledgeArtifact`](../domain/artifacts.ts.mdmd.md#symbol-knowledgeartifact) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [fallbackInference.languages.test.ts](./fallbackInference.languages.test.ts.mdmd.md)
- [fallbackInference.test.ts](./fallbackInference.test.ts.mdmd.md)
- [linkInference.test.ts](./linkInference.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
