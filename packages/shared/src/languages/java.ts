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
 * Strips comments and string literals from Java source code.
 *
 * Handles:
 * - Line comments (//)
 * - Block comments (/* ... *\/)
 * - Javadoc comments (/** ... *\/)
 * - Standard strings ("...")
 * - Text blocks ("""...""" - Java 15+)
 */
function stripJavaCommentsAndStrings(content: string): string {
  // Remove text blocks first (Java 15+)
  let result = content.replace(/"""[\s\S]*?"""/g, '""');

  // Remove block comments /* ... */ (including Javadoc)
  result = result.replace(/\/\*[\s\S]*?\*\//g, " ");

  // Remove line comments // ...
  result = result.replace(/\/\/[^\n]*/g, " ");

  // Remove string literals "..."
  result = result.replace(/"(?:[^"\\]|\\.)*"/g, '""');

  return result;
}

export const javaSyntax: LanguageSyntax = {
  id: "java",
  extensions: [".java"],
  comments: JAVA_COMMENTS,
  strings: JAVA_STRINGS,
  frameworkTypes: JAVA_FRAMEWORK_TYPES,

  async stripCommentsAndStrings(content: string): Promise<string> {
    return await Promise.resolve(stripJavaCommentsAndStrings(content));
  },

  isFrameworkType(identifier: string): boolean {
    return JAVA_FRAMEWORK_TYPES.has(identifier);
  },
};

