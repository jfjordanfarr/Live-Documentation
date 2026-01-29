/**
 * Ruby Language Syntax Configuration
 *
 * @module languages/ruby
 */

import type { LanguageSyntax, CommentDelimiters, StringDelimiters } from "./syntax";

const RUBY_COMMENTS: CommentDelimiters = {
  line: ["#"],
  block: [["=begin", "=end"]],
};

const RUBY_STRINGS: StringDelimiters = {
  standard: ['"', "'"],
  raw: ['%q{', '%Q{', '<<~', '<<-'],  // Heredocs and %Q strings
};

/**
 * Common Ruby identifiers to ignore.
 */
const RUBY_IGNORED_IDENTIFIERS = new Set([
  // Common local names
  "i", "j", "k", "x", "y", "n", "s", "e", "v", "r", "w",

  // Common variable names
  "value", "result", "item", "index", "count", "length", "size",
  "key", "data", "name", "type", "options", "args",

  // Built-in classes
  "Object", "Class", "Module", "String", "Integer", "Float", "Array", "Hash",
  "Symbol", "Range", "Regexp", "Proc", "Lambda", "Method",
  "TrueClass", "FalseClass", "NilClass",
  "Enumerable", "Enumerator", "Comparable",
  "Exception", "StandardError", "RuntimeError", "ArgumentError",

  // Common methods that look like references
  "new", "initialize", "to_s", "to_i", "to_a", "to_h",
  "each", "map", "select", "reject", "find", "reduce",
  "puts", "print", "p", "pp", "require", "require_relative",
]);

/**
 * Strips comments and string literals from Ruby source code.
 *
 * Handles:
 * - Line comments (#)
 * - Block comments (=begin ... =end)
 * - Single and double quoted strings
 */
function stripRubyCommentsAndStrings(content: string): string {
  // Remove block comments =begin ... =end
  let result = content.replace(/^=begin[\s\S]*?^=end/gm, "");

  // Remove line comments (# ...)
  result = result.replace(/#[^\n]*/g, "");

  // Remove string literals "..." and '...'
  result = result.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  result = result.replace(/'(?:[^'\\]|\\.)*'/g, "''");

  return result;
}

export const rubySyntax: LanguageSyntax = {
  id: "ruby",
  extensions: [".rb", ".rake", ".gemspec"],
  comments: RUBY_COMMENTS,
  strings: RUBY_STRINGS,
  ignoredIdentifiers: RUBY_IGNORED_IDENTIFIERS,

  async stripCommentsAndStrings(content: string): Promise<string> {
    return await Promise.resolve(stripRubyCommentsAndStrings(content));
  },

  isIgnoredIdentifier(identifier: string): boolean {
    return RUBY_IGNORED_IDENTIFIERS.has(identifier);
  },
};

