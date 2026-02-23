# packages/server/src/features/live-docs/system/constants.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/constants.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-constants-ts
- Generated At: 2026-02-23T21:32:13.173Z

## Authored
### Purpose
Constants for the System-layer Live Documentation generator. Defines archetype prefixes, path segments, and thresholds used across all System view materialisation.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring
- `LAYER3_PREFIX` maps archetypes like `component`→`COMP`, `workflow`→`FLOW`
- Threshold constants control clustering (min 4 members), topology (max 80 edges), and activation display limits

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-23T21:32:13.173Z","inputHash":"bdc41abfd07587f2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LAYER3_PREFIX` {#symbol-layer3_prefix}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L25)

##### `LAYER3_PREFIX` — Summary
Short prefix codes for Layer-3 archetypes, used when composing
System-layer output filenames (e.g. `COMP-card-widget.md`).

Note: `"data-model"` is present in the map but excluded from
{@link SUPPORTED_LAYER3_ARCHETYPES} — it was deferred during the
initial System-layer implementation.

#### `SUPPORTED_LAYER3_ARCHETYPES` {#symbol-supported_layer3_archetypes}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L39)
- Returns: [`Layer3Archetype`](./types.ts.mdmd.md#symbol-layer3archetype)[]

##### `SUPPORTED_LAYER3_ARCHETYPES` — Summary
The subset of {@link Layer3Archetype} values that the System-layer generator
is currently able to plan and materialise. `"data-model"` is intentionally
omitted while its plan module is still unimplemented.

#### `SYSTEM_LAYER_NAME` {#symbol-system_layer_name}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L52)

##### `SYSTEM_LAYER_NAME` — Summary
Folder name used for the System-layer output directory.

#### `LIVE_DOCS_SEGMENT` {#symbol-live_docs_segment}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L55)

##### `LIVE_DOCS_SEGMENT` — Summary
URL / folder path segment for Live Documentation artefact paths.

#### `IMPLEMENTATION_ARCHETYPE` {#symbol-implementation_archetype}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L58)

##### `IMPLEMENTATION_ARCHETYPE` — Summary
Default archetype string applied to Live Docs that lack an explicit archetype.

#### `VIRTUAL_NODE_PREFIX` {#symbol-virtual_node_prefix}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L65)

##### `VIRTUAL_NODE_PREFIX` — Summary
Prefix for graph node IDs that represent virtual nodes —
i.e. cluster summaries or namespace groupings that do not correspond
to a single source file.

#### `RUN_ALL_SCRIPT_PATH` {#symbol-run_all_script_path}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L72)

##### `RUN_ALL_SCRIPT_PATH` — Summary
Workspace-relative path to the `run-all.ts` orchestrator script.
Referenced by plan modules to identify the conductor entry point
when it appears in the Live Docs graph.

#### `DEFAULT_CO_ACTIVATION_RELATIVE_PATH` {#symbol-default_co_activation_relative_path}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L84)

##### `DEFAULT_CO_ACTIVATION_RELATIVE_PATH` — Summary
Default workspace-relative path to the co-activation JSON report.
Used by the generator as the last-resort fallback when neither
`args.reportPath` nor the `LIVE_DOCS_CO_ACTIVATION_PATH` env var
is set.

#### `MAX_CLUSTER_COMPONENTS` {#symbol-max_cluster_components}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L91)

##### `MAX_CLUSTER_COMPONENTS` — Summary
Maximum number of component nodes a single cluster is allowed to contain.

#### `MIN_CLUSTER_MEMBER_COUNT` {#symbol-min_cluster_member_count}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L94)

##### `MIN_CLUSTER_MEMBER_COUNT` — Summary
Minimum member count below which a cluster is discarded as noise.

#### `MIN_CLUSTER_TOTAL_WEIGHT` {#symbol-min_cluster_total_weight}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L97)

##### `MIN_CLUSTER_TOTAL_WEIGHT` — Summary
Minimum total edge weight required for a cluster to be retained.

#### `MAX_TOPOLOGY_EDGES` {#symbol-max_topology_edges}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L100)

##### `MAX_TOPOLOGY_EDGES` — Summary
Maximum edges emitted in a topology section to keep rendered docs readable.

#### `MAX_ACTIVATION_TOP_EDGES` {#symbol-max_activation_top_edges}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L103)

##### `MAX_ACTIVATION_TOP_EDGES` — Summary
Maximum co-activation edges surfaced in the activation summary table.

#### `MAX_ACTIVATION_TOP_SOURCES` {#symbol-max_activation_top_sources}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L106)

##### `MAX_ACTIVATION_TOP_SOURCES` — Summary
Maximum top-level source files listed in an activation summary.

#### `MAX_PUBLIC_SYMBOL_ENTRIES` {#symbol-max_public_symbol_entries}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L109)

##### `MAX_PUBLIC_SYMBOL_ENTRIES` — Summary
Maximum number of public-symbol heading entries rendered per Live Doc.

#### `MAX_PUBLIC_SYMBOLS_PER_ENTRY` {#symbol-max_public_symbols_per_entry}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L112)

##### `MAX_PUBLIC_SYMBOLS_PER_ENTRY` — Summary
Maximum overloads / members listed per public-symbol entry.

#### `DEFAULT_LOGGER` {#symbol-default_logger}
- Type: const
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/constants.ts#L122)
- Returns: [`SystemGeneratorLogger`](./generator.ts.mdmd.md#symbol-systemgeneratorlogger)

##### `DEFAULT_LOGGER` — Summary
Console-based logger conforming to {@link SystemGeneratorLogger}.
Used when callers do not supply their own logger instance.
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
