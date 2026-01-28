# tests/integration/benchmarks/fixtures/fixtures.manifest.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/benchmarks/fixtures/fixtures.manifest.json
- Live Doc ID: LD-asset-tests-integration-benchmarks-fixtures-fixtures-manifest-json
- Generated At: 2026-01-28T02:55:35.639Z

## Authored
### Purpose
Master manifest enumerating every benchmark repository and fixture scenario the AST/self-similarity suites clone during verification runs.

### Notes
- Declares repository URLs, pinned commits, and include/exclude globs so benchmark orchestration can stage reproducible workspaces.
- The manifest drives both `npm run verify -- --report` and `npm run safe:commit -- --benchmarks`; edits here change coverage and must be coordinated with Layer‑3 benchmark documentation.
- Update entries when refreshing vendored repositories or adding new language scenarios, and regenerate fixtures plus reports to keep precision/recall metrics honest.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-28T02:55:35.639Z","inputHash":"619a49fe4ca692a5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`expected`](./c/basics/expected.json.mdmd.md)
- [`inferred`](./c/basics/inferred.json.mdmd.md)
- [`expected`](./c/libuv/expected.json.mdmd.md)
- [`inferred`](./c/libuv/inferred.json.mdmd.md)
- [`expected`](./c/modular/expected.json.mdmd.md)
- [`inferred`](./c/modular/inferred.json.mdmd.md)
- [`expected`](./c/rosetta/expected.json.mdmd.md)
- [`inferred`](./c/rosetta/inferred.json.mdmd.md)
- [`expected`](./csharp/basic/expected.json.mdmd.md)
- [`inferred`](./csharp/basic/inferred.json.mdmd.md)
- [`expected`](./csharp/newtonsoft-json/expected.json.mdmd.md)
- [`inferred`](./csharp/newtonsoft-json/inferred.json.mdmd.md)
- [`expected`](./csharp/rosetta/expected.json.mdmd.md)
- [`inferred`](./csharp/rosetta/inferred.json.mdmd.md)
- [`expected`](./csharp/webforms/expected.json.mdmd.md)
- [`inferred`](./csharp/webforms/inferred.json.mdmd.md)
- [`oracle.overrides`](./csharp/webforms/oracle.overrides.json.mdmd.md)
- [`expected`](./go/mux/expected.json.mdmd.md)
- [`inferred`](./go/mux/inferred.json.mdmd.md)
- [`expected`](./go/rosetta/expected.json.mdmd.md)
- [`inferred`](./go/rosetta/inferred.json.mdmd.md)
- [`expected`](./java/basic/expected.json.mdmd.md)
- [`inferred`](./java/basic/inferred.json.mdmd.md)
- [`expected`](./java/okhttp/expected.json.mdmd.md)
- [`inferred`](./java/okhttp/inferred.json.mdmd.md)
- [`expected`](./java/rosetta/expected.json.mdmd.md)
- [`inferred`](./java/rosetta/inferred.json.mdmd.md)
- [`expected`](./java/service/expected.json.mdmd.md)
- [`inferred`](./java/service/inferred.json.mdmd.md)
- [`expected`](./python/basics/expected.json.mdmd.md)
- [`inferred`](./python/basics/inferred.json.mdmd.md)
- [`oracle.overrides`](./python/basics/oracle.overrides.json.mdmd.md)
- [`expected`](./python/pipeline/expected.json.mdmd.md)
- [`inferred`](./python/pipeline/inferred.json.mdmd.md)
- [`oracle.overrides`](./python/pipeline/oracle.overrides.json.mdmd.md)
- [`expected`](./python/requests/expected.json.mdmd.md)
- [`inferred`](./python/requests/inferred.json.mdmd.md)
- [`oracle.overrides`](./python/requests/oracle.overrides.json.mdmd.md)
- [`expected`](./python/rosetta/expected.json.mdmd.md)
- [`inferred`](./python/rosetta/inferred.json.mdmd.md)
- [`expected`](./ruby/basic/expected.json.mdmd.md)
- [`inferred`](./ruby/basic/inferred.json.mdmd.md)
- [`expected`](./ruby/cli/expected.json.mdmd.md)
- [`inferred`](./ruby/cli/inferred.json.mdmd.md)
- [`expected`](./ruby/rosetta/expected.json.mdmd.md)
- [`inferred`](./ruby/rosetta/inferred.json.mdmd.md)
- [`expected`](./rust/analytics/expected.json.mdmd.md)
- [`inferred`](./rust/analytics/inferred.json.mdmd.md)
- [`expected`](./rust/basics/expected.json.mdmd.md)
- [`inferred`](./rust/basics/inferred.json.mdmd.md)
- [`expected`](./rust/log/expected.json.mdmd.md)
- [`inferred`](./rust/log/inferred.json.mdmd.md)
- [`expected`](./rust/rosetta/expected.json.mdmd.md)
- [`inferred`](./rust/rosetta/inferred.json.mdmd.md)
- [`expected`](./typescript/basic/expected.json.mdmd.md)
- [`inferred`](./typescript/basic/inferred.json.mdmd.md)
- [`oracle.overrides`](./typescript/basic/oracle.overrides.json.mdmd.md)
- [`expected`](./typescript/ky/expected.json.mdmd.md)
- [`inferred`](./typescript/ky/inferred.json.mdmd.md)
- [`expected`](./typescript/layered/expected.json.mdmd.md)
- [`inferred`](./typescript/layered/inferred.json.mdmd.md)
- [`oracle.overrides`](./typescript/layered/oracle.overrides.json.mdmd.md)
- [`expected`](./typescript/rosetta/expected.json.mdmd.md)
- [`inferred`](./typescript/rosetta/inferred.json.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
