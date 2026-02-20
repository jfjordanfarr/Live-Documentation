# Fallback Inference Heuristic Modules

## Metadata

- Layer: 3
- Component IDs: COMP-003
- Related Docs: [Language Server Architecture](./language-server-architecture.mdmd.md), [Fallback Inference](../../.mdmd/layer-4/packages/shared/src/inference/fallbackInference.ts.mdmd.md)

## Components

### COMP-003 – Heuristic Suite

- Purpose: Encapsulate language and document heuristics behind a consistent contract so `fallbackInference.ts` remains an orchestration shell under 500 lines while feeding Live Documentation dependency generation.
- RequirementID: FR-LD2

## Responsibilities

- Serve as the **fallback dependency resolution layer** beneath SCIP adapters. When a SCIP index is available for a language, the adapter's ground-truth edges take precedence; heuristics fill gaps for languages or constructs that lack SCIP coverage.
- Preserve the historical heuristic evaluation order to maintain benchmark parity and Live Doc dependency precision.
- Keep per-language logic pure and index-driven so fixtures remain deterministic across runs and compatible with Live Doc regeneration.
- Provide traceable identifiers and rationales for every emitted match to aid telemetry, debugging, and provenance entries inside Live Docs.
- Emit archetype-aware hints (implementation vs test) so the Live Doc generator can classify `Dependencies`, `Targets`, and `Supporting Fixtures` correctly.

## Interfaces

### FallbackHeuristic

- Code: [`FallbackHeuristic`](../../packages/shared/src/inference/fallbackHeuristicTypes.ts)
- Defines the contract (`id`, optional `initialize`, `appliesTo`, `evaluate`) that every heuristic module implements.

### HeuristicArtifact

- Code: [`HeuristicArtifact`](../../packages/shared/src/inference/fallbackHeuristicTypes.ts)
- Wraps `KnowledgeArtifact` metadata with normalized path fields consumed by heuristics.

### MatchCandidate

- Code: [`MatchCandidate`](../../packages/shared/src/inference/fallbackHeuristicTypes.ts)
- Describes emitted relationships with target artifact, confidence, rationale, and match context.

### MatchContext

- Code: [`MatchContext`](../../packages/shared/src/inference/fallbackHeuristicTypes.ts)
- Enumerates lexical contexts (`"import"`, `"include"`, `"call"`, etc.) that map to relationship kinds downstream.

### MatchEmitter

- Code: [`MatchEmitter`](../../packages/shared/src/inference/fallbackHeuristicTypes.ts)
- Callback type supplied to heuristics so they can register `MatchCandidate` instances without mutating shared state.

### ReferenceResolution

- Code: [`ReferenceResolution`](../../packages/shared/src/inference/heuristics/referenceResolver.ts)
- Captures the result of `resolveReference` and `resolveIncludeReference`, including selected target and rationale text.

### createDefaultHeuristics

- Code: [`createDefaultHeuristics`](../../packages/shared/src/inference/heuristics/index.ts)
- Factory returning the ordered heuristic list used by `fallbackInference.ts`, preserving precedence while enabling extension.

### Shared Utility Exports

- Path: [`packages/shared/src/inference/heuristics/shared.ts`](../../packages/shared/src/inference/heuristics/shared.ts)
- Helpers: [`cleanupReference`](../../packages/shared/src/inference/heuristics/shared.ts), [`normalizePath`](../../packages/shared/src/inference/heuristics/shared.ts), [`stem`](../../packages/shared/src/inference/heuristics/shared.ts), [`toComparablePath`](../../packages/shared/src/inference/heuristics/shared.ts).
- Parsing guards: [`computeReferenceStart`](../../packages/shared/src/inference/heuristics/shared.ts), [`isWithinComment`](../../packages/shared/src/inference/heuristics/shared.ts).
- Scoring utilities: [`buildReferenceVariants`](../../packages/shared/src/inference/heuristics/shared.ts), [`evaluateVariantMatch`](../../packages/shared/src/inference/heuristics/shared.ts), [`VariantMatchScore`](../../packages/shared/src/inference/heuristics/shared.ts), [`isExternalLink`](../../packages/shared/src/inference/heuristics/shared.ts).
- Live Doc helpers: [`toLiveDocDependency`](../../packages/shared/src/inference/heuristics/shared.ts) (planned) will convert heuristic matches into generator-ready dependency descriptors.

## Linked Implementations

### createDirectiveHeuristic

- Code: [`createDirectiveHeuristic`](../../packages/shared/src/inference/heuristics/directives.ts)
- Detects `@link` directives and wiki syntax within documentation layers.

### createMarkdownHeuristic

- Code: [`createMarkdownHeuristic`](../../packages/shared/src/inference/heuristics/markdown.ts)
- Resolves markdown links into `documents` or `references` relationships based on target layers.

### createImportHeuristic

- Code: [`createImportHeuristic`](../../packages/shared/src/inference/heuristics/imports.ts)
- Parses JS/TS `import`/`export`, CommonJS `require`, and Python/Ruby import forms while ignoring comment blocks.

### createIncludeHeuristic

- Code: [`createIncludeHeuristic`](../../packages/shared/src/inference/heuristics/includes.ts)
- Handles C-style `#include` directives using the shared include resolver to resolve relative paths.

### createCFunctionHeuristic

- Code: [`createCFunctionHeuristic`](../../packages/shared/src/inference/heuristics/cFunctions.ts)
- Maps C call sites to header definitions via an index built during `initialize`.

### createRustHeuristic

- Code: [`createRustHeuristic`](../../packages/shared/src/inference/heuristics/rust.ts)
- Interprets `mod`, `use`, and `pub` paths to connect Rust modules.

### createJavaHeuristic

- Code: [`createJavaHeuristic`](../../packages/shared/src/inference/heuristics/java.ts)
- Scores Java package imports and builder-style usages for dependencies.

### createCSharpHeuristic

- Code: [`createCSharpHeuristic`](../../packages/shared/src/inference/heuristics/csharp.ts)
- Resolves `using` directives and partial type relationships for .NET projects.

### createRubyHeuristic

- Code: [`createRubyHeuristic`](../../packages/shared/src/inference/heuristics/ruby.ts)
- Covers `require` and `require_relative` behaviors for Ruby scripts.

### createWebFormsHeuristic

- Code: [`createWebFormsHeuristic`](../../packages/shared/src/inference/heuristics/webforms.ts)
- Links ASP.NET WebForms markup to backing code-behind files using manual overrides when necessary.

### resolveReference & resolveIncludeReference

- Code: [`resolveReference`](../../packages/shared/src/inference/heuristics/referenceResolver.ts), [`resolveIncludeReference`](../../packages/shared/src/inference/heuristics/referenceResolver.ts)
- Centralize path matching and relative include logic shared across markdown, import, and include heuristics.

### isDocumentLayer & isImplementationLayer

- Code: [`isDocumentLayer`](../../packages/shared/src/inference/heuristics/artifactLayerUtils.ts), [`isImplementationLayer`](../../packages/shared/src/inference/heuristics/artifactLayerUtils.ts)
- Provide consistent layer gating allowing heuristics to short-circuit when artifacts live outside their domain.

## Evidence

- [`packages/shared/src/inference/fallbackInference.languages.test.ts`](../../packages/shared/src/inference/fallbackInference.languages.test.ts) locks regression coverage for Java, Rust, Ruby, and C flows.
- [`packages/shared/src/inference/fallbackInference.test.ts`](../../packages/shared/src/inference/fallbackInference.test.ts) exercises orchestrator integration with the modular heuristics suite.
- Benchmarks: `npm run test:benchmarks -- --suite ast` validates precision/recall stability across large fixtures (e.g., `java-okhttp`, `csharp-roslyn-compilers`).
- Live Doc parity benchmark (`reports/benchmarks/live-docs/precision.json`) reports precision 100% and recall 99.90% for dependencies (symbols 100% / 98.62%), confirming heuristic-derived edges align with generated markdown `Dependencies` sections.

## Operational Notes

- Since the Jan–Feb 2026 SCIP migration, the resolution order is: **SCIP adapter → heuristic fallback**. When both produce edges for the same source–target pair, the SCIP edge wins. Heuristics still provide the primary coverage for languages without a SCIP adapter (C, Ruby, WebForms, etc.).
- Heuristic ordering mirrors the pre-refactor monolith; changes require rerunning AST benchmarks to confirm parity.
- Shared utilities must remain side-effect free; any index caching belongs inside individual heuristic closures guarded by `initialize`.
- Future extensions should add new modules to `createDefaultHeuristics()` and document them here to maintain graph coverage.
