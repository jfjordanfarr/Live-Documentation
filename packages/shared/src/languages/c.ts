/**
 * C/C++ Language Syntax Configuration
 *
 * Provides comment delimiters, string delimiters, and framework type
 * filtering for C and C++ source files.  Uses the default C-style
 * comment stripper from {@link createLanguageSyntax}.
 *
 * @module languages/c
 */

import { createLanguageSyntax } from "./syntax";
import type { CommentDelimiters, StringDelimiters } from "./syntax";

const C_COMMENTS: CommentDelimiters = {
  line: ["//"],
  block: [["/*", "*/"]],
};

const C_STRINGS: StringDelimiters = {
  standard: ['"', "'"],
  raw: [],
};

/**
 * Fundamental C/C++ types that appear in virtually every file.
 * Conservative list — only built-in types and standard library fundamentals.
 */
const C_FRAMEWORK_TYPES = new Set([
  // Built-in types
  "void", "char", "short", "int", "long", "float", "double",
  "signed", "unsigned", "bool", "size_t", "ssize_t",
  "int8_t", "int16_t", "int32_t", "int64_t",
  "uint8_t", "uint16_t", "uint32_t", "uint64_t",
  "ptrdiff_t", "intptr_t", "uintptr_t",
  // Standard library memory functions
  "NULL", "nullptr",
  // Common type qualifiers (not types but commonly filtered)
  "const", "static", "extern", "volatile", "inline",
]);

/**
 * C/C++ language syntax configuration.
 *
 * Covers `.c`, `.h`, `.cpp`, `.hpp`, `.cc`, `.cxx` extensions.
 * Comment stripping uses the shared C-style default.
 */
export const cSyntax = createLanguageSyntax({
  id: "c",
  extensions: [".c", ".h", ".cpp", ".hpp", ".cc", ".cxx"],
  comments: C_COMMENTS,
  strings: C_STRINGS,
  frameworkTypes: C_FRAMEWORK_TYPES,
});

