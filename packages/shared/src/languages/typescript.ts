/**
 * TypeScript/JavaScript Language Syntax Configuration
 *
 * Provides comment delimiters, string delimiters (including template
 * literals), and framework type filtering for TypeScript and JavaScript
 * source files.
 *
 * @module languages/typescript
 */

import { createLanguageSyntax } from "./syntax";
import type { CommentDelimiters, StringDelimiters } from "./syntax";

const TS_COMMENTS: CommentDelimiters = {
  line: ["//"],
  block: [["/*", "*/"]],
};

const TS_STRINGS: StringDelimiters = {
  standard: ['"', "'"],
  raw: ["`"],  // Template literals
};

/**
 * Fundamental TypeScript/JavaScript types that appear in virtually every file.
 * Conservative list — only built-in primitives and core globals.
 */
const TS_FRAMEWORK_TYPES = new Set([
  // Primitive type names
  "string", "number", "boolean", "symbol", "bigint",
  "undefined", "null", "void", "never", "unknown", "any", "object",
  // Boxed types
  "String", "Number", "Boolean", "Symbol", "BigInt", "Object",
  // Constants
  "true", "false", "NaN", "Infinity",
]);

/**
 * TypeScript/JavaScript language syntax configuration.
 *
 * Covers `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs` extensions.
 * Comment stripping uses the shared C-style default,
 * which also handles JSDoc blocks.
 */
export const typescriptSyntax = createLanguageSyntax({
  id: "typescript",
  extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"],
  comments: TS_COMMENTS,
  strings: TS_STRINGS,
  frameworkTypes: TS_FRAMEWORK_TYPES,
});

