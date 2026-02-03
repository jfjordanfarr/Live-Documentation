# packages/shared/src/inference/llm/confidenceCalibrator.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/inference/llm/confidenceCalibrator.test.ts
- Live Doc ID: LD-test-packages-shared-src-inference-llm-confidencecalibrator-test-ts
- Generated At: 2026-02-03T21:55:39.113Z

## Authored
### Purpose
Verifies the calibrator buckets labelled and numeric confidences into the tiers we specified and flips eligibility when corroboration is present, protecting the ingestion pipeline’s gating rules <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L1782-L1809> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L6047-L6052>.

### Notes
- Expand or adjust these scenarios whenever tier thresholds or shadow/eligibility semantics move so dry-run snapshots keep matching the orchestrator output <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L6047-L6052> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L6095-L6132>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.113Z","inputHash":"5612796a692ed4da"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`confidenceCalibrator.calibrateConfidence`](./confidenceCalibrator.ts.mdmd.md#symbol-calibrateconfidence)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/domain: [artifacts.ts](../../domain/artifacts.ts.mdmd.md)
- packages/shared/src/inference/llm: [confidenceCalibrator.ts](./confidenceCalibrator.ts.mdmd.md), [relationshipExtractor.ts](./relationshipExtractor.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
