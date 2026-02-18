# Live Documentation Shared Contracts

## Metadata

- Layer: 3
- Archetype: component
- Live Doc ID: COMP-shared-contracts

## Authored

### Purpose

Summarise the shared type definitions and protocol contracts that glue the extension, server, and tooling together.

### Notes

- Domain models capture Live Doc metadata (archetypes, evidence summaries, link kinds) so every surface references the same vocabulary.
- We track schema evolution using semantic version comments inside the Layer‑4 docs; when contracts change we update both the extension command handlers and server serializers.
- ~~Contracts defined diagnostic payloads, dependency graphs, override schemas, and symbol bridge protocols between extension and server.~~ _(Descoped 2026-02-18: reactive diagnostics removed. The only remaining protocol is `FEEDS_READY_REQUEST` for health checks; `live-docs:lint` findings flow through `DiagnosticPublisher` instead of bespoke LSP contracts.)_

### Strategy

- Establish JSON schema outputs for key contracts (lint findings, dependency findings) so CI can validate integrations without bundling TypeScript.
- Pair contract updates with Live Doc migration scripts to automate regeneration after schema shifts.

## System References

### Components

- [packages/shared/src/domain/artifacts.ts](../layer-4/packages/shared/src/domain/artifacts.ts.mdmd.md)
- ~~packages/shared/src/contracts/diagnostics.ts~~ _(Deleted 2026-02-18)_
- ~~packages/shared/src/contracts/overrides.ts~~ _(Deleted 2026-02-18)_
- ~~packages/shared/src/contracts/dependencies.ts~~ _(Deleted 2026-02-18)_
- ~~packages/shared/src/contracts/symbols.ts~~ _(Deleted 2026-02-18)_

## Evidence

- Domain model types are exercised by Live Doc generation and inspection suites.
- ~~Contract unit suites (`diagnostics.test.ts`, `dependencies.test.ts`) verify encoder/decoder parity.~~ _(Deleted with contracts.)_
- Integration snapshots produced by `npm run graph:snapshot` validate domain model consistency.
