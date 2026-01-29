/**
 * C# Language Syntax Configuration
 *
 * @module languages/csharp
 */

import type { LanguageSyntax, CommentDelimiters, StringDelimiters } from "./syntax";

const CSHARP_COMMENTS: CommentDelimiters = {
  line: ["//", "///"],  // Includes XML doc comments
  block: [["/*", "*/"]],
};

const CSHARP_STRINGS: StringDelimiters = {
  standard: ['"'],
  raw: ['@"', '"""'],  // Verbatim and raw string literals
};

/**
 * Common C# identifiers to ignore when detecting symbol references.
 *
 * Combined from:
 * - packages/shared/src/inference/treeSitter/languages.ts (CSHARP_IGNORED)
 * - Common .NET Framework types
 */
const CSHARP_IGNORED_IDENTIFIERS = new Set([
  // Single letters
  "i", "j", "k", "x", "y", "n", "s", "c", "t", "e", "o", "v", "r", "w",

  // Common variable names
  "value", "result", "item", "index", "count", "length", "type", "name",
  "key", "text", "data", "list", "array", "reader", "writer",

  // .NET Framework types (commonly used but not project-specific)
  "String", "Int32", "Int64", "Boolean", "Object", "Type", "Array",
  "Exception", "List", "Dictionary", "IEnumerable", "IList", "IDictionary",
  "Task", "Action", "Func", "Nullable", "DateTime", "TimeSpan", "Guid",
  "StringBuilder", "StringComparer", "StringComparison", "CultureInfo",
  "Stream", "TextReader", "TextWriter", "IDisposable", "IEquatable",
  "IComparable", "IFormatProvider", "IFormattable", "IConvertible",
  "EventArgs", "EventHandler", "Attribute", "Enum",

  // ASP.NET types
  "HttpContext", "HttpRequest", "HttpResponse", "Controller", "ActionResult",
  "ViewResult", "JsonResult", "IActionResult",
]);

/**
 * Strips comments and string literals from C# source code.
 *
 * Handles:
 * - Single-line comments (//)
 * - XML doc comments (///)
 * - Block comments (/* ... *\/)
 * - Standard strings ("...")
 * - Verbatim strings (@"...")
 */
function stripCSharpCommentsAndStrings(content: string): string {
  // Remove single-line comments (// ...) including XML doc comments (/// ...)
  let result = content.replace(/\/\/.*$/gm, "");

  // Remove multi-line comments (/* ... */)
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");

  // Remove verbatim strings (@"...") - these can span multiple lines
  result = result.replace(/@"(?:[^"]|"")*"/g, '""');

  // Remove standard strings "..." (handling escapes)
  result = result.replace(/"(?:[^"\\]|\\.)*"/g, '""');

  return result;
}

export const csharpSyntax: LanguageSyntax = {
  id: "csharp",
  extensions: [".cs"],
  comments: CSHARP_COMMENTS,
  strings: CSHARP_STRINGS,
  ignoredIdentifiers: CSHARP_IGNORED_IDENTIFIERS,

  async stripCommentsAndStrings(content: string): Promise<string> {
    return await Promise.resolve(stripCSharpCommentsAndStrings(content));
  },

  isIgnoredIdentifier(identifier: string): boolean {
    return CSHARP_IGNORED_IDENTIFIERS.has(identifier);
  },
};

