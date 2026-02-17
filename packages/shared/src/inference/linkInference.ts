import {
  ArtifactSeed,
  RelationshipHint,
  inferFallbackGraph
} from "./fallbackInference";
import type { InferenceTraceEntry } from "./fallbackInference";
import {
  KnowledgeArtifact,
  LinkRelationship,
  LinkRelationshipKind
} from "../domain/artifacts";

type Uri = string;

type WorkspaceProviderKind = "workspace-index" | "workspace-symbols" | `workspace:${string}`;

/**
 * Union of origins that can produce trace entries in the link-inference pipeline.
 *
 * Extends the fallback engine's `InferenceTraceOrigin` with workspace-provider
 * origins that identify contributions from external data sources.
 */
export type LinkInferenceTraceOrigin = WorkspaceProviderKind | InferenceTraceEntry["origin"];

/**
 * Trace record produced by the link-inference orchestrator, documenting
 * how and why a relationship was inferred between two URIs.
 */
export interface LinkInferenceTraceEntry {
  /** URI of the source artifact. */
  sourceUri: string;
  /** URI of the target artifact. */
  targetUri: string;
  /** Inferred relationship kind. */
  kind: LinkRelationshipKind;
  /** Which subsystem originated this trace (heuristic, hint, or provider). */
  origin: LinkInferenceTraceOrigin;
  /** Confidence score in [0, 1]. */
  confidence: number;
  /** Human-readable explanation. */
  rationale: string;
  /** Optional additional context (e.g. matched import path). */
  context?: string;
}

/**
 * A single piece of link evidence contributed by a workspace provider.
 *
 * Evidence records let external data sources (e.g. a test-coverage bridge
 * or a git-co-change analyzer) inject relationships into the graph.
 */
export interface LinkEvidence {
  /** URI of the source artifact. */
  sourceUri: string;
  /** URI of the target artifact. */
  targetUri: string;
  /** Optional explicit relationship kind; inferred from layers when omitted. */
  kind?: LinkRelationshipKind;
  /** Confidence score; defaults to 0.7 when omitted. */
  confidence?: number;
  /** Human-readable explanation of why this evidence exists. */
  rationale?: string;
  /** Attribution string (e.g. provider ID). */
  createdBy?: string;
}

/**
 * Data contributed by a workspace link provider after collection.
 *
 * Providers may supply additional seeds (new artifacts to track),
 * hints (relationship suggestions for the heuristic engine), and/or
 * evidences (fully formed link assertions).
 */
export interface WorkspaceLinkContribution {
  /** Additional artifact seeds to merge into the graph. */
  seeds?: ArtifactSeed[];
  /** Relationship hints fed into the fallback heuristic engine. */
  hints?: RelationshipHint[];
  /** Direct link evidence assertions. */
  evidences?: LinkEvidence[];
}

/** Context passed to workspace link providers during collection. */
export interface WorkspaceLinkProviderContext {
  /** Current set of artifact seeds known to the orchestrator. */
  seeds: ArtifactSeed[];
}

/**
 * Extension point for injecting external link data into the inference pipeline.
 *
 * Providers are invoked during orchestration and may emit seeds, hints,
 * and/or evidence records that augment the heuristic-derived graph.
 */
export interface WorkspaceLinkProvider {
  /** Unique identifier for the provider (used in trace origins). */
  id: string;
  /** Optional human-readable label for reporting. */
  label?: string;
  /** Collects contributions given the current seed set. */
  collect(context: WorkspaceLinkProviderContext): Promise<WorkspaceLinkContribution | null | undefined>;
}

/**
 * Summary statistics for a single workspace provider's contribution,
 * included in the orchestration result for observability.
 */
export interface WorkspaceProviderSummary {
  /** Provider identifier. */
  id: string;
  /** Optional human-readable label. */
  label?: string;
  /** Number of artifact seeds contributed. */
  seedCount: number;
  /** Number of relationship hints contributed. */
  hintCount: number;
  /** Number of direct evidence records contributed. */
  evidenceCount: number;
}

/**
 * Input for a single link-inference orchestration run.
 */
export interface LinkInferenceRunInput {
  /** Artifact seeds forming the initial graph population. */
  seeds: ArtifactSeed[];
  /** Optional relationship hints fed to the fallback heuristic engine. */
  hints?: RelationshipHint[];
  /** Optional async function to load file content by URI. */
  contentProvider?: (uri: string) => Promise<string | undefined>;
  /** Optional external workspace link providers. */
  workspaceProviders?: WorkspaceLinkProvider[];
  /** Clock factory for deterministic timestamps in tests. */
  now?: () => Date;
}

/**
 * An error encountered during link inference, attributed to its source
 * subsystem (e.g. a failing workspace provider).
 */
export interface LinkInferenceError {
  /** Subsystem that produced the error (e.g. `"provider:my-provider"`). */
  source: string;
  /** Human-readable error description. */
  message: string;
  /** Original error object, if available. */
  cause?: unknown;
}

/**
 * Complete result of a link-inference orchestration run.
 */
export interface LinkInferenceRunResult {
  /** All artifacts in the graph (seeded + provider-contributed). */
  artifacts: KnowledgeArtifact[];
  /** All inferred links (heuristic + evidence), deduplicated by key. */
  links: LinkRelationship[];
  /** Full trace log of how each link was derived. */
  traces: LinkInferenceTraceEntry[];
  /** Per-provider contribution summaries. */
  providerSummaries: WorkspaceProviderSummary[];
  /** Errors encountered during provider collection or evidence application. */
  errors: LinkInferenceError[];
}

interface ProviderAccumulatorRecord {
  provider: WorkspaceLinkProvider;
  contribution: WorkspaceLinkContribution | null | undefined;
  error?: LinkInferenceError;
}

interface RegisteredArtifact {
  artifact: KnowledgeArtifact;
  added: boolean;
}

class LinkAccumulator {
  private readonly artifactsByUri = new Map<Uri, KnowledgeArtifact>();
  private readonly artifactsById = new Map<string, KnowledgeArtifact>();
  private readonly linksByKey = new Map<string, LinkRelationship>();
  private readonly traces: LinkInferenceTraceEntry[] = [];

  constructor(private readonly now: () => Date) {}

  addArtifact(artifact: KnowledgeArtifact): RegisteredArtifact {
    const normalizedUri = normalizeUri(artifact.uri);
    const existing = this.artifactsByUri.get(normalizedUri);

    if (!existing) {
      const stored: KnowledgeArtifact = { ...artifact };
      this.artifactsByUri.set(normalizedUri, stored);
      this.artifactsById.set(stored.id, stored);
      if (artifact.id !== stored.id) {
        this.artifactsById.set(artifact.id, stored);
      }
      return { artifact: stored, added: true };
    }

    const merged = mergeArtifacts(existing, artifact);
    this.artifactsByUri.set(normalizedUri, merged);
    this.artifactsById.set(merged.id, merged);
    if (artifact.id !== merged.id) {
      this.artifactsById.set(artifact.id, merged);
    }
    return { artifact: merged, added: false };
  }

  getArtifactByUri(uri: string): KnowledgeArtifact | undefined {
    return this.artifactsByUri.get(normalizeUri(uri));
  }

  getArtifactById(id: string): KnowledgeArtifact | undefined {
    return this.artifactsById.get(id);
  }

  addLink(
    sourceArtifact: KnowledgeArtifact | undefined,
    targetArtifact: KnowledgeArtifact | undefined,
    kind: LinkRelationshipKind,
    confidence: number,
    createdBy: string,
    origin: LinkInferenceTraceOrigin,
    rationale: string,
    createdAt?: string,
    recordTrace = true
  ): void {
    if (!sourceArtifact || !targetArtifact) {
      return;
    }

    const clamped = clampConfidence(confidence);
    const timestamp = createdAt ?? this.now().toISOString();
    const key = linkKey(sourceArtifact.id, targetArtifact.id, kind);
    const existing = this.linksByKey.get(key);

    if (!existing || existing.confidence < clamped) {
      this.linksByKey.set(key, {
        id: existing?.id ?? computeLinkId(sourceArtifact.id, targetArtifact.id, kind),
        sourceId: sourceArtifact.id,
        targetId: targetArtifact.id,
        kind,
        confidence: clamped,
        createdAt: timestamp,
        createdBy
      });
    }

    if (recordTrace) {
      this.traces.push({
        sourceUri: sourceArtifact.uri,
        targetUri: targetArtifact.uri,
        kind,
        origin,
        confidence: clamped,
        rationale
      });
    }
  }

  addTrace(trace: LinkInferenceTraceEntry): void {
    this.traces.push(trace);
  }

  getArtifacts(): KnowledgeArtifact[] {
    return Array.from(this.artifactsByUri.values());
  }

  getLinks(): LinkRelationship[] {
    return Array.from(this.linksByKey.values());
  }

  getTraces(): LinkInferenceTraceEntry[] {
    return [...this.traces];
  }
}

function normalizeUri(uri: string): string {
  return uri.trim();
}

function mergeArtifacts(existing: KnowledgeArtifact, incoming: KnowledgeArtifact): KnowledgeArtifact {
  const metadata = { ...existing.metadata, ...incoming.metadata };

  return {
    id: existing.id,
    uri: existing.uri,
    layer: existing.layer,
    language: incoming.language ?? existing.language,
    owner: incoming.owner ?? existing.owner,
    lastSynchronizedAt: incoming.lastSynchronizedAt ?? existing.lastSynchronizedAt,
    hash: incoming.hash ?? existing.hash,
    metadata: Object.keys(metadata).length ? metadata : undefined
  };
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
  const key = `${sourceId}|${targetId}|${kind}`;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `orchestrated-link-${hex}`;
}

function inferLinkKind(
  source: KnowledgeArtifact | undefined,
  target: KnowledgeArtifact | undefined,
  fallbackKind: LinkRelationshipKind | undefined
): LinkRelationshipKind {
  if (fallbackKind) {
    return fallbackKind;
  }

  if (!source || !target) {
    return "references";
  }

  const sourceLayer = source.layer;
  const targetLayer = target.layer;

  const isImplementationLayer = (layer: KnowledgeArtifact["layer"]): boolean => layer === "implementation" || layer === "code";
  const isDocumentLayer = (layer: KnowledgeArtifact["layer"]): boolean =>
    layer === "vision" || layer === "requirements" || layer === "architecture";

  if (isDocumentLayer(sourceLayer) && isImplementationLayer(targetLayer)) {
    return "documents";
  }

  if (sourceLayer === "architecture" && isImplementationLayer(targetLayer)) {
    return "implements";
  }

  if (isImplementationLayer(sourceLayer) && sourceLayer !== targetLayer && targetLayer === "architecture") {
    return "implements";
  }

  if (isImplementationLayer(sourceLayer) && isImplementationLayer(targetLayer)) {
    return "depends_on";
  }

  return "references";
}

function toLinkInferenceTraceEntries(traces: InferenceTraceEntry[]): LinkInferenceTraceEntry[] {
  return traces.map(trace => ({
    sourceUri: trace.sourceUri,
    targetUri: trace.targetUri,
    kind: trace.kind,
    origin: trace.origin,
    confidence: trace.confidence,
    rationale: trace.rationale,
    context: trace.context
  }));
}

function mergeSeeds(primary: Map<Uri, ArtifactSeed>, additional: ArtifactSeed[] | undefined): void {
  if (!additional?.length) {
    return;
  }

  for (const seed of additional) {
    const normalizedUri = normalizeUri(seed.uri);
    const existing = primary.get(normalizedUri);
    if (!existing) {
      primary.set(normalizedUri, { ...seed, uri: normalizedUri });
      continue;
    }

    primary.set(normalizedUri, {
      ...existing,
      ...seed,
      uri: normalizedUri,
      metadata: { ...existing.metadata, ...seed.metadata }
    });
  }
}

/**
 * Top-level orchestrator that combines the fallback heuristic engine,
 * workspace link providers, and direct evidence into a unified
 * {@link LinkInferenceRunResult}.
 *
 * Pipeline:
 * 1. Merge seeds and collect workspace provider contributions
 * 2. Run the fallback heuristic engine ({@link inferFallbackGraph})
 * 3. Apply provider evidence as additional links
 * 4. Return deduplicated artifacts, links, traces, and errors
 */
export class LinkInferenceOrchestrator {
  constructor() {}

  /**
   * Executes a full inference run.
   *
   * @param input - Seeds, hints, providers, and content accessor.
   * @returns Unified inference result with artifacts, links, and traces.
   */
  async run(input: LinkInferenceRunInput): Promise<LinkInferenceRunResult> {
    const nowFactory = input.now ?? (() => new Date());
    const seedMap = new Map<Uri, ArtifactSeed>();
    mergeSeeds(seedMap, input.seeds);

    const hints: RelationshipHint[] = [...(input.hints ?? [])];
    const providerRecords = await this.collectWorkspaceProviders(input.workspaceProviders, seedMap, hints);
    const providerSummaries = providerRecords
      .filter(record => !record.error)
      .map(record => summariseProvider(record.provider, record.contribution));

    const errors: LinkInferenceError[] = providerRecords.flatMap(record => (record.error ? [record.error] : []));

    const fallbackResult = await inferFallbackGraph(
      {
        seeds: Array.from(seedMap.values()),
        hints,
        contentProvider: input.contentProvider
      },
      {
        now: nowFactory
      }
    );

    const accumulator = new LinkAccumulator(nowFactory);
    fallbackResult.artifacts.forEach(artifact => accumulator.addArtifact(artifact));
    fallbackResult.links.forEach(link => {
      const sourceArtifact = accumulator.getArtifactById(link.sourceId);
      const targetArtifact = accumulator.getArtifactById(link.targetId);
      accumulator.addLink(
        sourceArtifact,
        targetArtifact,
        link.kind,
        link.confidence,
        link.createdBy,
        "heuristic",
        "Fallback inference baseline",
        link.createdAt,
        false
      );
    });

    const traces: LinkInferenceTraceEntry[] = toLinkInferenceTraceEntries(fallbackResult.traces);
    traces.forEach(trace => accumulator.addTrace(trace));

    this.applyWorkspaceEvidences(providerRecords, accumulator, errors);

    return {
      artifacts: accumulator.getArtifacts(),
      links: accumulator.getLinks(),
      traces: accumulator.getTraces(),
      providerSummaries,
      errors
    };
  }

  private async collectWorkspaceProviders(
    providers: WorkspaceLinkProvider[] | undefined,
    seedMap: Map<Uri, ArtifactSeed>,
    hints: RelationshipHint[]
  ): Promise<ProviderAccumulatorRecord[]> {
    if (!providers?.length) {
      return [];
    }

    const records: ProviderAccumulatorRecord[] = [];

    for (const provider of providers) {
      try {
        const contribution = await provider.collect({ seeds: Array.from(seedMap.values()) });
        mergeSeeds(seedMap, contribution?.seeds);
        if (contribution?.hints?.length) {
          hints.push(...contribution.hints);
        }
        records.push({ provider, contribution });
      } catch (cause) {
        const error: LinkInferenceError = {
          source: `provider:${provider.id}`,
          message: `Workspace provider ${provider.id} failed to collect contributions`,
          cause
        };
        records.push({ provider, contribution: null, error });
      }
    }

    return records;
  }

  private applyWorkspaceEvidences(
    providerRecords: ProviderAccumulatorRecord[],
    accumulator: LinkAccumulator,
    errors: LinkInferenceError[]
  ): void {
    for (const record of providerRecords) {
      if (record.error || !record.contribution?.evidences?.length) {
        continue;
      }

      for (const evidence of record.contribution.evidences) {
        const sourceArtifact = accumulator.getArtifactByUri(evidence.sourceUri);
        const targetArtifact = accumulator.getArtifactByUri(evidence.targetUri);

        if (!sourceArtifact || !targetArtifact) {
          errors.push({
            source: `provider:${record.provider.id}`,
            message: `Evidence skipped because artifacts are missing for ${evidence.sourceUri} -> ${evidence.targetUri}`
          });
          continue;
        }

        const origin = mapWorkspaceProviderOrigin(record.provider.id);
        accumulator.addLink(
          sourceArtifact,
          targetArtifact,
          inferLinkKind(sourceArtifact, targetArtifact, evidence.kind),
          evidence.confidence ?? 0.7,
          evidence.createdBy ?? record.provider.id,
          origin,
          evidence.rationale ?? `Workspace provider ${record.provider.id} evidence`
        );
      }
    }
  }
}

function mapWorkspaceProviderOrigin(providerId: string): WorkspaceProviderKind {
  if (providerId === "workspace-index" || providerId === "workspace-symbols") {
    return providerId;
  }

  return `workspace:${providerId}`;
}

function summariseProvider(
  provider: WorkspaceLinkProvider,
  contribution: WorkspaceLinkContribution | null | undefined
): WorkspaceProviderSummary {
  const rawHints = contribution?.hints ?? [];
  const uniqueHintCount = rawHints.length
    ? new Set(rawHints.map(hint => JSON.stringify(hint))).size
    : 0;

  return {
    id: provider.id,
    label: provider.label,
    seedCount: contribution?.seeds?.length ?? 0,
    hintCount: uniqueHintCount,
    evidenceCount: contribution?.evidences?.length ?? 0
  };
}
