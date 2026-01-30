/**
 * C Language Syntax Configuration
 *
 * @module languages/c
 */

import type { LanguageSyntax, CommentDelimiters, StringDelimiters } from "./syntax";

const C_COMMENTS: CommentDelimiters = {
  line: ["//"],
  block: [["/*", "*/"]],
};

const C_STRINGS: StringDelimiters = {
  standard: ['"', "'"],
  raw: [],
};

/**
 * Fundamental C/C++ types that appear in virtually every file.
 * Conservative list — only built-in types and standard library fundamentals.
 */
const C_FRAMEWORK_TYPES = new Set([
  // Built-in types
  "void", "char", "short", "int", "long", "float", "double",
  "signed", "unsigned", "bool", "size_t", "ssize_t",
  "int8_t", "int16_t", "int32_t", "int64_t",
  "uint8_t", "uint16_t", "uint32_t", "uint64_t",
  "ptrdiff_t", "intptr_t", "uintptr_t",
  // Standard library memory functions
  "NULL", "nullptr",
  // Common type qualifiers (not types but commonly filtered)
  "const", "static", "extern", "volatile", "inline",
]);

/**
 * Strips comments and string literals from C/C++ source code.
 *
 * Handles:
 * - Line comments (//)
 * - Block comments (/* ... *\/)
 * - Double-quoted strings ("...")
 * - Single-quoted chars ('...')
 */
function stripCCommentsAndStrings(content: string): string {
  // Remove block comments /* ... */
  let result = content.replace(/\/\*[\s\S]*?\*\//g, " ");

  // Remove line comments // ...
  result = result.replace(/\/\/[^\n]*/g, " ");

  // Remove string literals "..." and '...'
  result = result.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  result = result.replace(/'(?:[^'\\]|\\.)*'/g, "''");

  return result;
}

export const cSyntax: LanguageSyntax = {
  id: "c",
  extensions: [".c", ".h", ".cpp", ".hpp", ".cc", ".cxx"],
  comments: C_COMMENTS,
  strings: C_STRINGS,
  frameworkTypes: C_FRAMEWORK_TYPES,

  async stripCommentsAndStrings(content: string): Promise<string> {
    return await Promise.resolve(stripCCommentsAndStrings(content));
  },

  isFrameworkType(identifier: string): boolean {
    return C_FRAMEWORK_TYPES.has(identifier);
  },
};

