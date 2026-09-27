# packages/shared/src/live-docs/adapters/csharp.hangfire.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/csharp.hangfire.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-csharp-hangfire-test-ts
- Generated At: 2026-09-27T21:43:40.513Z

## Authored
### Purpose
Verify the C# adapter resolves Hangfire `BackgroundJob.Enqueue<T>` calls to their worker implementations.

### Notes
Exercises the queue pipeline path in an isolated temp workspace to guard the LD-402 dependency hop.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:40.513Z","inputHash":"69136cef04cc6ee6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path`
- [`csharp.csharpAdapter`](./csharp.ts.mdmd.md#symbol-csharpadapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
