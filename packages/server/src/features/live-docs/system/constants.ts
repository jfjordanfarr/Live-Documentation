import type { Layer3Archetype, SystemGeneratorLogger } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Archetype Prefixes
// ─────────────────────────────────────────────────────────────────────────────

export const LAYER3_PREFIX: Record<Layer3Archetype, string> = {
  component: "COMP",
  interaction: "INT",
  "data-model": "DATA",
  workflow: "FLOW",
  integration: "INTG",
  testing: "TEST"
};

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

export const SYSTEM_LAYER_NAME = "system";
export const LIVE_DOCS_SEGMENT = "live-docs";
export const IMPLEMENTATION_ARCHETYPE = "implementation";
export const VIRTUAL_NODE_PREFIX = "virtual::";
export const RUN_ALL_SCRIPT_PATH = "scripts/live-docs/run-all.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Co-Activation Defaults
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_CO_ACTIVATION_RELATIVE_PATH = "data/live-docs/co-activation.json";

// ─────────────────────────────────────────────────────────────────────────────
// Thresholds & Limits
// ─────────────────────────────────────────────────────────────────────────────

export const MAX_CLUSTER_COMPONENTS = 25;
export const MIN_CLUSTER_MEMBER_COUNT = 4;
export const MIN_CLUSTER_TOTAL_WEIGHT = 5;
export const MAX_TOPOLOGY_EDGES = 80;
export const MAX_ACTIVATION_TOP_EDGES = 12;
export const MAX_ACTIVATION_TOP_SOURCES = 10;
export const MAX_PUBLIC_SYMBOL_ENTRIES = 20;
export const MAX_PUBLIC_SYMBOLS_PER_ENTRY = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Default Logger
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_LOGGER: SystemGeneratorLogger = {
  info: (message) => console.log(`[live-docs-system] ${message}`),
  warn: (message) => console.warn(`[live-docs-system] ${message}`),
  error: (message) => console.error(`[live-docs-system] ${message}`)
};
