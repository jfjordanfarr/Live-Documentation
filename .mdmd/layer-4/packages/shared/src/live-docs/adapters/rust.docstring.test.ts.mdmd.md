# packages/shared/src/live-docs/adapters/rust.docstring.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/rust.docstring.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-rust-docstring-test-ts
- Generated At: 2025-12-11T02:38:02.035Z

## Authored
### Purpose
Proves the Rust adapter can parse line and block Rustdoc, mapping sections like `# Parameters`, `# Panics`, and fenced examples into structured Live Doc output in line with the Nov 14 scope <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L1843-L1859> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L2792-L2808>.

### Notes
- Keeps coverage for the manual fixture verification pass we ran after seeding docstrings in `metrics.rs`, so extend these cases whenever the adapter learns a new Rustdoc construct <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L2740-L2833>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.035Z","inputHash":"206af995a856a71e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`rust.rustAdapter`](./rust.ts.mdmd.md#symbol-rustadapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/live-docs: [core.ts](../core.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [rust.ts](./rust.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
