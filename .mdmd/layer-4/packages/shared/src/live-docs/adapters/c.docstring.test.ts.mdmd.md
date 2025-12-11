# packages/shared/src/live-docs/adapters/c.docstring.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/c.docstring.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-c-docstring-test-ts
- Generated At: 2025-12-11T02:38:01.855Z

## Authored
### Purpose
Exercises `cAdapter` against synthetic `.c/.h` fixtures to confirm Doxygen summaries, parameters, examples, and include resolution flow into Live Docs, matching the scenarios scoped in the Nov 14 implementation plan and validated during the ship review <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L3620-L3705> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L4028-L4088>.

### Notes
- Runs as part of the Nov 14 `safe:commit -- --benchmarks` sweep to lock the adapter’s behaviour, and should grow alongside any new Doxygen tag support <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L4028-L4088>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.855Z","inputHash":"040d0ccea5a4da2b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`c.cAdapter`](./c.ts.mdmd.md#symbol-cadapter)
- [`core.computePublicSymbolHeadingInfo`](../core.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`core.renderPublicSymbolLines`](../core.ts.mdmd.md#symbol-renderpublicsymbollines)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/live-docs: [core.ts](../core.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [c.ts](./c.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
