/**
 * Vitest setup file: registers Node's disk-backed tree-sitter grammar loader (`NODE_GRAMMAR_HOST`) so unit and
 * integration tests that call language adapters or `readTree` directly have runtime and grammar bytes available
 * without `adapters/treeSitter.ts` touching Node's file system itself.
 */
import { registerNodeGrammars } from "@live-documentation/engine/tooling/nodeGrammars";

registerNodeGrammars();
