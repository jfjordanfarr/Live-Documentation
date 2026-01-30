/**
 * Rust Language Syntax Configuration
 *
 * @module languages/rust
 */

import type { LanguageSyntax, CommentDelimiters, StringDelimiters } from "./syntax";

const RUST_COMMENTS: CommentDelimiters = {
  line: ["//", "///", "//!"],  // Includes doc comments
  block: [["/*", "*/"], ["/**", "*/"], ["/*!", "*/"]],
};

const RUST_STRINGS: StringDelimiters = {
  standard: ['"'],
  raw: ['r"', 'r#"'],  // Raw strings with varying hash counts
};

/**
 * Fundamental Rust types that appear in virtually every file.
 * Conservative list — only primitive types and core prelude.
 */
const RUST_FRAMEWORK_TYPES = new Set([
  // Primitive types
  "bool", "char",
  "i8", "i16", "i32", "i64", "i128", "isize",
  "u8", "u16", "u32", "u64", "u128", "usize",
  "f32", "f64",
  "str",
  // Core prelude fundamentals
  "String", "Vec", "Box",
  "Option", "Result", "Some", "None", "Ok", "Err",
  // Constants
  "true", "false",
  // Self references
  "self", "Self",
]);

/**
 * Strips comments from Rust source code, preserving string literals.
 *
 * Handles:
 * - Line comments (// and ///)
 * - Block comments (slash-star ... star-slash)
 * - Doc comments (//! and inner doc comments)
 *
 * String literals (including raw strings) are preserved. Rust doesn't have
 * interpolated strings like other languages, but preserving strings is harmless.
 */
function stripRustComments(content: string): string {
  // Remove block comments /* ... */ (including doc comments)
  let result = content.replace(/\/\*[\s\S]*?\*\//g, " ");

  // Remove line comments // ... (including /// and //!)
  result = result.replace(/\/\/[^\n]*/g, " ");

  return result;
}

export const rustSyntax: LanguageSyntax = {
  id: "rust",
  extensions: [".rs"],
  comments: RUST_COMMENTS,
  strings: RUST_STRINGS,
  frameworkTypes: RUST_FRAMEWORK_TYPES,

  async stripComments(content: string): Promise<string> {
    return await Promise.resolve(stripRustComments(content));
  },

  isFrameworkType(identifier: string): boolean {
    return RUST_FRAMEWORK_TYPES.has(identifier);
  },
};

