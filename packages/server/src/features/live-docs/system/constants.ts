/**
 * Shared constants for the System-layer generator pipeline.
 *
 * Extracted from the monolithic `generator.ts` (1 847 lines) during the
 * 2025-12-07 modular decomposition (commit `31ab0a1`). Every constant is
 * consumed by at least one plan module or the generator itself.
 *
 * @module
 */

import type { Layer3Archetype, SystemGeneratorLogger } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Archetype Prefixes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Short prefix codes for Layer-3 archetypes, used when composing
 * System-layer output filenames (e.g. `COMP-card-widget.md`).
 *
 * Note: `"data-model"` is present in the map but excluded from
 * {@link SUPPORTED_LAYER3_ARCHETYPES} — it was deferred during the
 * initial System-layer implementation.
 */
export const LAYER3_PREFIX: Record<Layer3Archetype, string> = {
  component: "COMP",
  interaction: "INT",
  "data-model": "DATA",
  workflow: "FLOW",
  integration: "INTG",
  testing: "TEST"
};

/**
 * The subset of {@link Layer3Archetype} values that the System-layer generator
 * is currently able to plan and materialise. `"data-model"` is intentionally
 * omitted while its plan module is still unimplemented.
 */
export const SUPPORTED_LAYER3_ARCHETYPES: Layer3Archetype[] = [
  "component",
  "interaction",
  "workflow",
  "integration",
  "testing"
];

// ─────────────────────────────────────────────────────────────────────────────
// Path Segments
// ─────────────────────────────────────────────────────────────────────────────

/** Folder name used for the System-layer output directory. */
export const SYSTEM_LAYER_NAME = "system";

/** URL / folder path segment for Live Documentation artefact paths. */
export const LIVE_DOCS_SEGMENT = "live-docs";

/** Default archetype string applied to Live Docs that lack an explicit archetype. */
export const IMPLEMENTATION_ARCHETYPE = "implementation";

/**
 * Prefix for graph node IDs that represent virtual nodes —
 * i.e. cluster summaries or namespace groupings that do not correspond
 * to a single source file.
 */
export const VIRTUAL_NODE_PREFIX = "virtual::";

/**
 * Workspace-relative path to the `run-all.ts` orchestrator script.
 * Referenced by plan modules to identify the conductor entry point
 * when it appears in the Live Docs graph.
 */
export const RUN_ALL_SCRIPT_PATH = "scripts/live-docs/run-all.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Co-Activation Defaults
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default workspace-relative path to the co-activation JSON report.
 * Used by the generator as the last-resort fallback when neither
 * `args.reportPath` nor the `LIVE_DOCS_CO_ACTIVATION_PATH` env var
 * is set.
 */
export const DEFAULT_CO_ACTIVATION_RELATIVE_PATH = "data/live-docs/co-activation.json";

// ─────────────────────────────────────────────────────────────────────────────
// Thresholds & Limits
// ─────────────────────────────────────────────────────────────────────────────

/** Maximum number of component nodes a single cluster is allowed to contain. */
export const MAX_CLUSTER_COMPONENTS = 25;

/** Minimum member count below which a cluster is discarded as noise. */
export const MIN_CLUSTER_MEMBER_COUNT = 4;

/** Minimum total edge weight required for a cluster to be retained. */
export const MIN_CLUSTER_TOTAL_WEIGHT = 5;

/** Maximum edges emitted in a topology section to keep rendered docs readable. */
export const MAX_TOPOLOGY_EDGES = 80;

/** Maximum co-activation edges surfaced in the activation summary table. */
export const MAX_ACTIVATION_TOP_EDGES = 12;

/** Maximum top-level source files listed in an activation summary. */
export const MAX_ACTIVATION_TOP_SOURCES = 10;

/** Maximum number of public-symbol heading entries rendered per Live Doc. */
export const MAX_PUBLIC_SYMBOL_ENTRIES = 20;

/** Maximum overloads / members listed per public-symbol entry. */
export const MAX_PUBLIC_SYMBOLS_PER_ENTRY = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Default Logger
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Console-based logger conforming to {@link SystemGeneratorLogger}.
 * Used when callers do not supply their own logger instance.
 */
export const DEFAULT_LOGGER: SystemGeneratorLogger = {
  info: (message) => console.log(`[live-docs-system] ${message}`),
  warn: (message) => console.warn(`[live-docs-system] ${message}`),
  error: (message) => console.error(`[live-docs-system] ${message}`)
};
