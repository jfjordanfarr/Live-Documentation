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
 * Common C identifiers to ignore when detecting symbol references.
 *
 * Includes:
 * - Standard library functions
 * - Common variable names
 * - Built-in types
 */
const C_IGNORED_IDENTIFIERS = new Set([
  // Single letters
  "i", "j", "k", "x", "y", "n", "c", "s", "p",

  // Common variable names
  "buf", "buffer", "ptr", "len", "size", "count", "index", "offset",
  "result", "ret", "rc", "status", "err", "error",
  "data", "value", "key", "name", "path", "str", "tmp",

  // Common pointer/loop variables
  "next", "prev", "curr", "current", "node", "head", "tail",

  // File/IO related
  "fd", "fp", "file", "stream", "input", "output",

  // Function parameter patterns
  "argc", "argv", "arg", "args",

  // Standard library functions (commonly referenced but not project symbols)
  "malloc", "calloc", "realloc", "free",
  "printf", "fprintf", "sprintf", "snprintf",
  "scanf", "fscanf", "sscanf",
  "memcpy", "memset", "memmove", "memcmp",
  "strcpy", "strncpy", "strcat", "strncat", "strcmp", "strncmp", "strlen",
  "fopen", "fclose", "fread", "fwrite", "fgets", "fputs",
  "exit", "abort", "assert",
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
  ignoredIdentifiers: C_IGNORED_IDENTIFIERS,

  async stripCommentsAndStrings(content: string): Promise<string> {
    return await Promise.resolve(stripCCommentsAndStrings(content));
  },

  isIgnoredIdentifier(identifier: string): boolean {
    return C_IGNORED_IDENTIFIERS.has(identifier);
  },
};

