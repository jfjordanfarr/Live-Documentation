# tests/integration/programs/go/depot/internal/audit/audit.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/depot/internal/audit/audit.go
- Live Doc ID: LD-test-tests-integration-programs-go-depot-internal-audit-audit-go
- Generated At: 2026-09-27T20:36:56.691Z

## Authored
### Purpose
The audit package of the depot sample program: switches logging on in its `init`, so importing it blank is enough.

### Notes
- The target of the blank import in `cmd/depot/main.go`; a blank import depends on the whole package, here this one file.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:36:56.691Z","inputHash":"f9e55a191878a7cb"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
