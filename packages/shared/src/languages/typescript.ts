/**
 * TypeScript/JavaScript Language Syntax Configuration
 *
 * @module languages/typescript
 */

import type { LanguageSyntax, CommentDelimiters, StringDelimiters } from "./syntax";

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
 * Strips comments from TypeScript/JavaScript source code, preserving string literals.
 *
 * Handles:
 * - Line comments (//)
 * - Block comments (slash-star ... star-slash)
 * - JSDoc comments (slash-star-star ... star-slash)
 *
 * String literals (including template literals) are preserved to avoid destroying
 * code in template expressions (e.g., `Value: ${expression}`).
 */
function stripTsComments(content: string): string {
  // Remove block comments /* ... */ (including JSDoc)
  let result = content.replace(/\/\*[\s\S]*?\*\//g, " ");

  // Remove line comments // ...
  result = result.replace(/\/\/[^\n]*/g, " ");

  return result;
}

export const typescriptSyntax: LanguageSyntax = {
  id: "typescript",
  extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"],
  comments: TS_COMMENTS,
  strings: TS_STRINGS,
  frameworkTypes: TS_FRAMEWORK_TYPES,

  async stripComments(content: string): Promise<string> {
    return await Promise.resolve(stripTsComments(content));
  },

  isFrameworkType(identifier: string): boolean {
    return TS_FRAMEWORK_TYPES.has(identifier);
  },
};

