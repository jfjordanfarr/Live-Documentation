import type { KnowledgeArtifact } from "../domain/artifacts";

/**
 * Discriminant for the syntactic context in which a dependency match was
 * detected.
 *
 * Each value corresponds to a distinct pattern family in the language-
 * specific heuristic modules (e.g. `"import"` for `#include`/`import`
 * statements, `"call"` for function invocations, `"text"` for bare
 * string mentions).
 *
 * @remarks
 * Created 2025-11-07 as part of the FP-style heuristic interface design.
 * The user explicitly requested "easily unit-testable functions which
 * follow common naming conventions across the other languages' pattern-
 * matching implementation files."
 */
export type MatchContext =
  | "text"
  | "import"
  | "include"
  | "directive"
  | "hint"
  | "call"
  | "require"
  | "use";

/**
 * An enriched view of a {@link KnowledgeArtifact} prepared for heuristic
 * scanning.
 *
 * Pre-computes path components (`comparablePath`, `stem`, `basename`) and
 * optionally loads file `content` so that regex-based heuristics can
 * operate on strings without repeated I/O.
 */
export interface HeuristicArtifact {
  artifact: KnowledgeArtifact;
  content?: string;
  comparablePath: string;
  stem: string;
  basename: string;
}

/**
 * A proposed dependency relationship emitted by a heuristic during
 * evaluation.
 *
 * Carries the target artifact, a confidence score (0–1), a human-readable
 * rationale string explaining why the match was proposed, and the
 * {@link MatchContext} indicating what syntactic pattern produced it.
 */
export interface MatchCandidate {
  target: HeuristicArtifact;
  confidence: number;
  rationale: string;
  context: MatchContext;
}

/**
 * Callback passed to {@link FallbackHeuristic.evaluate} for emitting
 * match candidates.
 *
 * Simplified from the original `MatchAccumulator` interface sketch
 * (2025-11-07 chat) to a plain function type — the coordinator collects
 * all emitted candidates and converts them into dependency links.
 */
export type MatchEmitter = (candidate: MatchCandidate) => void;

/**
 * The core plugin interface for language-specific dependency detection.
 *
 * Each language module (C, Rust, Java, Ruby, TypeScript, etc.) exports one
 * or more implementations. The `fallbackInference.ts` coordinator enriches
 * seeds into {@link HeuristicArtifact}s, calls `initialize()` for batch
 * pre-computation, then iterates artifacts: for each artifact where
 * `appliesTo()` returns true, `evaluate()` is invoked with a
 * {@link MatchEmitter} to collect proposed dependency relationships.
 *
 * @remarks
 * Designed 2025-11-07 at the user's request for an interface-based,
 * FP-leaning architecture: "adding a new glob and language syntax
 * detection pattern code file [should be] incredibly straightforward."
 */
export interface FallbackHeuristic {
  readonly id: string;
  initialize?(artifacts: readonly HeuristicArtifact[]): void | Promise<void>;
  appliesTo(source: HeuristicArtifact): boolean;
  evaluate(source: HeuristicArtifact, emit: MatchEmitter): void | Promise<void>;
}
