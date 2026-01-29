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
 * Common TypeScript/JavaScript identifiers to ignore.
 *
 * Combined from:
 * - packages/shared/src/inference/treeSitter/languages.ts (TYPESCRIPT_IGNORED)
 * - Built-in types and DOM globals
 */
const TS_IGNORED_IDENTIFIERS = new Set([
  // Single letters (common loop/temp variables)
  "i", "j", "k", "x", "y", "n", "s", "e", "v", "r", "w",

  // Common variable names
  "value", "result", "item", "index", "count", "length", "type", "name",
  "key", "data", "list", "array", "options", "config", "props", "state",
  "err", "error", "callback", "cb", "fn", "handler",

  // Built-in types
  "String", "Number", "Boolean", "Object", "Array", "Function",
  "Promise", "Map", "Set", "WeakMap", "WeakSet", "Symbol",
  "Error", "TypeError", "ReferenceError", "SyntaxError",
  "Date", "RegExp", "JSON", "Math", "console",
  "undefined", "null", "true", "false", "NaN", "Infinity",

  // DOM types (common in browser code)
  "HTMLElement", "Element", "Node", "Document", "Window", "Event",
  "NodeList", "HTMLCollection", "EventTarget",
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
  ignoredIdentifiers: TS_IGNORED_IDENTIFIERS,

  async stripCommentsAndStrings(content: string): Promise<string> {
    return await Promise.resolve(stripTsCommentsAndStrings(content));
  },

  isIgnoredIdentifier(identifier: string): boolean {
    return TS_IGNORED_IDENTIFIERS.has(identifier);
  },
};

