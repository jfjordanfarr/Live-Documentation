# tests/integration/benchmarks/fixtures/go/rosetta/src/processor/processor.go

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/go/rosetta/src/processor/processor.go
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-go-rosetta-src-processor-processor-go
- Generated At: 2026-02-03T21:55:43.680Z

## Authored
### Purpose
Core processing logic for the Go Rosetta Stone benchmark, transforming models using helper utilities.

### Notes
- Imports from models, helpers, and types packages to exercise multi-package dependency detection.
- Part of the canonical Rosetta Stone program structure for cross-language adapter comparison.
- Created 2026-01-15; see [2026-01-15.1.md](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-15.1.md) for context.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:43.680Z","inputHash":"d55acb3bc4a220e3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DefaultConfig` {#symbol-defaultconfig}
- Type: function
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/go/rosetta/src/processor/processor.go#L17)

##### `DefaultConfig` — Summary
DefaultConfig returns the default configuration for processing.

#### `Run` {#symbol-run}
- Type: function
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/go/rosetta/src/processor/processor.go#L25)

##### `Run` — Summary
Run processes a batch of records and generates a report. Uses package imports to access Record and Report types, demonstrating how adapters should handle Go imports.

#### `Summarize` {#symbol-summarize}
- Type: function
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/go/rosetta/src/processor/processor.go#L52)

##### `Summarize` — Summary
Summarize creates a formatted summary string from a report.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`helpers.Average`](../helpers/helpers.go.mdmd.md#symbol-average)
- [`helpers.Format`](../helpers/helpers.go.mdmd.md#symbol-format)
- [`helpers.Sum`](../helpers/helpers.go.mdmd.md#symbol-sum)
- [`models.Record`](../models/models.go.mdmd.md#symbol-record)
- [`models.Report`](../models/models.go.mdmd.md#symbol-report)
- [`models.ValidateConfig`](../models/models.go.mdmd.md#symbol-validateconfig)
- [`types.NewProcessorConfig`](../types/types.go.mdmd.md#symbol-newprocessorconfig)
- [`types.ProcessorConfig`](../types/types.go.mdmd.md#symbol-processorconfig)
<!-- LIVE-DOC:END Dependencies -->
