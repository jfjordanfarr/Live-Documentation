# Live Documentation Knowledge Schema (Current)

This document captures the **current ingest schema** used by the knowledge graph bridge + SQLite projection.

## ExternalArtifact

Represents one artifact in a snapshot or stream event.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable identifier. In the server ingest pipeline, missing ids may be derived deterministically from `uri` for some feed formats. |
| `uri` | string | Canonical URI (prefer `file://...` for workspace artifacts). |
| `layer` | `vision \| requirements \| architecture \| implementation \| code` | Current layer enumeration (`ArtifactLayer`). |
| `language` | string? | Optional language hint. |
| `owner` | string? | Optional owner hint. |
| `lastSynchronizedAt` | string? | ISO-8601 timestamp. Optional. |
| `hash` | string? | Optional content fingerprint. |
| `metadata` | object? | Optional JSON metadata. |

## ExternalLink

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string? | Optional. If omitted, the ingest pipeline may generate a deterministic id from `(sourceId,targetId,kind)`. |
| `sourceId` | string | Source artifact id (or alias). |
| `targetId` | string | Target artifact id (or alias). |
| `kind` | `documents \| implements \| depends_on \| references \| includes` | Current link kind enumeration (`LinkRelationshipKind`). |
| `confidence` | number? | Optional; normalized/clamped to `[0,1]`. |
| `createdAt` | string? | ISO-8601 timestamp. Optional. |
| `createdBy` | string? | Optional producer label. |
| `metadata` | object? | Optional JSON metadata. |

## ExternalSnapshot

Complete snapshot envelope:

```jsonc
{
  "id": "optional-snapshot-id",
  "label": "Descriptive label",
  "createdAt": "2025-10-17T12:34:56.000Z",
  "artifacts": [ /* ExternalArtifact */ ],
  "links": [ /* ExternalLink */ ],
  "metadata": { /* optional */ }
}
```

Notes:

- `label` is required.
- The server ingest path will default `id` and `createdAt` when missing.
- Snapshots should be self-consistent: links should refer to artifacts present in the same payload (or resolvable aliases).

## Stream events

Incremental updates use `ExternalStreamEvent`:

```jsonc
{
  "kind": "artifact-upsert | artifact-remove | link-upsert | link-remove",
  "sequenceId": "monotonic-identifier",
  "detectedAt": "ISO timestamp",
  "artifact": { /* ExternalArtifact */ },
  "artifactId": "id used when removing artifacts by identifier",
  "link": { /* ExternalLink */ },
  "linkId": "id used when removing links by identifier",
  "metadata": { /* optional */ }
}
```

Events must be strictly ordered per feed.

## Static feed JSON files

The server can bootstrap from workspace-local JSON feeds placed under `data/knowledge-feeds/*.json`.

These files support a legacy-friendly shape where artifacts can be declared using `path`/`uri` and links can use `sourcePath`/`targetPath` aliases:

```jsonc
{
  "label": "My feed",
  "artifacts": [
    { "path": "packages/shared/src/domain/artifacts.ts", "layer": "code" }
  ],
  "links": [
    { "sourcePath": "packages/shared/src/domain/artifacts.ts", "targetPath": "packages/shared/src/db/graphStore.ts", "kind": "depends_on" }
  ]
}
```

The bridge normalizes paths to `file://` URIs and derives stable ids when required.

## Supported feed formats

In addition to the native snapshot JSON shape above, the ingest pipeline can attempt format-aware parsing:

- **LSIF** (newline-delimited JSON)
- **SCIP** (JSON index)

See `packages/server/src/features/knowledge/feedFormatDetector.ts` for detection logic.

## Implementation Traceability

The ingest schema described above is implemented by:

- [packages/shared/src/knowledge/knowledgeGraphBridge.ts](../../packages/shared/src/knowledge/knowledgeGraphBridge.ts) (canonical snapshot/stream types)
- [packages/server/src/features/knowledge/knowledgeGraphBridge.ts](../../packages/server/src/features/knowledge/knowledgeGraphBridge.ts) (workspace feed discovery + format parsing)
- [packages/server/src/features/knowledge/knowledgeGraphIngestor.ts](../../packages/server/src/features/knowledge/knowledgeGraphIngestor.ts) (validation + normalization)
