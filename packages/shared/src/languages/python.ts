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
 * Fundamental Python types that appear in virtually every file.
 * Conservative list — only built-in type names.
 */
const PYTHON_FRAMEWORK_TYPES = new Set([
  // Built-in types
  "str", "int", "float", "bool", "complex",
  "list", "dict", "set", "frozenset", "tuple",
  "bytes", "bytearray", "memoryview",
  "object", "type",
  // Constants
  "None", "True", "False", "Ellipsis", "NotImplemented",
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
  frameworkTypes: PYTHON_FRAMEWORK_TYPES,

  async stripCommentsAndStrings(content: string): Promise<string> {
    return await Promise.resolve(stripPythonCommentsAndStrings(content));
  },

  isFrameworkType(identifier: string): boolean {
    return PYTHON_FRAMEWORK_TYPES.has(identifier);
  },
};

