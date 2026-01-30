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
 * Fundamental Ruby types that appear in virtually every file.
 * Conservative list — only built-in classes for primitives.
 */
const RUBY_FRAMEWORK_TYPES = new Set([
  // Core classes for primitive-like values
  "String", "Integer", "Float", "Numeric",
  "Array", "Hash", "Symbol", "Range",
  "TrueClass", "FalseClass", "NilClass",
  "Object", "BasicObject",
  // Constants
  "true", "false", "nil",
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
  frameworkTypes: RUBY_FRAMEWORK_TYPES,

  async stripCommentsAndStrings(content: string): Promise<string> {
    return await Promise.resolve(stripRubyCommentsAndStrings(content));
  },

  isFrameworkType(identifier: string): boolean {
    return RUBY_FRAMEWORK_TYPES.has(identifier);
  },
};

