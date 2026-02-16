/**
 * Rust Language Syntax Configuration
 *
 * Provides comment delimiters (including `///` and `//!` doc comments),
 * string delimiters (including raw `r"` / `r#"` literals), and framework
 * type filtering for Rust source files.
 *
 * @module languages/rust
 */

import { createLanguageSyntax } from "./syntax";
import type { CommentDelimiters, StringDelimiters } from "./syntax";

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
 * Rust language syntax configuration.
 *
 * Covers `.rs` extensions.  Comment stripping uses the shared C-style
 * default, which also handles `///` and `//!` doc
 * comments.
 */
export const rustSyntax = createLanguageSyntax({
  id: "rust",
  extensions: [".rs"],
  comments: RUST_COMMENTS,
  strings: RUST_STRINGS,
  frameworkTypes: RUST_FRAMEWORK_TYPES,
});

