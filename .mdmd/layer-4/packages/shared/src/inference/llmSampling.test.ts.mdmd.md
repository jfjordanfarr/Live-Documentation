# packages/shared/src/inference/llmSampling.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/inference/llmSampling.test.ts
- Live Doc ID: LD-test-packages-shared-src-inference-llmsampling-test-ts
- Generated At: 2026-02-03T21:55:39.180Z

## Authored
### Purpose
Validates the sampling harness by pinning vote aggregation, thresholding, collector hooks, and telemetry emission, as captured in [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L4650](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L4650).

### Notes
Keep these cases in sync with the follow-up wiring into link inference and telemetry sinks noted in [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L4679](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L4679) once sampling flows graduate from stub to production usage.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.180Z","inputHash":"7c86e606e983e6e7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`llmSampling.SamplingRequest`](./llmSampling.ts.mdmd.md#symbol-samplingrequest)
- [`llmSampling.SamplingVote`](./llmSampling.ts.mdmd.md#symbol-samplingvote)
- [`llmSampling.aggregateVotes`](./llmSampling.ts.mdmd.md#symbol-aggregatevotes)
- [`llmSampling.emitSamplingTelemetry`](./llmSampling.ts.mdmd.md#symbol-emitsamplingtelemetry)
- [`llmSampling.runSamplingSession`](./llmSampling.ts.mdmd.md#symbol-runsamplingsession)
- [`llmSampling.scoreSamples`](./llmSampling.ts.mdmd.md#symbol-scoresamples)
- `vitest` - `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/inference: [llmSampling.ts](./llmSampling.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
