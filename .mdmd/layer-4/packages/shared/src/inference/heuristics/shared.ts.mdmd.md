# packages/shared/src/inference/heuristics/shared.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/shared.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-shared-ts
- Generated At: 2026-02-16T18:46:24.250Z

## Authored
### Purpose

Provides the cross-language path normalisation, comment filtering, and reference scoring helpers that every modular fallback heuristic shares after we split the 2k-line orchestrator into discrete modules on Nov 7 so new languages plug into the same contract without duplicating logic <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L760-L840> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L820-L900>.

### Notes

- `isWithinComment` and the variant builders preserve the Ky benchmark fix that stopped commented-out imports from emitting edges, so keep tests guarding that regression in place whenever evolving these helpers <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L2108-L2178>.
- The extension-swapping logic was introduced to keep `.js` specifiers mapped onto `.ts/.tsx` sources; extend the replacement list in this helper instead of reimplementing it in future heuristics <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L2302-L2315>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:46:24.250Z","inputHash":"7be36448a65be2cf"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `cleanupReference` {#symbol-cleanupreference}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L11)

##### `cleanupReference` — Summary
Trims whitespace from a reference string, returning an empty string for
`undefined` inputs. Used as the first normalisation step in every heuristic
match pipeline.

#### `isExternalLink` {#symbol-isexternallink}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L21)

##### `isExternalLink` — Summary
Returns `true` when a value is an absolute HTTP(S) URL.

External links are excluded from workspace-internal dependency resolution
to prevent false-positive matches against local filenames.

#### `normalizePath` {#symbol-normalizepath}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L29)

##### `normalizePath` — Summary
Normalises a filesystem path to forward slashes and lowercase for
platform-independent comparison during heuristic matching.

#### `stem` {#symbol-stem}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L39)

##### `stem` — Summary
Returns the extensionless basename of a path in lowercase.

Used to build the lowest-confidence fuzzy match variant: two files
sharing a stem (e.g. `utils.ts` and `utils.py`) are weakly linked.

#### `toComparablePath` {#symbol-tocomparablepath}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L51)

##### `toComparablePath` — Summary
Converts a path or `file://` URI into a comparable normalised form.

`file://` URIs are decoded via `fileURLToPath` before normalisation;
all other inputs pass through {@link normalizePath} directly.

#### `computeReferenceStart` {#symbol-computereferencestart}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L70)
- Parameters: `match`: `RegExpMatchArray`

##### `computeReferenceStart` — Summary
Computes the start offset of a raw reference within a regex match.

When the reference appears as a substring of the full match, the returned
offset points to the reference start rather than the overall match start.
Returns `null` when neither the reference nor the match index is available.

#### `isWithinComment` {#symbol-iswithincomment}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L90)

##### `isWithinComment` — Summary
Determines whether a character position falls inside a C-style line
or block comment.

Performs a linear scan from the start of the content — O(n) per call.
Heuristics invoke this to suppress references found in commented-out code.

#### `buildReferenceVariants` {#symbol-buildreferencevariants}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L138)

##### `buildReferenceVariants` — Summary
Expands a raw reference string into a set of normalised path variants
that a workspace artifact might match.

Variants include the literal path, source-directory-resolved forms,
common extension swaps (`.js` → `.ts`), extensionless probes, and
stem/basename fallbacks. The caller then scores each variant against
the workspace artifact list via {@link evaluateVariantMatch}.

#### `VariantMatchScore` {#symbol-variantmatchscore}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L186)

##### `VariantMatchScore` — Summary
Confidence score and human-readable rationale for a single variant–artifact
match. Returned by {@link evaluateVariantMatch}.

#### `evaluateVariantMatch` {#symbol-evaluatevariantmatch}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/shared.ts#L198)
- Returns: [`VariantMatchScore`](#symbol-variantmatchscore)
- Parameters: `candidate`: [`HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact)

##### `evaluateVariantMatch` — Summary
Scores a normalised path variant against a workspace artifact.

Returns a {@link VariantMatchScore} with confidence from 0.5 (weak stem
match) to 0.8 (exact path match), or `null` when no match is found.
Used by every per-language heuristic to rank candidate dependencies.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `node:url` - `fileURLToPath`
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [symbolBridge.test.ts](../../../../extension/src/services/symbolBridge.test.ts.mdmd.md)
- [noiseFilter.test.ts](../../../../server/src/features/diagnostics/noiseFilter.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../../../../server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md)
- [fallbackInference.languages.test.ts](../fallbackInference.languages.test.ts.mdmd.md)
- [fallbackInference.test.ts](../fallbackInference.test.ts.mdmd.md)
- [linkInference.test.ts](../linkInference.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
