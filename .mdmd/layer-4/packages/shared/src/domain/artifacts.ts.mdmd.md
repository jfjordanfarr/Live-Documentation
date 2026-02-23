# packages/shared/src/domain/artifacts.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/domain/artifacts.ts
- Live Doc ID: LD-implementation-packages-shared-src-domain-artifacts-ts
- Generated At: 2026-02-23T22:57:50.126Z

## Authored
### Purpose

Defines the cross-layer knowledge-graph domain model—artifacts, links, diagnostics, acknowledgements, drift history—that the GraphStore, server features, and extension commands rely on, originally scaffolded during the implementation bootstrap captured in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-16.SUMMARIZED.md#turn-13-implementation-bootstrap-lines-2000-2523](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-16.SUMMARIZED.md#turn-13-implementation-bootstrap-lines-2000-2523).

### Notes

Confidence tiers and drift-history additions arrived alongside the October 23–24 persistence and LLM-ingestion passes, keeping telemetry and ingestion schemas aligned; see [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-14-graphstore-enhancements--status-check-lines-1531-1620](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-14-graphstore-enhancements--status-check-lines-1531-1620) and [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-24.SUMMARIZED.md#turn-10-prompt--shared-inference-modules-lines-3721-4460](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-24.SUMMARIZED.md#turn-10-prompt--shared-inference-modules-lines-3721-4460).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-23T22:57:50.126Z","inputHash":"250267b593bde598"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ArtifactLayer` {#symbol-artifactlayer}
- Type: type
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L16)

##### `ArtifactLayer` — Summary
The four progressive MDMD documentation layers, plus `"code"` for
raw implementation artifacts.

Values align with the Membrane Design MarkDown (MDMD) layering
convention defined in copilot-instructions:

- `"vision"` — Layer 1: what we're trying to accomplish
- `"requirements"` — Layer 2: what must be done
- `"architecture"` — Layer 3: how it will be accomplished
- `"implementation"` — Layer 4: what has been accomplished so far
- `"code"` — raw source files tracked by Live Documentation

Created 2025-10-16 (commit `6bccf94`).

#### `KnowledgeArtifact` {#symbol-knowledgeartifact}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L37)

##### `KnowledgeArtifact` — Summary
A single tracked workspace artifact in the knowledge graph.

Every file the system discovers — code, documentation, config, asset —
becomes a `KnowledgeArtifact`.  The {@link id} is typically a
workspace-relative path, and {@link layer} classifies it within the
MDMD hierarchy.

##### `KnowledgeArtifact` — Remarks
Originally created 2025-10-16 (commit `6bccf94`).  The `hash` and
`lastSynchronizedAt` fields were added 2025-10-26 for incremental
sync support but are currently unused — they remain as forward hooks
for the planned diffing pipeline.

#### `LinkRelationshipKind` {#symbol-linkrelationshipkind}
- Type: type
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L55)

##### `LinkRelationshipKind` — Summary
The set of relationship kinds between two knowledge artifacts.

Used by {@link LinkRelationship} and downstream edge resolution in
both the Live Documentation generator and the fallback heuristic
inference pipeline.

#### `LinkRelationship` {#symbol-linkrelationship}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L75)

##### `LinkRelationship` — Summary
A directed edge between two {@link KnowledgeArtifact}s in the
knowledge graph.

Edges are created by the LLM ingestion pipeline, the fallback
heuristic inference engine, or by explicit link declarations in
Live Documentation markdown.

##### `LinkRelationship` — Remarks
Created 2025-10-16 (commit `6bccf94`).  The `confidence` field
ranges 0–1 and is set by the creating pipeline (LLM calibrator,
heuristic scorer, or 1.0 for explicit declarations).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [fallbackInference.languages.test.ts](../inference/fallbackInference.languages.test.ts.mdmd.md)
- [fallbackInference.test.ts](../inference/fallbackInference.test.ts.mdmd.md)
- [linkInference.test.ts](../inference/linkInference.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
