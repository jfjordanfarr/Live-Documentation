# packages/shared/src/inference/llmSampling.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/llmSampling.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-llmsampling-ts
- Generated At: 2026-02-03T21:55:39.194Z

## Authored
### Purpose
Defines the shared LLM sampling harness—request/result contracts, vote aggregation, thresholding, and telemetry hooks—added on the November 4 fixture-oracle expansion pass documented in [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L4650](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L4650).

### Notes
Link inference will eventually call `runSamplingSession` once the sampling pipeline is ready; the same change log outlines the follow-up to wire in telemetry sinks, so keep this module in sync with [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L4679](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L4679).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.194Z","inputHash":"a0d7fd33f51099a5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SamplingPromptVariant` {#symbol-samplingpromptvariant}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L1)

#### `SamplingEdge` {#symbol-samplingedge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L8)

#### `SamplingVote` {#symbol-samplingvote}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L14)

#### `SamplingRequest` {#symbol-samplingrequest}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L22)

#### `SamplingVoteCollector` {#symbol-samplingvotecollector}
- Type: type
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L32)
- Returns: [`SamplingVote`](#symbol-samplingvote)[]
- Parameters: `request`: [`SamplingRequest`](#symbol-samplingrequest)

#### `AggregatedVote` {#symbol-aggregatedvote}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L36)

#### `SamplingEvaluation` {#symbol-samplingevaluation}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L42)

#### `SamplingResult` {#symbol-samplingresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L48)

#### `SamplingTelemetryOptions` {#symbol-samplingtelemetryoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L56)

#### `SamplingTelemetry` {#symbol-samplingtelemetry}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L61)

#### `SamplingTelemetrySink` {#symbol-samplingtelemetrysink}
- Type: type
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L71)
- Parameters: `payload`: [`SamplingTelemetry`](#symbol-samplingtelemetry)

#### `aggregateVotes` {#symbol-aggregatevotes}
- Type: function
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L75)
- Returns: [`AggregatedVote`](#symbol-aggregatedvote)[]
- Parameters: `votes`: [`SamplingVote`](#symbol-samplingvote)[]

#### `scoreSamples` {#symbol-scoresamples}
- Type: function
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L124)
- Returns: [`SamplingEvaluation`](#symbol-samplingevaluation)
- Parameters: `votes`: [`SamplingVote`](#symbol-samplingvote)[]; `request`: [`SamplingRequest`](#symbol-samplingrequest)

#### `runSamplingSession` {#symbol-runsamplingsession}
- Type: function
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L151)
- Parameters: `request`: [`SamplingRequest`](#symbol-samplingrequest)

#### `emitSamplingTelemetry` {#symbol-emitsamplingtelemetry}
- Type: function
- Source: [source](../../../../../../packages/shared/src/inference/llmSampling.ts#L176)
- Parameters: `result`: [`SamplingResult`](#symbol-samplingresult)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [llmSampling.test.ts](./llmSampling.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
