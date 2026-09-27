/**
 * Python Language Syntax Configuration
 *
 * Provides comment delimiters, string delimiters (including docstrings,
 * raw strings, and f-strings), framework type filtering, and a
 * string-aware `#` comment stripper for Python source files.
 *
 * @module languages/python
 */

import { createLanguageSyntax } from "./syntax";
import type { CommentDelimiters, StringDelimiters } from "./syntax";

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
 * Strips comments from Python source code, preserving string literals.
 *
 * Handles:
 * - Line comments (#)
 *
 * String literals (including f-strings) are preserved to avoid destroying
 * code in formatted strings (e.g., f"Value: {expression}").
 *
 * Note: Triple-quoted strings used as docstrings are preserved because they
 * are technically string literals and may contain code examples.
 */
function stripPythonComments(content: string): string {
  // Remove line comments (# ...)
  // Be careful not to match # inside strings - use a simple approach
  // that splits by lines and handles each line
  const lines = content.split('\n');
  const result = lines.map(line => {
    // Find # that's not inside a string
    let inString = false;
    let stringChar = '';
    let tripleQuote = false;
    let i = 0;
    
    while (i < line.length) {
      // Check for triple quotes
      if (!inString && (line.slice(i, i + 3) === '"""' || line.slice(i, i + 3) === "'''")) {
        inString = true;
        tripleQuote = true;
        stringChar = line.slice(i, i + 3);
        i += 3;
        continue;
      }
      
      // Check for closing triple quotes
      if (inString && tripleQuote && line.slice(i, i + 3) === stringChar) {
        inString = false;
        tripleQuote = false;
        i += 3;
        continue;
      }
      
      // Check for single/double quotes (not triple)
      if (!inString && (line[i] === '"' || line[i] === "'")) {
        // Make sure it's not a triple quote
        if (line.slice(i, i + 3) !== '"""' && line.slice(i, i + 3) !== "'''") {
          inString = true;
          stringChar = line[i];
          i++;
          continue;
        }
      }
      
      // Check for closing single quote
      if (inString && !tripleQuote && line[i] === stringChar) {
        inString = false;
        i++;
        continue;
      }
      
      // Handle escapes inside strings
      if (inString && line[i] === '\\' && i + 1 < line.length) {
        i += 2;
        continue;
      }
      
      // Check for comment start
      if (!inString && line[i] === '#') {
        return line.slice(0, i);
      }
      
      i++;
    }
    
    return line;
  });
  
  return result.join('\n');
}

/**
 * Python language syntax configuration.
 *
 * Covers `.py` and `.pyw` extensions.  Uses a line-by-line
 * string-aware comment stripper because Python's `#` comment character
 * can appear inside string literals.
 */
export const pythonSyntax = createLanguageSyntax({
  id: "python",
  extensions: [".py", ".pyw"],
  comments: PYTHON_COMMENTS,
  strings: PYTHON_STRINGS,
  frameworkTypes: PYTHON_FRAMEWORK_TYPES,
  stripComments: stripPythonComments,
});

