# Live Documentation Shared Contracts

## Metadata

- Layer: 3
- Archetype: component
- Live Doc ID: COMP-shared-contracts

## Authored

### Purpose

Summarise the shared type definitions and protocol contracts that glue the extension, server, and tooling together.

### Notes

- Domain models capture Live Doc metadata (archetypes, evidence summaries, link kinds) so every surface references the same vocabulary.
- We track schema evolution using semantic version comments inside the Layer‑4 docs; when contracts change we update both the extension command handlers and server serializers.
- ~~Contracts defined diagnostic payloads, dependency graphs, override schemas, and symbol bridge protocols between extension and server.~~ _(Descoped 2026-02-18: reactive diagnostics removed. The only remaining protocol is `FEEDS_READY_REQUEST` for health checks; `live-docs:lint` findings flow through `DiagnosticPublisher` instead of bespoke LSP contracts.)_

### Strategy

- Establish JSON schema outputs for key contracts (lint findings, dependency findings) so CI can validate integrations without bundling TypeScript.
- Pair contract updates with Live Doc migration scripts to automate regeneration after schema shifts.

## Domain Model

> Migrated from `specs/001-link-aware-diagnostics/data-model.md` on 2026-02-23.

### KnowledgeArtifact

Represents any tracked artifact participating in the knowledge graph.

- `id` (string) — stable identifier (deterministic hash or UUID-like).
- `uri` (string) — canonical URI for the artifact.
- `layer` (enum) — `vision` | `requirements` | `architecture` | `implementation` | `code`.
- `language` (string, optional)
- `owner` (string, optional)
- `lastSynchronizedAt` (ISO timestamp, optional)
- `hash` (string, optional) — content fingerprint.
- `metadata` (object, optional) — JSON-serialisable attributes.

### LinkRelationship

Directed association between two artifacts.

- `id` (string) — unique identifier for the edge.
- `sourceId` / `targetId` (string) — participating artifact ids.
- `kind` (enum) — `documents` | `implements` | `depends_on` | `references` | `includes`.
- `confidence` (number) — clamped to `[0,1]`.
- `createdAt` (ISO timestamp) / `createdBy` (string)
- Uniqueness enforced by the Live Doc graph builder on `(sourceId, targetId, kind)`.

### ChangeEvent

Tracked change to an artifact.

- `id`, `artifactId`, `detectedAt`, `summary`
- `changeType` — `content` | `metadata` | `rename` | `delete`
- `ranges` — `{ startLine, endLine }[]`
- `provenance` — `save` | `git` | `external`

### DiagnosticRecord

User-facing alert capturing ripple/drift.

- `id`, `artifactId`, `triggerArtifactId`, `changeEventId`, `message`
- `severity` — `warning` | `info` | `hint`
- `status` — `active` | `acknowledged` | `suppressed`
- `createdAt`, `acknowledgedAt` / `acknowledgedBy` (optional)
- `linkIds` (string[]) — edge ids supporting the diagnostic.

### KnowledgeSnapshot

Stored record of a snapshot ingest.

- `id`, `label`, `createdAt`, `artifactCount`, `edgeCount`, `payloadHash`, `metadata`

### AcknowledgementAction

Audit entry capturing a user action applied to a diagnostic.

- `id`, `diagnosticId`, `actor`, `action` (`acknowledge` | `dismiss` | `reopen`), `notes`, `timestamp`

### DriftHistoryEntry

Append-only drift history record.

- `id`, `diagnosticId`, `changeEventId`, `triggerArtifactId`, `targetArtifactId`
- `status` — `emitted` | `acknowledged`
- `severity`, `recordedAt`, `actor` / `notes` / `metadata` (optional)

## System References

### Components

- [packages/shared/src/domain/artifacts.ts](../layer-4/packages/shared/src/domain/artifacts.ts.mdmd.md) — domain contracts
- [packages/scripts/src/live-docs/graph/liveDocGraph.ts](../layer-4/packages/scripts/src/live-docs/graph/liveDocGraph.ts.mdmd.md) — in-memory graph from Live Doc markdown
- ~~packages/shared/src/contracts/diagnostics.ts~~ _(Deleted 2026-02-18)_
- ~~packages/shared/src/contracts/overrides.ts~~ _(Deleted 2026-02-18)_
- ~~packages/shared/src/contracts/dependencies.ts~~ _(Deleted 2026-02-18)_
- ~~packages/shared/src/contracts/symbols.ts~~ _(Deleted 2026-02-18)_

## Evidence

- Domain model types are exercised by Live Doc generation and inspection suites.
- ~~Contract unit suites (`diagnostics.test.ts`, `dependencies.test.ts`) verify encoder/decoder parity.~~ _(Deleted with contracts.)_
- Integration snapshots via regeneration tests validate domain model consistency.
