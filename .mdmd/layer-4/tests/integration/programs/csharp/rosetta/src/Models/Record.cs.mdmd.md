# tests/integration/programs/csharp/rosetta/src/Models/Record.cs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/csharp/rosetta/src/Models/Record.cs
- Generated At: 2026-09-28T02:39:09.896Z

## Authored
### Purpose
C# Rosetta Stone fixture source file. Part of the cross-language benchmark suite.

### Notes
See [2026-01-14.1.md](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Tests C# namespace using and type reference detection.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Record (class)` {#symbol-record-class}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/rosetta/src/Models/Record.cs#L8)
- Extends: [`Entry`](../Types/Entry.cs.mdmd.md#symbol-entry-class)

##### `Record (class)` — Summary
A data record to be processed.

#### `Value` {#symbol-value}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/rosetta/src/Models/Record.cs#L10)

#### `Tags` {#symbol-tags}
- Type: property
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/rosetta/src/Models/Record.cs#L11)

#### `Record (constructor)` {#symbol-record-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/rosetta/src/Models/Record.cs#L13)

#### `Create` {#symbol-create}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/rosetta/src/Models/Record.cs#L23)
- Returns: [`Record`](#symbol-record-class)

##### `Create` — Summary
Factory method for creating records with sensible defaults.

#### `ValidateConfig` {#symbol-validateconfig}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/rosetta/src/Models/Record.cs#L30)
- Parameters: `config`: [`ProcessorConfig`](../Types/ProcessorConfig.cs.mdmd.md#symbol-processorconfig)

##### `ValidateConfig` — Summary
Validates configuration is within acceptable bounds.
Delegates to ModelFactory.ValidateConfig for actual validation.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`ModelFactory`](./ModelFactory.cs.mdmd.md#symbol-modelfactory)
- [`Entry`](../Types/Entry.cs.mdmd.md#symbol-entry-class)
- [`ProcessorConfig`](../Types/ProcessorConfig.cs.mdmd.md#symbol-processorconfig)
- [`Status`](../Types/Status.cs.mdmd.md#symbol-status)
<!-- LIVE-DOC:END Dependencies -->
