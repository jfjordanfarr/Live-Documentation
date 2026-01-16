# Rosetta Cross-Language Parity Analysis

Created: 2026-01-16 (Dev Day 60)

## Executive Summary

This document analyzes what commonalities can be enforced across all 8 Rosetta fixtures
to enable **structural parity testing** — the ability to assert that any new language's
Rosetta implementation matches a common shape.

## Current Fixture Inventory

### Languages and Tiers

| Language   | Tier       | Source Dir                | Test Location        | Test Pattern      |
|------------|------------|---------------------------|----------------------|-------------------|
| TypeScript | type-safe  | `src/`                    | `src/`               | `*.test.ts`       |
| Java       | type-safe  | `src/com/rosetta/`        | nested in src dirs   | `*Test.java`      |
| C#         | type-safe  | `src/`                    | nested in src dirs   | `*Tests.cs`       |
| Rust       | type-safe  | `src/`                    | `src/`               | `*_test.rs`       |
| C          | type-safe  | `src/`                    | `src/`               | `test_*.c`        |
| Go         | type-safe  | `src/` (pkg-per-dir)      | same as production   | `*_test.go`       |
| Python     | dynamic    | `src/`                    | `src/`               | `test_*.py`       |
| Ruby       | dynamic    | `lib/`                    | `spec/`              | `*_spec.rb`       |

### Canonical Program Nodes

Per `rosetta-manifest.json`, every fixture must implement:

| Node ID    | Role                                          | File Patterns                     |
|------------|-----------------------------------------------|-----------------------------------|
| `main`     | Entry point that orchestrates the pipeline    | `main.*`                          |
| `processor`| Core processing logic that transforms data    | `processor.*`, `Processor.*`      |
| `models`   | Domain model definitions and factories        | `models.*`, `Models/*`            |
| `types`    | Shared type definitions (enums, configs)      | `types.*`, `Types/*`              |
| `helpers`  | Pure utility functions with no dependencies   | `helpers.*`, `Helpers.*`          |
| `test`     | Test files that exercise production code      | `*.test.*`, `test_*.*`, etc.      |

### Canonical Edges

Expected dependency relationships:

```
main → processor, models
processor → models, types, helpers
models → types
helpers → (none — leaf node)
types → (none — foundation node)
test → processor, models, helpers, types
```

## What CAN Be Enforced for Parity

### 1. Node Count Parity ✅

**Assertion**: Each fixture must have the same number of logical "roles":
- 5 production nodes: main, processor, models, types, helpers
- 3 test nodes: processor_test, helpers_test, pipeline_test

**How to test**: Count unique role assignments from expected.json source files.

**Variance allowed**: File naming varies by language convention, but role count is constant.

### 2. Edge Shape Parity ✅

**Assertion**: Dependency graph "shape" must match across fixtures when normalized:
- Same number of production-to-production edges
- Same number of test-to-production edges

**Normalization strategy**: Map source paths to canonical node IDs:
```typescript
function toNodeId(path: string): NodeId {
  // Extract role from path: "src/com/rosetta/processor/Processor.java" → "processor"
  // Test files: "src/processor.test.ts" → "processor_test"
}
```

**Variance allowed**:
- C has extra edges due to header files (`.h` → implementation)
- Java/C# may have extra edges to factory classes

### 3. Leaf Node Property ✅

**Assertion**: `helpers` must always be a leaf node (no outgoing dependencies).

**How to test**: Filter expected.json for edges where source contains "helpers" pattern — should find zero non-test edges originating from helpers.

**Current status**: ✅ Enforced in all 8 fixtures

### 4. Foundation Node Property ✅

**Assertion**: `types` should have no outgoing dependencies to other Rosetta nodes (may import stdlib).

**How to test**: Filter expected.json for edges where source contains "types" pattern.

**Current status**: ✅ Enforced in all 8 fixtures

### 5. Test Coverage Pattern ✅

**Assertion**: Each fixture must have exactly 3 test files:
1. `*processor*test*` — tests the processor module
2. `*helpers*test*` — tests the helpers module
3. `*pipeline*test*` — integration test of the full pipeline

**How to test**: Pattern match on expected.json sources.

**Current status**: ✅ All 8 fixtures have these 3 test files

## What CANNOT Be Enforced (Too Language-Specific)

### 1. Exact Edge Count ❌

The number of edges varies significantly:

| Language   | Edge Count | Notes                                     |
|------------|------------|-------------------------------------------|
| TypeScript | 12         | Reference implementation                  |
| Java       | 15         | Extra factory/type edges                  |
| C#         | 21         | Namespace-level using causes more edges   |
| Rust       | 12         | Matches TypeScript                        |
| C          | 21         | Header+impl pairs double many edges       |
| Go         | 10         | Package imports are coarser              |
| Python     | 12         | Matches TypeScript                        |
| Ruby       | 12         | Matches TypeScript                        |

**Reason**: Language semantics force different granularity.

### 2. Relation Types ❌

The `relation` field varies by language:

| Relation    | Used By                    |
|-------------|----------------------------|
| `imports`   | TypeScript, Java, Rust     |
| `uses`      | Java, C#, Go, Rust         |
| `requires`  | Ruby                       |
| `includes`  | C                          |
| `calls`     | C                          |

**Reason**: Each adapter uses relation names that reflect the actual language semantics.

### 3. File Structure ❌

Directory layouts vary dramatically:

- **TypeScript/Rust/Python/C**: Flat `src/` with all files
- **Go**: Package-per-directory (`src/processor/processor.go`)
- **Java**: Deep package structure (`src/com/rosetta/processor/Processor.java`)
- **C#**: Namespace-aligned folders (`src/Processor/Processor.cs`)
- **Ruby**: `lib/` for production, `spec/` for tests

**Reason**: Following idiomatic conventions per language is more valuable than forcing uniformity.

## Proposed Parity Validation Schema

Based on the analysis above, here's a JSON schema for what each Rosetta fixture MUST satisfy:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RosettaParityRequirements",
  "type": "object",
  "properties": {
    "nodeRoles": {
      "type": "array",
      "items": {
        "enum": ["main", "processor", "models", "types", "helpers",
                 "processor_test", "helpers_test", "pipeline_test"]
      },
      "minItems": 8,
      "maxItems": 8,
      "uniqueItems": true,
      "description": "Every fixture must have exactly these 8 node roles"
    },
    "leafNodes": {
      "type": "array",
      "items": { "enum": ["helpers"] },
      "description": "These nodes must have no outgoing production dependencies"
    },
    "foundationNodes": {
      "type": "array",
      "items": { "enum": ["types"] },
      "description": "These nodes must have no outgoing dependencies"
    },
    "requiredEdges": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "from": { "type": "string" },
          "to": { "type": "string" }
        }
      },
      "description": "Edges that MUST exist in normalized form"
    }
  }
}
```

## Implementation Roadmap

### Phase 1: Parity Validator CLI

Create `npm run rosetta:validate` that:
1. Loads all 8 `expected.json` files
2. Normalizes paths to node IDs
3. Asserts node count parity
4. Asserts leaf/foundation node properties
5. Asserts required edge existence
6. Reports differences in a diff-friendly format

### Phase 2: New Language Bootstrap

When adding a new language (e.g., Swift, Kotlin), the validator:
1. Generates a skeleton `expected.json` from the parity schema
2. Validates the new implementation against the skeleton
3. Reports missing/extra nodes and edges

### Phase 3: Self-Similarity Extension

Extend the AST accuracy benchmarks to include:
- Parity checks as part of the benchmark suite
- Cross-language comparison reports
- Regression detection when fixtures drift

## Immediate Next Steps

1. **Fix the `HelpersTest.java` orphan** — it appears in the disconnected nodes list, suggesting
   the Java oracle or adapter isn't correctly linking it to `Helpers.java`

2. **Normalize test node naming** — currently test nodes are classified by file pattern, but
   parity validation needs to map them to canonical `*_test` role IDs

3. **Create the parity validator** — a new script that implements the Phase 1 checks above

## Appendix: Expected.json Comparison

### TypeScript (Reference)
```
main → processor, models
processor → helpers, models, types
models → types
helpers_test → helpers
processor_test → processor, models
pipeline_test → processor, models, types
```

### Go (Most Different Structure)
```
main → processor, models (via package imports)
processor → helpers, models, types (via package imports)
models → types
helpers_test → (implicit same-package)
processor_test → models (cross-package)
pipeline_test → processor, models, types
```

### C (Header Complexity)
```
main → processor.h, models.h, processor.c, models.c
processor.c → helpers.c, helpers.h, processor.h, models.h
processor.h → models.h, types.h
models.c → models.h
models.h → types.h
helpers.c → helpers.h
test_helpers → helpers.h
test_processor → processor.h, models.h, models.c
test_pipeline → processor.h, models.h, types.h, models.c
```

The C fixture has the most edges due to the header/implementation split, but the
**logical dependency structure** still matches the canonical program.
