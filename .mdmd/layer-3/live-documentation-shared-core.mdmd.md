# Live Documentation Shared Core

## Metadata
- Layer: 3
- Archetype: component
- Live Doc ID: COMP-shared-livedocs-core

## Authored
### Purpose
Outline the shared utilities that interpret, render, and validate Live Documentation across packages—core data structures, markdown helpers, and schema definitions.

### Notes
- Core modules parse Live Doc markdown into a typed AST used by generators, lint tooling, and analytics so every consumer shares the same interpretation of headings and generated blocks.
- Markdown helpers render deterministic sections, manage provenance comments, and prevent authored content from being overwritten during regeneration.
- Schema definitions underpin validation logic in both `live-docs:lint` and integration tests; they codify section ordering and field requirements per archetype.

### Strategy
- Expand the schema module to cover future sections (Targets, Supporting Fixtures, Observed Evidence) so linting can differentiate required versus optional blocks by archetype.
- Document parser extension points so adopters can add custom sections without forking the shared library.

## System References
### Components
- [packages/shared/src/live-docs/core.ts](../layer-4/packages/shared/src/live-docs/core.ts.mdmd.md)
- [packages/shared/src/live-docs/markdown.ts](../layer-4/packages/shared/src/live-docs/markdown.ts.mdmd.md)
- [packages/shared/src/live-docs/schema.ts](../layer-4/packages/shared/src/live-docs/schema.ts.mdmd.md)
- [packages/shared/src/live-docs/parse.ts](../layer-4/packages/shared/src/live-docs/parse.ts.mdmd.md)

## Evidence
- Parser and schema unit suites (`core.test.ts`, `markdown.test.ts`) prevent regressions in heading detection and provenance handling.
- `npm run live-docs:lint` tasks depend on this core layer; clean lint runs confirm the utilities interpret mirrors as expected.
