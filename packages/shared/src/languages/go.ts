/**
 * Go Language Syntax Configuration
 *
 * @module languages/go
 */

import type { LanguageSyntax, CommentDelimiters, StringDelimiters } from "./syntax";

const GO_COMMENTS: CommentDelimiters = {
  line: ["//"],
  block: [["/*", "*/"]],
};

const GO_STRINGS: StringDelimiters = {
  standard: ['"'],
  raw: ["`"],
};

/**
 * Common Go variable/parameter names that should be excluded from symbol matching.
 * These are frequently used as local variables and matching them across files
 * produces false positives.
 *
 * Combined from:
 * - packages/shared/src/inference/heuristics/go.ts (GO_COMMON_VARIABLE_NAMES)
 * - packages/shared/src/inference/treeSitter/languages.ts (GO_IGNORED)
 */
const GO_IGNORED_IDENTIFIERS = new Set([
  // Single letters (common loop/temp variables)
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",

  // Standard error handling
  "err", "error",

  // Common iteration/result variables
  "match", "matches", "result", "results", "value", "values",
  "key", "keys", "data", "item", "items",

  // Index/loop variables
  "idx", "index", "len", "size", "count",

  // HTTP/request related
  "req", "res", "resp", "request", "response",

  // Context
  "ctx", "context",

  // IO related
  "buf", "buffer", "reader", "writer", "in", "out",

  // Boolean flags
  "ok", "found", "done", "valid",

  // String processing
  "str", "text", "name", "path", "url", "uri", "msg",

  // Common Go variable names from tree-sitter config
  "log", "tmp", "old", "new", "got", "want",
  "rv", "wg", "mu", "id", "fn", "tc", "tt", "ts",
  "route", "query",

  // Go stdlib types that cause false positives
  "Handler", "HandlerFunc", "Header", "Request", "Response", "ResponseWriter",
  "Client", "Server", "Transport", "Cookie", "Error",
  "URL", "Values",
  "NewRecorder", "NewRequest", "NewServer",
  "Print", "Printf", "Println", "Sprint", "Sprintf", "Sprintln",
  "Builder", "Reader", "Writer", "Closer", "ReadWriter",
  "Context", "Background", "TODO", "WithCancel", "WithTimeout", "WithValue",
  "New", "Is", "As", "Unwrap",
]);

/**
 * Strips comments and string literals from Go source code.
 *
 * Handles:
 * - Line comments (//)
 * - Block comments (/* ... *\/)
 * - Standard strings ("...")
 * - Raw strings (`...`)
 */
function stripGoCommentsAndStrings(content: string): string {
  let result = "";
  let i = 0;

  while (i < content.length) {
    // Check for line comment
    if (content[i] === "/" && content[i + 1] === "/") {
      // Skip to end of line
      while (i < content.length && content[i] !== "\n") {
        i++;
      }
      continue;
    }

    // Check for block comment
    if (content[i] === "/" && content[i + 1] === "*") {
      i += 2;
      while (i < content.length - 1 && !(content[i] === "*" && content[i + 1] === "/")) {
        i++;
      }
      i += 2; // Skip closing */
      continue;
    }

    // Check for string literal
    if (content[i] === '"') {
      i++; // Skip opening quote
      while (i < content.length && content[i] !== '"') {
        if (content[i] === "\\" && i + 1 < content.length) {
          i += 2; // Skip escaped character
        } else {
          i++;
        }
      }
      i++; // Skip closing quote
      continue;
    }

    // Check for raw string literal (backtick)
    if (content[i] === "`") {
      i++; // Skip opening backtick
      while (i < content.length && content[i] !== "`") {
        i++;
      }
      i++; // Skip closing backtick
      continue;
    }

    result += content[i];
    i++;
  }

  return result;
}

export const goSyntax: LanguageSyntax = {
  id: "go",
  extensions: [".go"],
  comments: GO_COMMENTS,
  strings: GO_STRINGS,
  ignoredIdentifiers: GO_IGNORED_IDENTIFIERS,

  async stripCommentsAndStrings(content: string): Promise<string> {
    // Regex-based implementation is synchronous but exposed as async
    // for tree-sitter compatibility
    return await Promise.resolve(stripGoCommentsAndStrings(content));
  },

  isIgnoredIdentifier(identifier: string): boolean {
    return GO_IGNORED_IDENTIFIERS.has(identifier);
  },
};

