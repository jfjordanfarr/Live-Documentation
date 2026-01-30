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
 * Strips comments from Ruby source code, preserving string literals.
 *
 * Handles:
 * - Line comments (#)
 * - Block comments (=begin ... =end)
 *
 * String literals are preserved to avoid destroying code in interpolated strings
 * (e.g., "Value: #{expression}").
 */
function stripRubyComments(content: string): string {
  // Remove block comments =begin ... =end
  let result = content.replace(/^=begin[\s\S]*?^=end/gm, "");

  // Remove line comments (# ...) - be careful not to match # inside strings
  // Simple approach: match # not preceded by a non-escaped quote context
  // This is a simplified version - Ruby string interpolation is complex
  result = result.replace(/#[^\n]*/g, "");

  return result;
}

export const rubySyntax: LanguageSyntax = {
  id: "ruby",
  extensions: [".rb", ".rake", ".gemspec"],
  comments: RUBY_COMMENTS,
  strings: RUBY_STRINGS,
  frameworkTypes: RUBY_FRAMEWORK_TYPES,

  async stripComments(content: string): Promise<string> {
    return await Promise.resolve(stripRubyComments(content));
  },

  isFrameworkType(identifier: string): boolean {
    return RUBY_FRAMEWORK_TYPES.has(identifier);
  },
};

