/**
 * Java Language Syntax Configuration
 *
 * Provides comment delimiters (including Javadoc), string
 * delimiters (including text blocks), and framework type filtering
 * for Java source files.
 *
 * @module languages/java
 */

import { createLanguageSyntax } from "./syntax";
import type { CommentDelimiters, StringDelimiters } from "./syntax";

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
 * Java language syntax configuration.
 *
 * Covers `.java` extensions.  Comment stripping uses the shared C-style
 * default, which also handles Javadoc blocks.
 */
export const javaSyntax = createLanguageSyntax({
  id: "java",
  extensions: [".java"],
  comments: JAVA_COMMENTS,
  strings: JAVA_STRINGS,
  frameworkTypes: JAVA_FRAMEWORK_TYPES,
});

