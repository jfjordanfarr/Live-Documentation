import path from "node:path";

import type { HeuristicArtifact, MatchCandidate, MatchContext } from "./fallbackHeuristicTypes";
import { createDefaultHeuristics } from "./heuristics";
import { isDocumentLayer, isImplementationLayer } from "./heuristics/artifactLayerUtils";
import { stem, toComparablePath } from "./heuristics/shared";
import type {
  ArtifactLayer,
  KnowledgeArtifact,
  LinkRelationship,
  LinkRelationshipKind
} from "../domain/artifacts";

/**
 * Seed data for a single workspace artifact before relationship inference.
 *
 * Seeds are the raw inputs from which {@link inferFallbackGraph} builds
 * {@link KnowledgeArtifact} instances and discovers relationships via
 * heuristic matching, user-supplied hints, or optional LLM augmentation.
 */
export interface ArtifactSeed {
  id?: string;
  uri: string;
  layer: ArtifactLayer;
  language?: string;
  owner?: string;
  lastSynchronizedAt?: string;
  hash?: string;
  metadata?: Record<string, unknown>;
  content?: string;
}

/**
 * A user-supplied or externally-derived relationship hint between two artifacts.
 *
 * Hints are treated as high-confidence edges during fallback inference and
 * bypass heuristic matching. They're typically derived from configuration
 * files, manual overrides, or prior LLM runs.
 */
export interface RelationshipHint {
  sourceUri: string;
  targetUri: string;
  kind?: LinkRelationshipKind;
  confidence?: number;
  rationale?: string;
  createdBy?: string;
  context?: string;
}

/**
 * A single relationship suggestion returned by an LLM bridge during
 * augmented fallback inference.
 */
export interface LLMRelationshipSuggestion {
  targetUri: string;
  kind: LinkRelationshipKind;
  confidence: number;
  rationale?: string;
  context?: string;
}

/**
 * Payload sent to an {@link FallbackLLMBridge} requesting relationship
 * suggestions for a source artifact against a set of candidates.
 */
export interface LLMRelationshipRequest {
  source: KnowledgeArtifact;
  content?: string;
  candidates: KnowledgeArtifact[];
  hints: RelationshipHint[];
}

/**
 * Adapter interface for plugging an LLM into the fallback inference pipeline.
 *
 * When provided via {@link FallbackGraphOptions.llm}, the inference engine
 * sends candidate batches to `suggest()` and merges the results with
 * heuristic-derived links. The `vscode.lm` API is the primary production
 * implementation.
 */
export interface FallbackLLMBridge {
  label: string;
  suggest(request: LLMRelationshipRequest): Promise<LLMRelationshipSuggestion[]>;
}

/**
 * Input bundle for {@link inferFallbackGraph}: the set of artifact seeds
 * to analyze plus optional pre-existing relationship hints and a content
 * provider for reading file bodies on demand.
 */
export interface FallbackGraphInput {
  seeds: ArtifactSeed[];
  hints?: RelationshipHint[];
  contentProvider?: (uri: string) => Promise<string | undefined>;
}

/**
 * Configuration options for {@link inferFallbackGraph}.
 *
 * @property llm - Optional LLM bridge for augmented inference.
 * @property minContentLengthForLLM - Minimum source content length to
 *   trigger an LLM call (default 120 chars).
 * @property now - Clock factory for deterministic timestamps in tests.
 */
export interface FallbackGraphOptions {
  llm?: FallbackLLMBridge;
  minContentLengthForLLM?: number;
  now?: () => Date;
}

/** Discriminator indicating how a relationship was discovered. */
export type InferenceTraceOrigin = "heuristic" | "hint" | "llm";

/**
 * Audit record for a single inferred relationship, capturing provenance
 * (heuristic ID, LLM rationale, or hint source) for the benchmark/report
 * pipeline to evaluate precision and recall.
 */
export interface InferenceTraceEntry {
  sourceUri: string;
  targetUri: string;
  kind: LinkRelationshipKind;
  origin: InferenceTraceOrigin;
  confidence: number;
  rationale: string;
  context?: string;
  heuristicId?: string;
  createdBy?: string;
}

/**
 * Complete output of {@link inferFallbackGraph}: the resolved artifact
 * graph, inferred link relationships, and per-link audit traces.
 */
export interface FallbackInferenceResult {
  artifacts: KnowledgeArtifact[];
  links: LinkRelationship[];
  traces: InferenceTraceEntry[];
}

interface ArtifactAggregate {
  artifact: KnowledgeArtifact;
  content?: string;
}

const DEFAULT_MIN_CONTENT_LENGTH_FOR_LLM = 120;
const HEURISTIC_CREATED_BY = "heuristic";
const HINT_CREATED_BY = "hint";

/**
 * Core fallback inference engine: builds a {@link KnowledgeArtifact} graph
 * from seed data, discovers relationships via path/naming heuristics,
 * incorporates user-supplied hints, and optionally augments with LLM
 * suggestions.
 *
 * This is the primary entry point for the link-aware diagnostics pipeline
 * when SCIP indexes are unavailable (most polyglot workspaces). Results
 * feed the benchmark suite, the graph snapshot CLI, and the Live Docs
 * dependency sections.
 *
 * @param input - Artifact seeds, optional hints, and content provider.
 * @param options - LLM bridge and tuning knobs.
 * @returns Resolved artifacts, inferred links, and audit traces.
 */
export async function inferFallbackGraph(
  input: FallbackGraphInput,
  options: FallbackGraphOptions = {}
): Promise<FallbackInferenceResult> {
  const nowFactory = options.now ?? (() => new Date());
  const hints = input.hints ?? [];
  const aggregatesByUri = new Map<string, ArtifactAggregate>();
  const insertionOrder: string[] = [];

  for (const seed of input.seeds) {
    const normalizedUri = normalizeUri(seed.uri);
    if (!normalizedUri) {
      continue;
    }

    let aggregate = aggregatesByUri.get(normalizedUri);
    if (!aggregate) {
      aggregate = {
        artifact: {
          id: seed.id ?? computeArtifactId(normalizedUri),
          uri: normalizedUri,
          layer: seed.layer,
          language: seed.language,
          owner: seed.owner,
          lastSynchronizedAt: seed.lastSynchronizedAt,
          hash: seed.hash,
          metadata: sanitizedMetadata(seed.metadata)
        }
      } satisfies ArtifactAggregate;
      aggregate.content = seed.content;
      aggregatesByUri.set(normalizedUri, aggregate);
      insertionOrder.push(normalizedUri);
      continue;
    }

    const { artifact } = aggregate;
    if (seed.id) {
      artifact.id = seed.id;
    }
    artifact.layer = seed.layer;
    if (seed.language) {
      artifact.language = seed.language;
    }
    if (seed.owner) {
      artifact.owner = seed.owner;
    }
    if (seed.lastSynchronizedAt) {
      artifact.lastSynchronizedAt = seed.lastSynchronizedAt;
    }
    if (seed.hash) {
      artifact.hash = seed.hash;
    }
    if (seed.metadata && Object.keys(seed.metadata).length > 0) {
      artifact.metadata = { ...(artifact.metadata ?? {}), ...seed.metadata };
    }
    if (seed.content !== undefined) {
      aggregate.content = seed.content;
    }
  }

  if (input.contentProvider) {
    await Promise.all(
      insertionOrder.map(async (uri) => {
        const aggregate = aggregatesByUri.get(uri);
        if (!aggregate || aggregate.content !== undefined) {
          return;
        }
        try {
          const content = await input.contentProvider!(uri);
          if (typeof content === "string") {
            aggregate.content = content;
          }
        } catch {
          // best-effort fetch; ignore provider failures
        }
      })
    );
  }

  const heuristicArtifacts = insertionOrder.map((uri) => {
    const aggregate = aggregatesByUri.get(uri)!;
    const comparablePath = toComparablePath(uri);
    const basename = path.basename(comparablePath);
    return {
      artifact: aggregate.artifact,
      content: aggregate.content,
      comparablePath,
      basename,
      stem: stem(comparablePath)
    } satisfies HeuristicArtifact;
  });

  const heuristics = await createDefaultHeuristics();
  for (const heuristic of heuristics) {
    await heuristic.initialize?.(heuristicArtifacts);
  }

  const knowledgeArtifacts = heuristicArtifacts.map((entry) => ({ ...entry.artifact }));
  const artifactById = new Map<string, KnowledgeArtifact>();
  const artifactByUri = new Map<string, KnowledgeArtifact>();

  for (const artifact of knowledgeArtifacts) {
    artifactById.set(artifact.id, artifact);
    artifactByUri.set(normalizeUri(artifact.uri), artifact);
  }

  const accumulator = new RelationshipAccumulator(nowFactory, artifactById, artifactByUri);

  for (const heuristic of heuristics) {
    for (const source of heuristicArtifacts) {
      if (!heuristic.appliesTo(source)) {
        continue;
      }
      await heuristic.evaluate(source, (candidate) => {
        accumulator.addHeuristicMatch(source, candidate, heuristic.id);
      });
    }
  }

  for (const hint of hints) {
    accumulator.addHint(hint);
  }

  if (options.llm) {
    const minContentLength = options.minContentLengthForLLM ?? DEFAULT_MIN_CONTENT_LENGTH_FOR_LLM;
    await applyLlmSuggestions(heuristicArtifacts, options.llm, hints, minContentLength, accumulator);
  }

  return {
    artifacts: knowledgeArtifacts,
    links: accumulator.getLinks(),
    traces: accumulator.getTraces()
  };
}

async function applyLlmSuggestions(
  artifacts: HeuristicArtifact[],
  llm: FallbackLLMBridge,
  hints: RelationshipHint[],
  minContentLength: number,
  accumulator: RelationshipAccumulator
): Promise<void> {
  for (const source of artifacts) {
    const content = source.content ?? "";
    if (content.length < minContentLength) {
      continue;
    }
    if (!isDocumentLayer(source.artifact.layer)) {
      continue;
    }

    try {
      const suggestions = await llm.suggest({
        source: source.artifact,
        content,
        candidates: accumulator.getArtifacts(),
        hints
      });

      for (const suggestion of suggestions ?? []) {
        accumulator.addLlmSuggestion(source.artifact, suggestion, llm.label);
      }
    } catch {
      // ignore LLM failures so heuristic results can still surface
    }
  }
}

class RelationshipAccumulator {
  private readonly links = new Map<string, LinkRelationship>();
  private readonly traces: InferenceTraceEntry[] = [];

  constructor(
    private readonly now: () => Date,
    private readonly artifactsById: Map<string, KnowledgeArtifact>,
    private readonly artifactsByUri: Map<string, KnowledgeArtifact>
  ) {}

  addHeuristicMatch(source: HeuristicArtifact, candidate: MatchCandidate, heuristicId: string): void {
    const sourceArtifact = source.artifact;
    const targetArtifact = candidate.target.artifact;
    if (!sourceArtifact || !targetArtifact || sourceArtifact.id === targetArtifact.id) {
      return;
    }

    const kind = deriveRelationshipKind(sourceArtifact, targetArtifact, candidate.context);
    this.upsertLink(
      sourceArtifact,
      targetArtifact,
      kind,
      candidate.confidence,
      HEURISTIC_CREATED_BY,
      "heuristic",
      candidate.rationale,
      candidate.context,
      heuristicId
    );
  }

  addHint(hint: RelationshipHint): void {
    const source = this.artifactsByUri.get(normalizeUri(hint.sourceUri));
    const target = this.artifactsByUri.get(normalizeUri(hint.targetUri));
    if (!source || !target) {
      return;
    }

    const confidence = hint.confidence ?? 0.7;
    const kind = hint.kind ?? deriveRelationshipKind(source, target, hint.context as MatchContext | undefined);
    this.upsertLink(
      source,
      target,
      kind,
      confidence,
      hint.createdBy ?? HINT_CREATED_BY,
      "hint",
      hint.rationale ?? "relationship hint",
      hint.context
    );
  }

  addLlmSuggestion(source: KnowledgeArtifact, suggestion: LLMRelationshipSuggestion, label: string): void {
    const target = this.artifactsByUri.get(normalizeUri(suggestion.targetUri));
    if (!target) {
      return;
    }

    const kind = suggestion.kind ?? deriveRelationshipKind(source, target, suggestion.context as MatchContext | undefined);
    this.upsertLink(
      source,
      target,
      kind,
      suggestion.confidence,
      label,
      "llm",
      suggestion.rationale ?? `LLM ${label} suggestion`,
      suggestion.context
    );
  }

  getLinks(): LinkRelationship[] {
    return Array.from(this.links.values());
  }

  getTraces(): InferenceTraceEntry[] {
    return [...this.traces];
  }

  getArtifacts(): KnowledgeArtifact[] {
    return Array.from(this.artifactsById.values());
  }

  private upsertLink(
    source: KnowledgeArtifact,
    target: KnowledgeArtifact,
    kind: LinkRelationshipKind,
    confidence: number,
    createdBy: string,
    origin: InferenceTraceOrigin,
    rationale: string,
    context?: string,
    heuristicId?: string
  ): void {
    const clamped = clampConfidence(confidence);
    const key = linkKey(source.id, target.id, kind);
    const existing = this.links.get(key);

    if (!existing || clamped > existing.confidence) {
      const createdAt = this.now().toISOString();
      this.links.set(key, {
        id: existing?.id ?? computeLinkId(source.id, target.id, kind),
        sourceId: source.id,
        targetId: target.id,
        kind,
        confidence: clamped,
        createdAt,
        createdBy
      });
    }

    this.traces.push({
      sourceUri: source.uri,
      targetUri: target.uri,
      kind,
      origin,
      confidence: clamped,
      rationale,
      context,
      heuristicId,
      createdBy
    });
  }
}

function deriveRelationshipKind(
  source: KnowledgeArtifact,
  target: KnowledgeArtifact,
  context: MatchContext | undefined
): LinkRelationshipKind {
  switch (context) {
    case "include":
      return "includes";
    case "call":
    case "require":
    case "import":
    case "use":
      return "depends_on";
  }

  if (isDocumentLayer(source.layer) && isImplementationLayer(target.layer)) {
    return "documents";
  }

  if (source.layer === "architecture" && isImplementationLayer(target.layer)) {
    return "implements";
  }

  if (isImplementationLayer(source.layer) && target.layer === "architecture") {
    return "implements";
  }

  if (isImplementationLayer(source.layer) && isImplementationLayer(target.layer)) {
    return "depends_on";
  }

  return "references";
}

function clampConfidence(confidence: number): number {
  if (!Number.isFinite(confidence)) {
    return 0.5;
  }
  return Math.max(0, Math.min(1, confidence));
}

function linkKey(sourceId: string, targetId: string, kind: LinkRelationshipKind): string {
  return `${sourceId}|${targetId}|${kind}`;
}

function computeLinkId(sourceId: string, targetId: string, kind: LinkRelationshipKind): string {
  return computeDeterministicId("orchestrated-link", `${sourceId}|${targetId}|${kind}`);
}

function computeArtifactId(uri: string): string {
  return computeDeterministicId("orchestrated-artifact", uri);
}

function computeDeterministicId(namespace: string, value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `${namespace}-${hex}`;
}

function normalizeUri(uri: string): string {
  return uri.trim();
}

function sanitizedMetadata(source: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!source || Object.keys(source).length === 0) {
    return undefined;
  }
  return { ...source };
}
