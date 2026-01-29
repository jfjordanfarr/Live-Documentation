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
 * Common Rust identifiers to ignore.
 */
const RUST_IGNORED_IDENTIFIERS = new Set([
  // Common local names
  "i", "j", "k", "x", "y", "n", "s", "e", "v", "r", "w",
  "self", "Self",

  // Common variable names
  "value", "result", "item", "index", "count", "len", "size",
  "key", "data", "buf", "buffer", "err", "error", "ok",
  "input", "output", "reader", "writer",

  // Standard library types
  "String", "Vec", "Box", "Rc", "Arc", "Cell", "RefCell",
  "Option", "Result", "Some", "None", "Ok", "Err",
  "HashMap", "HashSet", "BTreeMap", "BTreeSet",
  "Iterator", "IntoIterator", "FromIterator",
  "Clone", "Copy", "Default", "Debug", "Display",
  "Eq", "PartialEq", "Ord", "PartialOrd", "Hash",
  "From", "Into", "TryFrom", "TryInto",
  "AsRef", "AsMut", "Borrow", "BorrowMut",
  "Drop", "Deref", "DerefMut",
  "Fn", "FnMut", "FnOnce",
  "Send", "Sync", "Sized", "Unpin",
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
  ignoredIdentifiers: RUST_IGNORED_IDENTIFIERS,

  async stripCommentsAndStrings(content: string): Promise<string> {
    return await Promise.resolve(stripRustCommentsAndStrings(content));
  },

  isIgnoredIdentifier(identifier: string): boolean {
    return RUST_IGNORED_IDENTIFIERS.has(identifier);
  },
};

