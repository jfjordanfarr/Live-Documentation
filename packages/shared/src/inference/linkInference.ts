import {
  ArtifactSeed,
  FallbackLLMBridge,
  RelationshipHint,
  inferFallbackGraph
} from "./fallbackInference";
import type { InferenceTraceEntry } from "./fallbackInference";
import {
  KnowledgeArtifact,
  LinkRelationship,
  LinkRelationshipKind
} from "../domain/artifacts";
import type {
  ExternalArtifact,
  ExternalLink,
  ExternalSnapshot,
  ExternalStreamEvent
} from "../knowledge/externalTypes";

type Uri = string;

type WorkspaceProviderKind = "workspace-index" | "workspace-symbols" | `workspace:${string}`;

type KnowledgeFeedKind = "knowledge-feed";

export type LinkInferenceTraceOrigin = WorkspaceProviderKind | KnowledgeFeedKind | InferenceTraceEntry["origin"];

export interface LinkInferenceTraceEntry {
  sourceUri: string;
  targetUri: string;
  kind: LinkRelationshipKind;
  origin: LinkInferenceTraceOrigin;
  confidence: number;
  rationale: string;
  context?: string;
}

export interface LinkEvidence {
  sourceUri: string;
  targetUri: string;
  kind?: LinkRelationshipKind;
  confidence?: number;
  rationale?: string;
  createdBy?: string;
}

export interface WorkspaceLinkContribution {
  seeds?: ArtifactSeed[];
  hints?: RelationshipHint[];
  evidences?: LinkEvidence[];
}

export interface WorkspaceLinkProviderContext {
  seeds: ArtifactSeed[];
}

export interface WorkspaceLinkProvider {
  id: string;
  label?: string;
  collect(context: WorkspaceLinkProviderContext): Promise<WorkspaceLinkContribution | null | undefined>;
}

export interface WorkspaceProviderSummary {
  id: string;
  label?: string;
  seedCount: number;
  hintCount: number;
  evidenceCount: number;
}

export interface KnowledgeFeedSnapshotSource {
  label: string;
  loadSnapshot: () => Promise<ExternalSnapshot | null>;
}

export interface KnowledgeFeedStreamSource {
  label: string;
  loadStreamEvents: () => AsyncIterable<ExternalStreamEvent> | Promise<ExternalStreamEvent[]>;
}

export interface KnowledgeFeed {
  id: string;
  snapshot?: KnowledgeFeedSnapshotSource;
  stream?: KnowledgeFeedStreamSource;
}

export interface KnowledgeFeedSummary {
  id: string;
  snapshotId?: string;
  label?: string;
  artifactCount: number;
  linkCount: number;
}

export interface LinkInferenceRunInput {
  seeds: ArtifactSeed[];
  hints?: RelationshipHint[];
  contentProvider?: (uri: string) => Promise<string | undefined>;
  workspaceProviders?: WorkspaceLinkProvider[];
  knowledgeFeeds?: KnowledgeFeed[];
  llm?: FallbackLLMBridge;
  minContentLengthForLLM?: number;
  now?: () => Date;
}

export interface LinkInferenceError {
  source: string;
  message: string;
  cause?: unknown;
}

export interface LinkInferenceRunResult {
  artifacts: KnowledgeArtifact[];
  links: LinkRelationship[];
  traces: LinkInferenceTraceEntry[];
  providerSummaries: WorkspaceProviderSummary[];
  feedSummaries: KnowledgeFeedSummary[];
  errors: LinkInferenceError[];
}

interface ProviderAccumulatorRecord {
  provider: WorkspaceLinkProvider;
  contribution: WorkspaceLinkContribution | null | undefined;
  error?: LinkInferenceError;
}

interface FeedAccumulatorRecord {
  feed: KnowledgeFeed;
  summary?: KnowledgeFeedSummary;
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

function convertSnapshotArtifact(artifact: ExternalArtifact): KnowledgeArtifact {
  return {
    id: artifact.id,
    uri: artifact.uri,
    layer: artifact.layer,
    language: artifact.language,
    owner: artifact.owner,
    lastSynchronizedAt: artifact.lastSynchronizedAt,
    hash: artifact.hash,
    metadata: artifact.metadata
  };
}

function snapshotLinkRationale(link: ExternalLink, feedLabel: string): string {
  if (link.metadata && typeof link.metadata.rationale === "string") {
    return link.metadata.rationale;
  }

  return `Knowledge feed ${feedLabel} contribution`;
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

async function* normalizeStream(
  stream: AsyncIterable<ExternalStreamEvent> | Promise<ExternalStreamEvent[]>
): AsyncIterable<ExternalStreamEvent> {
  if (typeof (stream as AsyncIterable<ExternalStreamEvent>)[Symbol.asyncIterator] === "function") {
    yield* (stream as AsyncIterable<ExternalStreamEvent>);
    return;
  }
  const resolved = (await stream) as ExternalStreamEvent[];
  for (const event of resolved) {
    yield event;
  }
}

export class LinkInferenceOrchestrator {
  constructor() {}

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
        now: nowFactory,
        llm: input.llm,
        minContentLengthForLLM: input.minContentLengthForLLM
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

    const feedRecords = await this.ingestKnowledgeFeeds(input.knowledgeFeeds, accumulator, errors);
    const feedSummaries = feedRecords
      .filter(record => !record.error && record.summary)
      .map(record => record.summary!);

    return {
      artifacts: accumulator.getArtifacts(),
      links: accumulator.getLinks(),
      traces: accumulator.getTraces(),
      providerSummaries,
      feedSummaries,
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
  private async ingestKnowledgeFeeds(
    feeds: KnowledgeFeed[] | undefined,
    accumulator: LinkAccumulator,
    errors: LinkInferenceError[]
  ): Promise<FeedAccumulatorRecord[]> {
    if (!feeds?.length) {
      return [];
    }

    const records: FeedAccumulatorRecord[] = [];

    for (const feed of feeds) {
      const summary: KnowledgeFeedSummary = {
        id: feed.id,
        artifactCount: 0,
        linkCount: 0
      };

      try {
        if (feed.snapshot) {
          const snapshot = await feed.snapshot.loadSnapshot();
          if (snapshot) {
            summary.label = feed.snapshot.label;
            summary.snapshotId = snapshot.id ?? undefined;
            const feedArtifactById = new Map<string, KnowledgeArtifact>();

            for (const artifact of snapshot.artifacts) {
              const registered = accumulator.addArtifact(convertSnapshotArtifact(artifact));
              feedArtifactById.set(artifact.id, registered.artifact);
              if (registered.added) {
                summary.artifactCount += 1;
              }
            }

            for (const link of snapshot.links) {
              const sourceArtifact = feedArtifactById.get(link.sourceId);
              const targetArtifact = feedArtifactById.get(link.targetId);
              if (!sourceArtifact || !targetArtifact) {
                errors.push({
                  source: `feed:${feed.id}`,
                  message: `Snapshot link skipped because artifacts missing for ${link.sourceId} -> ${link.targetId}`
                });
                continue;
              }

              accumulator.addLink(
                sourceArtifact,
                targetArtifact,
                link.kind,
                link.confidence ?? 0.9,
                link.createdBy ?? feed.id,
                "knowledge-feed",
                snapshotLinkRationale(link, feed.snapshot.label),
                link.createdAt
              );
              summary.linkCount += 1;
            }
          }
        }

        if (feed.stream) {
          for await (const event of normalizeStream(feed.stream.loadStreamEvents())) {
            switch (event.kind) {
              case "artifact-upsert": {
                if (event.artifact) {
                  accumulator.addArtifact(convertSnapshotArtifact(event.artifact));
                }
                break;
              }
              case "artifact-remove": {
                // Stream removals are ignored in orchestrator; handled by persistence layer.
                break;
              }
              case "link-upsert": {
                if (!event.link) {
                  break;
                }
                const sourceArtifact = accumulator.getArtifactById(event.link.sourceId);
                const targetArtifact = accumulator.getArtifactById(event.link.targetId);
                if (!sourceArtifact || !targetArtifact) {
                  errors.push({
                    source: `feed:${feed.id}`,
                    message: `Stream link skipped because artifacts unknown for ${event.link.sourceId} -> ${event.link.targetId}`
                  });
                  break;
                }
                accumulator.addLink(
                  sourceArtifact,
                  targetArtifact,
                  event.link.kind,
                  event.link.confidence ?? 0.8,
                  event.link.createdBy ?? feed.id,
                  "knowledge-feed",
                  snapshotLinkRationale(event.link, feed.stream.label),
                  event.link.createdAt
                );
                summary.linkCount += 1;
                break;
              }
              case "link-remove": {
                // Removals deferred to persistence layer.
                break;
              }
            }
          }
        }

        records.push({ feed, summary });
      } catch (cause) {
        const error: LinkInferenceError = {
          source: `feed:${feed.id}`,
          message: `Knowledge feed ${feed.id} failed to load`,
          cause
        };
        errors.push(error);
        records.push({ feed, error });
      }
    }

    return records;
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
