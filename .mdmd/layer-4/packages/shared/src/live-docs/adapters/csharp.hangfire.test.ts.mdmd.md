# packages/shared/src/live-docs/adapters/csharp.hangfire.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/csharp.hangfire.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-csharp-hangfire-test-ts
- Generated At: 2026-01-15T02:41:18.663Z

## Authored
### Purpose
Verify the C# adapter resolves Hangfire `BackgroundJob.Enqueue<T>` calls to their worker implementations.

### Notes
Exercises the queue pipeline path in an isolated temp workspace to guard the LD-402 dependency hop.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:18.663Z","inputHash":"2e298483dbfc7fb5"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/live-docs: [core.ts](../core.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [csharp.ts](./csharp.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
