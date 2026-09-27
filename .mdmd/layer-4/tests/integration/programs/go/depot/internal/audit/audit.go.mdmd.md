# tests/integration/programs/go/depot/internal/audit/audit.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/depot/internal/audit/audit.go
- Generated At: 2026-09-27T23:21:35.666Z

## Authored
### Purpose
The audit package of the depot sample program: switches logging on in its `init`, so importing it blank is enough.

### Notes
- The target of the blank import in `cmd/depot/main.go`; a blank import depends on the whole package, here this one file.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `enabled` {#symbol-enabled}
- Type: variable
- Source: [source](../../../../../../../../../tests/integration/programs/go/depot/internal/audit/audit.go#L6)

#### `init` {#symbol-init}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/go/depot/internal/audit/audit.go#L8)

#### `Log` {#symbol-log}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/go/depot/internal/audit/audit.go#L14)

##### `Log` — Summary
Log writes a line when auditing is on.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
