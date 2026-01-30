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
 * Strips comments and string literals from Rust source code.
 *
 * Handles:
 * - Line comments (// and ///)
 * - Block comments (/* ... *\/)
 * - Doc comments (//! and /*! ... *\/)
 * - Standard strings ("...")
 * - Raw strings (r"..." and r#"..."#)
 */
function stripRustCommentsAndStrings(content: string): string {
  // Remove block comments /* ... */ (including doc comments)
  let result = content.replace(/\/\*[\s\S]*?\*\//g, " ");

  // Remove line comments // ... (including /// and //!)
  result = result.replace(/\/\/[^\n]*/g, " ");

  // Remove raw strings r#"..."# (simplified - single hash level)
  result = result.replace(/r#"[^"]*"#/g, '""');
  result = result.replace(/r"[^"]*"/g, '""');

  // Remove standard strings "..."
  result = result.replace(/"(?:[^"\\]|\\.)*"/g, '""');

  return result;
}

export const rustSyntax: LanguageSyntax = {
  id: "rust",
  extensions: [".rs"],
  comments: RUST_COMMENTS,
  strings: RUST_STRINGS,
  frameworkTypes: RUST_FRAMEWORK_TYPES,

  async stripCommentsAndStrings(content: string): Promise<string> {
    return await Promise.resolve(stripRustCommentsAndStrings(content));
  },

  isFrameworkType(identifier: string): boolean {
    return RUST_FRAMEWORK_TYPES.has(identifier);
  },
};

