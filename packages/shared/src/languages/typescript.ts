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
 * Strips comments and string literals from TypeScript/JavaScript source code.
 *
 * Handles:
 * - Line comments (//)
 * - Block comments (/* ... *\/)
 * - JSDoc comments (/** ... *\/)
 * - Single-quoted strings ('...')
 * - Double-quoted strings ("...")
 * - Template literals (`...`)
 */
function stripTsCommentsAndStrings(content: string): string {
  // Remove block comments /* ... */ (including JSDoc)
  let result = content.replace(/\/\*[\s\S]*?\*\//g, " ");

  // Remove line comments // ...
  result = result.replace(/\/\/[^\n]*/g, " ");

  // Remove template literals `...` (simplified - doesn't handle ${} nesting)
  result = result.replace(/`(?:[^`\\]|\\.)*`/g, '""');

  // Remove string literals "..." and '...'
  result = result.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  result = result.replace(/'(?:[^'\\]|\\.)*'/g, "''");

  return result;
}

export const typescriptSyntax: LanguageSyntax = {
  id: "typescript",
  extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"],
  comments: TS_COMMENTS,
  strings: TS_STRINGS,
  frameworkTypes: TS_FRAMEWORK_TYPES,

  async stripCommentsAndStrings(content: string): Promise<string> {
    return await Promise.resolve(stripTsCommentsAndStrings(content));
  },

  isFrameworkType(identifier: string): boolean {
    return TS_FRAMEWORK_TYPES.has(identifier);
  },
};

