/**
 * Vitest setup file: registers Node's disk-backed tree-sitter grammar loader (`NODE_GRAMMAR_HOST`) and standalone
 * disk fallback (`NODE_DISK_FALLBACK`) so unit and integration tests that call language adapters, `readTree`, or
 * `readSourceText` directly without a run's `FileHost` work without the pure engine importing Node's disk modules.
 */
import { registerNodeGrammars } from "@live-documentation/engine/tooling/nodeGrammars";
import { registerNodeDiskFallback } from "@live-documentation/engine/tooling/nodeHost";

registerNodeGrammars();
registerNodeDiskFallback();
