# tests/integration/programs/python/pipeline/src/validators.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/pipeline/src/validators.py
- Live Doc ID: LD-test-tests-integration-programs-python-pipeline-src-validators-py
- Generated At: 2026-09-27T20:03:33.845Z

## Authored
### Purpose
Defines validation helpers and the custom exception for the Python pipeline benchmark, ensuring the analyzer sees guard patterns.

### Notes
Keep the validators lightweight but explicit; downstream modules rely on these checks to exercise dependency edges.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:03:33.845Z","inputHash":"ebb8360edf6e992c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ValidationError` {#symbol-validationerror}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/python/pipeline/src/validators.py#L1)
- Extends: `Exception`

##### `ValidationError` — Summary
Raised when validation of a data series fails.

#### `ensure_not_empty` {#symbol-ensure_not_empty}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/python/pipeline/src/validators.py#L5)

#### `ensure_positive` {#symbol-ensure_positive}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/python/pipeline/src/validators.py#L10)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
