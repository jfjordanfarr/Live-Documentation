# AST Benchmark Fixtures

## Metadata
- Layer: 3
- Archetype: component
- Live Doc ID: COMP-benchmark-fixtures

## Authored
### Purpose
Document the polyglot fixture corpus that feeds AST accuracy benchmarks, explaining what each scenario exercises, why it exists, and which manifests/tests must stay in sync with the Live Docs pipeline.

### Strategy
This component aggregates synthetic and vendored fixtures across TypeScript, C, Python, Rust, Java, Ruby, and C# to validate analyzer precision/recall. Each fixture pairs a curated `expected.json` ground truth with inferred graph output so benchmark runs can compute deltas.

### Notes
#### Covered Artifacts
- Fixtures: `tests/integration/benchmarks/fixtures/**/{typescript,c,python,rust,java,ruby,csharp}/**`
- Vendor manifest: [`tests/integration/benchmarks/fixtures/fixtures.manifest.json`](../../tests/integration/benchmarks/fixtures/fixtures.manifest.json)
- Harness: [`tests/integration/benchmarks/astAccuracy.test.ts`](../../tests/integration/benchmarks/astAccuracy.test.ts)

## System References
### Components
- [tests/integration/benchmarks/astAccuracy.test.ts](../layer-4/tests/integration/benchmarks/astAccuracy.test.ts.mdmd.md)
- [fixtures.manifest.json](../layer-4/tests/integration/benchmarks/fixtures/fixtures.manifest.json.mdmd.md)

#### Fixture Inventory Overview
Each fixture pairs a curated `expected.json` (ground truth) with the current `inferred.json` graph so benchmark runs can compute precision/recall deltas. Synthetic fixtures cover simple and layered scenarios per language, while vendored workspaces (Ky, libuv, Requests, Rust Log, Roslyn slice, OkHttp) validate the analyzers against real repositories.

#### Vendored Fixture Integrity (auto-generated)

<!-- benchmark-vendor-inventory:start -->
#### `ts-ky` (Ky HTTP client repository)

- **Source**: `sindresorhus/ky` @ `5d3684ed0e27c1a89f9d13f09523367d86cbabfe` — MIT
- **Integrity**: `sha256` root `2c49edba6c5393bad18daf38d76375b014d9706d573193307ccc779bde9099a8` (43 files)
- **File Selection**: include `**/*.ts`, `**/*.tsx`; exclude `**/*.d.ts`, `**/__tests__/**`, `**/*.test.ts`, `**/*.spec.ts` (resolved 43 files)

#### `c-libuv` (libuv repository)

- **Source**: `libuv/libuv` @ `12d1ed1380c59c5ec27503cf149833de6f0e6bb0` — MIT
- **Integrity**: `sha256` root `cdd68bd046e94e1ab1705088bb608e5ac5b329c9f936264a0fe14310f7bfc71a` (118 files)
- **File Selection**: include `src/**/*.c`, `src/**/*.h`, `include/**/*.h`; exclude `test/**`, `docs/**`, `cmake/**`, `samples/**` (resolved 118 files)

#### `python-requests` (Requests HTTP client repository)

- **Source**: `psf/requests` @ `61e2240f283f15780ac2d0e2cfefb0fd6fdab627` — Apache-2.0
- **Integrity**: `sha256` root `d63b7f2a1c33fbe3e48d8727310e0dba9db7d91b02f8abde19aade6ca0a4df3b` (18 files)
- **File Selection**: include `src/requests/**/*.py`; exclude `src/requests/__pycache__/**` (resolved 18 files)

#### `rust-log` (Rust logging facade (rust-lang/log))

- **Source**: `rust-lang/log` @ `6e1735597bb21c5d979a077395df85e1d633e077` — Apache-2.0 OR MIT
- **Integrity**: `sha256` root `1133cd7078de2076079aa81f4c70727f9fe8ff77f1f50782aed467053a2b5676` (10 files)
- **File Selection**: include `src/**/*.rs`, `Cargo.toml`; exclude `tests/**`, `benches/**`, `examples/**`, `rfcs/**` (resolved 10 files)

#### `java-okhttp` (OkHttp client repository)

- **Source**: `square/okhttp` @ `ad97bd3df34376eec85aa187dc8f45cfde8a2c01` — Apache-2.0
- **Integrity**: `sha256` root `3a25221f8b880369a43ff52714391991896837a330707aedb8807cbd8daf315c` (151 files)
- **File Selection**: include `okhttp/src/main/java/**/*.java`, `mockwebserver/src/main/java/**/*.java`, `okcurl/src/main/java/**/*.java`, `okhttp-dnsoverhttps/src/main/java/**/*.java`, `okhttp-logging-interceptor/src/main/java/**/*.java`, `okhttp-sse/src/main/java/**/*.java`, `okhttp-testing-support/src/main/java/**/*.java`, `okhttp-tests/src/main/java/**/*.java`, `okhttp-tls/src/main/java/**/*.java`, `okhttp-urlconnection/src/main/java/**/*.java`; exclude `**/src/test/**`, `samples/**` (resolved 151 files)
<!-- benchmark-vendor-inventory:end -->

#### TypeScript Fixtures
- `ts-basic`: Minimal helper-heavy module fan-out covering [`src/index.ts`](../../tests/integration/benchmarks/fixtures/typescript/basic/src/index.ts) through shared utilities. Validates import/usage detection noise handling.
- `ts-layered`: Layered reporting service with services, repositories, and shared models across [`src/services/**`](../../tests/integration/benchmarks/fixtures/typescript/layered/src/services/reportService.ts). Stresses deeper graph reconstruction.
- `ts-ky`: Staged clone of the Ky repository to measure analyzer behaviour against a production TypeScript surface. Comment-aware heuristics strip JSDoc-only imports, so expectations align with actual runtime dependencies.

#### C Language Fixtures
- `c-basics`: Translation unit plus helper/header pair (e.g., [`src/main.c`](../../tests/integration/benchmarks/fixtures/c/basics/src/main.c)) to ensure include resolution stays accurate.
- `c-modular`: Multi-file pipeline (metrics, logger, pipeline orchestrator) emphasizing layered include chains.
- `c-libuv`: Deterministic sparse checkout of the libuv portability layer spanning platform-specific headers; showcases large include graphs without manual pruning.

#### Python Fixtures
- `python-basics`: Entry point plus helper modules exercising straightforward import graphs.
- `python-pipeline`: Repository/validator/dataclass workflow covering chained imports and control flow.
- `python-requests`: Production Requests 2.32.3 client subset; notes dynamic imports (`requests.compat`, `requests.packages`) for manual review even though they do not surface as static edges.

#### Rust Fixtures
- `rust-basics`: Small crate with helper modules validating cross-module calls.
- `rust-analytics`: Analytics crate combining IO, metrics, and alert evaluation logic.
- `rust-log`: Vendored `rust-lang/log` slice that captures macro-driven edges (`macro_use` → `__private_api`) and feature-gated helpers.

#### Java Fixtures
- `java-basic`: Reporting application mixing package-level imports, records, and formatters.
- `java-service`: Service stack with repositories, analyzers, metrics, and logging utilities to model enterprise-style dependency graphs.
- `java-okhttp`: Vendored OkHttp 3.14.9 modules; expectations document builder-driven dependency propagation inside the client and its support packages.

#### C# Fixture Suite
- `csharp-basic`: Diagnostics slice layering app entry, repository, formatter, and reporting service.
- `csharp-webforms`: ASP.NET Web Forms sample covering shared code-behind and markup/JS assets; includes manual oracle overrides.
- `csharp-roslyn-compilers`: Sparse checkout of Roslyn flow analysis/utility files, stressing nullable analysis and value-set visitors.

#### Ruby Fixtures
- `ruby-basic`: Module namespace with data store, formatter, and reporter, ensuring `require_relative` handling works.
- `ruby-cli`: CLI surface layering command dispatch, services, cache, and logging helpers to exercise denser Ruby graphs.

#### Operational Notes
- Fixture metadata lives in [`fixtures.manifest.json`](../../tests/integration/benchmarks/fixtures/fixtures.manifest.json) and feeds both the benchmark harness and the vendor inventory above.
- `reports/test-report.ast.md` surfaces precision/recall deltas per fixture; regenerating fixtures or expectations must be followed by report refreshes.
- Determinism rules: fixtures avoid external dependencies, pin upstream commits, and record integrity digests so Safe Commit can validate vendored workspaces.

#### Shared Reporting Types
- [`BenchmarkEnvironment`](../../packages/shared/src/reporting/testReport.ts): describes runtime characteristics (Node version, platform, provider mode) per benchmark run.
- [`ReportSection`](../../packages/shared/src/reporting/testReport.ts): markdown fragment container used by the benchmark reporter when emitting the AST suite summary.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No data recorded yet_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No data recorded yet_
<!-- LIVE-DOC:END Dependencies -->
