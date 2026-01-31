import type { KnowledgeArtifact } from "../domain/artifacts";

export type MatchContext =
  | "text"
  | "import"
  | "include"
  | "directive"
  | "hint"
  | "call"
  | "require"
  | "use";

export interface HeuristicArtifact {
  artifact: KnowledgeArtifact;
  content?: string;
  comparablePath: string;
  stem: string;
  basename: string;
}

export interface MatchCandidate {
  target: HeuristicArtifact;
  confidence: number;
  rationale: string;
  context: MatchContext;
}

export type MatchEmitter = (candidate: MatchCandidate) => void;

export interface FallbackHeuristic {
  readonly id: string;
  initialize?(artifacts: readonly HeuristicArtifact[]): void | Promise<void>;
  appliesTo(source: HeuristicArtifact): boolean;
  evaluate(source: HeuristicArtifact, emit: MatchEmitter): void | Promise<void>;
}
