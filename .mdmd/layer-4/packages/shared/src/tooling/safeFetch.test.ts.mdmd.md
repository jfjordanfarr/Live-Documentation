# packages/shared/src/tooling/safeFetch.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/tooling/safeFetch.test.ts
- Live Doc ID: LD-test-packages-shared-src-tooling-safefetch-test-ts
- Generated At: 2026-02-03T21:55:41.420Z

## Authored
### Purpose
Unit tests validating the safeFetch localhost-only policy across IPv4, IPv6, subdomain patterns, and edge cases.

### Notes
- Created 2025-12-15 (Dev Day 46) alongside safeFetch.ts
- 13 test cases covering: direct localhost matches, 127.x.x.x range, `[::1]` bracket notation, `.localhost` subdomains, and blocked external hosts
- Tests use vi.mock to stub globalThis.fetch, ensuring no real network requests are made
- Validates NetworkPolicyViolation is thrown with correct `attemptedHost` property

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.420Z","inputHash":"0e503c79aaf8fde0"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`safeFetch.NetworkPolicyViolation`](./safeFetch.ts.mdmd.md#symbol-networkpolicyviolation)
- [`safeFetch.isLocalhostHost`](./safeFetch.ts.mdmd.md#symbol-islocalhosthost)
- [`safeFetch`](./safeFetch.ts.mdmd.md#symbol-safefetch)
- [`safeFetch.validateNetworkPolicy`](./safeFetch.ts.mdmd.md#symbol-validatenetworkpolicy)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/tooling: [safeFetch.ts](./safeFetch.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
