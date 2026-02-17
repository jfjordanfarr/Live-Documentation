# Data Model (Current)

This document describes the **current code-truth data model** as implemented in `@live-documentation/shared`.

## KnowledgeArtifact

Represents any tracked artifact participating in the knowledge graph.

- `id` (string) — stable identifier (may be UUID-like or a deterministic hash).
- `uri` (string) — canonical URI for the artifact (often `file://...`).
- `layer` (enum) — one of: `vision`, `requirements`, `architecture`, `implementation`, `code`.
- `language` (string, optional)
- `owner` (string, optional)
- `lastSynchronizedAt` (ISO timestamp, optional)
- `hash` (string, optional) — content fingerprint when available.
- `metadata` (object, optional) — JSON-serialisable attributes.

## LinkRelationship

Directed association between two artifacts.

- `id` (string) — unique identifier for the edge.
- `sourceId` (string) — source artifact id.
- `targetId` (string) — target artifact id.
- `kind` (enum) — one of: `documents`, `implements`, `depends_on`, `references`, `includes`.
- `confidence` (number) — clamped to `[0,1]`.
- `createdAt` (ISO timestamp)
- `createdBy` (string)

Storage invariants:

- The SQLite projection enforces uniqueness on `(source_id, target_id, kind)`.

## ~~LlmEdgeProvenance~~ _(Descoped 2026-02-17)_

> **Descoped**: LLM integration has been removed from the project scope. This entity was never populated in production. Users bring their own AI assistants and consume Live Docs as structured context.

~~Optional provenance record attached to a stored link (kept in a separate table).~~

~~- `linkId` (string)~~
~~- `templateId` (string)~~
~~- `templateVersion` (string)~~
~~- `promptHash` (string)~~
~~- `modelId` (string)~~
~~- `issuedAt` (ISO timestamp)~~
~~- `createdAt` (ISO timestamp)~~
~~- `confidenceTier` (enum) — `high` | `medium` | `low`~~
~~- `calibratedConfidence` (number)~~
~~- `rawConfidence` (number, optional)~~
~~- `supportingChunks` (string[], optional)~~
~~- `rationale` (string, optional)~~
~~- `diagnosticsEligible` (boolean, optional)~~
~~- `shadowed` (boolean, optional)~~
~~- `promotionCriteria` (string[], optional)~~

## ChangeEvent

Represents a tracked change to an artifact.

- `id` (string)
- `artifactId` (string)
- `detectedAt` (ISO timestamp)
- `summary` (string)
- `changeType` (enum) — `content` | `metadata` | `rename` | `delete`
- `ranges` (array) — `{ startLine: number; endLine: number }[]`
- `provenance` (enum) — `save` | `git` | `external`

## DiagnosticRecord

User-facing alert capturing ripple/drift.

- `id` (string)
- `artifactId` (string) — artifact receiving the diagnostic.
- `triggerArtifactId` (string) — artifact that triggered the diagnostic.
- `changeEventId` (string) — the change event that caused the emission.
- `message` (string)
- `severity` (enum) — `warning` | `info` | `hint`
- `status` (enum) — `active` | `acknowledged` | `suppressed`
- `createdAt` (ISO timestamp)
- `acknowledgedAt` / `acknowledgedBy` (optional)
- `linkIds` (string[]) — edge ids supporting the diagnostic.
- ~~`llmAssessment` (optional) — structured LLM assessment payload.~~ _(Descoped 2026-02-17: LLM integration removed.)_

Note: the SQLite row shape historically allows `change_event_id` to be null for back-compat, but the current domain model treats `changeEventId` as required.

## KnowledgeSnapshot

Stored record of a snapshot ingest.

- `id` (string)
- `label` (string)
- `createdAt` (ISO timestamp)
- `artifactCount` (number)
- `edgeCount` (number)
- `payloadHash` (string)
- `metadata` (object, optional)

## AcknowledgementAction

Audit entry capturing a user action applied to a diagnostic.

- `id` (string)
- `diagnosticId` (string)
- `actor` (string)
- `action` (enum) — `acknowledge` | `dismiss` | `reopen`
- `notes` (optional)
- `timestamp` (ISO timestamp)

## DriftHistoryEntry

Append-only drift history record used for reporting and restart resilience.

- `id` (string)
- `diagnosticId` (string)
- `changeEventId` (string)
- `triggerArtifactId` (string)
- `targetArtifactId` (string)
- `status` (enum) — `emitted` | `acknowledged`
- `severity` (enum) — `warning` | `info` | `hint`
- `recordedAt` (ISO timestamp)
- `actor` / `notes` / `metadata` (optional)

## Implementation Traceability

The relationships described above are implemented by:

- [packages/shared/src/domain/artifacts.ts](../../packages/shared/src/domain/artifacts.ts) (domain contracts)
- [packages/scripts/src/live-docs/graph/liveDocGraph.ts](../../packages/scripts/src/live-docs/graph/liveDocGraph.ts) (in-memory graph from Live Doc markdown)
