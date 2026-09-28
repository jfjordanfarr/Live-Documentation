/**
 * C# Language Syntax Configuration
 *
 * Provides comment delimiters (including XML doc `///`), string delimiters
 * (including verbatim `@"` and raw `"""` literals), and framework type
 * filtering for C# source files.
 *
 * @module languages/csharp
 */

import { createLanguageSyntax } from "./syntax";
import type { CommentDelimiters, StringDelimiters } from "./syntax";

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
 * C# language syntax configuration.
 *
 * Covers `.cs` extensions.  Comment stripping uses the shared C-style
 * default, which also handles `///` XML doc comments.
 */
export const csharpSyntax = createLanguageSyntax({
  id: "csharp",
  extensions: [".cs"],
  comments: CSHARP_COMMENTS,
  strings: CSHARP_STRINGS,
  frameworkTypes: CSHARP_FRAMEWORK_TYPES,
});

