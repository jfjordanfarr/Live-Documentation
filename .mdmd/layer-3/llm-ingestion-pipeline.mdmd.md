# LLM Ingestion Pipeline

## Metadata
- Layer: 3
- Component IDs: COMP-006

## Components

### COMP-006 LLM Ingestion Pipeline
Supports FR-LD8 and REQ-E1 by transforming workspace artifacts into optional LLM-enriched graph edges and Live Doc annotations while preserving deterministic fallbacks for local-only environments.

## Responsibilities

### Consent-Aware Queueing
- Honour provider guard settings when enqueuing artifacts through `LlmIngestionManager` and collapse duplicates before orchestration runs.
- Skip ingestion cleanly when diagnostics or LLM providers are disabled, logging once for operator awareness.

### Prompt Grounding and Extraction
- Build deterministic artifact chunks and gather neighbouring graph context ahead of model invocation.
- Invoke `RelationshipExtractor` with the configured `ModelInvoker`, falling back to the extension-side Ollama bridge when no local providers exist.

### Confidence Calibration and Persistence
- Calibrate raw confidences using `calibrateConfidence` so diagnostics only consume corroborated links.
- Persist accepted edges and provenance (`templateId`, `promptHash`, rationale) via `KnowledgeGraphBridge`, `GraphStore.upsertLink`, and Live Doc enrichers when configured.
- Emit low-confidence edges as Live Doc enrichment hints (Phase 7) tagged for manual review before migration into generated sections.

### Reporting and Auditability
- Emit orchestration summaries (stored, skipped, failed counts) to the connection console.
- Capture dry-run snapshots under `llm-ingestion-snapshots/` for reproducibility and later audit tooling.

## Interfaces

### Inbound Interfaces
- Change ingestion queue (`LlmIngestionManager.enqueue`) fed by `ArtifactWatcher` and `ChangeProcessor`.
- Extension `INVOKE_LLM_REQUEST` plumbing that delivers model responses or deterministic mocks.

### Outbound Interfaces
- Graph persistence pathways (`GraphStore.upsertLink`, `storeLlmEdgeProvenance`).
- Diagnostics and audit logging channels reporting ingestion outcomes and degraded provider states.

## Linked Implementations

### IMP-205 knowledgeGraphIngestor
Persists validated relationships and provenance into the graph store. [Knowledge Graph Ingestor](../../.mdmd/layer-4/packages/server/src/features/knowledge/knowledgeGraphIngestor.ts.mdmd.md)

### IMP-501 llmIngestionManager
Queues artifacts and triggers orchestrator runs. [LLM Ingestion Manager](../../.mdmd/layer-4/packages/server/src/runtime/llmIngestion.ts.mdmd.md)

### IMP-502 llmIngestionOrchestrator
Builds prompts, invokes extractors, calibrates, and persists edges. [LLM Ingestion Orchestrator](../../.mdmd/layer-4/packages/server/src/features/knowledge/llmIngestionOrchestrator.ts.mdmd.md)

### IMP-503 relationshipExtractor
Normalises model responses and enforces schema correctness. [Relationship Extractor](../../.mdmd/layer-4/packages/shared/src/inference/llm/relationshipExtractor.ts.mdmd.md)

### IMP-504 confidenceCalibrator
Transforms raw confidences into diagnostics eligibility signals. [Confidence Calibrator](../../.mdmd/layer-4/packages/shared/src/inference/llm/confidenceCalibrator.ts.mdmd.md)

### IMP-505 localOllamaBridge
Provides deterministic local model responses when no provider is registered. [Local Ollama Bridge](../../.mdmd/layer-4/packages/extension/src/services/localOllamaBridge.ts.mdmd.md)

## Evidence
- Dry-run snapshot fixtures under `tests/integration/core/llm/__fixtures__/llm-ingestion/` validate orchestration determinism, with Stage-0 coverage captured in [`dry-run.sample.json`](../../.mdmd/layer-4/tests/integration/core/llm/__fixtures__/llm-ingestion/dry-run.sample.json.mdmd.md).
- Unit suites for `relationshipExtractor`, `confidenceCalibrator`, and `llmIngestionManager` (planned) will capture prompt schema adherence and queue behaviour.
- Integration suite US5 exercises the pipeline with mocked providers, ensuring diagnostics remain stable.

## Operational Notes
- Upgrade path keeps local-only behaviour first-class; cloud providers will plug in via `ModelInvoker` without altering this architecture.
- Upcoming work includes richer chunk metadata, telemetry surfaces for operator dashboards, and authentication flows for remote providers.
- Live Doc enrichers consume approved LLM edges to annotate `Observed Evidence` or `Dependencies` when deterministic analyzers lack signal; waivers remain required for unverifiable output.
