/**
 * Python Language Syntax Configuration
 *
 * @module languages/python
 */

import type { LanguageSyntax, CommentDelimiters, StringDelimiters } from "./syntax";

const PYTHON_COMMENTS: CommentDelimiters = {
  line: ["#"],
  block: [],  // Python uses docstrings, not block comments
};

const PYTHON_STRINGS: StringDelimiters = {
  standard: ['"', "'"],
  raw: ['"""', "'''", 'r"', "r'", 'f"', "f'"],  // Docstrings, raw strings, f-strings
};

/**
 * Common Python identifiers to ignore.
 *
 * Combined from:
 * - packages/shared/src/inference/treeSitter/languages.ts (PYTHON_IGNORED)
 * - packages/shared/src/live-docs/adapters/python.ts (PYTHON_STDLIB_MODULES)
 */
const PYTHON_IGNORED_IDENTIFIERS = new Set([
  // Common local names
  "i", "j", "k", "x", "y", "n", "s", "e", "v", "r", "w", "f",
  "self", "cls", "args", "kwargs",
  "value", "result", "item", "index", "count", "length", "type", "name",
  "key", "data",

  // Built-in types (as identifiers, not module names)
  "str", "int", "float", "bool", "list", "dict", "set", "tuple",
  "None", "True", "False", "object", "type", "super",

  // Built-in functions
  "print", "len", "range", "enumerate", "zip", "map", "filter",
  "open", "input", "isinstance", "issubclass", "hasattr", "getattr", "setattr",
  "abs", "min", "max", "sum", "sorted", "reversed",

  // Exception types
  "Exception", "ValueError", "TypeError", "KeyError", "IndexError",
  "AttributeError", "ImportError", "RuntimeError", "StopIteration",
]);

/**
 * Strips comments and string literals from Python source code.
 *
 * Handles:
 * - Line comments (#)
 * - Triple-quoted strings ('''...''' and """...""")
 * - Single and double quoted strings
 */
function stripPythonCommentsAndStrings(content: string): string {
  // Remove triple-quoted strings first (docstrings)
  let result = content.replace(/'''[\s\S]*?'''/g, '""');
  result = result.replace(/"""[\s\S]*?"""/g, '""');

  // Remove line comments (# ...)
  result = result.replace(/#[^\n]*/g, "");

  // Remove string literals "..." and '...'
  result = result.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  result = result.replace(/'(?:[^'\\]|\\.)*'/g, "''");

  return result;
}

export const pythonSyntax: LanguageSyntax = {
  id: "python",
  extensions: [".py", ".pyw"],
  comments: PYTHON_COMMENTS,
  strings: PYTHON_STRINGS,
  ignoredIdentifiers: PYTHON_IGNORED_IDENTIFIERS,

  async stripCommentsAndStrings(content: string): Promise<string> {
    return await Promise.resolve(stripPythonCommentsAndStrings(content));
  },

  isIgnoredIdentifier(identifier: string): boolean {
    return PYTHON_IGNORED_IDENTIFIERS.has(identifier);
  },
};

