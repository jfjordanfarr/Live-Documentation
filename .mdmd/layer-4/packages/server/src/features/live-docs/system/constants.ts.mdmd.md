# packages/server/src/features/live-docs/system/constants.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/constants.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-constants-ts
- Generated At: 2026-02-03T21:55:37.831Z

## Authored
### Purpose
Constants for the System-layer Live Documentation generator. Defines archetype prefixes, path segments, and thresholds used across all System view materialisation.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring
- `LAYER3_PREFIX` maps archetypes like `component`→`COMP`, `workflow`→`FLOW`
- Threshold constants control clustering (min 4 members), topology (max 80 edges), and activation display limits

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:37.831Z","inputHash":"314fa5a0c017d93b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LAYER3_PREFIX` {#symbol-layer3_prefix}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L7)

#### `SUPPORTED_LAYER3_ARCHETYPES` {#symbol-supported_layer3_archetypes}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L16)
- Returns: [`Layer3Archetype`](./types.ts.mdmd.md#symbol-layer3archetype)[]

#### `SYSTEM_LAYER_NAME` {#symbol-system_layer_name}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L28)

#### `LIVE_DOCS_SEGMENT` {#symbol-live_docs_segment}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L29)

#### `IMPLEMENTATION_ARCHETYPE` {#symbol-implementation_archetype}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L30)

#### `VIRTUAL_NODE_PREFIX` {#symbol-virtual_node_prefix}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L31)

#### `RUN_ALL_SCRIPT_PATH` {#symbol-run_all_script_path}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L32)

#### `DEFAULT_CO_ACTIVATION_RELATIVE_PATH` {#symbol-default_co_activation_relative_path}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L38)

#### `MAX_CLUSTER_COMPONENTS` {#symbol-max_cluster_components}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L44)

#### `MIN_CLUSTER_MEMBER_COUNT` {#symbol-min_cluster_member_count}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L45)

#### `MIN_CLUSTER_TOTAL_WEIGHT` {#symbol-min_cluster_total_weight}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L46)

#### `MAX_TOPOLOGY_EDGES` {#symbol-max_topology_edges}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L47)

#### `MAX_ACTIVATION_TOP_EDGES` {#symbol-max_activation_top_edges}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L48)

#### `MAX_ACTIVATION_TOP_SOURCES` {#symbol-max_activation_top_sources}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L49)

#### `MAX_PUBLIC_SYMBOL_ENTRIES` {#symbol-max_public_symbol_entries}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L50)

#### `MAX_PUBLIC_SYMBOLS_PER_ENTRY` {#symbol-max_public_symbols_per_entry}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L51)

#### `DEFAULT_LOGGER` {#symbol-default_logger}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L57)
- Returns: [`SystemGeneratorLogger`](./generator.ts.mdmd.md#symbol-systemgeneratorlogger)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.Layer3Archetype`](./types.ts.mdmd.md#symbol-layer3archetype) (type-only)
- [`types.SystemGeneratorLogger`](./types.ts.mdmd.md#symbol-systemgeneratorlogger) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
