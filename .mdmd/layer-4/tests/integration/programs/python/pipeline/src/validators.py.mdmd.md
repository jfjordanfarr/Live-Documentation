# tests/integration/programs/python/pipeline/src/validators.py

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/python/pipeline/src/validators.py
- Generated At: 2026-09-27T23:21:37.978Z

## Authored
### Purpose
Defines validation helpers and the custom exception for the Python pipeline benchmark, ensuring the analyzer sees guard patterns.

### Notes
Keep the validators lightweight but explicit; downstream modules rely on these checks to exercise dependency edges.

## Generated
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
