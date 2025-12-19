# packages/shared/src/inference/llm/confidenceCalibrator.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/llm/confidenceCalibrator.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-llm-confidencecalibrator-ts
- Generated At: 2025-12-19T04:50:48.058Z

## Authored
### Purpose
Buckets raw model confidences into the discrete `high`/`medium`/`low` tiers we planned for the LLM ingestion pipeline so graph diagnostics can key off categorical strength instead of opaque floats <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L1782-L1809> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L3122-L3160>.

### Notes
- The thresholds and `rawConfidenceLabel` hand-back keep orchestrator tests green and preserve provenance for review tooling—update them in lockstep with prompt or analytics changes <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L3122-L3160> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L6095-L6132>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T04:50:48.058Z","inputHash":"ffe97d7ab87aba65"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ConfidenceTier` {#symbol-confidencetier}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/inference/llm/confidenceCalibrator.ts#L3)

#### `CalibratedRelationship` {#symbol-calibratedrelationship}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/confidenceCalibrator.ts#L5)
- Extends: [`RawRelationshipCandidate`](./relationshipExtractor.ts.mdmd.md#symbol-rawrelationshipcandidate)

#### `CalibrationContext` {#symbol-calibrationcontext}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/llm/confidenceCalibrator.ts#L14)

#### `calibrateConfidence` {#symbol-calibrateconfidence}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/llm/confidenceCalibrator.ts#L35)
- Returns: [`CalibratedRelationship`](../../index.ts.mdmd.md#symbol-calibratedrelationship)[]
- Parameters: `candidates`: [`RawRelationshipCandidate`](./relationshipExtractor.ts.mdmd.md#symbol-rawrelationshipcandidate)[]; `context`: [`CalibrationContext`](../../index.ts.mdmd.md#symbol-calibrationcontext)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`relationshipExtractor.RawRelationshipCandidate`](./relationshipExtractor.ts.mdmd.md#symbol-rawrelationshipcandidate) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [confidenceCalibrator.test.ts](./confidenceCalibrator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
