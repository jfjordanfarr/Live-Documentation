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
 * Fundamental Go types that appear in virtually every file.
 * These are conservative — only built-in types, not stdlib types.
 */
const GO_FRAMEWORK_TYPES = new Set([
  // Built-in types
  "bool", "byte", "complex64", "complex128",
  "error", "float32", "float64",
  "int", "int8", "int16", "int32", "int64",
  "rune", "string",
  "uint", "uint8", "uint16", "uint32", "uint64", "uintptr",
  // Built-in functions
  "append", "cap", "close", "complex", "copy", "delete",
  "imag", "len", "make", "new", "panic", "print", "println",
  "real", "recover",
  // Constants
  "true", "false", "nil", "iota",
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
  frameworkTypes: GO_FRAMEWORK_TYPES,

  async stripCommentsAndStrings(content: string): Promise<string> {
    // Regex-based implementation is synchronous but exposed as async
    // for tree-sitter compatibility
    return await Promise.resolve(stripGoCommentsAndStrings(content));
  },

  isFrameworkType(identifier: string): boolean {
    return GO_FRAMEWORK_TYPES.has(identifier);
  },
};

