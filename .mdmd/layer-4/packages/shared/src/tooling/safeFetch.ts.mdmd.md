# packages/shared/src/tooling/safeFetch.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/safeFetch.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-safefetch-ts
- Generated At: 2026-02-17T22:06:09.544Z

## Authored
### Purpose
Localhost-only fetch wrapper that enforces network isolation by blocking any outbound request not targeting 127.0.0.0/8, `::1`, or `*.localhost`.

### Notes
- Created 2025-12-15 (Dev Day 46) in chat 2025-12-15.2.md as core component of the network security hardening initiative
- User quote: "I come from the sciences. I want to give hard evidence" — this module provides proof that Live Documentation never contacts the open internet
- Defense-in-depth layer: static audit (audit-network-usage.ts) confirms codebase uses this wrapper; this wrapper enforces policy at runtime
- Exports `NetworkPolicyViolation` error class for catch-and-distinguish handling
- ollamaClient.ts was immediately refactored to use safeFetch instead of raw fetch

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T22:06:09.544Z","inputHash":"e4210d83187035e1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `NetworkPolicyViolation` {#symbol-networkpolicyviolation}
- Type: class
- Source: [source](../../../../../../packages/shared/src/tooling/safeFetch.ts#L16)

##### `NetworkPolicyViolation` — Summary
Error thrown when a network request violates the localhost-only policy.

#### `isLocalhostHost` {#symbol-islocalhosthost}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/safeFetch.ts#L41)

##### `isLocalhostHost` — Summary
Determines whether a hostname is a localhost address.

##### `isLocalhostHost` — Parameters
- `hostname`: The hostname to check (e.g., "localhost", "127.0.0.1", "api.example.com")

##### `isLocalhostHost` — Returns
true if the hostname resolves to localhost, false otherwise

#### `safeFetch` {#symbol-safefetch}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/safeFetch.ts#L88)
- Parameters: `url`: `URL`; `init`: `RequestInit`

##### `safeFetch` — Summary
A fetch wrapper that enforces localhost-only network access.

Use this instead of raw `fetch()` in any code that should never contact the open internet.
The wrapper validates the URL before making the request and throws if the host is not localhost.

##### `safeFetch` — Parameters
- `init`: Optional fetch init options (same as native fetch)
- `url`: The URL to fetch (string or URL object)

##### `safeFetch` — Returns
A Promise resolving to the Response (same as native fetch)

##### `safeFetch` — Exceptions
- `Error`: If fetch is not available (Node < 18)
- `NetworkPolicyViolation`: If the URL's hostname is not localhost

##### `safeFetch` — Examples
```typescript
// Safe: localhost request
const response = await safeFetch("http://localhost:11434/api/chat", { method: "POST" });

// Throws NetworkPolicyViolation: blocked request to "api.openai.com"
const response = await safeFetch("https://api.openai.com/v1/chat");
```

#### `validateNetworkPolicy` {#symbol-validatenetworkpolicy}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/safeFetch.ts#L133)
- Parameters: `url`: `URL`

##### `validateNetworkPolicy` — Summary
Validates a URL against the localhost-only policy without making a request.

Useful for pre-validating user-provided endpoints before attempting to use them.

##### `validateNetworkPolicy` — Parameters
- `url`: The URL to validate (string or URL object)

##### `validateNetworkPolicy` — Returns
An object with `valid: true` if allowed, or `valid: false` with `reason` if blocked

##### `validateNetworkPolicy` — Examples
```typescript
const check = validateNetworkPolicy("https://api.openai.com/v1");
if (!check.valid) {
  console.error(`Blocked: ${check.reason}`);
}
```
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [safeFetch.test.ts](./safeFetch.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
