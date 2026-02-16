/**
 * Go Language Syntax Configuration
 *
 * Provides comment delimiters, string delimiters, framework type filtering,
 * and a string-aware comment stripper for Go source files.  Unlike C-style
 * languages, Go's stripper walks character-by-character to avoid stripping
 * comment-like sequences inside string literals.
 *
 * @module languages/go
 */

import { createLanguageSyntax } from "./syntax";
import type { CommentDelimiters, StringDelimiters } from "./syntax";

const GO_COMMENTS: CommentDelimiters = {
  line: ["//"],
  block: [["/*", "*/"]],
};

const GO_STRINGS: StringDelimiters = {
  standard: ['"'],
  raw: ["`"],
};

/**
 * Standard library packages (partial list - major ones).
 * Used to distinguish stdlib imports from local/third-party imports.
 */
export const GO_STDLIB_PACKAGES = new Set([
  "fmt", "os", "io", "bufio", "bytes", "strings", "strconv",
  "errors", "log", "time", "math", "rand", "sort", "sync",
  "context", "net", "http", "json", "xml", "html", "template",
  "regexp", "path", "filepath", "flag", "testing", "reflect",
  "runtime", "unsafe", "syscall", "encoding", "crypto", "hash",
  "compress", "archive", "database", "image", "text", "unicode",
  // Common subpackages
  "net/http", "net/url", "io/ioutil", "io/fs", "path/filepath",
  "encoding/json", "encoding/xml", "encoding/base64", "encoding/hex",
  "crypto/sha256", "crypto/md5", "crypto/tls", "crypto/rand",
  "database/sql", "html/template", "text/template", "log/slog"
]);

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
 * Strips comments from Go source code, preserving string literals.
 *
 * Handles:
 * - Line comments (//)
 * - Block comments (slash-star ... star-slash)
 *
 * String literals are preserved to avoid destroying code in template strings.
 */
function stripGoComments(content: string): string {
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

    // Skip over string literals (preserve them in output)
    if (content[i] === '"') {
      result += content[i];
      i++; // Skip opening quote
      while (i < content.length && content[i] !== '"') {
        if (content[i] === "\\" && i + 1 < content.length) {
          result += content[i];
          result += content[i + 1];
          i += 2; // Skip escaped character
        } else {
          result += content[i];
          i++;
        }
      }
      if (i < content.length) {
        result += content[i]; // closing quote
        i++;
      }
      continue;
    }

    // Skip over raw string literals (preserve them in output)
    if (content[i] === "`") {
      result += content[i];
      i++; // Skip opening backtick
      while (i < content.length && content[i] !== "`") {
        result += content[i];
        i++;
      }
      if (i < content.length) {
        result += content[i]; // closing backtick
        i++;
      }
      continue;
    }

    result += content[i];
    i++;
  }

  return result;
}

/**
 * Go language syntax configuration.
 *
 * Covers `.go` extensions.  Uses a character-by-character comment stripper
 * that preserves string literals (including raw backtick strings) instead
 * of the C-style regex default.
 */
export const goSyntax = createLanguageSyntax({
  id: "go",
  extensions: [".go"],
  comments: GO_COMMENTS,
  strings: GO_STRINGS,
  frameworkTypes: GO_FRAMEWORK_TYPES,
  stripComments: stripGoComments,
});

