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

type Uri = string;

type WorkspaceProviderKind = "workspace-index" | "workspace-symbols" | `workspace:${string}`;

export type LinkInferenceTraceOrigin = WorkspaceProviderKind | InferenceTraceEntry["origin"];

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

export interface LinkInferenceRunInput {
  seeds: ArtifactSeed[];
  hints?: RelationshipHint[];
  contentProvider?: (uri: string) => Promise<string | undefined>;
  workspaceProviders?: WorkspaceLinkProvider[];
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
