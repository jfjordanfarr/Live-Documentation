/**
 * Java Language Syntax Configuration
 *
 * @module languages/java
 */

import type { LanguageSyntax, CommentDelimiters, StringDelimiters } from "./syntax";

const JAVA_COMMENTS: CommentDelimiters = {
  line: ["//"],
  block: [["/*", "*/"], ["/**", "*/"]],  // Includes Javadoc
};

const JAVA_STRINGS: StringDelimiters = {
  standard: ['"'],
  raw: ['"""'],  // Text blocks (Java 15+)
};

/**
 * Fundamental Java types that appear in virtually every file.
 * Conservative list — only primitives and their boxed types.
 */
const JAVA_FRAMEWORK_TYPES = new Set([
  // Primitive types
  "boolean", "byte", "char", "short", "int", "long", "float", "double",
  "void",
  // Boxed types
  "Boolean", "Byte", "Character", "Short", "Integer", "Long", "Float", "Double",
  "Void", "Number",
  // Fundamental reference type
  "String", "Object",
  // Constants
  "true", "false", "null",
]);

/**
 * Strips comments from Java source code, preserving string literals.
 *
 * Handles:
 * - Line comments (//)
 * - Block comments (slash-star ... star-slash)
 * - Javadoc comments (slash-star-star ... star-slash)
 *
 * String literals (including text blocks) are preserved. Java doesn't have
 * interpolated strings, but preserving strings is harmless and maintains consistency.
 */
function stripJavaComments(content: string): string {
  // Remove block comments /* ... */ (including Javadoc)
  let result = content.replace(/\/\*[\s\S]*?\*\//g, " ");

  // Remove line comments // ...
  result = result.replace(/\/\/[^\n]*/g, " ");

  return result;
}

export const javaSyntax: LanguageSyntax = {
  id: "java",
  extensions: [".java"],
  comments: JAVA_COMMENTS,
  strings: JAVA_STRINGS,
  frameworkTypes: JAVA_FRAMEWORK_TYPES,

  async stripComments(content: string): Promise<string> {
    return await Promise.resolve(stripJavaComments(content));
  },

  isFrameworkType(identifier: string): boolean {
    return JAVA_FRAMEWORK_TYPES.has(identifier);
  },
};

