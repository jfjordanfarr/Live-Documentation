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
 * Fundamental C# types that appear in virtually every file.
 * Conservative list — only built-in types and core BCL types.
 */
const CSHARP_FRAMEWORK_TYPES = new Set([
  // C# keywords/aliases for BCL types
  "bool", "byte", "sbyte", "char", "decimal", "double", "float",
  "int", "uint", "long", "ulong", "short", "ushort",
  "object", "string", "void", "dynamic", "var",
  // Core BCL types (capitalized versions)
  "Boolean", "Byte", "SByte", "Char", "Decimal", "Double", "Single",
  "Int16", "Int32", "Int64", "UInt16", "UInt32", "UInt64",
  "Object", "String", "Void",
  // Fundamental async/nullable
  "Task", "ValueTask", "Nullable",
  // Constants
  "true", "false", "null",
]);

/**
 * Strips comments from C# source code, preserving string literals.
 *
 * Handles:
 * - Single-line comments (//)
 * - XML doc comments (///)
 * - Block comments (slash-star ... star-slash)
 *
 * String literals are preserved to avoid destroying code in interpolated strings
 * (e.g., $"Value: {expression}").
 */
function stripCSharpComments(content: string): string {
  // Remove single-line comments (// ...) including XML doc comments (/// ...)
  let result = content.replace(/\/\/.*$/gm, "");

  // Remove multi-line comments (/* ... */)
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");

  return result;
}

export const csharpSyntax: LanguageSyntax = {
  id: "csharp",
  extensions: [".cs"],
  comments: CSHARP_COMMENTS,
  strings: CSHARP_STRINGS,
  frameworkTypes: CSHARP_FRAMEWORK_TYPES,

  async stripComments(content: string): Promise<string> {
    return await Promise.resolve(stripCSharpComments(content));
  },

  isFrameworkType(identifier: string): boolean {
    return CSHARP_FRAMEWORK_TYPES.has(identifier);
  },
};

